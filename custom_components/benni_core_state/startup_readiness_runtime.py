"""Home-Assistant runtime wrapper for the process-wide readiness state."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import HomeAssistant, callback

try:
    from homeassistant.helpers.start import async_at_started
except ImportError:  # pragma: no cover - compatibility with older HA cores
    async_at_started = None  # type: ignore[assignment]

from .const import (
    DATA_STARTUP_READINESS,
    DOMAIN,
    STARTUP_READINESS_CONTRACT_VERSION,
)
from .mapping import MAPPING_CONTRACT_VERSION, mapping_for
from .startup_readiness import StartupReadinessState


RuntimeListener = Callable[[], None]


def _is_homeassistant_started(hass: HomeAssistant) -> bool:
    """Check the terminal startup state without relying on ``is_running``.

    ``HomeAssistant.is_running`` is also true during the ``starting`` phase;
    using it for a late-load shortcut would be an off-by-one lifecycle race.
    """

    state = getattr(hass, "state", None)
    value = getattr(state, "value", state)
    return value in ("RUNNING", "running")


class StartupReadinessRuntime:
    """Retain one startup timer for the lifetime of one HA process."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.state = StartupReadinessState()
        self._lifecycle_unsub: Callable[[], None] | None = None
        self._timer_handle = None
        self._listeners: set[RuntimeListener] = set()

    def ensure_lifecycle_tracking(self) -> None:
        """Register the STARTED hook once, or account for a late load."""

        if self._lifecycle_unsub is not None:
            return

        if _is_homeassistant_started(self.hass):
            self.state.mark_late_load(
                now_monotonic=self.hass.loop.time(),
                now=self._now(),
            )
            self._notify()
            # There is no event subscription to cancel in this path; the
            # sentinel prevents a second late-load initialization on reload.
            self._lifecycle_unsub = lambda: None
            return

        if async_at_started is not None:
            self._lifecycle_unsub = async_at_started(self.hass, self._on_started)
        else:  # pragma: no cover - exercised only on older HA cores
            self._lifecycle_unsub = self.hass.bus.async_listen_once(
                EVENT_HOMEASSISTANT_STARTED, self._on_started
            )

    @callback
    def _on_started(self, _source: Any) -> None:
        """Handle the first HA-start signal; duplicates are idempotent."""

        if not self.state.mark_started(
            now_monotonic=self.hass.loop.time(),
            now=self._now(),
        ):
            return

        self._schedule_ready()
        self._notify()

    @callback
    def _schedule_ready(self) -> None:
        if self._timer_handle is not None:
            self._timer_handle.cancel()
        self._timer_handle = self.hass.loop.call_later(
            self.state.startup_delay, self._complete_ready
        )

    @callback
    def _complete_ready(self) -> None:
        self._timer_handle = None
        now_monotonic = self.hass.loop.time()
        if self.state.evaluate(now_monotonic=now_monotonic, now=self._now()):
            self._notify()
            return

        # A loop wake-up can be marginally early; never turn on before the
        # exact 90-second boundary.
        if self.state.started_at_monotonic is not None:
            remaining = max(
                0.0,
                self.state.startup_delay
                - (now_monotonic - self.state.started_at_monotonic),
            )
            self._timer_handle = self.hass.loop.call_later(
                remaining, self._complete_ready
            )

    def _now(self):
        from homeassistant.util import dt as dt_util

        return dt_util.utcnow()

    def snapshot(self):
        return self.state.snapshot(now_monotonic=self.hass.loop.time())

    def attributes(self) -> dict[str, Any]:
        """Return lifecycle plus versioned mapping diagnostics."""

        snapshot = self.snapshot()
        mapping = mapping_for("apply_ready")
        attrs = snapshot.as_attributes()
        attrs.update(
            {
                "mapping_contract_version": MAPPING_CONTRACT_VERSION,
                "startup_readiness_contract_version": STARTUP_READINESS_CONTRACT_VERSION,
                "mapping_key": "apply_ready",
                "owner": mapping.owner if mapping else "benni-core-state",
                "source": list(mapping.current_source) if mapping else [
                    "runtime:startup_readiness"
                ],
                "status": mapping.status if mapping else "unknown",
                "mapping_reason": mapping.reason if mapping else "mapping_missing",
                "legacy_resolution": (
                    mapping.legacy_resolution if mapping else "unknown"
                ),
            }
        )
        return attrs

    def add_listener(self, listener: RuntimeListener) -> Callable[[], None]:
        self._listeners.add(listener)

        def remove() -> None:
            self._listeners.discard(listener)

        return remove

    @callback
    def _notify(self) -> None:
        for listener in tuple(self._listeners):
            listener()


def async_ensure_startup_readiness(hass: HomeAssistant) -> StartupReadinessRuntime:
    """Return the process-wide runtime, retaining it across entry reloads."""

    data = hass.data.setdefault(DOMAIN, {})
    runtime = data.get(DATA_STARTUP_READINESS)
    if not isinstance(runtime, StartupReadinessRuntime):
        runtime = StartupReadinessRuntime(hass)
        data[DATA_STARTUP_READINESS] = runtime
    runtime.ensure_lifecycle_tracking()
    return runtime


def startup_readiness_from_hass(
    hass: HomeAssistant,
) -> StartupReadinessRuntime | None:
    """Resolve the already-created runtime without initializing a second one."""

    runtime = hass.data.get(DOMAIN, {}).get(DATA_STARTUP_READINESS)
    return runtime if isinstance(runtime, StartupReadinessRuntime) else None

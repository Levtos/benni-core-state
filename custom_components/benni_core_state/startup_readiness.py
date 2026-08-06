"""Pure process-lifecycle state machine for the Core-State readiness gate.

The state machine intentionally knows nothing about YAML source health,
``apply_enabled`` or any policy decision.  It represents only the elapsed
Home-Assistant process lifetime and is therefore safe to reuse across a Core
State config-entry reload.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any

from .const import DEFAULT_STARTUP_DELAY_SECONDS


STARTUP_PHASE_WAITING = "waiting_for_homeassistant_started"
STARTUP_PHASE_DELAY = "startup_delay"
STARTUP_PHASE_READY = "ready"

REASON_WAITING_FOR_START = "waiting_for_homeassistant_started"
REASON_DELAY_ACTIVE = "startup_delay_active"
REASON_DELAY_ELAPSED = "startup_delay_elapsed"
REASON_LATE_LOAD = "homeassistant_already_started_before_core_state_load"


def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value is not None else None


@dataclass(frozen=True)
class StartupReadinessSnapshot:
    """Read-only view of the lifecycle gate at one monotonic timestamp."""

    state: str
    startup_phase: str
    reason: str
    startup_delay: int
    startup_started_at: datetime | None
    ready_at: datetime | None
    startup_elapsed_s: int | None
    transition_count: int

    @property
    def is_on(self) -> bool:
        return self.state == "on"

    def as_attributes(self) -> dict[str, Any]:
        """Return HA-safe diagnostic attributes without policy fields."""

        return {
            "ready_at": _iso(self.ready_at),
            "startup_started_at": _iso(self.startup_started_at),
            "startup_delay": self.startup_delay,
            "startup_phase": self.startup_phase,
            "startup_elapsed_s": self.startup_elapsed_s,
            "reason": self.reason,
            "transition_count": self.transition_count,
        }


@dataclass
class StartupReadinessState:
    """Idempotent startup gate state retained for one HA process."""

    startup_delay: int = DEFAULT_STARTUP_DELAY_SECONDS
    started_at_monotonic: float | None = None
    startup_started_at: datetime | None = None
    ready_at_monotonic: float | None = None
    ready_at: datetime | None = None
    startup_phase: str = STARTUP_PHASE_WAITING
    reason: str = REASON_WAITING_FOR_START
    transition_count: int = 0

    def mark_started(
        self, *, now_monotonic: float, now: datetime
    ) -> bool:
        """Record the first HA-start event; duplicate events are ignored."""

        if self.started_at_monotonic is not None:
            return False

        self.started_at_monotonic = now_monotonic
        self.startup_started_at = now
        self.startup_phase = STARTUP_PHASE_DELAY
        self.reason = REASON_DELAY_ACTIVE
        return True

    def mark_late_load(self, *, now_monotonic: float, now: datetime) -> bool:
        """Make a post-start integration load immediately ready.

        Home Assistant does not expose the process start timestamp to an
        integration that is loaded after ``EVENT_HOMEASSISTANT_STARTED``.  In
        that case waiting another 90 seconds would be incorrect; the elapsed
        lifetime is conservatively treated as already greater than the gate.
        The missing wall-clock start is explicit in the diagnostics.
        """

        if self.started_at_monotonic is not None:
            return False

        self.started_at_monotonic = now_monotonic - self.startup_delay
        self.ready_at_monotonic = now_monotonic
        self.ready_at = now
        self.startup_phase = STARTUP_PHASE_READY
        self.reason = REASON_LATE_LOAD
        self.transition_count = 1
        return True

    def evaluate(self, *, now_monotonic: float, now: datetime) -> bool:
        """Advance the timer once it has reached its exact boundary."""

        if self.started_at_monotonic is None or self.ready_at_monotonic is not None:
            return False

        elapsed = now_monotonic - self.started_at_monotonic
        if elapsed < self.startup_delay:
            self.startup_phase = STARTUP_PHASE_DELAY
            self.reason = REASON_DELAY_ACTIVE
            return False

        self.ready_at_monotonic = now_monotonic
        self.ready_at = now
        self.startup_phase = STARTUP_PHASE_READY
        self.reason = REASON_DELAY_ELAPSED
        self.transition_count = 1
        return True

    def snapshot(self, *, now_monotonic: float) -> StartupReadinessSnapshot:
        """Return the current state without mutating the timer."""

        elapsed: int | None = None
        if self.started_at_monotonic is not None:
            elapsed = max(0, int(now_monotonic - self.started_at_monotonic))

        return StartupReadinessSnapshot(
            state="on" if self.ready_at_monotonic is not None else "off",
            startup_phase=self.startup_phase,
            reason=self.reason,
            startup_delay=self.startup_delay,
            startup_started_at=self.startup_started_at,
            ready_at=self.ready_at,
            startup_elapsed_s=elapsed,
            transition_count=self.transition_count,
        )

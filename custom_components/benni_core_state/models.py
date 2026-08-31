"""Pure dataclasses shared by coordinator and tests.

Kept free of Home Assistant imports so tests can import them without
spinning up a full HA test harness. Konservativer Lift aus dem Toolbox-Modul
``benni_context`` — Felder unverändert.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any

from .const import BIO_AWAKE, BIO_SLEEP, BIO_WAKING


@dataclass
class PersistentState:
    """State that must survive a Home Assistant restart."""

    bio_state: str = BIO_SLEEP
    last_sleep_start: str | None = None
    last_awake_start: str | None = None
    last_provisional_sleep_start: str | None = None
    last_waking_start: str | None = None
    # Issue #59: one explicit lifecycle reference per PS/S episode plus
    # provenance for the most recent confirmed/inferred sleep transition.
    sleep_reference_start: str | None = None
    sleep_source: str | None = None
    sleep_confirmed: bool | None = None
    inferred_tv_off_at: str | None = None
    # Restart-safe edge bookkeeping.  Active levels are never converted into
    # fresh wake evidence merely because Home Assistant restarted.
    observed_signal_states: dict[str, bool] = field(default_factory=dict)
    indicator_active_since: dict[str, str | None] = field(default_factory=dict)
    opening_states: dict[str, str] = field(default_factory=dict)
    minimum_sleep_minutes: int | None = None
    provisional_lead_minutes: int | None = None
    transition_state: str = "none"
    transition_started: str | None = None
    effective_presence: str = "stale"
    # Last decided presence_personal (incl. bei_eltern), retained across a
    # restart so a boot-time signal gap does not fabricate a false abwesend.
    last_presence_personal: str | None = None
    effective_candidate: str | None = None
    effective_candidate_started: str | None = None
    last_effective_home_at: str | None = None
    last_effective_away_at: str | None = None
    last_proximity_distance: float | None = None
    last_proximity_distance_at: str | None = None
    preheat_active: bool = False
    preheat_source: str | None = None
    preheat_started: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, raw: dict[str, Any] | None) -> "PersistentState":
        if not raw:
            return cls()
        kwargs = {k: raw.get(k) for k in cls.__dataclass_fields__ if k in raw}
        return cls(**kwargs)  # type: ignore[arg-type]


def apply_manual_bio_command(
    state: PersistentState,
    *,
    target: str,
    now_iso: str,
) -> None:
    """Mutate the restart-safe state for one explicit Bio command."""

    state.bio_state = target
    if target == BIO_SLEEP:
        state.last_sleep_start = now_iso
        state.sleep_reference_start = now_iso
        state.sleep_source = "manual"
        state.sleep_confirmed = True
        state.inferred_tv_off_at = None
    elif target == BIO_WAKING:
        state.last_waking_start = now_iso
    elif target == BIO_AWAKE:
        state.last_awake_start = now_iso


@dataclass
class ComputedState:
    """The full output of one coordinator computation."""

    presence_personal: str
    presence_household: str
    presence_band: str
    presence_transition: str
    presence_effective: str
    presence_effective_transition: str
    preheat_active: bool
    preheat_source: str | None
    preheat_started: str | None
    bio_state: str
    last_sleep_start: str | None
    last_awake_start: str | None
    day_state: str
    day_context: str
    activity_state: str
    master_context: str
    # Read-only #26 Wake-Planning-Shadow outputs.  They are separate from the
    # existing Bio inputs so the shadow cannot influence Bio or any consumer.
    wake_state: str
    next_wake: Any | None
    wake_needed: bool | None
    holiday_active: bool
    attrs: dict[str, dict[str, Any]] = field(default_factory=dict)
    # Presence-Effective Activity-Hold (PR3). presence_effective/-_transition
    # oben tragen bereits den (ggf. gehaltenen) Wert; diese Felder machen den
    # Hold für Away-Gate + Attribute sichtbar. presence_personal bleibt roh.
    effective_reason: str = "raw_home"
    effective_assumed: bool = False
    effective_hold_strength: str = "none"
    effective_source_activity: str | None = None
    effective_hold_active: bool = False
    # Live-Status UX-Sensor (Anzeige-only, keine Policy). Kurzer deutscher Text;
    # Details liegen in attrs["live_status"].
    live_status: str = ""

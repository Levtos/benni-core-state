"""Pure dataclasses shared by coordinator and tests.

Kept free of Home Assistant imports so tests can import them without
spinning up a full HA test harness. Konservativer Lift aus dem Toolbox-Modul
``benni_context`` — Felder unverändert.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any

from .const import BIO_SLEEP


@dataclass
class PersistentState:
    """State that must survive a Home Assistant restart."""

    bio_state: str = BIO_SLEEP
    last_sleep_start: str | None = None
    last_awake_start: str | None = None
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
    attrs: dict[str, dict[str, Any]] = field(default_factory=dict)
    # Presence-Effective Activity-Hold (PR3). presence_effective/-_transition
    # oben tragen bereits den (ggf. gehaltenen) Wert; diese Felder machen den
    # Hold für Away-Gate + Attribute sichtbar. presence_personal bleibt roh.
    effective_reason: str = "raw_home"
    effective_assumed: bool = False
    effective_hold_strength: str = "none"
    effective_source_activity: str | None = None
    effective_hold_active: bool = False

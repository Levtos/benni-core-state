"""Bio-state rules — sleep / waking / awake transitions.

Diese Tests sichern den **Ist-Stand** der extrahierten Toolbox-Logik ab
(inkl. day-state-Gating der Wake-Indizien), NICHT ein zukünftiges Zielbild.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from custom_components.benni_core_state import logic
from custom_components.benni_core_state.const import (
    BIO_AWAKE,
    BIO_SLEEP,
    BIO_WAKING,
    DAY_AFTERNOON,
    DAY_EARLY_NIGHT,
    PERS_AWAY,
    PERS_HOME,
)

NOW = datetime(2026, 5, 18, 6, 30, tzinfo=timezone.utc)

NO_IND = {"pc": False, "ps5": False, "coffee": False, "door": False, "homeoffice": False}


def _bio(prev, **over):
    args = dict(
        prev_state=prev,
        wake_needed=False,
        indicators=dict(NO_IND),
        presence_personal=PERS_HOME,
        day_state=DAY_AFTERNOON,  # a wake-allowed (non-night) phase
        now=NOW,
        prev_sleep_start=None,
        prev_awake_start=None,
    )
    args.update(over)
    return logic.compute_bio_state(**args)


def test_wake_needed_moves_sleep_to_waking_not_awake():
    """Wake Planner may nudge waking, but never confirms awake on its own."""
    state, _, _ = _bio(BIO_SLEEP, wake_needed=True)
    assert state == BIO_WAKING


def test_wake_needed_does_not_promote_waking_to_awake():
    state, _, _ = _bio(BIO_WAKING, wake_needed=True)
    assert state == BIO_WAKING


def test_strong_indicator_promotes_waking_to_awake_with_timestamp():
    state, _, awake_ts = _bio(BIO_WAKING, indicators={**NO_IND, "coffee": True})
    assert state == BIO_AWAKE
    assert awake_ts == NOW


def test_pc_from_sleep_promotes_to_awake_in_allowed_phase():
    """IST-Stand: ein erlaubtes Wake-Indiz (PC) hebt aus sleep direkt auf awake.

    (Abweichend von der alten Standalone-Logik, die hier nur 'waking' lieferte.)
    """
    state, _, awake_ts = _bio(
        BIO_SLEEP,
        indicators={**NO_IND, "pc": True},
        prev_sleep_start=NOW - timedelta(hours=5),
    )
    assert state == BIO_AWAKE
    assert awake_ts == NOW


def test_fresh_manual_sleep_ignores_existing_wake_indicators():
    """mark_sleep must not be undone by stale level-based PC/coffee signals."""
    state, _, _ = _bio(
        BIO_SLEEP,
        indicators={**NO_IND, "pc": True, "coffee": True},
        prev_sleep_start=NOW,
    )
    assert state == BIO_SLEEP


def test_wake_indicators_suppressed_at_night():
    """Nachts (early_night/late_night) zählen PC/PS5/Kaffee/Tür nicht als Wake."""
    state, _, _ = _bio(
        BIO_SLEEP, indicators={**NO_IND, "coffee": True}, day_state=DAY_EARLY_NIGHT
    )
    assert state == BIO_SLEEP


def test_wake_needed_still_works_at_night():
    """wake_needed ist nicht day-state-gegated und nudgt auch nachts zu waking."""
    state, _, _ = _bio(BIO_SLEEP, wake_needed=True, day_state=DAY_EARLY_NIGHT)
    assert state == BIO_WAKING


def test_leaving_home_while_sleeping_forces_awake():
    """You can't physically be away and asleep — catch the missed flip."""
    state, _, _ = _bio(BIO_SLEEP, presence_personal=PERS_AWAY)
    assert state == BIO_AWAKE


def test_sleep_persists_when_no_wake_signal():
    """Across an HA restart with bio=sleep and no incoming signals, stay sleep."""
    state, _, _ = _bio(BIO_SLEEP)
    assert state == BIO_SLEEP


def test_persistence_dataclass_roundtrip():
    """The persistent dataclass survives serialization for restore-after-restart."""
    from custom_components.benni_core_state.models import PersistentState

    p = PersistentState(
        bio_state=BIO_SLEEP,
        last_sleep_start="2026-05-18T01:00:00+00:00",
        last_awake_start=None,
        transition_state="coming_home",
        transition_started="2026-05-18T05:00:00+00:00",
        preheat_active=True,
        preheat_source="approach",
        preheat_started="2026-05-18T05:01:00+00:00",
    )
    restored = PersistentState.from_dict(p.to_dict())
    assert restored.bio_state == BIO_SLEEP
    assert restored.last_sleep_start == "2026-05-18T01:00:00+00:00"
    assert restored.transition_state == "coming_home"
    assert restored.preheat_active is True
    assert restored.preheat_source == "approach"

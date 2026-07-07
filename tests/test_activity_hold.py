"""Presence-Effective Activity-Hold (PR3).

Reine Logik-Tests für ``apply_activity_hold`` + ``away_gate_active``. Kein HA.
``presence_personal`` wird nie verändert — der Hold ist eine Overlay-Schicht auf
``presence_effective``.
"""
from __future__ import annotations

from custom_components.benni_core_state import logic
from custom_components.benni_core_state.const import (
    ACT_ENTERTAINMENT,
    ACT_FREE_TIME,
    ACT_GAMING,
    ACT_HOUSEHOLD,
    ACT_IDLE,
    ACT_MUSIC,
    ACT_PC_ACTIVE,
    ACT_PRIVATE,
    ACT_SLEEP,
    ACT_WAKING,
    ACT_WORK_HOME,
    BAND_FAR,
    BAND_HOME,
    BAND_NEAR,
    EFF_AWAY,
    EFF_HOME,
    EFF_UNCERTAIN,
    HOLD_HIGH,
    HOLD_MID,
    HOLD_NONE,
    PERS_AWAY,
    PERS_HOME,
    PERS_PARENTS,
)


def _hold(**over):
    base = dict(
        presence_personal=PERS_AWAY,
        base_effective=EFF_AWAY,
        base_transition=EFF_AWAY,
        activity=ACT_IDLE,
        home_band=BAND_HOME,
        proximity_trend="flat",
    )
    base.update(over)
    return logic.apply_activity_hold(**base)


# --- raw home / bei_eltern ------------------------------------------------


def test_raw_home_stays_home_not_assumed():
    r = _hold(presence_personal=PERS_HOME, base_effective=EFF_HOME, base_transition=EFF_HOME)
    assert r.effective_presence == EFF_HOME
    assert r.assumed is False
    assert r.reason == "raw_home"
    assert r.hold_active is False
    assert r.hold_strength == HOLD_NONE


def test_bei_eltern_not_overridden_by_music():
    r = _hold(presence_personal=PERS_PARENTS, base_effective=EFF_AWAY, activity=ACT_MUSIC)
    assert r.effective_presence == EFF_AWAY
    assert r.assumed is False
    assert r.hold_active is False
    assert r.reason == "at_parents"


def test_bei_eltern_not_overridden_by_pc_active():
    r = _hold(presence_personal=PERS_PARENTS, base_effective=EFF_AWAY, activity=ACT_PC_ACTIVE)
    assert r.effective_presence == EFF_AWAY
    assert r.assumed is False


# --- raw away without hold activity ---------------------------------------


def test_away_idle_stays_base_away():
    r = _hold(activity=ACT_IDLE, base_effective=EFF_AWAY)
    assert r.effective_presence == EFF_AWAY
    assert r.assumed is False
    assert r.hold_active is False


def test_away_uncertain_stays_base_uncertain():
    r = _hold(activity=ACT_IDLE, base_effective=EFF_UNCERTAIN)
    assert r.effective_presence == EFF_UNCERTAIN
    assert r.hold_active is False


def test_away_sleep_does_not_hold():
    r = _hold(activity=ACT_SLEEP, base_effective=EFF_AWAY)
    assert r.effective_presence == EFF_AWAY
    assert r.assumed is False


def test_away_waking_does_not_hold():
    assert _hold(activity=ACT_WAKING).effective_presence == EFF_AWAY


def test_away_free_time_does_not_hold():
    # free_time bewusst konservativ = kein Hold.
    r = _hold(activity=ACT_FREE_TIME, base_effective=EFF_AWAY)
    assert r.effective_presence == EFF_AWAY
    assert r.hold_active is False


# --- raw away WITH hold activity → assumed home ---------------------------


def test_away_gaming_holds_home():
    r = _hold(activity=ACT_GAMING)
    assert r.effective_presence == EFF_HOME
    assert r.transition == EFF_HOME
    assert r.assumed is True
    assert r.hold_active is True
    assert r.hold_strength == HOLD_HIGH
    assert r.source_activity == ACT_GAMING
    assert r.reason == f"activity_hold:{ACT_GAMING}"


def test_away_private_time_holds_home():
    assert _hold(activity=ACT_PRIVATE).effective_presence == EFF_HOME


def test_away_entertainment_holds_home():
    assert _hold(activity=ACT_ENTERTAINMENT).effective_presence == EFF_HOME


def test_away_music_holds_home():
    r = _hold(activity=ACT_MUSIC)
    assert r.effective_presence == EFF_HOME
    assert r.hold_strength == HOLD_HIGH


def test_away_pc_active_holds_home_mid_strength():
    r = _hold(activity=ACT_PC_ACTIVE)
    assert r.effective_presence == EFF_HOME
    assert r.hold_strength == HOLD_MID
    assert r.source_activity == ACT_PC_ACTIVE


def test_away_work_home_holds_home():
    assert _hold(activity=ACT_WORK_HOME).effective_presence == EFF_HOME


def test_away_household_holds_home_mid_strength():
    r = _hold(activity=ACT_HOUSEHOLD)
    assert r.effective_presence == EFF_HOME
    assert r.hold_strength == HOLD_MID


# --- hold break: harte Anker halten, weiche Signale brechen bei far-away --


def test_pc_active_holds_even_far_away():
    r = _hold(activity=ACT_PC_ACTIVE, home_band=BAND_FAR, proximity_trend="away_from_home")
    assert r.effective_presence == EFF_HOME
    assert r.assumed is True
    assert r.hold_active is True
    assert r.reason == f"activity_hold:{ACT_PC_ACTIVE}"


def test_gaming_holds_even_far_away():
    r = _hold(activity=ACT_GAMING, home_band=BAND_FAR, proximity_trend="away_from_home")
    assert r.effective_presence == EFF_HOME
    assert r.hold_active is True


def test_private_time_holds_even_far_away():
    r = _hold(activity=ACT_PRIVATE, home_band=BAND_FAR, proximity_trend="away_from_home")
    assert r.effective_presence == EFF_HOME
    assert r.hold_active is True


def test_work_home_holds_even_far_away():
    r = _hold(activity=ACT_WORK_HOME, home_band=BAND_FAR, proximity_trend="away_from_home")
    assert r.effective_presence == EFF_HOME
    assert r.hold_active is True


def test_household_holds_even_far_away():
    r = _hold(activity=ACT_HOUSEHOLD, home_band=BAND_FAR, proximity_trend="away_from_home")
    assert r.effective_presence == EFF_HOME
    assert r.hold_active is True


def test_music_breaks_when_far_away():
    r = _hold(activity=ACT_MUSIC, home_band=BAND_FAR, proximity_trend="away_from_home")
    assert r.effective_presence == EFF_AWAY
    assert r.assumed is False
    assert r.hold_active is False
    assert "broken" in r.reason and ACT_MUSIC in r.reason


def test_entertainment_breaks_when_far_away():
    r = _hold(activity=ACT_ENTERTAINMENT, home_band=BAND_FAR, proximity_trend="away_from_home")
    assert r.effective_presence == EFF_AWAY
    assert r.assumed is False
    assert r.hold_active is False
    assert "broken" in r.reason and ACT_ENTERTAINMENT in r.reason


def test_music_holds_when_far_but_not_moving_away():
    # far band OHNE away-Trend ist kein bestätigtes Far-Away → Soft-Hold greift.
    r = _hold(activity=ACT_MUSIC, home_band=BAND_FAR, proximity_trend="flat")
    assert r.effective_presence == EFF_HOME
    assert r.hold_active is True


def test_near_band_moving_away_soft_still_holds():
    # heim-nah + weg-Trend ist kein far-away → auch music hält (GPS-Unsicherheit).
    r = _hold(activity=ACT_MUSIC, home_band=BAND_NEAR, proximity_trend="away_from_home")
    assert r.effective_presence == EFF_HOME
    assert r.hold_active is True


# --- away gate ------------------------------------------------------------


def test_away_gate_off_when_hold_active():
    assert logic.away_gate_active(PERS_AWAY, True) is False


def test_away_gate_on_when_away_and_no_hold():
    assert logic.away_gate_active(PERS_AWAY, False) is True


def test_away_gate_off_when_home():
    assert logic.away_gate_active(PERS_HOME, False) is False


def test_away_gate_off_when_bei_eltern():
    assert logic.away_gate_active(PERS_PARENTS, False) is False


# --- pass-through preserves base transition -------------------------------


def test_no_hold_preserves_base_transition():
    r = _hold(activity=ACT_IDLE, base_effective=EFF_AWAY, base_transition="leaving")
    assert r.transition == "leaving"
    assert r.effective_presence == EFF_AWAY

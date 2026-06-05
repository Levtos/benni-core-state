"""Presence rules — the most safety-critical part.

Pin down ``bei_eltern`` (home-equivalent, but never ``coming_home``), GPS
freshness fallback and band hysteresis. Unverändert zum Toolbox-Ist-Stand.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from custom_components.benni_core_state import logic
from custom_components.benni_core_state.const import (
    BAND_FAR,
    BAND_HOME,
    BAND_NEAR,
    BAND_PREHEAT,
    HH_EMPTY,
    HH_OCCUPIED,
    PERS_AWAY,
    PERS_HOME,
    PERS_PARENTS,
    TRANS_COMING_HOME,
    TRANS_LEAVING_HOME,
    TRANS_NONE,
)

NOW = datetime(2026, 5, 18, 12, 0, tzinfo=timezone.utc)
FRESH_TS = NOW - timedelta(seconds=10)
STALE_TS = NOW - timedelta(hours=2)


def _personal(**over):
    base = dict(
        wlan_benni=None,
        wlan_benni_ts=None,
        wlan_eltern_1=None,
        wlan_eltern_2=None,
        gps_primary=None,
        gps_primary_ts=None,
        gps_secondary=None,
        gps_secondary_ts=None,
        now=NOW,
        freshness_s=1800,
    )
    base.update(over)
    return logic.compute_presence_personal(**base)


# --- bei_eltern is its own state ------------------------------------------


def test_bei_eltern_when_parents_wlan_home():
    assert _personal(wlan_eltern_1="home") == PERS_PARENTS
    assert _personal(wlan_eltern_2="home") == PERS_PARENTS


def test_benni_wlan_beats_parents_wlan():
    assert (
        _personal(wlan_benni="home", wlan_benni_ts=FRESH_TS, wlan_eltern_1="home")
        == PERS_HOME
    )


def test_abwesend_when_nothing_known():
    assert _personal() == PERS_AWAY


# --- bei_eltern is home-equivalent (household) ----------------------------


def test_household_bei_eltern_is_empty_but_not_away_mode():
    assert logic.compute_presence_household(PERS_PARENTS, False) == HH_EMPTY
    assert logic.compute_presence_household(PERS_HOME, False) == HH_OCCUPIED
    assert logic.compute_presence_household(PERS_AWAY, True) == HH_OCCUPIED


# --- coming_home rules ----------------------------------------------------


def test_coming_home_from_real_abwesend():
    trans, ts = logic.compute_transition(
        prev_band=BAND_NEAR,
        new_band=BAND_HOME,
        prev_personal=PERS_AWAY,
        new_personal=PERS_HOME,
        direction="towards",
        prev_transition=TRANS_NONE,
        prev_started=None,
        now=NOW,
        hold_s=120,
    )
    assert trans == TRANS_COMING_HOME
    assert ts == NOW


def test_no_coming_home_from_bei_eltern():
    trans, _ = logic.compute_transition(
        prev_band=BAND_NEAR,
        new_band=BAND_HOME,
        prev_personal=PERS_PARENTS,
        new_personal=PERS_HOME,
        direction="towards",
        prev_transition=TRANS_NONE,
        prev_started=None,
        now=NOW,
        hold_s=120,
    )
    assert trans == TRANS_NONE


def test_leaving_home_when_moving_out_from_home():
    trans, _ = logic.compute_transition(
        prev_band=BAND_HOME,
        new_band=BAND_PREHEAT,
        prev_personal=PERS_HOME,
        new_personal=PERS_AWAY,
        direction="away",
        prev_transition=TRANS_NONE,
        prev_started=None,
        now=NOW,
        hold_s=120,
    )
    assert trans == TRANS_LEAVING_HOME


def test_no_coming_home_when_passing_through_after_parents():
    trans, _ = logic.compute_transition(
        prev_band=BAND_FAR,
        new_band=BAND_NEAR,
        prev_personal=PERS_PARENTS,
        new_personal=PERS_PARENTS,
        direction="towards",
        prev_transition=TRANS_NONE,
        prev_started=None,
        now=NOW,
        hold_s=120,
    )
    assert trans == TRANS_NONE


# --- GPS stale fallback ---------------------------------------------------


def test_stale_primary_gps_falls_back_to_wlan():
    assert (
        _personal(
            wlan_benni="home",
            wlan_benni_ts=STALE_TS,
            gps_primary="not_home",
            gps_primary_ts=STALE_TS,
        )
        == PERS_HOME
    )


def test_stale_primary_gps_falls_back_to_secondary():
    assert (
        _personal(
            gps_primary="not_home",
            gps_primary_ts=STALE_TS,
            gps_secondary="home",
            gps_secondary_ts=FRESH_TS,
        )
        == PERS_HOME
    )


def test_wlan_dropout_does_not_force_away():
    assert _personal() == PERS_AWAY


# --- band hysteresis ------------------------------------------------------


def _band(**over):
    base = dict(
        distance_m=0.0,
        presence_personal=PERS_AWAY,
        home_r=100,
        preheat_r=800,
        near_r=3000,
        hysteresis_m=50,
        prev_band=None,
    )
    base.update(over)
    return logic.compute_presence_band(**base)


def test_band_zuhause_forces_home_regardless_of_distance():
    assert _band(distance_m=999_999, presence_personal=PERS_HOME) == BAND_HOME


def test_band_classification_fresh():
    assert _band(distance_m=50) == BAND_HOME
    assert _band(distance_m=500) == BAND_PREHEAT
    assert _band(distance_m=2000) == BAND_NEAR
    assert _band(distance_m=20_000) == BAND_FAR


def test_band_hysteresis_holds_inner_state():
    assert _band(distance_m=130, prev_band=BAND_HOME) == BAND_HOME
    assert _band(distance_m=130) == BAND_PREHEAT

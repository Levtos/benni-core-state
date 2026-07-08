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
    EFF_ARRIVING,
    EFF_LEAVING,
    EFF_UNCERTAIN,
    TRANS_COMING_HOME,
    TRANS_LEAVING_HOME,
    TRANS_NONE,
)

NOW = datetime(2026, 5, 18, 12, 0, tzinfo=timezone.utc)
FRESH_TS = NOW - timedelta(seconds=10)
STALE_TS = NOW - timedelta(hours=2)


HOME_SSIDS = ["Einhornaufzuchtsfarm", "Einhornaufzuchtsstation"]
PARENTS_SSIDS = ["Martin Router King 2"]


def _personal(**over):
    base = dict(
        ssid=None,
        home_ssids=HOME_SSIDS,
        parents_ssids=PARENTS_SSIDS,
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


# --- SSID anchors (FLEET-100): instant, positive-only evidence -------------


def test_ssid_home_24ghz_is_zuhause():
    assert _personal(ssid="Einhornaufzuchtsfarm") == PERS_HOME


def test_ssid_home_5ghz_band_also_zuhause():
    # The 2.4/5 GHz bands carry different names; both must resolve to home.
    assert _personal(ssid="Einhornaufzuchtsstation") == PERS_HOME


def test_ssid_match_is_case_and_whitespace_tolerant():
    assert _personal(ssid="  einhornaufzuchtsfarm ") == PERS_HOME


def test_ssid_parents_is_bei_eltern():
    assert _personal(ssid="Martin Router King 2") == PERS_PARENTS


def test_ssid_home_beats_stale_away_gps():
    # On the home WLAN beats a STALE laggy GPS still reading "not_home" (the
    # ~15 min poll legitimately lags a real arrival). Stale ⇒ no away override.
    assert (
        _personal(
            ssid="Einhornaufzuchtsfarm",
            gps_primary="not_home",
            gps_primary_ts=STALE_TS,
        )
        == PERS_HOME
    )


def test_fresh_away_gps_overrides_stuck_home_ssid():
    # FLEET-100 smoking gun (2026-06-30): the iOS companion SSID sensor froze
    # on the home WLAN the whole time Benni was out. A FRESH primary GPS
    # "not_home" is authoritative and must override the stuck SSID → abwesend.
    assert (
        _personal(
            ssid="Einhornaufzuchtsstation",
            gps_primary="not_home",
            gps_primary_ts=FRESH_TS,
        )
        == PERS_AWAY
    )


def test_fresh_away_gps_overrides_fresh_home_wlan_benni():
    # The away override also covers the legacy wlan_benni "home" slot.
    assert (
        _personal(
            wlan_benni="home",
            wlan_benni_ts=FRESH_TS,
            gps_primary="not_home",
            gps_primary_ts=FRESH_TS,
        )
        == PERS_AWAY
    )


def test_fresh_away_gps_does_not_break_bei_eltern():
    # bei_eltern is NOT gated by the GPS-away override: a fresh GPS outside the
    # home zone is exactly when Benni may be at his parents'.
    assert (
        _personal(
            ssid="Martin Router King 2",
            gps_primary="not_home",
            gps_primary_ts=FRESH_TS,
        )
        == PERS_PARENTS
    )
    assert (
        _personal(
            wlan_eltern_1="home",
            gps_primary="not_home",
            gps_primary_ts=FRESH_TS,
        )
        == PERS_PARENTS
    )


def test_unknown_ssid_is_ignored_falls_through_to_gps():
    # Brother/sister/café WLAN: no anchor match → GPS decides.
    assert _personal(ssid="Geschwister-WLAN") == PERS_AWAY
    assert (
        _personal(
            ssid="Geschwister-WLAN",
            gps_primary="home",
            gps_primary_ts=FRESH_TS,
        )
        == PERS_HOME
    )


def test_not_connected_ssid_blip_never_forces_away():
    # SSID is positive-only: a band-roam "Not Connected" blip must not assert
    # away while a fresh GPS still says home.
    assert (
        _personal(
            ssid="Not Connected",
            gps_primary="home",
            gps_primary_ts=FRESH_TS,
        )
        == PERS_HOME
    )


def test_home_ssid_outranks_parents_ssid_signal():
    # Disjoint sets in practice; home is checked first regardless.
    assert (
        _personal(ssid="Einhornaufzuchtsfarm", wlan_eltern_1="home") == PERS_HOME
    )


# --- bei_eltern is its own state ------------------------------------------


def test_bei_eltern_when_parents_wlan_home():
    assert _personal(wlan_eltern_1="home") == PERS_PARENTS
    assert _personal(wlan_eltern_2="home") == PERS_PARENTS


# --- FLEET-264: parents router vetoes a stale/frozen parents SSID ----------


def test_is_away_only_on_definite_negative():
    # Absence of signal (None/unknown/unavailable) is NOT away — only a definite
    # negative token counts (router says not_home).
    assert logic._is_away("not_home") is True
    assert logic._is_away("NOT_HOME") is True
    assert logic._is_away("off") is True
    for v in (None, "unknown", "unavailable", "home", "on", ""):
        assert logic._is_away(v) is False, v


def test_parents_router_not_home_vetoes_stale_parents_ssid_gps_home_wins():
    # THE live incident (2026-07-08): iOS SSID frozen on the parents WLAN while
    # Benni is actually home. The parents FRITZ!Box tracker (not_home) vetoes the
    # stale SSID, so fresh GPS-home wins → zuhause.
    assert (
        _personal(
            ssid="Martin Router King 2",
            wlan_eltern_1="not_home",
            gps_primary="home",
            gps_primary_ts=FRESH_TS,
        )
        == PERS_HOME
    )


def test_parents_router_not_home_clears_retained_bei_eltern():
    # Even without a fresh GPS this tick, a definite parents not_home must clear
    # a stuck bei_eltern (no positive home/away signal → falls to abwesend).
    assert (
        _personal(
            ssid="Martin Router King 2",
            wlan_eltern_1="not_home",
            prev_personal=PERS_PARENTS,
        )
        == PERS_AWAY
    )


def test_parents_ssid_still_bei_eltern_when_router_unbound():
    # Regression guard: with the parents tracker UNBOUND (None), the SSID hint
    # still asserts bei_eltern — the veto needs a positive not_home, not absence.
    assert _personal(ssid="Martin Router King 2", wlan_eltern_1=None) == PERS_PARENTS
    # And even against a fresh GPS-away (unchanged FLEET-100 behaviour).
    assert (
        _personal(
            ssid="Martin Router King 2",
            wlan_eltern_1=None,
            gps_primary="not_home",
            gps_primary_ts=FRESH_TS,
        )
        == PERS_PARENTS
    )


def test_parents_router_home_still_bei_eltern_and_beats_gps_home():
    # Genuinely at parents: router home → bei_eltern, even if 20 m GPS reads home.
    assert (
        _personal(
            ssid="Martin Router King 2",
            wlan_eltern_1="home",
            gps_primary="home",
            gps_primary_ts=FRESH_TS,
        )
        == PERS_PARENTS
    )


def test_restart_retain_bei_eltern_preserved_when_tracker_unavailable():
    # On an HA restart the parents tracker is unavailable → None (absence, not
    # not_home) → retain bei_eltern (the FLEET-264 exception must NOT fire).
    assert (
        _personal(prev_personal=PERS_PARENTS, wlan_eltern_1=None) == PERS_PARENTS
    )


def test_benni_wlan_beats_parents_wlan():
    assert (
        _personal(wlan_benni="home", wlan_benni_ts=FRESH_TS, wlan_eltern_1="home")
        == PERS_HOME
    )


def test_abwesend_when_nothing_known():
    assert _personal() == PERS_AWAY


# --- restart retain (FLEET: HA-restart must not fabricate abwesend) --------


def test_no_signal_retains_prev_home_across_restart():
    # On an HA restart every tracker is briefly unavailable. Without a fresh
    # GPS-away reading we must retain the last known presence, NOT flip to
    # abwesend (which would tear down away-gated media / door consumers).
    assert _personal(prev_personal=PERS_HOME) == PERS_HOME


def test_no_signal_retains_prev_bei_eltern_across_restart():
    assert _personal(prev_personal=PERS_PARENTS) == PERS_PARENTS


def test_no_signal_without_prior_still_abwesend():
    # Fresh install / empty store: no prior observation → documented default.
    assert _personal(prev_personal=None) == PERS_AWAY


def test_fresh_away_gps_beats_retained_home():
    # Retain never masks POSITIVE away evidence: a fresh primary GPS outside
    # the home zone still asserts abwesend even if the last state was home.
    assert (
        _personal(
            prev_personal=PERS_HOME,
            gps_primary="not_home",
            gps_primary_ts=FRESH_TS,
        )
        == PERS_AWAY
    )


def test_fresh_secondary_away_gps_beats_retained_home():
    assert (
        _personal(
            prev_personal=PERS_HOME,
            gps_secondary="not_home",
            gps_secondary_ts=FRESH_TS,
        )
        == PERS_AWAY
    )


def test_home_ssid_still_wins_over_retained_away():
    # Positive home evidence also overrides a retained abwesend immediately.
    assert _personal(prev_personal=PERS_AWAY, ssid="Einhornaufzuchtsfarm") == PERS_HOME


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


# --- policy-grade effective presence --------------------------------------


def _effective(**over):
    base = dict(
        presence_personal=PERS_AWAY,
        home_band=BAND_NEAR,
        distance_m=200,
        direction=None,
        now=NOW,
        person_source_ts=FRESH_TS,
        band_source_ts=FRESH_TS,
        distance_ts=FRESH_TS,
        direction_ts=FRESH_TS,
        previous_distance_m=150,
        previous_effective="away",
        previous_candidate=None,
        previous_candidate_started_at=None,
        last_home_at=NOW - timedelta(minutes=5),
        last_away_at=NOW - timedelta(minutes=5),
    )
    base.update(over)
    return logic.compute_effective_presence(**base)


def test_effective_leaving_when_home_band_stale_but_distance_rises():
    result = _effective(
        home_band=BAND_HOME,
        distance_m=260,
        previous_distance_m=120,
        direction="away",
    )
    assert result.effective_presence == EFF_LEAVING
    assert result.transition == EFF_LEAVING
    assert result.block_reason == "moving_away_from_home"
    assert result.confidence >= 0.75


def test_effective_arriving_after_stable_away_and_decreasing_distance():
    result = _effective(
        home_band=BAND_NEAR,
        distance_m=900,
        previous_distance_m=1400,
        direction="towards",
        previous_candidate=EFF_ARRIVING,
        previous_candidate_started_at=NOW - timedelta(seconds=10),
        last_away_at=NOW - timedelta(minutes=10),
    )
    assert result.effective_presence == EFF_ARRIVING
    assert result.transition == EFF_ARRIVING
    assert result.confidence >= 0.9


def test_effective_away_near_without_clear_trend_is_uncertain():
    result = _effective(
        home_band=BAND_NEAR,
        distance_m=900,
        previous_distance_m=905,
        direction=None,
    )
    assert result.effective_presence == EFF_UNCERTAIN
    assert result.transition == EFF_UNCERTAIN
    assert result.block_reason == "person_away_near_home_without_clear_trend"

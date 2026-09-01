"""Parents-profile household presence without a multi-person model."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from custom_components.benni_core_state import logic
from custom_components.benni_core_state.const import (
    BAND_FAR,
    BAND_HOME,
    BAND_PREHEAT,
    EFF_AWAY,
    EFF_HOME,
    HH_EMPTY,
    HH_OCCUPIED,
    PERS_AWAY,
    PERS_HOME,
    PROFILE_BENNI,
    PROFILE_ELTERN,
    storage_key,
    unique_id,
    wake_config_storage_key,
)

NOW = datetime(2026, 9, 2, 10, 0, tzinfo=timezone.utc)
FRESH = NOW - timedelta(seconds=10)


def _presence(**over: object) -> str:
    values = {
        "ssid": None,
        "home_ssids": [],
        "parents_ssids": [],
        "wlan_benni": None,
        "wlan_benni_ts": None,
        "wlan_eltern_1": None,
        "wlan_eltern_2": None,
        "gps_primary": None,
        "gps_primary_ts": None,
        "gps_secondary": None,
        "gps_secondary_ts": None,
        "now": NOW,
        "freshness_s": 900,
        "profile": PROFILE_ELTERN,
    }
    values.update(over)
    return logic.compute_presence_personal(**values)


def _band(
    *, presence: str, distance: float | None, previous: str | None = None
) -> str:
    return logic.compute_presence_band(
        distance_m=distance,
        presence_personal=presence,
        home_r=150,
        preheat_r=1500,
        near_r=3000,
        hysteresis_m=100,
        prev_band=previous,
        profile=PROFILE_ELTERN,
    )


def test_benni_profile_keeps_primary_away_override() -> None:
    result = logic.compute_presence_personal(
        ssid="home-network",
        home_ssids=["home-network"],
        parents_ssids=[],
        wlan_benni=None,
        wlan_benni_ts=None,
        wlan_eltern_1=None,
        wlan_eltern_2=None,
        gps_primary="not_home",
        gps_primary_ts=FRESH,
        gps_secondary=None,
        gps_secondary_ts=None,
        now=NOW,
        freshness_s=900,
        profile=PROFILE_BENNI,
    )

    assert result == PERS_AWAY


def test_source_a_home_source_b_away_means_household_home() -> None:
    assert _presence(
        gps_primary="home",
        gps_primary_ts=FRESH,
        gps_secondary="not_home",
        gps_secondary_ts=FRESH,
    ) == PERS_HOME


def test_source_a_away_source_b_home_means_household_home() -> None:
    assert _presence(
        gps_primary="not_home",
        gps_primary_ts=FRESH,
        gps_secondary="home",
        gps_secondary_ts=FRESH,
    ) == PERS_HOME


def test_both_sources_away_mean_away_and_far_without_proximity() -> None:
    presence = _presence(
        gps_primary="not_home",
        gps_primary_ts=FRESH,
        gps_secondary="work",
        gps_secondary_ts=FRESH,
    )

    assert presence == PERS_AWAY
    assert _band(presence=presence, distance=None, previous=BAND_HOME) == BAND_FAR


def test_unavailable_source_is_ignored_and_reliable_source_decides() -> None:
    assert _presence(
        gps_primary="unavailable",
        gps_primary_ts=FRESH,
        gps_secondary="home",
        gps_secondary_ts=FRESH,
    ) == PERS_HOME
    assert _presence(
        gps_primary="unknown",
        gps_primary_ts=FRESH,
        gps_secondary="not_home",
        gps_secondary_ts=FRESH,
    ) == PERS_AWAY


def test_no_reliable_source_retains_previous_fail_safe_state() -> None:
    assert _presence(
        gps_primary="unavailable",
        gps_primary_ts=FRESH,
        gps_secondary="unknown",
        gps_secondary_ts=FRESH,
        prev_personal=PERS_HOME,
    ) == PERS_HOME


def test_household_preheat_uses_existing_nearest_proximity_evidence() -> None:
    presence = _presence(
        gps_primary="not_home",
        gps_primary_ts=FRESH,
        gps_secondary="not_home",
        gps_secondary_ts=FRESH,
    )
    band = _band(presence=presence, distance=600)
    active, source, _ = logic.compute_preheat(
        band=band,
        direction="towards",
        presence_personal=presence,
        prev_active=False,
        prev_started=None,
        now=NOW,
        max_duration_s=1200,
    )

    assert band == BAND_PREHEAT
    assert active is True
    assert source == "approach"


def test_home_source_overrides_other_sources_band_and_preheat() -> None:
    presence = _presence(
        gps_primary="home",
        gps_primary_ts=FRESH,
        gps_secondary="not_home",
        gps_secondary_ts=FRESH,
    )
    band = _band(presence=presence, distance=20_000, previous=BAND_FAR)
    active, _, _ = logic.compute_preheat(
        band=band,
        direction="towards",
        presence_personal=presence,
        prev_active=False,
        prev_started=None,
        now=NOW,
        max_duration_s=1200,
    )

    assert band == BAND_HOME
    assert active is False


def test_eltern_ignores_optional_external_occupancy_as_third_source() -> None:
    assert (
        logic.compute_presence_household(
            PERS_AWAY, True, profile=PROFILE_ELTERN
        )
        == HH_EMPTY
    )
    assert (
        logic.compute_presence_household(
            PERS_HOME, False, profile=PROFILE_ELTERN
        )
        == HH_OCCUPIED
    )


def test_eltern_activity_cannot_become_a_third_presence_source() -> None:
    hold = logic.apply_activity_hold(
        presence_personal=PERS_AWAY,
        base_effective=EFF_AWAY,
        base_transition=EFF_AWAY,
        activity="gaming",
        home_band=BAND_FAR,
        proximity_trend="unknown",
        profile=PROFILE_ELTERN,
    )

    assert hold.effective_presence == EFF_AWAY
    assert hold.effective_presence != EFF_HOME
    assert hold.hold_active is False
    assert logic.away_gate_active(PERS_AWAY, hold.hold_active) is True


def test_profiles_share_one_entity_and_storage_namespace_per_entry() -> None:
    entry_id = "single-entry"

    for _profile in (PROFILE_BENNI, PROFILE_ELTERN):
        assert unique_id(entry_id, "bio_state") == (
            "benni_core_state_single-entry_bio_state"
        )
        assert storage_key(entry_id) == "benni_core_state_state_single-entry"
        assert wake_config_storage_key(entry_id) == (
            "benni_core_state_wake_planning_single-entry"
        )

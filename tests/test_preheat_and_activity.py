"""Preheat & activity rules — Toolbox-Ist-Stand."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

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
    BAND_PREHEAT,
    BIO_AWAKE,
    BIO_SLEEP,
    BIO_WAKING,
    DAY_AFTERNOON,
    DC_WERKTAG,
    DC_WOCHENENDE,
    PERS_AWAY,
    PERS_HOME,
    PERS_PARENTS,
)

NOW = datetime(2026, 5, 18, 12, 0, tzinfo=timezone.utc)


def _preheat(**over):
    base = dict(
        band=BAND_PREHEAT,
        direction="towards",
        presence_personal=PERS_AWAY,
        prev_active=False,
        prev_started=None,
        now=NOW,
        max_duration_s=900,
    )
    base.update(over)
    return logic.compute_preheat(**base)


def test_preheat_activates_when_approaching():
    active, source, started = _preheat()
    assert active is True
    assert source == "approach"
    assert started == NOW


def test_preheat_disarmed_when_bei_eltern():
    active, *_ = _preheat(presence_personal=PERS_PARENTS)
    assert active is False


def test_preheat_disarmed_at_home():
    active, *_ = _preheat(band=BAND_HOME, presence_personal=PERS_HOME)
    assert active is False


def test_preheat_caps_at_max_duration():
    started = NOW - timedelta(seconds=1000)
    active, source, _ = _preheat(prev_active=True, prev_started=started)
    assert active is False
    assert source == "expired"


def test_preheat_sustains_through_brief_far_blip():
    started = NOW - timedelta(seconds=60)
    active, source, _ = _preheat(band=BAND_FAR, prev_active=True, prev_started=started)
    assert active is True
    assert source == "sustain"


# --- activity -------------------------------------------------------------


def _activity(**over):
    base = dict(
        bio=BIO_AWAKE,
        presence_personal=PERS_HOME,
        day_context=DC_WERKTAG,
        day_state=DAY_AFTERNOON,
        homeoffice=False,
        private_active=False,
        household_active=False,
        media_context=None,
        stash_streams=0,
        gaming_platform=None,
        entertainment_active=False,
        music_active=False,
        pc_active=False,
    )
    base.update(over)
    return logic.compute_activity(**base)


# --- bio priority ---------------------------------------------------------


def test_activity_sleep_beats_everything():
    assert _activity(
        bio=BIO_SLEEP, media_context="gaming", music_active=True, pc_active=True
    ) == ACT_SLEEP


def test_activity_waking_beats_everything_but_sleep():
    assert _activity(
        bio=BIO_WAKING, media_context="gaming", pc_active=True
    ) == ACT_WAKING


# --- private_time ---------------------------------------------------------


def test_private_from_media_context():
    assert _activity(media_context="private_time") == ACT_PRIVATE


def test_private_from_stash_streams():
    assert _activity(stash_streams=2) == ACT_PRIVATE


def test_private_beats_gaming_music_pc():
    assert _activity(
        stash_streams=1, media_context="gaming", music_active=True, pc_active=True
    ) == ACT_PRIVATE


# --- gaming ---------------------------------------------------------------


def test_gaming_from_media_context():
    assert _activity(media_context="gaming") == ACT_GAMING


def test_gaming_from_platform():
    assert _activity(gaming_platform="ps5") == ACT_GAMING


def test_gaming_platform_none_is_not_gaming():
    assert _activity(gaming_platform="none", pc_active=True) == ACT_PC_ACTIVE


# --- entertainment --------------------------------------------------------


def test_entertainment_from_tv():
    assert _activity(media_context="tv") == ACT_ENTERTAINMENT


def test_entertainment_from_streaming():
    assert _activity(media_context="streaming") == ACT_ENTERTAINMENT


def test_entertainment_from_active_flag():
    assert _activity(entertainment_active=True) == ACT_ENTERTAINMENT


def test_gaming_beats_entertainment_and_music():
    assert _activity(
        media_context="gaming", entertainment_active=True, music_active=True
    ) == ACT_GAMING


# --- music ----------------------------------------------------------------


def test_music_when_active():
    assert _activity(music_active=True) == ACT_MUSIC


def test_music_beats_pc_active():
    assert _activity(music_active=True, pc_active=True) == ACT_MUSIC


def test_entertainment_beats_music():
    assert _activity(media_context="tv", music_active=True) == ACT_ENTERTAINMENT


# --- work_home / pc_active ------------------------------------------------


def test_work_home_when_homeoffice_pings_on_weekday():
    assert _activity(homeoffice=True) == ACT_WORK_HOME


def test_homeoffice_ignored_on_weekend():
    assert _activity(homeoffice=True, day_context=DC_WOCHENENDE) != ACT_WORK_HOME


def test_pc_active_without_stronger_context():
    assert _activity(pc_active=True) == ACT_PC_ACTIVE


def test_pc_active_not_faked_into_work_home():
    """homeoffice=False + pc_active ⇒ pc_active, niemals work_home."""
    assert _activity(homeoffice=False, pc_active=True) == ACT_PC_ACTIVE


def test_work_home_beats_pc_active():
    assert _activity(homeoffice=True, pc_active=True) == ACT_WORK_HOME


def test_private_beats_work():
    assert _activity(private_active=True, homeoffice=True) == ACT_PRIVATE


# --- household / free_time / idle -----------------------------------------


def test_household_when_only_household_active():
    assert _activity(household_active=True) == ACT_HOUSEHOLD


def test_free_time_is_residual_non_idle_context():
    # ein Nicht-Idle-Kontext, der kein eigener Bucket ist → free_time
    assert _activity(media_context="somethingelse") == ACT_FREE_TIME


def test_fallback_idle():
    assert _activity() == ACT_IDLE


def test_idle_media_context_stays_idle():
    assert _activity(media_context="idle") == ACT_IDLE


def test_regression_tv_is_entertainment_not_free_time():
    """Contract-Änderung PR2: media_context=tv ist jetzt entertainment."""
    result = _activity(media_context="tv")
    assert result == ACT_ENTERTAINMENT
    assert result != ACT_FREE_TIME

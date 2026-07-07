"""Preheat & activity rules — Toolbox-Ist-Stand."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from custom_components.benni_core_state import logic
from custom_components.benni_core_state.const import (
    ACT_ENTERTAINMENT,
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
        media_activity=None,
        pc_active=False,
    )
    base.update(over)
    return logic.compute_activity(**base)


# --- bio priority ---------------------------------------------------------


def test_activity_sleep_beats_everything():
    assert _activity(
        bio=BIO_SLEEP, media_activity="gaming", pc_active=True
    ) == ACT_SLEEP


def test_activity_waking_beats_everything_but_sleep():
    assert _activity(
        bio=BIO_WAKING, media_activity="gaming", pc_active=True
    ) == ACT_WAKING


# --- media feed mapping (PR2 / FLEET-256) ---------------------------------


def test_feed_music_maps_to_music():
    assert _activity(media_activity="music") == ACT_MUSIC


def test_feed_entertainment_maps_to_entertainment():
    assert _activity(media_activity="entertainment") == ACT_ENTERTAINMENT


def test_feed_gaming_maps_to_gaming():
    assert _activity(media_activity="gaming") == ACT_GAMING


def test_feed_private_maps_to_private():
    assert _activity(media_activity="private_time") == ACT_PRIVATE


def test_feed_idle_yields_no_media_bucket():
    # idle-Feed → kein Media-Bucket → Kernlogik entscheidet (idle bzw. pc_active).
    assert _activity(media_activity="idle") == ACT_IDLE
    assert _activity(media_activity="idle", pc_active=True) == ACT_PC_ACTIVE


def test_media_bucket_from_feed_projection():
    assert logic.media_bucket_from_feed("music") == ACT_MUSIC
    assert logic.media_bucket_from_feed("GAMING ") == ACT_GAMING
    assert logic.media_bucket_from_feed("private_time") == ACT_PRIVATE
    assert logic.media_bucket_from_feed("idle") is None
    assert logic.media_bucket_from_feed(None) is None
    assert logic.media_bucket_from_feed("unavailable") is None


# --- priority interleaving ------------------------------------------------
# Der Feed ist EIN-wertig (private_time > gaming > entertainment > music wird in
# media_state entschieden). Auf Core-Ebene wird nur die Media-Hälfte gegen die
# lokalen Buckets (private_active-Flag, work_home, household, pc_active)
# arbitriert — in genau dieser Reihenfolge.


def test_local_private_flag_beats_feed_gaming():
    assert _activity(private_active=True, media_activity="gaming", pc_active=True) == ACT_PRIVATE


def test_feed_gaming_beats_work_home():
    assert _activity(media_activity="gaming", homeoffice=True) == ACT_GAMING


def test_feed_entertainment_beats_household():
    assert _activity(media_activity="entertainment", household_active=True) == ACT_ENTERTAINMENT


def test_feed_music_beats_pc_active():
    assert _activity(media_activity="music", pc_active=True) == ACT_MUSIC


# --- raw reads removed (no double detection) ------------------------------


def test_compute_activity_signature_has_no_raw_media_params():
    import inspect

    params = inspect.signature(logic.compute_activity).parameters
    for forbidden in (
        "media_context", "stash_streams", "gaming_platform",
        "entertainment_active", "music_active",
    ):
        assert forbidden not in params, forbidden


def test_feed_private_without_reading_stash():
    # Feed=private_time löst private aus, ohne dass Core Stash-Streams liest.
    assert _activity(media_activity="private_time") == ACT_PRIVATE


def test_no_feed_no_media_bucket_even_if_named_like_music():
    # Ohne Feed gibt es keinen Media-Bucket — kein Roh-Fallback auf HomePods/Denon.
    assert _activity(media_activity=None, pc_active=True) == ACT_PC_ACTIVE
    assert _activity(media_activity=None) == ACT_IDLE


# --- missing / unavailable feed -------------------------------------------


def test_feed_missing_does_not_crash_and_no_bucket():
    assert _activity(media_activity=None) == ACT_IDLE


def test_feed_unavailable_or_unknown_no_bucket():
    assert _activity(media_activity="unavailable") == ACT_IDLE
    assert _activity(media_activity="unknown", pc_active=True) == ACT_PC_ACTIVE


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


# --- household / idle -----------------------------------------------------


def test_household_when_only_household_active():
    assert _activity(household_active=True) == ACT_HOUSEHOLD


def test_household_beats_pc_active():
    assert _activity(household_active=True, pc_active=True) == ACT_HOUSEHOLD


def test_fallback_idle():
    assert _activity() == ACT_IDLE


# --- feed → activity → presence-effective activity-hold (regression) -------
# Stellt sicher, dass die Hold-Semantik nach dem Feed-Umbau unverändert ist:
# music/entertainment = soft (bricht bei bestätigtem Far-Away), private/gaming =
# hard (hält auch bei Far-Away). Kein Eingriff in presence_personal.


def _hold_for(media_activity, *, home_band=BAND_HOME, trend="flat"):
    act = _activity(media_activity=media_activity)
    hold = logic.apply_activity_hold(
        presence_personal=PERS_AWAY,
        base_effective="away",
        base_transition="away",
        activity=act,
        home_band=home_band,
        proximity_trend=trend,
    )
    return act, hold


def test_feed_music_is_soft_hold():
    # Zuhause-nah: Hold greift (assumed home).
    act, hold = _hold_for("music")
    assert act == ACT_MUSIC
    assert hold.assumed is True
    # Bestätigtes Far-Away: soft hold BRICHT.
    _, hold_far = _hold_for("music", home_band=BAND_FAR, trend="away_from_home")
    assert hold_far.assumed is False
    # Away-Gate: bei gebrochenem Soft-Hold ist das Gate aktiv (kein Hold).
    assert logic.away_gate_active(PERS_AWAY, hold_far.hold_active) is True


def test_feed_entertainment_is_soft_hold():
    _, hold_far = _hold_for("entertainment", home_band=BAND_FAR, trend="away_from_home")
    assert hold_far.assumed is False


def test_feed_gaming_is_hard_hold():
    # Harter Anker: hält AUCH bei bestätigtem Far-Away.
    act, hold = _hold_for("gaming", home_band=BAND_FAR, trend="away_from_home")
    assert act == ACT_GAMING
    assert hold.assumed is True
    assert hold.hold_active is True
    # Away-Gate bleibt off, solange der harte Hold aktiv ist.
    assert logic.away_gate_active(PERS_AWAY, hold.hold_active) is False


def test_feed_private_is_hard_hold():
    act, hold = _hold_for("private_time", home_band=BAND_FAR, trend="away_from_home")
    assert act == ACT_PRIVATE
    assert hold.assumed is True
    assert hold.hold_active is True

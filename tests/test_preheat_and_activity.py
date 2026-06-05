"""Preheat & activity rules — Toolbox-Ist-Stand."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from custom_components.benni_core_state import logic
from custom_components.benni_core_state.const import (
    ACT_FREE_TIME,
    ACT_HOUSEHOLD,
    ACT_IDLE,
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
    )
    base.update(over)
    return logic.compute_activity(**base)


def test_activity_sleep_mirrors_bio_sleep():
    """IST-Stand: bio=sleep ⇒ activity=sleep (nicht idle)."""
    assert _activity(bio=BIO_SLEEP) == ACT_SLEEP


def test_activity_waking_mirrors_bio_waking():
    assert _activity(bio=BIO_WAKING) == ACT_WAKING


def test_work_home_when_homeoffice_pings_on_weekday():
    assert _activity(homeoffice=True) == ACT_WORK_HOME


def test_homeoffice_ignored_on_weekend():
    assert _activity(homeoffice=True, day_context=DC_WOCHENENDE) != ACT_WORK_HOME


def test_private_beats_work():
    """Reihenfolge: private > work_home."""
    assert _activity(private_active=True, homeoffice=True) == ACT_PRIVATE


def test_household_when_only_household_active():
    assert _activity(household_active=True) == ACT_HOUSEHOLD


def test_media_context_drives_free_time():
    assert _activity(media_context="tv") == ACT_FREE_TIME
    assert _activity(media_context="idle") == ACT_IDLE

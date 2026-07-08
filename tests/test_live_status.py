"""Tests für den Live-Status-UX-Sensor (compute_live_status).

Anzeige-only; prüft Mapping, Prioritätskaskade, Attribute, Privacy (private_time)
und State-Länge. Keine Policy-Semantik.
"""
from __future__ import annotations

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
    BIO_AWAKE,
    BIO_SLEEP,
    BIO_WAKING,
    EFF_AWAY,
    EFF_HOME,
    PERS_AWAY,
    PERS_HOME,
    PERS_PARENTS,
    TRANS_COMING_HOME,
    TRANS_LEAVING_HOME,
    TRANS_NONE,
)


def _ls(**over):
    base = dict(
        bio=BIO_AWAKE,
        presence_personal=PERS_HOME,
        presence_effective=EFF_HOME,
        presence_transition=TRANS_NONE,
        activity=ACT_IDLE,
    )
    base.update(over)
    return logic.compute_live_status(**base)


# ------------------------------------------------------------- mapping


def test_sleep():
    assert _ls(bio=BIO_SLEEP, activity=ACT_SLEEP).state == "Benni schläft"


def test_waking():
    assert _ls(bio=BIO_WAKING, activity=ACT_WAKING).state == "Benni wacht auf"


def test_bei_eltern():
    r = _ls(presence_personal=PERS_PARENTS, presence_effective=EFF_AWAY)
    assert r.state == "Benni ist bei den Eltern"
    assert r.attrs["privacy_level"] == "presence"


def test_away_unterwegs():
    r = _ls(presence_personal=PERS_AWAY, presence_effective=EFF_AWAY)
    assert r.state == "Benni ist unterwegs"
    assert r.attrs["icon_hint"] == "mdi:walk"


def test_coming_home():
    assert _ls(presence_transition=TRANS_COMING_HOME).state == "Benni kommt nach Hause"


def test_leaving_home():
    assert _ls(presence_transition=TRANS_LEAVING_HOME).state == "Benni geht los"


def test_private_time_privacy_safe():
    r = _ls(
        activity=ACT_PRIVATE,
        title="Secret Title",
        artist="Some Studio",
        game_title="G",
        source_app="S",
        media_activity_reason="private:stash_streams",
    )
    assert r.state == "Private Time aktiv"
    assert r.attrs["privacy_level"] == "private"
    # keine sensiblen Details in State oder Attributen
    assert "Secret" not in r.state
    assert r.attrs["media_title"] is None
    assert r.attrs["media_artist"] is None
    assert r.attrs["game_title"] is None
    assert r.attrs["source_app"] is None
    assert r.attrs["media_activity_reason"] is None
    assert r.attrs["source_device"] is None


def test_gaming_with_game_title():
    assert _ls(activity=ACT_GAMING, game_title="Diablo IV").state == "Benni spielt Diablo IV"


def test_gaming_platform_fallback():
    assert _ls(activity=ACT_GAMING, gaming_platform="ps5").state == "Benni spielt PS5"


def test_gaming_bare_fallback():
    assert _ls(activity=ACT_GAMING).state == "Benni spielt gerade"


def test_entertainment_source_app():
    assert _ls(activity=ACT_ENTERTAINMENT, source_app="Netflix").state == "Benni schaut Netflix"


def test_entertainment_bare():
    assert _ls(activity=ACT_ENTERTAINMENT).state == "Benni schaut etwas"


def test_music_title_and_artist():
    assert _ls(
        activity=ACT_MUSIC, title="Break Free", artist="Ariana Grande"
    ).state == "Benni hört Break Free – Ariana Grande"


def test_music_title_only():
    assert _ls(activity=ACT_MUSIC, title="Break Free").state == "Benni hört Break Free"


def test_music_no_title():
    assert _ls(activity=ACT_MUSIC).state == "Benni hört Musik"


def test_work_home():
    assert _ls(activity=ACT_WORK_HOME).state == "Benni arbeitet zuhause"


def test_household():
    assert _ls(activity=ACT_HOUSEHOLD).state == "Haushalt aktiv"


def test_pc_active():
    assert _ls(activity=ACT_PC_ACTIVE, pc_active=True).state == "Benni ist am PC"


def test_pc_from_idle_flag():
    # idle-Activity aber PC-Flag → am PC (lokaler Anker)
    assert _ls(activity=ACT_IDLE, pc_active=True).state == "Benni ist am PC"


def test_idle_home():
    assert _ls(activity=ACT_IDLE).state == "Benni ist zuhause"


def test_unknown():
    assert _ls(activity=ACT_IDLE, presence_personal="", presence_effective="").state == "Status unbekannt"


# ------------------------------------------------------------- priority


def test_sleep_beats_music():
    # bio=sleep überschreibt jeden Media-Kontext
    assert _ls(bio=BIO_SLEEP, activity=ACT_MUSIC, title="X", artist="Y").state == "Benni schläft"


def test_sleep_beats_away():
    r = _ls(bio=BIO_SLEEP, activity=ACT_SLEEP, presence_personal=PERS_AWAY, presence_effective=EFF_AWAY)
    assert r.state == "Benni schläft"


def test_away_does_not_leak_private():
    # away overlay über private → „unterwegs", nie private Details
    r = _ls(activity=ACT_PRIVATE, presence_personal=PERS_AWAY, presence_effective=EFF_AWAY, title="Secret")
    assert r.state == "Benni ist unterwegs"
    assert "Secret" not in r.state


def test_private_beats_music():
    r = _ls(activity=ACT_PRIVATE, title="X", artist="Y")
    assert r.state == "Private Time aktiv"


def test_gaming_beats_music_details():
    assert _ls(activity=ACT_GAMING, game_title="D", title="X", artist="Y").state == "Benni spielt D"


def test_entertainment_beats_music_details():
    assert _ls(activity=ACT_ENTERTAINMENT, title="X").state.startswith("Benni schaut")


def test_music_beats_pc_active():
    assert _ls(activity=ACT_MUSIC, title="X", pc_active=True).state == "Benni hört X"


# ------------------------------------------------------------- attributes


def test_attributes_present():
    r = _ls(activity=ACT_MUSIC, title="X", artist="Y", media_activity_context="music",
            media_device="homepods", media_activity_reason="music:homepods")
    a = r.attrs
    assert a["activity_state"] == ACT_MUSIC
    assert a["presence_effective"] == EFF_HOME
    assert a["media_activity_context"] == "music"
    assert a["media_title"] == "X"
    assert a["media_artist"] == "Y"
    assert a["source_device"] == "HomePods"
    assert a["icon_hint"] == "mdi:music"
    assert a["priority"] == "music"
    assert a["privacy_level"] == "normal"
    assert a["source"] == "benni_core_state.live_status"
    # subtitle: kurze technische Ergänzung
    assert a["subtitle"] == "HomePods · music:homepods"
    assert a["headline"] == r.state


def test_icon_hints_plausible():
    assert _ls(bio=BIO_SLEEP, activity=ACT_SLEEP).attrs["icon_hint"] == "mdi:sleep"
    assert _ls(activity=ACT_GAMING, game_title="D").attrs["icon_hint"] == "mdi:gamepad-variant"
    assert _ls(activity=ACT_ENTERTAINMENT).attrs["icon_hint"] == "mdi:television-play"
    assert _ls(activity=ACT_PC_ACTIVE).attrs["icon_hint"] == "mdi:desktop-classic"
    assert _ls(activity=ACT_IDLE).attrs["icon_hint"] == "mdi:home"
    assert _ls(activity=ACT_PRIVATE).attrs["icon_hint"] == "mdi:shield-lock"


def test_state_stays_short():
    long_title = "T" * 400
    r = _ls(activity=ACT_MUSIC, title=long_title, artist="A" * 400)
    assert len(r.state) <= 250
    assert r.state.endswith("…")


def test_privacy_levels():
    assert _ls(activity=ACT_PRIVATE).attrs["privacy_level"] == "private"
    assert _ls(activity=ACT_MUSIC, title="X").attrs["privacy_level"] == "normal"
    assert _ls(presence_personal=PERS_AWAY, presence_effective=EFF_AWAY).attrs["privacy_level"] == "presence"
    assert _ls(activity=ACT_IDLE, presence_personal="", presence_effective="").attrs["privacy_level"] == "unknown"

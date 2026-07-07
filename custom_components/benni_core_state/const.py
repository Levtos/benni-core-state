"""Konstanten der Benni-Core-State-Integration.

Standalone-Extraktion des Toolbox-Moduls ``benni_context``. Eigene HA-Domain
``benni_core_state``; Storage-Keys, Service-Namen und unique_ids werden hier
mit dieser Domain präfixiert, damit es zu **keinerlei Kollision** mit der
weiterhin produktiven Toolbox-Version (``bennis_toolbox`` / Modul
``benni_context``) kommt.

Diese Datei ist bewusst frei von Home-Assistant-Imports, damit ``logic.py``
und ``models.py`` ohne laufendes HA per ``pytest`` testbar bleiben.
"""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "benni_core_state"
NAME: Final = "Benni Core State"

# Datenwurzel: hass.data[DOMAIN] = { entry_id: BenniCoreStateCoordinator }

# --- Config entry keys -------------------------------------------------------

# Entity selectors
CONF_GPS_PRIMARY = "gps_primary"
CONF_GPS_SECONDARY = "gps_secondary"
CONF_WLAN_BENNI = "wlan_benni"
CONF_WLAN_ELTERN_1 = "wlan_eltern_1"
CONF_WLAN_ELTERN_2 = "wlan_eltern_2"
# SSID-Quelle (roher Companion-App-SSID-Sensor) + Heim-/Eltern-SSID-Sets.
# Die SSID-Auswertung lebt NATIV in core_state (kein externer Template-Helper):
# das Gehirn liest die rohe SSID-Entität und matcht gegen ein konfigurierbares
# Set. Auf dem Heim-/Eltern-WLAN zu hängen ist Boden-Wahrheit → sofortiger,
# GPS-unabhängiger Presence-Pfad (FLEET-100). Mehrere SSIDs je Anker, weil das
# iPhone zwischen 2,4-/5-GHz-Netzen mit unterschiedlichen Namen wechselt.
CONF_SSID_SOURCE = "ssid_source"
CONF_HOME_SSIDS = "home_ssids"
CONF_PARENTS_SSIDS = "parents_ssids"
CONF_PROXIMITY_DISTANCE = "proximity_distance"
CONF_PROXIMITY_DIRECTION = "proximity_direction"
CONF_WAKE_NEXT = "wake_next"
CONF_WAKE_NEEDED = "wake_needed"
CONF_PC_ACTIVE = "pc_active"
CONF_PS5_ACTIVE = "ps5_active"
CONF_COFFEE_ACTIVE = "coffee_active"
CONF_DOOR_WAKE = "door_wake"
CONF_MEDIA_CONTEXT = "media_context"
CONF_PRIVATE_SOURCE = "private_source"
CONF_HOMEOFFICE_PING = "homeoffice_ping"
CONF_HOLIDAY_SENSOR = "holiday_sensor"
CONF_HOUSEHOLD_SOURCE = "household_source"
CONF_SOLAR_NOON = "solar_noon"
# Activity v2 (PR2 / FLEET-256): Media-Aktivität kommt jetzt aus EINEM
# media_state-Feed statt aus Roh-Playern. media_state ist Owner der
# Media-Wahrheit (benni_media_state v0.12.0 / FLEET-255) — Core liest KEINE
# HomePods/Denon/Stash-Rohsignale mehr (keine Doppel-Detektion, kein
# Roh-Fallback). Der Feed-State ist die Media-Hälfte des Activity-States
# (private_time/gaming/entertainment/music/idle); Core arbitriert weiter die
# Gesamtpriorität.
CONF_MEDIA_ACTIVITY_CONTEXT = "media_activity_context"  # media_state-Feed (State = Media-Bucket)
# Debug-/Attribut-Echo aus media_state — treiben die Activity-Entscheidung NICHT
# mehr, nur noch für Observability im activity_state-Attribut sichtbar.
CONF_ENTERTAINMENT_ACTIVE = "entertainment_active"  # media_state Binary (nur Debug-Attribut)
CONF_MEDIA_DEVICE = "media_device"            # media_state Primärgerät (nur Debug-Attribut)
CONF_GAMING_PLATFORM = "gaming_platform"      # media_state Plattform (nur Debug-Attribut)

# Numeric thresholds (options flow)
CONF_HOME_RADIUS = "home_radius"
CONF_PREHEAT_RADIUS = "preheat_radius"
CONF_NEAR_RADIUS = "near_radius"
CONF_HYSTERESIS_M = "hysteresis_m"
CONF_PREHEAT_DURATION = "preheat_duration"
CONF_TRACKER_FRESHNESS = "tracker_freshness"
CONF_TRANSITION_HOLD = "transition_hold"

# --- Defaults ----------------------------------------------------------------

DEFAULT_HOME_RADIUS = 100        # meters
DEFAULT_PREHEAT_RADIUS = 800
DEFAULT_NEAR_RADIUS = 3000
DEFAULT_HYSTERESIS_M = 50
DEFAULT_PREHEAT_DURATION = 900    # seconds (15 min cap)
DEFAULT_TRACKER_FRESHNESS = 1800  # seconds (30 min)
DEFAULT_TRANSITION_HOLD = 120     # seconds

# --- State enums -------------------------------------------------------------

# Presence Personal
PERS_HOME = "zuhause"
PERS_PARENTS = "bei_eltern"
PERS_AWAY = "abwesend"
PRESENCE_PERSONAL_STATES = [PERS_HOME, PERS_PARENTS, PERS_AWAY]

# Presence Household
HH_EMPTY = "leer"
HH_OCCUPIED = "nicht_leer"
PRESENCE_HOUSEHOLD_STATES = [HH_EMPTY, HH_OCCUPIED]

# Presence Band
BAND_HOME = "home"
BAND_PREHEAT = "preheat"
BAND_NEAR = "near"
BAND_FAR = "far"
PRESENCE_BAND_STATES = [BAND_HOME, BAND_PREHEAT, BAND_NEAR, BAND_FAR]

# Presence Transition
TRANS_NONE = "none"
TRANS_COMING_HOME = "coming_home"
TRANS_LEAVING_HOME = "leaving_home"
TRANS_PASSING = "passing_through"
PRESENCE_TRANSITION_STATES = [
    TRANS_NONE, TRANS_COMING_HOME, TRANS_LEAVING_HOME, TRANS_PASSING,
]

# Stabilized effective presence, owned by core_state for policy consumers.
EFF_HOME = "home"
EFF_AWAY = "away"
EFF_ARRIVING = "arriving"
EFF_LEAVING = "leaving"
EFF_UNCERTAIN = "uncertain"
EFF_STALE = "stale"
PRESENCE_EFFECTIVE_STATES = [
    EFF_HOME, EFF_AWAY, EFF_ARRIVING, EFF_LEAVING, EFF_UNCERTAIN, EFF_STALE,
]
DEFAULT_PRESENCE_STALE_SECONDS = 900
DEFAULT_ARRIVING_STABILIZE_SECONDS = 5
DEFAULT_LEAVING_STABILIZE_SECONDS = 60
DEFAULT_STABLE_AWAY_SECONDS = 120
DEFAULT_PROXIMITY_TREND_EPSILON_M = 25

# Bio
BIO_SLEEP = "sleep"
BIO_WAKING = "waking"
BIO_AWAKE = "awake"
BIO_STATES = [BIO_SLEEP, BIO_WAKING, BIO_AWAKE]

# Day state
DAY_EARLY_MORNING = "early_morning"
DAY_LATE_MORNING = "late_morning"
DAY_FORENOON = "forenoon"
DAY_AFTERNOON = "afternoon"
DAY_EARLY_EVENING = "early_evening"
DAY_LATE_EVENING = "late_evening"
DAY_EARLY_NIGHT = "early_night"
DAY_LATE_NIGHT = "late_night"
DAY_STATES = [
    DAY_EARLY_MORNING, DAY_LATE_MORNING, DAY_FORENOON, DAY_AFTERNOON,
    DAY_EARLY_EVENING, DAY_LATE_EVENING, DAY_EARLY_NIGHT, DAY_LATE_NIGHT,
]

# Day context
DC_WERKTAG = "werktag"
DC_WOCHENENDE = "wochenende"
DC_FREI = "frei"
DAY_CONTEXT_STATES = [DC_WERKTAG, DC_WOCHENENDE, DC_FREI]

# Activity state
ACT_IDLE = "idle"
ACT_SLEEP = "sleep"
ACT_WAKING = "waking"
ACT_FREE_TIME = "free_time"
ACT_WORK_HOME = "work_home"
ACT_WORK_AWAY = "work_away"
ACT_PRIVATE = "private_time"
ACT_HOUSEHOLD = "household"
# Activity v1 (PR2): reiche lokale Aktivität statt „alles Nicht-Idle → free_time".
# gaming/entertainment/music/pc_active fächern den früheren free_time-Sammeltopf
# auf. `away`/`bei_eltern`/`coming_home` sind bewusst KEINE Activity-Werte — die
# gehören zu Presence/Transition und später in `live_status`.
ACT_GAMING = "gaming"
ACT_ENTERTAINMENT = "entertainment"
ACT_MUSIC = "music"
ACT_PC_ACTIVE = "pc_active"
ACTIVITY_STATES = [
    ACT_SLEEP, ACT_WAKING, ACT_IDLE, ACT_FREE_TIME, ACT_WORK_HOME, ACT_WORK_AWAY,
    ACT_PRIVATE, ACT_HOUSEHOLD,
    ACT_GAMING, ACT_ENTERTAINMENT, ACT_MUSIC, ACT_PC_ACTIVE,
]

# --- Presence-Effective Activity-Hold (PR3) ----------------------------------
# Starke lokale Aktivität darf `presence_effective` bei rohem `abwesend` auf
# `home` HALTEN (assumed) — `presence_personal` bleibt unangetastet.
# `idle`/`sleep`/`waking`/`free_time` sind bewusst KEINE Hold-Aktivitäten
# (free_time konservativ = kein Hold).
#
# Far-Away-Bruch differenziert (siehe logic.apply_activity_hold):
#   HARTE Anker (pc_active/gaming/private_time/work_home/household) bedeuten bei
#     Benni sehr wahrscheinlich physische Anwesenheit / bewusste lokale Nutzung —
#     sie halten `home` AUCH bei `band == far` + Trend `away_from_home`.
#   WEICHE/ambiente Signale (music/entertainment) können vergessen weiterlaufen
#     (HomePods/Denon/TV) — bei bestätigtem Far-Away wird ihr Hold GEBROCHEN.
HOLD_NONE = "none"
HOLD_LOW = "low"
HOLD_MID = "mid"
HOLD_HIGH = "high"
ACTIVITY_HOLD_STRENGTH: dict[str, str] = {
    ACT_PRIVATE: HOLD_HIGH,
    ACT_GAMING: HOLD_HIGH,
    ACT_ENTERTAINMENT: HOLD_HIGH,
    ACT_WORK_HOME: HOLD_HIGH,
    ACT_MUSIC: HOLD_HIGH,
    ACT_PC_ACTIVE: HOLD_MID,
    ACT_HOUSEHOLD: HOLD_MID,
}
# Weiche/ambiente Hold-Aktivitäten: ihr Hold bricht bei bestätigtem Far-Away.
# Alle übrigen Hold-Aktivitäten sind harte Anker (halten trotz Far-Away).
SOFT_HOLD_ACTIVITIES: frozenset[str] = frozenset({ACT_MUSIC, ACT_ENTERTAINMENT})

# --- Profile (Route benni / eltern) ------------------------------------------

# Beim Hinzufügen der Integration wird die "Route" gewählt: dieselbe Codebasis,
# aber profil-spezifische Defaults (Prefill) und ein gespeichertes Label fürs
# Panel/Device. Logik bleibt (vorerst) identisch — Profil ist Vorarbeit für
# spätere, bewusst gegatete Verhaltens-Unterschiede.
CONF_PROFILE = "profile"
PROFILE_BENNI = "benni"
PROFILE_ELTERN = "eltern"
PROFILES = [PROFILE_BENNI, PROFILE_ELTERN]
DEFAULT_PROFILE = PROFILE_BENNI
PROFILE_LABELS = {PROFILE_BENNI: "Benni", PROFILE_ELTERN: "Eltern"}

# Per-Profil-Prefill: bekannte Live-IDs je Route. Greift nur, WENN die Entity in
# der jeweiligen HA existiert. "eltern" bewusst leer — wird befüllt, sobald die
# Eltern-Anlage real ist. (Konvention wie benni_light_policy: ENTITY_PREFILL.)
PROFILE_PREFILL: dict[str, dict[str, str]] = {
    PROFILE_BENNI: {
        CONF_GPS_PRIMARY: "device_tracker.benni_iphone_icloud3",
        CONF_GPS_SECONDARY: "device_tracker.iphone_von_benjamin",
        CONF_SSID_SOURCE: "sensor.iphone_von_benjamin_ssid",
        CONF_WLAN_ELTERN_1: "binary_sensor.benni_bei_eltern_wlan",
        # Proximity (Benjamin-spezifisch): Distanz in m + Richtung-Enum mit
        # Wert "towards" (= was die Logik für Annäherung erwartet). Aktiviert
        # Band/Preheat/Transition-nach-Distanz (in der Toolbox war das null).
        CONF_PROXIMITY_DISTANCE: "sensor.home_entfernung_von_iphone_von_benjamin",
        CONF_PROXIMITY_DIRECTION: "sensor.home_bewegung_von_iphone_von_benjamin",
        CONF_PC_ACTIVE: "sensor.benni_master_pc",
        CONF_WAKE_NEEDED: "binary_sensor.wake_planner_benni_wake_needed",
        CONF_WAKE_NEXT: "sensor.wake_planner_benni_next_wake",
        # FLEET-36 Cut-over: vom Toolbox-Modul benni_media_context auf den
        # extrahierten L1-Feeder benni_media_state (profil-getriebener Slug).
        CONF_MEDIA_CONTEXT: "sensor.benni_media_state_media_context",
        CONF_SOLAR_NOON: "sensor.system_sun2_solar_noon",
        # Activity v2 (PR2 / FLEET-256): Media-Hälfte aus dem media_state-Feed.
        # WICHTIG: stabiler Live-Slug mit system_-Präfix (neu registrierte Entity
        # erbt system_; nie auf den clean slug binden — Wurzel des v0.10.0-Bugs).
        CONF_MEDIA_ACTIVITY_CONTEXT: "sensor.system_benni_media_state_activity_context",
        # Debug-/Attribut-Echo (clean slug — bestehende media_state-Sensoren):
        CONF_ENTERTAINMENT_ACTIVE: "binary_sensor.benni_media_state_entertainment_active",
        CONF_MEDIA_DEVICE: "sensor.benni_media_state_media_device",
        CONF_GAMING_PLATFORM: "sensor.benni_media_state_gaming_platform",
        # Bewusst NICHT gebunden: kein echter Homeoffice-Indikator existiert →
        # CONF_HOMEOFFICE_PING bleibt leer (work_home ist geplant, nicht faked);
        # sensor.title_classifier_stash_enum (live 404) und sensor.psn_now_playing.
    },
    PROFILE_ELTERN: {},
}

LEGACY_ENTITY_MAP: Final[dict[str, str]] = {
    "sensor.benni_device_living_pc": "sensor.benni_master_pc",
}

# Heim-/Eltern-SSID-Sets je Profil. Getrennt von PROFILE_PREFILL (das sind
# Entity-IDs) — hier stehen WLAN-Namen-Listen. Override per Options-Flow möglich;
# fehlt der Override, propagiert die Repo-Liste (wie bei den Entity-Bindungen).
# Unbekannte SSID (Bruder/Schwester/Café) = kein Match → fällt auf GPS durch.
PROFILE_SSIDS: dict[str, dict[str, list[str]]] = {
    PROFILE_BENNI: {
        CONF_HOME_SSIDS: ["Einhornaufzuchtsfarm", "Einhornaufzuchtsstation"],
        CONF_PARENTS_SSIDS: ["Martin Router King 2"],
    },
    PROFILE_ELTERN: {},
}

# --- Storage -----------------------------------------------------------------

STORAGE_VERSION = 1


def storage_key(entry_id: str) -> str:
    """Eigener Storage-Key, NICHT der Toolbox-Key.

    Ergibt ``.storage/benni_core_state_state_<entry_id>`` und ist damit
    disjunkt vom Toolbox-Key ``bennis_toolbox_benni_context_state_<entry_id>``.
    """
    return f"{DOMAIN}_state_{entry_id}"


def unique_id(entry_id: str, suffix: str) -> str:
    """Eindeutige unique_id mit Domain-Präfix (kollisionsfrei zur Toolbox)."""
    return f"{DOMAIN}_{entry_id}_{suffix}"


# Coordinator update interval (seconds).
UPDATE_INTERVAL = 30

# --- Services ----------------------------------------------------------------

SERVICE_SET_BIO = "set_bio_state"
SERVICE_MARK_SLEEP = "mark_sleep"
SERVICE_MARK_AWAKE = "mark_awake"

# --- Panel / WebSocket-API (eigenes Dashboard-Frontend) ----------------------
# Muster wie benni_light_policy: statisch ausgeliefertes Vanilla-Lit-Frontend
# unter FRONTEND_DIR_URL + Custom-Panel in der Sidebar.
PANEL_URL_PATH = "benni_core_state"          # Sidebar-Eintrag
PANEL_TITLE = "Core State"
PANEL_ICON = "mdi:brain"
FRONTEND_DIR_URL = "/benni_core_state_app"   # statisch ausgelieferte App
FRONTEND_ENTRY = f"{FRONTEND_DIR_URL}/main.js"
PANEL_ELEMENT = "bcs-app"

# WS-Commands (Namespace = Domain).
WS_GET_STATUS = f"{DOMAIN}/get_status"

# hass.data[DOMAIN]-Flags für prozessweit-einmalige Registrierungen.
DATA_WS_REGISTERED = "_ws_registered"
DATA_VIEW_STATIC = "_view_static_registered"
DATA_VIEW_PANEL = "_view_panel_registered"

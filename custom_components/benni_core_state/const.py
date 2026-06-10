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
ACTIVITY_STATES = [
    ACT_SLEEP, ACT_WAKING, ACT_IDLE, ACT_FREE_TIME, ACT_WORK_HOME, ACT_WORK_AWAY,
    ACT_PRIVATE, ACT_HOUSEHOLD,
]

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
        CONF_WLAN_ELTERN_1: "binary_sensor.benni_bei_eltern_wlan",
        # Proximity (Benjamin-spezifisch): Distanz in m + Richtung-Enum mit
        # Wert "towards" (= was die Logik für Annäherung erwartet). Aktiviert
        # Band/Preheat/Transition-nach-Distanz (in der Toolbox war das null).
        CONF_PROXIMITY_DISTANCE: "sensor.home_entfernung_von_iphone_von_benjamin",
        CONF_PROXIMITY_DIRECTION: "sensor.home_bewegung_von_iphone_von_benjamin",
        CONF_PC_ACTIVE: "binary_sensor.living_pc_plug_power_active_atomic",
        CONF_WAKE_NEEDED: "binary_sensor.wake_planner_benni_wake_needed",
        CONF_WAKE_NEXT: "sensor.wake_planner_benni_next_wake",
        # FLEET-36 Cut-over: vom Toolbox-Modul benni_media_context auf den
        # extrahierten L1-Feeder benni_media_state (profil-getriebener Slug).
        CONF_MEDIA_CONTEXT: "sensor.benni_media_state_media_context",
        CONF_SOLAR_NOON: "sensor.system_sun2_solar_noon",
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

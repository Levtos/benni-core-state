"""DataUpdateCoordinator für Benni Core State.

Owns the computed state of every sensor. Computation lives in ``logic.py``
as pure functions; the coordinator's job is to gather raw HA inputs,
feed them through the logic, persist what must survive restarts, and
push the result.

Standalone-Extraktion des Toolbox-Moduls ``benni_context``:

* Storage: ``.storage/benni_core_state_state_<entry_id>`` (eigener Key, NICHT
  der alte Toolbox-Key — Shadow-Betrieb kollisionsfrei).
* Datenwurzel: ``hass.data[DOMAIN][entry_id] = coordinator`` (flach, ohne
  Umbrella-Bucket).
* Cross-Modul-Inputs (Wake Planner, Title Classifier …) werden **nicht** direkt
  importiert — sie kommen ausschließlich als konfigurierte HA-Entities in den
  Coordinator.
"""

from __future__ import annotations

from datetime import datetime, timedelta
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from . import logic
from .const import (
    CONF_COFFEE_ACTIVE,
    CONF_DOOR_WAKE,
    CONF_GPS_PRIMARY,
    CONF_GPS_SECONDARY,
    CONF_HOLIDAY_SENSOR,
    CONF_HOMEOFFICE_PING,
    CONF_HOME_RADIUS,
    CONF_HOME_SSIDS,
    CONF_HOUSEHOLD_SOURCE,
    CONF_HYSTERESIS_M,
    CONF_MEDIA_CONTEXT,
    CONF_PARENTS_SSIDS,
    CONF_NEAR_RADIUS,
    CONF_PC_ACTIVE,
    CONF_PREHEAT_DURATION,
    CONF_PREHEAT_RADIUS,
    CONF_PRIVATE_SOURCE,
    CONF_PROXIMITY_DIRECTION,
    CONF_PROXIMITY_DISTANCE,
    CONF_PS5_ACTIVE,
    CONF_SOLAR_NOON,
    CONF_SSID_SOURCE,
    CONF_TRACKER_FRESHNESS,
    CONF_TRANSITION_HOLD,
    CONF_WAKE_NEEDED,
    CONF_WAKE_NEXT,
    CONF_PROFILE,
    CONF_WLAN_BENNI,
    CONF_WLAN_ELTERN_1,
    CONF_WLAN_ELTERN_2,
    DEFAULT_HOME_RADIUS,
    DEFAULT_HYSTERESIS_M,
    DEFAULT_NEAR_RADIUS,
    DEFAULT_PREHEAT_DURATION,
    DEFAULT_PREHEAT_RADIUS,
    DEFAULT_PROFILE,
    DEFAULT_TRACKER_FRESHNESS,
    DEFAULT_TRANSITION_HOLD,
    DOMAIN,
    PERS_PARENTS,
    PROFILE_PREFILL,
    PROFILE_SSIDS,
    STORAGE_VERSION,
    UPDATE_INTERVAL,
    storage_key,
)
from .models import ComputedState, PersistentState

_LOGGER = logging.getLogger(__name__)


class BenniCoreStateCoordinator(DataUpdateCoordinator[ComputedState]):
    """Drive every Benni-Core-State sensor from a single computation step."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_{entry.entry_id}",
            update_interval=timedelta(seconds=UPDATE_INTERVAL),
        )
        self.entry = entry
        self._store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION, storage_key(entry.entry_id)
        )
        self._persistent = PersistentState()
        self._unsub_listeners: list[CALLBACK_TYPE] = []
        # Last "real" presence (not bei_eltern). Used to detect genuine
        # coming_home transitions.
        self._last_real_presence: str | None = None

    # ----------------------------------------------------------------- config

    def _opt(self, key: str, default: Any) -> Any:
        return self.entry.options.get(key, self.entry.data.get(key, default))

    @property
    def profile(self) -> str:
        return self.entry.data.get(CONF_PROFILE, DEFAULT_PROFILE)

    def _entity_id(self, key: str) -> str | None:
        """Auto-Bind: Override (options/data) gewinnt, sonst Profil-Map (Code).

        So binden Inputs automatisch aus dem Profil-Map; nur echte Abweichungen
        liegen im Config-Entry. Map-Updates aus dem Repo propagieren dadurch auf
        alle Anlagen, die den Slot nicht überschrieben haben.
        """
        return (
            self.entry.options.get(key)
            or self.entry.data.get(key)
            or PROFILE_PREFILL.get(self.profile, {}).get(key)
        )

    def _ssid_set(self, key: str) -> list[str]:
        """Anchor-SSID-Liste: Override (options/data) gewinnt, sonst Profil-Map.

        Spiegelt ``_entity_id``-Präzedenz, nur für WLAN-Namen-Listen statt
        Entity-IDs. Leere/whitespace-Werte werden verworfen.
        """
        raw = (
            self.entry.options.get(key)
            or self.entry.data.get(key)
            or PROFILE_SSIDS.get(self.profile, {}).get(key)
            or []
        )
        if isinstance(raw, str):
            raw = [raw]
        return [str(s).strip() for s in raw if str(s).strip()]

    @property
    def home_radius(self) -> float:
        return float(self._opt(CONF_HOME_RADIUS, DEFAULT_HOME_RADIUS))

    @property
    def preheat_radius(self) -> float:
        return float(self._opt(CONF_PREHEAT_RADIUS, DEFAULT_PREHEAT_RADIUS))

    @property
    def near_radius(self) -> float:
        return float(self._opt(CONF_NEAR_RADIUS, DEFAULT_NEAR_RADIUS))

    @property
    def hysteresis_m(self) -> float:
        return float(self._opt(CONF_HYSTERESIS_M, DEFAULT_HYSTERESIS_M))

    @property
    def preheat_duration(self) -> int:
        return int(self._opt(CONF_PREHEAT_DURATION, DEFAULT_PREHEAT_DURATION))

    @property
    def tracker_freshness(self) -> int:
        return int(self._opt(CONF_TRACKER_FRESHNESS, DEFAULT_TRACKER_FRESHNESS))

    @property
    def transition_hold(self) -> int:
        return int(self._opt(CONF_TRANSITION_HOLD, DEFAULT_TRANSITION_HOLD))

    def _watched_entity_ids(self) -> list[str]:
        keys = [
            CONF_GPS_PRIMARY, CONF_GPS_SECONDARY, CONF_WLAN_BENNI,
            CONF_SSID_SOURCE,
            CONF_WLAN_ELTERN_1, CONF_WLAN_ELTERN_2,
            CONF_PROXIMITY_DISTANCE, CONF_PROXIMITY_DIRECTION,
            CONF_WAKE_NEXT, CONF_WAKE_NEEDED,
            CONF_PC_ACTIVE, CONF_PS5_ACTIVE, CONF_COFFEE_ACTIVE, CONF_DOOR_WAKE,
            CONF_MEDIA_CONTEXT, CONF_PRIVATE_SOURCE, CONF_HOMEOFFICE_PING,
            CONF_HOLIDAY_SENSOR, CONF_HOUSEHOLD_SOURCE, CONF_SOLAR_NOON,
        ]
        ids: list[str] = []
        for k in keys:
            v = self._entity_id(k)
            if isinstance(v, str) and v:
                ids.append(v)
        return ids

    # ---------------------------------------------------------------- storage

    async def async_load_stored(self) -> None:
        raw = await self._store.async_load()
        self._persistent = PersistentState.from_dict(raw)

    async def _async_save(self) -> None:
        await self._store.async_save(self._persistent.to_dict())

    # -------------------------------------------------------------- listeners

    @callback
    def async_start_listeners(self) -> None:
        ids = self._watched_entity_ids()
        if ids:
            self._unsub_listeners.append(
                async_track_state_change_event(self.hass, ids, self._handle_state_change)
            )

    @callback
    def async_stop_listeners(self) -> None:
        for unsub in self._unsub_listeners:
            unsub()
        self._unsub_listeners.clear()

    @callback
    def _handle_state_change(self, event: Event) -> None:
        self.hass.async_create_task(self.async_request_refresh())

    # ------------------------------------------------------------------ read

    def _read_entity(self, key: str) -> tuple[str | None, datetime | None, dict[str, Any]]:
        eid = self._entity_id(key)
        if not eid:
            return None, None, {}
        state = self.hass.states.get(eid)
        if state is None:
            return None, None, {}
        return state.state, state.last_changed, dict(state.attributes)

    def _read_float(self, key: str) -> float | None:
        val, _, _ = self._read_entity(key)
        if val in (None, "unknown", "unavailable", ""):
            return None
        try:
            return float(val)
        except (TypeError, ValueError):
            return None

    def _read_bool(self, key: str) -> bool:
        val, _, _ = self._read_entity(key)
        if val is None:
            return False
        return str(val).lower() in ("on", "true", "home", "1", "yes", "active")

    # --------------------------------------------------------------- compute

    async def _async_update_data(self) -> ComputedState:
        now = dt_util.utcnow()

        # --- raw inputs ----------------------------------------------------
        gps_primary, gps_primary_ts, _ = self._read_entity(CONF_GPS_PRIMARY)
        gps_secondary, gps_secondary_ts, _ = self._read_entity(CONF_GPS_SECONDARY)
        wlan_benni, wlan_benni_ts, _ = self._read_entity(CONF_WLAN_BENNI)
        wlan_e1, wlan_e1_ts, _ = self._read_entity(CONF_WLAN_ELTERN_1)
        wlan_e2, wlan_e2_ts, _ = self._read_entity(CONF_WLAN_ELTERN_2)
        ssid, ssid_ts, _ = self._read_entity(CONF_SSID_SOURCE)
        home_ssids = self._ssid_set(CONF_HOME_SSIDS)
        parents_ssids = self._ssid_set(CONF_PARENTS_SSIDS)
        prox_dist_raw, prox_dist_ts, _ = self._read_entity(CONF_PROXIMITY_DISTANCE)
        prox_dist = _float_or_none(prox_dist_raw)
        prox_dir, prox_dir_ts, _ = self._read_entity(CONF_PROXIMITY_DIRECTION)

        # --- presence_personal --------------------------------------------
        presence_personal = logic.compute_presence_personal(
            ssid=ssid, home_ssids=home_ssids, parents_ssids=parents_ssids,
            wlan_benni=wlan_benni, wlan_benni_ts=wlan_benni_ts,
            wlan_eltern_1=wlan_e1, wlan_eltern_2=wlan_e2,
            gps_primary=gps_primary, gps_primary_ts=gps_primary_ts,
            gps_secondary=gps_secondary, gps_secondary_ts=gps_secondary_ts,
            now=now, freshness_s=self.tracker_freshness,
            prev_personal=self._persistent.last_presence_personal,
        )
        # Retain the decided value across restarts (rule 7 reads it back on the
        # first post-boot compute, before trackers have restored).
        self._persistent.last_presence_personal = presence_personal

        external_occupied = self._read_bool(CONF_HOUSEHOLD_SOURCE)
        presence_household = logic.compute_presence_household(
            presence_personal, external_occupied
        )

        prev_band = self.data.presence_band if self.data is not None else None
        presence_band = logic.compute_presence_band(
            distance_m=prox_dist, presence_personal=presence_personal,
            home_r=self.home_radius, preheat_r=self.preheat_radius,
            near_r=self.near_radius, hysteresis_m=self.hysteresis_m,
            prev_band=prev_band,
        )

        person_source_ts = _latest_datetime(
            gps_primary_ts, gps_secondary_ts, wlan_benni_ts, wlan_e1_ts, wlan_e2_ts, ssid_ts
        )
        band_source_ts = prox_dist_ts if prox_dist is not None else person_source_ts
        effective = logic.compute_effective_presence(
            presence_personal=presence_personal,
            home_band=presence_band,
            distance_m=prox_dist,
            direction=prox_dir,
            now=now,
            person_source_ts=person_source_ts,
            band_source_ts=band_source_ts,
            distance_ts=prox_dist_ts,
            direction_ts=prox_dir_ts,
            previous_distance_m=self._persistent.last_proximity_distance,
            previous_effective=self._persistent.effective_presence,
            previous_candidate=self._persistent.effective_candidate,
            previous_candidate_started_at=_parse_iso(
                self._persistent.effective_candidate_started
            ),
            last_home_at=_parse_iso(self._persistent.last_effective_home_at),
            last_away_at=_parse_iso(self._persistent.last_effective_away_at),
        )
        self._persistent.effective_presence = effective.effective_presence
        self._persistent.effective_candidate = effective.candidate_state
        self._persistent.effective_candidate_started = (
            effective.candidate_started_at.isoformat()
            if effective.candidate_started_at else None
        )
        self._persistent.last_effective_home_at = (
            effective.last_home_at.isoformat() if effective.last_home_at else None
        )
        self._persistent.last_effective_away_at = (
            effective.last_away_at.isoformat() if effective.last_away_at else None
        )
        if prox_dist is not None:
            self._persistent.last_proximity_distance = prox_dist
            self._persistent.last_proximity_distance_at = (
                prox_dist_ts.isoformat() if prox_dist_ts else now.isoformat()
            )

        new_trans, trans_started = logic.compute_transition(
            prev_band=prev_band, new_band=presence_band,
            prev_personal=self._last_real_presence,
            new_personal=presence_personal,
            direction=prox_dir,
            prev_transition=self._persistent.transition_state,
            prev_started=_parse_iso(self._persistent.transition_started),
            now=now, hold_s=self.transition_hold,
        )
        self._persistent.transition_state = new_trans
        self._persistent.transition_started = (
            trans_started.isoformat() if trans_started else None
        )

        preheat_active, preheat_source, preheat_started = logic.compute_preheat(
            band=presence_band, direction=prox_dir,
            presence_personal=presence_personal,
            prev_active=self._persistent.preheat_active,
            prev_started=_parse_iso(self._persistent.preheat_started),
            now=now, max_duration_s=self.preheat_duration,
        )
        self._persistent.preheat_active = preheat_active
        self._persistent.preheat_source = preheat_source
        self._persistent.preheat_started = (
            preheat_started.isoformat() if preheat_started else None
        )

        wake_needed = self._read_bool(CONF_WAKE_NEEDED)
        wake_next_raw, _, _ = self._read_entity(CONF_WAKE_NEXT)
        wake_indicator_sources = {
            "pc": CONF_PC_ACTIVE,
            "ps5": CONF_PS5_ACTIVE,
            "coffee": CONF_COFFEE_ACTIVE,
            "door": CONF_DOOR_WAKE,
            "homeoffice": CONF_HOMEOFFICE_PING,
        }
        wake_indicators = {
            key: self._read_bool(conf)
            for key, conf in wake_indicator_sources.items()
        }
        wake_indicator_active_since = {}
        for key, conf in wake_indicator_sources.items():
            entity_id = self._entity_id(conf)
            state = self.hass.states.get(entity_id) if entity_id else None
            wake_indicator_active_since[key] = (
                state.last_changed if wake_indicators[key] and state is not None else None
            )
        local_now = dt_util.as_local(now)
        solar_noon_raw, _, _ = self._read_entity(CONF_SOLAR_NOON)
        solar_noon = _parse_local_datetime(solar_noon_raw, local_now)
        solar_noon_source = self._entity_id(CONF_SOLAR_NOON) if solar_noon else None
        if solar_noon is None:
            sun = self.hass.states.get("sun.sun")
            if sun is not None:
                solar_noon = _parse_local_datetime(
                    sun.attributes.get("next_noon"), local_now
                )
                if solar_noon is not None:
                    solar_noon_source = "sun.sun.next_noon"
        day_state = logic.compute_day_state(local_now, solar_noon)
        day_phase_starts = logic.compute_day_phase_starts(local_now, solar_noon)
        new_bio, sleep_start, awake_start = logic.compute_bio_state(
            prev_state=self._persistent.bio_state,
            wake_needed=wake_needed,
            indicators=wake_indicators,
            presence_personal=presence_personal,
            day_state=day_state,
            now=now,
            prev_sleep_start=_parse_iso(self._persistent.last_sleep_start),
            prev_awake_start=_parse_iso(self._persistent.last_awake_start),
            indicator_active_since=wake_indicator_active_since,
        )
        self._persistent.bio_state = new_bio
        self._persistent.last_sleep_start = (
            sleep_start.isoformat() if sleep_start else None
        )
        self._persistent.last_awake_start = (
            awake_start.isoformat() if awake_start else None
        )

        holiday = self._read_bool(CONF_HOLIDAY_SENSOR)
        day_context = logic.compute_day_context(local_now, holiday)

        media_ctx, _, _ = self._read_entity(CONF_MEDIA_CONTEXT)
        private_active = self._read_bool(CONF_PRIVATE_SOURCE)
        homeoffice = self._read_bool(CONF_HOMEOFFICE_PING)
        activity = logic.compute_activity(
            bio=new_bio, presence_personal=presence_personal,
            day_context=day_context, day_state=day_state,
            homeoffice=homeoffice, private_active=private_active,
            household_active=external_occupied, media_context=media_ctx,
        )

        master = ".".join(
            [presence_personal, new_bio, day_state, day_context, activity]
        )

        if presence_personal != PERS_PARENTS:
            self._last_real_presence = presence_personal

        await self._async_save()

        attrs = {
            "presence_personal": {
                "ssid": ssid,
                "ssid_is_home": logic._ssid_matches(ssid, home_ssids),
                "ssid_is_parents": logic._ssid_matches(ssid, parents_ssids),
                "home_ssids": home_ssids,
                "parents_ssids": parents_ssids,
                "wlan_benni": wlan_benni,
                "wlan_eltern_1": wlan_e1,
                "wlan_eltern_2": wlan_e2,
                "gps_primary": gps_primary,
                "gps_secondary": gps_secondary,
                "freshness_s": self.tracker_freshness,
            },
            "presence_band": {
                "distance_m": prox_dist,
                "home_radius": self.home_radius,
                "preheat_radius": self.preheat_radius,
                "near_radius": self.near_radius,
                "hysteresis_m": self.hysteresis_m,
            },
            "presence_transition": {
                "started": self._persistent.transition_started,
                "direction": prox_dir,
            },
            "presence_effective": logic.effective_presence_attrs(effective),
            "preheat": {
                "source": preheat_source,
                "started": self._persistent.preheat_started,
                "max_duration_s": self.preheat_duration,
            },
            "bio_state": {
                "last_sleep_start": self._persistent.last_sleep_start,
                "last_awake_start": self._persistent.last_awake_start,
                "wake_needed": wake_needed,
                "wake_next": wake_next_raw,
                **{f"indicator_{k}": v for k, v in wake_indicators.items()},
                **{
                    f"indicator_{k}_active_since": (
                        active_since.isoformat() if active_since else None
                    )
                    for k, active_since in wake_indicator_active_since.items()
                },
            },
            "day_state": {
                "solar_noon": solar_noon.isoformat() if solar_noon else None,
                "phase_starts": {
                    phase: day_phase_starts[phase].strftime("%H:%M:%S")
                    for phase in logic.DAY_PHASE_ORDER
                },
                "source": solar_noon_source or "fallback",
            },
            "activity_state": {
                "media_context": media_ctx,
                "homeoffice": homeoffice,
                "private": private_active,
                "household": external_occupied,
            },
            "master_context": {
                "presence": presence_personal,
                "bio": new_bio,
                "day_state": day_state,
                "day_context": day_context,
                "activity": activity,
            },
        }

        return ComputedState(
            presence_personal=presence_personal,
            presence_household=presence_household,
            presence_band=presence_band,
            presence_transition=new_trans,
            presence_effective=effective.effective_presence,
            presence_effective_transition=effective.transition,
            preheat_active=preheat_active,
            preheat_source=preheat_source,
            preheat_started=self._persistent.preheat_started,
            bio_state=new_bio,
            last_sleep_start=self._persistent.last_sleep_start,
            last_awake_start=self._persistent.last_awake_start,
            day_state=day_state,
            day_context=day_context,
            activity_state=activity,
            master_context=master,
            attrs=attrs,
        )


def _parse_iso(raw: str | None) -> datetime | None:
    if not raw:
        return None


def _float_or_none(raw: Any) -> float | None:
    if raw in (None, "unknown", "unavailable", ""):
        return None
    try:
        return float(raw)
    except (TypeError, ValueError):
        return None


def _latest_datetime(*values: datetime | None) -> datetime | None:
    present = [value for value in values if value is not None]
    return max(present) if present else None


def _parse_local_datetime(raw: Any, local_now: datetime) -> datetime | None:
    if raw in (None, "unknown", "unavailable", ""):
        return None
    if isinstance(raw, datetime):
        parsed = raw
    else:
        parsed = dt_util.parse_datetime(str(raw))
        if parsed is None:
            for fmt in ("%H:%M:%S", "%H:%M"):
                try:
                    parsed_time = datetime.strptime(str(raw), fmt).time()
                except ValueError:
                    continue
                return local_now.replace(
                    hour=parsed_time.hour,
                    minute=parsed_time.minute,
                    second=parsed_time.second,
                    microsecond=0,
                )
            return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=local_now.tzinfo)
    return dt_util.as_local(parsed)


# ----------------------------------------------------------------- lookups


def coordinator_from_hass(
    hass: HomeAssistant, entry_id: str
) -> BenniCoreStateCoordinator | None:
    return hass.data.get(DOMAIN, {}).get(entry_id)


def all_coordinators(hass: HomeAssistant) -> list[BenniCoreStateCoordinator]:
    return [
        c
        for c in hass.data.get(DOMAIN, {}).values()
        if isinstance(c, BenniCoreStateCoordinator)
    ]

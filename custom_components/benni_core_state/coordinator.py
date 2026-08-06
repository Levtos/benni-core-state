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
    ACTIVITY_HOLD_STRENGTH,
    BIO_AWAKE,
    BIO_PROVISIONAL_SLEEP,
    BIO_SLEEP,
    BIO_WAKING,
    CONF_COFFEE_ACTIVE,
    CONF_DOOR_WAKE,
    CONF_ENTERTAINMENT_ACTIVE,
    CONF_GAMING_PLATFORM,
    CONF_GPS_PRIMARY,
    CONF_GPS_SECONDARY,
    CONF_HOLIDAY_ACTIVE,
    CONF_HOLIDAY_SENSOR,
    CONF_HOMEOFFICE_PING,
    CONF_HOME_RADIUS,
    CONF_HOME_SSIDS,
    CONF_HOUSEHOLD_SOURCE,
    CONF_HYSTERESIS_M,
    CONF_MEDIA_ACTIVITY_CONTEXT,
    CONF_MEDIA_CONTEXT,
    CONF_MEDIA_DEVICE,
    CONF_MINIMUM_SLEEP_MINUTES,
    CONF_PARENTS_SSIDS,
    CONF_NEAR_RADIUS,
    CONF_PC_ACTIVE,
    CONF_PREHEAT_DURATION,
    CONF_PREHEAT_RADIUS,
    CONF_PRIVATE_SOURCE,
    CONF_PROVISIONAL_LEAD_MINUTES,
    CONF_PROXIMITY_DIRECTION,
    CONF_PROXIMITY_DISTANCE,
    CONF_PS5_ACTIVE,
    CONF_SSID_SOURCE,
    CONF_TRACKER_FRESHNESS,
    CONF_TRANSITION_HOLD,
    CONF_WAKE_NEEDED,
    CONF_WAKE_NEXT,
    CONF_WAKE_STATE,
    CONF_WAKE_FLOOR,
    CONF_WAKE_WINDOW_MINUTES,
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
    DEFAULT_WAKE_FLOOR,
    DEFAULT_WAKE_WINDOW_MINUTES,
    DEFAULT_WAKING_TIMEOUT_MINUTES,
    DOMAIN,
    PERS_AWAY,
    PERS_PARENTS,
    PROFILE_PREFILL,
    PROFILE_SSIDS,
    STORAGE_VERSION,
    UPDATE_INTERVAL,
    storage_key,
)
from .models import ComputedState, PersistentState
from .mapping import MAPPING_CONTRACT_VERSION, mapping_diagnostics
from . import sleep_window, wake_planning

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
            CONF_WAKE_NEXT, CONF_WAKE_NEEDED, CONF_WAKE_STATE, CONF_HOLIDAY_ACTIVE,
            CONF_PC_ACTIVE, CONF_PS5_ACTIVE, CONF_COFFEE_ACTIVE, CONF_DOOR_WAKE,
            CONF_MEDIA_CONTEXT, CONF_PRIVATE_SOURCE, CONF_HOMEOFFICE_PING,
            CONF_HOLIDAY_SENSOR, CONF_HOUSEHOLD_SOURCE,
            # Activity v2 (PR2 / FLEET-256): der media_state-Feed treibt die
            # Media-Aktivität; entertainment/gaming_platform/media_device bleiben
            # nur als Debug-Echo (kein Roh-HomePods/Denon/Stash mehr).
            CONF_MEDIA_ACTIVITY_CONTEXT, CONF_ENTERTAINMENT_ACTIVE,
            CONF_GAMING_PLATFORM, CONF_MEDIA_DEVICE,
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
        return _state_is_true(val)

    def _compute_wake_shadow(
        self,
        *,
        local_now: datetime,
        day_state: str,
        wake_state_raw: str | None,
        wake_state_ts: datetime | None,
        wake_state_attrs: dict[str, Any],
        wake_next_raw: str | None,
        legacy_wake_needed: bool | None,
        legacy_holiday_raw: str | None,
        legacy_holiday_ts: datetime | None,
        holiday_raw: str | None,
        holiday_ts: datetime | None,
    ) -> tuple[wake_planning.WakePlan, wake_planning.ShadowComparison]:
        """Build the #26 shadow from selected inputs without changing Bio."""

        parsed_rules = wake_planning.parse_rules(wake_state_attrs.get("rules"))
        rules = parsed_rules.rules or wake_planning.default_rules()
        rules_quality = "fresh" if parsed_rules.rules else (
            "invalid" if parsed_rules.invalid_reasons and "rules_missing" not in parsed_rules.invalid_reasons
            else "missing"
        )
        rules_source = self._entity_id(CONF_WAKE_STATE) or "internal:default_rules"

        window_raw = self._opt(
            CONF_WAKE_WINDOW_MINUTES,
            wake_state_attrs.get("wake_window_minutes", DEFAULT_WAKE_WINDOW_MINUTES),
        )
        try:
            window_minutes = int(window_raw)
            if not 0 <= window_minutes <= 120:
                raise ValueError
            window_quality = "fresh"
        except (TypeError, ValueError):
            window_minutes = None
            window_quality = "invalid"

        floor_raw = self._opt(CONF_WAKE_FLOOR, DEFAULT_WAKE_FLOOR)
        floor_time = wake_planning.parse_time(floor_raw)
        floor_quality = "fresh" if floor_time is not None else "invalid"

        holiday_valid = holiday_raw not in (None, "", "unknown", "unavailable")
        holiday_quality = "fresh" if holiday_valid else "unavailable"
        holidays = wake_planning.parse_manual_holiday_dates(
            wake_state_attrs.get("manual_holiday_dates"),
            local_now.date(),
            local_now.date() + timedelta(days=wake_planning.DEFAULT_HORIZON_DAYS),
        )
        if holiday_valid and _state_is_true(holiday_raw):
            holidays[local_now.date()] = wake_planning.WakeHoliday(
                is_holiday=True,
                name="Holiday calendar",
                source="configured:holiday_sensor",
                quality="fresh",
            )

        calendar_events = wake_state_attrs.get("calendar_events")
        calendar_decisions = (
            wake_planning.calendar_decisions_from_events(calendar_events)
            if isinstance(calendar_events, (list, tuple))
            else {}
        )
        calendar_status = wake_planning.WakeInputStatus(
            name="calendar",
            source="L1:calendar_input" if calendar_decisions else "not_configured",
            quality="fresh" if calendar_decisions else "not_configured",
            available=bool(calendar_decisions),
            optional=True,
            reason="calendar_markers_selected_by_L1" if calendar_decisions else "no_calendar_input",
        )

        conflict_behavior = wake_state_attrs.get(
            "calendar_conflict_behavior", wake_planning.CONFLICT_WARN_ONLY
        )
        if conflict_behavior not in wake_planning.CONFLICT_BEHAVIORS:
            conflict_behavior = wake_planning.CONFLICT_WARN_ONLY
        holiday_behavior = wake_state_attrs.get(
            "holiday_behavior", wake_planning.HOLIDAY_SKIP
        )
        if holiday_behavior not in {
            wake_planning.HOLIDAY_SKIP,
            wake_planning.HOLIDAY_WEEKEND_PROFILE,
        }:
            holiday_behavior = wake_planning.HOLIDAY_SKIP
        try:
            routine_duration = int(
                wake_state_attrs.get(
                    "routine_duration_minutes",
                    wake_state_attrs.get("routine_duration", 60),
                )
            )
        except (TypeError, ValueError):
            routine_duration = 60

        minimum_sleep_minutes = _positive_int(
            self._persistent.minimum_sleep_minutes
            if self._persistent.minimum_sleep_minutes is not None
            else self._opt(
                CONF_MINIMUM_SLEEP_MINUTES,
                wake_state_attrs.get("minimum_sleep_minutes"),
            )
        )
        source_status = (
            wake_planning.WakeInputStatus(
                name="local_time",
                source="home_assistant:local_civil_time",
                quality="fresh",
            ),
            wake_planning.WakeInputStatus(
                name="calendar_date",
                source="home_assistant:local_calendar_date",
                quality="fresh",
            ),
            wake_planning.WakeInputStatus(
                name="day_state",
                source="internal:logic.compute_day_state",
                quality="fresh" if day_state else "missing",
                available=bool(day_state),
                reason="canonical_day_state_input",
            ),
            wake_planning.WakeInputStatus(
                name="rules",
                source=rules_source,
                quality=rules_quality,
                available=bool(parsed_rules.rules),
                observed_at=wake_state_ts,
                reason=(
                    "legacy_rules_selected"
                    if parsed_rules.rules
                    else "default_rules_fallback;invalid_or_missing_legacy_rules"
                ),
            ),
            wake_planning.WakeInputStatus(
                name="holiday",
                source=self._entity_id(CONF_HOLIDAY_SENSOR) or "not_configured",
                quality=holiday_quality,
                available=holiday_valid,
                observed_at=holiday_ts,
                optional=True,
                reason="holiday_and_vacation_use_one_day_off_contract",
            ),
            wake_planning.WakeInputStatus(
                name="wake_window",
                source=(
                    "wake_planner:configured_window"
                    if wake_state_attrs.get("wake_window_minutes") is not None
                    else "core_state:configured_window"
                ),
                quality=window_quality,
                available=window_minutes is not None,
                reason="inclusive_window_for_wake_needed",
            ),
            wake_planning.WakeInputStatus(
                name="floor",
                source="core_state:configured_absolute_floor",
                quality=floor_quality,
                available=floor_time is not None,
                reason="local_06_floor_is_independent_of_day_state_and_sunrise",
            ),
            calendar_status,
        )
        inputs = wake_planning.WakePlanningInputs(
            now=local_now,
            day_state=day_state,
            rules=rules,
            calendar_decisions=calendar_decisions,
            holidays=holidays,
            wake_window_minutes=window_minutes,
            routine_duration_minutes=routine_duration,
            floor_time=floor_time,
            calendar_conflict_behavior=conflict_behavior,
            holiday_behavior=holiday_behavior,
            source_status=source_status,
            minimum_sleep_minutes=minimum_sleep_minutes,
        )
        plan = wake_planning.plan_wake(inputs)

        legacy_holiday_valid = legacy_holiday_raw not in (
            None,
            "",
            "unknown",
            "unavailable",
        )
        legacy = wake_planning.legacy_reference_from_values(
            state=wake_state_raw,
            wake_time=wake_state_attrs.get("wake_time"),
            next_wake=wake_next_raw,
            wake_needed=legacy_wake_needed,
            holiday_active=(
                _state_is_true(legacy_holiday_raw) if legacy_holiday_valid else None
            ),
            now=local_now,
            source=self._entity_id(CONF_WAKE_STATE) or "legacy:ha_wake_planner",
            quality="fresh" if wake_state_raw not in (None, "unknown", "unavailable") else "unavailable",
            manual_control_active=bool(
                wake_state_attrs.get("skip_active")
                or wake_state_attrs.get("override_time")
            ),
        )
        return plan, wake_planning.compare_shadow(plan, legacy)

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

        wake_needed_raw, _, _ = self._read_entity(CONF_WAKE_NEEDED)
        wake_needed = _state_is_true(wake_needed_raw)
        wake_next_raw, _, _ = self._read_entity(CONF_WAKE_NEXT)
        wake_state_raw, wake_state_ts, wake_state_attrs = self._read_entity(CONF_WAKE_STATE)
        legacy_holiday_raw, legacy_holiday_ts, _ = self._read_entity(CONF_HOLIDAY_ACTIVE)
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
        day_state = logic.compute_day_state(local_now)
        day_phase_diagnostics = logic.compute_day_phase_diagnostics(
            local_now, day_state
        )

        holiday_raw, holiday_ts, _ = self._read_entity(CONF_HOLIDAY_SENSOR)
        holiday = _state_is_true(holiday_raw)
        day_context = logic.compute_day_context(local_now, holiday)

        wake_plan, wake_comparison = self._compute_wake_shadow(
            local_now=local_now,
            day_state=day_state,
            wake_state_raw=wake_state_raw,
            wake_state_ts=wake_state_ts,
            wake_state_attrs=wake_state_attrs,
            wake_next_raw=wake_next_raw,
            legacy_wake_needed=(
                wake_needed
                if wake_needed_raw not in (None, "", "unknown", "unavailable")
                else None
            ),
            legacy_holiday_raw=legacy_holiday_raw,
            legacy_holiday_ts=legacy_holiday_ts,
            holiday_raw=holiday_raw,
            holiday_ts=holiday_ts,
        )
        scheduled_wake = _scheduled_wake_for_sleep(wake_plan, local_now)
        confirmed_sleep_start = (
            _parse_iso(self._persistent.last_sleep_start)
            if self._persistent.bio_state == BIO_SLEEP
            else None
        )
        sleep_plan = sleep_window.plan_sleep_window(
            now=local_now,
            scheduled_wake=scheduled_wake,
            wake_window_minutes=wake_plan.wake_window_minutes,
            manual_sleep_start=(
                dt_util.as_local(confirmed_sleep_start)
                if confirmed_sleep_start is not None
                else None
            ),
            minimum_sleep_minutes=wake_plan.minimum_sleep_minutes,
            provisional_lead_minutes=_positive_int(
                self._persistent.provisional_lead_minutes
                if self._persistent.provisional_lead_minutes is not None
                else self._opt(
                    CONF_PROVISIONAL_LEAD_MINUTES,
                    wake_state_attrs.get(
                        "provisional_lead_minutes",
                        wake_state_attrs.get("max_assumed_sleep_minutes"),
                    ),
                )
            ),
            wake_source_status=wake_plan.source_status,
            wake_source_quality=wake_plan.source_quality,
        )

        previous_bio = self._persistent.bio_state
        waking_started = (
            _parse_iso(self._persistent.last_waking_start)
            if previous_bio == BIO_WAKING
            else None
        )
        waking_start_recovered = previous_bio == BIO_WAKING and waking_started is None
        if waking_start_recovered:
            waking_started = now
            self._persistent.last_waking_start = now.isoformat()

        regular_interaction = logic.regular_wake_interaction(
            indicators=wake_indicators,
            day_state=day_state,
            indicator_active_since=wake_indicator_active_since,
            sleep_started=_parse_iso(self._persistent.last_sleep_start),
        )
        new_bio, sleep_start, awake_start = logic.compute_bio_state(
            prev_state=previous_bio,
            wake_needed=wake_needed,
            indicators=wake_indicators,
            presence_personal=presence_personal,
            day_state=day_state,
            now=now,
            prev_sleep_start=_parse_iso(self._persistent.last_sleep_start),
            prev_awake_start=_parse_iso(self._persistent.last_awake_start),
            indicator_active_since=wake_indicator_active_since,
            provisional_active=sleep_plan.provisional_active,
            wake_due=sleep_plan.wake_due if sleep_plan.available else None,
            waking_started=waking_started,
            waking_timeout_minutes=DEFAULT_WAKING_TIMEOUT_MINUTES,
        )
        if new_bio == BIO_WAKING and previous_bio != BIO_WAKING:
            waking_started = now
            self._persistent.last_waking_start = now.isoformat()
        if (
            new_bio == BIO_PROVISIONAL_SLEEP
            and previous_bio != BIO_PROVISIONAL_SLEEP
        ):
            self._persistent.last_provisional_sleep_start = now.isoformat()
        self._persistent.bio_state = new_bio
        self._persistent.last_sleep_start = (
            sleep_start.isoformat() if sleep_start else None
        )
        self._persistent.last_awake_start = (
            awake_start.isoformat() if awake_start else None
        )
        bio_reason = _bio_transition_reason(
            previous=previous_bio,
            current=new_bio,
            presence_personal=presence_personal,
            sleep_reason=sleep_plan.reason,
            waking_started=waking_started,
            now=now,
            recovered_start=waking_start_recovered,
            regular_interaction=regular_interaction,
        )

        media_ctx, _, _ = self._read_entity(CONF_MEDIA_CONTEXT)
        private_active = self._read_bool(CONF_PRIVATE_SOURCE)
        homeoffice = self._read_bool(CONF_HOMEOFFICE_PING)
        pc_active = self._read_bool(CONF_PC_ACTIVE)
        # Activity v2 (PR2 / FLEET-256): Media-Hälfte kommt aus EINEM media_state-
        # Feed. Core liest keine Roh-Player/Denon/Stash mehr (keine Doppel-
        # Detektion, kein Roh-Fallback). Feed-State = Media-Bucket, Attribute nur
        # Debug/Provenienz. Fehlt/unavailable → kein Media-Bucket (kein Crash).
        feed_state, _, feed_attrs = self._read_entity(CONF_MEDIA_ACTIVITY_CONTEXT)
        feed_available = feed_state not in (None, "unknown", "unavailable", "")
        # entertainment/gaming_platform/media_device bleiben Debug-Echo (Attribut).
        entertainment_active = self._read_bool(CONF_ENTERTAINMENT_ACTIVE)
        gaming_platform, _, _ = self._read_entity(CONF_GAMING_PLATFORM)
        media_device, _, _ = self._read_entity(CONF_MEDIA_DEVICE)
        # music_active/hold_strength/reason etc. aus dem Feed (nur Attribut).
        media_music_active = bool(feed_attrs.get("music_active")) if feed_available else False
        activity = logic.compute_activity(
            bio=new_bio, presence_personal=presence_personal,
            day_context=day_context, day_state=day_state,
            homeoffice=homeoffice, private_active=private_active,
            household_active=external_occupied,
            media_activity=feed_state if feed_available else None,
            pc_active=pc_active,
        )
        media_bucket = logic.media_bucket_from_feed(feed_state if feed_available else None)
        activity_reason = _activity_reason(
            activity,
            media_bucket=media_bucket,
            feed_reason=feed_attrs.get("reason") if feed_available else None,
            private_active=private_active,
        )

        # Presence-Effective Activity-Hold (PR3): starke lokale Aktivität hält
        # presence_effective bei rohem `abwesend` auf `home` (assumed) — ohne
        # presence_personal anzufassen. Nach `activity` berechnet, damit der Hold
        # den aktuellen Activity-State kennt.
        hold = logic.apply_activity_hold(
            presence_personal=presence_personal,
            base_effective=effective.effective_presence,
            base_transition=effective.transition,
            activity=activity,
            home_band=presence_band,
            proximity_trend=effective.proximity_trend,
        )

        master = ".".join(
            [presence_personal, new_bio, day_state, day_context, activity]
        )

        if presence_personal != PERS_PARENTS:
            self._last_real_presence = presence_personal

        await self._async_save()

        wake_attrs = wake_plan.as_attributes(wake_comparison)
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
            "presence_effective": {
                **logic.effective_presence_attrs(effective),
                # Activity-Hold (PR3) — presence_personal bleibt roh.
                "raw_presence": presence_personal,
                "effective_reason": hold.reason,
                "assumed": hold.assumed,
                "hold_strength": hold.hold_strength,
                "source_activity": hold.source_activity,
                "activity_state": activity,
                "activity_reason": activity_reason,
                "activity_hold_active": hold.hold_active,
                "activity_hold_candidates": sorted(ACTIVITY_HOLD_STRENGTH),
            },
            "preheat": {
                "source": preheat_source,
                "started": self._persistent.preheat_started,
                "max_duration_s": self.preheat_duration,
            },
            "bio_state": {
                "last_sleep_start": self._persistent.last_sleep_start,
                "last_awake_start": self._persistent.last_awake_start,
                "last_provisional_sleep_start": (
                    self._persistent.last_provisional_sleep_start
                ),
                "last_waking_start": self._persistent.last_waking_start,
                "waking_timeout_minutes": DEFAULT_WAKING_TIMEOUT_MINUTES,
                "waking_timeout_at": (
                    (
                        waking_started
                        + timedelta(minutes=DEFAULT_WAKING_TIMEOUT_MINUTES)
                    ).isoformat()
                    if waking_started is not None
                    else None
                ),
                "reason": bio_reason,
                "wake_needed": (
                    sleep_plan.wake_due if sleep_plan.available else wake_needed
                ),
                "wake_source": (
                    "internal:core_state.sleep_window"
                    if sleep_plan.available
                    else "legacy_fallback:wake_needed"
                ),
                "wake_next": wake_next_raw,
                "sleep_window": sleep_plan.as_attributes(),
                **{f"indicator_{k}": v for k, v in wake_indicators.items()},
                **{
                    f"indicator_{k}_active_since": (
                        active_since.isoformat() if active_since else None
                    )
                    for k, active_since in wake_indicator_active_since.items()
                },
            },
            "day_state": day_phase_diagnostics,
            # #26 Shadow-only outputs.  These are additive read-only
            # projections; the old wake inputs above continue to drive Bio.
            "wake_state": wake_attrs,
            "next_wake": wake_attrs,
            "wake_needed": wake_attrs,
            "holiday_active": wake_attrs,
            "activity_state": {
                # Debug-Echo aus media_state (treiben die Entscheidung NICHT mehr).
                "media_context": media_ctx,
                "media_device": media_device,
                "gaming_platform": gaming_platform,
                "entertainment_active": entertainment_active,
                "music_active": media_music_active,
                "pc_active": pc_active,
                "private": private_active,
                "household": external_occupied,
                "homeoffice": homeoffice,
                "activity_reason": activity_reason,
                # PR2 (FLEET-256): Media-Hälfte aus dem media_state-Feed.
                "media_activity_context": feed_state if feed_available else None,
                "media_activity_reason": feed_attrs.get("reason") if feed_available else None,
                "media_activity_hold_strength": feed_attrs.get("hold_strength") if feed_available else None,
                "media_activity_source": self._entity_id(CONF_MEDIA_ACTIVITY_CONTEXT),
                "media_activity_context_available": feed_available,
                "title": feed_attrs.get("title") if feed_available else None,
                "artist": feed_attrs.get("artist") if feed_available else None,
                "game_title": feed_attrs.get("game_title") if feed_available else None,
                "source_app": feed_attrs.get("source_app") if feed_available else None,
            },
            "master_context": {
                "presence": presence_personal,
                "bio": new_bio,
                "day_state": day_state,
                "day_context": day_context,
                "activity": activity,
            },
        }

        # Live-Status UX (Anzeige-only, keine Policy). Speist sich ausschließlich
        # aus schon berechneten Werten + dem gespiegelten Media-Feed — kein neuer
        # Roh-Read. Bei private_time bleibt der Text/die Attribute privacy-safe.
        fa = feed_attrs if feed_available else {}
        live = logic.compute_live_status(
            bio=new_bio,
            presence_personal=presence_personal,
            presence_effective=hold.effective_presence,
            presence_transition=new_trans,
            activity=activity,
            activity_reason=activity_reason,
            presence_reason=hold.reason,
            media_activity_context=feed_state if feed_available else None,
            media_activity_reason=fa.get("reason"),
            media_activity_hold_strength=fa.get("hold_strength"),
            media_activity_source=self._entity_id(CONF_MEDIA_ACTIVITY_CONTEXT),
            title=fa.get("title"),
            artist=fa.get("artist"),
            game_title=fa.get("game_title"),
            source_app=fa.get("source_app"),
            media_device=media_device,
            gaming_platform=gaming_platform,
            gaming_source=fa.get("gaming_source"),
            pc_active=pc_active,
            assumed=hold.assumed,
            activity_hold_active=hold.hold_active,
            day_state=day_state,
        )
        source_overrides = {
            "bio_state": tuple(
                source
                for source in (
                    "internal:coordinator.compute_bio_state",
                    self._entity_id(CONF_WAKE_NEEDED),
                    self._entity_id(CONF_WAKE_NEXT),
                )
                if source
            ),
            "activity_state": tuple(
                source
                for source in (
                    "internal:coordinator.compute_activity",
                    self._entity_id(CONF_MEDIA_ACTIVITY_CONTEXT),
                )
                if source
            ),
            "day_state": tuple(
                source
                for source in (
                    "runtime:logic.compute_day_state",
                )
                if source
            ),
            "wake_state": (
                "internal:wake_planning.plan_wake",
                self._entity_id(CONF_WAKE_STATE),
                self._entity_id(CONF_WAKE_NEXT),
            ),
            "next_wake": (
                "internal:wake_planning.next_wake",
                self._entity_id(CONF_WAKE_NEXT),
            ),
            "wake_needed": (
                "internal:wake_planning.wake_needed",
                self._entity_id(CONF_WAKE_NEEDED),
            ),
            "holiday_active": (
                "internal:wake_planning.holiday_active",
                self._entity_id(CONF_HOLIDAY_ACTIVE),
            ),
            "holiday": tuple(
                source
                for source in (
                    "internal:coordinator.compute_day_context",
                    self._entity_id(CONF_HOLIDAY_SENSOR),
                )
                if source
            ),
            "live_status": ("internal:logic.compute_live_status",),
        }
        # Owner-local, read-only mapping diagnosis.  Keep the live-status
        # projection compact because Home Assistant Recorder persists every
        # state attribute and the complete migration prose exceeds its limit.
        # The pure mapping API still exposes the complete rows for deeper
        # diagnostics and contract tests.
        live.attrs["mapping_contract_version"] = MAPPING_CONTRACT_VERSION
        live.attrs["mapping_diagnostics"] = mapping_diagnostics(
            profile=self.profile,
            entry_id=self.entry.entry_id,
            source_overrides=source_overrides,
            compact=True,
        )
        attrs["live_status"] = live.attrs

        return ComputedState(
            presence_personal=presence_personal,
            presence_household=presence_household,
            presence_band=presence_band,
            presence_transition=new_trans,
            presence_effective=hold.effective_presence,
            presence_effective_transition=hold.transition,
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
            wake_state=wake_plan.state,
            next_wake=wake_plan.next_wake,
            wake_needed=wake_plan.wake_needed,
            holiday_active=wake_plan.holiday_active,
            attrs=attrs,
            effective_reason=hold.reason,
            effective_assumed=hold.assumed,
            effective_hold_strength=hold.hold_strength,
            effective_source_activity=hold.source_activity,
            effective_hold_active=hold.hold_active,
            live_status=live.state,
        )


def _parse_iso(raw: str | None) -> datetime | None:
    if not raw:
        return None
    # dt_util.parse_datetime returns None on unparseable input (never raises),
    # so a garbage persisted value degrades to "no timestamp" instead of
    # crashing the compute step. Preserving the tz-aware datetime is what keeps
    # the preheat / transition / effective-presence stabilization timers honest.
    return dt_util.parse_datetime(raw)


def _state_is_true(value: Any) -> bool:
    if value is None:
        return False
    return str(value).lower() in ("on", "true", "home", "1", "yes", "active")


def _activity_reason(
    activity: str,
    *,
    media_bucket: str | None,
    feed_reason: str | None,
    private_active: bool,
) -> str:
    """Diagnose-Begründung für den gewählten Activity-Bucket (nur Attribut).

    Post-hoc aus dem Ergebnis abgeleitet — spiegelt die Prioritätsordnung von
    ``compute_activity`` wider, entscheidet aber nichts. Media-Buckets stammen
    aus dem media_state-Feed (``feed_reason`` reicht dessen Begründung durch);
    private_time kann zusätzlich vom lokalen Manual-Flag kommen.
    """
    if activity in ("sleep", "waking", "idle"):
        return f"bio:{activity}" if activity != "idle" else "idle"
    if activity == "private_time":
        # Feed-private vor lokalem Manual-Flag; wenn nur der Flag greift → flag.
        if media_bucket == "private_time":
            return f"private:feed:{feed_reason}" if feed_reason else "private:feed"
        if private_active:
            return "private:flag"
        return "private:feed"
    if activity in ("gaming", "entertainment", "music"):
        return f"{activity}:feed:{feed_reason}" if feed_reason else f"{activity}:feed"
    if activity == "work_home":
        return "work_home:homeoffice"
    if activity == "household":
        return "household:source"
    if activity == "pc_active":
        return "pc_active:pc"
    return activity


def _bio_transition_reason(
    *,
    previous: str,
    current: str,
    presence_personal: str,
    sleep_reason: str,
    waking_started: datetime | None,
    now: datetime,
    recovered_start: bool,
    regular_interaction: bool,
) -> str:
    if recovered_start and current == BIO_WAKING:
        return "waking_start_recovered_after_restart"
    if current == BIO_WAKING and previous != BIO_WAKING:
        return (
            "hard_l_wake_start"
            if sleep_reason == "hard_l_minimum_sleep_unmet"
            else "calculated_wake_start"
        )
    if current == BIO_AWAKE and previous == BIO_WAKING:
        if regular_interaction:
            return "regular_wake_interaction"
        if (
            waking_started is not None
            and logic._elapsed_seconds(waking_started, now)
            >= DEFAULT_WAKING_TIMEOUT_MINUTES * 60
        ):
            return "waking_timeout"
        return "waking_timeout"
    if current == BIO_AWAKE and previous in {BIO_SLEEP, BIO_PROVISIONAL_SLEEP}:
        return (
            "presence_departure"
            if presence_personal == PERS_AWAY
            else "regular_wake_interaction"
        )
    if current == BIO_PROVISIONAL_SLEEP:
        return sleep_reason
    return f"steady:{current}"


def _scheduled_wake_for_sleep(
    plan: wake_planning.WakePlan, local_now: datetime
) -> datetime | None:
    """Keep today's wake selected through hard L; otherwise use next wake."""

    if (
        plan.wake_time is not None
        and plan.wake_window_end is not None
        and local_now <= plan.wake_window_end
    ):
        return datetime.combine(
            plan.calendar_date,
            plan.wake_time,
            tzinfo=local_now.tzinfo,
        )
    return plan.next_wake


def _positive_int(raw: Any) -> int | None:
    try:
        value = int(raw)
    except (TypeError, ValueError):
        return None
    return value if value > 0 else None


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

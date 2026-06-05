"""Config- und Options-Flow für Benni Core State (standalone).

Direkt als eigene Integration einrichtbar:

    Einstellungen → Geräte & Dienste → Integration hinzufügen → Benni Core State

Zweistufiger Add-Flow:  user (Quell-Entities) → thresholds (Radien & Zeiten).
Options-Flow als Menü:  entities | thresholds.
Single-Instance: nur ein Config-Entry erlaubt.

Der Entity-Auswahl- und Threshold-Flow ist unverändert aus dem Toolbox-Modul
``benni_context`` übernommen — lediglich von der Umbrella-Delegation auf einen
eigenständigen ``ConfigFlow`` umgestellt.
"""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry, ConfigFlow, OptionsFlow
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import selector

from .const import (
    CONF_COFFEE_ACTIVE,
    CONF_DOOR_WAKE,
    CONF_GPS_PRIMARY,
    CONF_GPS_SECONDARY,
    CONF_HOLIDAY_SENSOR,
    CONF_HOMEOFFICE_PING,
    CONF_HOME_RADIUS,
    CONF_HOUSEHOLD_SOURCE,
    CONF_HYSTERESIS_M,
    CONF_MEDIA_CONTEXT,
    CONF_NEAR_RADIUS,
    CONF_PC_ACTIVE,
    CONF_PREHEAT_DURATION,
    CONF_PREHEAT_RADIUS,
    CONF_PRIVATE_SOURCE,
    CONF_PROXIMITY_DIRECTION,
    CONF_PROXIMITY_DISTANCE,
    CONF_PS5_ACTIVE,
    CONF_TRACKER_FRESHNESS,
    CONF_TRANSITION_HOLD,
    CONF_WAKE_NEEDED,
    CONF_WAKE_NEXT,
    CONF_WLAN_BENNI,
    CONF_WLAN_ELTERN_1,
    CONF_WLAN_ELTERN_2,
    DEFAULT_HOME_RADIUS,
    DEFAULT_HYSTERESIS_M,
    DEFAULT_NEAR_RADIUS,
    DEFAULT_PREHEAT_DURATION,
    DEFAULT_PREHEAT_RADIUS,
    DEFAULT_TRACKER_FRESHNESS,
    CONF_PROFILE,
    DEFAULT_PROFILE,
    DEFAULT_TRANSITION_HOLD,
    DOMAIN,
    NAME,
    PROFILE_LABELS,
    PROFILE_PREFILL,
    PROFILES,
)


def _esel(domains: list[str] | None = None) -> selector.EntitySelector:
    cfg: dict[str, Any] = {"multiple": False}
    if domains:
        cfg["domain"] = domains
    return selector.EntitySelector(selector.EntitySelectorConfig(**cfg))


_ENTITY_SLOTS: tuple[tuple[str, list[str]], ...] = (
    (CONF_GPS_PRIMARY, ["device_tracker", "person"]),
    (CONF_GPS_SECONDARY, ["device_tracker", "person"]),
    (CONF_WLAN_BENNI, ["device_tracker"]),
    # Eltern-Slots akzeptieren neben device_tracker auch binary_sensor /
    # input_boolean: so kann z.B. ein SSID-basierter Template-Sensor
    # ("on" wenn iPhone im Eltern-WLAN") direkt als bei_eltern-Quelle dienen.
    # _is_home() in logic.py wertet "on"/"true"/"home" gleichwertig aus.
    (CONF_WLAN_ELTERN_1, ["device_tracker", "binary_sensor", "input_boolean"]),
    (CONF_WLAN_ELTERN_2, ["device_tracker", "binary_sensor", "input_boolean"]),
    (CONF_PROXIMITY_DISTANCE, ["sensor", "proximity"]),
    (CONF_PROXIMITY_DIRECTION, ["sensor", "proximity"]),
    # NB: wake_next / wake_needed werden hier nur als HA-Entities konfiguriert;
    # die Logik dahinter liegt im Wake-Planner. Benni Core State konsumiert sie
    # als Inputs, ohne Wake-Planner-Code zu importieren.
    (CONF_WAKE_NEXT, ["sensor", "input_datetime"]),
    (CONF_WAKE_NEEDED, ["binary_sensor", "input_boolean"]),
    (CONF_PC_ACTIVE, ["binary_sensor", "switch", "input_boolean"]),
    (CONF_PS5_ACTIVE, ["binary_sensor", "switch", "input_boolean"]),
    (CONF_COFFEE_ACTIVE, ["binary_sensor", "switch", "input_boolean"]),
    (CONF_DOOR_WAKE, ["binary_sensor", "input_boolean"]),
    (CONF_MEDIA_CONTEXT, ["sensor", "input_select"]),
    (CONF_PRIVATE_SOURCE, ["binary_sensor", "input_boolean"]),
    (CONF_HOMEOFFICE_PING, ["binary_sensor", "input_boolean"]),
    (CONF_HOLIDAY_SENSOR, ["binary_sensor", "calendar", "input_boolean"]),
    (CONF_HOUSEHOLD_SOURCE, ["binary_sensor", "input_boolean"]),
)


def _entities_schema(defaults: dict[str, Any]) -> vol.Schema:
    fields: dict[Any, Any] = {}
    for key, domains in _ENTITY_SLOTS:
        d = defaults.get(key)
        marker = vol.Optional(key, default=d) if d else vol.Optional(key)
        fields[marker] = _esel(domains)
    return vol.Schema(fields)


def _thresholds_schema(defaults: dict[str, Any]) -> vol.Schema:
    return vol.Schema({
        vol.Required(CONF_HOME_RADIUS, default=defaults.get(CONF_HOME_RADIUS, DEFAULT_HOME_RADIUS)):
            vol.All(vol.Coerce(int), vol.Range(min=10, max=5000)),
        vol.Required(CONF_PREHEAT_RADIUS, default=defaults.get(CONF_PREHEAT_RADIUS, DEFAULT_PREHEAT_RADIUS)):
            vol.All(vol.Coerce(int), vol.Range(min=50, max=20000)),
        vol.Required(CONF_NEAR_RADIUS, default=defaults.get(CONF_NEAR_RADIUS, DEFAULT_NEAR_RADIUS)):
            vol.All(vol.Coerce(int), vol.Range(min=200, max=100000)),
        vol.Required(CONF_HYSTERESIS_M, default=defaults.get(CONF_HYSTERESIS_M, DEFAULT_HYSTERESIS_M)):
            vol.All(vol.Coerce(int), vol.Range(min=0, max=2000)),
        vol.Required(CONF_PREHEAT_DURATION, default=defaults.get(CONF_PREHEAT_DURATION, DEFAULT_PREHEAT_DURATION)):
            vol.All(vol.Coerce(int), vol.Range(min=60, max=7200)),
        vol.Required(CONF_TRACKER_FRESHNESS, default=defaults.get(CONF_TRACKER_FRESHNESS, DEFAULT_TRACKER_FRESHNESS)):
            vol.All(vol.Coerce(int), vol.Range(min=60, max=86400)),
        vol.Required(CONF_TRANSITION_HOLD, default=defaults.get(CONF_TRANSITION_HOLD, DEFAULT_TRANSITION_HOLD)):
            vol.All(vol.Coerce(int), vol.Range(min=10, max=3600)),
    })


def _profile_schema(default: str) -> vol.Schema:
    return vol.Schema({
        vol.Required(CONF_PROFILE, default=default): selector.SelectSelector(
            selector.SelectSelectorConfig(
                mode=selector.SelectSelectorMode.LIST,
                options=[
                    selector.SelectOptionDict(value=p, label=PROFILE_LABELS[p])
                    for p in PROFILES
                ],
            )
        )
    })


class BenniCoreStateConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    def __init__(self) -> None:
        self._profile: str = DEFAULT_PROFILE
        self._entities: dict[str, Any] = {}

    def _prefill_defaults(self) -> dict[str, Any]:
        """Profil-Prefill, gefiltert auf Entities, die in dieser HA existieren.

        Profil "eltern" hat (vorerst) keine Defaults → alle Slots leer.
        """
        prefill = PROFILE_PREFILL.get(self._profile, {})
        return {
            key: eid
            for key, eid in prefill.items()
            if self.hass.states.get(eid) is not None
        }

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        # Single-instance gate (eine Route pro HA; saubere Entity-IDs).
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        if user_input is None:
            return self.async_show_form(
                step_id="user", data_schema=_profile_schema(DEFAULT_PROFILE),
            )
        self._profile = user_input[CONF_PROFILE]
        return await self.async_step_entities()

    async def async_step_entities(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        if user_input is None:
            return self.async_show_form(
                step_id="entities", data_schema=_entities_schema(self._prefill_defaults()),
            )
        self._entities = {k: v for k, v in user_input.items() if v}
        return await self.async_step_thresholds()

    async def async_step_thresholds(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        if user_input is None:
            return self.async_show_form(
                step_id="thresholds", data_schema=_thresholds_schema({}),
            )
        data = {CONF_PROFILE: self._profile, **self._entities}
        return self.async_create_entry(
            title=f"{NAME} ({PROFILE_LABELS[self._profile]})",
            data=data,
            options=user_input,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        # HA 2024.12+: do not assign self.config_entry — it is managed.
        return BenniCoreStateOptionsFlow()


class BenniCoreStateOptionsFlow(OptionsFlow):
    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        return self.async_show_menu(
            step_id="init", menu_options=["entities", "thresholds"],
        )

    async def async_step_entities(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        if user_input is not None:
            new_data = {**self.config_entry.data, **{k: v for k, v in user_input.items() if v}}
            # Selektoren, die geleert wurden, wieder entfernen.
            for k, _ in _ENTITY_SLOTS:
                if k in user_input and not user_input[k]:
                    new_data.pop(k, None)
            self.hass.config_entries.async_update_entry(self.config_entry, data=new_data)
            return self.async_create_entry(title="", data=dict(self.config_entry.options))
        return self.async_show_form(
            step_id="entities", data_schema=_entities_schema(self.config_entry.data),
        )

    async def async_step_thresholds(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)
        return self.async_show_form(
            step_id="thresholds", data_schema=_thresholds_schema(self.config_entry.options),
        )

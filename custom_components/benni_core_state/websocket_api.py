"""WebSocket-API für das Benni-Core-State-Panel.

Liefert dem Frontend einen konsolidierten Status-Snapshot: die berechneten
States + Attribute (aus dem Coordinator) sowie die Readiness der konfigurierten
Eingangs-Entities. Schreibende Aktionen (Bio-State) laufen über die regulären
Services (`benni_core_state.mark_sleep` etc.), die das Frontend per
`hass.callService` aufruft — daher hier nur ein read-only `get_status`.
"""
from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .const import (
    CONF_COFFEE_ACTIVE,
    CONF_DOOR_WAKE,
    CONF_GPS_PRIMARY,
    CONF_GPS_SECONDARY,
    CONF_HOLIDAY_SENSOR,
    CONF_HOMEOFFICE_PING,
    CONF_HOUSEHOLD_SOURCE,
    CONF_MEDIA_ACTIVITY_CONTEXT,
    CONF_MEDIA_CONTEXT,
    CONF_PC_ACTIVE,
    CONF_PRIVATE_SOURCE,
    CONF_PROXIMITY_DIRECTION,
    CONF_PROXIMITY_DISTANCE,
    CONF_PS5_ACTIVE,
    CONF_SOLAR_NOON,
    CONF_WAKE_NEEDED,
    CONF_WAKE_NEXT,
    CONF_WLAN_BENNI,
    CONF_WLAN_ELTERN_1,
    CONF_WLAN_ELTERN_2,
    PROFILE_LABELS,
    WS_GET_STATUS,
)
from .coordinator import all_coordinators

# Konfigurierbare Eingangs-Slots → Label fürs Diagnose-Panel.
INPUT_SLOTS: tuple[tuple[str, str], ...] = (
    (CONF_GPS_PRIMARY, "GPS primär"),
    (CONF_GPS_SECONDARY, "GPS sekundär"),
    (CONF_WLAN_BENNI, "WLAN Benni"),
    (CONF_WLAN_ELTERN_1, "WLAN Eltern 1"),
    (CONF_WLAN_ELTERN_2, "WLAN Eltern 2"),
    (CONF_PROXIMITY_DISTANCE, "Proximity Distanz"),
    (CONF_PROXIMITY_DIRECTION, "Proximity Richtung"),
    (CONF_WAKE_NEEDED, "Wake needed"),
    (CONF_WAKE_NEXT, "Wake next"),
    (CONF_PC_ACTIVE, "PC Master"),
    (CONF_PS5_ACTIVE, "PS5 aktiv"),
    (CONF_COFFEE_ACTIVE, "Kaffee aktiv"),
    (CONF_DOOR_WAKE, "Tür-Wake"),
    (CONF_MEDIA_ACTIVITY_CONTEXT, "Media-Activity-Feed"),
    (CONF_MEDIA_CONTEXT, "Media-Context"),
    (CONF_PRIVATE_SOURCE, "Privat-Quelle"),
    (CONF_HOMEOFFICE_PING, "Homeoffice"),
    (CONF_HOLIDAY_SENSOR, "Feiertag"),
    (CONF_HOUSEHOLD_SOURCE, "Haushalt belegt"),
    (CONF_SOLAR_NOON, "Solar Noon"),
)

_UNAVAILABLE = ("unknown", "unavailable", "", None)


def _coordinator(hass: HomeAssistant):
    coords = all_coordinators(hass)
    return coords[0] if coords else None


def _inputs(hass: HomeAssistant, coord) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    ok = 0
    total = 0
    missing: list[str] = []
    for key, label in INPUT_SLOTS:
        eid = coord._entity_id(key)
        if not eid:
            continue
        total += 1
        st = hass.states.get(eid)
        value = st.state if st is not None else None
        available = st is not None and st.state not in _UNAVAILABLE
        if available:
            ok += 1
        else:
            missing.append(eid)
        rows.append({
            "key": key,
            "label": label,
            "entity_id": eid,
            "value": value,
            "available": available,
        })
    return rows, {"ok": ok, "total": total, "missing": missing}


def _status(hass: HomeAssistant, coord) -> dict[str, Any]:
    data = coord.data
    profile = {"profile": coord.profile, "profile_label": PROFILE_LABELS.get(coord.profile, coord.profile)}
    if data is None:
        rows, foundation = _inputs(hass, coord)
        return {"available": False, "inputs": rows, "foundation": foundation, **profile}

    rows, foundation = _inputs(hass, coord)
    return {
        "available": True,
        **profile,
        "last_update_success": coord.last_update_success,
        "state": {
            "presence_personal": data.presence_personal,
            "presence_household": data.presence_household,
            "presence_band": data.presence_band,
            "presence_transition": data.presence_transition,
            "presence_effective": data.presence_effective,
            "presence_effective_transition": data.presence_effective_transition,
            "bio_state": data.bio_state,
            "day_state": data.day_state,
            "day_context": data.day_context,
            "activity_state": data.activity_state,
            "master_context": data.master_context,
            "preheat_active": bool(data.preheat_active),
        },
        "attrs": data.attrs,
        "inputs": rows,
        "foundation": foundation,
    }


def async_setup_websocket_api(hass: HomeAssistant) -> None:
    @websocket_api.websocket_command({vol.Required("type"): WS_GET_STATUS})
    @websocket_api.async_response
    async def ws_get_status(hass, connection, msg) -> None:
        coord = _coordinator(hass)
        if coord is None:
            connection.send_error(msg["id"], "not_ready", "Benni Core State not loaded")
            return
        connection.send_result(msg["id"], _status(hass, coord))

    websocket_api.async_register_command(hass, ws_get_status)

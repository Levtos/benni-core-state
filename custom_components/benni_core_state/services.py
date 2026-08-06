"""Services von Benni Core State.

Registriert direkt unter der eigenen Domain (kein Umbrella-Präfix mehr):

* ``benni_core_state.set_bio_state`` (manuell: sleep|waking|awake)
* ``benni_core_state.mark_sleep``  — Shortcut für state=sleep
* ``benni_core_state.mark_awake``  — Shortcut für state=awake
* ``benni_core_state.configure_sleep_window`` — persistiert M und A

Funktional identisch zum Toolbox-Ist-Stand: der persistierte Bio-Zustand aller
Instanzen wird gepatcht und ein Refresh ausgelöst.
"""

from __future__ import annotations

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.util import dt as dt_util

from .const import (
    BIO_AWAKE,
    BIO_SLEEP,
    DOMAIN,
    SERVICE_CONFIGURE_SLEEP_WINDOW,
    SERVICE_MARK_AWAKE,
    SERVICE_MARK_SLEEP,
    SERVICE_SET_BIO,
)
from .coordinator import all_coordinators

SET_BIO_SCHEMA = vol.Schema(
    {vol.Required("state"): vol.In((BIO_SLEEP, "waking", BIO_AWAKE))}
)
CONFIGURE_SLEEP_WINDOW_SCHEMA = vol.Schema(
    {
        vol.Required("minimum_sleep_minutes"): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=1440)
        ),
        vol.Required("provisional_lead_minutes"): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=1440)
        ),
        vol.Optional("entry_id"): str,
    }
)


async def _apply_bio(hass: HomeAssistant, target: str) -> None:
    now_iso = dt_util.utcnow().isoformat()
    for coord in all_coordinators(hass):
        coord._persistent.bio_state = target
        if target == BIO_SLEEP:
            coord._persistent.last_sleep_start = now_iso
        elif target == BIO_AWAKE:
            coord._persistent.last_awake_start = now_iso
        await coord.async_request_refresh()


def async_register_services(hass: HomeAssistant) -> None:
    """Idempotent: registriert die Services einmalig pro HA-Lebenszeit."""
    if hass.services.has_service(DOMAIN, SERVICE_SET_BIO):
        return

    async def _set_bio(call: ServiceCall) -> None:
        await _apply_bio(hass, call.data["state"])

    async def _mark_sleep(_call: ServiceCall) -> None:
        await _apply_bio(hass, BIO_SLEEP)

    async def _mark_awake(_call: ServiceCall) -> None:
        await _apply_bio(hass, BIO_AWAKE)

    async def _configure_sleep_window(call: ServiceCall) -> None:
        entry_id = call.data.get("entry_id")
        for coord in all_coordinators(hass):
            if entry_id and coord.entry.entry_id != entry_id:
                continue
            coord._persistent.minimum_sleep_minutes = call.data[
                "minimum_sleep_minutes"
            ]
            coord._persistent.provisional_lead_minutes = call.data[
                "provisional_lead_minutes"
            ]
            await coord._async_save()
            await coord.async_request_refresh()

    hass.services.async_register(DOMAIN, SERVICE_SET_BIO, _set_bio, schema=SET_BIO_SCHEMA)
    hass.services.async_register(DOMAIN, SERVICE_MARK_SLEEP, _mark_sleep)
    hass.services.async_register(DOMAIN, SERVICE_MARK_AWAKE, _mark_awake)
    hass.services.async_register(
        DOMAIN,
        SERVICE_CONFIGURE_SLEEP_WINDOW,
        _configure_sleep_window,
        schema=CONFIGURE_SLEEP_WINDOW_SCHEMA,
    )


def async_unregister_services(hass: HomeAssistant) -> None:
    for svc in (
        SERVICE_SET_BIO,
        SERVICE_MARK_SLEEP,
        SERVICE_MARK_AWAKE,
        SERVICE_CONFIGURE_SLEEP_WINDOW,
    ):
        if hass.services.has_service(DOMAIN, svc):
            hass.services.async_remove(DOMAIN, svc)

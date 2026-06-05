"""Services von Benni Core State.

Registriert direkt unter der eigenen Domain (kein Umbrella-Präfix mehr):

* ``benni_core_state.set_bio_state`` (state: sleep|waking|awake)
* ``benni_core_state.mark_sleep``  — Shortcut für state=sleep
* ``benni_core_state.mark_awake``  — Shortcut für state=awake

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
    BIO_STATES,
    DOMAIN,
    SERVICE_MARK_AWAKE,
    SERVICE_MARK_SLEEP,
    SERVICE_SET_BIO,
)
from .coordinator import all_coordinators

SET_BIO_SCHEMA = vol.Schema({vol.Required("state"): vol.In(BIO_STATES)})


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

    hass.services.async_register(DOMAIN, SERVICE_SET_BIO, _set_bio, schema=SET_BIO_SCHEMA)
    hass.services.async_register(DOMAIN, SERVICE_MARK_SLEEP, _mark_sleep)
    hass.services.async_register(DOMAIN, SERVICE_MARK_AWAKE, _mark_awake)


def async_unregister_services(hass: HomeAssistant) -> None:
    for svc in (SERVICE_SET_BIO, SERVICE_MARK_SLEEP, SERVICE_MARK_AWAKE):
        if hass.services.has_service(DOMAIN, svc):
            hass.services.async_remove(DOMAIN, svc)

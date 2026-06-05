"""Benni Core State — standalone Home-Assistant-Integration.

Konservative Extraktion des Toolbox-Moduls ``benni_context`` in eine eigene
HA-Domain ``benni_core_state``. Fachlicher Owner für presence / bio / day /
activity / master-context. Wake Planner / Title Classifier werden ausschließlich
als konfigurierte HA-Entities konsumiert — keine direkten Cross-Modul-Imports.

Datenwurzel:  ``hass.data[DOMAIN][entry_id] = BenniCoreStateCoordinator``
Services:     ``benni_core_state.*``
Storage:      ``.storage/benni_core_state_state_<entry_id>``
"""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .coordinator import BenniCoreStateCoordinator
from .services import async_register_services, async_unregister_services

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.BINARY_SENSOR]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    coordinator = BenniCoreStateCoordinator(hass, entry)
    await coordinator.async_load_stored()
    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator

    coordinator.async_start_listeners()
    entry.async_on_unload(coordinator.async_stop_listeners)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    async_register_services(hass)
    entry.async_on_unload(entry.add_update_listener(_async_reload_on_options))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        coordinator: BenniCoreStateCoordinator | None = hass.data.get(DOMAIN, {}).pop(
            entry.entry_id, None
        )
        if coordinator is not None:
            coordinator.async_stop_listeners()
        # Letzten Entry → Services abräumen.
        if not hass.data.get(DOMAIN):
            async_unregister_services(hass)
    return unloaded


async def _async_reload_on_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)

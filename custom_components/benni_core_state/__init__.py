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

from .const import DATA_WS_REGISTERED, DOMAIN, LEGACY_ENTITY_MAP
from .coordinator import BenniCoreStateCoordinator, all_coordinators
from .services import async_register_services, async_unregister_services
from .view import async_remove_view, async_setup_view
from .websocket_api import async_setup_websocket_api

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.BINARY_SENSOR]


def _migrated_entry_sources(entry: ConfigEntry) -> tuple[bool, dict, dict]:
    changed = False
    data = dict(entry.data)
    options = dict(entry.options)
    for target in (data, options):
        for key, value in list(target.items()):
            if isinstance(value, str) and value in LEGACY_ENTITY_MAP:
                target[key] = LEGACY_ENTITY_MAP[value]
                changed = True
    return changed, data, options


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    changed, data, options = _migrated_entry_sources(entry)
    if changed:
        hass.config_entries.async_update_entry(entry, data=data, options=options)
        _LOGGER.info("Migrated benni_core_state entity bindings during setup")

    coordinator = BenniCoreStateCoordinator(hass, entry)
    await coordinator.async_load_stored()
    await coordinator.async_config_entry_first_refresh()

    data = hass.data.setdefault(DOMAIN, {})
    data[entry.entry_id] = coordinator

    coordinator.async_start_listeners()
    entry.async_on_unload(coordinator.async_stop_listeners)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    async_register_services(hass)

    # Panel + WebSocket-API (Dashboard-Frontend). WS einmalig pro HA-Prozess.
    await async_setup_view(hass)
    if not data.get(DATA_WS_REGISTERED):
        async_setup_websocket_api(hass)
        data[DATA_WS_REGISTERED] = True

    entry.async_on_unload(entry.add_update_listener(_async_reload_on_options))
    return True


async def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Migrate retired entity IDs from earlier prefills."""
    changed, data, options = _migrated_entry_sources(entry)
    if changed or entry.version < 2:
        hass.config_entries.async_update_entry(
            entry,
            data=data,
            options=options,
            version=2,
        )
        _LOGGER.info("Migrated benni_core_state entity bindings")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        coordinator: BenniCoreStateCoordinator | None = hass.data.get(DOMAIN, {}).pop(
            entry.entry_id, None
        )
        if coordinator is not None:
            coordinator.async_stop_listeners()
        # Kein Coordinator mehr → Services + Panel abräumen.
        if not all_coordinators(hass):
            async_unregister_services(hass)
            async_remove_view(hass)
    return unloaded


async def _async_reload_on_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)

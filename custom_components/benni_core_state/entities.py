"""Sensor- + Binary-Sensor-Entities für Benni Core State.

Device-Name ``Benni Core State`` ⇒ Entity-IDs ``sensor.benni_core_state_*`` /
``binary_sensor.benni_core_state_*`` (via ``has_entity_name``). Damit
kollisionsfrei zur weiterhin produktiven Toolbox-Version, deren Entities unter
``sensor.benni_context_*`` laufen.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    ACTIVITY_STATES,
    BIO_STATES,
    DAY_CONTEXT_STATES,
    DAY_STATES,
    DOMAIN,
    NAME,
    PRESENCE_BAND_STATES,
    PRESENCE_HOUSEHOLD_STATES,
    PRESENCE_PERSONAL_STATES,
    PRESENCE_TRANSITION_STATES,
    unique_id,
)
from .coordinator import BenniCoreStateCoordinator, coordinator_from_hass
from .models import ComputedState


@dataclass(frozen=True)
class _Desc:
    key: str
    name: str
    options: list[str] | None
    value_fn: Callable[[ComputedState], str]
    attr_key: str | None = None


SENSORS: tuple[_Desc, ...] = (
    _Desc("presence_personal", "Presence Personal",
          PRESENCE_PERSONAL_STATES, lambda s: s.presence_personal, "presence_personal"),
    _Desc("presence_household", "Presence Household",
          PRESENCE_HOUSEHOLD_STATES, lambda s: s.presence_household),
    _Desc("presence_band", "Presence Band",
          PRESENCE_BAND_STATES, lambda s: s.presence_band, "presence_band"),
    _Desc("presence_transition", "Presence Transition",
          PRESENCE_TRANSITION_STATES, lambda s: s.presence_transition, "presence_transition"),
    _Desc("bio_state", "Bio State",
          BIO_STATES, lambda s: s.bio_state, "bio_state"),
    _Desc("day_state", "Day State",
          DAY_STATES, lambda s: s.day_state),
    _Desc("day_context", "Day Context",
          DAY_CONTEXT_STATES, lambda s: s.day_context),
    _Desc("activity_state", "Activity State",
          ACTIVITY_STATES, lambda s: s.activity_state, "activity_state"),
    _Desc("master_context", "Master Context",
          None, lambda s: s.master_context, "master_context"),
)


def _device_info(entry: ConfigEntry) -> dict[str, Any]:
    return {
        "identifiers": {(DOMAIN, entry.entry_id)},
        "name": NAME,
        "manufacturer": "Benni",
        "model": "Core State",
    }


async def async_get_entities(
    hass: HomeAssistant, entry: ConfigEntry, platform: Platform
) -> list:
    coord = coordinator_from_hass(hass, entry.entry_id)
    if coord is None:
        return []
    if platform == Platform.SENSOR:
        return [BenniCoreStateSensor(coord, entry, desc) for desc in SENSORS]
    if platform == Platform.BINARY_SENSOR:
        return [PreheatActiveBinarySensor(coord, entry)]
    return []


class BenniCoreStateSensor(CoordinatorEntity[BenniCoreStateCoordinator], SensorEntity):
    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: BenniCoreStateCoordinator,
        entry: ConfigEntry,
        desc: _Desc,
    ) -> None:
        super().__init__(coordinator)
        self._desc = desc
        self._attr_name = desc.name
        self._attr_unique_id = unique_id(entry.entry_id, desc.key)
        self._attr_device_info = _device_info(entry)
        if desc.options:
            self._attr_device_class = "enum"
            self._attr_options = desc.options

    @property
    def native_value(self) -> str | None:
        if self.coordinator.data is None:
            return None
        return self._desc.value_fn(self.coordinator.data)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        if self.coordinator.data is None or not self._desc.attr_key:
            return {}
        return self.coordinator.data.attrs.get(self._desc.attr_key, {})

    @property
    def available(self) -> bool:
        # Presence / master sensors stay available even when inputs are
        # missing — they fall back to documented defaults rather than going
        # "unavailable".
        return self.coordinator.last_update_success or self.coordinator.data is not None


class PreheatActiveBinarySensor(
    CoordinatorEntity[BenniCoreStateCoordinator], BinarySensorEntity
):
    _attr_has_entity_name = True
    _attr_name = "Presence Preheat Active"
    _attr_device_class = BinarySensorDeviceClass.RUNNING

    def __init__(
        self, coordinator: BenniCoreStateCoordinator, entry: ConfigEntry
    ) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = unique_id(entry.entry_id, "presence_preheat_active")
        self._attr_device_info = _device_info(entry)

    @property
    def is_on(self) -> bool:
        if self.coordinator.data is None:
            return False
        return bool(self.coordinator.data.preheat_active)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        if self.coordinator.data is None:
            return {}
        return self.coordinator.data.attrs.get("preheat", {})

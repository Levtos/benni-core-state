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
from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    ACTIVITY_STATES,
    BIO_STATES,
    CONF_PROFILE,
    DAY_CONTEXT_STATES,
    DAY_STATES,
    DEFAULT_PROFILE,
    DOMAIN,
    PERS_AWAY,
    PRESENCE_BAND_STATES,
    PRESENCE_EFFECTIVE_STATES,
    PRESENCE_HOUSEHOLD_STATES,
    PRESENCE_PERSONAL_STATES,
    PRESENCE_TRANSITION_STATES,
    PROFILE_LABELS,
    unique_id,
)
from . import logic
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
    _Desc("presence_effective", "Presence Effective",
          PRESENCE_EFFECTIVE_STATES, lambda s: s.presence_effective, "presence_effective"),
    _Desc("presence_effective_transition", "Presence Effective Transition",
          PRESENCE_EFFECTIVE_STATES, lambda s: s.presence_effective_transition, "presence_effective"),
    _Desc("bio_state", "Bio State",
          BIO_STATES, lambda s: s.bio_state, "bio_state"),
    _Desc("day_state", "Day State",
          DAY_STATES, lambda s: s.day_state, "day_state"),
    _Desc("day_context", "Day Context",
          DAY_CONTEXT_STATES, lambda s: s.day_context),
    _Desc("activity_state", "Activity State",
          ACTIVITY_STATES, lambda s: s.activity_state, "activity_state"),
    _Desc("master_context", "Master Context",
          None, lambda s: s.master_context, "master_context"),
    # UX-/Anzeige-Sensor (kein Enum, keine Policy): sprechender deutscher Status.
    _Desc("live_status", "Live Status",
          None, lambda s: s.live_status, "live_status"),
)


def _device_info(entry: ConfigEntry) -> dict[str, Any]:
    # Der Device-Name bestimmt bei has_entity_name den Entity-Slug:
    #   "Benni Core State"  → sensor.benni_core_state_*
    #   "Eltern Core State" → sensor.eltern_core_state_*
    profile = entry.data.get(CONF_PROFILE, DEFAULT_PROFILE)
    label = PROFILE_LABELS.get(profile, "Benni")
    return {
        "identifiers": {(DOMAIN, entry.entry_id)},
        "name": f"{label} Core State",
        "manufacturer": "Benni",
        "model": f"Core State · {label}",
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
        return [
            PreheatActiveBinarySensor(coord, entry),
            PresenceAwayBinarySensor(coord, entry),
        ]
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
            self._attr_device_class = SensorDeviceClass.ENUM
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


class PresenceAwayBinarySensor(
    CoordinatorEntity[BenniCoreStateCoordinator], BinarySensorEntity
):
    """Canonical away gate for the whole fleet.

    ``on`` ⇔ ``presence_personal == abwesend`` AND no active Activity-Hold.
    ``zuhause`` and ``bei_eltern`` both read ``off`` (bei_eltern is
    home-equivalent: no away-mode should fire). PR3: when strong local activity
    holds ``presence_effective`` at assumed ``home`` (raw still ``abwesend``),
    this gate goes ``off`` too — a GPS blip during active local presence no
    longer tears down away-gated consumers (media, door). Downstream modules
    consume THIS instead of re-deriving home/away — one owner of the decision.
    """

    # No device_class: the PRESENCE class would invert semantics (on=home),
    # but this gate is on ⇔ away. Keep it a plain boolean.
    _attr_has_entity_name = True
    _attr_name = "Presence Away"

    def __init__(
        self, coordinator: BenniCoreStateCoordinator, entry: ConfigEntry
    ) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = unique_id(entry.entry_id, "presence_away")
        self._attr_device_info = _device_info(entry)

    @property
    def is_on(self) -> bool:
        data = self.coordinator.data
        if data is None:
            return False
        return logic.away_gate_active(data.presence_personal, data.effective_hold_active)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        if self.coordinator.data is None:
            return {}
        return {
            **self.coordinator.data.attrs.get("presence_personal", {}),
            "activity_hold_active": self.coordinator.data.effective_hold_active,
            "effective_reason": self.coordinator.data.effective_reason,
        }

    @property
    def available(self) -> bool:
        # Mirror the presence sensors: stay available on documented defaults.
        return self.coordinator.last_update_success or self.coordinator.data is not None

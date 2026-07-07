"""Unit tests for the pure helper functions in ``coordinator.py``.

``coordinator.py`` imports the Home Assistant runtime (DataUpdateCoordinator,
Store, event helpers, …) at module load. The shared ``conftest.py`` only stubs
``homeassistant.util.dt`` — enough for the HA-free logic modules but not for the
coordinator. So this module seeds the *remaining* HA modules the coordinator
imports with lightweight stubs, purely so the module can be imported and its
pure helpers (``_parse_iso``) exercised without a full HA install.

The stubs are intentionally minimal: they satisfy the ``import`` and the class
body (``DataUpdateCoordinator[ComputedState]`` must be subscriptable), nothing
more. ``_parse_iso`` itself only depends on the real ``dt_util.parse_datetime``
stub from conftest.
"""
from __future__ import annotations

import sys
import types
from datetime import datetime


def _seed_ha_runtime_stubs() -> None:
    """Register the HA runtime modules ``coordinator`` imports (idempotent)."""

    def _mod(name: str) -> types.ModuleType:
        existing = sys.modules.get(name)
        if existing is not None:
            return existing
        module = types.ModuleType(name)
        sys.modules[name] = module
        return module

    config_entries = _mod("homeassistant.config_entries")
    if not hasattr(config_entries, "ConfigEntry"):
        class ConfigEntry:  # noqa: D401 - stub
            ...

        config_entries.ConfigEntry = ConfigEntry

    core = _mod("homeassistant.core")
    if not hasattr(core, "HomeAssistant"):
        core.CALLBACK_TYPE = object

        class Event:  # stub
            ...

        class HomeAssistant:  # stub
            ...

        def callback(func):  # decorator passthrough
            return func

        core.Event = Event
        core.HomeAssistant = HomeAssistant
        core.callback = callback

    helpers = _mod("homeassistant.helpers")
    event = _mod("homeassistant.helpers.event")
    if not hasattr(event, "async_track_state_change_event"):
        def async_track_state_change_event(*_a, **_k):
            return lambda: None

        event.async_track_state_change_event = async_track_state_change_event
    helpers.event = event

    storage = _mod("homeassistant.helpers.storage")
    if not hasattr(storage, "Store"):
        class Store:  # stub
            def __init__(self, *_a, **_k) -> None:
                ...

        storage.Store = Store
    helpers.storage = storage

    update_coordinator = _mod("homeassistant.helpers.update_coordinator")
    if not hasattr(update_coordinator, "DataUpdateCoordinator"):
        class DataUpdateCoordinator:  # subscriptable stub
            def __class_getitem__(cls, _item):
                return cls

        update_coordinator.DataUpdateCoordinator = DataUpdateCoordinator
    helpers.update_coordinator = update_coordinator

    # Make submodules reachable as attributes of their parent package too.
    ha = sys.modules.get("homeassistant")
    if ha is not None:
        ha.config_entries = config_entries
        ha.core = core
        ha.helpers = helpers


_seed_ha_runtime_stubs()

from custom_components.benni_core_state.coordinator import _parse_iso  # noqa: E402


def test_none_returns_none():
    assert _parse_iso(None) is None


def test_empty_string_returns_none():
    assert _parse_iso("") is None


def test_valid_iso_with_tz_returns_aware_datetime():
    result = _parse_iso("2026-07-06T19:20:08.605347+00:00")
    assert isinstance(result, datetime)
    assert result.tzinfo is not None


def test_valid_iso_without_tz_returns_datetime():
    result = _parse_iso("2026-07-06T19:20:08")
    assert isinstance(result, datetime)
    assert result.year == 2026
    assert result.hour == 19


def test_garbage_returns_none_without_raising():
    assert _parse_iso("not-a-date") is None


def test_roundtrip_preserves_instant():
    original = datetime(2026, 7, 6, 19, 20, 8, 605347)
    parsed = _parse_iso(original.isoformat())
    assert parsed == original

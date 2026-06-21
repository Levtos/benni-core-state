"""ReBind guardrails for master-backed wake indicators."""
from __future__ import annotations

from custom_components.benni_core_state import const as C


def test_pc_wake_indicator_defaults_to_master():
    prefill = C.PROFILE_PREFILL[C.PROFILE_BENNI]

    assert prefill[C.CONF_PC_ACTIVE] == "sensor.benni_master_pc"


def test_legacy_pc_wake_indicator_has_master_repoint():
    assert C.LEGACY_ENTITY_MAP == {
        "sensor.benni_device_living_pc": "sensor.benni_master_pc",
    }

"""Test bootstrap for pure-logic tests.

``logic.py`` / ``const.py`` / ``models.py`` are intentionally free of Home
Assistant imports and fully unit-testable. The package ``__init__.py`` however
imports the HA runtime (coordinator, services, config_entries, …), which is
not installed in the test environment.

To run the pure-logic tests without a full Home Assistant install, we pre-seed
``custom_components`` and ``custom_components.benni_core_state`` as lightweight
namespace packages pointing at the real source directory. Submodule imports
(``from custom_components.benni_core_state import logic``) then load the
HA-free submodules from disk **without** executing the heavy package
``__init__.py``.
"""
from __future__ import annotations

import os
import sys
import types
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

_CC_DIR = os.path.join(ROOT, "custom_components")
_PKG_DIR = os.path.join(_CC_DIR, "benni_core_state")


def _seed_namespace_packages() -> None:
    if "custom_components.benni_core_state" in sys.modules:
        return

    cc = sys.modules.get("custom_components")
    if cc is None:
        cc = types.ModuleType("custom_components")
        cc.__path__ = [_CC_DIR]  # type: ignore[attr-defined]
        sys.modules["custom_components"] = cc

    pkg = types.ModuleType("custom_components.benni_core_state")
    pkg.__path__ = [_PKG_DIR]  # type: ignore[attr-defined]
    pkg.__package__ = "custom_components.benni_core_state"
    sys.modules["custom_components.benni_core_state"] = pkg


def _install_ha_stub() -> None:
    if "homeassistant" in sys.modules:
        return
    ha = types.ModuleType("homeassistant")
    util = types.ModuleType("homeassistant.util")
    dt_mod = types.ModuleType("homeassistant.util.dt")

    def utcnow() -> datetime:
        return datetime.now(tz=timezone.utc)

    def as_local(value: datetime) -> datetime:
        return value

    def parse_datetime(raw: str) -> datetime | None:
        try:
            return datetime.fromisoformat(raw)
        except Exception:
            return None

    dt_mod.utcnow = utcnow
    dt_mod.as_local = as_local
    dt_mod.parse_datetime = parse_datetime

    util.dt = dt_mod
    ha.util = util
    sys.modules["homeassistant"] = ha
    sys.modules["homeassistant.util"] = util
    sys.modules["homeassistant.util.dt"] = dt_mod


_install_ha_stub()
_seed_namespace_packages()

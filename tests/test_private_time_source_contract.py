"""Regression checks for the canonical private-time source contract."""

from __future__ import annotations

import ast
from pathlib import Path


ROOT = Path(__file__).parents[1]
CONFIG_FLOW = ROOT / "custom_components" / "benni_core_state" / "config_flow.py"
COORDINATOR = ROOT / "custom_components" / "benni_core_state" / "coordinator.py"
LOGIC = ROOT / "custom_components" / "benni_core_state" / "logic.py"


def _function_source(path: Path, name: str) -> str:
    source = path.read_text(encoding="utf-8")
    tree = ast.parse(source)
    node = next(
        node
        for node in ast.walk(tree)
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
        and node.name == name
    )
    return ast.get_source_segment(source, node) or ""


def test_private_source_is_not_exposed_as_entity_selector():
    source = CONFIG_FLOW.read_text(encoding="utf-8")
    tree = ast.parse(source)
    assignment = next(
        node
        for node in tree.body
        if isinstance(node, (ast.Assign, ast.AnnAssign))
        and (
            any(
                isinstance(target, ast.Name) and target.id == "_ENTITY_SLOTS"
                for target in getattr(node, "targets", [])
            )
            or (
                isinstance(getattr(node, "target", None), ast.Name)
                and node.target.id == "_ENTITY_SLOTS"
            )
        )
    )
    slots = [
        item.elts[0].id
        for item in assignment.value.elts
        if isinstance(item, ast.Tuple)
        and item.elts
        and isinstance(item.elts[0], ast.Name)
    ]

    assert "CONF_PRIVATE_SOURCE" not in slots
    assert "CONF_MEDIA_ACTIVITY_CONTEXT" in slots


def test_coordinator_never_reads_legacy_private_entity_state():
    watched = _function_source(COORDINATOR, "_watched_entity_ids")
    update = _function_source(COORDINATOR, "_async_update_data")

    assert "CONF_PRIVATE_SOURCE" not in watched
    assert "_read_entity(CONF_PRIVATE_SOURCE)" not in update
    assert "private_active" not in update


def test_activity_logic_has_no_legacy_private_boolean_input():
    decision = _function_source(LOGIC, "compute_activity_decision")
    wrapper = _function_source(LOGIC, "compute_activity")

    assert "private_active" not in decision
    assert "private_active" not in wrapper

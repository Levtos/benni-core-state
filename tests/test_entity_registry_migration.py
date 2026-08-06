"""Pure tests for the deterministic Startup-/Apply-Ready entity-ID fix."""

from custom_components.benni_core_state.entity_registry_migration import (
    STARTUP_APPLY_READY_ENTITY_ID,
    STARTUP_APPLY_READY_LIVE_MISMATCH_ENTITY_ID,
    decide_startup_apply_ready_registry_migration,
    startup_apply_ready_entity_id,
)


def test_startup_apply_ready_target_is_clean_and_profile_scoped() -> None:
    assert startup_apply_ready_entity_id("benni") == STARTUP_APPLY_READY_ENTITY_ID
    assert startup_apply_ready_entity_id("eltern") == (
        "binary_sensor.eltern_core_state_apply_ready"
    )
    assert "system_" not in STARTUP_APPLY_READY_ENTITY_ID


def test_exact_live_system_prefixed_path_is_migratable() -> None:
    decision = decide_startup_apply_ready_registry_migration(
        STARTUP_APPLY_READY_LIVE_MISMATCH_ENTITY_ID,
        STARTUP_APPLY_READY_ENTITY_ID,
    )

    assert decision.action == "migrate"
    assert decision.source_entity_id == STARTUP_APPLY_READY_LIVE_MISMATCH_ENTITY_ID
    assert decision.target_entity_id == STARTUP_APPLY_READY_ENTITY_ID


def test_unknown_registry_path_blocks_inference() -> None:
    decision = decide_startup_apply_ready_registry_migration(
        "binary_sensor.benni_core_state_apply_ready_2",
        STARTUP_APPLY_READY_ENTITY_ID,
    )

    assert decision.action == "block"
    assert "not in the evidenced legacy inventory" in decision.reason


def test_target_collision_blocks_registry_rename() -> None:
    decision = decide_startup_apply_ready_registry_migration(
        STARTUP_APPLY_READY_LIVE_MISMATCH_ENTITY_ID,
        STARTUP_APPLY_READY_ENTITY_ID,
        target_in_use=True,
    )

    assert decision.action == "block"
    assert "already in use" in decision.reason


def test_already_clean_and_missing_entries_are_idempotent() -> None:
    clean = decide_startup_apply_ready_registry_migration(
        STARTUP_APPLY_READY_ENTITY_ID,
        STARTUP_APPLY_READY_ENTITY_ID,
    )
    missing = decide_startup_apply_ready_registry_migration(
        None,
        STARTUP_APPLY_READY_ENTITY_ID,
    )

    assert clean.action == "noop"
    assert missing.action == "noop"

"""Focused tests for the versioned #25 mapping contract."""

from __future__ import annotations

from custom_components.benni_core_state import mapping as m


def test_corrected_day_state_contract_is_exactly_nine_phases() -> None:
    assert m.CANONICAL_DAY_STATES == (
        "early_night",
        "late_night",
        "early_morning",
        "forenoon",
        "midday",
        "afternoon",
        "late_afternoon",
        "evening",
        "late_evening",
    )
    assert "late_morning" not in m.CANONICAL_DAY_STATES
    assert "early_evening" not in m.CANONICAL_DAY_STATES
    assert m.mapping_for("day_state").allowed_states == m.CANONICAL_DAY_STATES


def test_canonical_targets_and_unique_ids_are_clean_and_stable() -> None:
    for entry in m.CANONICAL_MAPPINGS:
        if entry.canonical_entity_id is not None:
            assert "system_" not in entry.canonical_entity_id
        if entry.entity_id_pattern is not None:
            assert "system_" not in entry.entity_id_pattern
        if entry.unique_id_template is not None:
            assert "system_" not in entry.unique_id_template

    assert m.render_entity_id("bio_state") == "sensor.benni_core_state_bio_state"
    assert m.render_entity_id("wake_needed") == "binary_sensor.benni_core_state_wake_needed"
    assert m.render_entity_id("bio_state", profile="eltern") == "sensor.eltern_core_state_bio_state"
    assert m.render_unique_id("bio_state", "entry123") == "benni_core_state_entry123_bio_state"
    assert m.render_unique_id("wake_state", "entry123") == "benni_core_state_entry123_wake_state"


def test_required_fact_mappings_have_domains_states_attributes_and_owners() -> None:
    required = {
        "bio_state",
        "provisional_sleep",
        "waking",
        "activity_state",
        "day_state",
        "wake_state",
        "next_wake",
        "wake_needed",
        "holiday",
        "holiday_active",
        "vacation",
        "automatic_day_profile",
        "live_status",
        "apply_ready",
    }
    assert required <= set(m.MAPPING_BY_KEY)

    for key in required:
        entry = m.mapping_for(key)
        assert entry is not None
        assert entry.owner
        assert entry.allowed_states
        assert entry.attributes
        assert entry.reason
        assert entry.planned_cutover
        assert entry.rollback
        assert entry.consumer_issue.startswith("https://github.com/")

    assert m.mapping_for("provisional_sleep").canonical_entity_id == m.render_entity_id("bio_state")
    assert m.mapping_for("provisional_sleep").future_states == ("provisional_sleep",)
    assert m.mapping_for("waking").canonical_entity_id == m.render_entity_id("bio_state")
    assert m.mapping_for("automatic_day_profile").target_attributes == (
        "automatic_day_profile",
        "reason",
    )
    assert m.mapping_for("vacation").canonical_entity_id is None


def test_old_outputs_keep_actual_semantics_and_are_not_rebound_now() -> None:
    old_to_planned = {
        "sensor.wake_planner_benni_wake_state": "wake_state",
        "sensor.wake_planner_benni_next_wake": "next_wake",
        "binary_sensor.wake_planner_benni_wake_needed": "wake_needed",
        "binary_sensor.wake_planner_benni_holiday_active": "holiday_active",
    }
    for old_id, key in old_to_planned.items():
        resolution = m.resolve_legacy_entity(old_id)
        assert resolution.mapping_key == key
        assert resolution.status == m.LEGACY_TEMPORARY
        assert resolution.target_entity_id == m.render_entity_id(key)

    assert m.mapping_for("wake_needed").allowed_states == ("on", "off")
    assert "Bio-State" not in m.mapping_for("wake_needed").contract_fact
    assert m.mapping_for("waking").status == m.STATUS_ATTRIBUTE_ONLY


def test_startup_apply_ready_mapping_is_canonical_and_diagnostic() -> None:
    mapping = m.mapping_for("apply_ready")
    assert mapping is not None
    assert mapping.canonical_entity_id == "binary_sensor.benni_core_state_apply_ready"
    assert mapping.owner
    assert mapping.current_source
    assert mapping.status == m.STATUS_CANONICAL_CURRENT
    assert mapping.reason
    assert "ready_at" in mapping.attributes
    assert "startup_delay" in mapping.attributes
    assert "startup_phase" in mapping.attributes
    assert "system_" not in mapping.canonical_entity_id

    for old_id in (
        "binary_sensor.system_apply_ready",
        "binary_sensor.system_benni_context_ready",
        "input_boolean.system_startup_stable",
    ):
        resolution = m.resolve_legacy_entity(old_id)
        assert resolution.mapping_key == "apply_ready"
        assert resolution.target_entity_id == mapping.canonical_entity_id
        assert resolution.status == m.LEGACY_REPLACE_AFTER_CUTOVER


def test_legacy_resolution_is_explicit_and_unknowns_fail_loud() -> None:
    pc = m.resolve_legacy_entity("sensor.benni_device_living_pc")
    assert pc.status == m.LEGACY_CONFIG_COMPATIBILITY
    assert pc.target_entity_id == "sensor.benni_master_pc"

    system_presence = m.resolve_legacy_entity(
        "sensor.system_benni_core_state_presence_effective"
    )
    assert system_presence.status == m.LEGACY_REPLACE_AFTER_CUTOVER
    assert system_presence.target_entity_id == "sensor.benni_core_state_presence_effective"

    media_feed = m.resolve_legacy_entity(
        "sensor.system_benni_media_state_activity_context"
    )
    assert media_feed.status == m.LEGACY_TEMPORARY
    assert media_feed.target_entity_id is None

    unknown = m.resolve_legacy_entity("sensor.not_in_the_mapping_contract")
    assert unknown.status == m.LEGACY_UNKNOWN
    assert unknown.target_entity_id is None
    assert "no target" in unknown.reason.lower()

    undecided = m.resolve_mapping("vacation")
    assert undecided["status"] == m.STATUS_UNDECIDED
    assert undecided["target"] is None
    unknown_key = m.resolve_mapping("not_a_mapping_key")
    assert unknown_key["status"] == m.STATUS_UNDECIDED
    assert unknown_key["target"] is None


def test_owner_local_diagnostics_always_expose_source_target_status_reason() -> None:
    rows = m.mapping_diagnostics(
        profile="benni",
        entry_id="entry123",
        source_overrides={
            "activity_state": "sensor.system_benni_media_state_activity_context",
        },
    )
    assert len(rows) == len(m.CANONICAL_MAPPINGS)
    by_key = {row["mapping_key"]: row for row in rows}
    assert by_key["activity_state"]["source"] == (
        "sensor.system_benni_media_state_activity_context"
    )
    for row in rows:
        assert row["source"]
        assert "target" in row
        assert row["owner"]
        assert row["status"]
        assert row["reason"]
        assert row["contract_version"] == m.MAPPING_CONTRACT_VERSION
        if row["target"] is not None:
            assert "system_" not in str(row["target"])

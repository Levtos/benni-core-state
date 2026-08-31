"""Acceptance-contract tests for GitHub Issue #59."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import inspect
from pathlib import Path

import pytest

from custom_components.benni_core_state.const import (
    ACT_ENTERTAINMENT,
    ACT_SLEEP,
    BIO_AWAKE,
    BIO_PROVISIONAL_SLEEP,
    BIO_SLEEP,
    BIO_WAKING,
    DAY_EARLY_MORNING,
    DAY_EARLY_NIGHT,
    DAY_LATE_EVENING,
    DAY_LATE_NIGHT,
    PERS_HOME,
)
from custom_components.benni_core_state.logic import (
    compute_activity_decision,
    compute_bio_state,
    provisional_sleep_decision,
    regular_wake_interaction_decision,
)
from custom_components.benni_core_state.models import (
    PersistentState,
    apply_manual_bio_command,
)


NOW = datetime(2026, 8, 30, 22, 0, tzinfo=timezone.utc)
REFERENCE = NOW - timedelta(minutes=30)


@pytest.mark.parametrize("phase", [DAY_EARLY_NIGHT, DAY_LATE_NIGHT])
def test_home_awake_night_entertainment_enters_ps(phase):
    decision = provisional_sleep_decision(
        previous_bio=BIO_AWAKE,
        presence_personal=PERS_HOME,
        day_state=phase,
        activity_state=ACT_ENTERTAINMENT,
    )
    assert decision.accepted is True
    assert decision.reason == "canonical_entertainment_night"


@pytest.mark.parametrize(
    ("override", "rejection"),
    [
        ({"activity_state": "idle"}, "activity_not_entertainment"),
        ({"day_state": DAY_LATE_EVENING}, "day_phase"),
        ({"day_state": DAY_EARLY_MORNING}, "day_phase"),
    ],
)
def test_ps_entry_rejects_non_binding_context(override, rejection):
    values = dict(
        previous_bio=BIO_AWAKE,
        presence_personal=PERS_HOME,
        day_state=DAY_EARLY_NIGHT,
        activity_state=ACT_ENTERTAINMENT,
    )
    values.update(override)
    decision = provisional_sleep_decision(**values)
    assert decision.accepted is False
    assert rejection in decision.rejected_inputs


def test_running_entertainment_enters_ps_when_phase_crosses_into_night():
    evening = provisional_sleep_decision(
        previous_bio=BIO_AWAKE,
        presence_personal=PERS_HOME,
        day_state=DAY_LATE_EVENING,
        activity_state=ACT_ENTERTAINMENT,
    )
    night = provisional_sleep_decision(
        previous_bio=BIO_AWAKE,
        presence_personal=PERS_HOME,
        day_state=DAY_EARLY_NIGHT,
        activity_state=ACT_ENTERTAINMENT,
    )
    assert evening.accepted is False
    assert night.accepted is True


def test_entertainment_starting_during_night_enters_ps():
    idle = provisional_sleep_decision(
        previous_bio=BIO_AWAKE,
        presence_personal=PERS_HOME,
        day_state=DAY_LATE_NIGHT,
        activity_state="idle",
    )
    entertainment = provisional_sleep_decision(
        previous_bio=BIO_AWAKE,
        presence_personal=PERS_HOME,
        day_state=DAY_LATE_NIGHT,
        activity_state=ACT_ENTERTAINMENT,
    )
    assert idle.accepted is False
    assert entertainment.accepted is True


def test_ps_entry_has_no_individual_device_or_availability_gates():
    parameters = inspect.signature(provisional_sleep_decision).parameters
    assert set(parameters) == {
        "previous_bio",
        "presence_personal",
        "day_state",
        "activity_state",
    }


@pytest.mark.parametrize("bio", [BIO_PROVISIONAL_SLEEP, BIO_SLEEP])
def test_active_tv_keeps_activity_entertainment_in_sleep_context(bio):
    decision = compute_activity_decision(
        bio=bio,
        presence_personal=PERS_HOME,
        day_context="werktag",
        homeoffice=False,
        household_active=False,
        media_activity=ACT_ENTERTAINMENT,
        media_activity_quality="fresh",
        media_activity_last_updated=NOW,
        decision_timestamp=NOW,
        tv_active=True,
    )
    assert decision.winner == ACT_ENTERTAINMENT


def test_active_tv_sleep_activity_does_not_expire_with_media_feed_age():
    decision = compute_activity_decision(
        bio=BIO_PROVISIONAL_SLEEP,
        presence_personal=PERS_HOME,
        day_context="werktag",
        homeoffice=False,
        household_active=False,
        media_activity=None,
        decision_timestamp=NOW,
        tv_active=True,
    )
    assert decision.winner == ACT_ENTERTAINMENT


def test_canonical_entertainment_feed_keeps_ps_activity_without_tv_gate():
    decision = compute_activity_decision(
        bio=BIO_PROVISIONAL_SLEEP,
        presence_personal=PERS_HOME,
        day_context="werktag",
        homeoffice=False,
        household_active=False,
        media_activity=ACT_ENTERTAINMENT,
        media_activity_quality="fresh",
        media_activity_last_updated=NOW,
        decision_timestamp=NOW,
        tv_active=False,
        source_status={"configured:tv_active": "unavailable"},
    )
    assert decision.winner == ACT_ENTERTAINMENT


def test_sleep_without_active_tv_or_entertainment_remains_sleep_activity():
    decision = compute_activity_decision(
        bio=BIO_SLEEP,
        presence_personal=PERS_HOME,
        day_context="werktag",
        homeoffice=False,
        household_active=False,
        media_activity="idle",
        media_activity_quality="fresh",
        media_activity_last_updated=NOW,
        decision_timestamp=NOW,
        tv_active=False,
    )
    assert decision.winner == ACT_SLEEP


@pytest.mark.parametrize("source", ["pc", "ps5", "switch", "coffee", "shower", "door"])
def test_strong_wake_edges_are_time_independent(source):
    decision = regular_wake_interaction_decision(
        indicators={source: True},
        day_state=DAY_EARLY_NIGHT,
        indicator_active_since={source: NOW},
        sleep_started=REFERENCE,
    )
    assert decision.accepted is True
    assert decision.source == source


def test_window_edge_is_blocked_at_night_and_allowed_from_early_morning():
    night = regular_wake_interaction_decision(
        indicators={"window": True},
        day_state=DAY_LATE_NIGHT,
        indicator_active_since={"window": NOW},
        sleep_started=REFERENCE,
    )
    morning = regular_wake_interaction_decision(
        indicators={"window": True},
        day_state=DAY_EARLY_MORNING,
        indicator_active_since={"window": NOW},
        sleep_started=REFERENCE,
    )
    assert night.accepted is False
    assert night.rejection_reason == "day_phase_blocked"
    assert morning.accepted is True


@pytest.mark.parametrize("source", ["tv", "light", "motion", "homepods"])
def test_excluded_sources_never_become_wake_candidates(source):
    decision = regular_wake_interaction_decision(
        indicators={source: True},
        day_state=DAY_EARLY_MORNING,
        indicator_active_since={source: NOW},
        sleep_started=REFERENCE,
    )
    assert decision.accepted is False
    assert decision.rejection_reason == "no_active_signal"


def test_unknown_timestamp_is_never_a_fresh_edge():
    decision = regular_wake_interaction_decision(
        indicators={"pc": True},
        day_state=DAY_EARLY_MORNING,
        indicator_active_since={"pc": None},
        sleep_started=REFERENCE,
    )
    assert decision.accepted is False
    assert decision.freshness == "unknown_timestamp"


def test_confirmed_tv_off_promotes_ps_to_inferred_sleep():
    state, sleep_start, _ = compute_bio_state(
        prev_state=BIO_PROVISIONAL_SLEEP,
        wake_needed=False,
        indicators={},
        presence_personal=PERS_HOME,
        day_state=DAY_EARLY_NIGHT,
        now=NOW,
        prev_sleep_start=None,
        prev_awake_start=REFERENCE,
        indicator_active_since={},
        inferred_sleep=True,
        wake_due=False,
        interaction_reference_start=REFERENCE,
    )
    assert state == BIO_SLEEP
    assert sleep_start == NOW


@pytest.mark.parametrize("previous", [BIO_PROVISIONAL_SLEEP, BIO_SLEEP])
def test_ps_and_inferred_s_follow_regular_wake_due(previous):
    state, _, _ = compute_bio_state(
        prev_state=previous,
        wake_needed=False,
        indicators={},
        presence_personal=PERS_HOME,
        day_state=DAY_EARLY_MORNING,
        now=NOW,
        prev_sleep_start=REFERENCE if previous == BIO_SLEEP else None,
        prev_awake_start=None,
        indicator_active_since={},
        inferred_sleep=True,
        wake_due=True,
        interaction_reference_start=REFERENCE,
    )
    assert state == BIO_WAKING


def test_issue59_persistence_contract_roundtrip():
    state = PersistentState(
        bio_state=BIO_SLEEP,
        sleep_reference_start=REFERENCE.isoformat(),
        sleep_source="inferred_tv_off",
        sleep_confirmed=False,
        inferred_tv_off_at=NOW.isoformat(),
        observed_signal_states={"pc": False},
        indicator_active_since={"pc": None},
        opening_states={"living_window_left": "closed"},
    )
    assert PersistentState.from_dict(state.to_dict()) == state


@pytest.mark.parametrize("initial_bio", [BIO_AWAKE, BIO_PROVISIONAL_SLEEP])
def test_manual_sleep_command_sets_full_provenance_and_new_reference(
    initial_bio,
):
    previous_reference = (NOW - timedelta(minutes=20)).isoformat()
    persistent = PersistentState(
        bio_state=initial_bio,
        sleep_reference_start=previous_reference,
        sleep_source=None,
        sleep_confirmed=None,
        inferred_tv_off_at=(NOW - timedelta(minutes=10)).isoformat(),
    )
    apply_manual_bio_command(
        persistent,
        target=BIO_SLEEP,
        now_iso=NOW.isoformat(),
    )

    assert persistent.bio_state == BIO_SLEEP
    assert persistent.last_sleep_start == NOW.isoformat()
    assert persistent.sleep_reference_start == NOW.isoformat()
    assert persistent.sleep_reference_start != previous_reference
    assert persistent.sleep_source == "manual"
    assert persistent.sleep_confirmed is True
    assert persistent.inferred_tv_off_at is None
    assert PersistentState.from_dict(persistent.to_dict()) == persistent


def test_mark_sleep_service_delegates_to_canonical_bio_command():
    source = (
        Path(__file__).parents[1]
        / "custom_components"
        / "benni_core_state"
        / "services.py"
    ).read_text(encoding="utf-8")
    apply_body = source.split("async def _apply_bio", 1)[1].split(
        "\n\n\ndef async_register_services", 1
    )[0]
    assert "await coord.async_apply_bio_command(target)" in apply_body
    assert "coord._persistent" not in apply_body

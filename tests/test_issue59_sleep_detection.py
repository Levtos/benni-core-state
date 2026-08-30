"""Acceptance-contract tests for GitHub Issue #59."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

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
    DAY_LATE_NIGHT,
    PERS_HOME,
)
from custom_components.benni_core_state.logic import (
    compute_activity_decision,
    compute_bio_state,
    provisional_sleep_decision,
    regular_wake_interaction_decision,
)
from custom_components.benni_core_state.models import PersistentState


NOW = datetime(2026, 8, 30, 22, 0, tzinfo=timezone.utc)
REFERENCE = NOW - timedelta(minutes=30)


@pytest.mark.parametrize("phase", [DAY_EARLY_NIGHT, DAY_LATE_NIGHT])
def test_ps_enters_only_for_home_tv_only_night(phase):
    decision = provisional_sleep_decision(
        previous_bio=BIO_AWAKE,
        presence_personal=PERS_HOME,
        day_state=phase,
        tv_active=True,
        pc_active=False,
        ps5_active=False,
        switch_active=False,
    )
    assert decision.accepted is True


@pytest.mark.parametrize(
    ("override", "rejection"),
    [
        ({"tv_active": None}, "tv_unusable"),
        ({"tv_active": False}, "tv_not_active"),
        ({"pc_active": True}, "pc_active"),
        ({"ps5_active": True}, "ps5_active"),
        ({"switch_active": True}, "switch_active"),
        ({"day_state": DAY_EARLY_MORNING}, "day_phase"),
    ],
)
def test_ps_entry_is_fail_closed(override, rejection):
    values = dict(
        previous_bio=BIO_AWAKE,
        presence_personal=PERS_HOME,
        day_state=DAY_EARLY_NIGHT,
        tv_active=True,
        pc_active=False,
        ps5_active=False,
        switch_active=False,
    )
    values.update(override)
    decision = provisional_sleep_decision(**values)
    assert decision.accepted is False
    assert rejection in decision.rejected_inputs


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


def test_sleep_without_active_tv_remains_sleep_activity():
    decision = compute_activity_decision(
        bio=BIO_SLEEP,
        presence_personal=PERS_HOME,
        day_context="werktag",
        homeoffice=False,
        household_active=False,
        media_activity=ACT_ENTERTAINMENT,
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

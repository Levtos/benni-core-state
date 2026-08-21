"""Pure tests for the Core-State activity decision contract (#29)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
import inspect

import pytest

from custom_components.benni_core_state import logic
from custom_components.benni_core_state.const import (
    ACT_ENTERTAINMENT,
    ACT_FREE_TIME,
    ACT_GAMING,
    ACT_HOUSEHOLD,
    ACT_IDLE,
    ACT_MUSIC,
    ACT_PC_ACTIVE,
    ACT_PRIVATE,
    ACT_SLEEP,
    ACT_WAKING,
    ACT_WORK_AWAY,
    ACT_WORK_HOME,
    ACTIVITY_DECISION_CONTRACT_VERSION,
    ACTIVITY_PRECEDENCE,
    ACTIVITY_STATES,
    BIO_AWAKE,
    BIO_SLEEP,
    BIO_WAKING,
    DC_WERKTAG,
    PERS_HOME,
    DEFAULT_ACTIVITY_FEED_FRESHNESS_SECONDS,
)
from custom_components.benni_core_state.models import PersistentState


NOW = datetime(2026, 8, 7, 12, 0, tzinfo=timezone.utc)


def _decision(**overrides):
    values = {
        "bio": BIO_AWAKE,
        "presence_personal": PERS_HOME,
        "day_context": DC_WERKTAG,
        "homeoffice": False,
        "household_active": False,
        "media_activity": None,
        "decision_timestamp": NOW,
        "pc_active": False,
    }
    values.update(overrides)
    return logic.compute_activity_decision(**values)


def test_precedence_contract_is_exact_and_work_away_is_legacy_only():
    assert ACTIVITY_PRECEDENCE == (
        ACT_SLEEP,
        ACT_WAKING,
        ACT_PRIVATE,
        ACT_GAMING,
        ACT_ENTERTAINMENT,
        ACT_MUSIC,
        ACT_WORK_HOME,
        ACT_HOUSEHOLD,
        ACT_PC_ACTIVE,
        ACT_FREE_TIME,
        ACT_IDLE,
    )
    assert ACT_WORK_AWAY in ACTIVITY_STATES
    assert ACT_WORK_AWAY not in ACTIVITY_PRECEDENCE
    assert _decision().winner != ACT_WORK_AWAY


def test_activity_decision_has_no_completed_core_state_input():
    params = inspect.signature(logic.compute_activity_decision).parameters
    assert "activity_state" not in params


def test_sleep_and_waking_suppress_lower_candidates():
    sleep = _decision(
        bio=BIO_SLEEP,
        media_activity="gaming",
        media_activity_quality="fresh",
        homeoffice=True,
        household_active=True,
        pc_active=True,
    )
    waking = _decision(
        bio=BIO_WAKING,
        media_activity="gaming",
        media_activity_quality="fresh",
        homeoffice=True,
        household_active=True,
        pc_active=True,
    )
    assert sleep.winner == ACT_SLEEP
    assert waking.winner == ACT_WAKING
    assert ACT_GAMING in waking.suppressed_candidates


@pytest.mark.parametrize(
    ("expected", "overrides"),
    [
        (
            ACT_PRIVATE,
            {
                "media_activity": "private_time",
                "media_activity_quality": "fresh",
            },
        ),
        (
            ACT_GAMING,
            {
                "media_activity": "gaming",
                "media_activity_quality": "fresh",
                "pc_active": True,
            },
        ),
        (
            ACT_ENTERTAINMENT,
            {
                "media_activity": "entertainment",
                "media_activity_quality": "fresh",
                "pc_active": True,
            },
        ),
        (
            ACT_MUSIC,
            {
                "media_activity": "music",
                "media_activity_quality": "fresh",
                "pc_active": True,
            },
        ),
        (
            ACT_WORK_HOME,
            {"homeoffice": True, "household_active": True, "pc_active": True},
        ),
        (ACT_HOUSEHOLD, {"household_active": True, "pc_active": True}),
        (
            ACT_PC_ACTIVE,
            {
                "pc_active": True,
                "media_activity": "free_time",
                "media_activity_quality": "fresh",
            },
        ),
        (
            ACT_FREE_TIME,
            {"media_activity": "free_time", "media_activity_quality": "fresh"},
        ),
        (ACT_IDLE, {}),
    ],
)
def test_each_activity_bucket_uses_the_canonical_precedence(expected, overrides):
    assert _decision(**overrides).winner == expected


def test_private_time_can_only_come_from_media_feed():
    decision = _decision(
        media_activity="private_time",
        media_activity_quality="fresh",
        homeoffice=True,
        household_active=True,
        pc_active=True,
    )

    assert decision.winner == ACT_PRIVATE
    assert decision.input_sources[ACT_PRIVATE] == (
        "sensor.system_benni_media_state_activity_context",
    )
    assert all(
        "private_source" not in source
        for source in decision.input_sources[ACT_PRIVATE]
    )


def test_multiple_candidates_are_returned_in_precedence_order():
    decision = _decision(
        media_activity="music",
        media_activity_quality="fresh",
        homeoffice=True,
        household_active=True,
        pc_active=True,
    )

    assert decision.winner == ACT_MUSIC
    assert decision.valid_candidates == (
        ACT_MUSIC,
        ACT_WORK_HOME,
        ACT_HOUSEHOLD,
        ACT_PC_ACTIVE,
        ACT_IDLE,
    )
    assert decision.suppressed_candidates == decision.valid_candidates[1:]
    assert "outranks" in decision.precedence_reason


@pytest.mark.parametrize(
    ("feed_state", "overrides", "quality"),
    [
        (
            "gaming",
            {
                "media_activity_last_changed": NOW
                - timedelta(seconds=DEFAULT_ACTIVITY_FEED_FRESHNESS_SECONDS + 1)
            },
            "stale",
        ),
        ("unknown", {}, "unknown"),
        ("unavailable", {}, "unavailable"),
        ("gaming", {"media_activity_quality": "degraded"}, "degraded"),
    ],
)
def test_invalid_media_feed_values_cannot_win(feed_state, overrides, quality):
    decision = _decision(media_activity=feed_state, **overrides)
    assert decision.winner == ACT_IDLE
    assert ACT_GAMING not in decision.valid_candidates
    assert decision.quality_status == quality
    assert decision.fallback_reason
    assert (
        decision.freshness["sensor.system_benni_media_state_activity_context"]["status"]
        == quality
    )


def test_unavailable_local_source_cannot_create_a_candidate():
    decision = _decision(
        pc_active=True,
        source_status={"configured:pc_active": "unavailable"},
    )
    assert decision.winner == ACT_IDLE
    assert ACT_PC_ACTIVE not in decision.valid_candidates
    assert decision.quality_status == "unavailable"
    assert "configured:pc_active:unavailable" in decision.degraded_reason


def test_decision_projection_contains_required_diagnostics():
    decision = _decision(media_activity="music", media_activity_quality="fresh")
    attrs = decision.as_attributes()

    assert attrs["contract_version"] == ACTIVITY_DECISION_CONTRACT_VERSION
    assert attrs["winner"] == ACT_MUSIC
    assert attrs["valid_candidates"] == [ACT_MUSIC, ACT_IDLE]
    assert attrs["suppressed_candidates"] == [ACT_IDLE]
    assert attrs["precedence_reason"]
    assert attrs["input_sources"][ACT_MUSIC] == [
        "sensor.system_benni_media_state_activity_context"
    ]
    assert (
        attrs["freshness"]["sensor.system_benni_media_state_activity_context"]["status"]
        == "fresh"
    )
    assert attrs["quality_status"] == "fresh"
    assert attrs["degraded_reason"] is None
    assert attrs["fallback_reason"] is None
    assert attrs["decision_timestamp"] == NOW.isoformat()


def test_missing_feed_has_deterministic_fallback_and_no_media_winner():
    decision = _decision(media_activity=None)
    assert decision.winner == ACT_IDLE
    assert decision.valid_candidates == (ACT_IDLE,)
    assert decision.precedence_reason == "fallback: no valid higher-priority candidate"
    assert decision.fallback_reason == "media_feed_unknown"
    assert decision.quality_status == "unknown"


def test_activity_decision_is_recomputed_after_restart_and_not_persisted():
    first = _decision(media_activity="music", media_activity_quality="fresh")
    second = logic.compute_activity_decision(
        bio=BIO_AWAKE,
        presence_personal=PERS_HOME,
        day_context=DC_WERKTAG,
        homeoffice=False,
        household_active=False,
        media_activity="music",
        media_activity_quality="fresh",
        decision_timestamp=NOW + timedelta(minutes=5),
    )

    assert first.winner == second.winner == ACT_MUSIC
    assert first.decision_timestamp != second.decision_timestamp
    stored = PersistentState().to_dict()
    assert "activity_state" not in stored
    assert "activity_decision" not in stored


def test_media_feed_uses_last_updated_for_stable_owner_state():
    decision = _decision(
        media_activity="gaming",
        media_activity_last_changed=NOW
        - timedelta(seconds=DEFAULT_ACTIVITY_FEED_FRESHNESS_SECONDS + 1),
        media_activity_last_updated=NOW,
    )

    assert decision.winner == ACT_GAMING
    feed = decision.freshness["sensor.system_benni_media_state_activity_context"]
    assert feed["status"] == "fresh"
    assert feed["updated_at"] == NOW.isoformat()

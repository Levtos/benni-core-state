"""Focused tests for the pure #26 Wake-Planning-Shadow."""

from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone
import json

from custom_components.benni_core_state.wake_planning import (
    COMPARISON_CORE_UNAVAILABLE,
    COMPARISON_DIFFERENT,
    COMPARISON_LEGACY_UNAVAILABLE,
    COMPARISON_NOT_DECIDABLE,
    COMPARISON_SAME,
    CONFLICT_WAKE_EARLIER,
    CONFLICT_WARN_ONLY,
    WakeCalendarDecision,
    WakeHoliday,
    WakeInputStatus,
    WakePlanningInputs,
    WakeRule,
    calendar_decisions_from_events,
    compare_shadow,
    default_rules,
    legacy_reference_from_values,
    parse_manual_holiday_dates,
    parse_rules,
    plan_wake,
)
from custom_components.benni_core_state.mapping import (
    mapping_for,
    render_entity_id,
    render_unique_id,
)


BERLIN = timezone(timedelta(hours=1), "Europe/Berlin")


def _inputs(
    local_now: datetime,
    *,
    rules: tuple[WakeRule, ...] | None = None,
    holidays: dict[date, WakeHoliday] | None = None,
    calendar_decisions: dict[date, WakeCalendarDecision] | None = None,
    window: int | None = 5,
    floor: time | None = time(6, 0),
    conflict: str = CONFLICT_WARN_ONLY,
    statuses: tuple[WakeInputStatus, ...] = (),
    day_state: str | None = "early_morning",
) -> WakePlanningInputs:
    return WakePlanningInputs(
        now=local_now,
        day_state=day_state,
        rules=default_rules() if rules is None else rules,
        holidays=holidays or {},
        calendar_decisions=calendar_decisions or {},
        wake_window_minutes=window,
        floor_time=floor,
        calendar_conflict_behavior=conflict,
        source_status=statuses,
    )


def test_weekday_uses_weekday_profile() -> None:
    plan = plan_wake(_inputs(datetime(2026, 8, 7, 5, 0, tzinfo=BERLIN)))

    assert plan.state == "scheduled"
    assert plan.wake_time == time(7)
    assert plan.automatic_day_profile == "weekday"
    assert plan.matched_rule_id == "profile_weekday"
    assert plan.holiday_active is False


def test_saturday_is_weekend_and_holiday_projection_is_explicit() -> None:
    plan = plan_wake(_inputs(datetime(2026, 8, 8, 5, 0, tzinfo=BERLIN)))

    assert plan.automatic_day_profile == "weekend"
    assert plan.wake_time == time(9, 30)
    assert plan.holiday_active is True
    assert plan.holiday_name == "Weekend"


def test_weekday_holiday_projects_to_weekend_profile() -> None:
    holiday = WakeHoliday(
        is_holiday=True,
        name="private calendar title must not leak",
        source="calendar.holidays",
    )
    plan = plan_wake(
        _inputs(
            datetime(2026, 8, 10, 5, 0, tzinfo=BERLIN),
            holidays={date(2026, 8, 10): holiday},
        )
    )

    assert plan.automatic_day_profile == "weekend"
    assert plan.wake_time == time(9, 30)
    assert plan.matched_rule_id == "profile_holiday"
    assert plan.holiday_name == "Holiday calendar"


def test_manual_interval_represents_vacation_without_public_vacation_id() -> None:
    holidays = parse_manual_holiday_dates(
        "2026-08-10..2026-08-12", date(2026, 8, 10), date(2026, 8, 12)
    )
    plan = plan_wake(
        _inputs(datetime(2026, 8, 11, 5, 0, tzinfo=BERLIN), holidays=holidays)
    )

    assert plan.vacation is True
    assert plan.automatic_day_profile == "weekend"
    assert plan.wake_time == time(9, 30)
    assert plan.source_basis["raw_data"].startswith("none")


def test_absolute_floor_is_independent_of_day_state() -> None:
    early_rule = (
        WakeRule(
            id="early",
            name="Early",
            weekdays=frozenset(range(7)),
            wake_time=time(4, 30),
        ),
    )
    before = plan_wake(
        _inputs(
            datetime(2026, 8, 7, 4, 0, tzinfo=BERLIN),
            rules=early_rule,
            day_state="early_night",
        )
    )
    after = plan_wake(
        _inputs(
            datetime(2026, 8, 7, 4, 0, tzinfo=BERLIN),
            rules=early_rule,
            day_state="late_evening",
        )
    )

    assert before.wake_time == after.wake_time == time(6)
    assert before.floor_applied is after.floor_applied is True
    assert before.next_wake == after.next_wake


def test_configurable_wake_window_is_inclusive() -> None:
    rule = (
        WakeRule(
            id="wake",
            name="Wake",
            weekdays=frozenset(range(7)),
            wake_time=time(6),
        ),
    )
    at_start = plan_wake(
        _inputs(datetime(2026, 8, 7, 5, 55, tzinfo=BERLIN), rules=rule, window=5)
    )
    at_end = plan_wake(
        _inputs(datetime(2026, 8, 7, 6, 5, tzinfo=BERLIN), rules=rule, window=5)
    )
    outside = plan_wake(
        _inputs(datetime(2026, 8, 7, 6, 6, tzinfo=BERLIN), rules=rule, window=5)
    )

    assert at_start.wake_needed is True
    assert at_end.wake_needed is True
    assert outside.wake_needed is False


def test_minimum_sleep_is_exposed_for_the_phase_1_sleep_window() -> None:
    plan = plan_wake(
        _inputs(datetime(2026, 8, 7, 5, 0, tzinfo=BERLIN))
    )

    assert plan.minimum_sleep_minutes is None
    assert plan.minimum_sleep_status == "missing"


def test_calendar_wake_and_skip_markers_are_deterministic() -> None:
    day = date(2026, 8, 7)
    wake = plan_wake(
        _inputs(
            datetime(2026, 8, 7, 5, 0, tzinfo=BERLIN),
            calendar_decisions={day: WakeCalendarDecision(wake_time=time(6, 30))},
        )
    )
    skip = plan_wake(
        _inputs(
            datetime(2026, 8, 7, 5, 0, tzinfo=BERLIN),
            calendar_decisions={day: WakeCalendarDecision(skip=True)},
        )
    )

    assert wake.decided_by == "calendar"
    assert wake.wake_time == time(6, 30)
    assert skip.state == "skipped"
    assert skip.wake_time is None


def test_early_calendar_conflict_warns_without_changing_wake() -> None:
    day = date(2026, 8, 7)
    plan = plan_wake(
        _inputs(
            datetime(2026, 8, 7, 5, 0, tzinfo=BERLIN),
            calendar_decisions={day: WakeCalendarDecision(early_event_time=time(6, 30))},
        )
    )

    assert plan.wake_time == time(7)
    assert plan.calendar_conflict is True
    assert plan.calendar_suggested_wake_time == time(5, 30)
    assert plan.reason == "calendar_conflict_warn_only"


def test_early_calendar_conflict_can_wake_earlier_but_floor_still_applies() -> None:
    day = date(2026, 8, 7)
    plan = plan_wake(
        _inputs(
            datetime(2026, 8, 7, 5, 0, tzinfo=BERLIN),
            calendar_decisions={day: WakeCalendarDecision(early_event_time=time(6, 30))},
            conflict=CONFLICT_WAKE_EARLIER,
        )
    )

    assert plan.decided_by == "calendar_conflict"
    assert plan.wake_time == time(6)
    assert plan.floor_applied is True
    assert plan.calendar_conflict is True


def test_date_period_and_cycle_rules_match_boundaries() -> None:
    rules = (
        WakeRule(
            id="date",
            name="Date",
            priority=10,
            date_from=date(2026, 8, 10),
            date_to=date(2026, 8, 12),
            wake_time=time(8),
        ),
        WakeRule(
            id="cycle",
            name="Cycle",
            priority=20,
            weekdays=frozenset(range(7)),
            cycle_anchor=date(2026, 8, 10),
            cycle_length=4,
            cycle_slot_start=3,
            cycle_slot_length=1,
            wake_time=time(9),
        ),
        WakeRule(
            id="fallback",
            name="Fallback",
            priority=100,
            weekdays=frozenset(range(7)),
            wake_time=time(10),
        ),
    )

    assert plan_wake(_inputs(datetime(2026, 8, 10, 1, tzinfo=BERLIN), rules=rules)).wake_time == time(8)
    assert plan_wake(_inputs(datetime(2026, 8, 11, 1, tzinfo=BERLIN), rules=rules)).wake_time == time(8)
    assert plan_wake(_inputs(datetime(2026, 8, 13, 1, tzinfo=BERLIN), rules=rules)).wake_time == time(9)
    assert plan_wake(_inputs(datetime(2026, 8, 14, 1, tzinfo=BERLIN), rules=rules)).wake_time == time(10)


def test_local_calendar_date_and_year_boundary_are_preserved() -> None:
    local_now = datetime(2026, 12, 31, 23, 59, tzinfo=BERLIN)
    plan = plan_wake(_inputs(local_now))

    assert plan.calendar_date == date(2026, 12, 31)
    assert plan.next_wake is not None
    assert plan.next_wake.date() == date(2027, 1, 1)
    assert plan.next_wake.tzinfo is not None


def test_dst_boundary_keeps_local_timestamp_aware() -> None:
    plan = plan_wake(_inputs(datetime(2026, 3, 29, 0, 30, tzinfo=BERLIN)))

    assert plan.next_wake is not None
    assert plan.next_wake.date() == date(2026, 3, 29)
    assert plan.next_wake.hour == 9
    assert plan.next_wake.tzinfo is not None


def test_missing_invalid_and_stale_inputs_are_visible() -> None:
    missing = plan_wake(
        _inputs(
            datetime(2026, 8, 7, 5, 0, tzinfo=BERLIN),
            rules=(),
        )
    )
    invalid_rules = parse_rules([{"id": "bad", "action": "wake", "wake_time": "99:99"}])
    invalid = plan_wake(
        _inputs(datetime(2026, 8, 7, 5, 0, tzinfo=BERLIN), rules=invalid_rules.rules)
    )
    stale_status = (
        WakeInputStatus(
            name="holiday",
            source="binary_sensor.wake_planner_benni_holiday_active",
            observed_at=datetime(2026, 8, 1, tzinfo=BERLIN),
            max_age_seconds=60,
        ),
    )
    stale = plan_wake(
        _inputs(datetime(2026, 8, 7, 5, 0, tzinfo=BERLIN), statuses=stale_status)
    )

    assert missing.source_status == "unavailable"
    assert missing.reason == "wake_rules_unavailable"
    assert invalid.source_status == "unavailable"
    assert stale.source_status == "stale"
    assert stale.source_quality == "stale_input"


def test_naive_time_and_mismatched_calendar_date_are_invalid() -> None:
    naive = plan_wake(_inputs(datetime(2026, 8, 7, 5, 0)))
    explicit = WakePlanningInputs(
        now=datetime(2026, 8, 7, 5, 0, tzinfo=BERLIN),
        calendar_date=date(2026, 8, 8),
        day_state="early_morning",
        rules=default_rules(),
    )

    assert naive.source_status == "invalid"
    assert plan_wake(explicit).reason == "local_calendar_date_mismatch"


def test_deterministic_result_and_no_private_calendar_title_in_diagnostics() -> None:
    events = [
        {
            "summary": "Benni private appointment 05:45",
            "start": {"dateTime": "2026-08-07T05:45:00+02:00"},
        }
    ]
    decisions = calendar_decisions_from_events(events)
    first = plan_wake(
        _inputs(
            datetime(2026, 8, 7, 5, 0, tzinfo=BERLIN),
            calendar_decisions=decisions,
        )
    )
    second = plan_wake(
        _inputs(
            datetime(2026, 8, 7, 5, 0, tzinfo=BERLIN),
            calendar_decisions=decisions,
        )
    )

    assert first == second
    assert "private appointment" not in json.dumps(first.as_attributes())


def test_shadow_comparison_covers_all_gate_statuses() -> None:
    plan = plan_wake(_inputs(datetime(2026, 8, 7, 5, 0, tzinfo=BERLIN)))
    same = compare_shadow(
        plan,
        legacy_reference_from_values(
            state="scheduled",
            wake_time="07:00",
            next_wake=plan.next_wake,
            wake_needed=False,
            holiday_active=False,
            now=plan.calculated_at,
        ),
    )
    different = compare_shadow(
        plan,
        legacy_reference_from_values(
            state="scheduled",
            wake_time="06:30",
            next_wake=plan.next_wake,
            wake_needed=False,
            holiday_active=False,
            now=plan.calculated_at,
        ),
    )
    undecidable = compare_shadow(
        plan,
        legacy_reference_from_values(
            state="overridden",
            next_wake=plan.next_wake,
            now=plan.calculated_at,
        ),
    )
    unavailable = compare_shadow(plan, None)
    core_unavailable = compare_shadow(
        plan_wake(_inputs(plan.calculated_at, rules=())),
        None,
    )

    assert same.status == COMPARISON_SAME
    assert different.status == COMPARISON_DIFFERENT
    assert different.field_diffs["wake_time"]
    assert undecidable.status == COMPARISON_NOT_DECIDABLE
    assert unavailable.status == COMPARISON_LEGACY_UNAVAILABLE
    assert core_unavailable.status == COMPARISON_CORE_UNAVAILABLE


def test_canonical_shadow_entity_domain_and_unique_id_contract() -> None:
    expected = {
        "wake_state": ("sensor.benni_core_state_wake_state", "sensor"),
        "next_wake": ("sensor.benni_core_state_next_wake", "sensor"),
        "wake_needed": ("binary_sensor.benni_core_state_wake_needed", "binary_sensor"),
        "holiday_active": (
            "binary_sensor.benni_core_state_holiday_active",
            "binary_sensor",
        ),
    }
    for key, (entity_id, domain) in expected.items():
        mapping = mapping_for(key)
        assert mapping is not None
        assert render_entity_id(key) == entity_id
        assert mapping.domain == domain
        assert render_unique_id(key, "entry-26") == f"benni_core_state_entry-26_{key}"
        assert "system_" not in entity_id


def test_shadow_attributes_contain_diagnostic_contract_and_comparison() -> None:
    plan = plan_wake(_inputs(datetime(2026, 8, 7, 5, 0, tzinfo=BERLIN)))
    comparison = compare_shadow(plan, None)
    attrs = plan.as_attributes(comparison)

    for key in (
        "state",
        "source",
        "reason",
        "calculated_at",
        "automatic_day_profile",
        "wake_window_minutes",
        "minimum_sleep_status",
        "source_status",
        "comparison_status",
        "old_decision",
        "core_decision",
        "field_diff",
    ):
        assert key in attrs
    assert attrs["comparison_status"] == COMPARISON_LEGACY_UNAVAILABLE

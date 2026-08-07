from datetime import datetime
from zoneinfo import ZoneInfo

from custom_components.benni_core_state.const import (
    BIO_AWAKE,
    BIO_PROVISIONAL_SLEEP,
    BIO_SLEEP,
    BIO_WAKING,
    DAY_FORENOON,
    PERS_HOME,
)
from custom_components.benni_core_state.logic import compute_bio_state
from custom_components.benni_core_state.sleep_window import plan_sleep_window


UTC = ZoneInfo("UTC")
BERLIN = ZoneInfo("Europe/Berlin")
NO_INDICATORS = {
    "pc": False,
    "ps5": False,
    "coffee": False,
    "door": False,
    "homeoffice": False,
}


def _plan(
    now: datetime,
    *,
    wake: datetime,
    window: int = 0,
    sleep: datetime | None = None,
    minimum: int | None = 360,
    lead: int | None = 540,
):
    return plan_sleep_window(
        now=now,
        scheduled_wake=wake,
        wake_window_minutes=window,
        manual_sleep_start=sleep,
        minimum_sleep_minutes=minimum,
        provisional_lead_minutes=lead,
    )


def _bio(
    previous: str,
    *,
    now: datetime,
    provisional_active: bool = False,
    wake_due: bool | None = False,
):
    return compute_bio_state(
        prev_state=previous,
        wake_needed=False,
        indicators=NO_INDICATORS,
        presence_personal=PERS_HOME,
        day_state=DAY_FORENOON,
        now=now,
        prev_sleep_start=None,
        prev_awake_start=None,
        provisional_active=provisional_active,
        wake_due=wake_due,
    )


def test_provisional_start_is_e_minus_a_across_midnight():
    plan = _plan(
        datetime(2026, 8, 6, 23, 30, tzinfo=BERLIN),
        wake=datetime(2026, 8, 7, 8, 30, tzinfo=BERLIN),
    )

    assert plan.earliest_wake == datetime(2026, 8, 7, 8, 30, tzinfo=BERLIN)
    assert plan.provisional_start == datetime(2026, 8, 6, 23, 30, tzinfo=BERLIN)
    assert plan.provisional_active is True
    assert plan.as_attributes()["counts_as_sleep"] is False
    assert plan.as_attributes()["inferred_sleep"] is False


def test_manual_sleep_plus_minimum_moves_effective_earliest_inside_window():
    sleep = datetime(2026, 8, 7, 5, 10, tzinfo=BERLIN)
    plan = _plan(
        datetime(2026, 8, 7, 10, 0, tzinfo=BERLIN),
        wake=datetime(2026, 8, 7, 10, 30, tzinfo=BERLIN),
        window=60,
        sleep=sleep,
    )

    assert plan.earliest_wake == datetime(2026, 8, 7, 9, 30, tzinfo=BERLIN)
    assert plan.latest_wake == datetime(2026, 8, 7, 11, 30, tzinfo=BERLIN)
    assert plan.minimum_reached_at == datetime(2026, 8, 7, 11, 10, tzinfo=BERLIN)
    assert plan.effective_earliest_wake == datetime(
        2026, 8, 7, 11, 10, tzinfo=BERLIN
    )
    assert plan.actual_wake_start == datetime(2026, 8, 7, 11, 10, tzinfo=BERLIN)
    assert plan.minimum_unmet is False


def test_hard_l_wins_and_reports_unmet_minimum():
    sleep = datetime(2026, 8, 7, 6, 0, tzinfo=BERLIN)
    plan = _plan(
        datetime(2026, 8, 7, 11, 30, tzinfo=BERLIN),
        wake=datetime(2026, 8, 7, 10, 30, tzinfo=BERLIN),
        window=60,
        sleep=sleep,
    )

    assert plan.minimum_reached_at == datetime(2026, 8, 7, 12, 0, tzinfo=BERLIN)
    assert plan.actual_wake_start == datetime(2026, 8, 7, 11, 30, tzinfo=BERLIN)
    assert plan.hard_l_applied is True
    assert plan.minimum_unmet is True
    assert plan.wake_due is True
    assert plan.reason == "hard_l_minimum_sleep_unmet"


def test_missing_values_are_visible_and_never_guessed():
    plan = _plan(
        datetime(2026, 8, 7, 0, 0, tzinfo=BERLIN),
        wake=datetime(2026, 8, 7, 8, 30, tzinfo=BERLIN),
        minimum=None,
        lead=None,
    )

    assert plan.available is False
    assert plan.source_status == "unavailable"
    assert plan.reason == "missing_minimum_sleep"
    assert plan.provisional_active is False
    assert plan.wake_due is False


def test_unavailable_wake_source_stays_unavailable_for_legacy_fallback():
    plan = plan_sleep_window(
        now=datetime(2026, 8, 7, 0, 0, tzinfo=BERLIN),
        scheduled_wake=datetime(2026, 8, 7, 8, 30, tzinfo=BERLIN),
        wake_window_minutes=0,
        manual_sleep_start=None,
        minimum_sleep_minutes=360,
        provisional_lead_minutes=540,
        wake_source_status="unavailable",
        wake_source_quality="missing_rules",
    )

    assert plan.source_status == "unavailable"
    assert plan.source_quality == "missing_rules"
    assert plan.available is False
    assert plan.as_attributes()["source_status"] == "unavailable"


def test_elapsed_duration_is_restart_safe_across_spring_dst():
    plan = _plan(
        datetime(2026, 3, 28, 22, 30, tzinfo=BERLIN),
        wake=datetime(2026, 3, 29, 8, 30, tzinfo=BERLIN),
    )

    assert plan.provisional_start == datetime(2026, 3, 28, 22, 30, tzinfo=BERLIN)
    assert (
        plan.earliest_wake.astimezone(UTC)
        - plan.provisional_start.astimezone(UTC)
    ).total_seconds() == 9 * 3600


def test_awake_enters_provisional_without_creating_sleep_start():
    state, sleep_start, _ = _bio(
        BIO_AWAKE,
        now=datetime(2026, 8, 6, 23, 30, tzinfo=UTC),
        provisional_active=True,
    )

    assert state == BIO_PROVISIONAL_SLEEP
    assert sleep_start is None


def test_manual_sleep_and_provisional_both_start_waking_at_calculated_wake():
    now = datetime(2026, 8, 7, 8, 30, tzinfo=UTC)

    assert _bio(BIO_SLEEP, now=now, wake_due=True)[0] == BIO_WAKING
    assert _bio(BIO_PROVISIONAL_SLEEP, now=now, wake_due=True)[0] == BIO_WAKING

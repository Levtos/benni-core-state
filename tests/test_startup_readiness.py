"""Pure contract tests for the process-wide Startup-/Apply-Readiness gate."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from custom_components.benni_core_state.startup_readiness import (
    REASON_DELAY_ELAPSED,
    REASON_LATE_LOAD,
    STARTUP_PHASE_READY,
    StartupReadinessState,
)


BASE = datetime(2026, 8, 6, 7, 35, tzinfo=timezone.utc)


def at(seconds: int) -> datetime:
    return BASE + timedelta(seconds=seconds)


def test_gate_is_off_at_89_seconds_and_on_at_90_seconds() -> None:
    state = StartupReadinessState(startup_delay=90)

    assert state.snapshot(now_monotonic=0).state == "off"
    assert state.mark_started(now_monotonic=0, now=at(0)) is True
    assert state.evaluate(now_monotonic=89, now=at(89)) is False
    assert state.snapshot(now_monotonic=89).state == "off"

    assert state.evaluate(now_monotonic=90, now=at(90)) is True
    snapshot = state.snapshot(now_monotonic=90)
    assert snapshot.state == "on"
    assert snapshot.startup_phase == STARTUP_PHASE_READY
    assert snapshot.reason == REASON_DELAY_ELAPSED
    assert snapshot.transition_count == 1


def test_repeated_started_events_do_not_restart_the_timer() -> None:
    state = StartupReadinessState(startup_delay=90)

    assert state.mark_started(now_monotonic=100, now=at(0)) is True
    assert state.mark_started(now_monotonic=110, now=at(10)) is False
    assert state.evaluate(now_monotonic=189, now=at(89)) is False
    assert state.evaluate(now_monotonic=190, now=at(90)) is True
    assert state.snapshot(now_monotonic=190).transition_count == 1


def test_late_load_accounts_for_already_elapsed_homeassistant_runtime() -> None:
    state = StartupReadinessState(startup_delay=90)

    assert state.mark_late_load(now_monotonic=43_200, now=at(43_200)) is True
    snapshot = state.snapshot(now_monotonic=43_200)

    assert snapshot.state == "on"
    assert snapshot.startup_phase == STARTUP_PHASE_READY
    assert snapshot.reason == REASON_LATE_LOAD
    assert snapshot.startup_elapsed_s == 90
    assert snapshot.startup_started_at is None
    assert snapshot.transition_count == 1


def test_reload_after_ready_keeps_the_reached_state() -> None:
    state = StartupReadinessState(startup_delay=90)
    state.mark_started(now_monotonic=0, now=at(0))
    assert state.evaluate(now_monotonic=90, now=at(90)) is True

    assert state.mark_started(now_monotonic=1000, now=at(1000)) is False
    assert state.evaluate(now_monotonic=1001, now=at(1001)) is False
    snapshot = state.snapshot(now_monotonic=1001)
    assert snapshot.state == "on"
    assert snapshot.transition_count == 1


def test_new_process_starts_off_again() -> None:
    state = StartupReadinessState(startup_delay=90)

    assert state.snapshot(now_monotonic=0).state == "off"
    assert state.mark_started(now_monotonic=0, now=at(0)) is True
    assert state.snapshot(now_monotonic=89).state == "off"


def test_unknown_or_unavailable_source_states_do_not_create_readiness() -> None:
    # The central gate has no source-state fallback.  Before the lifecycle
    # event it remains off, regardless of what old YAML sources report.
    state = StartupReadinessState(startup_delay=90)

    for _legacy_source_state in ("unknown", "unavailable", "off"):
        assert state.snapshot(now_monotonic=86_400).state == "off"

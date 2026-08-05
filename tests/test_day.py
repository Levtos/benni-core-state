"""Deterministic nine-phase local-calendar accordion contract."""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone, tzinfo

from custom_components.benni_core_state import logic
from custom_components.benni_core_state.const import (
    DAY_AFTERNOON,
    DAY_EARLY_MORNING,
    DAY_EARLY_NIGHT,
    DAY_EVENING,
    DAY_FORENOON,
    DAY_LATE_AFTERNOON,
    DAY_LATE_EVENING,
    DAY_LATE_NIGHT,
    DAY_MIDDAY,
    DAY_STATES,
    DC_FREI,
    DC_WERKTAG,
    DC_WOCHENENDE,
)


class _EuropeBerlin(tzinfo):
    """Minimal deterministic CET/CEST tzinfo for tests without tzdata."""

    @staticmethod
    def _last_sunday(year: int, month: int) -> date:
        if month == 12:
            first_next = date(year + 1, 1, 1)
        else:
            first_next = date(year, month + 1, 1)
        return first_next - timedelta(days=(first_next.weekday() + 1) % 7)

    def _dst_start(self, year: int) -> datetime:
        return datetime(year, 3, self._last_sunday(year, 3).day, 2)

    def _dst_end(self, year: int) -> datetime:
        return datetime(year, 10, self._last_sunday(year, 10).day, 3)

    def dst(self, value: datetime | None) -> timedelta:
        if value is None:
            return timedelta(0)
        wall = value.replace(tzinfo=None)
        return (
            timedelta(hours=1)
            if self._dst_start(wall.year) <= wall < self._dst_end(wall.year)
            else timedelta(0)
        )

    def utcoffset(self, value: datetime | None) -> timedelta:
        return timedelta(hours=1) + self.dst(value)

    def tzname(self, value: datetime | None) -> str:
        return "CEST" if self.dst(value) else "CET"


BERLIN = _EuropeBerlin()


def _at(
    year: int,
    month: int,
    day: int,
    hour: int = 0,
    minute: int = 0,
    second: int = 0,
    *,
    tz=BERLIN,
) -> datetime:
    return datetime(year, month, day, hour, minute, second, tzinfo=tz)


def _at_date(value: date, hour: int = 12) -> datetime:
    return _at(value.year, value.month, value.day, hour)


def _clock(starts: dict[str, datetime]) -> dict[str, str]:
    return {
        phase: (starts[phase] + timedelta(seconds=30)).strftime("%H:%M")
        for phase in starts
    }


def _wall_seconds(value: datetime) -> float:
    return (
        value.hour * 3600
        + value.minute * 60
        + value.second
        + value.microsecond / 1_000_000
    )


def _boundary_signature(starts: dict[str, datetime]) -> tuple[float, ...]:
    return tuple(_wall_seconds(starts[phase]) for phase in logic.DAY_PHASE_ORDER)


def _assert_ordered_across_midnight(local_now: datetime) -> dict[str, datetime]:
    starts = logic.compute_day_phase_starts(local_now)
    ordered = [starts[phase].replace(tzinfo=None) for phase in logic.DAY_PHASE_ORDER]
    assert ordered == sorted(ordered)
    assert all(current > previous for previous, current in zip(ordered, ordered[1:]))

    next_day = local_now.date() + timedelta(days=1)
    next_early_night = logic.compute_day_phase_starts(_at_date(next_day))[
        DAY_EARLY_NIGHT
    ].replace(tzinfo=None)
    assert next_early_night > ordered[-1]
    return starts


def _iter_dates(year: int):
    current = date(year, 1, 1)
    end = date(year + 1, 1, 1)
    while current < end:
        yield current
        current += timedelta(days=1)


def test_day_state_has_exactly_nine_ordered_phases():
    starts = logic.compute_day_phase_starts(_at(2026, 6, 21))

    assert len(DAY_STATES) == 9
    assert list(starts) == DAY_STATES
    assert tuple(starts) == logic.DAY_PHASE_ORDER


def test_winter_and_summer_reference_profiles_use_the_accordion_model():
    winter = logic.compute_day_phase_starts(_at(2026, 12, 21))
    summer = logic.compute_day_phase_starts(_at(2026, 6, 21))

    assert _clock(winter) == {
        DAY_EARLY_NIGHT: "00:00",
        DAY_LATE_NIGHT: "04:00",
        DAY_EARLY_MORNING: "06:00",
        DAY_FORENOON: "09:00",
        DAY_MIDDAY: "12:00",
        DAY_AFTERNOON: "14:00",
        DAY_LATE_AFTERNOON: "16:00",
        DAY_EVENING: "18:00",
        DAY_LATE_EVENING: "21:00",
    }
    assert _clock(summer) == {
        DAY_EARLY_NIGHT: "01:49",
        DAY_LATE_NIGHT: "03:48",
        DAY_EARLY_MORNING: "04:47",
        DAY_FORENOON: "08:13",
        DAY_MIDDAY: "11:39",
        DAY_AFTERNOON: "14:05",
        DAY_LATE_AFTERNOON: "16:31",
        DAY_EVENING: "18:57",
        DAY_LATE_EVENING: "22:23",
    }
    assert all(
        _wall_seconds(summer[phase]) != _wall_seconds(winter[phase])
        for phase in logic.DAY_PHASE_ORDER
    )
    assert summer[DAY_EARLY_NIGHT].strftime("%H:%M:%S") == "01:49:12"
    assert summer[DAY_MIDDAY].strftime("%H:%M:%S") == "11:39:12"


def test_equinoxes_are_halfway_profiles_not_fixed_boundaries():
    expected = {
        DAY_EARLY_NIGHT: "00:55",
        DAY_LATE_NIGHT: "03:54",
        DAY_EARLY_MORNING: "05:24",
        DAY_FORENOON: "08:37",
        DAY_MIDDAY: "11:50",
        DAY_AFTERNOON: "14:03",
        DAY_LATE_AFTERNOON: "16:16",
        DAY_EVENING: "18:29",
        DAY_LATE_EVENING: "21:42",
    }

    for month, day, segment in (
        (3, 21, "spring_equinox"),
        (9, 23, "autumn_equinox"),
    ):
        now = _at(2026, month, day, 12)
        starts = logic.compute_day_phase_starts(now)
        diagnostics = logic.compute_day_phase_diagnostics(now, DAY_MIDDAY)
        assert _clock(starts) == expected
        assert diagnostics["season_parameters"]["fraction"] == 0.5
        assert diagnostics["season_parameters"]["segment"] == segment
        assert diagnostics["season_parameters"]["non_night_extension_seconds"] == 5460.0


def test_all_nine_boundaries_are_inclusive_deterministic_and_carry_late_evening():
    local_now = _at(2026, 6, 21, 12)
    starts = _assert_ordered_across_midnight(local_now)

    for phase, start in starts.items():
        assert logic.compute_day_state(start) == phase
        assert logic.compute_day_phase_starts(start) == starts

    for phase, start in starts.items():
        before = start - timedelta(seconds=1)
        previous = DAY_LATE_EVENING if phase == DAY_EARLY_NIGHT else None
        if previous is None:
            previous = logic.DAY_PHASE_ORDER[logic.DAY_PHASE_ORDER.index(phase) - 1]
        assert logic.compute_day_state(before) == previous

    assert logic.compute_day_state(_at(2026, 6, 21, 0, 30)) == DAY_LATE_EVENING
    assert logic.compute_day_state(starts[DAY_EARLY_NIGHT]) == DAY_EARLY_NIGHT


def test_normal_and_leap_year_runs_keep_boundaries_ordered_and_moving():
    for year in (2025, 2024):
        previous_signature: tuple[float, ...] | None = None
        for calendar_day in _iter_dates(year):
            starts = _assert_ordered_across_midnight(_at_date(calendar_day))
            signature = _boundary_signature(starts)
            if previous_signature is not None:
                assert all(
                    current != previous
                    for current, previous in zip(signature, previous_signature)
                ), calendar_day
            previous_signature = signature


def test_normal_and_leap_year_transition_dates_are_explicitly_covered():
    for year, expected_days in (
        (2025, (date(2025, 2, 28), date(2025, 3, 1))),
        (2024, (date(2024, 2, 28), date(2024, 2, 29), date(2024, 3, 1))),
    ):
        signatures = []
        for calendar_day in expected_days:
            starts = _assert_ordered_across_midnight(_at_date(calendar_day))
            signatures.append(_boundary_signature(starts))
        for previous, current in zip(signatures, signatures[1:]):
            assert all(
                current_boundary != previous_boundary
                for current_boundary, previous_boundary in zip(current, previous)
            )

    december = _assert_ordered_across_midnight(_at(2025, 12, 31, 12))
    january = _assert_ordered_across_midnight(_at(2026, 1, 1, 12))
    assert _boundary_signature(december) != _boundary_signature(january)


def test_cet_cest_days_change_utc_offsets_not_local_phase_clocks():
    for transition_day in (date(2025, 3, 30), date(2025, 10, 26)):
        before = logic.compute_day_phase_starts(_at_date(transition_day - timedelta(days=1)))
        on_transition = logic.compute_day_phase_starts(_at_date(transition_day))
        after = logic.compute_day_phase_starts(_at_date(transition_day + timedelta(days=1)))

        assert (
            before[DAY_EARLY_MORNING].utcoffset()
            != on_transition[DAY_EARLY_MORNING].utcoffset()
        )
        for phase in logic.DAY_PHASE_ORDER:
            before_to_transition = abs(
                _wall_seconds(on_transition[phase]) - _wall_seconds(before[phase])
            )
            transition_to_after = abs(
                _wall_seconds(after[phase]) - _wall_seconds(on_transition[phase])
            )
            assert 0 < before_to_transition < 90
            assert 0 < transition_to_after < 90


def test_day_diagnostics_explain_the_local_accordion_model():
    diagnostics = logic.compute_day_phase_diagnostics(
        _at(2026, 6, 21, 12), DAY_MIDDAY
    )

    assert diagnostics["active_phase"] == DAY_MIDDAY
    assert diagnostics["date"] == "2026-06-21"
    assert diagnostics["model_version"] == "calendar-seasonal-accordion-v2"
    assert diagnostics["reason"] == "date_seasonal_accordion"
    assert "01:49:12" in diagnostics["phase_starts"][DAY_EARLY_NIGHT]
    parameters = diagnostics["season_parameters"]
    assert parameters["fraction"] == 1.0
    assert parameters["non_night_extension_seconds"] == 10920.0
    assert parameters["target_extension_seconds_per_day"] == 60.0
    assert parameters["morning_share"] == 0.4
    assert parameters["evening_share"] == 0.6
    assert parameters["night_ratio"] == "2:1"
    assert parameters["phase_duration_seconds"][DAY_MIDDAY] == 8760.0


def test_day_context_holiday_wins():
    monday = datetime(2024, 1, 1, 12, 0, tzinfo=timezone.utc)
    assert logic.compute_day_context(monday, holiday=True) == DC_FREI


def test_day_context_weekday():
    monday = datetime(2024, 1, 1, 12, 0, tzinfo=timezone.utc)
    assert logic.compute_day_context(monday, holiday=False) == DC_WERKTAG


def test_day_context_weekend():
    saturday = datetime(2024, 1, 6, 12, 0, tzinfo=timezone.utc)
    sunday = datetime(2024, 1, 7, 12, 0, tzinfo=timezone.utc)
    assert logic.compute_day_context(saturday, holiday=False) == DC_WOCHENENDE
    assert logic.compute_day_context(sunday, holiday=False) == DC_WOCHENENDE

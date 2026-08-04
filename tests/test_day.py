"""Deterministic nine-phase calendar day-state contract."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

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


def _at(month: int, day: int, hour: int = 0, minute: int = 0) -> datetime:
    return datetime(2026, month, day, hour, minute, tzinfo=timezone.utc)


def _clock(starts: dict[str, datetime]) -> dict[str, str]:
    return {
        phase: value.strftime("%H:%M") for phase, value in starts.items()
    }


def _minutes(value: datetime) -> int:
    return value.hour * 60 + value.minute


def test_day_state_has_exactly_nine_ordered_phases():
    starts = logic.compute_day_phase_starts(_at(6, 21))

    assert len(DAY_STATES) == 9
    assert list(starts) == DAY_STATES
    assert set(starts) == set(
        {
            DAY_EARLY_NIGHT,
            DAY_LATE_NIGHT,
            DAY_EARLY_MORNING,
            DAY_FORENOON,
            DAY_MIDDAY,
            DAY_AFTERNOON,
            DAY_LATE_AFTERNOON,
            DAY_EVENING,
            DAY_LATE_EVENING,
        }
    )


def test_all_nine_phase_boundaries_are_inclusive_and_deterministic():
    starts = logic.compute_day_phase_starts(_at(6, 21))

    for phase, start in starts.items():
        assert logic.compute_day_state(start) == phase
        assert logic.compute_day_phase_starts(start) == starts

    ordered = list(starts.items())
    for (previous_phase, previous_start), (phase, start) in zip(ordered, ordered[1:]):
        assert logic.compute_day_state(start - timedelta(minutes=1)) == previous_phase
        assert logic.compute_day_state(start) == phase
        assert start > previous_start


def test_solstices_define_the_seasonal_extremes_and_midday_stays_fixed():
    winter = logic.compute_day_phase_diagnostics(_at(12, 21), DAY_EARLY_NIGHT)
    summer = logic.compute_day_phase_diagnostics(_at(6, 21), DAY_EARLY_NIGHT)

    assert winter["season_parameters"]["factor"] == -1.0
    assert summer["season_parameters"]["factor"] == 1.0
    assert _clock(logic.compute_day_phase_starts(_at(12, 21))) == {
        DAY_EARLY_NIGHT: "00:00",
        DAY_LATE_NIGHT: "04:30",
        DAY_EARLY_MORNING: "06:20",
        DAY_FORENOON: "09:10",
        DAY_MIDDAY: "12:00",
        DAY_AFTERNOON: "14:00",
        DAY_LATE_AFTERNOON: "15:50",
        DAY_EVENING: "17:40",
        DAY_LATE_EVENING: "20:30",
    }
    assert _clock(logic.compute_day_phase_starts(_at(6, 21))) == {
        DAY_EARLY_NIGHT: "00:00",
        DAY_LATE_NIGHT: "03:30",
        DAY_EARLY_MORNING: "05:40",
        DAY_FORENOON: "08:50",
        DAY_MIDDAY: "12:00",
        DAY_AFTERNOON: "14:00",
        DAY_LATE_AFTERNOON: "16:10",
        DAY_EVENING: "18:20",
        DAY_LATE_EVENING: "21:30",
    }


def test_equinoxes_are_the_neutral_reference_profile():
    expected = {
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

    for month, day, segment in (
        (3, 21, "spring_equinox"),
        (9, 23, "autumn_equinox"),
    ):
        now = _at(month, day, 12)
        diagnostics = logic.compute_day_phase_diagnostics(
            now, DAY_MIDDAY
        )
        assert diagnostics["season_parameters"]["factor"] == 0.0
        assert diagnostics["season_parameters"]["segment"] == segment
        assert _clock(logic.compute_day_phase_starts(now)) == expected


def test_seasonal_motion_is_stronger_at_outer_edges():
    winter = logic.compute_day_phase_starts(_at(12, 21))
    summer = logic.compute_day_phase_starts(_at(6, 21))

    assert summer[DAY_LATE_NIGHT] < winter[DAY_LATE_NIGHT]
    assert summer[DAY_FORENOON] < winter[DAY_FORENOON]
    assert summer[DAY_MIDDAY].strftime("%H:%M") == winter[DAY_MIDDAY].strftime("%H:%M")
    assert summer[DAY_AFTERNOON].strftime("%H:%M") == winter[DAY_AFTERNOON].strftime("%H:%M")
    assert _minutes(summer[DAY_EVENING]) > _minutes(winter[DAY_EVENING])
    assert _minutes(summer[DAY_LATE_EVENING]) > _minutes(winter[DAY_LATE_EVENING])
    assert _minutes(winter[DAY_LATE_EVENING]) - _minutes(summer[DAY_LATE_EVENING]) == -60


def test_year_boundary_is_fixed_at_midnight_without_previous_day_leakage():
    december = _at(12, 31, 23, 59)
    january = _at(1, 1, 0, 0)

    assert logic.compute_day_state(december) == DAY_LATE_EVENING
    assert logic.compute_day_state(january) == DAY_EARLY_NIGHT
    assert logic.compute_day_phase_starts(january)[DAY_EARLY_NIGHT] == january
    assert logic.compute_day_phase_starts(january) == logic.compute_day_phase_starts(
        january
    )


def test_day_diagnostics_explain_the_active_calendar_model():
    diagnostics = logic.compute_day_phase_diagnostics(
        _at(6, 21, 8, 50), DAY_FORENOON
    )

    assert diagnostics["active_phase"] == DAY_FORENOON
    assert diagnostics["date"] == "2026-06-21"
    assert diagnostics["model_version"] == "calendar-seasonal-v1"
    assert diagnostics["reason"] == "date_seasonal_calendar"
    assert diagnostics["phase_starts"][DAY_FORENOON] == "08:50:00"
    assert diagnostics["season_parameters"]["offset_minutes"][DAY_LATE_NIGHT] == -30
    assert diagnostics["season_parameters"]["clamps_minutes"][DAY_LATE_NIGHT] == (
        210,
        270,
    )


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

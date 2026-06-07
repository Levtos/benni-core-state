"""Day-state & day-context — Ist-Logik aus dem aktuellen Code."""
from __future__ import annotations

from datetime import datetime, timezone

from custom_components.benni_core_state import logic
from custom_components.benni_core_state.const import (
    DAY_AFTERNOON,
    DAY_EARLY_EVENING,
    DAY_EARLY_MORNING,
    DAY_EARLY_NIGHT,
    DAY_FORENOON,
    DAY_LATE_EVENING,
    DAY_LATE_MORNING,
    DAY_LATE_NIGHT,
    DC_FREI,
    DC_WERKTAG,
    DC_WOCHENENDE,
)


def _at(hour: int, minute: int = 0) -> datetime:
    return datetime(2026, 6, 7, hour, minute, tzinfo=timezone.utc)


SOLAR_NOON = _at(13, 30)


def test_day_state_buckets():
    assert logic.compute_day_state(_at(4, 5), SOLAR_NOON) == DAY_EARLY_MORNING
    assert logic.compute_day_state(_at(6), SOLAR_NOON) == DAY_LATE_MORNING
    assert logic.compute_day_state(_at(10, 31), SOLAR_NOON) == DAY_FORENOON
    assert logic.compute_day_state(_at(13, 31), SOLAR_NOON) == DAY_AFTERNOON
    assert logic.compute_day_state(_at(17, 31), SOLAR_NOON) == DAY_EARLY_EVENING
    assert logic.compute_day_state(_at(21, 10), SOLAR_NOON) == DAY_LATE_EVENING
    assert logic.compute_day_state(_at(23, 40), SOLAR_NOON) == DAY_EARLY_NIGHT
    assert logic.compute_day_state(_at(2), SOLAR_NOON) == DAY_LATE_NIGHT


def test_day_phase_starts_are_dynamic_like_lights_dayphase():
    starts = logic.compute_day_phase_starts(_at(12), SOLAR_NOON)
    assert starts[DAY_EARLY_MORNING].strftime("%H:%M") == "04:00"
    assert starts[DAY_LATE_MORNING].strftime("%H:%M") == "05:57"
    assert starts[DAY_FORENOON].strftime("%H:%M") == "10:30"
    assert starts[DAY_AFTERNOON].strftime("%H:%M") == "13:30"
    assert starts[DAY_EARLY_EVENING].strftime("%H:%M") == "17:30"
    assert starts[DAY_LATE_EVENING].strftime("%H:%M") == "21:06"
    assert starts[DAY_EARLY_NIGHT].strftime("%H:%M") == "23:30"


def test_day_context_holiday_wins():
    # 2024-01-01 is a Monday — holiday flag must override to 'frei'.
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

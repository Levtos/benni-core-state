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


def _at(hour: int) -> datetime:
    return datetime(2026, 5, 18, hour, 0, tzinfo=timezone.utc)


def test_day_state_buckets():
    assert logic.compute_day_state(_at(6)) == DAY_EARLY_MORNING
    assert logic.compute_day_state(_at(9)) == DAY_LATE_MORNING
    assert logic.compute_day_state(_at(11)) == DAY_FORENOON
    assert logic.compute_day_state(_at(13)) == DAY_AFTERNOON
    assert logic.compute_day_state(_at(18)) == DAY_EARLY_EVENING
    assert logic.compute_day_state(_at(20)) == DAY_LATE_EVENING
    assert logic.compute_day_state(_at(23)) == DAY_EARLY_NIGHT
    assert logic.compute_day_state(_at(0)) == DAY_EARLY_NIGHT
    assert logic.compute_day_state(_at(3)) == DAY_LATE_NIGHT


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

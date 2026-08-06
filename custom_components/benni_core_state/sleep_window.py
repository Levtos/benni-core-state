"""Pure Phase-1 sleep-window contract for Core State.

This module combines the internal wake plan with the confirmed manual sleep
timestamp.  It does not infer sleep and does not actuate media or light.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any


CONTRACT_VERSION = "1.0.0"


@dataclass(frozen=True, slots=True)
class SleepWindowPlan:
    """One deterministic E/L/M/A decision for the active wake."""

    calculated_at: datetime
    source_status: str
    source_quality: str
    reason: str
    earliest_wake: datetime | None
    latest_wake: datetime | None
    minimum_sleep_minutes: int | None
    provisional_lead_minutes: int | None
    provisional_start: datetime | None
    manual_sleep_start: datetime | None
    minimum_reached_at: datetime | None
    effective_earliest_wake: datetime | None
    actual_wake_start: datetime | None
    minimum_unmet: bool
    hard_l_applied: bool
    provisional_active: bool
    wake_due: bool

    @property
    def available(self) -> bool:
        return self.source_status not in {"unavailable", "invalid"}

    def as_attributes(self) -> dict[str, Any]:
        return {
            "contract_version": CONTRACT_VERSION,
            "source": "internal:core_state.sleep_window",
            "source_status": self.source_status,
            "source_quality": self.source_quality,
            "reason": self.reason,
            "calculated_at": _iso(self.calculated_at),
            "earliest_wake": _iso(self.earliest_wake),
            "latest_wake": _iso(self.latest_wake),
            "minimum_sleep_minutes": self.minimum_sleep_minutes,
            "provisional_lead_minutes": self.provisional_lead_minutes,
            "provisional_start": _iso(self.provisional_start),
            "manual_sleep_start": _iso(self.manual_sleep_start),
            "minimum_reached_at": _iso(self.minimum_reached_at),
            "effective_earliest_wake": _iso(self.effective_earliest_wake),
            "actual_wake_start": _iso(self.actual_wake_start),
            "minimum_unmet": self.minimum_unmet,
            "hard_l_applied": self.hard_l_applied,
            "provisional_active": self.provisional_active,
            "wake_due": self.wake_due,
            "counts_as_sleep": False,
            "inferred_sleep": False,
        }


def plan_sleep_window(
    *,
    now: datetime,
    scheduled_wake: datetime | None,
    wake_window_minutes: int | None,
    manual_sleep_start: datetime | None,
    minimum_sleep_minutes: int | None,
    provisional_lead_minutes: int | None,
    wake_source_status: str = "available",
    wake_source_quality: str = "fresh",
) -> SleepWindowPlan:
    """Calculate E/L/M/A without guessing missing or invalid values."""

    invalid_reason = _validate(
        now=now,
        scheduled_wake=scheduled_wake,
        wake_window_minutes=wake_window_minutes,
        manual_sleep_start=manual_sleep_start,
        minimum_sleep_minutes=minimum_sleep_minutes,
        provisional_lead_minutes=provisional_lead_minutes,
    )
    if invalid_reason is not None:
        status = "unavailable" if invalid_reason.startswith("missing_") else "invalid"
        return SleepWindowPlan(
            calculated_at=now,
            source_status=status,
            source_quality=invalid_reason,
            reason=invalid_reason,
            earliest_wake=None,
            latest_wake=None,
            minimum_sleep_minutes=minimum_sleep_minutes,
            provisional_lead_minutes=provisional_lead_minutes,
            provisional_start=None,
            manual_sleep_start=manual_sleep_start,
            minimum_reached_at=None,
            effective_earliest_wake=None,
            actual_wake_start=None,
            minimum_unmet=False,
            hard_l_applied=False,
            provisional_active=False,
            wake_due=False,
        )

    assert scheduled_wake is not None
    assert wake_window_minutes is not None
    assert minimum_sleep_minutes is not None
    assert provisional_lead_minutes is not None

    earliest = _elapsed(scheduled_wake, -wake_window_minutes)
    latest = _elapsed(scheduled_wake, wake_window_minutes)
    provisional_start = _elapsed(earliest, -provisional_lead_minutes)

    minimum_reached = (
        _elapsed(manual_sleep_start, minimum_sleep_minutes)
        if manual_sleep_start is not None
        else None
    )
    effective_earliest = (
        _later(earliest, minimum_reached)
        if minimum_reached is not None
        else earliest
    )
    actual_wake = _earlier(effective_earliest, latest)
    minimum_unmet = bool(
        minimum_reached is not None and _instant(minimum_reached) > _instant(latest)
    )
    hard_l_applied = minimum_unmet
    provisional_active = (
        manual_sleep_start is None
        and _instant(provisional_start) <= _instant(now) < _instant(actual_wake)
    )
    wake_due = _instant(now) >= _instant(actual_wake)

    status = "degraded" if wake_source_status == "degraded" else wake_source_status
    if status not in {"available", "degraded"}:
        status = "degraded"
    quality = wake_source_quality or "fresh"
    if minimum_unmet:
        reason = "hard_l_minimum_sleep_unmet"
    elif manual_sleep_start is not None:
        reason = "manual_sleep_minimum_applied"
    elif provisional_active:
        reason = "provisional_sleep_corridor_active"
    elif wake_due:
        reason = "calculated_wake_start_reached"
    else:
        reason = "before_provisional_corridor"

    return SleepWindowPlan(
        calculated_at=now,
        source_status=status,
        source_quality=quality,
        reason=reason,
        earliest_wake=earliest,
        latest_wake=latest,
        minimum_sleep_minutes=minimum_sleep_minutes,
        provisional_lead_minutes=provisional_lead_minutes,
        provisional_start=provisional_start,
        manual_sleep_start=manual_sleep_start,
        minimum_reached_at=minimum_reached,
        effective_earliest_wake=effective_earliest,
        actual_wake_start=actual_wake,
        minimum_unmet=minimum_unmet,
        hard_l_applied=hard_l_applied,
        provisional_active=provisional_active,
        wake_due=wake_due,
    )


def _validate(
    *,
    now: datetime,
    scheduled_wake: datetime | None,
    wake_window_minutes: int | None,
    manual_sleep_start: datetime | None,
    minimum_sleep_minutes: int | None,
    provisional_lead_minutes: int | None,
) -> str | None:
    if not _aware(now):
        return "invalid_now"
    if scheduled_wake is None:
        return "missing_scheduled_wake"
    if not _aware(scheduled_wake):
        return "invalid_scheduled_wake"
    if wake_window_minutes is None:
        return "missing_wake_window"
    if not isinstance(wake_window_minutes, int) or wake_window_minutes < 0:
        return "invalid_wake_window"
    if minimum_sleep_minutes is None:
        return "missing_minimum_sleep"
    if not isinstance(minimum_sleep_minutes, int) or minimum_sleep_minutes <= 0:
        return "invalid_minimum_sleep"
    if provisional_lead_minutes is None:
        return "missing_provisional_lead"
    if not isinstance(provisional_lead_minutes, int) or provisional_lead_minutes <= 0:
        return "invalid_provisional_lead"
    if manual_sleep_start is not None and not _aware(manual_sleep_start):
        return "invalid_manual_sleep_start"
    return None


def _aware(value: datetime) -> bool:
    return value.tzinfo is not None and value.utcoffset() is not None


def _instant(value: datetime) -> datetime:
    return value.astimezone(timezone.utc)


def _elapsed(value: datetime, minutes: int) -> datetime:
    """Add elapsed minutes across midnight and DST, then restore local tz."""

    return (_instant(value) + timedelta(minutes=minutes)).astimezone(value.tzinfo)


def _later(left: datetime, right: datetime) -> datetime:
    return left if _instant(left) >= _instant(right) else right


def _earlier(left: datetime, right: datetime) -> datetime:
    return left if _instant(left) <= _instant(right) else right


def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value is not None else None

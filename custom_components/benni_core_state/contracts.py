"""Versioned Core-State UX contracts.

The frontend consumes only the objects produced here.  Coordinator dataclasses,
Home-Assistant entity attributes, and the legacy Wake-Planner namespace never
cross the browser boundary.
"""

from __future__ import annotations

from datetime import datetime, timedelta, time
from typing import Any, Mapping

from homeassistant.util import dt as dt_util

from . import logic, wake_config
from .const import (
    BIO_AWAKE,
    BIO_PROVISIONAL_SLEEP,
    BIO_SLEEP,
    BIO_WAKING,
    DAY_EARLY_NIGHT,
    UX_COMMAND_CONTRACT_VERSION,
    UX_PROJECTION_CONTRACT_VERSION,
    UX_SNAPSHOT_CONTRACT_VERSION,
)


PHASE_LABELS = {
    "early_night": "Frühe Nacht",
    "late_night": "Späte Nacht",
    "early_morning": "Früher Morgen",
    "forenoon": "Vormittag",
    "midday": "Mittag",
    "afternoon": "Nachmittag",
    "late_afternoon": "Später Nachmittag",
    "evening": "Abend",
    "late_evening": "Später Abend",
}
PROFILE_LABELS = {"weekday": "Werktag", "weekend": "Wochenende"}
BIO_LABELS = {
    BIO_AWAKE: "Wach",
    BIO_PROVISIONAL_SLEEP: "Vorläufiger Schlafschutz",
    BIO_SLEEP: "Schlaf",
    BIO_WAKING: "Wachphase",
}
STATUS_VALUES = (
    "loading",
    "ready",
    "empty",
    "stale",
    "degraded",
    "unavailable",
    "reconnecting",
    "offline",
    "error",
    "blocked",
)


def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def _safe(value: Any, key: str = "") -> Any:
    """Remove raw entity IDs and private calendar text from UI diagnostics."""

    if isinstance(value, Mapping):
        return {str(k): _safe(v, str(k)) for k, v in value.items() if "entity_id" not in str(k)}
    if isinstance(value, (list, tuple)):
        return [_safe(item, key) for item in value]
    if key in {"source", "source_id"} and isinstance(value, str) and "." in value:
        return "configured source"
    return value


def _snapshot_status(coord: Any) -> str:
    if coord.data is None:
        return "unavailable"
    if not coord.last_update_success:
        return "degraded"
    return "ready"


def _timeline(coord: Any, local_now: datetime) -> dict[str, Any]:
    """Build backend-owned phase widths, marker and next change."""

    current_starts = logic.compute_day_phase_starts(local_now)
    if local_now.replace(tzinfo=None) < current_starts[DAY_EARLY_NIGHT].replace(tzinfo=None):
        anchor_date = local_now.date() - timedelta(days=1)
    else:
        anchor_date = local_now.date()
    anchor = datetime.combine(anchor_date, time(12), tzinfo=local_now.tzinfo)
    starts = logic.compute_day_phase_starts(anchor)
    following = logic.compute_day_phase_starts(
        datetime.combine(anchor_date + timedelta(days=1), time(12), tzinfo=local_now.tzinfo)
    )
    phase_rows: list[dict[str, Any]] = []
    for index, phase in enumerate(logic.DAY_PHASE_ORDER):
        start = starts[phase]
        end = (
            starts[logic.DAY_PHASE_ORDER[index + 1]]
            if index + 1 < len(logic.DAY_PHASE_ORDER)
            else following[DAY_EARLY_NIGHT]
        )
        seconds = max(1.0, (end - start).total_seconds())
        phase_rows.append(
            {
                "id": phase,
                "label": PHASE_LABELS.get(phase, phase),
                "start": start.isoformat(),
                "end": end.isoformat(),
                "duration_seconds": round(seconds, 3),
                "width_pct": 0.0,
                "active": start <= local_now < end,
                "progress_pct": round(
                    max(0.0, min(100.0, (local_now - start).total_seconds() / seconds * 100)),
                    2,
                ),
            }
        )
    total = sum(float(row["duration_seconds"]) for row in phase_rows)
    for row in phase_rows:
        row["width_pct"] = round(float(row["duration_seconds"]) / total * 100, 4)
    active = next((row for row in phase_rows if row["active"]), phase_rows[-1])
    total_seconds = max(1.0, total)
    marker = max(
        0.0,
        min(100.0, (local_now - starts[logic.DAY_PHASE_ORDER[0]]).total_seconds() / total_seconds * 100),
    )
    return {
        "version": "1.0.0",
        "date": anchor_date.isoformat(),
        "phases": phase_rows,
        "now_marker_pct": round(marker, 3),
        "active_phase": active["id"],
        "active_phase_progress_pct": active["progress_pct"],
        "next_change": active["end"],
        "source": "internal:logic.compute_day_phase_starts",
    }


def _public_config(config: wake_config.WakePlanningConfig) -> dict[str, Any]:
    raw = config.to_dict()
    raw["effective_rules"] = [
        {
            "id": rule.id,
            "name": rule.name,
            "priority": rule.priority,
            "enabled": rule.enabled,
            "weekdays": sorted(rule.weekdays) if rule.weekdays is not None else None,
            "date_from": rule.date_from.isoformat() if rule.date_from else None,
            "date_to": rule.date_to.isoformat() if rule.date_to else None,
            "week_interval": rule.week_interval,
            "week_anchor": rule.week_anchor.isoformat() if rule.week_anchor else None,
            "specific_dates": [item.isoformat() for item in rule.specific_dates]
            if rule.specific_dates is not None
            else None,
            "cycle_anchor": rule.cycle_anchor.isoformat() if rule.cycle_anchor else None,
            "cycle_length": rule.cycle_length,
            "cycle_slot_start": rule.cycle_slot_start,
            "cycle_slot_length": rule.cycle_slot_length,
            "on_holiday": rule.on_holiday,
            "action": rule.action,
            "wake_time": rule.wake_time.strftime("%H:%M") if rule.wake_time else None,
        }
        for rule in wake_config.planning_rules(config)
    ]
    migration = raw.get("migration", {})
    raw["migration"] = {
        "status": migration.get("status"),
        "source": migration.get("source"),
        "source_version": migration.get("source_version"),
        "migrated_at": migration.get("migrated_at"),
        "rollback_available": bool(migration.get("rollback_available")),
    }
    return _safe(raw)


def build_snapshot(coord: Any, *, can_command: bool = True) -> dict[str, Any]:
    """Return the stable, versioned Today/diagnostic/config snapshot."""

    now = dt_util.as_local(dt_util.utcnow())
    status = _snapshot_status(coord)
    data = coord.data
    if data is None:
        return {
            "contract": "benni_core_state.snapshot",
            "version": UX_SNAPSHOT_CONTRACT_VERSION,
            "status": status,
            "updated_at": None,
            "data": None,
            "capabilities": {
                "legacy_comparison": False,
                "mark_sleep": False,
                "mark_awake": False,
                "edit_profiles": False,
                "edit_rules": False,
                "edit_settings": False,
            },
            "config": _public_config(coord.wake_config),
            "permissions": {"read": True, "command": can_command},
        }

    attrs = data.attrs or {}
    bio_attrs = attrs.get("bio_state", {})
    wake_attrs = attrs.get("wake_state", {})
    sleep_attrs = bio_attrs.get("sleep_window", {})
    activity_attrs = attrs.get("activity_state", {})
    comparison_status = wake_attrs.get("comparison_status")
    legacy_available = comparison_status not in {
        None,
        "legacy_unavailable",
        "not_decidable",
    }
    effective_wake = sleep_attrs.get("actual_wake_start")
    if not effective_wake or sleep_attrs.get("wake_due"):
        effective_wake = wake_attrs.get("next_wake")
    reason = bio_attrs.get("reason") or wake_attrs.get("reason") or "state_ready"
    timeline = _timeline(coord, now)
    profile_id = "weekend" if wake_attrs.get("automatic_day_profile") == "weekend" else "weekday"
    return {
        "contract": "benni_core_state.snapshot",
        "version": UX_SNAPSHOT_CONTRACT_VERSION,
        "status": status,
        "updated_at": _iso(now),
        "data": {
            "today": {
                "central_status": {
                    "value": BIO_LABELS.get(data.bio_state, data.bio_state),
                    "code": data.bio_state,
                    "reason": reason,
                },
                "bio": {
                    "state": data.bio_state,
                    "label": BIO_LABELS.get(data.bio_state, data.bio_state),
                    "provisional": data.bio_state == BIO_PROVISIONAL_SLEEP,
                    "counts_as_confirmed_sleep": data.bio_state == BIO_SLEEP,
                    "last_sleep_start": data.last_sleep_start,
                    "last_awake_start": data.last_awake_start,
                    "diagnostics": _safe(bio_attrs),
                },
                "wake": {
                    "next_effective_start": effective_wake,
                    "wake_state": data.wake_state,
                    "reason": wake_attrs.get("reason"),
                    "decided_by": wake_attrs.get("decided_by"),
                    "profile": profile_id,
                    "e": sleep_attrs.get("earliest_wake"),
                    "l": sleep_attrs.get("latest_wake"),
                    "m_minutes": sleep_attrs.get("minimum_sleep_minutes"),
                    "a_minutes": sleep_attrs.get("provisional_lead_minutes"),
                    "minimum_unmet": sleep_attrs.get("minimum_unmet"),
                    "hard_l_applied": sleep_attrs.get("hard_l_applied"),
                    "diagnostics": _safe(wake_attrs),
                },
                "profile": {
                    "id": profile_id,
                    "label": PROFILE_LABELS[profile_id],
                    "rule_winner": wake_attrs.get("matched_rule_id"),
                },
                "day_context": {
                    "value": data.day_context,
                    "wake_profile": profile_id,
                    "holiday": data.day_context == "frei",
                },
                "presence": {
                    "personal": data.presence_personal,
                    "effective": data.presence_effective,
                },
                "activity": {
                    "state": data.activity_state,
                    "decision": _safe(activity_attrs.get("activity_decision", {})),
                },
                "reason": reason,
                "data_status": status,
            },
            "timeline": timeline,
            "diagnostics": {
                "mapping_contract_version": attrs.get("live_status", {}).get(
                    "mapping_contract_version"
                ),
                "wake": _safe(wake_attrs),
                "bio": _safe(bio_attrs),
                "activity": _safe(activity_attrs),
                "source_status": status,
                "last_update_success": bool(coord.last_update_success),
            },
        },
        "config": _public_config(coord.wake_config),
        "capabilities": {
            "legacy_comparison": legacy_available,
            "mark_sleep": can_command,
            "mark_awake": can_command,
            "edit_profiles": can_command,
            "edit_rules": can_command,
            "edit_settings": can_command,
        },
        "permissions": {"read": True, "command": can_command},
    }


def build_projection(coord: Any, days: int = 14) -> dict[str, Any]:
    days = max(1, min(int(days), 14))
    status = _snapshot_status(coord)
    if status == "unavailable":
        return {
            "contract": "benni_core_state.projection",
            "version": UX_PROJECTION_CONTRACT_VERSION,
            "status": status,
            "days": [],
        }
    return {
        "contract": "benni_core_state.projection",
        "version": UX_PROJECTION_CONTRACT_VERSION,
        "status": status,
        "horizon_days": days,
        "days": coord.wake_projection(days),
    }


def command_ack(
    *, request_id: str, status: str, command: str, error: str | None = None
) -> dict[str, Any]:
    return {
        "contract": "benni_core_state.command_ack",
        "version": UX_COMMAND_CONTRACT_VERSION,
        "request_id": request_id,
        "command": command,
        "status": status,
        "error": error,
    }

from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from custom_components.benni_core_state import wake_config
from custom_components.benni_core_state.wake_planning import WakePlanningInputs, plan_wake


BERLIN = ZoneInfo("Europe/Berlin")


def test_default_config_has_only_two_effective_profiles_and_no_overrides():
    config = wake_config.default_config()

    assert [profile.id for profile in config.profiles] == ["weekday", "weekend"]
    assert {rule.id for rule in wake_config.planning_rules(config)} == {
        "profile_weekday",
        "profile_weekend",
    }
    assert "skip_next" not in config.to_dict()
    assert "override_time" not in config.to_dict()


def test_migration_copies_automatic_settings_but_excludes_manual_controls():
    config = wake_config.migrate_legacy_config(
        {
            "version": 7,
            "wake_window_minutes": 12,
            "routine_duration_minutes": 45,
            "calendar_skip_titles": "no-wake;schlaf aus",
            "skip_next": True,
            "override_time": "05:15",
            "rules": [
                {
                    "id": "profile_weekday",
                    "name": "Werktage",
                    "weekdays": [0, 1, 2, 3, 4],
                    "wake_time": "06:45",
                },
                {
                    "id": "custom_cycle",
                    "name": "Zyklus",
                    "weekdays": [0],
                    "wake_time": "07:15",
                    "priority": 120,
                },
            ],
        }
    )

    assert config.weekday.wake_time == "06:45"
    assert config.weekday.wake_window_minutes == 12
    assert config.routine_duration_minutes == 45
    assert config.calendar_skip_titles == ("no-wake", "schlaf aus")
    assert [rule["id"] for rule in config.rules] == ["custom_cycle"]
    assert "skip_next" not in config.to_dict()
    assert "override_time" not in config.to_dict()
    assert config.migration["rollback_available"] is True


def test_profile_and_settings_commands_reject_unknown_fields():
    config = wake_config.default_config()

    try:
        wake_config.update_profile(config, "weekday", {"manual_override": True})
    except ValueError as err:
        assert str(err) == "profile_field_not_allowed"
    else:
        raise AssertionError("unknown profile field was accepted")

    try:
        wake_config.update_settings(config, {"skip_next": True})
    except ValueError as err:
        assert str(err) == "settings_field_not_allowed"
    else:
        raise AssertionError("manual override setting was accepted")

    try:
        wake_config.update_settings(config, {"holiday_behavior": "skip"})
    except ValueError as err:
        assert str(err) == "settings_field_not_allowed"
    else:
        raise AssertionError("holiday behavior override was accepted")


def test_holiday_behavior_is_always_the_weekend_profile():
    config = wake_config.WakePlanningConfig.from_dict(
        {"holiday_behavior": "skip"}
    )

    assert config.holiday_behavior == wake_config.wake_planning.HOLIDAY_WEEKEND_PROFILE


def test_migrated_own_config_plans_without_legacy_wake_entities():
    config = wake_config.migrate_legacy_config(
        {
            "rules": [
                {
                    "id": "profile_weekday",
                    "name": "Werktage",
                    "weekdays": [0, 1, 2, 3, 4],
                    "wake_time": "06:45",
                },
                {
                    "id": "profile_weekend",
                    "name": "Wochenende",
                    "weekdays": [5, 6],
                    "wake_time": "09:15",
                },
            ]
        }
    )

    plan = plan_wake(
        WakePlanningInputs(
            now=datetime(2026, 8, 7, 0, 1, tzinfo=BERLIN),
            calendar_date=datetime(2026, 8, 7, tzinfo=BERLIN).date(),
            day_state="werktag",
            rules=wake_config.planning_rules(config),
            wake_window_minutes=config.weekday.wake_window_minutes,
            routine_duration_minutes=config.routine_duration_minutes,
            floor_time=wake_config.wake_planning.parse_time(config.wake_floor),
            calendar_conflict_behavior=config.calendar_conflict_behavior,
            holiday_behavior=config.holiday_behavior,
            minimum_sleep_minutes=config.weekday.minimum_sleep_minutes,
        )
    )

    assert plan.state == wake_config.wake_planning.WAKE_STATE_SCHEDULED
    assert plan.wake_time == wake_config.wake_planning.parse_time("06:45")
    assert plan.matched_rule_id == "profile_weekday"
    assert plan.source_status == "available"

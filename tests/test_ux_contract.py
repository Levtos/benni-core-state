from __future__ import annotations

import asyncio
from types import SimpleNamespace
from zoneinfo import ZoneInfo

from custom_components.benni_core_state import contracts, wake_config
from custom_components.benni_core_state.commands import async_execute_command


BERLIN = ZoneInfo("Europe/Berlin")


def _coord():
    data = SimpleNamespace(
        bio_state="provisional_sleep",
        wake_state="scheduled",
        day_context="werktag",
        presence_personal="zuhause",
        presence_effective="home",
        activity_state="idle",
        last_sleep_start=None,
        last_awake_start=None,
        attrs={
            "bio_state": {
                "reason": "provisional_sleep_protection",
                "sleep_window": {
                    "earliest_wake": "2026-08-07T07:00:00+02:00",
                    "latest_wake": "2026-08-07T07:10:00+02:00",
                    "minimum_sleep_minutes": None,
                    "provisional_lead_minutes": None,
                },
            },
            "wake_state": {
                "automatic_day_profile": "weekday",
                "next_wake": "2026-08-07T07:00:00+02:00",
                "comparison_status": "legacy_unavailable",
                "source": "sensor.wake_planner_legacy",
            },
            "activity_state": {"activity_decision": {"winner": "idle"}},
            "live_status": {"mapping_contract_version": "1.5.0"},
        },
    )
    return SimpleNamespace(
        data=data,
        wake_config=wake_config.default_config(),
        last_update_success=True,
        wake_projection=lambda days: [],
    )


def test_snapshot_is_versioned_and_timeline_has_exactly_nine_backend_phases():
    snapshot = contracts.build_snapshot(_coord())

    assert snapshot["contract"] == "benni_core_state.snapshot"
    assert snapshot["version"] == "1.0.0"
    assert snapshot["integration_version"] == "0.11.3"
    assert snapshot["data"]["today"]["bio"]["provisional"] is True
    assert snapshot["data"]["today"]["bio"]["counts_as_confirmed_sleep"] is False
    assert len(snapshot["data"]["timeline"]["phases"]) == 9
    assert all("start" in phase and "width_pct" in phase for phase in snapshot["data"]["timeline"]["phases"])
    assert "sensor.wake_planner_legacy" not in str(snapshot)


def test_projection_contract_does_not_calculate_in_the_browser():
    coord = _coord()
    coord.wake_projection = lambda days: [{"date": "2026-08-07", "status": "ready"}]

    projection = contracts.build_projection(coord, 14)

    assert projection["contract"] == "benni_core_state.projection"
    assert projection["horizon_days"] == 14
    assert projection["days"] == [{"date": "2026-08-07", "status": "ready"}]


def test_read_only_snapshot_does_not_offer_write_capabilities():
    snapshot = contracts.build_snapshot(_coord(), can_command=False)

    assert snapshot["permissions"]["command"] is False
    assert snapshot["capabilities"]["mark_sleep"] is False
    assert snapshot["capabilities"]["edit_settings"] is False


def test_command_request_id_is_idempotent_and_never_exposes_legacy_calls():
    class FakeCoordinator:
        def __init__(self):
            self.wake_config = wake_config.default_config()
            self._ux_command_results = {}
            self.bio_calls = 0
            self.saved = 0

        async def async_apply_bio_command(self, target):
            self.bio_calls += 1

        async def async_save_wake_config(self, config):
            self.wake_config = config
            self.saved += 1

        async def async_request_refresh(self):
            return None

        async def async_save_ux_command_results(self):
            return None

    coord = FakeCoordinator()
    first = asyncio.run(
        async_execute_command(
            coord,
            request_id="same-request",
            command="bio.mark_sleep",
        )
    )
    second = asyncio.run(
        async_execute_command(
            coord,
            request_id="same-request",
            command="bio.mark_sleep",
        )
    )

    assert first["status"] == "success"
    assert second == first
    assert coord.bio_calls == 1
    assert "wake_planner" not in str(first)

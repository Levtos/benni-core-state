from datetime import datetime, timedelta, timezone

from custom_components.benni_core_state.const import (
    BIO_AWAKE,
    BIO_PROVISIONAL_SLEEP,
    BIO_SLEEP,
    BIO_WAKING,
    DAY_EARLY_NIGHT,
    DAY_FORENOON,
    PERS_HOME,
)
from custom_components.benni_core_state.logic import compute_bio_state
from custom_components.benni_core_state.models import PersistentState


UTC = timezone.utc
NOW = datetime(2026, 8, 7, 8, 30, tzinfo=UTC)
NO_INDICATORS = {
    "pc": False,
    "ps5": False,
    "coffee": False,
    "door": False,
    "homeoffice": False,
}


def _compute(
    previous: str,
    *,
    now: datetime = NOW,
    indicators: dict[str, bool] | None = None,
    day_state: str = DAY_FORENOON,
    sleep_start: datetime | None = None,
    active_since: dict[str, datetime | None] | None = None,
    waking_started: datetime | None = None,
):
    return compute_bio_state(
        prev_state=previous,
        wake_needed=False,
        indicators=indicators or NO_INDICATORS,
        presence_personal=PERS_HOME,
        day_state=day_state,
        now=now,
        prev_sleep_start=sleep_start,
        prev_awake_start=None,
        indicator_active_since=active_since,
        wake_due=False,
        waking_started=waking_started,
    )


def test_waking_ends_on_first_regular_interaction():
    started = NOW - timedelta(minutes=5)
    indicators = {**NO_INDICATORS, "coffee": True}
    active_since = {key: None for key in NO_INDICATORS}
    active_since["coffee"] = NOW - timedelta(seconds=1)

    state, _, awake_start = _compute(
        BIO_WAKING,
        indicators=indicators,
        sleep_start=NOW - timedelta(hours=6),
        active_since=active_since,
        waking_started=started,
    )

    assert state == BIO_AWAKE
    assert awake_start == NOW


def test_waking_stays_before_timeout_without_interaction():
    state, _, awake_start = _compute(
        BIO_WAKING,
        now=NOW - timedelta(seconds=1),
        waking_started=NOW - timedelta(minutes=30),
    )

    assert state == BIO_WAKING
    assert awake_start is None


def test_waking_times_out_at_exactly_30_minutes():
    started = NOW - timedelta(minutes=30)

    state, _, awake_start = _compute(
        BIO_WAKING,
        waking_started=started,
    )

    assert state == BIO_AWAKE
    assert awake_start == NOW


def test_day_phase_change_alone_does_not_end_waking():
    state, _, _ = _compute(
        BIO_WAKING,
        day_state=DAY_EARLY_NIGHT,
        waking_started=NOW - timedelta(minutes=10),
    )

    assert state == BIO_WAKING


def test_stale_level_signal_is_ignored_during_waking():
    sleep_start = NOW - timedelta(hours=6)
    indicators = {**NO_INDICATORS, "pc": True}
    active_since = {key: None for key in NO_INDICATORS}
    active_since["pc"] = sleep_start - timedelta(minutes=1)

    state, _, _ = _compute(
        BIO_WAKING,
        indicators=indicators,
        sleep_start=sleep_start,
        active_since=active_since,
        waking_started=NOW - timedelta(minutes=5),
    )

    assert state == BIO_WAKING


def test_regular_interaction_ends_sleep_and_provisional_sleep():
    sleep_start = NOW - timedelta(hours=6)
    indicators = {**NO_INDICATORS, "door": True}
    active_since = {key: None for key in NO_INDICATORS}
    active_since["door"] = NOW - timedelta(seconds=1)

    sleep = _compute(
        BIO_SLEEP,
        indicators=indicators,
        sleep_start=sleep_start,
        active_since=active_since,
    )
    provisional = _compute(
        BIO_PROVISIONAL_SLEEP,
        indicators=indicators,
        sleep_start=None,
        active_since=active_since,
    )

    assert sleep[0] == BIO_AWAKE
    assert provisional[0] == BIO_AWAKE
    assert provisional[1] is None


def test_repeated_signal_after_first_completion_is_idempotent():
    indicators = {**NO_INDICATORS, "coffee": True}
    active_since = {key: None for key in NO_INDICATORS}
    active_since["coffee"] = NOW - timedelta(seconds=1)

    first = _compute(
        BIO_WAKING,
        indicators=indicators,
        active_since=active_since,
        waking_started=NOW - timedelta(minutes=1),
    )
    second = _compute(
        first[0],
        now=NOW + timedelta(seconds=1),
        indicators=indicators,
        active_since=active_since,
        waking_started=NOW - timedelta(minutes=1),
    )

    assert first[0] == BIO_AWAKE
    assert second[0] == BIO_AWAKE


def test_waking_start_survives_persistence_roundtrip():
    persisted = PersistentState(
        bio_state=BIO_WAKING,
        last_waking_start=NOW.isoformat(),
    )

    restored = PersistentState.from_dict(persisted.to_dict())

    assert restored.bio_state == BIO_WAKING
    assert restored.last_waking_start == NOW.isoformat()

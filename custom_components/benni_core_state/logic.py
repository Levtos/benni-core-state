"""Pure computation rules for Benni Core State.

Konservativer Lift aus dem Toolbox-Modul ``benni_context`` — die Regeln sind
**unverändert** übernommen. This module contains no Home Assistant imports and
is fully unit-testable. Every function is a pure projection from raw inputs to
a state value (plus, where needed, accompanying timestamps that the caller has
to persist).

Why pure functions? The presence / bio / activity rules are the trickiest part
of this integration — and the most exposed to user complaints when "the
heating started even though I was at my parents". Keeping the rules separate
from HA wiring lets us pin them down with a small test suite.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta

from .const import (
    ACT_ENTERTAINMENT,
    ACT_FREE_TIME,
    ACT_GAMING,
    ACT_HOUSEHOLD,
    ACT_IDLE,
    ACT_MUSIC,
    ACT_PC_ACTIVE,
    ACT_PRIVATE,
    ACT_SLEEP,
    ACT_WAKING,
    ACT_WORK_HOME,
    ACTIVITY_HOLD_STRENGTH,
    SOFT_HOLD_ACTIVITIES,
    BAND_FAR,
    BAND_HOME,
    BAND_NEAR,
    BAND_PREHEAT,
    BIO_AWAKE,
    BIO_SLEEP,
    BIO_WAKING,
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
    DEFAULT_ARRIVING_STABILIZE_SECONDS,
    DEFAULT_LEAVING_STABILIZE_SECONDS,
    DEFAULT_PRESENCE_STALE_SECONDS,
    DEFAULT_PROXIMITY_TREND_EPSILON_M,
    DEFAULT_STABLE_AWAY_SECONDS,
    EFF_ARRIVING,
    EFF_AWAY,
    EFF_HOME,
    EFF_LEAVING,
    EFF_STALE,
    EFF_UNCERTAIN,
    HH_EMPTY,
    HH_OCCUPIED,
    HOLD_NONE,
    PERS_AWAY,
    PERS_HOME,
    PERS_PARENTS,
    PRESENCE_PERSONAL_STATES,
    TRANS_COMING_HOME,
    TRANS_LEAVING_HOME,
    TRANS_NONE,
    TRANS_PASSING,
)

# ---------------------------------------------------------------- helpers


@dataclass(frozen=True)
class EffectivePresenceResult:
    effective_presence: str
    transition: str
    confidence: float
    source_priority: str
    proximity_distance: float | None
    proximity_direction: str | None
    stale_inputs: list[str] = field(default_factory=list)
    block_reason: str | None = None
    last_home_at: datetime | None = None
    last_away_at: datetime | None = None
    candidate_state: str | None = None
    candidate_started_at: datetime | None = None
    proximity_trend: str = "unknown"


def _is_home(value: str | None) -> bool:
    if value is None:
        return False
    return str(value).lower() in ("home", "on", "true", "1", "yes")


def _is_fresh(ts: datetime | None, now: datetime, freshness_s: int) -> bool:
    if ts is None:
        return False
    return (now - ts) <= timedelta(seconds=freshness_s)


def _iso_or_none(value: datetime | None) -> str | None:
    return value.isoformat() if value is not None else None


def effective_presence_attrs(result: EffectivePresenceResult) -> dict[str, object]:
    return {
        "effective_presence": result.effective_presence,
        "transition": result.transition,
        "confidence": result.confidence,
        "source_priority": result.source_priority,
        "proximity_distance": result.proximity_distance,
        "proximity_direction": result.proximity_direction,
        "proximity_trend": result.proximity_trend,
        "stale_inputs": list(result.stale_inputs),
        "block_reason": result.block_reason,
        "last_home_at": _iso_or_none(result.last_home_at),
        "last_away_at": _iso_or_none(result.last_away_at),
        "candidate_state": result.candidate_state,
        "candidate_started_at": _iso_or_none(result.candidate_started_at),
    }


def _ssid_matches(ssid: str | None, ssid_set: list[str] | set[str] | None) -> bool:
    """True if the raw SSID sensor value is one of the configured anchor SSIDs.

    Case-/whitespace-tolerant. ``Not Connected`` / ``unknown`` and any unknown
    network simply fail to match — SSID is *positive-only* evidence: it can pull
    presence towards ``zuhause`` / ``bei_eltern`` but never towards ``abwesend``.
    """
    if not ssid or not ssid_set:
        return False
    norm = str(ssid).strip().casefold()
    if norm in ("not connected", "unknown", "unavailable", ""):
        return False
    return norm in {str(s).strip().casefold() for s in ssid_set}


def _proximity_trend(
    distance_m: float | None,
    previous_distance_m: float | None,
    direction: str | None,
    *,
    epsilon_m: float,
) -> str:
    if direction:
        normalized = direction.strip().lower()
        if normalized in ("towards", "towards_home", "approaching", "home"):
            return "towards_home"
        if normalized in ("away", "away_from", "away_from_home", "leaving"):
            return "away_from_home"
    if distance_m is None or previous_distance_m is None:
        return "unknown"
    delta = distance_m - previous_distance_m
    if delta >= epsilon_m:
        return "away_from_home"
    if delta <= -epsilon_m:
        return "towards_home"
    return "flat"


def _presence_candidate(
    *,
    candidate: str,
    previous_candidate: str | None,
    previous_started_at: datetime | None,
    now: datetime,
) -> tuple[str, datetime]:
    if previous_candidate == candidate and previous_started_at is not None:
        return previous_candidate, previous_started_at
    return candidate, now


# --------------------------------------------------------- presence_personal


def compute_presence_personal(
    *,
    ssid: str | None = None,
    home_ssids: list[str] | set[str] | None = None,
    parents_ssids: list[str] | set[str] | None = None,
    wlan_benni: str | None,
    wlan_benni_ts: datetime | None,
    wlan_eltern_1: str | None,
    wlan_eltern_2: str | None,
    gps_primary: str | None,
    gps_primary_ts: datetime | None,
    gps_secondary: str | None,
    gps_secondary_ts: datetime | None,
    now: datetime,
    freshness_s: int,
    prev_personal: str | None = None,
) -> str:
    """Decide ``zuhause`` / ``bei_eltern`` / ``abwesend``.

    Priority (FLEET-100 Phase A — primary GPS is authoritative for *away*):

    * **Away override:** a *fresh* primary GPS reading that places Benni
      OUTSIDE the home zone (``gps_primary_fresh_away``) suppresses the two
      "phone is on the home WLAN" home signals (rules 0 & 1). Those signals go
      stale silently — the iOS companion SSID sensor freezes its last value, so
      "on home WLAN" alone is no proof the *person* is home (phone left at
      home). icloud3 GPS, which follows the person, wins.

    0. Raw SSID matches a configured home WLAN → ``zuhause`` (instant) —
       *unless* ``gps_primary_fresh_away``.
    1. Benni's WLAN tracker says ``home`` and is fresh → ``zuhause`` —
       *unless* ``gps_primary_fresh_away``.
    2. Raw SSID matches a configured parents WLAN → ``bei_eltern`` (instant).
    3. Either parents-WLAN tracker says ``home`` → ``bei_eltern``.
       (No freshness check: parents' router state is the ground truth, and a
       stale "home" reading there is still a strong signal that no automatic
       away-mode should fire.) Parents detection is intentionally NOT gated by
       the GPS-away override — a fresh GPS outside the home zone is exactly the
       situation where Benni may be at his parents'.
    4. Fresh GPS in home zone → ``zuhause``.
    5. WLAN benni was ``home`` but went stale and *no* fresh GPS contradicts →
       hold ``zuhause`` (sleeping-phone guard). Structurally exclusive with the
       away override, which requires a fresh primary GPS.
    6. **Positive away:** a *fresh* GPS reading (primary or secondary) that
       places Benni OUTSIDE the home zone is the *only* evidence that asserts
       ``abwesend``. Absence of signal is never treated as away.
    7. **No positive evidence** (HA just restarted, every tracker briefly
       ``unavailable``, or all readings stale) → retain ``prev_personal``. This
       stops an HA-restart from fabricating a false ``abwesend`` that tears down
       away-gated consumers (media music, door). Falls back to ``abwesend`` only
       when no presence has ever been observed (fresh install / empty store).

    SSID is *positive-only* evidence (see ``_ssid_matches``): an unknown network
    or a brief ``Not Connected`` blip during a 2.4/5 GHz band roam never asserts
    ``abwesend`` — it just drops the SSID hint for that tick and GPS decides.

    Stale primary GPS falls back to secondary GPS, then to last-known WLAN
    state. We never silently degrade to ``abwesend`` on a single stale reading
    if a fresher source contradicts it.
    """
    fresh_primary = _is_fresh(gps_primary_ts, now, freshness_s)
    fresh_secondary = _is_fresh(gps_secondary_ts, now, freshness_s)

    # A fresh primary GPS that puts Benni OUTSIDE the home zone is authoritative
    # for being away: it overrides the "phone on home WLAN" home signals, which
    # freeze stale when the iOS companion app stops reporting (FLEET-100).
    gps_primary_fresh_away = fresh_primary and not _is_home(gps_primary)

    # 0) Home WLAN by SSID — instant, but yields to a fresh contradicting GPS.
    if _ssid_matches(ssid, home_ssids) and not gps_primary_fresh_away:
        return PERS_HOME

    # 1) WLAN benni (legacy boolean slot) — same GPS-away guard.
    if (
        _is_home(wlan_benni)
        and _is_fresh(wlan_benni_ts, now, freshness_s)
        and not gps_primary_fresh_away
    ):
        return PERS_HOME

    # 2) Parents WLAN by SSID — home equivalent, instant. Not GPS-gated.
    if _ssid_matches(ssid, parents_ssids):
        return PERS_PARENTS

    # 3) Parents WLAN — home equivalent. No freshness gate: a router seen as
    # "home" on the parents network is durable evidence that Benni is there.
    if _is_home(wlan_eltern_1) or _is_home(wlan_eltern_2):
        return PERS_PARENTS

    # 4) GPS home zone (fallback after the WLAN signals).
    if fresh_primary and _is_home(gps_primary):
        return PERS_HOME
    if fresh_secondary and _is_home(gps_secondary):
        return PERS_HOME

    # 5) If WLAN benni was home but went stale, and GPS does not contradict,
    # keep zuhause to avoid a false-leaving event from a sleeping phone.
    if _is_home(wlan_benni) and not (fresh_primary or fresh_secondary):
        return PERS_HOME

    # 6) Positive away: only a FRESH GPS reading outside the home zone asserts
    # abwesend. (``gps_primary_fresh_away`` covers primary; the secondary is
    # checked explicitly.) This is the sole away-evidence source.
    if gps_primary_fresh_away or (fresh_secondary and not _is_home(gps_secondary)):
        return PERS_AWAY

    # 7) No positive evidence either way — every tracker is briefly unavailable
    # (HA just restarted) or all readings are stale. Never fabricate an away
    # event from the mere ABSENCE of signal: retain the last known presence so a
    # restart cannot tear down away-gated consumers. Fall back to abwesend only
    # when no presence has ever been observed yet.
    if prev_personal in PRESENCE_PERSONAL_STATES:
        return prev_personal
    return PERS_AWAY


# --------------------------------------------------------- household


def compute_presence_household(personal: str, external_occupied: bool) -> str:
    if personal == PERS_HOME or external_occupied:
        return HH_OCCUPIED
    return HH_EMPTY


# --------------------------------------------------------- band


def compute_presence_band(
    *,
    distance_m: float | None,
    presence_personal: str,
    home_r: float,
    preheat_r: float,
    near_r: float,
    hysteresis_m: float,
    prev_band: str | None,
) -> str:
    """Bucket distance into home / preheat / near / far.

    Hysteresis is applied symmetrically: when leaving a band, the threshold is
    extended by ``hysteresis_m`` so a noisy GPS doesn't flap. When the
    personal state is ``zuhause``, the band is always ``home`` (the band must
    not be "far" while we are clearly inside, e.g. when GPS is stale but WLAN
    confirms home).
    """
    if presence_personal == PERS_HOME:
        return BAND_HOME
    if distance_m is None:
        # No proximity data: collapse to "far" unless we already had a more
        # specific band, in which case keep it (no spurious flips).
        return prev_band or BAND_FAR

    h = hysteresis_m if prev_band else 0.0

    def _hi(threshold: float) -> float:
        # extend threshold outward when leaving the inner band
        return threshold + h

    if prev_band == BAND_HOME:
        if distance_m <= _hi(home_r):
            return BAND_HOME
    if prev_band == BAND_PREHEAT:
        if distance_m <= _hi(preheat_r):
            return BAND_HOME if distance_m <= home_r else BAND_PREHEAT
    if prev_band == BAND_NEAR:
        if distance_m <= _hi(near_r):
            if distance_m <= home_r:
                return BAND_HOME
            if distance_m <= preheat_r:
                return BAND_PREHEAT
            return BAND_NEAR

    # Fresh classification
    if distance_m <= home_r:
        return BAND_HOME
    if distance_m <= preheat_r:
        return BAND_PREHEAT
    if distance_m <= near_r:
        return BAND_NEAR
    return BAND_FAR


# --------------------------------------------------------- effective presence


def compute_effective_presence(
    *,
    presence_personal: str,
    home_band: str,
    distance_m: float | None,
    direction: str | None,
    now: datetime,
    person_source_ts: datetime | None,
    band_source_ts: datetime | None,
    distance_ts: datetime | None,
    direction_ts: datetime | None,
    previous_distance_m: float | None,
    previous_effective: str | None,
    previous_candidate: str | None,
    previous_candidate_started_at: datetime | None,
    last_home_at: datetime | None,
    last_away_at: datetime | None,
    stale_s: int = DEFAULT_PRESENCE_STALE_SECONDS,
    stable_away_s: int = DEFAULT_STABLE_AWAY_SECONDS,
    arriving_stabilize_s: int = DEFAULT_ARRIVING_STABILIZE_SECONDS,
    leaving_stabilize_s: int = DEFAULT_LEAVING_STABILIZE_SECONDS,
    trend_epsilon_m: float = DEFAULT_PROXIMITY_TREND_EPSILON_M,
) -> EffectivePresenceResult:
    """Arbitrate the policy-grade presence contract for safety consumers.

    This is intentionally stricter than ``presence_personal`` and
    ``presence_band``. Near/home rings are positive hints only; they never
    unlock by themselves when person state and proximity trend disagree.
    """
    source_ts = {
        "person": person_source_ts,
        "band": band_source_ts,
        "proximity_distance": distance_ts,
        "proximity_direction": direction_ts,
    }
    stale_inputs = [
        key for key, ts in source_ts.items() if not _is_fresh(ts, now, stale_s)
    ]
    all_presence_inputs_stale = len(stale_inputs) == len(source_ts)
    trend = _proximity_trend(
        distance_m, previous_distance_m, direction, epsilon_m=trend_epsilon_m
    )

    if all_presence_inputs_stale:
        return EffectivePresenceResult(
            effective_presence=EFF_STALE,
            transition=EFF_STALE,
            confidence=0.0,
            source_priority="stale_guard",
            proximity_distance=distance_m,
            proximity_direction=direction,
            stale_inputs=stale_inputs,
            block_reason="all_presence_inputs_stale",
            last_home_at=last_home_at,
            last_away_at=last_away_at,
            candidate_state=previous_candidate,
            candidate_started_at=previous_candidate_started_at,
            proximity_trend=trend,
        )

    if presence_personal == PERS_HOME:
        return EffectivePresenceResult(
            effective_presence=EFF_HOME,
            transition=EFF_HOME,
            confidence=0.98,
            source_priority="person_home",
            proximity_distance=distance_m,
            proximity_direction=direction,
            stale_inputs=stale_inputs,
            last_home_at=now,
            last_away_at=last_away_at,
            proximity_trend=trend,
        )

    # Eltern is not a home-arrival trigger for the Einhornzentrale door. It is
    # a known, safe non-home location and must not be treated as arriving.
    if presence_personal == PERS_PARENTS:
        return EffectivePresenceResult(
            effective_presence=EFF_AWAY,
            transition=EFF_AWAY,
            confidence=0.9,
            source_priority="parents_presence",
            proximity_distance=distance_m,
            proximity_direction=direction,
            stale_inputs=stale_inputs,
            block_reason="at_parents_not_arrival",
            last_home_at=last_home_at,
            last_away_at=now,
            proximity_trend=trend,
        )

    if presence_personal != PERS_AWAY:
        return EffectivePresenceResult(
            effective_presence=EFF_UNCERTAIN,
            transition=EFF_UNCERTAIN,
            confidence=0.2,
            source_priority="unknown_person",
            proximity_distance=distance_m,
            proximity_direction=direction,
            stale_inputs=stale_inputs,
            block_reason="presence_personal_unknown",
            last_home_at=last_home_at,
            last_away_at=last_away_at,
            candidate_state=previous_candidate,
            candidate_started_at=previous_candidate_started_at,
            proximity_trend=trend,
        )

    if home_band == BAND_FAR:
        return EffectivePresenceResult(
            effective_presence=EFF_AWAY,
            transition=EFF_AWAY,
            confidence=0.95,
            source_priority="person_away_band_far",
            proximity_distance=distance_m,
            proximity_direction=direction,
            stale_inputs=stale_inputs,
            last_home_at=last_home_at,
            last_away_at=now,
            proximity_trend=trend,
        )

    if trend == "away_from_home":
        candidate, started_at = _presence_candidate(
            candidate=EFF_LEAVING,
            previous_candidate=previous_candidate,
            previous_started_at=previous_candidate_started_at,
            now=now,
        )
        stabilized = (now - started_at) >= timedelta(seconds=leaving_stabilize_s)
        state = EFF_AWAY if stabilized and previous_effective == EFF_AWAY else EFF_LEAVING
        return EffectivePresenceResult(
            effective_presence=state,
            transition=EFF_LEAVING,
            confidence=0.88 if stabilized else 0.78,
            source_priority="person_away_distance_increasing",
            proximity_distance=distance_m,
            proximity_direction=direction,
            stale_inputs=stale_inputs,
            block_reason="moving_away_from_home",
            last_home_at=last_home_at,
            last_away_at=now if stabilized else last_away_at,
            candidate_state=candidate,
            candidate_started_at=started_at,
            proximity_trend=trend,
        )

    if trend == "towards_home":
        stable_since = last_away_at
        stable_away = (
            stable_since is not None
            and (now - stable_since) >= timedelta(seconds=stable_away_s)
        )
        candidate, started_at = _presence_candidate(
            candidate=EFF_ARRIVING,
            previous_candidate=previous_candidate,
            previous_started_at=previous_candidate_started_at,
            now=now,
        )
        candidate_stable = (now - started_at) >= timedelta(seconds=arriving_stabilize_s)
        if stable_away and candidate_stable:
            return EffectivePresenceResult(
                effective_presence=EFF_ARRIVING,
                transition=EFF_ARRIVING,
                confidence=0.93,
                source_priority="stable_away_then_towards_home",
                proximity_distance=distance_m,
                proximity_direction=direction,
                stale_inputs=stale_inputs,
                last_home_at=last_home_at,
                last_away_at=last_away_at,
                candidate_state=candidate,
                candidate_started_at=started_at,
                proximity_trend=trend,
            )
        return EffectivePresenceResult(
            effective_presence=EFF_UNCERTAIN,
            transition=EFF_UNCERTAIN,
            confidence=0.55,
            source_priority="arriving_candidate_unstable",
            proximity_distance=distance_m,
            proximity_direction=direction,
            stale_inputs=stale_inputs,
            block_reason=(
                "away_not_stable" if not stable_away else "arriving_not_stabilized"
            ),
            last_home_at=last_home_at,
            last_away_at=last_away_at,
            candidate_state=candidate,
            candidate_started_at=started_at,
            proximity_trend=trend,
        )

    return EffectivePresenceResult(
        effective_presence=EFF_UNCERTAIN,
        transition=EFF_UNCERTAIN,
        confidence=0.35,
        source_priority="contradictory_without_clear_trend",
        proximity_distance=distance_m,
        proximity_direction=direction,
        stale_inputs=stale_inputs,
        block_reason="person_away_near_home_without_clear_trend",
        last_home_at=last_home_at,
        last_away_at=last_away_at,
        candidate_state=previous_candidate,
        candidate_started_at=previous_candidate_started_at,
        proximity_trend=trend,
    )


# --------------------------------------------------------- transition


_BAND_ORDER = {BAND_FAR: 0, BAND_NEAR: 1, BAND_PREHEAT: 2, BAND_HOME: 3}


def compute_transition(
    *,
    prev_band: str | None,
    new_band: str,
    prev_personal: str | None,
    new_personal: str,
    direction: str | None,
    prev_transition: str,
    prev_started: datetime | None,
    now: datetime,
    hold_s: int,
) -> tuple[str, datetime | None]:
    """Compute the transition enum.

    ``coming_home`` only fires when the **previous real presence** was
    ``abwesend``. Coming back from ``bei_eltern`` is intentionally suppressed:
    we don't want heimkehr-radio when leaving the parents' Wi-Fi network and
    walking past the home zone on the way somewhere else.
    """
    # Hold-down: keep the previous transition for hold_s after it started.
    if (
        prev_transition != TRANS_NONE
        and prev_started is not None
        and (now - prev_started) < timedelta(seconds=hold_s)
    ):
        return prev_transition, prev_started

    if prev_band is None:
        return TRANS_NONE, None

    prev_idx = _BAND_ORDER.get(prev_band, 0)
    new_idx = _BAND_ORDER.get(new_band, 0)

    # coming_home: moving toward home AND the user genuinely was away.
    if new_idx > prev_idx and prev_personal == PERS_AWAY:
        if new_personal == PERS_HOME or new_band == BAND_HOME:
            return TRANS_COMING_HOME, now
        if direction and direction.lower() in ("towards", "approaching"):
            return TRANS_COMING_HOME, now

    # leaving_home: moving away from home AND we were just home.
    if new_idx < prev_idx and prev_personal == PERS_HOME:
        return TRANS_LEAVING_HOME, now

    # passing_through: was near/preheat but never reached home, now moving out.
    if (
        prev_band in (BAND_NEAR, BAND_PREHEAT)
        and new_band == BAND_FAR
        and prev_personal != PERS_HOME
    ):
        return TRANS_PASSING, now

    return TRANS_NONE, None


# --------------------------------------------------------- preheat


def compute_preheat(
    *,
    band: str,
    direction: str | None,
    presence_personal: str,
    prev_active: bool,
    prev_started: datetime | None,
    now: datetime,
    max_duration_s: int,
) -> tuple[bool, str | None, datetime | None]:
    """Preheat is on when band == preheat, user was away, and moving toward home.

    Preheat is auto-disarmed after ``max_duration_s`` so a parked car in the
    preheat ring doesn't keep the heating on indefinitely. It also disarms
    immediately when the user reaches home or goes back to far/parents.
    """
    # Disarm conditions
    if presence_personal == PERS_HOME or band == BAND_HOME:
        return False, None, None
    if presence_personal == PERS_PARENTS:
        return False, None, None
    if band in (BAND_FAR, BAND_NEAR) and prev_active is False:
        return False, None, None

    # Max-duration cap
    if prev_active and prev_started is not None:
        if (now - prev_started) >= timedelta(seconds=max_duration_s):
            return False, "expired", prev_started

    # Activation
    if band == BAND_PREHEAT:
        approaching = direction is None or direction.lower() in (
            "towards",
            "approaching",
        )
        if approaching:
            if prev_active and prev_started is not None:
                return True, "approach", prev_started
            return True, "approach", now

    # Sustain through far/near if already active and not capped
    if prev_active:
        return True, "sustain", prev_started

    return False, None, None


# --------------------------------------------------------- bio_state


_STRONG_INDICATORS = ("coffee", "door")
_SOFT_INDICATORS = ("pc", "ps5")
_WAKE_ALLOWED_DAY_STATES = (
    DAY_EARLY_MORNING,
    DAY_LATE_MORNING,
    DAY_FORENOON,
    DAY_AFTERNOON,
    DAY_EARLY_EVENING,
    DAY_LATE_EVENING,
)
def wake_indicators_allowed(day_state: str | None) -> bool:
    """Return whether activity-based wake indicators may change Bio-State.

    The reviewed Context State spec allows coffee/door/PC/PS5 wake indicators
    only in the non-night master phases. Missing day-state is treated
    conservatively: do not infer wake from activity noise.
    """
    return day_state in _WAKE_ALLOWED_DAY_STATES


def _indicator_can_wake(
    key: str,
    indicators: dict[str, bool],
    indicator_active_since: dict[str, datetime | None] | None,
    prev_sleep_start: datetime | None,
) -> bool:
    """Return whether an active indicator is fresh enough to wake from sleep.

    A manual sleep request should not be undone by stale level-style sensors
    that were already active before sleep started. Once such a source cycles
    off and on again, its ``last_changed`` moves behind ``last_sleep_start``
    and it is allowed to wake normally.
    """
    if not indicators.get(key):
        return False
    if prev_sleep_start is None or indicator_active_since is None:
        return True
    active_since = indicator_active_since.get(key)
    if active_since is None:
        return True
    return active_since > prev_sleep_start


def compute_bio_state(
    *,
    prev_state: str,
    wake_needed: bool,
    indicators: dict[str, bool],
    presence_personal: str,
    day_state: str | None,
    now: datetime,
    prev_sleep_start: datetime | None,
    prev_awake_start: datetime | None,
    indicator_active_since: dict[str, datetime | None] | None = None,
) -> tuple[str, datetime | None, datetime | None]:
    """Bio is the single source of truth for sleep/waking/awake.

    Rules:

    * ``sleep`` → ``waking`` when the Wake Planner says ``wake_needed``.
    * ``sleep``/``waking`` → ``awake`` when an allowed wake indicator fires
      in a non-night day state. Coffee/door are strong indicators; PC/PS5 are
      explicit wake indicators too. TV is intentionally not an input.
      Stale level-style indicators that were already active before sleep remain
      ignored; fresh indicators are valid in every non-night phase.
    * ``waking`` remains a Wake-Up-module transition state; the Wake Planner
      alone never confirms awake.
    * Leaving home while not asleep → awake (you can't physically leave while
      sleeping; this catches a missed transition).
    * Manual transitions (services.py) flow through this function by passing
      ``prev_state`` already set to the desired target.
    """
    sleep_start = prev_sleep_start
    awake_start = prev_awake_start

    strong = any(
        _indicator_can_wake(k, indicators, indicator_active_since, prev_sleep_start)
        for k in _STRONG_INDICATORS
    )
    soft = any(
        _indicator_can_wake(k, indicators, indicator_active_since, prev_sleep_start)
        for k in _SOFT_INDICATORS
    )
    activity_wake = (
        wake_indicators_allowed(day_state)
        and (strong or soft)
    )

    # Genuine departure forces awake — you can't be sleeping while walking out.
    if presence_personal == PERS_AWAY and prev_state != BIO_AWAKE:
        return BIO_AWAKE, sleep_start, now

    if prev_state == BIO_SLEEP:
        if activity_wake:
            return BIO_AWAKE, sleep_start, now
        if wake_needed:
            return BIO_WAKING, sleep_start, awake_start
        return BIO_SLEEP, sleep_start, awake_start

    if prev_state == BIO_WAKING:
        if activity_wake:
            return BIO_AWAKE, sleep_start, now
        return BIO_WAKING, sleep_start, awake_start

    # prev_state == awake — only an explicit sleep service moves us back,
    # which is handled by the caller setting prev_state to BIO_SLEEP.
    return BIO_AWAKE, sleep_start, awake_start or now


# --------------------------------------------------------- day_state / context


DAY_PHASE_ORDER = (
    DAY_EARLY_MORNING,
    DAY_LATE_MORNING,
    DAY_FORENOON,
    DAY_AFTERNOON,
    DAY_EARLY_EVENING,
    DAY_LATE_EVENING,
    DAY_EARLY_NIGHT,
    DAY_LATE_NIGHT,
)

_MORNING_SPLITS = {
    1: 0.55, 2: 0.52, 3: 0.47, 4: 0.42, 5: 0.35, 6: 0.30,
    7: 0.30, 8: 0.35, 9: 0.40, 10: 0.45, 11: 0.50, 12: 0.55,
}
_EVENING_SPLITS = {
    1: 0.30, 2: 0.33, 3: 0.38, 4: 0.43, 5: 0.52, 6: 0.60,
    7: 0.60, 8: 0.55, 9: 0.48, 10: 0.40, 11: 0.33, 12: 0.30,
}


def _same_local_day(anchor: datetime, source: datetime) -> datetime:
    return anchor.replace(
        hour=source.hour,
        minute=source.minute,
        second=source.second,
        microsecond=source.microsecond,
    )


def _today_at(anchor: datetime, value: str) -> datetime:
    hour, minute = (int(part) for part in value.split(":", maxsplit=1))
    return anchor.replace(hour=hour, minute=minute, second=0, microsecond=0)


def _seasonal_offset_seconds(anchor: datetime) -> int:
    doy = anchor.timetuple().tm_yday
    dist = doy - 172
    if dist > 183:
        dist -= 365
    if dist < -182:
        dist += 365
    seasonal_factor = max(-1.0, min(1.0, 1.0 - abs(dist) / 91.5))
    return int(15 * 60 * seasonal_factor)


def compute_day_phase_starts(
    local_now: datetime, solar_noon: datetime | None = None
) -> dict[str, datetime]:
    """Return dynamic local phase start times for the date of ``local_now``.

    The shape follows the former ``Lights Dayphase`` YAML: fixed dawn/night
    anchors get a seasonal offset, while forenoon/afternoon/evening are based
    on solar noon. Unlike the old YAML, the late-night split is evaluated
    continuously across midnight instead of forcing a midnight state change.
    """
    seasonal_offset = timedelta(seconds=_seasonal_offset_seconds(local_now))
    morning_fix = _today_at(local_now, "04:13") - seasonal_offset
    night_fix = _today_at(local_now, "23:18") + seasonal_offset

    noon = (
        _same_local_day(local_now, solar_noon)
        if solar_noon is not None
        else _today_at(local_now, "12:46")
    )
    midday_start = noon - timedelta(hours=3)
    evening_start = noon + timedelta(hours=4)

    month = local_now.month
    span_morning = midday_start - morning_fix
    span_evening = night_fix - evening_start
    span_night = (morning_fix + timedelta(days=1)) - night_fix

    return {
        DAY_EARLY_MORNING: morning_fix,
        DAY_LATE_MORNING: morning_fix + span_morning * _MORNING_SPLITS[month],
        DAY_FORENOON: midday_start,
        DAY_AFTERNOON: noon,
        DAY_EARLY_EVENING: evening_start,
        DAY_LATE_EVENING: evening_start + span_evening * _EVENING_SPLITS[month],
        DAY_EARLY_NIGHT: night_fix,
        DAY_LATE_NIGHT: night_fix + span_night * 0.45,
    }


def compute_day_state(local_now: datetime, solar_noon: datetime | None = None) -> str:
    starts = compute_day_phase_starts(local_now, solar_noon)
    if local_now < starts[DAY_EARLY_MORNING]:
        yesterday = local_now - timedelta(days=1)
        y_solar_noon = solar_noon - timedelta(days=1) if solar_noon else None
        y_starts = compute_day_phase_starts(yesterday, y_solar_noon)
        if local_now < y_starts[DAY_LATE_NIGHT]:
            return DAY_EARLY_NIGHT
        return DAY_LATE_NIGHT

    current = DAY_LATE_NIGHT
    for phase in DAY_PHASE_ORDER:
        if local_now >= starts[phase]:
            current = phase
    return current


def compute_day_context(local_now: datetime, holiday: bool) -> str:
    if holiday:
        return DC_FREI
    # weekday(): Monday=0 .. Sunday=6
    if local_now.weekday() >= 5:
        return DC_WOCHENENDE
    return DC_WERKTAG


# --------------------------------------------------------- activity


_IDLE_MEDIA_CONTEXTS = ("idle", "none", "off")
_ENTERTAINMENT_MEDIA_CONTEXTS = ("tv", "streaming")


def compute_activity(
    *,
    bio: str,
    presence_personal: str,
    day_context: str,
    day_state: str,
    homeoffice: bool,
    private_active: bool,
    household_active: bool,
    media_context: str | None,
    stash_streams: int = 0,
    gaming_platform: str | None = None,
    entertainment_active: bool = False,
    music_active: bool = False,
    pc_active: bool = False,
) -> str:
    """Pick the single dominant activity bucket (Activity v1 / PR2).

    First match wins, in this order:

        sleep > waking > private_time > gaming > entertainment > music
              > work_home > household > pc_active > free_time > idle

    Contract change vs v0: the old ``media_context != idle → free_time`` collapse
    is replaced by real buckets. Audio-only (HomePods/Denon) never reaches
    ``media_context`` (media_state classifies it as ``idle`` / ``audio_only_idle``),
    so ``music`` is driven by the raw player signals via ``music_active``.

    ``work_home`` stays inert until a *real* homeoffice indicator is bound — PC
    activity alone is ``pc_active``, never faked into ``work_home``. Presence /
    transition (away / bei_eltern / coming_home) are intentionally NOT activity
    values; they live in Presence and, later, in ``live_status``.
    """
    if bio == BIO_SLEEP:
        return ACT_SLEEP
    if bio == BIO_WAKING:
        return ACT_WAKING

    if bio != BIO_AWAKE:
        return ACT_IDLE

    media = (media_context or "").strip().lower()
    platform = (gaming_platform or "").strip().lower()

    # 4) private_time — höchste awake-Priorität (Stash / expliziter Kontext / Flag).
    if private_active or media == ACT_PRIVATE or stash_streams > 0:
        return ACT_PRIVATE
    # 5) gaming — Screen-Spiel schlägt passives TV/Streaming/Audio.
    if media == ACT_GAMING or (platform and platform not in ("none", "")):
        return ACT_GAMING
    # 6) entertainment — TV/Streaming (media_context) oder das media_state-Binary.
    if media in _ENTERTAINMENT_MEDIA_CONTEXTS or entertainment_active:
        return ACT_ENTERTAINMENT
    # 7) music — reines Audio aus den Roh-Playern (HomePods playing / Denon aktiv).
    if music_active:
        return ACT_MUSIC
    # 8) work_home — nur mit echtem Indikator, werktags, zuhause.
    if homeoffice and presence_personal == PERS_HOME and day_context == DC_WERKTAG:
        return ACT_WORK_HOME
    # 9) household.
    if household_active:
        return ACT_HOUSEHOLD
    # 10) pc_active — PC an, aber kein stärkerer Kontext erkannt.
    if pc_active:
        return ACT_PC_ACTIVE
    # 11) free_time — Rest-Nicht-Idle-media_context (zukunftssicher).
    if media and media not in _IDLE_MEDIA_CONTEXTS:
        return ACT_FREE_TIME

    return ACT_IDLE


# --------------------------------------------------------- effective presence
#                                                           activity-hold (PR3)


@dataclass(frozen=True)
class ActivityHoldResult:
    """Overlay-Ergebnis des lokalen Activity-Holds auf presence_effective."""

    effective_presence: str
    transition: str
    assumed: bool
    reason: str
    hold_strength: str
    source_activity: str | None
    hold_active: bool


def apply_activity_hold(
    *,
    presence_personal: str,
    base_effective: str,
    base_transition: str,
    activity: str,
    home_band: str,
    proximity_trend: str,
) -> ActivityHoldResult:
    """Halte ``presence_effective`` bei rohem ``abwesend`` per starker Aktivität
    auf ``home`` — OHNE ``presence_personal`` zu verändern (der bleibt roher Owner).

    Regeln:

    * ``zuhause`` → ``home`` (nie ``assumed``), Reason ``raw_home``.
    * ``bei_eltern`` → Basis unverändert durchreichen (die bestehende Logik löst
      Eltern als ``away`` = home-äquivalent auf); Aktivität überschreibt Eltern
      NIE.
    * ``abwesend`` → wenn eine Hold-Aktivität aktiv ist
      (``ACTIVITY_HOLD_STRENGTH``), wird ``home`` **assumed** gehalten. Der
      Far-Away-Bruch ist differenziert:
        - **Harte Anker** (``pc_active``/``gaming``/``private_time``/
          ``work_home``/``household``) bedeuten bei Benni sehr wahrscheinlich
          physische Anwesenheit / bewusste lokale Nutzung → sie halten ``home``
          AUCH bei bestätigtem Far-Away (``home_band == far`` UND Trend
          ``away_from_home``).
        - **Weiche/ambiente Signale** (``music``/``entertainment``,
          ``SOFT_HOLD_ACTIVITIES``) können vergessen weiterlaufen → bei
          bestätigtem Far-Away wird ihr Hold GEBROCHEN, Reason
          ``activity_hold_broken_far_away:<activity>``.
    * Sonst (kein Hold, oder Soft-Hold-Bruch) → Basis unverändert durchreichen.

    Rein / testbar; kein HA-Import. ``presence_personal`` wird nie geschrieben.
    """
    if presence_personal == PERS_HOME:
        return ActivityHoldResult(
            base_effective, base_transition, False, "raw_home", HOLD_NONE, None, False
        )
    if presence_personal == PERS_PARENTS:
        return ActivityHoldResult(
            base_effective, base_transition, False, "at_parents", HOLD_NONE, None, False
        )

    # presence_personal == abwesend (oder unbekannt): nur echtes Away darf gehalten
    # werden.
    strength = ACTIVITY_HOLD_STRENGTH.get(activity)
    if strength is None:
        # Keine Hold-Aktivität (idle/sleep/waking/free_time) → Basis durchreichen.
        return ActivityHoldResult(
            base_effective, base_transition, False, base_effective, HOLD_NONE, None, False
        )

    confirmed_far_away = home_band == BAND_FAR and proximity_trend == "away_from_home"
    if confirmed_far_away and activity in SOFT_HOLD_ACTIVITIES:
        # Weiches/ambientes Signal bei bestätigtem Far-Away → Hold brechen.
        return ActivityHoldResult(
            base_effective,
            base_transition,
            False,
            f"activity_hold_broken_far_away:{activity}",
            HOLD_NONE,
            None,
            False,
        )

    # Harter Anker (immer) oder weiches Signal ohne Far-Away → Hold greift.
    return ActivityHoldResult(
        EFF_HOME, EFF_HOME, True, f"activity_hold:{activity}", strength, activity, True
    )


def away_gate_active(presence_personal: str, hold_active: bool) -> bool:
    """Kanonisches Away-Gate: ``on`` ⇔ ``abwesend`` UND kein aktiver Activity-Hold.

    ``zuhause``/``bei_eltern`` sind home-äquivalent (Gate off). Ein aktiver
    Activity-Hold (assumed home bei rohem ``abwesend``) schaltet das Gate off —
    so reißt ein GPS-Blip bei laufender lokaler Aktivität keine away-gegateten
    Konsumenten ab.
    """
    return presence_personal == PERS_AWAY and not hold_active

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
from datetime import date, datetime, timedelta, timezone
from typing import Any, Mapping

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
    ACT_WORK_AWAY,
    ACT_WORK_HOME,
    ACTIVITY_DECISION_CONTRACT_VERSION,
    ACTIVITY_PRECEDENCE,
    ACTIVITY_HOLD_STRENGTH,
    SOFT_HOLD_ACTIVITIES,
    BAND_FAR,
    BAND_HOME,
    BAND_NEAR,
    BAND_PREHEAT,
    BIO_AWAKE,
    BIO_PROVISIONAL_SLEEP,
    BIO_SLEEP,
    BIO_WAKING,
    DAY_EARLY_NIGHT,
    DAY_EARLY_MORNING,
    DAY_AFTERNOON,
    DAY_EVENING,
    DAY_FORENOON,
    DAY_LATE_EVENING,
    DAY_LATE_AFTERNOON,
    DAY_LATE_NIGHT,
    DAY_MIDDAY,
    DC_FREI,
    DC_WERKTAG,
    DC_WOCHENENDE,
    DEFAULT_ARRIVING_STABILIZE_SECONDS,
    DEFAULT_ACTIVITY_FEED_FRESHNESS_SECONDS,
    DEFAULT_LEAVING_STABILIZE_SECONDS,
    DEFAULT_PRESENCE_STALE_SECONDS,
    DEFAULT_PROXIMITY_TREND_EPSILON_M,
    DEFAULT_STABLE_AWAY_SECONDS,
    DEFAULT_WAKING_TIMEOUT_MINUTES,
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


def _is_away(value: str | None) -> bool:
    """True for a DEFINITE not-home reading (router/tracker says away).

    Distinct from ``not _is_home``: ``None``/``unknown``/``unavailable`` are NOT
    away — they are absence-of-signal (unbound slot or a briefly-restarting
    tracker) and must never assert away. Only an explicit negative token counts.
    Used for the parents-router override (FLEET-264): a parents WLAN tracker that
    positively reports ``not_home`` is authoritative that the phone is NOT on the
    parents network, and overrides a stale ``bei_eltern`` SSID hint.
    """
    if value is None:
        return False
    return str(value).lower() in ("not_home", "away", "off", "false", "0", "no")


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
    2. Raw SSID matches a configured parents WLAN → ``bei_eltern`` (instant),
       *unless* a parents-WLAN tracker positively reports ``not_home``
       (``parents_router_away``). The iOS SSID sensor freezes on the parents
       network name and re-reports it with a fresh timestamp, so a freshness
       gate cannot catch it — the authoritative router vetoes the stale hint
       (FLEET-264).
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
       Exception: a retained ``bei_eltern`` is NOT held when the parents router
       positively says ``not_home`` (``parents_router_away``) — the stuck-parents
       state clears even without a fresh GPS this tick (FLEET-264). An
       ``unavailable`` tracker at restart is absence-of-signal, not ``not_home``,
       so this exception never fires on a restart.

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

    # Parents-router truth (FLEET-264): the parents FRITZ!Box tracker is the
    # authoritative WLAN-association signal. ``home`` on it → definitely there;
    # a positive ``not_home`` → definitely NOT on the parents network, which
    # overrides the freshness-less (often iOS-frozen) parents SSID hint. Absence
    # of signal (None/unknown → both helpers False) asserts neither.
    parents_present = _is_home(wlan_eltern_1) or _is_home(wlan_eltern_2)
    parents_router_away = not parents_present and (
        _is_away(wlan_eltern_1) or _is_away(wlan_eltern_2)
    )

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

    # 2) Parents WLAN by SSID — home equivalent, instant. Not GPS-gated, BUT a
    # parents router positively reading ``not_home`` vetoes the stale SSID hint
    # (FLEET-264): the iOS SSID sensor freezes on the parents network name and
    # keeps re-reporting it with a fresh timestamp, so a freshness gate cannot
    # catch it — only the authoritative router can.
    if _ssid_matches(ssid, parents_ssids) and not parents_router_away:
        return PERS_PARENTS

    # 3) Parents WLAN — home equivalent. No freshness gate: a router seen as
    # "home" on the parents network is durable evidence that Benni is there.
    if parents_present:
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
    # Retain, EXCEPT a stale bei_eltern that the parents router now positively
    # contradicts (FLEET-264): a definite not_home must clear the stuck-parents
    # state even without a fresh GPS this tick. Absence of tracker signal (HA
    # restart → unavailable/None) is NOT not_home, so the restart-retain guard
    # for bei_eltern is preserved.
    if prev_personal in PRESENCE_PERSONAL_STATES and not (
        prev_personal == PERS_PARENTS and parents_router_away
    ):
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


_WAKE_INTERACTION_CANDIDATES = (
    ("coffee", "strong", 4),
    ("door", "strong", 3),
    ("pc", "soft", 2),
    ("ps5", "soft", 1),
)
_WAKE_ALLOWED_DAY_STATES = (
    DAY_EARLY_MORNING,
    DAY_FORENOON,
    DAY_MIDDAY,
    DAY_AFTERNOON,
    DAY_LATE_AFTERNOON,
    DAY_EVENING,
    DAY_LATE_EVENING,
)
def wake_indicators_allowed(day_state: str | None) -> bool:
    """Return whether activity-based wake indicators may change Bio-State.

    The reviewed Context State spec allows coffee/door/PC/PS5 wake indicators
    only in the non-night master phases. Missing day-state is treated
    conservatively: do not infer wake from activity noise.
    """
    return day_state in _WAKE_ALLOWED_DAY_STATES


@dataclass(frozen=True)
class WakeInteractionDecision:
    """Explain one deterministic regular-wake interaction decision."""

    accepted: bool
    source: str | None
    signal_strength: str | None
    priority: int | None
    freshness: str
    rejection_reason: str | None
    reference_start: datetime | None
    active_since: datetime | None
    valid_candidates: tuple[str, ...] = ()
    suppressed_candidates: tuple[str, ...] = ()
    rejected_candidates: tuple[str, ...] = ()

    def as_attributes(self) -> dict[str, Any]:
        return {
            "accepted": self.accepted,
            "source": self.source,
            "signal_strength": self.signal_strength,
            "priority": self.priority,
            "freshness": self.freshness,
            "rejection_reason": self.rejection_reason,
            "reference_start": (
                self.reference_start.isoformat() if self.reference_start else None
            ),
            "active_since": (
                self.active_since.isoformat() if self.active_since else None
            ),
            "valid_candidates": list(self.valid_candidates),
            "suppressed_candidates": list(self.suppressed_candidates),
            "rejected_candidates": list(self.rejected_candidates),
        }


def _indicator_freshness(
    key: str,
    indicators: dict[str, bool],
    indicator_active_since: dict[str, datetime | None] | None,
    reference_start: datetime | None,
) -> str:
    """Classify an active level signal against the current lifecycle edge.

    A manual sleep request should not be undone by stale level-style sensors
    that were already active before sleep started. Once such a source cycles
    off and on again, its ``last_changed`` moves after the lifecycle reference
    and it is allowed to wake normally.
    """
    if not indicators.get(key):
        return "inactive"
    if reference_start is None:
        return "unknown_reference"
    if indicator_active_since is None:
        return "unknown_timestamp"
    active_since = indicator_active_since.get(key)
    if active_since is None:
        return "unknown_timestamp"
    return "fresh" if active_since > reference_start else "stale"


def regular_wake_interaction_decision(
    *,
    indicators: dict[str, bool],
    day_state: str | None,
    indicator_active_since: dict[str, datetime | None] | None,
    sleep_started: datetime | None,
) -> WakeInteractionDecision:
    """Return the complete, deterministic decision for a regular wake signal."""

    active_candidates = [
        (key, strength, priority)
        for key, strength, priority in _WAKE_INTERACTION_CANDIDATES
        if indicators.get(key)
    ]
    if not active_candidates:
        return WakeInteractionDecision(
            accepted=False,
            source=None,
            signal_strength=None,
            priority=None,
            freshness="inactive",
            rejection_reason="no_active_signal",
            reference_start=sleep_started,
            active_since=None,
        )

    if not wake_indicators_allowed(day_state):
        key, strength, priority = active_candidates[0]
        return WakeInteractionDecision(
            accepted=False,
            source=key,
            signal_strength=strength,
            priority=priority,
            freshness="phase_blocked",
            rejection_reason="day_phase_blocked",
            reference_start=sleep_started,
            active_since=(
                indicator_active_since.get(key)
                if indicator_active_since is not None
                else None
            ),
            rejected_candidates=tuple(key for key, _, _ in active_candidates),
        )

    candidate_statuses = [
        (
            key,
            strength,
            priority,
            _indicator_freshness(
                key, indicators, indicator_active_since, sleep_started
            ),
        )
        for key, strength, priority in active_candidates
    ]
    valid = [
        candidate
        for candidate in candidate_statuses
        if candidate[3] in {"fresh", "unknown_reference", "unknown_timestamp"}
    ]
    rejected = [candidate for candidate in candidate_statuses if candidate not in valid]
    if not valid:
        key, strength, priority, freshness = candidate_statuses[0]
        return WakeInteractionDecision(
            accepted=False,
            source=key,
            signal_strength=strength,
            priority=priority,
            freshness=freshness,
            rejection_reason="before_reference",
            reference_start=sleep_started,
            active_since=(
                indicator_active_since.get(key)
                if indicator_active_since is not None
                else None
            ),
            rejected_candidates=tuple(candidate[0] for candidate in rejected),
        )

    key, strength, priority, freshness = valid[0]
    return WakeInteractionDecision(
        accepted=True,
        source=key,
        signal_strength=strength,
        priority=priority,
        freshness="fresh" if freshness == "fresh" else "unknown",
        rejection_reason=None,
        reference_start=sleep_started,
        active_since=(
            indicator_active_since.get(key)
            if indicator_active_since is not None
            else None
        ),
        valid_candidates=tuple(candidate[0] for candidate in valid),
        suppressed_candidates=tuple(candidate[0] for candidate in valid[1:]),
        rejected_candidates=tuple(candidate[0] for candidate in rejected),
    )


def regular_wake_interaction(
    *,
    indicators: dict[str, bool],
    day_state: str | None,
    indicator_active_since: dict[str, datetime | None] | None,
    sleep_started: datetime | None,
) -> bool:
    """Return whether the existing regular wake interaction is accepted."""

    return regular_wake_interaction_decision(
        indicators=indicators,
        day_state=day_state,
        indicator_active_since=indicator_active_since,
        sleep_started=sleep_started,
    ).accepted


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
    provisional_active: bool = False,
    wake_due: bool | None = None,
    waking_started: datetime | None = None,
    waking_timeout_minutes: int = DEFAULT_WAKING_TIMEOUT_MINUTES,
    interaction_reference_start: datetime | None = None,
) -> tuple[str, datetime | None, datetime | None]:
    """Return the Phase-1 Bio state without inferring sleep.

    ``provisional_sleep`` is a protection state only. It never creates a
    sleep-start timestamp and never satisfies minimum sleep. The internal
    E/L/M/A contract may enter it from ``awake`` and may start ``waking``
    from either confirmed ``sleep`` or ``provisional_sleep``.
    ``wake_needed`` remains a disclosed compatibility fallback when
    ``wake_due`` is not available.
    """

    sleep_start = prev_sleep_start
    awake_start = prev_awake_start
    planned_wake = wake_needed if wake_due is None else wake_due

    activity_wake = regular_wake_interaction(
        indicators=indicators,
        day_state=day_state,
        indicator_active_since=indicator_active_since,
        sleep_started=(
            interaction_reference_start
            if interaction_reference_start is not None
            else prev_sleep_start
        ),
    )

    if presence_personal == PERS_AWAY and prev_state != BIO_AWAKE:
        return BIO_AWAKE, sleep_start, now

    if prev_state == BIO_SLEEP:
        if activity_wake:
            return BIO_AWAKE, sleep_start, now
        if planned_wake:
            return BIO_WAKING, sleep_start, awake_start
        return BIO_SLEEP, sleep_start, awake_start

    if prev_state == BIO_PROVISIONAL_SLEEP:
        if activity_wake:
            return BIO_AWAKE, sleep_start, now
        if planned_wake:
            return BIO_WAKING, sleep_start, awake_start
        return BIO_PROVISIONAL_SLEEP, sleep_start, awake_start

    if prev_state == BIO_WAKING:
        if activity_wake:
            return BIO_AWAKE, sleep_start, now
        if (
            waking_started is not None
            and waking_timeout_minutes >= 0
            and _elapsed_seconds(waking_started, now)
            >= waking_timeout_minutes * 60
        ):
            return BIO_AWAKE, sleep_start, now
        return BIO_WAKING, sleep_start, awake_start

    if provisional_active:
        return BIO_PROVISIONAL_SLEEP, sleep_start, awake_start

    return BIO_AWAKE, sleep_start, awake_start or now


def _elapsed_seconds(start: datetime, end: datetime) -> float:
    """Return monotonic wall-independent elapsed time for aware timestamps."""

    if (
        start.tzinfo is not None
        and start.utcoffset() is not None
        and end.tzinfo is not None
        and end.utcoffset() is not None
    ):
        return max(0.0, end.timestamp() - start.timestamp())
    return max(0.0, (end - start).total_seconds())


# --------------------------------------------------------- day_state / context


# The implementation deliberately uses a small civil calendar model rather
# than astronomical inputs.  Every boundary belongs to the local civil clock;
# the seasonal accordion is recomputed from the calendar date on every tick.
DAY_STATE_MODEL_VERSION = "calendar-seasonal-accordion-v2"
DAY_STATE_REASON = "date_seasonal_accordion"

DAY_PHASE_ORDER = (
    DAY_EARLY_NIGHT,
    DAY_LATE_NIGHT,
    DAY_EARLY_MORNING,
    DAY_FORENOON,
    DAY_MIDDAY,
    DAY_AFTERNOON,
    DAY_LATE_AFTERNOON,
    DAY_EVENING,
    DAY_LATE_EVENING,
)

_SECONDS_PER_DAY = 24 * 60 * 60
_WINTER_NIGHT_SECONDS = 6 * 60 * 60
_NON_NIGHT_PHASE_COUNT = 7

# The civil winter profile is the reference.  From winter to summer the
# complete non-night block gains 182 minutes: 182 calendar days × 60 seconds.
# The exact rate is derived from each real anchor interval, so leap years keep
# both solstice endpoints stable instead of accumulating a one-day drift.
DAY_STATE_TARGET_SECONDS_PER_DAY = 60.0
DAY_STATE_SOLSTICE_EXTENSION_SECONDS = 182 * DAY_STATE_TARGET_SECONDS_PER_DAY
DAY_STATE_MORNING_SHARE = 0.40
DAY_STATE_EVENING_SHARE = 0.60
DAY_STATE_NIGHT_RATIO = "2:1"

_DAY_PHASE_BASE_DURATIONS_SECONDS = {
    DAY_EARLY_MORNING: 3 * 60 * 60,
    DAY_FORENOON: 3 * 60 * 60,
    DAY_MIDDAY: 2 * 60 * 60,
    DAY_AFTERNOON: 2 * 60 * 60,
    DAY_LATE_AFTERNOON: 2 * 60 * 60,
    DAY_EVENING: 3 * 60 * 60,
    DAY_LATE_EVENING: 3 * 60 * 60,
}

_NON_NIGHT_PHASES = (
    DAY_EARLY_MORNING,
    DAY_FORENOON,
    DAY_MIDDAY,
    DAY_AFTERNOON,
    DAY_LATE_AFTERNOON,
    DAY_EVENING,
    DAY_LATE_EVENING,
)


def _season_anchor_points(year: int) -> tuple[tuple[date, str, float], ...]:
    """Return civil seasonal anchors around the requested calendar year."""
    return (
        (date(year - 1, 12, 21), "winter_solstice", 0.0),
        (date(year, 3, 21), "spring_equinox", 0.5),
        (date(year, 6, 21), "summer_solstice", 1.0),
        (date(year, 9, 23), "autumn_equinox", 0.5),
        (date(year, 12, 21), "winter_solstice", 0.0),
        (date(year + 1, 3, 21), "spring_equinox", 0.5),
    )


def _seasonal_parameters(local_now: datetime) -> tuple[float, float, str, int]:
    """Return extension seconds, seasonal fraction, segment, and span days."""
    current = local_now.date()
    anchors = _season_anchor_points(current.year)
    for (start, start_name, start_fraction), (end, end_name, end_fraction) in zip(
        anchors, anchors[1:]
    ):
        if current <= end:
            span_days = (end - start).days
            progress = (current - start).days / span_days
            fraction = start_fraction + (end_fraction - start_fraction) * progress
            if current == start:
                segment = start_name
            elif current == end:
                segment = end_name
            else:
                segment = f"{start_name}_to_{end_name}"
            return (
                DAY_STATE_SOLSTICE_EXTENSION_SECONDS * fraction,
                fraction,
                segment,
                span_days,
            )

    raise AssertionError(f"No seasonal interval for {current.isoformat()}")


def _phase_boundary_seconds(extension_seconds: float) -> dict[str, float]:
    """Build one local wall-clock profile from the seasonal accordion size."""
    evening_extension = extension_seconds * DAY_STATE_EVENING_SHARE
    night_seconds = _WINTER_NIGHT_SECONDS - extension_seconds
    night_inner_split = night_seconds * (2 / 3)
    non_night_extension = extension_seconds / _NON_NIGHT_PHASE_COUNT

    starts: dict[str, float] = {
        DAY_EARLY_NIGHT: evening_extension,
        DAY_LATE_NIGHT: evening_extension + night_inner_split,
        DAY_EARLY_MORNING: evening_extension + night_seconds,
    }
    cursor = starts[DAY_EARLY_MORNING]
    previous = DAY_EARLY_MORNING
    for phase in _NON_NIGHT_PHASES[1:]:
        cursor += _DAY_PHASE_BASE_DURATIONS_SECONDS[previous] + non_night_extension
        starts[phase] = cursor
        previous = phase

    # The unreturned endpoint is the next day's early_night.  Keeping this
    # identity explicit makes the 40/60 split and the seven equal extensions
    # reviewable without introducing a tenth published phase.
    endpoint = cursor + _DAY_PHASE_BASE_DURATIONS_SECONDS[previous] + non_night_extension
    expected_endpoint = _SECONDS_PER_DAY + evening_extension
    if abs(endpoint - expected_endpoint) > 1e-6:
        raise AssertionError("non-night accordion does not close at next early_night")
    return {phase: starts[phase] for phase in DAY_PHASE_ORDER}


def _at_local_wall(anchor: datetime, seconds: float) -> datetime:
    """Create a local wall-clock datetime without UTC/DST arithmetic."""
    wall = datetime(anchor.year, anchor.month, anchor.day) + timedelta(seconds=seconds)
    return wall.replace(tzinfo=anchor.tzinfo)


def compute_day_phase_starts(local_now: datetime) -> dict[str, datetime]:
    """Return nine ordered local wall-clock boundaries for the calendar date.

    ``early_night`` may therefore begin after local midnight.  Until that
    boundary, ``compute_day_state`` correctly carries the prior day's
    ``late_evening`` phase across midnight.
    """
    extension_seconds, _, _, _ = _seasonal_parameters(local_now)
    boundary_seconds = _phase_boundary_seconds(extension_seconds)
    return {
        phase: _at_local_wall(local_now, boundary_seconds[phase])
        for phase in DAY_PHASE_ORDER
    }


def compute_day_state(local_now: datetime) -> str:
    starts = compute_day_phase_starts(local_now)
    wall_now = local_now.replace(tzinfo=None)
    current = (
        DAY_LATE_EVENING
        if wall_now < starts[DAY_EARLY_NIGHT].replace(tzinfo=None)
        else DAY_EARLY_NIGHT
    )
    for phase in DAY_PHASE_ORDER:
        if wall_now >= starts[phase].replace(tzinfo=None):
            current = phase
    return current


def compute_day_phase_diagnostics(local_now: datetime, active_phase: str) -> dict[str, Any]:
    """Return owner-local date, boundary, season, and model diagnostics."""
    extension_seconds, seasonal_fraction, season_segment, interval_days = (
        _seasonal_parameters(local_now)
    )
    starts = compute_day_phase_starts(local_now)
    phase_durations = {
        phase: _DAY_PHASE_BASE_DURATIONS_SECONDS[phase]
        + extension_seconds / _NON_NIGHT_PHASE_COUNT
        for phase in _NON_NIGHT_PHASES
    }
    return {
        "active_phase": active_phase,
        "date": local_now.date().isoformat(),
        "source": "date",
        "version": DAY_STATE_MODEL_VERSION,
        "model_version": DAY_STATE_MODEL_VERSION,
        "reason": DAY_STATE_REASON,
        "phase_starts": {
            phase: starts[phase].isoformat() for phase in DAY_PHASE_ORDER
        },
        "season_parameters": {
            "fraction": round(seasonal_fraction, 9),
            "segment": season_segment,
            "anchor_interval_days": interval_days,
            "target_extension_seconds_per_day": DAY_STATE_TARGET_SECONDS_PER_DAY,
            "non_night_extension_seconds": round(extension_seconds, 6),
            "morning_share": DAY_STATE_MORNING_SHARE,
            "evening_share": DAY_STATE_EVENING_SHARE,
            "night_ratio": DAY_STATE_NIGHT_RATIO,
            "anchors": {
                "winter_solstice": "12-21",
                "spring_equinox": "03-21",
                "summer_solstice": "06-21",
                "autumn_equinox": "09-23",
            },
            "phase_duration_seconds": {
                phase: round(phase_durations[phase], 6)
                for phase in _NON_NIGHT_PHASES
            },
        },
    }


def compute_day_context(local_now: datetime, holiday: bool) -> str:
    if holiday:
        return DC_FREI
    # weekday(): Monday=0 .. Sunday=6
    if local_now.weekday() >= 5:
        return DC_WOCHENENDE
    return DC_WERKTAG


# --------------------------------------------------------- activity


# Media-Feed-States (benni_media_state activity_context) → Core-Media-Bucket.
# Current Media State publishes four active buckets plus idle.  ``free_time``
# remains accepted as an explicit legacy feed value so an older producer cannot
# silently become an unknown activity; unknown/unavailable values are never
# mapped to it.
_MEDIA_FEED_BUCKETS = frozenset(
    {ACT_PRIVATE, ACT_GAMING, ACT_ENTERTAINMENT, ACT_MUSIC, ACT_FREE_TIME}
)
_ACTIVITY_SOURCE_BIO = "internal:coordinator.bio_state"
_ACTIVITY_SOURCE_PRESENCE = "internal:coordinator.presence_personal"
_ACTIVITY_SOURCE_DAY_CONTEXT = "internal:coordinator.day_context"
_ACTIVITY_SOURCE_HOMEOFFICE = "configured:homeoffice_ping"
_ACTIVITY_SOURCE_HOUSEHOLD = "configured:household_source"
_ACTIVITY_SOURCE_PC = "configured:pc_active"
_ACTIVITY_SOURCE_MEDIA = "sensor.system_benni_media_state_activity_context"
_ACTIVITY_SOURCE_FALLBACK = "internal:coordinator.activity_state.fallback"
_ACTIVITY_QUALITY_ORDER = {
    "fresh": 0,
    "unknown": 1,
    "unavailable": 2,
    "stale": 3,
    "degraded": 4,
}


@dataclass(frozen=True)
class ActivityDecision:
    """Auditable result of the Core-State activity arbitration.

    The decision is deliberately independent of Home Assistant.  A coordinator
    supplies the current timestamp, feed metadata and source status; tests can
    therefore exercise the full precedence contract without a running HA.
    """

    winner: str
    valid_candidates: tuple[str, ...]
    suppressed_candidates: tuple[str, ...]
    precedence_reason: str
    input_sources: Mapping[str, tuple[str, ...]]
    freshness: Mapping[str, Mapping[str, Any]]
    quality_status: str
    degraded_reason: str | None
    fallback_reason: str | None
    decision_timestamp: datetime

    def as_attributes(self) -> dict[str, Any]:
        """Return a Home-Assistant/Recorder-safe diagnostic projection."""
        return {
            "contract_version": ACTIVITY_DECISION_CONTRACT_VERSION,
            "winner": self.winner,
            "valid_candidates": list(self.valid_candidates),
            "suppressed_candidates": list(self.suppressed_candidates),
            "precedence_reason": self.precedence_reason,
            "input_sources": {
                candidate: list(sources)
                for candidate, sources in self.input_sources.items()
            },
            "freshness": {
                source: dict(status)
                for source, status in self.freshness.items()
            },
            "quality_status": self.quality_status,
            "degraded_reason": self.degraded_reason,
            "fallback_reason": self.fallback_reason,
            "decision_timestamp": self.decision_timestamp.isoformat(),
        }


def _normalized_quality(value: object) -> str | None:
    if value is None:
        return None
    normalized = str(value).strip().lower()
    if normalized in _ACTIVITY_QUALITY_ORDER:
        return normalized
    if normalized in {"ok", "good", "valid", "available", "ready"}:
        return "fresh"
    if normalized in {"expired", "old"}:
        return "stale"
    if normalized in {"offline"}:
        return "unavailable"
    if normalized in {"error", "invalid", "unreliable"}:
        return "degraded"
    if normalized in {"", "none", "missing"}:
        return "unknown"
    return "degraded"


def _marker_is_true(value: object) -> bool:
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "yes", "on", "degraded"}


def _age_seconds(updated_at: datetime | None, now: datetime) -> int | None:
    if updated_at is None:
        return None
    comparable_updated = updated_at
    comparable_now = now
    if comparable_updated.tzinfo is None:
        comparable_updated = comparable_updated.replace(tzinfo=timezone.utc)
    if comparable_now.tzinfo is None:
        comparable_now = comparable_now.replace(tzinfo=timezone.utc)
    return max(0, int((comparable_now - comparable_updated).total_seconds()))


def _freshness_entry(
    *,
    status: str,
    updated_at: datetime | None,
    now: datetime,
    max_age_seconds: int | None = None,
    reason: str | None = None,
    quality: str | None = None,
) -> dict[str, Any]:
    return {
        "status": status,
        "updated_at": updated_at.isoformat() if updated_at is not None else None,
        "age_seconds": _age_seconds(updated_at, now),
        "max_age_seconds": max_age_seconds,
        "quality": quality,
        "reason": reason,
    }


def _media_feed_status(
    *,
    media_activity: str | None,
    media_activity_quality: str | None,
    media_activity_freshness: str | None,
    media_activity_degraded: bool | str | None,
    media_activity_last_changed: datetime | None,
    media_activity_last_updated: datetime | None,
    decision_timestamp: datetime,
    freshness_s: int,
) -> tuple[str, str | None, dict[str, Any]]:
    """Classify the Media-State feed before it can become a candidate."""
    value = (media_activity or "").strip().lower()
    if value in {"unavailable", "offline"}:
        status = "unavailable"
        reason = "media_feed_unavailable"
    elif value in {"", "unknown", "none", "missing"}:
        status = "unknown"
        reason = "media_feed_unknown"
    elif _marker_is_true(media_activity_degraded):
        status = "degraded"
        reason = "media_feed_degraded_marker"
    else:
        explicit_quality = _normalized_quality(media_activity_quality)
        explicit_freshness = _normalized_quality(media_activity_freshness)
        explicit_bad = next(
            (
                marker
                for marker in (explicit_quality, explicit_freshness)
                if marker in {"unknown", "unavailable", "stale", "degraded"}
            ),
            None,
        )
        if explicit_bad is not None:
            status = explicit_bad
            reason = f"media_feed_{explicit_bad}"
        else:
            feed_timestamp = media_activity_last_updated or media_activity_last_changed
            if feed_timestamp is not None:
                age = _age_seconds(feed_timestamp, decision_timestamp)
                status = "stale" if age is not None and age > freshness_s else "fresh"
                reason = "media_feed_age_exceeded" if status == "stale" else None
            elif explicit_quality == "fresh" or explicit_freshness == "fresh":
                status = "fresh"
                reason = None
            else:
                status = "unknown"
                reason = "media_feed_freshness_missing"

    feed_timestamp = media_activity_last_updated or media_activity_last_changed
    return status, reason, _freshness_entry(
        status=status,
        updated_at=feed_timestamp,
        now=decision_timestamp,
        max_age_seconds=freshness_s,
        reason=reason,
        quality=media_activity_quality or media_activity_freshness,
    )


def _source_is_fresh(
    source: str,
    source_status: Mapping[str, str | None],
) -> bool:
    return _normalized_quality(source_status.get(source, "fresh")) == "fresh"


def compute_activity_decision(
    *,
    bio: str,
    presence_personal: str,
    day_context: str,
    homeoffice: bool,
    household_active: bool,
    media_activity: str | None,
    decision_timestamp: datetime,
    pc_active: bool = False,
    media_activity_quality: str | None = None,
    media_activity_freshness: str | None = None,
    media_activity_degraded: bool | str | None = None,
    media_activity_last_changed: datetime | None = None,
    media_activity_last_updated: datetime | None = None,
    media_activity_source: str = _ACTIVITY_SOURCE_MEDIA,
    media_activity_freshness_s: int = DEFAULT_ACTIVITY_FEED_FRESHNESS_SECONDS,
    source_status: Mapping[str, str | None] | None = None,
) -> ActivityDecision:
    """Return the complete canonical Activity-State decision contract.

    ``day_state`` is deliberately absent: the existing public wrapper retains
    that unused compatibility parameter, while the actual decision depends on
    the stable day context only.  The Media-State value is an input feed, never
    a Core-State result; only a fresh, available and non-degraded feed value can
    contribute a Media candidate.
    """
    source_quality = dict(source_status or {})
    feed_status, feed_reason, feed_freshness = _media_feed_status(
        media_activity=media_activity,
        media_activity_quality=media_activity_quality,
        media_activity_freshness=media_activity_freshness,
        media_activity_degraded=media_activity_degraded,
        media_activity_last_changed=media_activity_last_changed,
        media_activity_last_updated=media_activity_last_updated,
        decision_timestamp=decision_timestamp,
        freshness_s=media_activity_freshness_s,
    )
    source_quality[media_activity_source] = feed_status

    feed_bucket = (
        media_bucket_from_feed(media_activity)
        if feed_status == "fresh"
        else None
    )
    candidates: dict[str, tuple[str, ...]] = {}

    if bio == BIO_SLEEP:
        candidates[ACT_SLEEP] = (_ACTIVITY_SOURCE_BIO,)
    elif bio == BIO_WAKING:
        candidates[ACT_WAKING] = (_ACTIVITY_SOURCE_BIO,)

    # A sleep/waking Bio-State remains the highest-priority candidate, but all
    # currently observable lower candidates are retained for transparent
    # suppression diagnostics.  Other Bio values keep the historical safe
    # behavior: only an explicitly awake state opens the lower activity layer.
    lower_layer_open = bio in {BIO_AWAKE, BIO_SLEEP, BIO_WAKING}
    if lower_layer_open:
        if feed_bucket == ACT_PRIVATE and _source_is_fresh(
            media_activity_source, source_quality
        ):
            candidates[ACT_PRIVATE] = (media_activity_source,)

        if feed_bucket in {
            ACT_GAMING,
            ACT_ENTERTAINMENT,
            ACT_MUSIC,
            ACT_FREE_TIME,
        }:
            if _source_is_fresh(media_activity_source, source_quality):
                candidates[feed_bucket] = (media_activity_source,)

        work_sources = (
            _ACTIVITY_SOURCE_HOMEOFFICE,
            _ACTIVITY_SOURCE_PRESENCE,
            _ACTIVITY_SOURCE_DAY_CONTEXT,
        )
        if (
            homeoffice
            and presence_personal == PERS_HOME
            and day_context == DC_WERKTAG
            and all(_source_is_fresh(source, source_quality) for source in work_sources)
        ):
            candidates[ACT_WORK_HOME] = work_sources

        household_sources = (_ACTIVITY_SOURCE_HOUSEHOLD,)
        if household_active and all(
            _source_is_fresh(source, source_quality) for source in household_sources
        ):
            candidates[ACT_HOUSEHOLD] = household_sources

        pc_sources = (_ACTIVITY_SOURCE_PC,)
        if pc_active and all(
            _source_is_fresh(source, source_quality) for source in pc_sources
        ):
            candidates[ACT_PC_ACTIVE] = pc_sources

    # ``idle`` is the deterministic safe fallback and is always a valid
    # candidate.  It is never inferred from a degraded feed value.
    candidates[ACT_IDLE] = (_ACTIVITY_SOURCE_FALLBACK,)

    ordered_candidates = tuple(
        candidate for candidate in ACTIVITY_PRECEDENCE if candidate in candidates
    )
    winner = ordered_candidates[0]
    suppressed = ordered_candidates[1:]

    if winner == ACT_IDLE:
        precedence_reason = "fallback: no valid higher-priority candidate"
        fallback_reason = (
            feed_reason or "no_valid_higher_priority_candidate"
        )
    elif suppressed:
        precedence_reason = (
            f"{winner} outranks {', '.join(suppressed)} by canonical precedence"
        )
        fallback_reason = None
    else:
        precedence_reason = f"{winner} is the only valid activity candidate"
        fallback_reason = None

    freshness: dict[str, Mapping[str, Any]] = {
        media_activity_source: feed_freshness,
    }
    relevant_sources: list[str] = []
    for sources in candidates.values():
        for source in sources:
            if source not in relevant_sources:
                relevant_sources.append(source)
    for source in source_quality:
        if source not in relevant_sources:
            relevant_sources.append(source)
    for source in relevant_sources:
        if source == media_activity_source:
            continue
        status = _normalized_quality(source_quality.get(source, "fresh")) or "unknown"
        freshness[source] = _freshness_entry(
            status=status,
            updated_at=decision_timestamp if status == "fresh" else None,
            now=decision_timestamp,
            reason=None if status == "fresh" else f"source_{status}",
        )

    quality_status = max(
        (str(item["status"]) for item in freshness.values()),
        key=lambda status: _ACTIVITY_QUALITY_ORDER.get(status, 99),
    )
    quality_reasons = [
        f"{source}:{item['status']}"
        for source, item in freshness.items()
        if item["status"] != "fresh"
    ]
    degraded_reason = ";".join(quality_reasons) if quality_reasons else None

    return ActivityDecision(
        winner=winner,
        valid_candidates=ordered_candidates,
        suppressed_candidates=suppressed,
        precedence_reason=precedence_reason,
        input_sources={candidate: candidates[candidate] for candidate in ordered_candidates},
        freshness=freshness,
        quality_status=quality_status,
        degraded_reason=degraded_reason,
        fallback_reason=fallback_reason,
        decision_timestamp=decision_timestamp,
    )


def media_bucket_from_feed(media_activity: str | None) -> str | None:
    """Media-State-Feed-State → Core-Media-Bucket (oder ``None``).

    Reine Projektion des externen Feeds (``sensor.*_media_state_activity_context``)
    auf die Media-Buckets. KEINE eigene Media-Detektion, KEIN Roh-Fallback:
    ``idle``/``none``/``unknown``/``unavailable``/fehlend → ``None`` (kein Bucket).
    ``free_time`` bleibt als expliziter Legacy-Feedwert kompatibel; der aktuelle
    Media-State-Producer emittiert ihn nicht. media_state bleibt Owner der
    Media-Wahrheit (FLEET-256).
    """
    v = (media_activity or "").strip().lower()
    return v if v in _MEDIA_FEED_BUCKETS else None


def compute_activity(
    *,
    bio: str,
    presence_personal: str,
    day_context: str,
    day_state: str,
    homeoffice: bool,
    household_active: bool,
    media_activity: str | None = None,
    pc_active: bool = False,
) -> str:
    """Compatibility wrapper returning only the canonical winner.

    Direct pure callers historically supplied a validated feed state without a
    HA timestamp.  Such calls retain that behavior; the coordinator uses
    ``compute_activity_decision`` with the real feed timestamp and quality.
    """
    feed_is_known = media_bucket_from_feed(media_activity) is not None
    decision = compute_activity_decision(
        bio=bio,
        presence_personal=presence_personal,
        day_context=day_context,
        homeoffice=homeoffice,
        household_active=household_active,
        media_activity=media_activity,
        decision_timestamp=datetime.now(timezone.utc),
        pc_active=pc_active,
        media_activity_quality="fresh" if feed_is_known else None,
    )
    return decision.winner


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


# --------------------------------------------------------- live_status (UX)
# Anzeige-only Cockpit-Sensor. Fasst den bereits arbitrierten Kontext in einen
# kurzen deutschen Text + reiche Attribute. KEINE Policy-Entscheidung, KEIN
# neuer Roh-Read — alle Eingaben stammen aus schon berechneten Core-State-Daten.

_LIVE_STATE_MAXLEN = 250

_LIVE_DEVICE_LABELS: dict[str, str] = {
    "homepods": "HomePods",
    "denon": "Denon",
    "pc": "PC",
    "ps5": "PS5",
    "switch": "Switch",
    "tv": "TV",
    "appletv": "Apple TV",
}
_LIVE_PLATFORM_LABELS: dict[str, str] = {
    "ps5": "PS5",
    "switch": "Switch",
    "pc": "PC",
}

# --- UX-Contract v1 (FLEET-259) -------------------------------------------
# Explizite, maschinenlesbare Panel-Attribute. Rein additiv; leiten sich aus der
# bestehenden Live-Status-Priorität ab — keine neuen Enums, keine State-Änderung.
LIVE_UX_CONTRACT_VERSION = 1

# Feiner status_kind (aus priority + Presence-Spezifika) → UI-Farbrolle (Name,
# keine Hex/CSS) und numerischer display_order-Rang.
_LIVE_COLOR_ROLE: dict[str, str] = {
    "sleep": "sleep",
    "waking": "sleep",
    "away": "presence",
    "parents": "presence",
    "coming_home": "presence",
    "leaving_home": "presence",
    "private": "private",
    "gaming": "media",
    "entertainment": "media",
    "music": "media",
    "work": "work",
    "household": "home",
    "pc": "home",
    "home": "home",
    "unknown": "unknown",
}
_LIVE_DISPLAY_ORDER: dict[str, int] = {
    "sleep": 10,
    "waking": 10,
    "away": 20,
    "parents": 20,
    "coming_home": 20,
    "leaving_home": 20,
    "private": 30,
    "gaming": 40,
    "entertainment": 50,
    "music": 60,
    "work": 70,
    "household": 80,
    "pc": 90,
    "home": 100,
    "unknown": 999,
}
# Zentrale Quell-Entities (Debug/Panel-Hinweis). Die Media-Quelle kommt dynamisch
# aus dem konfigurierten Feed-Slot (media_activity_source) dazu — kein neuer Read.
_LIVE_CORE_SOURCE_ENTITIES: tuple[str, ...] = (
    "sensor.benni_core_state_activity_state",
    "sensor.system_benni_core_state_presence_effective",
)


@dataclass(frozen=True)
class LiveStatus:
    """Ergebnis des UX-Live-Status: kurzer State-Text + Anzeige-Attribute."""

    state: str
    attrs: dict[str, Any]


def _live_clean(value: Any) -> str | None:
    """Normalisiere einen optionalen String; leere/Sentinel-Werte → None."""
    if value is None:
        return None
    s = str(value).strip()
    if not s or s.lower() in ("none", "unknown", "unavailable"):
        return None
    return s


def compute_live_status(
    *,
    bio: str,
    presence_personal: str,
    presence_effective: str,
    presence_transition: str,
    activity: str,
    activity_reason: str | None = None,
    presence_reason: str | None = None,
    media_activity_context: str | None = None,
    media_activity_reason: str | None = None,
    media_activity_hold_strength: str | None = None,
    media_activity_source: str | None = None,
    title: str | None = None,
    artist: str | None = None,
    game_title: str | None = None,
    source_app: str | None = None,
    media_device: str | None = None,
    gaming_platform: str | None = None,
    gaming_source: str | None = None,
    pc_active: bool = False,
    assumed: bool = False,
    activity_hold_active: bool = False,
    day_state: str | None = None,
) -> LiveStatus:
    """Leite den sprechenden Live-Status ab (Anzeige-only, Prioritäts-geordnet).

    Reihenfolge: sleep/waking > Presence-Overlays (Eltern / unterwegs /
    Übergänge) > private_time > gaming > entertainment > music > work >
    household > pc_active > zuhause > unbekannt. Media-Details kommen aus dem
    bereits gespiegelten Media-Activity-Feed; bei ``private_time`` werden KEINE
    Titel/Studio/Stash-Details in State oder Attribute übernommen.
    """
    title = _live_clean(title)
    artist = _live_clean(artist)
    game_title = _live_clean(game_title)
    source_app = _live_clean(source_app)
    device = _live_clean(media_device)
    platform = _live_clean(gaming_platform)
    device_label = _LIVE_DEVICE_LABELS.get((device or "").lower(), device)

    # ----- Prioritäts-Kaskade -----
    if bio == BIO_SLEEP or activity == ACT_SLEEP:
        headline, icon, privacy, priority = "Benni schläft", "mdi:sleep", "normal", "sleep"
    elif bio == BIO_WAKING or activity == ACT_WAKING:
        headline, icon, privacy, priority = (
            "Benni wacht auf", "mdi:weather-sunset-up", "normal", "waking",
        )
    elif presence_personal == PERS_PARENTS:
        headline, icon, privacy, priority = (
            "Benni ist bei den Eltern", "mdi:home-heart", "presence", "presence",
        )
    elif presence_transition == TRANS_COMING_HOME:
        headline, icon, privacy, priority = (
            "Benni kommt nach Hause", "mdi:home-import-outline", "presence", "presence",
        )
    elif presence_transition == TRANS_LEAVING_HOME:
        headline, icon, privacy, priority = (
            "Benni geht los", "mdi:home-export-outline", "presence", "presence",
        )
    elif presence_effective in (EFF_AWAY, EFF_LEAVING):
        headline, icon, privacy, priority = (
            "Benni ist unterwegs", "mdi:walk", "presence", "presence",
        )
    elif activity == ACT_PRIVATE:
        # Privacy-safe: keine Details, kein Stash/Studio/Titel.
        headline, icon, privacy, priority = (
            "Private Time aktiv", "mdi:shield-lock", "private", "private",
        )
    elif activity == ACT_GAMING:
        if game_title:
            headline = f"Benni spielt {game_title}"
        elif platform:
            headline = f"Benni spielt {_LIVE_PLATFORM_LABELS.get(platform, platform)}"
        else:
            headline = "Benni spielt gerade"
        icon, privacy, priority = "mdi:gamepad-variant", "normal", "gaming"
    elif activity == ACT_ENTERTAINMENT:
        headline = f"Benni schaut {source_app}" if source_app else "Benni schaut etwas"
        icon, privacy, priority = "mdi:television-play", "normal", "entertainment"
    elif activity == ACT_MUSIC:
        if title and artist:
            headline = f"Benni hört {title} – {artist}"
        elif title:
            headline = f"Benni hört {title}"
        else:
            headline = "Benni hört Musik"
        icon, privacy, priority = "mdi:music", "normal", "music"
    elif activity == ACT_WORK_HOME:
        headline, icon, privacy, priority = (
            "Benni arbeitet zuhause", "mdi:briefcase", "normal", "work",
        )
    elif activity == ACT_WORK_AWAY:
        headline, icon, privacy, priority = (
            "Benni arbeitet außer Haus", "mdi:briefcase-outline", "normal", "work",
        )
    elif activity == ACT_HOUSEHOLD:
        headline, icon, privacy, priority = "Haushalt aktiv", "mdi:broom", "normal", "household"
    elif activity == ACT_PC_ACTIVE or (pc_active and activity == ACT_IDLE):
        headline, icon, privacy, priority = (
            "Benni ist am PC", "mdi:desktop-classic", "normal", "pc",
        )
    elif presence_effective == EFF_HOME or presence_personal == PERS_HOME:
        headline, icon, privacy, priority = "Benni ist zuhause", "mdi:home", "normal", "home"
    else:
        headline, icon, privacy, priority = "Status unbekannt", "mdi:help-circle", "unknown", "unknown"

    is_private = priority == "private"

    # ----- UX-Contract v1: feiner status_kind + abgeleitete Panel-Felder -----
    # kind == priority, außer bei Presence-Overlays (feiner aufgeschlüsselt in
    # exakt der Kaskaden-Reihenfolge parents > coming_home > leaving_home > away).
    if priority == "presence":
        if presence_personal == PERS_PARENTS:
            kind = "parents"
        elif presence_transition == TRANS_COMING_HOME:
            kind = "coming_home"
        elif presence_transition == TRANS_LEAVING_HOME:
            kind = "leaving_home"
        else:
            kind = "away"
    else:
        kind = priority
    color_role = _LIVE_COLOR_ROLE.get(kind, "unknown")
    display_order = _LIVE_DISPLAY_ORDER.get(kind, 999)
    source_entities = list(_LIVE_CORE_SOURCE_ENTITIES)
    feed_source = _live_clean(media_activity_source)
    if feed_source and feed_source not in source_entities:
        source_entities.append(feed_source)

    # ----- subtitle (kurze technische Ergänzung; nie bei private) -----
    if priority in ("music", "gaming", "entertainment"):
        subtitle = " · ".join(
            p for p in (device_label, _live_clean(media_activity_reason)) if p
        ) or None
    elif priority == "presence":
        subtitle = _live_clean(presence_effective)
    elif is_private:
        subtitle = None
    else:
        subtitle = _live_clean(activity_reason)

    state = headline
    if len(state) > _LIVE_STATE_MAXLEN:
        state = state[: _LIVE_STATE_MAXLEN - 1].rstrip() + "…"

    attrs: dict[str, Any] = {
        "headline": headline,
        "subtitle": subtitle,
        "activity_state": activity,
        "activity_reason": activity_reason,
        "presence_personal": presence_personal,
        "presence_effective": presence_effective,
        "presence_reason": presence_reason,
        "presence_assumed": bool(assumed),
        "activity_hold_active": bool(activity_hold_active),
        "bio_state": bio,
        "day_state": day_state,
        "media_activity_context": media_activity_context,
        # Privacy: bei private_time keine Media-Details/Trigger spiegeln.
        "media_activity_reason": None if is_private else media_activity_reason,
        "media_activity_hold_strength": media_activity_hold_strength,
        "media_activity_source": media_activity_source,
        "media_title": None if is_private else title,
        "media_artist": None if is_private else artist,
        "game_title": None if is_private else game_title,
        "source_app": None if is_private else source_app,
        "source_device": None if is_private else device_label,
        "privacy_level": privacy,
        "icon_hint": icon,
        "priority": priority,
        "source": "benni_core_state.live_status",
        # UX-Contract v1 (FLEET-259) — stabile Panel-Attribute (additiv).
        "ux_contract_version": LIVE_UX_CONTRACT_VERSION,
        "status_kind": kind,
        "color_role": color_role,
        "display_order": display_order,
        "source_entities": source_entities,
        "actions_supported": [],
    }
    return LiveStatus(state, attrs)

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

from datetime import datetime, timedelta

from .const import (
    ACT_FREE_TIME,
    ACT_HOUSEHOLD,
    ACT_IDLE,
    ACT_PRIVATE,
    ACT_SLEEP,
    ACT_WAKING,
    ACT_WORK_HOME,
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
    HH_EMPTY,
    HH_OCCUPIED,
    PERS_AWAY,
    PERS_HOME,
    PERS_PARENTS,
    TRANS_COMING_HOME,
    TRANS_LEAVING_HOME,
    TRANS_NONE,
    TRANS_PASSING,
)

# ---------------------------------------------------------------- helpers


def _is_home(value: str | None) -> bool:
    if value is None:
        return False
    return str(value).lower() in ("home", "on", "true", "1", "yes")


def _is_fresh(ts: datetime | None, now: datetime, freshness_s: int) -> bool:
    if ts is None:
        return False
    return (now - ts) <= timedelta(seconds=freshness_s)


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
) -> str:
    """Decide ``zuhause`` / ``bei_eltern`` / ``abwesend``.

    Priority:

    0. Raw SSID matches a configured home WLAN → ``zuhause`` (instant, no
       freshness gate: being joined to the home WLAN is ground truth and
       reports within seconds — far faster than the ~15 min GPS poll).
    1. Benni's WLAN tracker says ``home`` and is fresh → ``zuhause``.
    2. Raw SSID matches a configured parents WLAN → ``bei_eltern`` (instant).
    3. Either parents-WLAN tracker says ``home`` → ``bei_eltern``.
       (No freshness check: parents' router state is the ground truth, and a
       stale "home" reading there is still a strong signal that no automatic
       away-mode should fire.)
    4. Fresh GPS in home zone → ``zuhause``.
    5. Otherwise → ``abwesend``.

    SSID is *positive-only* evidence (see ``_ssid_matches``): an unknown network
    or a brief ``Not Connected`` blip during a 2.4/5 GHz band roam never asserts
    ``abwesend`` — it just drops the SSID hint for that tick and GPS decides.

    Stale primary GPS falls back to secondary GPS, then to last-known WLAN
    state. We never silently degrade to ``abwesend`` on a single stale reading
    if a fresher source contradicts it.
    """
    # 0) Home WLAN by SSID — strongest, instant.
    if _ssid_matches(ssid, home_ssids):
        return PERS_HOME

    # 1) WLAN benni (legacy boolean slot)
    if _is_home(wlan_benni) and _is_fresh(wlan_benni_ts, now, freshness_s):
        return PERS_HOME

    # 2) Parents WLAN by SSID — home equivalent, instant.
    if _ssid_matches(ssid, parents_ssids):
        return PERS_PARENTS

    # 3) Parents WLAN — home equivalent. No freshness gate: a router seen as
    # "home" on the parents network is durable evidence that Benni is there.
    if _is_home(wlan_eltern_1) or _is_home(wlan_eltern_2):
        return PERS_PARENTS

    # 3) GPS with fallback
    fresh_primary = _is_fresh(gps_primary_ts, now, freshness_s)
    fresh_secondary = _is_fresh(gps_secondary_ts, now, freshness_s)

    if fresh_primary and _is_home(gps_primary):
        return PERS_HOME
    if fresh_secondary and _is_home(gps_secondary):
        return PERS_HOME

    # If WLAN benni was home but went stale, and GPS does not contradict,
    # keep zuhause to avoid a false-leaving event from a sleeping phone.
    if _is_home(wlan_benni) and not (fresh_primary or fresh_secondary):
        return PERS_HOME

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
# Frühe Tagphasen, die zeitlich noch in den realen Schlaf hineinragen: hier
# beginnt ``early_morning`` (Sommer) schon gegen 04:00, lange vor der geplanten
# Weckzeit. In diesen Phasen darf ein Aktivitäts-Indikator den **Schlaf** nur
# beenden, wenn der Wake Planner tatsächlich wecken will (``wake_needed``) —
# sonst kippen Kaffee-Standby oder flappende Geräte-Sensoren den Zustand
# fälschlich auf ``awake``. Die Wach-Bestätigung aus ``waking`` bleibt hiervon
# unberührt.
_EARLY_WAKE_PHASES = (DAY_EARLY_MORNING, DAY_LATE_MORNING)


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
      Exception (night protection): in the early phases ``early_morning`` /
      ``late_morning`` an indicator may only break **sleep** when
      ``wake_needed`` is set — these phases start ~04:00 in summer, well before
      the planned wake, so coffee-standby / flapping device sensors must not
      end sleep there. The ``waking`` → ``awake`` confirmation is unaffected.
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
        # Nacht-Schutz: in den frühen Tagphasen (early/late_morning) darf ein
        # Aktivitäts-Indikator den Schlaf nur beenden, wenn der Wake Planner
        # wecken will. Verhindert das Falsch-Awake um ~04:00, sobald
        # ``early_morning`` das Indikator-Fenster öffnet. Fail-safe: im
        # Zweifel bleibt es ``sleep``; der Planner (→ ``waking``) und manuelles
        # ``mark_awake`` wecken weiterhin.
        sleep_break_allowed = activity_wake and (
            wake_needed or day_state not in _EARLY_WAKE_PHASES
        )
        if sleep_break_allowed:
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
) -> str:
    """Pick the single dominant activity bucket.

    Order matters: sleep > waking > private > work > household > free_time > idle.
    TV / gaming / cinema etc. live in ``media_context`` (attribute), not here.
    """
    if bio == BIO_SLEEP:
        return ACT_SLEEP
    if bio == BIO_WAKING:
        return ACT_WAKING

    if bio != BIO_AWAKE:
        return ACT_IDLE

    if private_active:
        return ACT_PRIVATE
    if homeoffice and presence_personal == PERS_HOME and day_context == DC_WERKTAG:
        return ACT_WORK_HOME
    if household_active:
        return ACT_HOUSEHOLD
    if media_context and media_context not in ("idle", "none", "off"):
        return ACT_FREE_TIME

    return ACT_IDLE

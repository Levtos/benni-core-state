"""Versioned Core-State entity and legacy-resolution contract.

This module is deliberately pure Python.  It records the mapping decision for
the owner-local Core-State contract without changing consumers. The Phase-1
provisional-sleep contract from #27, the restart-safe waking lifecycle from
#28, and the owner-local activity decision contract from #29 are implemented
here. The #26 Wake Shadow consumes this declarative mapping but keeps its
comparison diagnostics in wake_planning.py.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Final, Mapping, Sequence

from .const import (
    ACTIVITY_STATES,
    BIO_STATES,
    DAY_CONTEXT_STATES,
    DOMAIN,
    LEGACY_ENTITY_MAP,
    unique_id,
)


MAPPING_CONTRACT_VERSION: Final[str] = "1.5.0"
DEFAULT_CANONICAL_PROFILE: Final[str] = "benni"
_COMPACT_DIAGNOSTIC_KEYS: Final[tuple[str, ...]] = (
    "mapping_key",
    "source",
    "target",
    "owner",
    "status",
    "reason",
    "contract_version",
)

# The nine values are the corrected #24 target contract.  They intentionally do
# not import the pre-#24 runtime list from const.py: PR #30 is merged into main and
# #25 must not reimplement or overwrite that change.
CANONICAL_DAY_STATES: Final[tuple[str, ...]] = (
    "early_night",
    "late_night",
    "early_morning",
    "forenoon",
    "midday",
    "afternoon",
    "late_afternoon",
    "evening",
    "late_evening",
)

STATUS_CANONICAL_CURRENT: Final[str] = "canonical_current"
STATUS_CANONICAL_TARGET: Final[str] = "canonical_target"
STATUS_ATTRIBUTE_ONLY: Final[str] = "attribute_only"
STATUS_PLANNED: Final[str] = "planned"
STATUS_UNDECIDED: Final[str] = "undecided"

LEGACY_CONFIG_COMPATIBILITY: Final[str] = "config_compatibility"
LEGACY_TEMPORARY: Final[str] = "temporary_legacy"
LEGACY_REPLACE_AFTER_CUTOVER: Final[str] = "replace_after_cutover"
LEGACY_REFERENCE_ONLY: Final[str] = "reference_only"
LEGACY_OPEN_GATE: Final[str] = "open_gate"
LEGACY_CANONICAL: Final[str] = "canonical_current"
LEGACY_UNKNOWN: Final[str] = "unknown"


@dataclass(frozen=True)
class EntityMapping:
    """One versioned fact-to-entity mapping decision."""

    mapping_key: str
    contract_fact: str
    canonical_entity_id: str | None
    domain: str | None
    unique_id_template: str | None
    allowed_states: tuple[str, ...]
    attributes: tuple[str, ...]
    owner: str
    current_source: tuple[str, ...]
    legacy_references: tuple[str, ...]
    legacy_resolution: str
    status: str
    reason: str
    planned_cutover: str
    rollback: str
    consumer_issue: str
    entity_id_pattern: str | None = None
    entity_suffix: str | None = None
    target_attributes: tuple[str, ...] = ()
    future_states: tuple[str, ...] = ()


@dataclass(frozen=True)
class LegacyResolution:
    """Explicit result for a legacy reference lookup."""

    source_entity_id: str
    target_entity_id: str | None
    status: str
    mapping_key: str | None
    reason: str


def _entity(domain: str, suffix: str) -> str:
    return f"{domain}.benni_core_state_{suffix}"


def _uid_template(suffix: str) -> str:
    # This is the already-published unique_id convention from const.unique_id.
    return f"{DOMAIN}_<entry_id>_{suffix}"


def _current(
    *,
    mapping_key: str,
    contract_fact: str,
    domain: str,
    allowed_states: Sequence[str] = (),
    attributes: Sequence[str] = (),
    current_source: Sequence[str],
    legacy_references: Sequence[str] = (),
    owner: str = "benni-core-state (L1)",
    reason: str,
    consumer_issue: str,
    target_attributes: Sequence[str] = (),
    planned_cutover: str = "No consumer cutover in #25; keep the published contract stable.",
    rollback: str = "Keep the current Core-State entity and its source bindings; do not remove old references.",
) -> EntityMapping:
    return EntityMapping(
        mapping_key=mapping_key,
        contract_fact=contract_fact,
        canonical_entity_id=_entity(domain, mapping_key),
        domain=domain,
        unique_id_template=_uid_template(mapping_key),
        allowed_states=tuple(allowed_states),
        attributes=tuple(attributes),
        owner=owner,
        current_source=tuple(current_source),
        legacy_references=tuple(legacy_references),
        legacy_resolution=LEGACY_REPLACE_AFTER_CUTOVER if legacy_references else LEGACY_CANONICAL,
        status=STATUS_CANONICAL_CURRENT,
        reason=reason,
        planned_cutover=planned_cutover,
        rollback=rollback,
        consumer_issue=consumer_issue,
        entity_id_pattern=f"{domain}.{{profile}}_core_state_{mapping_key}",
        entity_suffix=mapping_key,
        target_attributes=tuple(target_attributes),
    )


CANONICAL_MAPPINGS: Final[tuple[EntityMapping, ...]] = (
    _current(
        mapping_key="presence_personal",
        contract_fact="persönliche Anwesenheit",
        domain="sensor",
        allowed_states=("zuhause", "bei_eltern", "abwesend"),
        attributes=("ssid", "gps_primary", "gps_secondary", "freshness_s"),
        current_source=("internal:coordinator.compute_presence_personal",),
        legacy_references=("sensor.benni_combined_context_presence_personal", "sensor.benni_context_presence_personal"),
        reason="Core State ist der bestehende L1-Owner; die Entity-ID ist bereits clean und veröffentlicht.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/25",
    ),
    _current(
        mapping_key="presence_household",
        contract_fact="Haushaltsanwesenheit",
        domain="sensor",
        allowed_states=("leer", "nicht_leer"),
        attributes=("presence_personal",),
        current_source=("internal:coordinator.compute_presence_household",),
        legacy_references=("sensor.benni_combined_context_presence_household",),
        reason="Core State besitzt den aggregierten Haushaltskontext; keine zweite Combined-Wahrheit.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/25",
    ),
    _current(
        mapping_key="presence_band",
        contract_fact="Entfernungs-/Anwesenheitsband",
        domain="sensor",
        allowed_states=("home", "preheat", "near", "far"),
        attributes=("distance_m", "home_radius", "preheat_radius", "near_radius", "hysteresis_m"),
        current_source=("internal:coordinator.compute_presence_band",),
        legacy_references=("sensor.benni_combined_context_presence_band",),
        reason="Das Band bleibt eine Core-State-Eingangswahrheit für Presence und Preheat.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/25",
    ),
    _current(
        mapping_key="presence_transition",
        contract_fact="Presence-Transition",
        domain="sensor",
        allowed_states=("none", "coming_home", "leaving_home", "passing_through"),
        attributes=("started", "direction"),
        current_source=("internal:coordinator.compute_transition",),
        legacy_references=("sensor.benni_combined_context_presence_transition",),
        reason="Transition bleibt owner-lokal und wird nicht aus Consumer- oder Media-States abgeleitet.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/25",
    ),
    _current(
        mapping_key="presence_effective",
        contract_fact="effektive Presence",
        domain="sensor",
        allowed_states=("home", "away", "arriving", "leaving", "uncertain", "stale"),
        attributes=("raw_presence", "effective_reason", "assumed", "hold_strength", "source_activity"),
        current_source=("internal:coordinator.compute_effective_presence",),
        legacy_references=("sensor.system_benni_core_state_presence_effective", "sensor.benni_combined_context_presence_effective"),
        reason="Clean Core-State-ID ist kanonisch; der belegte system_-Pfad bleibt nur als alte Door-Consumer-Referenz dokumentiert.",
        consumer_issue="https://github.com/Levtos/control/issues/30",
    ),
    _current(
        mapping_key="presence_effective_transition",
        contract_fact="effektive Presence-Transition",
        domain="sensor",
        allowed_states=("home", "away", "arriving", "leaving", "uncertain", "stale"),
        attributes=("raw_presence", "effective_reason", "assumed", "activity_hold_active"),
        current_source=("internal:coordinator.apply_activity_hold",),
        reason="Es gibt keinen separaten Legacy-Consumer-Contract; der Output bleibt ein Core-State-Projektionssensor.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/25",
    ),
    _current(
        mapping_key="presence_preheat_active",
        contract_fact="Presence-Preheat-Aktivität",
        domain="binary_sensor",
        allowed_states=("on", "off"),
        attributes=("source", "started", "max_duration_s"),
        current_source=("internal:coordinator.compute_preheat",),
        legacy_references=("sensor.benni_combined_context_presence_preheat_active",),
        reason="Bestehender Binary-Sensor; keine neue Combined-Entity und keine Aktorentscheidung in Core State.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/25",
    ),
    _current(
        mapping_key="presence_away",
        contract_fact="kanonisches Away-Gate",
        domain="binary_sensor",
        allowed_states=("on", "off"),
        attributes=("raw_presence", "activity_hold_active", "effective_reason"),
        current_source=("internal:logic.away_gate_active",),
        legacy_references=("binary_sensor.benni_core_state_away",),
        reason="Der bestehende Output lautet presence_away; der historische Kurzslug ist kein stiller Alias.",
        consumer_issue="https://github.com/Levtos/control/issues/30",
    ),
    _current(
        mapping_key="bio_state",
        contract_fact="Bio-State",
        domain="sensor",
        allowed_states=tuple(BIO_STATES),
        attributes=(
            "last_sleep_start",
            "last_provisional_sleep_start",
            "last_awake_start",
            "last_waking_start",
            "sleep_window",
            "wake_interaction",
            "indicator_*",
        ),
        current_source=(
            "internal:coordinator.compute_bio_state",
            "internal:core_state.sleep_window",
        ),
        legacy_references=("sensor.benni_context_bio_state", "sensor.benni_combined_context_bio_state"),
        reason="Bio-State ist die einzige Core-State-Wahrheit für sleep/provisional_sleep/waking/awake; E/L/M/A kommt aus dem internen Sleep-Window-Vertrag.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/25",
    ),
    EntityMapping(
        mapping_key="provisional_sleep",
        contract_fact="provisional_sleep als Schutzkorridor",
        canonical_entity_id=_entity("sensor", "bio_state"),
        domain="sensor",
        unique_id_template=_uid_template("bio_state"),
        allowed_states=tuple(BIO_STATES),
        attributes=(
            "last_provisional_sleep_start",
            "sleep_window",
            "reason",
            "source",
        ),
        owner="benni-core-state (L1)",
        current_source=(
            "internal:core_state.sleep_window",
            "internal:coordinator.compute_bio_state",
        ),
        legacy_references=(),
        legacy_resolution=LEGACY_CANONICAL,
        status=STATUS_CANONICAL_CURRENT,
        reason="#27 veröffentlicht den Schutzkorridor als Wert des bestehenden Bio-State-Vertrags; er zählt nicht als bestätigter Schlaf.",
        planned_cutover="Consumer-Rebind bleibt ein separates Shadow-/Cutover-Gate; keine neue Entity wird erzeugt.",
        rollback="Bio-Consumer bleiben bis zu ihrem eigenen Cutover auf den bisherigen Quellen; keine Legacy-Entity wird entfernt.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/27",
        entity_id_pattern="sensor.{profile}_core_state_bio_state",
        entity_suffix="bio_state",
        target_attributes=("bio_state", "sleep_window"),
    ),
    EntityMapping(
        mapping_key="waking",
        contract_fact="waking als Bio-State-Wert",
        canonical_entity_id=_entity("sensor", "bio_state"),
        domain="sensor",
        unique_id_template=_uid_template("bio_state"),
        allowed_states=tuple(BIO_STATES),
        attributes=(
            "last_waking_start",
            "waking_timeout_minutes",
            "waking_timeout_at",
            "reason",
            "wake_interaction",
        ),
        owner="benni-core-state (L1)",
        current_source=("internal:coordinator.compute_bio_state",),
        legacy_references=(),
        legacy_resolution=LEGACY_CANONICAL,
        status=STATUS_ATTRIBUTE_ONLY,
        reason="#28 vervollständigt waking im bestehenden Bio-State: erstes reguläres Wachsignal oder 30-Minuten-Timeout beendet den Zustand.",
        planned_cutover="Kein eigener Rebind; spätere Consumer-Gates verwenden sensor.*_core_state_bio_state.",
        rollback="Aktuellen Bio-State weiterliefern; kein separater waking-Sensor wird registriert.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/28",
        entity_id_pattern="sensor.{profile}_core_state_bio_state",
        entity_suffix="bio_state",
        target_attributes=("bio_state", "wake_interaction"),
    ),
    EntityMapping(
        mapping_key="day_state",
        contract_fact="datumsermittelter Tagesphasen-State",
        canonical_entity_id=_entity("sensor", "day_state"),
        domain="sensor",
        unique_id_template=_uid_template("day_state"),
        allowed_states=CANONICAL_DAY_STATES,
        attributes=("phase_starts", "source"),
        owner="benni-core-state (L1)",
        current_source=("runtime:const.DAY_STATES", "runtime:logic.compute_day_state"),
        legacy_references=("sensor.benni_combined_context_day_state", "sensor.benni_core_day_state", "sensor.lights_dayphase"),
        legacy_resolution=LEGACY_REPLACE_AFTER_CUTOVER,
        status=STATUS_CANONICAL_CURRENT,
        reason="Die kanonischen Werte sind exakt die neun korrigierten #24-Phasen; PR #30 ist in main enthalten und #25 ändert den Runtime-Pfad nicht.",
        planned_cutover="Consumer-Allowlist und jeweilige Live-Gates bleiben offen; alte Phase-Labels werden nicht als Zielalias geführt.",
        rollback="Aktuellen neunphasigen Runtime-Contract behalten; Legacy-Consumer bleiben bis zum jeweiligen Gate unverändert.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/24 und https://github.com/Levtos/benni-core-state/issues/25",
        entity_id_pattern="sensor.{profile}_core_state_day_state",
        entity_suffix="day_state",
        target_attributes=("phase_starts", "source"),
    ),
    _current(
        mapping_key="day_context",
        contract_fact="kalendarischer Tageskontext",
        domain="sensor",
        allowed_states=tuple(DAY_CONTEXT_STATES),
        attributes=("holiday",),
        current_source=("internal:coordinator.compute_day_context", "configured:holiday_sensor"),
        legacy_references=("sensor.benni_combined_context_day_context", "binary_sensor.workday", "binary_sensor.workday_today_combined", "binary_sensor.system_workday"),
        reason="Day Context bleibt ein Kontext-Output; die Wake-Profilwahl wird nicht stillschweigend mit day_context gleichgesetzt.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/25",
    ),
    _current(
        mapping_key="activity_state",
        contract_fact="aggregierter Activity-State",
        domain="sensor",
        allowed_states=tuple(ACTIVITY_STATES),
        attributes=(
            "activity_reason",
            "activity_decision",
            "media_activity_context",
            "media_activity_source",
            "media_activity_feed_quality",
            "pc_active",
        ),
        current_source=(
            "internal:logic.compute_activity_decision",
            "sensor.system_benni_media_state_activity_context",
        ),
        legacy_references=("sensor.benni_combined_context_activity_state",),
        reason="Core State ist der L1-Owner der kanonischen Entscheidung; Media State liefert ausschließlich einen qualitätsgeprüften neutralen Feed. Die Entscheidung enthält Gewinner, Kandidaten, Quellen, Freshness, Qualität, Fallback und Zeitpunkt.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/29",
        target_attributes=(
            "activity_decision",
            "activity_decision.contract_version",
            "activity_decision.winner",
            "activity_decision.valid_candidates",
            "activity_decision.suppressed_candidates",
            "activity_decision.precedence_reason",
            "activity_decision.input_sources",
            "activity_decision.freshness",
            "activity_decision.quality_status",
            "activity_decision.degraded_reason",
            "activity_decision.fallback_reason",
            "activity_decision.decision_timestamp",
        ),
    ),
    _current(
        mapping_key="master_context",
        contract_fact="lesbarer Master-Kontext",
        domain="sensor",
        attributes=("presence", "bio", "day_state", "day_context", "activity"),
        current_source=("internal:coordinator.master_context",),
        legacy_references=("sensor.benni_combined_context_master",),
        reason="Anzeige-/Kontextprojektion des L1-Owners; keine neue Wahrheit und keine Policy-Entscheidung.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/25",
    ),
    EntityMapping(
        mapping_key="wake_state",
        contract_fact="Wake-Entscheidung / Wake-Plan-State",
        canonical_entity_id=_entity("sensor", "wake_state"),
        domain="sensor",
        unique_id_template=_uid_template("wake_state"),
        allowed_states=("scheduled", "skipped", "overridden", "holiday", "inactive"),
        attributes=("wake_time", "decided_by", "reason", "holiday_name", "skip_active", "override_time", "next_wake", "wake_window", "matched_rule_id", "calendar_conflict"),
        owner="benni-core-state (L1; #26)",
        current_source=("sensor.wake_planner_benni_wake_state",),
        legacy_references=("sensor.wake_planner_benni_wake_state",),
        legacy_resolution=LEGACY_TEMPORARY,
        status=STATUS_PLANNED,
        reason="#34 belegt die fünf Old-WakeState-Werte und Attribute; #25 legt den clean Zielpfad fest, #26 implementiert erst danach.",
        planned_cutover="Nach #26-Shadow, control#27/#28, Consumer-Allowlist und Bennis Live-Gate; kein Rebind in #25.",
        rollback="Old Planner, Config, Store, Entity und Services bleiben unverändert aktivierbar.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/26",
        entity_id_pattern="sensor.{profile}_core_state_wake_state",
        entity_suffix="wake_state",
        target_attributes=("wake_time", "reason", "decided_by"),
    ),
    EntityMapping(
        mapping_key="next_wake",
        contract_fact="nächster Wake-Planzeitpunkt",
        canonical_entity_id=_entity("sensor", "next_wake"),
        domain="sensor",
        unique_id_template=_uid_template("next_wake"),
        allowed_states=("timezone-aware datetime", "None"),
        attributes=("wake_state", "reason", "decided_by", "wake_window", "matched_rule_id"),
        owner="benni-core-state (L1; #26)",
        current_source=("sensor.wake_planner_benni_next_wake",),
        legacy_references=("sensor.wake_planner_benni_next_wake",),
        legacy_resolution=LEGACY_TEMPORARY,
        status=STATUS_PLANNED,
        reason="#34 belegt den 30-Tage-Next-Wake-Output; Timestamp-/Timezone-Parität gehört in den späteren Shadow.",
        planned_cutover="Nach #26-Parität und den control-/Consumer-Gates; kein neuer Sensor in #25.",
        rollback="Old Next-Wake-Entity und 30-Tage-Suche bleiben bis Live Verified die Rückfallebene.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/26",
        entity_id_pattern="sensor.{profile}_core_state_next_wake",
        entity_suffix="next_wake",
        target_attributes=("wake_state", "reason", "wake_window"),
    ),
    EntityMapping(
        mapping_key="wake_needed",
        contract_fact="Wake-Fenster-Boolean",
        canonical_entity_id=_entity("binary_sensor", "wake_needed"),
        domain="binary_sensor",
        unique_id_template=_uid_template("wake_needed"),
        allowed_states=("on", "off"),
        attributes=("wake_window_start", "wake_window_end", "wake_time", "wake_state", "reason"),
        owner="benni-core-state (L1; #26)",
        current_source=("binary_sensor.wake_planner_benni_wake_needed",),
        legacy_references=("binary_sensor.wake_planner_benni_wake_needed",),
        legacy_resolution=LEGACY_TEMPORARY,
        status=STATUS_PLANNED,
        reason="#34 definiert wake_needed als inklusives Zeitfenster-Boolean; es ist weder Bio-State noch waking.",
        planned_cutover="Nach #26-Fensterparität, Media-/Light-Consumer-Gates und Bennis Cutover-Gate; kein Rebind in #25.",
        rollback="Old Binary Sensor bleibt unverändert die aktuelle Quelle; keine neue Binary Entity wird registriert.",
        consumer_issue="https://github.com/Levtos/benni_media_policy/issues/28",
        entity_id_pattern="binary_sensor.{profile}_core_state_wake_needed",
        entity_suffix="wake_needed",
        target_attributes=("wake_window_start", "wake_window_end", "reason"),
    ),
    EntityMapping(
        mapping_key="holiday",
        contract_fact="Feiertags-/Abwesenheitsfakt als Wake-Input",
        canonical_entity_id=_entity("binary_sensor", "holiday_active"),
        domain="binary_sensor",
        unique_id_template=_uid_template("holiday_active"),
        allowed_states=("on", "off"),
        attributes=("holiday_name", "holiday_source", "source_quality", "reason"),
        owner="benni-core-state (L1; #26)",
        current_source=("configured:holiday_sensor", "wake_planner:holiday_source.py"),
        legacy_references=("binary_sensor.wake_planner_benni_holiday_active",),
        legacy_resolution=LEGACY_TEMPORARY,
        status=STATUS_PLANNED,
        reason="Feiertag ist ein geplanter Wake-Planning-Context; #25 veröffentlicht keine neue Holiday-Entity und #26 entscheidet die Berechnung.",
        planned_cutover="Nach Holiday-Source-/Quality-Contract und #26-Shadow; bis dahin Old Holiday-Quelle unverändert lassen.",
        rollback="Old Holiday-Map und `holiday_active` bleiben als Rückfallebene erhalten.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/26",
        entity_id_pattern="binary_sensor.{profile}_core_state_holiday_active",
        entity_suffix="holiday_active",
        target_attributes=("holiday_name", "holiday_source", "reason"),
    ),
    EntityMapping(
        mapping_key="holiday_active",
        contract_fact="Holiday-Active-Output",
        canonical_entity_id=_entity("binary_sensor", "holiday_active"),
        domain="binary_sensor",
        unique_id_template=_uid_template("holiday_active"),
        allowed_states=("on", "off"),
        attributes=("holiday_name", "matched_rule_id", "reason"),
        owner="benni-core-state (L1; #26)",
        current_source=("binary_sensor.wake_planner_benni_holiday_active",),
        legacy_references=("binary_sensor.wake_planner_benni_holiday_active",),
        legacy_resolution=LEGACY_TEMPORARY,
        status=STATUS_PLANNED,
        reason="Der Old-Output wird mit seiner tatsächlichen Semantik dokumentiert; die Ziel-Entity wird erst nach #26 implementiert.",
        planned_cutover="Nach #26-Shadow, Holiday-/Quality-Parität und control#27/#28; keine Implementierung in #25.",
        rollback="Old Holiday-Active unverändert weiterführen; keine vorzeitige Entfernung.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/26",
        entity_id_pattern="binary_sensor.{profile}_core_state_holiday_active",
        entity_suffix="holiday_active",
        target_attributes=("holiday_name", "matched_rule_id", "reason"),
    ),
    EntityMapping(
        mapping_key="vacation",
        contract_fact="Urlaub / manuelles Abwesenheitsdatum",
        canonical_entity_id=None,
        domain=None,
        unique_id_template=None,
        allowed_states=("not_separately_published",),
        attributes=("source", "date_range", "reason"),
        owner="offen zwischen Core State #25/#26 und Holiday-Source",
        current_source=("wake_planner:holiday_calendar", "wake_planner:manual_holiday_dates"),
        legacy_references=("manual_holiday_dates", "holiday_calendar_entity"),
        legacy_resolution=LEGACY_OPEN_GATE,
        status=STATUS_UNDECIDED,
        reason="#34 belegt keine eigene Vacation-Entity oder Prioritätssemantik; keine neue Vacation-ID wird geraten.",
        planned_cutover="Erst nach fachlicher Source-/Contract-Entscheidung in #26; kein Consumer-Cutover in #25.",
        rollback="Holiday-Kalender und manuelle Old-Datumsbereiche unverändert beibehalten.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/26",
    ),
    EntityMapping(
        mapping_key="automatic_day_profile",
        contract_fact="wirksames automatisches Tagesprofil",
        canonical_entity_id=_entity("sensor", "wake_state"),
        domain="sensor",
        unique_id_template=_uid_template("wake_state"),
        allowed_states=("weekday", "weekend"),
        attributes=("automatic_day_profile", "reason", "holiday", "vacation"),
        owner="benni-core-state (L1; #26)",
        current_source=("wake_planner:profile_weekday", "wake_planner:profile_weekend", "wake_planner:profile_holiday"),
        legacy_references=("wake_planner profile rules",),
        legacy_resolution=LEGACY_TEMPORARY,
        status=STATUS_ATTRIBUTE_ONLY,
        reason="Nur `weekday` und `weekend`; Feiertag/Urlaub am Werktag projiziert auf weekend. Kein separates Profil und kein eigener Sensor in #25.",
        planned_cutover="Als Attribut des Wake-Plan-Outputs erst nach #26-Parität; manuelle Profile bleiben Old-only.",
        rollback="Old rule/profile selection bleibt vollständig aktiv; keine automatische Rebind-Aktion.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/26",
        entity_id_pattern="sensor.{profile}_core_state_wake_state",
        entity_suffix="wake_state",
        target_attributes=("automatic_day_profile", "reason"),
    ),
    _current(
        mapping_key="live_status",
        contract_fact="owner-lokaler Diagnose-/Status-Output",
        domain="sensor",
        allowed_states=("diagnostic text",),
        attributes=("source", "status", "reason", "mapping_contract_version", "mapping_diagnostics", "source_entities"),
        current_source=("internal:logic.compute_live_status",),
        reason="Live Status bleibt read-only UX-/Diagnose-Output; Mapping-Diagnose wird additiv owner-lokal sichtbar.",
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/25",
        target_attributes=("source", "status", "reason", "mapping_contract_version", "mapping_diagnostics"),
    ),
    _current(
        mapping_key="apply_ready",
        contract_fact="prozessweiter HA-Startup-/Apply-Readiness-Zustand",
        domain="binary_sensor",
        allowed_states=("on", "off"),
        attributes=(
            "ready_at",
            "startup_started_at",
            "startup_delay",
            "startup_phase",
            "startup_elapsed_s",
            "reason",
            "transition_count",
            "mapping_contract_version",
            "startup_readiness_contract_version",
            "mapping_key",
            "owner",
            "source",
            "status",
            "mapping_reason",
            "legacy_resolution",
        ),
        current_source=(
            "runtime:startup_readiness.StartupReadinessRuntime",
            "ha_lifecycle:EVENT_HOMEASSISTANT_STARTED",
        ),
        legacy_references=(
            "binary_sensor.system_benni_core_state_apply_ready",
            "binary_sensor.system_apply_ready",
            "binary_sensor.system_benni_context_ready",
            "input_boolean.system_startup_stable",
        ),
        reason=(
            "Core State owns only process lifetime readiness; source health, "
            "apply_enabled, Lux, Manual-Off and policy decisions stay separate."
        ),
        planned_cutover=(
            "Rebind Light Policy and proven private-config consumers first; "
            "remove YAML truth sources only after the consumer allowlist and "
            "rollback path are documented in Issue #33."
        ),
        rollback=(
            "Keep the old YAML entities and consumer references until the "
            "technical cutover is verified; do not create an alias or write "
            "the legacy helper from Core State."
        ),
        consumer_issue="https://github.com/Levtos/benni-core-state/issues/33",
        target_attributes=(
            "ready_at",
            "startup_delay",
            "startup_phase",
            "reason",
            "mapping_contract_version",
            "owner",
            "source",
            "status",
        ),
    ),
)


MAPPING_BY_KEY: Final[dict[str, EntityMapping]] = {
    mapping.mapping_key: mapping for mapping in CANONICAL_MAPPINGS
}


# Only references evidenced by the current Core-State/consumer inventories are
# listed here.  A missing entry is intentionally not guessed or silently mapped.
LEGACY_RESOLUTIONS: Final[tuple[LegacyResolution, ...]] = (
    LegacyResolution(
        "sensor.benni_device_living_pc",
        LEGACY_ENTITY_MAP["sensor.benni_device_living_pc"],
        LEGACY_CONFIG_COMPATIBILITY,
        "pc_source_rebind",
        "Temporary Core-State config compatibility; the old input remains documented and is not a consumer alias.",
    ),
    LegacyResolution(
        "binary_sensor.system_benni_core_state_apply_ready",
        _entity("binary_sensor", "apply_ready"),
        LEGACY_REPLACE_AFTER_CUTOVER,
        "apply_ready",
        "Live HA registry evidence showed the Core-State unique_id under this "
        "system_-prefixed path; Core State migrates only this exact registry entry "
        "to the clean target and creates no YAML alias.",
    ),
    LegacyResolution(
        "binary_sensor.system_apply_ready",
        _entity("binary_sensor", "apply_ready"),
        LEGACY_REPLACE_AFTER_CUTOVER,
        "apply_ready",
        "Old YAML template; replace only after the proven consumer cutover in Issue #33.",
    ),
    LegacyResolution(
        "binary_sensor.system_benni_context_ready",
        _entity("binary_sensor", "apply_ready"),
        LEGACY_REPLACE_AFTER_CUTOVER,
        "apply_ready",
        "Old Light-Policy system_ready_entity value; this is a scoped consumer migration, not a semantic alias for the context contract.",
    ),
    LegacyResolution(
        "input_boolean.system_startup_stable",
        _entity("binary_sensor", "apply_ready"),
        LEGACY_REPLACE_AFTER_CUTOVER,
        "apply_ready",
        "Old YAML startup helper; consumers must cut over before its writer is removed.",
    ),
    LegacyResolution(
        "sensor.system_benni_core_state_presence_effective",
        _entity("sensor", "presence_effective"),
        LEGACY_REPLACE_AFTER_CUTOVER,
        "presence_effective",
        "Old system_-slug in Door Policy; use the clean target only after the consumer cutover gate.",
    ),
    LegacyResolution(
        "sensor.system_benni_media_state_activity_context",
        None,
        LEGACY_TEMPORARY,
        "activity_state",
        "Current Media-State feed reference; Core State must not rename or own Media truth in #25.",
    ),
    LegacyResolution(
        "sensor.benni_combined_context_presence_personal",
        _entity("sensor", "presence_personal"),
        LEGACY_REPLACE_AFTER_CUTOVER,
        "presence_personal",
        "Legacy Core-Devices mirror; replace consumers only after the allowlist gate.",
    ),
    LegacyResolution(
        "sensor.benni_combined_context_presence_household",
        _entity("sensor", "presence_household"),
        LEGACY_REPLACE_AFTER_CUTOVER,
        "presence_household",
        "Legacy Core-Devices mirror; no new Combined entity is created.",
    ),
    LegacyResolution(
        "sensor.benni_combined_context_presence_band",
        _entity("sensor", "presence_band"),
        LEGACY_REPLACE_AFTER_CUTOVER,
        "presence_band",
        "Legacy Core-Devices mirror; no new Combined entity is created.",
    ),
    LegacyResolution(
        "sensor.benni_combined_context_presence_transition",
        _entity("sensor", "presence_transition"),
        LEGACY_REPLACE_AFTER_CUTOVER,
        "presence_transition",
        "Legacy Core-Devices mirror; no new Combined entity is created.",
    ),
    LegacyResolution(
        "sensor.benni_combined_context_bio_state",
        _entity("sensor", "bio_state"),
        LEGACY_REPLACE_AFTER_CUTOVER,
        "bio_state",
        "Legacy Core-Devices mirror; the clean Core-State Bio sensor is the target.",
    ),
    LegacyResolution(
        "sensor.benni_combined_context_day_state",
        _entity("sensor", "day_state"),
        LEGACY_REPLACE_AFTER_CUTOVER,
        "day_state",
        "Legacy Core-Devices mirror; target values are the nine corrected #24 phases.",
    ),
    LegacyResolution(
        "sensor.benni_combined_context_day_context",
        _entity("sensor", "day_context"),
        LEGACY_REPLACE_AFTER_CUTOVER,
        "day_context",
        "Legacy Core-Devices mirror; day_context is not a hidden alias for automatic Wake profile.",
    ),
    LegacyResolution(
        "sensor.benni_combined_context_activity_state",
        _entity("sensor", "activity_state"),
        LEGACY_REPLACE_AFTER_CUTOVER,
        "activity_state",
        "Legacy Core-Devices mirror; Core State remains the sole derived Activity owner.",
    ),
    LegacyResolution(
        "sensor.wake_planner_benni_wake_state",
        _entity("sensor", "wake_state"),
        LEGACY_TEMPORARY,
        "wake_state",
        "Old Planner output remains active until #26 shadow and the later cutover gate.",
    ),
    LegacyResolution(
        "sensor.wake_planner_benni_next_wake",
        _entity("sensor", "next_wake"),
        LEGACY_TEMPORARY,
        "next_wake",
        "Old Planner output remains active until #26 timestamp/parity verification.",
    ),
    LegacyResolution(
        "binary_sensor.wake_planner_benni_wake_needed",
        _entity("binary_sensor", "wake_needed"),
        LEGACY_TEMPORARY,
        "wake_needed",
        "Old Planner time-window Boolean is not a Bio-/waking signal.",
    ),
    LegacyResolution(
        "binary_sensor.wake_planner_benni_holiday_active",
        _entity("binary_sensor", "holiday_active"),
        LEGACY_TEMPORARY,
        "holiday_active",
        "Old Holiday output remains available until source/quality and #26 gates are complete.",
    ),
    LegacyResolution(
        "sensor.benni_context_presence_personal",
        _entity("sensor", "presence_personal"),
        LEGACY_REFERENCE_ONLY,
        "presence_personal",
        "Toolbox shadow reference; no config rebind is performed by #25.",
    ),
    LegacyResolution(
        "sensor.benni_context_bio_state",
        _entity("sensor", "bio_state"),
        LEGACY_REFERENCE_ONLY,
        "bio_state",
        "Toolbox shadow reference; no config rebind is performed by #25.",
    ),
    LegacyResolution(
        "sensor.benni_core_day_state",
        _entity("sensor", "day_state"),
        LEGACY_REFERENCE_ONLY,
        "day_state",
        "Historical clean slug; it is not a hidden alias for the corrected phase contract.",
    ),
    LegacyResolution(
        "sensor.lights_dayphase",
        _entity("sensor", "day_state"),
        LEGACY_REPLACE_AFTER_CUTOVER,
        "day_state",
        "Legacy Light/Day-State reference; old consumers remain until their own issue gate.",
    ),
    LegacyResolution(
        "binary_sensor.workday",
        _entity("sensor", "day_context"),
        LEGACY_REPLACE_AFTER_CUTOVER,
        "day_context",
        "Legacy workday Boolean; consumers must use the enum contract, not a silent alias.",
    ),
    LegacyResolution(
        "binary_sensor.workday_today_combined",
        _entity("sensor", "day_context"),
        LEGACY_REPLACE_AFTER_CUTOVER,
        "day_context",
        "Legacy workday wrapper; no new Combined replacement is created.",
    ),
    LegacyResolution(
        "binary_sensor.system_workday",
        _entity("sensor", "day_context"),
        LEGACY_REPLACE_AFTER_CUTOVER,
        "day_context",
        "Legacy system_ workday wrapper; replace only after the consumer gate.",
    ),
)

_LEGACY_BY_ENTITY: Final[dict[str, LegacyResolution]] = {
    resolution.source_entity_id: resolution for resolution in LEGACY_RESOLUTIONS
}


def mapping_for(mapping_key: str) -> EntityMapping | None:
    """Return an explicit mapping, or ``None`` for an undecided/unknown key."""

    return MAPPING_BY_KEY.get(mapping_key)


def resolve_mapping(mapping_key: str) -> Mapping[str, object]:
    """Return a diagnostic-safe mapping lookup result.

    Unknown keys are not assigned a target, alias, or fallback.  This is used by
    tests and future diagnostics to make undecided mappings visible.
    """

    mapping = mapping_for(mapping_key)
    if mapping is None:
        return {
            "mapping_key": mapping_key,
            "target": None,
            "status": STATUS_UNDECIDED,
            "reason": "No versioned mapping exists; no silent alias or inferred target is allowed.",
        }
    return {
        "mapping_key": mapping.mapping_key,
        "target": mapping.canonical_entity_id,
        "status": mapping.status,
        "reason": mapping.reason,
    }


def resolve_legacy_entity(entity_id: str) -> LegacyResolution:
    """Resolve one old entity explicitly without mutating a registry."""

    known = _LEGACY_BY_ENTITY.get(entity_id)
    if known is not None:
        return known
    for mapping in CANONICAL_MAPPINGS:
        if mapping.canonical_entity_id == entity_id:
            return LegacyResolution(
                entity_id,
                entity_id,
                LEGACY_CANONICAL,
                mapping.mapping_key,
                "Already the canonical clean entity; no alias or rebind is needed.",
            )
    return LegacyResolution(
        entity_id,
        None,
        LEGACY_UNKNOWN,
        None,
        "Entity is not in the versioned legacy inventory; no target is inferred.",
    )


def render_entity_id(mapping_key: str, profile: str = DEFAULT_CANONICAL_PROFILE) -> str | None:
    """Render the clean profile route while keeping ``system_`` impossible."""

    mapping = mapping_for(mapping_key)
    if mapping is None or mapping.canonical_entity_id is None or mapping.domain is None:
        return None
    _, slug = mapping.canonical_entity_id.split(".", 1)
    prefix = "benni_core_state_"
    if not slug.startswith(prefix):
        return mapping.canonical_entity_id
    return f"{mapping.domain}.{profile}_core_state_{slug[len(prefix):]}"


def render_unique_id(mapping_key: str, entry_id: str) -> str | None:
    """Render the stable unique_id convention for a mapped public entity."""

    mapping = mapping_for(mapping_key)
    if mapping is None or mapping.entity_suffix is None:
        return None
    return unique_id(entry_id, mapping.entity_suffix)


def mapping_diagnostics(
    *,
    profile: str = DEFAULT_CANONICAL_PROFILE,
    entry_id: str | None = None,
    source_overrides: Mapping[str, str | Sequence[str] | None] | None = None,
    compact: bool = False,
) -> list[dict[str, object]]:
    """Return owner-local mapping diagnostics.

    ``compact`` keeps the source/target/owner/status/reason contract while
    omitting verbose migration prose.  The compact projection is used on the
    frequently recorded live-status entity; the complete rows remain the pure
    mapping API for tests and deeper diagnostics.
    """

    overrides = source_overrides or {}
    rows: list[dict[str, object]] = []
    for mapping in CANONICAL_MAPPINGS:
        source: object = mapping.current_source
        if mapping.mapping_key in overrides:
            override = overrides[mapping.mapping_key]
            if override is not None:
                source = override
        if isinstance(source, tuple) and len(source) == 1:
            source = source[0]
        row = {
            "mapping_key": mapping.mapping_key,
            "contract_fact": mapping.contract_fact,
            "source": source,
            "target": render_entity_id(mapping.mapping_key, profile),
            "unique_id": render_unique_id(mapping.mapping_key, entry_id) if entry_id else mapping.unique_id_template,
            "owner": mapping.owner,
            "status": mapping.status,
            "reason": mapping.reason,
            "contract_version": MAPPING_CONTRACT_VERSION,
            "legacy_resolution": mapping.legacy_resolution,
            "planned_cutover": mapping.planned_cutover,
            "rollback": mapping.rollback,
        }
        if compact:
            rows.append({key: row[key] for key in _COMPACT_DIAGNOSTIC_KEYS})
        else:
            rows.append(row)
    return rows

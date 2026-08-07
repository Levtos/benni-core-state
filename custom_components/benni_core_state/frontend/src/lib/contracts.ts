export const UX_SNAPSHOT_CONTRACT = "benni_core_state.snapshot" as const;
export const UX_PROJECTION_CONTRACT = "benni_core_state.projection" as const;
export const UX_COMMAND_ACK_CONTRACT = "benni_core_state.command_ack" as const;

export type DataStatus =
  | "loading"
  | "ready"
  | "empty"
  | "stale"
  | "degraded"
  | "unavailable"
  | "reconnecting"
  | "offline"
  | "error"
  | "blocked";

export type BioState = "awake" | "provisional_sleep" | "sleep" | "waking";

export interface ProfileConfig {
  id: "weekday" | "weekend";
  label: string;
  wake_time: string;
  wake_window_minutes: number;
  minimum_sleep_minutes: number | null;
  provisional_lead_minutes: number | null;
}

export interface AutomaticRule {
  id: string;
  name: string;
  priority: number;
  enabled: boolean;
  weekdays?: number[] | null;
  date_from?: string | null;
  date_to?: string | null;
  week_interval?: number | null;
  week_anchor?: string | null;
  specific_dates?: string[] | null;
  cycle_anchor?: string | null;
  cycle_length?: number | null;
  cycle_slot_start?: number | null;
  cycle_slot_length?: number | null;
  on_holiday?: boolean | null;
  action: "wake" | "skip";
  wake_time?: string | null;
}

export interface MigrationInfo {
  status?: string;
  source?: string;
  source_version?: string;
  migrated_at?: string;
  rolled_back_at?: string;
  rollback_available?: boolean;
}

export interface WakeConfig {
  version: number;
  contract_version: string;
  profiles: Record<"weekday" | "weekend", ProfileConfig>;
  rules: AutomaticRule[];
  effective_rules?: AutomaticRule[];
  calendar_entity: string | null;
  holiday_calendar_entity: string | null;
  manual_holiday_intervals: string[];
  calendar_skip_titles: string[];
  calendar_wake_pattern: string;
  routine_duration_minutes: number;
  calendar_conflict_behavior: "ignore" | "warn_only" | "wake_earlier";
  holiday_behavior: "skip" | "weekend_profile";
  wake_floor: string;
  migration: MigrationInfo;
}

export interface TimelinePhase {
  id: string;
  label: string;
  start: string;
  end: string;
  duration_seconds: number;
  width_pct: number;
  active: boolean;
  progress_pct: number;
}

export interface Timeline {
  version: string;
  date: string;
  phases: TimelinePhase[];
  now_marker_pct: number;
  active_phase: string;
  active_phase_progress_pct: number;
  next_change: string;
  source: string;
}

export interface TodayData {
  central_status: { value: string; code: BioState; reason: string };
  bio: {
    state: BioState;
    label: string;
    provisional: boolean;
    counts_as_confirmed_sleep: boolean;
    last_sleep_start: string | null;
    last_awake_start: string | null;
    diagnostics: Record<string, unknown>;
  };
  wake: {
    next_effective_start: string | null;
    wake_state: string;
    reason: string | null;
    decided_by: string | null;
    profile: "weekday" | "weekend";
    e: string | null;
    l: string | null;
    m_minutes: number | null;
    a_minutes: number | null;
    minimum_unmet: boolean | null;
    hard_l_applied: boolean | null;
    diagnostics: Record<string, unknown>;
  };
  profile: { id: "weekday" | "weekend"; label: string; rule_winner: string | null };
  day_context: { value: string; wake_profile: string; holiday: boolean };
  presence: { personal: string; effective: string };
  activity: { state: string; decision: Record<string, unknown> };
  reason: string;
  data_status: DataStatus;
}

export interface Snapshot {
  contract: typeof UX_SNAPSHOT_CONTRACT;
  version: string;
  integration_version: string;
  status: DataStatus;
  updated_at: string | null;
  data: {
    today: TodayData;
    timeline: Timeline;
    diagnostics: Record<string, unknown>;
  } | null;
  config: WakeConfig;
  capabilities: {
    legacy_comparison?: boolean;
    mark_sleep?: boolean;
    mark_awake?: boolean;
    edit_profiles?: boolean;
    edit_rules?: boolean;
    edit_settings?: boolean;
  };
  permissions: { read: boolean; command: boolean };
}

export interface ProjectionDay {
  date: string;
  day_context: string;
  day_state: string;
  profile: { id: string | null; label: string };
  holiday: boolean;
  vacation: boolean;
  wake: {
    state: string;
    wake_time: string | null;
    next_wake: string | null;
    window_start: string | null;
    window_end: string | null;
    matched_rule: string | null;
    decided_by: string;
    reason: string;
    floor_applied: boolean;
    calendar_conflict: boolean;
  };
  status: DataStatus;
  source: string;
}

export interface Projection {
  contract: typeof UX_PROJECTION_CONTRACT;
  version: string;
  status: DataStatus;
  horizon_days: number;
  days: ProjectionDay[];
}

export interface CommandAck {
  contract: typeof UX_COMMAND_ACK_CONTRACT;
  version: string;
  request_id: string;
  command: string;
  status: "success" | "error" | "pending";
  error: string | null;
}

export const STATUS_LABELS: Record<DataStatus, string> = {
  loading: "Lädt",
  ready: "Aktuell",
  empty: "Leer",
  stale: "Veraltet",
  degraded: "Eingeschränkt",
  unavailable: "Nicht verfügbar",
  reconnecting: "Verbindet neu",
  offline: "Offline",
  error: "Fehler",
  blocked: "Blockiert",
};

const UNKNOWN_LABEL = "Unbekannt";
const MISSING_LABEL = "Keine aktuellen Daten";
const NOT_CONFIGURED_LABEL = "Nicht konfiguriert";

const BIO_STATE_LABELS: Record<string, string> = {
  awake: "Wach",
  provisional_sleep: "Vorläufiger Schlafschutz",
  sleep: "Schlaf",
  waking: "Wachphase",
};

const WAKE_STATE_LABELS: Record<string, string> = {
  scheduled: "Geplant",
  awake: "Wach",
  provisional_sleep: "Vorläufiger Schlafschutz",
  sleep: "Schlaf",
  waking: "Wachphase",
  skipped: "Kein Weckvorgang",
  inactive: "Nicht aktiv",
};

const PRESENCE_LABELS: Record<string, string> = {
  zuhause: "Zu Hause",
  home: "Zu Hause",
  bei_eltern: "Bei den Eltern",
  abwesend: "Abwesend",
  away: "Abwesend",
  arriving: "Kommt nach Hause",
  leaving: "Verlässt das Haus",
  uncertain: "Unklar",
  stale: "Nicht aktuell",
};

const ACTIVITY_LABELS: Record<string, string> = {
  idle: "Ruhephase",
  sleep: "Schlaf",
  waking: "Wachphase",
  free_time: "Freizeit",
  work_home: "Arbeit zu Hause",
  work_away: "Arbeit außer Haus",
  private_time: "Private Zeit",
  household: "Haushalt",
  gaming: "Gaming",
  entertainment: "Unterhaltung",
  music: "Musik",
  pc_active: "PC-Nutzung",
};

const PHASE_LABELS: Record<string, string> = {
  early_night: "Frühe Nacht",
  late_night: "Späte Nacht",
  early_morning: "Früher Morgen",
  forenoon: "Vormittag",
  midday: "Mittag",
  afternoon: "Nachmittag",
  late_afternoon: "Später Nachmittag",
  evening: "Abend",
  late_evening: "Später Abend",
};

const DAY_CONTEXT_LABELS: Record<string, string> = {
  werktag: "Regulärer Werktag",
  wochenende: "Wochenende",
  frei: "Freier Tag",
};

const PROFILE_LABELS: Record<string, string> = {
  weekday: "Werktag",
  weekend: "Wochenende",
};

const REASON_LABELS: Record<string, string> = {
  state_ready: "Core State liefert den aktuellen Status",
  provisional_sleep_protection: "Schutzstatus vor bestätigtem Schlaf",
  rule_wake: "Automatische Profilregel",
  holiday_to_weekend_profile: "Feiertag oder Urlaub nutzt das Wochenendprofil",
  calendar_wake_marker: "Kalender-Markierung für einen Weckvorgang",
  calendar_skip_marker: "Kalender markiert diesen Tag ohne Weckvorgang",
  waking_timeout: "Wachphase endet nach dem 30-Minuten-Schutzfenster",
  regular_wake_interaction: "Reguläre Wachinteraktion erkannt",
  no_wake: "Für diesen Tag ist kein Weckvorgang vorgesehen",
  no_current_data: MISSING_LABEL,
};

const SOURCE_LABELS: Record<string, string> = {
  core_state: "Core State",
  "internal:logic.compute_day_phase_starts": "Core State · Tagesrhythmus",
  "internal:wake_planning": "Core State · Wake Planning",
  "configured source": "Konfigurierte Quelle",
  legacy_comparison: "Temporärer Legacy-Vergleich",
};

const DECISION_LABELS: Record<string, string> = {
  profile_weekday: "Automatische Werktagsregel",
  profile_weekend: "Automatische Wochenendregel",
  "rule:profile_weekday": "Automatische Werktagsregel",
  "rule:profile_weekend": "Automatische Wochenendregel",
};

const COMMAND_ERROR_LABELS: Record<string, string> = {
  adapter_unavailable: "Core State ist für Änderungen nicht erreichbar.",
  profile_invalid: "Das Profil enthält ungültige Werte.",
  profile_not_found: "Das ausgewählte Profil ist nicht verfügbar.",
  profile_field_not_allowed: "Dieses Profilfeld darf nicht geändert werden.",
  wake_time_invalid: "Die Weckzeit ist ungültig.",
  wake_window_invalid: "Das Weckfenster muss zwischen 0 und 120 Minuten liegen.",
  minimum_sleep_invalid: "Die gewünschte Mindestschlafdauer muss eine positive Minutenzahl sein.",
  provisional_lead_invalid: "Der Schutzvorlauf muss eine positive Minutenzahl sein.",
  command_not_authorized: "Core State hat die Änderung nicht autorisiert.",
};

function mappedLabel(
  value: string | null | undefined,
  labels: Record<string, string>,
  missing = MISSING_LABEL,
): string {
  if (!value || !value.trim()) return missing;
  return labels[value] ?? UNKNOWN_LABEL;
}

export function statusLabel(status: DataStatus | string | null | undefined): string {
  return mappedLabel(status, STATUS_LABELS, MISSING_LABEL);
}

export function displayBioState(value: string | null | undefined): string {
  return mappedLabel(value, BIO_STATE_LABELS);
}

export function displayWakeState(value: string | null | undefined): string {
  return mappedLabel(value, WAKE_STATE_LABELS);
}

export function displayPresence(value: string | null | undefined): string {
  return mappedLabel(value, PRESENCE_LABELS);
}

export function displayActivity(value: string | null | undefined): string {
  return mappedLabel(value, ACTIVITY_LABELS);
}

export function displayPhase(value: string | null | undefined): string {
  return mappedLabel(value, PHASE_LABELS);
}

export function displayDayContext(
  value: string | null | undefined,
  options: { holiday?: boolean; vacation?: boolean } = {},
): string {
  if (options.vacation) return "Urlaub · Wochenendprofil";
  if (options.holiday) return "Feiertag · Wochenendprofil";
  return mappedLabel(value, DAY_CONTEXT_LABELS);
}

export function displayProfile(value: string | null | undefined): string {
  return mappedLabel(value, PROFILE_LABELS, NOT_CONFIGURED_LABEL);
}

export function displayQuality(value: DataStatus | string | null | undefined): string {
  return statusLabel(value);
}

export function displaySource(value: string | null | undefined): string {
  if (!value || !value.trim()) return MISSING_LABEL;
  if (SOURCE_LABELS[value]) return SOURCE_LABELS[value];
  if (value.startsWith("internal:")) return "Core State";
  if (value.startsWith("legacy")) return "Temporärer Legacy-Vergleich";
  return UNKNOWN_LABEL;
}

export function displayDecision(value: string | null | undefined): string {
  if (!value || !value.trim()) return "Keine aktuelle Entscheidung";
  return DECISION_LABELS[value] ?? UNKNOWN_LABEL;
}

export function displayRuleName(name: string | null | undefined, id: string | null | undefined): string {
  if (id && DECISION_LABELS[id]) return DECISION_LABELS[id];
  if (name && name.trim() && !name.includes("_")) return name;
  return displayDecision(id);
}

export function displayReason(reason: string | null | undefined): string {
  if (!reason || !reason.trim()) return MISSING_LABEL;
  return REASON_LABELS[reason] ?? UNKNOWN_LABEL;
}

export function displayCommandError(error: string | null | undefined): string {
  if (!error || !error.trim()) return "Die Änderung konnte nicht gespeichert werden.";
  return COMMAND_ERROR_LABELS[error] ?? "Core State konnte die Änderung nicht speichern.";
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return MISSING_LABEL;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value.slice(0, 5) || UNKNOWN_LABEL;
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(parsed);
}

export function formatDate(value: string): string {
  const parsed = new Date(`${value}T12:00:00+02:00`);
  if (Number.isNaN(parsed.valueOf())) return UNKNOWN_LABEL;
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(parsed);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return MISSING_LABEL;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return UNKNOWN_LABEL;
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(parsed);
}

export function displayMetric(value: number | null | undefined, suffix = ""): string {
  return value === null || value === undefined ? NOT_CONFIGURED_LABEL : `${value}${suffix}`;
}

export function formatClock(value: string | null | undefined): string {
  if (!value) return NOT_CONFIGURED_LABEL;
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  return formatTime(value);
}

export function formatDuration(value: number | null | undefined): string {
  if (value === null || value === undefined) return NOT_CONFIGURED_LABEL;
  if (!Number.isFinite(value)) return UNKNOWN_LABEL;
  if (value < 60) return `${value} Min.`;
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return minutes ? `${hours} Std. ${minutes} Min.` : `${hours} Std.`;
}

export function humanReason(reason: string | null | undefined): string {
  return displayReason(reason);
}

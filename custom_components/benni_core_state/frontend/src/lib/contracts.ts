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

export function statusLabel(status: DataStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value.slice(0, 5);
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(parsed);
}

export function formatDate(value: string): string {
  const parsed = new Date(`${value}T12:00:00+02:00`);
  if (Number.isNaN(parsed.valueOf())) return value;
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(parsed);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value;
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(parsed);
}

export function displayMetric(value: number | null | undefined, suffix = ""): string {
  return value === null || value === undefined ? "nicht belegt" : `${value}${suffix}`;
}

export function humanReason(reason: string | null | undefined): string {
  const labels: Record<string, string> = {
    provisional_sleep_protection: "Schutzstatus vor bestätigtem Schlaf",
    rule_wake: "Automatische Profilregel",
    holiday_to_weekend_profile: "Feiertag/Urlaub nutzt das Wochenendprofil",
    calendar_wake_marker: "Kalender-Wake-Markierung",
    calendar_skip_marker: "Kalender markiert diesen Tag als ohne Wake",
    waking_timeout: "Wachphase endet nach dem 30-Minuten-Schutzfenster",
    regular_wake_interaction: "Reguläre Wachinteraktion erkannt",
  };
  if (!reason) return "Keine zusätzliche Begründung geliefert.";
  return labels[reason] ?? reason.replaceAll("_", " ");
}

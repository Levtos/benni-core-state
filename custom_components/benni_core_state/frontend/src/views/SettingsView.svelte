<svelte:options runes={true} />

<script lang="ts">
  import { CalendarCog, RotateCcw, Save } from "@lucide/svelte";
  import type { Snapshot } from "../lib/contracts";

  interface Props {
    snapshot: Snapshot | null;
    pendingCommand: string | null;
    onCommand: (command: string, payload?: Record<string, unknown>) => Promise<void>;
  }

  let { snapshot, pendingCommand, onCommand }: Props = $props();
  let loaded = $state(false);
  let calendarEntity = $state("");
  let holidayCalendarEntity = $state("");
  let holidayIntervals = $state("");
  let skipTitles = $state("");
  let wakePattern = $state("");
  let routineDuration = $state(60);
  let conflictBehavior = $state<"ignore" | "warn_only" | "wake_earlier">("warn_only");
  let wakeFloor = $state("06:00");

  function loadSettings(): void {
    const config = snapshot?.config;
    if (!config) return;
    calendarEntity = config.calendar_entity ?? "";
    holidayCalendarEntity = config.holiday_calendar_entity ?? "";
    holidayIntervals = config.manual_holiday_intervals.join("\n");
    skipTitles = config.calendar_skip_titles.join("\n");
    wakePattern = config.calendar_wake_pattern;
    routineDuration = config.routine_duration_minutes;
    conflictBehavior = config.calendar_conflict_behavior;
    wakeFloor = config.wake_floor;
    loaded = true;
  }

  $effect(() => {
    if (!loaded && snapshot?.config) loadSettings();
  });

  async function saveSettings(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    await onCommand("wake.settings.update", {
      values: {
        calendar_entity: calendarEntity.trim() || null,
        holiday_calendar_entity: holidayCalendarEntity.trim() || null,
        manual_holiday_intervals: holidayIntervals.split("\n").map((item) => item.trim()).filter(Boolean),
        calendar_skip_titles: skipTitles.split("\n").map((item) => item.trim()).filter(Boolean),
        calendar_wake_pattern: wakePattern,
        routine_duration_minutes: Number(routineDuration),
        calendar_conflict_behavior: conflictBehavior,
        wake_floor: wakeFloor,
      },
    });
  }
</script>

<div class="view-heading">
  <div>
    <p class="section-kicker">Einstellungen</p>
    <h2>Core-State-eigene Quellen und Grenzen</h2>
    <p class="muted">Diese Werte werden persistiert, versioniert validiert und ausschließlich von Core State ausgewertet.</p>
  </div>
  <CalendarCog size={24} color="var(--cyan)" />
</div>

{#if snapshot?.config}
  <section class="form-card" aria-labelledby="settings-heading">
    <div class="card-header">
      <div>
        <p class="section-kicker">Konfiguration</p>
        <h3 id="settings-heading">Kalender, Konflikte und Floor</h3>
      </div>
      <span class="chip cyan">Contract {snapshot.config.contract_version}</span>
    </div>
    <form class="form-grid" onsubmit={saveSettings}>
      <label class="field">
        <span class="field-label">Wake-Kalenderquelle</span>
        <input bind:value={calendarEntity} placeholder="calendar.core_state_wake" />
        <small>Nur externe Quelle lesen; Core State schreibt nicht in den Kalender.</small>
      </label>
      <label class="field">
        <span class="field-label">Feiertags-/Urlaubsquelle</span>
        <input bind:value={holidayCalendarEntity} placeholder="calendar.core_state_holidays" />
        <small>Feiertag und Urlaub stufen Werktag automatisch auf Wochenende.</small>
      </label>
      <label class="field full">
        <span class="field-label">Manuelle Feiertags-/Urlaubsintervalle</span>
        <textarea bind:value={holidayIntervals} placeholder="2026-12-24..2026-12-31"></textarea>
        <small>Ein Datum oder Intervall pro Zeile. Samstag bleibt Wochenende.</small>
      </label>
      <label class="field">
        <span class="field-label">Wake Window (Kalenderkonflikt)</span>
        <select bind:value={conflictBehavior}>
          <option value="warn_only">Warnen, Regelzeit beibehalten</option>
          <option value="wake_earlier">Für frühen Termin früher wecken</option>
          <option value="ignore">Konflikt ignorieren</option>
        </select>
      </label>
      <label class="field">
        <span class="field-label">Routine-Dauer (Minuten)</span>
        <input type="number" min="0" max="1440" bind:value={routineDuration} />
      </label>
      <label class="field">
        <span class="field-label">Absoluter Floor</span>
        <input type="time" bind:value={wakeFloor} required />
        <small>Unabhängig von Tagesphase, Tageskontext und Sonnenaufgang.</small>
      </label>
      <label class="field full">
        <span class="field-label">Kalender-Markierungen</span>
        <input bind:value={skipTitles} placeholder="no-wake&#10;schlaf aus" />
        <small>Belegte automatische Skip-Titel; keine manuelle Skip-Aktion.</small>
      </label>
      <label class="field full">
        <span class="field-label">Wake-Muster</span>
        <input bind:value={wakePattern} />
        <small>Backend validiert das Muster und redigiert Ereignistexte aus der Diagnose.</small>
      </label>
      <div class="field full action-row">
        <button class="button" type="submit" disabled={pendingCommand !== null || !snapshot.capabilities.edit_settings}><Save size={16} /> Einstellungen speichern</button>
      </div>
    </form>
  </section>

  {#if snapshot.config.migration.rollback_available}
    <section class="card" style="margin-top: 14px;" aria-labelledby="migration-heading">
      <div class="card-header">
        <div>
          <p class="section-kicker">Migration</p>
          <h3 id="migration-heading">Versionierte Übernahme</h3>
        </div>
        <span class="chip orange">{snapshot.config.migration.status ?? "unbekannt"}</span>
      </div>
      <p class="helper">Quelle: {snapshot.config.migration.source ?? "Core State"}. Die alte Quelle wird nicht verändert; Rollback stellt das vorherige Core-State-Dokument wieder her.</p>
      <div class="action-row">
        <button class="button secondary danger" type="button" disabled={pendingCommand !== null || !snapshot.capabilities.edit_settings} onclick={() => onCommand("wake.config.rollback")}>
          <RotateCcw size={16} /> Core-State-Migration zurücksetzen
        </button>
      </div>
    </section>
  {/if}
{:else}
  <div class="skeleton" aria-busy="true"></div>
{/if}

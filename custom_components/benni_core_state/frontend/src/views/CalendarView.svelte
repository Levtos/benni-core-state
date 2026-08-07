<svelte:options runes={true} />

<script lang="ts">
  import { CalendarDays, CheckCircle2, CircleAlert, Clock3 } from "@lucide/svelte";
  import type { DataStatus, Projection, ProjectionDay } from "../lib/contracts";
  import {
    displayDayContext,
    displayDecision,
    displayProfile,
    displayQuality,
    displayReason,
    formatClock,
    formatDate,
    statusLabel,
  } from "../lib/contracts";

  interface Props {
    projection: Projection | null;
    status: DataStatus;
  }

  let { projection, status }: Props = $props();

  function dayClass(day: ProjectionDay): string {
    return [
      "calendar-day",
      day.status,
      day.profile.id === "weekend" ? "weekend" : "weekday",
      day.holiday ? "holiday" : "",
      day.vacation ? "vacation" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }
</script>

<div class="view-heading">
  <div>
    <p class="section-kicker">Kalender</p>
    <h2>Die nächsten 14 Tage</h2>
    <p class="muted">Kompakte Projektion aus Core State. Das Frontend entscheidet keine Regel und berechnet keinen Weckplan.</p>
  </div>
  <span class="data-status" data-status={projection?.status ?? status}>Datenlage: {displayQuality(projection?.status ?? status)}</span>
</div>

{#if projection?.days?.length}
  <section class="table-card" aria-labelledby="projection-heading">
    <div class="section-header">
      <div>
        <p class="section-kicker">Core-State-Projektion</p>
        <h3 id="projection-heading">Profil, Tageskontext und automatische Auswahl</h3>
      </div>
      <span class="helper">UX-Vertrag v{projection.version} · {projection.horizon_days} Tage</span>
    </div>
    <div class="calendar-grid">
      {#each projection.days as day (day.date)}
        <article class={dayClass(day)}>
          <div class="calendar-day-header">
            <span class="calendar-date">{formatDate(day.date)}</span>
            {#if day.vacation}<span class="chip orange">Urlaub</span>{:else if day.holiday}<span class="chip orange">Feiertag</span>{:else if day.profile.id === "weekend"}<span class="chip purple">Wochenende</span>{/if}
          </div>
          <div class="day-context-list">
            <span class="chip cyan">Profil: {displayProfile(day.profile.id)}</span>
            <span class="chip">Tageskontext: {displayDayContext(day.day_context, { holiday: day.holiday, vacation: day.vacation })}</span>
          </div>
          {#if day.wake.wake_time}
            <strong class="calendar-wake purple"><Clock3 size={18} /> {formatClock(day.wake.wake_time)}</strong>
          {:else if day.wake.state === "skipped"}
            <strong class="calendar-wake orange"><CircleAlert size={18} /> Kein Weckvorgang</strong>
          {:else}
            <strong class="calendar-wake"><CircleAlert size={18} /> Nicht aktiv</strong>
          {/if}
          <p class="helper">
            {displayReason(day.wake.reason)}
            {#if day.wake.floor_applied} · Absoluter Floor angewendet{/if}
            {#if day.wake.calendar_conflict} · Kalenderkonflikt{/if}
          </p>
          <p class="helper">Auswahl: {displayDecision(day.wake.matched_rule ?? day.wake.decided_by)}</p>
          <span class="data-status" data-status={day.status}>
            {#if day.status === "ready"}<CheckCircle2 size={13} />{/if}
            {displayQuality(day.status)}
          </span>
        </article>
      {/each}
    </div>
  </section>
{:else}
  <div class="empty-state">
    <CalendarDays size={30} />
    <h3>Keine Projektion verfügbar</h3>
    <p>Core State liefert die 14-Tage-Projektion erst, wenn die Datenquelle aktuell erreichbar ist.</p>
    <span class="data-status" data-status={status}>Datenlage: {statusLabel(status)}</span>
  </div>
{/if}

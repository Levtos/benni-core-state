<svelte:options runes={true} />

<script lang="ts">
  import { CalendarDays, CheckCircle2, CircleAlert, Clock3 } from "@lucide/svelte";
  import type { DataStatus, Projection } from "../lib/contracts";
  import { formatDate, statusLabel } from "../lib/contracts";

  interface Props {
    projection: Projection | null;
    status: DataStatus;
  }

  let { projection, status }: Props = $props();
</script>

<div class="view-heading">
  <div>
    <p class="section-kicker">Kalender</p>
    <h2>Die nächsten 14 Tage</h2>
    <p class="muted">Kompakte Projektion aus Core State. Das Frontend entscheidet keine Regel und berechnet keinen Wake-Plan.</p>
  </div>
  <span class="data-status" data-status={projection?.status ?? status}>{statusLabel(projection?.status ?? status)}</span>
</div>

{#if projection?.days?.length}
  <section class="table-card" aria-labelledby="projection-heading">
    <div class="section-header">
      <div>
        <p class="section-kicker">Core-State-Projektion</p>
        <h3 id="projection-heading">Profil, Kontext und Regelgewinner</h3>
      </div>
      <span class="helper">Contract v{projection.version} · {projection.horizon_days} Tage</span>
    </div>
    <div class="calendar-grid">
      {#each projection.days as day (day.date)}
        <article class={`calendar-day ${day.status} ${day.profile.id === "weekend" ? "weekend" : ""}`}>
          <div class="calendar-day-header">
            <span class="calendar-date">{formatDate(day.date)}</span>
            {#if day.holiday || day.vacation}<span class="chip orange">{day.vacation ? "Urlaub" : "Feiertag"}</span>{/if}
          </div>
          <div class="inline-meta">
            <span class="chip cyan">{day.profile.label}</span>
            <span class="chip">{day.day_context}</span>
          </div>
          {#if day.wake.wake_time}
            <strong class="calendar-wake"><Clock3 size={18} /> {day.wake.wake_time}</strong>
          {:else if day.wake.state === "skipped"}
            <strong class="calendar-wake"><CircleAlert size={18} /> Kein Wake</strong>
          {:else}
            <strong class="calendar-wake"><CircleAlert size={18} /> Inaktiv</strong>
          {/if}
          <p class="helper">
            {day.wake.reason.replaceAll("_", " ")}
            {#if day.wake.floor_applied} · Floor 06:00 angewendet{/if}
            {#if day.wake.calendar_conflict} · Kalenderkonflikt{/if}
          </p>
          <p class="helper">Gewinner: {day.wake.matched_rule ?? day.wake.decided_by}</p>
          <span class="data-status" data-status={day.status}>
            {#if day.status === "ready"}<CheckCircle2 size={13} />{/if}
            {statusLabel(day.status)}
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
    <span class="data-status" data-status={status}>{statusLabel(status)}</span>
  </div>
{/if}

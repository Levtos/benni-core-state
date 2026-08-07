<svelte:options runes={true} />

<script lang="ts">
  import { Activity, Moon, Sun, Sunrise } from "@lucide/svelte";
  import type { DataStatus, Snapshot } from "../lib/contracts";
  import {
    displayMetric,
    formatDateTime,
    formatTime,
    humanReason,
    statusLabel,
  } from "../lib/contracts";

  interface Props {
    snapshot: Snapshot | null;
    status: DataStatus;
    pendingCommand: string | null;
    onCommand: (command: string, payload?: Record<string, unknown>) => Promise<void>;
  }

  let { snapshot, status, pendingCommand, onCommand }: Props = $props();
</script>

{#if snapshot?.data}
  {@const today = snapshot.data.today}
  {@const timeline = snapshot.data.timeline}
  <div class="view-heading">
    <div>
      <p class="section-kicker">Heute</p>
      <h2>Eine verlässliche Alltagswahrheit</h2>
      <p class="muted">Presence, Bio, Tageskontext, Activity und internes Wake Planning aus Core State.</p>
    </div>
    <span class="data-status" data-status={today.data_status}>{statusLabel(today.data_status)}</span>
  </div>

  <section class={`hero-card ${today.bio.state}`} aria-labelledby="today-status-heading">
    <div>
      <div class="hero-label">
        {#if today.bio.state === "sleep"}<Moon size={18} />{:else if today.bio.state === "awake"}<Sun size={18} />{:else if today.bio.state === "waking"}<Sunrise size={18} />{:else}<Activity size={18} />{/if}
        <span>Zentrale Statuswahrheit</span>
      </div>
      <h2 id="today-status-heading">{today.central_status.value}</h2>
      <p>
        {#if today.bio.provisional}
          Schutzstatus: Das ist noch keine bestätigte Schlafzeit. Core State wartet auf die reguläre Schlaf-/Wachentscheidung.
        {:else}
          {humanReason(today.reason)}.
        {/if}
      </p>
      <div class="hero-meta">
        <span class="chip cyan">Profil: {today.profile.label}</span>
        <span class="chip purple">Tageskontext: {today.day_context.value}</span>
        <span class="chip">Activity: {today.activity.state}</span>
      </div>
      <div class="action-row">
        {#if snapshot.capabilities.mark_sleep && today.bio.state !== "sleep"}
          <button
            class="button"
            type="button"
            disabled={pendingCommand !== null}
            onclick={() => onCommand("bio.mark_sleep")}
          >
            <Moon size={16} /> Schlaf markieren
          </button>
        {/if}
        {#if snapshot.capabilities.mark_awake && today.bio.state !== "awake"}
          <button
            class="button secondary"
            type="button"
            disabled={pendingCommand !== null}
            onclick={() => onCommand("bio.mark_awake")}
          >
            <Sun size={16} /> Wach markieren
          </button>
        {/if}
      </div>
    </div>

    <div class="hero-side">
      <span class="hero-side-label">Nächster effektiver Wake-Start</span>
      <strong class="hero-time">{formatDateTime(today.wake.next_effective_start)}</strong>
      <span class="helper">{humanReason(today.wake.reason)}.</span>
      <div class="inline-meta">
        <span class="chip orange">Entschieden durch: {today.wake.decided_by ?? "Core State"}</span>
        <span class="chip">Daten: {statusLabel(status)}</span>
      </div>
    </div>
  </section>

  <div class="grid three">
    <article class="metric-card">
      <span class="metric-label">E · Frühester Start</span>
      <div class="metric-value">{formatDateTime(today.wake.e)}</div>
      <p class="metric-note">Aus dem Backend-Wake-Fenster</p>
    </article>
    <article class="metric-card">
      <span class="metric-label">L · Harte Grenze</span>
      <div class="metric-value">{formatDateTime(today.wake.l)}</div>
      <p class="metric-note">{today.wake.hard_l_applied ? "Grenze wurde angewendet" : "Keine Grenzverschiebung"}</p>
    </article>
    <article class="metric-card">
      <span class="metric-label">M / A · Schlafschutz</span>
      <div class="metric-value">{displayMetric(today.wake.m_minutes, " min")} / {displayMetric(today.wake.a_minutes, " min")}</div>
      <p class="metric-note">Mindestschlaf / Schutzvorlauf; fehlende Werte bleiben sichtbar</p>
    </article>
  </div>

  <section class="timeline-card" aria-labelledby="timeline-heading">
    <div class="section-header">
      <div>
        <p class="section-kicker">Tagesrhythmus</p>
        <h3 id="timeline-heading">Neun echte Tagesphasen</h3>
      </div>
      <span class="helper">Nächster Wechsel: {formatDateTime(timeline.next_change)}</span>
    </div>
    <div class="timeline-track" aria-label="Neunphasige Tagesrhythmus-Timeline">
      <span class="timeline-marker" style={`left: ${timeline.now_marker_pct}%;`} aria-label="Jetzt"></span>
      {#each timeline.phases as phase (phase.id)}
        <div
          class:active={phase.active}
          class="timeline-phase"
          style={`flex-grow: ${phase.width_pct};`}
          title={`${phase.label}: ${formatTime(phase.start)}–${formatTime(phase.end)}`}
        >
          <span class="timeline-phase-label">{phase.label}</span>
          <span class="timeline-phase-time">{formatTime(phase.start)}</span>
        </div>
      {/each}
    </div>
    <div class="progress-bar" aria-label={`Fortschritt ${timeline.active_phase_progress_pct}%`}>
      <span style={`width: ${timeline.active_phase_progress_pct}%;`}></span>
    </div>
    <p class="helper" style="margin-top: 8px;">Aktive Phase: {timeline.active_phase} · {timeline.active_phase_progress_pct}% fortgeschritten</p>
  </section>
{:else}
  <div class="view-heading">
    <div>
      <p class="section-kicker">Heute</p>
      <h2>Core State wird geladen</h2>
      <p class="muted">Die Ansicht zeigt erst nach dem versionierten Snapshot fachliche Werte.</p>
    </div>
    <span class="data-status" data-status={status}>{statusLabel(status)}</span>
  </div>
  <div class="skeleton" aria-busy="true"></div>
{/if}

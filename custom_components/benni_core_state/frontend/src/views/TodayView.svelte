<svelte:options runes={true} />

<script lang="ts">
  import { Activity, Moon, Sun, Sunrise } from "@lucide/svelte";
  import type { DataStatus, Snapshot } from "../lib/contracts";
  import {
    displayActivity,
    displayBioState,
    displayDayContext,
    displayDecision,
    displayPhase,
    displayPresence,
    displayProfile,
    displayQuality,
    displayReason,
    displayWakeState,
    formatClock,
    formatDateTime,
    formatDuration,
    statusLabel,
  } from "../lib/contracts";
  import Button from "../lib/ui/Button.svelte";
  import TimelinePhase from "../lib/ui/TimelinePhase.svelte";

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
  {@const profileLabel = displayProfile(today.profile.id)}
  {@const contextLabel = displayDayContext(today.day_context.value, { holiday: today.day_context.holiday })}
  {@const presenceLabel = displayPresence(today.presence.effective || today.presence.personal)}
  <div class="view-heading">
    <div>
      <p class="section-kicker">Heute</p>
      <h2>Gemeinsamer Alltagsstatus</h2>
      <p class="muted">Anwesenheit, Bio, Aktivität, Tagesrhythmus und Wake Planning aus der gemeinsamen Core-State-Wahrheit.</p>
    </div>
    <span class="data-status" data-status={today.data_status}>Datenlage: {displayQuality(today.data_status)}</span>
  </div>

  <section class={`hero-card ${today.bio.state}`} aria-labelledby="today-status-heading">
    <div>
      <div class="hero-label">
        {#if today.bio.state === "sleep"}<Moon size={18} />{:else if today.bio.state === "awake"}<Sun size={18} />{:else if today.bio.state === "waking"}<Sunrise size={18} />{:else}<Activity size={18} />{/if}
        <span>Zentrale Statuswahrheit</span>
      </div>
      <h2 id="today-status-heading">{displayBioState(today.bio.state)}</h2>
      <p>
        {#if today.bio.provisional}
          Vorläufiger Schlafschutz: Diese Zeit zählt noch nicht als bestätigter Schlaf.
        {:else}
          {displayReason(today.reason)}.
        {/if}
      </p>
      <div class="hero-meta">
        <span class="chip cyan">Profil: {profileLabel}</span>
        <span class="chip purple">Tageskontext: {contextLabel}</span>
        <span class="chip">Anwesenheit: {presenceLabel}</span>
      </div>
      <div class="action-row">
        {#if snapshot.capabilities.mark_sleep && today.bio.state !== "sleep"}
          <Button disabled={pendingCommand !== null} onclick={() => onCommand("bio.mark_sleep")}>
            <Moon size={16} /> Schlaf markieren
          </Button>
        {/if}
        {#if snapshot.capabilities.mark_awake && today.bio.state !== "awake"}
          <Button variant="secondary" disabled={pendingCommand !== null} onclick={() => onCommand("bio.mark_awake")}>
            <Sun size={16} /> Wach markieren
          </Button>
        {/if}
      </div>
    </div>

    <div class="hero-side">
      <span class="hero-side-label">Nächster effektiver Weckbeginn</span>
      <strong class="hero-time">{formatDateTime(today.wake.next_effective_start)}</strong>
      <span class="helper">{displayReason(today.wake.reason)}.</span>
      <div class="inline-meta">
        <span class="chip purple">Weckzustand: {displayWakeState(today.wake.wake_state)}</span>
        <span class="chip orange">Entscheidung: {displayDecision(today.wake.decided_by)}</span>
        <span class="chip">Datenlage: {displayQuality(status)}</span>
      </div>
    </div>
  </section>

  <section class="grid three state-overview" aria-label="Core-State-Werte des heutigen Tages">
    <article class="metric-card semantic-cyan">
      <span class="metric-label">Anwesenheit</span>
      <div class="metric-value">{presenceLabel}</div>
      <p class="metric-note">Persönlich: {displayPresence(today.presence.personal)}</p>
    </article>
    <article class="metric-card semantic-purple">
      <span class="metric-label">Bio-Status</span>
      <div class="metric-value">{displayBioState(today.bio.state)}</div>
      <p class="metric-note">{today.bio.provisional ? "Schutzstatus, nicht bestätigte Schlafzeit" : displayReason(today.bio.diagnostics.reason as string | null)}</p>
    </article>
    <article class="metric-card semantic-cyan">
      <span class="metric-label">Aktivität</span>
      <div class="metric-value">{displayActivity(today.activity.state)}</div>
      <p class="metric-note">Von Core State bewertet</p>
    </article>
    <article class="metric-card semantic-purple">
      <span class="metric-label">Tagesphase</span>
      <div class="metric-value">{displayPhase(timeline.active_phase)}</div>
      <p class="metric-note">Nächster Phasenwechsel: {formatDateTime(timeline.next_change)}</p>
    </article>
    <article class="metric-card semantic-orange">
      <span class="metric-label">Tageskontext</span>
      <div class="metric-value">{contextLabel}</div>
      <p class="metric-note">Wirksames Weckprofil: {profileLabel}</p>
    </article>
    <article class="metric-card semantic-green">
      <span class="metric-label">Datenqualität</span>
      <div class="metric-value">{displayQuality(today.data_status)}</div>
      <p class="metric-note">Snapshot: {formatDateTime(snapshot.updated_at)}</p>
    </article>
  </section>

  <section class="grid four metric-grid" aria-label="Backend-Weckfenster und Schlafschutz">
    <article class="metric-card">
      <span class="metric-label">E · Frühester möglicher Weckbeginn</span>
      <div class="metric-value">{formatClock(today.wake.e)}</div>
      <p class="metric-note">Backendseitig berechnet</p>
    </article>
    <article class="metric-card">
      <span class="metric-label">L · Spätester Weckbeginn – harte Grenze</span>
      <div class="metric-value">{formatClock(today.wake.l)}</div>
      <p class="metric-note">{today.wake.hard_l_applied ? "Harte Grenze angewendet" : "Keine Grenzverschiebung"}</p>
    </article>
    <article class="metric-card">
      <span class="metric-label">M · Gewünschte Mindestschlafdauer</span>
      <div class="metric-value">{formatDuration(today.wake.m_minutes)}</div>
      <p class="metric-note">Nur Core State entscheidet über die Einhaltung</p>
    </article>
    <article class="metric-card">
      <span class="metric-label">A · Schutzvorlauf für vorsorglichen Schlaf</span>
      <div class="metric-value">{formatDuration(today.wake.a_minutes)}</div>
      <p class="metric-note">Schutzstatus bleibt fachlich getrennt</p>
    </article>
  </section>

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
        <TimelinePhase {phase} />
      {/each}
    </div>
    <div class="progress-bar" aria-label={`Fortschritt ${timeline.active_phase_progress_pct}%`}>
      <span style={`width: ${timeline.active_phase_progress_pct}%;`}></span>
    </div>
    <p class="helper" style="margin-top: 8px;">Aktive Phase: {displayPhase(timeline.active_phase)} · {timeline.active_phase_progress_pct}% fortgeschritten</p>
  </section>
{:else}
  <div class="view-heading">
    <div>
      <p class="section-kicker">Heute</p>
      <h2>Core State wird geladen</h2>
      <p class="muted">Die Ansicht zeigt erst nach dem versionierten Snapshot fachliche Werte.</p>
    </div>
    <span class="data-status" data-status={status}>Datenlage: {statusLabel(status)}</span>
  </div>
  <div class="skeleton" aria-busy="true"></div>
{/if}

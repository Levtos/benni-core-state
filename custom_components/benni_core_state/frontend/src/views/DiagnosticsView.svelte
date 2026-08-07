<svelte:options runes={true} />

<script lang="ts">
  import { Activity, Bug, CalendarClock, GitCompareArrows, HeartPulse, ShieldCheck, Sunrise } from "@lucide/svelte";
  import type { DataStatus, Snapshot } from "../lib/contracts";
  import {
    displayActivity,
    displayBioState,
    displayDayContext,
    displayDecision,
    displayPhase,
    displayPresence,
    displayQuality,
    displayReason,
    displaySource,
    displayWakeState,
    formatDateTime,
  } from "../lib/contracts";

  interface Props {
    snapshot: Snapshot | null;
    status: DataStatus;
  }

  let { snapshot, status }: Props = $props();

  function record(value: unknown): Record<string, unknown> {
    return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  }

  function stringValue(value: unknown): string | null {
    return typeof value === "string" ? value : null;
  }

  function pretty(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }
</script>

<div class="view-heading">
  <div>
    <p class="section-kicker">Diagnose</p>
    <h2>Core-State-Entscheidungsspur</h2>
    <p class="muted">Zuerst verständliche Status- und Qualitätsinformationen; technische Quellen und Codes sind progressiv aufklappbar.</p>
  </div>
  <span class="data-status" data-status={snapshot?.status ?? status}>Datenlage: {displayQuality(snapshot?.status ?? status)}</span>
</div>

{#if snapshot?.data}
  {@const today = snapshot.data.today}
  {@const timeline = snapshot.data.timeline}
  {@const diagnostics = snapshot.data.diagnostics}
  {@const wake = record(diagnostics.wake)}
  {@const bio = record(diagnostics.bio)}
  {@const activity = record(diagnostics.activity)}
  <section class="grid two trace-grid" aria-label="Decision Trace">
    <article class="card trace-card semantic-cyan">
      <div class="card-header"><div><p class="section-kicker">1 · Anwesenheit</p><h3>{displayPresence(today.presence.effective || today.presence.personal)}</h3></div><HeartPulse size={19} color="var(--cyan)" /></div>
      <p class="trace-summary">Persönlicher Status: {displayPresence(today.presence.personal)}.</p>
      <span class="quality-line">Datenlage: {displayQuality(today.data_status)} · Aktualisiert: {formatDateTime(snapshot.updated_at)}</span>
      <details><summary>Quelle und technische Codes</summary><dl class="diagnostic-list"><dt>Wirksamer Code</dt><dd>{today.presence.effective || "Nicht konfiguriert"}</dd><dt>Quelle</dt><dd>{displaySource("core_state")}</dd></dl></details>
    </article>

    <article class="card trace-card semantic-purple">
      <div class="card-header"><div><p class="section-kicker">2 · Bio</p><h3>{displayBioState(today.bio.state)}</h3></div><ShieldCheck size={19} color="var(--purple)" /></div>
      <p class="trace-summary">{today.bio.provisional ? "Schutzstatus; noch keine bestätigte Schlafzeit." : displayReason(stringValue(bio.reason) ?? today.reason) + "."}</p>
      <span class="quality-line">Datenlage: {displayQuality(today.data_status)} · Aktualisiert: {formatDateTime(snapshot.updated_at)}</span>
      <details><summary>Quelle und technische Codes</summary><pre class="diagnostic-pre">{pretty({ state: today.bio.state, provisional: today.bio.provisional, diagnostics: bio })}</pre></details>
    </article>

    <article class="card trace-card semantic-purple">
      <div class="card-header"><div><p class="section-kicker">3 · Tagesphase und Tageskontext</p><h3>{displayPhase(timeline.active_phase)}</h3></div><Sunrise size={19} color="var(--purple)" /></div>
      <p class="trace-summary">{displayDayContext(today.day_context.value, { holiday: today.day_context.holiday })}; nächster Phasenwechsel: {formatDateTime(timeline.next_change)}.</p>
      <span class="quality-line">Datenlage: {displayQuality(today.data_status)} · Backend-Projektion</span>
      <details><summary>Quelle und technische Codes</summary><pre class="diagnostic-pre">{pretty({ active_phase: timeline.active_phase, day_context: today.day_context, timeline_version: timeline.version })}</pre></details>
    </article>

    <article class="card trace-card semantic-cyan">
      <div class="card-header"><div><p class="section-kicker">4 · Aktivität</p><h3>{displayActivity(today.activity.state)}</h3></div><Activity size={19} color="var(--cyan)" /></div>
      <p class="trace-summary">Core State bewertet die aktuelle Aktivität aus den autorisierten Kandidaten.</p>
      <span class="quality-line">Datenlage: {displayQuality(today.data_status)} · Aktualisiert: {formatDateTime(snapshot.updated_at)}</span>
      <details><summary>Entscheidung und Kandidaten</summary><pre class="diagnostic-pre">{pretty(activity)}</pre></details>
    </article>

    <article class="card trace-card semantic-orange">
      <div class="card-header"><div><p class="section-kicker">5 · Weckplanung</p><h3>{displayWakeState(today.wake.wake_state)}</h3></div><CalendarClock size={19} color="var(--orange)" /></div>
      <p class="trace-summary">{displayReason(today.wake.reason)}. Entscheidung: {displayDecision(today.wake.decided_by)}.</p>
      <span class="quality-line">Datenlage: {displayQuality(today.data_status)} · Quelle: {displaySource(stringValue(wake.source) ?? "internal:wake_planning")}</span>
      <details><summary>Weckfenster und technische Details</summary><pre class="diagnostic-pre">{pretty({ wake: today.wake, diagnostics: wake })}</pre></details>
    </article>
  </section>

  <section class="card" style="margin-top: 14px;" aria-labelledby="diag-overview-heading">
    <div class="card-header"><div><p class="section-kicker">Vertrag und Aktualität</p><h3 id="diag-overview-heading">Gesamtstatus</h3></div><Bug size={19} color="var(--green)" /></div>
    <dl class="diagnostic-list">
      <dt>Datenstatus</dt><dd>{displayQuality(snapshot.status)}</dd>
      <dt>Snapshot-Aktualität</dt><dd>{formatDateTime(snapshot.updated_at)}</dd>
      <dt>Integration</dt><dd>Core State v{snapshot.integration_version}</dd>
      <dt>UX-Vertrag</dt><dd>{snapshot.contract} · v{snapshot.version}</dd>
      <dt>Timeline-Vertrag</dt><dd>Core State · v{snapshot.data.timeline.version}</dd>
      <dt>Mapping-Vertrag</dt><dd>{diagnostics.mapping_contract_version ? `Core State · v${diagnostics.mapping_contract_version}` : "Nicht konfiguriert"}</dd>
      <dt>Berechtigung</dt><dd>{snapshot.permissions.command ? "Änderungen autorisiert" : "Nur Lesen"}</dd>
    </dl>
  </section>

  {#if snapshot.capabilities.legacy_comparison}
    <section class="card semantic-orange" style="margin-top: 14px;" aria-labelledby="legacy-heading">
      <div class="card-header">
        <div>
          <p class="section-kicker">Temporär während Migration</p>
          <h3 id="legacy-heading">Legacy-vs-Core-Vergleich</h3>
        </div>
        <GitCompareArrows size={20} color="var(--orange)" />
      </div>
      <p class="helper">Diese Diagnose-Capability ist nur für Shadow-, Migrations- und Rollback-Nachweise sichtbar und kann nach dem Cutover vollständig verschwinden.</p>
      <details><summary>Technische Vergleichsdaten anzeigen</summary><pre class="diagnostic-pre">{pretty(wake)}</pre></details>
    </section>
  {/if}
{:else}
  <div class="empty-state">
    <Bug size={30} />
    <h3>Diagnose wartet auf Snapshot</h3>
    <p>Der technische Trace wird erst mit einer belastbaren Core-State-Antwort gefüllt.</p>
  </div>
{/if}

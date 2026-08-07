<svelte:options runes={true} />

<script lang="ts">
  import { Bug, GitCompareArrows, ShieldCheck } from "@lucide/svelte";
  import type { DataStatus, Snapshot } from "../lib/contracts";
  import { formatDateTime, statusLabel } from "../lib/contracts";

  interface Props {
    snapshot: Snapshot | null;
    status: DataStatus;
  }

  let { snapshot, status }: Props = $props();

  function record(value: unknown): Record<string, unknown> {
    return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  }

  function pretty(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }
</script>

<div class="view-heading">
  <div>
    <p class="section-kicker">Diagnose</p>
    <h2>Owner-lokaler Decision Trace</h2>
    <p class="muted">Technische Details sind nachrangig. Private Kalendertexte und unnötige Entity-IDs bleiben außerhalb des Contracts.</p>
  </div>
  <span class="data-status" data-status={snapshot?.status ?? status}>{statusLabel(snapshot?.status ?? status)}</span>
</div>

{#if snapshot?.data}
  {@const diagnostics = snapshot.data.diagnostics}
  {@const wake = record(diagnostics.wake)}
  {@const bio = record(diagnostics.bio)}
  {@const activity = record(diagnostics.activity)}
  <div class="grid two">
    <section class="card" aria-labelledby="diag-overview-heading">
      <div class="card-header"><h3 id="diag-overview-heading">Gesamtstatus</h3><ShieldCheck size={19} color="var(--green)" /></div>
      <dl class="diagnostic-list">
        <dt>Datenstatus</dt><dd>{statusLabel(snapshot.status)}</dd>
        <dt>Snapshot</dt><dd>{formatDateTime(snapshot.updated_at)}</dd>
        <dt>Snapshot-Contract</dt><dd>{snapshot.contract} · v{snapshot.version}</dd>
        <dt>Timeline-Contract</dt><dd>{snapshot.data.timeline.version}</dd>
        <dt>Mapping</dt><dd>{String(diagnostics.mapping_contract_version ?? "nicht belegt")}</dd>
        <dt>Berechtigung</dt><dd>{snapshot.permissions.command ? "Commands autorisiert" : "Nur Lesen"}</dd>
      </dl>
    </section>

    <section class="card" aria-labelledby="diag-sources-heading">
      <div class="card-header"><h3 id="diag-sources-heading">Datenqualität</h3><Bug size={19} color="var(--cyan)" /></div>
      <dl class="diagnostic-list">
        <dt>Wake source</dt><dd>{String(wake.source_status ?? "nicht belegt")} · {String(wake.source_quality ?? "—")}</dd>
        <dt>Wake decision</dt><dd>{String(wake.reason ?? "—")}</dd>
        <dt>Bio decision</dt><dd>{String(bio.reason ?? "—")}</dd>
        <dt>Activity decision</dt><dd>{String(activity.activity_decision ?? "—")}</dd>
        <dt>Owner</dt><dd>Core State · internes Wake Planning</dd>
      </dl>
    </section>
  </div>

  {#if snapshot.capabilities.legacy_comparison}
    <section class="card" style="margin-top: 14px;" aria-labelledby="legacy-heading">
      <div class="card-header">
        <div>
          <p class="section-kicker">Temporär während Migration</p>
          <h3 id="legacy-heading">Legacy-vs-Core-Vergleich</h3>
        </div>
        <GitCompareArrows size={20} color="var(--orange)" />
      </div>
      <p class="helper">Diese Capability ist nur für Shadow-/Migrationsdiagnose sichtbar und verschwindet nach dem Cutover vollständig.</p>
      <details>
        <summary>Vergleichsdaten anzeigen</summary>
        <pre class="diagnostic-pre">{pretty(wake)}</pre>
      </details>
    </section>
  {/if}

  <section class="card" style="margin-top: 14px;" aria-labelledby="trace-heading">
    <div class="card-header">
      <div>
        <p class="section-kicker">Progressiv aufklappbar</p>
        <h3 id="trace-heading">Contract-Details</h3>
      </div>
    </div>
    <details>
      <summary>Wake Planning</summary>
      <pre class="diagnostic-pre">{pretty(wake)}</pre>
    </details>
    <details>
      <summary>Bio und Activity</summary>
      <pre class="diagnostic-pre">{pretty({ bio, activity })}</pre>
    </details>
  </section>
{:else}
  <div class="empty-state">
    <Bug size={30} />
    <h3>Diagnose wartet auf Snapshot</h3>
    <p>Der technische Trace wird erst mit einer belastbaren Core-State-Antwort gefüllt.</p>
  </div>
{/if}

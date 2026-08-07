<svelte:options runes={true} />

<script lang="ts">
  import { ListChecks, Save, Trash2 } from "@lucide/svelte";
  import type { AutomaticRule, Snapshot } from "../lib/contracts";
  import {
    displayProfile,
    displayRuleName,
    formatClock,
    formatDuration,
  } from "../lib/contracts";

  interface Props {
    snapshot: Snapshot | null;
    pendingCommand: string | null;
    onCommand: (command: string, payload?: Record<string, unknown>) => Promise<void>;
  }

  const profileIds = ["weekday", "weekend"] as const;
  const weekdayLabels = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

  let { snapshot, pendingCommand, onCommand }: Props = $props();
  let selectedProfile = $state<"weekday" | "weekend">("weekday");
  let loadedProfileId = $state<"weekday" | "weekend" | null>(null);
  let wakeTime = $state("07:00");
  let wakeWindow = $state(5);
  let minimumSleep = $state("");
  let provisionalLead = $state("");
  let validationError = $state<string | null>(null);
  let ruleId = $state("");
  let ruleName = $state("");
  let ruleTime = $state("07:00");
  let ruleWeekdays = $state("");
  let rulePriority = $state(100);
  let ruleAction = $state<"wake" | "skip">("wake");
  let ruleDateFrom = $state("");
  let ruleDateTo = $state("");

  function loadProfile(id: "weekday" | "weekend"): void {
    selectedProfile = id;
    const profile = snapshot?.config.profiles[id];
    if (!profile) return;
    wakeTime = profile.wake_time;
    wakeWindow = profile.wake_window_minutes;
    minimumSleep = profile.minimum_sleep_minutes === null ? "" : String(profile.minimum_sleep_minutes);
    provisionalLead = profile.provisional_lead_minutes === null ? "" : String(profile.provisional_lead_minutes);
    loadedProfileId = id;
    validationError = null;
  }

  $effect(() => {
    if (snapshot?.config.profiles[selectedProfile] && loadedProfileId !== selectedProfile) {
      loadProfile(selectedProfile);
    }
  });

  function nullablePositiveNumber(value: string, label: string): number | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1440) {
      throw new Error(`${label} muss eine ganze Zahl zwischen 1 und 1440 Minuten sein.`);
    }
    return parsed;
  }

  function validateProfile(): string | null {
    if (!/^\d{2}:\d{2}$/.test(wakeTime)) return "Die Weckzeit muss im Format HH:MM angegeben werden.";
    if (!Number.isInteger(Number(wakeWindow)) || Number(wakeWindow) < 0 || Number(wakeWindow) > 120) {
      return "Das Weckfenster muss eine ganze Zahl zwischen 0 und 120 Minuten sein.";
    }
    try {
      nullablePositiveNumber(minimumSleep, "Die Mindestschlafdauer");
      nullablePositiveNumber(provisionalLead, "Der Schutzvorlauf");
    } catch (error) {
      return error instanceof Error ? error.message : "Die Profilwerte sind ungültig.";
    }
    return null;
  }

  async function saveProfile(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    validationError = validateProfile();
    if (validationError) return;
    await onCommand("wake.profile.update", {
      profile_id: selectedProfile,
      values: {
        wake_time: wakeTime,
        wake_window_minutes: Number(wakeWindow),
        minimum_sleep_minutes: nullablePositiveNumber(minimumSleep, "Die Mindestschlafdauer"),
        provisional_lead_minutes: nullablePositiveNumber(provisionalLead, "Der Schutzvorlauf"),
      },
    });
    loadedProfileId = null;
  }

  function editRule(rule: AutomaticRule): void {
    ruleId = rule.id;
    ruleName = rule.name;
    ruleTime = rule.wake_time ?? "07:00";
    ruleWeekdays = rule.weekdays?.join(",") ?? "";
    rulePriority = rule.priority;
    ruleAction = rule.action;
    ruleDateFrom = rule.date_from ?? "";
    ruleDateTo = rule.date_to ?? "";
  }

  function validityLabel(rule: AutomaticRule): string {
    if (rule.weekdays?.length) {
      return rule.weekdays.map((day) => weekdayLabels[day] ?? "Unbekannter Wochentag").join(", ");
    }
    if (rule.date_from || rule.date_to) return "Datumsbereich";
    return "Automatische Core-State-Auswahl";
  }

  async function saveRule(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    await onCommand("wake.rule.upsert", {
      rule: {
        id: ruleId.trim(),
        name: ruleName.trim() || ruleId.trim(),
        priority: Number(rulePriority),
        enabled: true,
        weekdays: ruleWeekdays
          .split(",")
          .map((value) => Number(value.trim()))
          .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6),
        date_from: ruleDateFrom || null,
        date_to: ruleDateTo || null,
        action: ruleAction,
        wake_time: ruleAction === "wake" ? ruleTime : null,
      },
    });
  }
</script>

<div class="view-heading">
  <div>
    <p class="section-kicker">Profile & Regeln</p>
    <h2>Schlaf- und Weckprofil-Matrix</h2>
    <p class="muted">Genau zwei wirksame Profile. Feiertag und Urlaub wählen automatisch das Wochenendprofil; sie sind keine zusätzlichen Wertprofile.</p>
  </div>
</div>

{#if snapshot?.config}
  <section class="profile-matrix" aria-labelledby="profile-matrix-heading">
    <div class="section-header">
      <div>
        <p class="section-kicker">Wirksame Profile</p>
        <h3 id="profile-matrix-heading">Werktag und Wochenende</h3>
      </div>
      <span class="chip purple">Automatische Auswahl durch Core State</span>
    </div>
    <div class="profile-grid">
      {#each profileIds as profileId (profileId)}
        {@const profile = snapshot.config.profiles[profileId]}
        <button
          class="profile-card"
          class:active={selectedProfile === profile.id}
          type="button"
          onclick={() => loadProfile(profile.id)}
          aria-pressed={selectedProfile === profile.id}
        >
          <span class="section-kicker">{displayProfile(profile.id)}</span>
          <h3>{displayProfile(profile.id)}</h3>
          <dl class="profile-matrix-list">
            <div><dt>E · Frühester möglicher Weckbeginn</dt><dd>{formatClock(profile.wake_time)}</dd></div>
            <div><dt>L · Spätester Weckbeginn – harte Grenze</dt><dd>Backend-Fenster ±{profile.wake_window_minutes} Min.</dd></div>
            <div><dt>M · Gewünschte Mindestschlafdauer</dt><dd>{formatDuration(profile.minimum_sleep_minutes)}</dd></div>
            <div><dt>A · Schutzvorlauf für vorsorglichen Schlaf</dt><dd>{formatDuration(profile.provisional_lead_minutes)}</dd></div>
          </dl>
          <p class="helper">Herkunft: persistente Core-State-Profilkonfiguration; E und L werden im Tagesstatus mit den aktuellen Backend-Grenzen ausgewiesen.</p>
        </button>
      {/each}
    </div>
  </section>

  <section class="form-card" style="margin-top: 14px;" aria-labelledby="profile-edit-heading">
    <div class="card-header">
      <div>
        <p class="section-kicker">Autorisierte Core-State-Änderung</p>
        <h3 id="profile-edit-heading">{displayProfile(selectedProfile)} bearbeiten</h3>
      </div>
      <span class="chip purple">Keine manuelle Profilumschaltung</span>
    </div>
    {#if validationError}<div class="validation-error" role="alert">{validationError}</div>{/if}
    <form class="form-grid" onsubmit={saveProfile}>
      <label class="field">
        <span class="field-label">Weckbeginn / Backend-Zielzeit (E/L-Fenster)</span>
        <input type="time" bind:value={wakeTime} required aria-invalid={validationError ? "true" : undefined} />
      </label>
      <label class="field">
        <span class="field-label">Weckfenster zwischen E und L (Minuten)</span>
        <input type="number" min="0" max="120" bind:value={wakeWindow} required aria-invalid={validationError ? "true" : undefined} />
      </label>
      <label class="field">
        <span class="field-label">M · Gewünschte Mindestschlafdauer (Minuten)</span>
        <input type="number" min="1" max="1440" bind:value={minimumSleep} placeholder="Nicht konfiguriert" aria-invalid={validationError ? "true" : undefined} />
        <small>Leer bleibt backendseitig nicht konfiguriert und wird nicht geraten.</small>
      </label>
      <label class="field">
        <span class="field-label">A · Schutzvorlauf für vorsorglichen Schlaf (Minuten)</span>
        <input type="number" min="1" max="1440" bind:value={provisionalLead} placeholder="Nicht konfiguriert" aria-invalid={validationError ? "true" : undefined} />
      </label>
      <div class="field full action-row">
        <button class="button" type="submit" disabled={pendingCommand !== null || !snapshot.capabilities.edit_profiles}>
          <Save size={16} /> Profil speichern und synchronisieren
        </button>
        <span class="helper">Warten, Erfolg, Fehler und anschließender Re-Sync kommen von Core State.</span>
      </div>
    </form>
  </section>

  <section class="table-card" style="margin-top: 14px;" aria-labelledby="rules-heading">
    <div class="section-header">
      <div>
        <p class="section-kicker">Automatische Regelarten</p>
        <h3 id="rules-heading">Regelgewinner und Gültigkeit</h3>
      </div>
      <ListChecks size={19} color="var(--cyan)" />
    </div>
    <div class="table-wrap">
      <table class="rules-table">
        <thead>
          <tr><th>Regel</th><th>Priorität</th><th>Gültigkeit</th><th>Aktion</th><th></th></tr>
        </thead>
        <tbody>
          {#each (snapshot.config.effective_rules ?? snapshot.config.rules) as rule (rule.id)}
            <tr>
              <td><strong>{displayRuleName(rule.name, rule.id)}</strong></td>
              <td>{rule.priority}</td>
              <td>{validityLabel(rule)}</td>
              <td>{rule.action === "skip" ? "Kein Weckvorgang" : `Wecken um ${formatClock(rule.wake_time)}`}</td>
              <td>
                {#if !rule.id.startsWith("profile_")}
                  <div class="action-row">
                    <button class="button secondary" type="button" disabled={!snapshot.capabilities.edit_rules} onclick={() => editRule(rule)}>Bearbeiten</button>
                    <button class="button secondary danger" type="button" disabled={pendingCommand !== null || !snapshot.capabilities.edit_rules} onclick={() => onCommand("wake.rule.remove", { rule_id: rule.id })}>
                      <Trash2 size={15} /> Entfernen
                    </button>
                  </div>
                {:else}
                  <span class="helper">Profilregel</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <section class="form-card" style="margin-top: 14px;" aria-labelledby="rule-edit-heading">
    <div class="card-header">
      <div>
        <p class="section-kicker">Automatische Regel bearbeiten</p>
        <h3 id="rule-edit-heading">Wochentage oder Datumsbereiche</h3>
      </div>
      <span class="helper">Nur Core-State-Regeln, kein manueller Skip-, Zeit- oder Profil-Override.</span>
    </div>
    <form class="form-grid" onsubmit={saveRule}>
      <label class="field"><span class="field-label">Technischer Regelcode</span><input bind:value={ruleId} required placeholder="z. B. school_cycle" /></label>
      <label class="field"><span class="field-label">Verständlicher Regelname</span><input bind:value={ruleName} placeholder="z. B. Schulwoche" /></label>
      <label class="field"><span class="field-label">Aktion</span><select bind:value={ruleAction}><option value="wake">Wecken</option><option value="skip">Kein Weckvorgang</option></select></label>
      <label class="field"><span class="field-label">Weckzeit</span><input type="time" bind:value={ruleTime} disabled={ruleAction === "skip"} /></label>
      <label class="field"><span class="field-label">Priorität</span><input type="number" bind:value={rulePriority} min="0" max="1000" /></label>
      <label class="field"><span class="field-label">Wochentage</span><input bind:value={ruleWeekdays} placeholder="0,1,2" /><small>Montag 0 bis Sonntag 6.</small></label>
      <label class="field"><span class="field-label">Gültig ab</span><input type="date" bind:value={ruleDateFrom} /></label>
      <label class="field"><span class="field-label">Gültig bis</span><input type="date" bind:value={ruleDateTo} /></label>
      <div class="field full action-row"><button class="button" type="submit" disabled={pendingCommand !== null || !snapshot.capabilities.edit_rules}><Save size={16} /> Regel speichern</button></div>
    </form>
  </section>
{:else}
  <div class="skeleton" aria-busy="true"></div>
{/if}

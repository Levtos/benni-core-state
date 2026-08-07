<svelte:options runes={true} />

<script lang="ts">
  import { Clock3, ListChecks, Save, Trash2 } from "@lucide/svelte";
  import type { AutomaticRule, Snapshot } from "../lib/contracts";
  import { displayMetric } from "../lib/contracts";

  interface Props {
    snapshot: Snapshot | null;
    pendingCommand: string | null;
    onCommand: (command: string, payload?: Record<string, unknown>) => Promise<void>;
  }

  let { snapshot, pendingCommand, onCommand }: Props = $props();
  let selectedProfile = $state<"weekday" | "weekend">("weekday");
  let wakeTime = $state("07:00");
  let wakeWindow = $state(5);
  let minimumSleep = $state("");
  let provisionalLead = $state("");
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
  }

  $effect(() => {
    if (snapshot?.config.profiles.weekday) loadProfile(selectedProfile);
  });

  function nullableNumber(value: string): number | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  async function saveProfile(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    await onCommand("wake.profile.update", {
      profile_id: selectedProfile,
      values: {
        wake_time: wakeTime,
        wake_window_minutes: Number(wakeWindow),
        minimum_sleep_minutes: nullableNumber(minimumSleep),
        provisional_lead_minutes: nullableNumber(provisionalLead),
      },
    });
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
    <h2>Automatische Wake-Planung</h2>
    <p class="muted">Genau zwei wirksame Profile. Feiertag und Urlaub wählen automatisch das Wochenendprofil.</p>
  </div>
</div>

{#if snapshot?.config}
  <section class="profile-grid" aria-label="Wirksame Wake-Profile">
    {#each Object.values(snapshot.config.profiles) as profile (profile.id)}
      <button
        class="form-card"
        class:active={selectedProfile === profile.id}
        type="button"
        onclick={() => loadProfile(profile.id)}
        aria-pressed={selectedProfile === profile.id}
      >
        <span class="section-kicker">{profile.id === "weekday" ? "Werktagsprofil" : "Wochenendprofil"}</span>
        <h3>{profile.label}</h3>
        <div class="inline-meta">
          <span class="chip cyan"><Clock3 size={14} /> {profile.wake_time}</span>
          <span class="chip">Fenster ±{profile.wake_window_minutes} min</span>
        </div>
        <p class="helper">M {displayMetric(profile.minimum_sleep_minutes, " min")} · A {displayMetric(profile.provisional_lead_minutes, " min")}</p>
      </button>
    {/each}
  </section>

  <section class="form-card" style="margin-top: 14px;" aria-labelledby="profile-edit-heading">
    <div class="card-header">
      <div>
        <p class="section-kicker">Core-State-Command</p>
        <h3 id="profile-edit-heading">{snapshot.config.profiles[selectedProfile].label} bearbeiten</h3>
      </div>
      <span class="chip purple">Keine manuelle Profilumschaltung</span>
    </div>
    <form class="form-grid" onsubmit={saveProfile}>
      <label class="field">
        <span class="field-label">Wake-Zeit</span>
        <input type="time" bind:value={wakeTime} required />
      </label>
      <label class="field">
        <span class="field-label">Wake Window (Minuten)</span>
        <input type="number" min="0" max="120" bind:value={wakeWindow} required />
      </label>
      <label class="field">
        <span class="field-label">M · Mindestschlaf</span>
        <input type="number" min="1" max="1440" bind:value={minimumSleep} placeholder="nicht belegt" />
        <small>Leer bleibt backendseitig fehlend und wird nicht geraten.</small>
      </label>
      <label class="field">
        <span class="field-label">A · Schutzvorlauf</span>
        <input type="number" min="1" max="1440" bind:value={provisionalLead} placeholder="nicht belegt" />
      </label>
      <div class="field full action-row">
        <button class="button" type="submit" disabled={pendingCommand !== null || !snapshot.capabilities.edit_profiles}>
          <Save size={16} /> Profil speichern
        </button>
      </div>
    </form>
  </section>

  <section class="table-card" style="margin-top: 14px;" aria-labelledby="rules-heading">
    <div class="section-header">
      <div>
        <p class="section-kicker">Regelgewinner</p>
        <h3 id="rules-heading">Automatische Regelarten</h3>
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
              <td><strong>{rule.name}</strong><br /><span class="helper">{rule.id}</span></td>
              <td>{rule.priority}</td>
              <td>{rule.weekdays?.length ? `Wochentage: ${rule.weekdays.join(", ")}` : "Datums-/Zyklusregel"}</td>
              <td>{rule.action === "skip" ? "Ohne Wake" : `Wake ${rule.wake_time ?? "—"}`}</td>
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
        <h3 id="rule-edit-heading">Wochentage, Daten oder Zyklen</h3>
      </div>
      <span class="helper">Nur Core-State-Regeln, kein Skip-/Zeit-Override.</span>
    </div>
    <form class="form-grid" onsubmit={saveRule}>
      <label class="field"><span class="field-label">ID</span><input bind:value={ruleId} required placeholder="z. B. school_cycle" /></label>
      <label class="field"><span class="field-label">Name</span><input bind:value={ruleName} placeholder="Verständlicher Name" /></label>
      <label class="field"><span class="field-label">Aktion</span><select bind:value={ruleAction}><option value="wake">Wake</option><option value="skip">Ohne Wake</option></select></label>
      <label class="field"><span class="field-label">Wake-Zeit</span><input type="time" bind:value={ruleTime} disabled={ruleAction === "skip"} /></label>
      <label class="field"><span class="field-label">Priorität</span><input type="number" bind:value={rulePriority} min="0" max="1000" /></label>
      <label class="field"><span class="field-label">Wochentage</span><input bind:value={ruleWeekdays} placeholder="0,1,2" /><small>Montag 0 bis Sonntag 6.</small></label>
      <label class="field"><span class="field-label">Von</span><input type="date" bind:value={ruleDateFrom} /></label>
      <label class="field"><span class="field-label">Bis</span><input type="date" bind:value={ruleDateTo} /></label>
      <div class="field full action-row"><button class="button" type="submit" disabled={pendingCommand !== null || !snapshot.capabilities.edit_rules}><Save size={16} /> Regel speichern</button></div>
    </form>
  </section>
{:else}
  <div class="skeleton" aria-busy="true"></div>
{/if}

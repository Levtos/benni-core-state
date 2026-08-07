<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from "svelte";
  import { Activity, CalendarDays, House, ListChecks, Settings2 } from "@lucide/svelte";
  import { hassStore } from "./main";
  import { createAdapter } from "./lib/adapters";
  import type { DataStatus } from "./lib/contracts";
  import { statusLabel } from "./lib/contracts";
  import { CoreStateStore, type CoreStateViewState } from "./lib/store";
  import CalendarView from "./views/CalendarView.svelte";
  import DiagnosticsView from "./views/DiagnosticsView.svelte";
  import ProfilesRulesView from "./views/ProfilesRulesView.svelte";
  import SettingsView from "./views/SettingsView.svelte";
  import TodayView from "./views/TodayView.svelte";

  type ViewId = "today" | "calendar" | "profiles" | "diagnostics" | "settings";

  const store = new CoreStateStore();
  let viewState: CoreStateViewState = $state(store.state);
  let activeView: ViewId = $state("today");
  let adapterReady: boolean = $state(false);
  let projectionRequested: boolean = $state(false);

  const navigation: Array<{ id: ViewId; label: string }> = [
    { id: "today", label: "Heute" },
    { id: "calendar", label: "Kalender" },
    { id: "profiles", label: "Profile & Regeln" },
    { id: "diagnostics", label: "Diagnose" },
    { id: "settings", label: "Einstellungen" },
  ];

  function selectView(view: ViewId): void {
    activeView = view;
  }

  async function sendCommand(command: string, payload: Record<string, unknown> = {}): Promise<void> {
    await store.command(command, payload);
  }

  $effect(() => {
    if (activeView === "calendar" && adapterReady && !projectionRequested) {
      projectionRequested = true;
      void store.loadProjection();
    }
  });

  onMount(() => {
    const stopState = store.subscribe((next) => {
      viewState = next;
    });
    const stopHass = hassStore.subscribe((hass) => {
      adapterReady = true;
      store.setAdapter(createAdapter(hass));
    });
    return () => {
      stopState();
      stopHass();
      store.dispose();
    };
  });
</script>

<svelte:head>
  <title>Core State</title>
</svelte:head>

<section class="core-state-module" aria-label="Core State">
  <header class="module-header">
    <div>
      <p class="eyebrow">Core State</p>
      <h1>Alltag im Gleichgewicht</h1>
    </div>
    <div class="module-status" data-status={viewState.status} aria-live="polite">
      <span class="status-dot" aria-hidden="true"></span>
      <span>{statusLabel(viewState.status as DataStatus)}</span>
      {#if viewState.snapshot?.version}<span class="contract-version">v{viewState.snapshot.version}</span>{/if}
    </div>
  </header>

  <nav class="module-nav" aria-label="Core-State-Bereiche">
    {#each navigation as item (item.id)}
      <button
        class:active={activeView === item.id}
        class="nav-item"
        type="button"
        aria-current={activeView === item.id ? "page" : undefined}
        onclick={() => selectView(item.id)}
      >
        {#if item.id === "today"}<House size={17} strokeWidth={1.8} />{/if}
        {#if item.id === "calendar"}<CalendarDays size={17} strokeWidth={1.8} />{/if}
        {#if item.id === "profiles"}<ListChecks size={17} strokeWidth={1.8} />{/if}
        {#if item.id === "diagnostics"}<Activity size={17} strokeWidth={1.8} />{/if}
        {#if item.id === "settings"}<Settings2 size={17} strokeWidth={1.8} />{/if}
        <span>{item.label}</span>
      </button>
    {/each}
  </nav>

  {#if viewState.error}
    <div class="inline-error" role="alert">{viewState.error}</div>
  {/if}

  <main class="module-content">
    {#if activeView === "today"}
      <TodayView
        snapshot={viewState.snapshot}
        status={viewState.status}
        pendingCommand={viewState.pendingCommand}
        onCommand={sendCommand}
      />
    {:else if activeView === "calendar"}
      <CalendarView projection={viewState.projection} status={viewState.status} />
    {:else if activeView === "profiles"}
      <ProfilesRulesView
        snapshot={viewState.snapshot}
        pendingCommand={viewState.pendingCommand}
        onCommand={sendCommand}
      />
    {:else if activeView === "diagnostics"}
      <DiagnosticsView snapshot={viewState.snapshot} status={viewState.status} />
    {:else}
      <SettingsView
        snapshot={viewState.snapshot}
        pendingCommand={viewState.pendingCommand}
        onCommand={sendCommand}
      />
    {/if}
  </main>
</section>

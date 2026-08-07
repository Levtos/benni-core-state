<svelte:options runes={true} />

<script lang="ts">
  import { Tooltip } from "bits-ui";
  import type { TimelinePhase } from "../contracts";
  import { displayPhase, formatTime } from "../contracts";

  interface Props {
    phase: TimelinePhase;
  }

  let { phase }: Props = $props();
  const phaseLabel = $derived(displayPhase(phase.id));
  const description = $derived(`${phaseLabel}: ${formatTime(phase.start)}–${formatTime(phase.end)}`);
</script>

<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger
      class={`timeline-phase ${phase.active ? "active" : ""}`}
      type="button"
      style={`flex-grow: ${phase.width_pct};`}
      aria-label={description}
    >
      <span class="timeline-phase-label">{phaseLabel}</span>
      <span class="timeline-phase-time">{formatTime(phase.start)}</span>
    </Tooltip.Trigger>
    <Tooltip.Content class="tooltip" side="top">{description}</Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>

import { readFile } from "node:fs/promises";

const files = [
  "../src/App.svelte",
  "../src/views/TodayView.svelte",
  "../src/views/CalendarView.svelte",
  "../src/views/ProfilesRulesView.svelte",
  "../src/views/DiagnosticsView.svelte",
  "../src/views/SettingsView.svelte",
  "../src/styles.css",
];
const sources = await Promise.all(files.map((file) => readFile(new URL(file, import.meta.url), "utf8")));
const source = sources.join("\n");

for (const marker of [
  'aria-label="Core State"',
  'aria-label="Core-State-Bereiche"',
  'aria-live="polite"',
  'aria-labelledby=',
  "prefers-reduced-motion",
  "min-height: 44px",
  "focus-visible",
]) {
  if (!source.includes(marker)) throw new Error(`Accessibility marker missing: ${marker}`);
}

const buttonsWithoutType = source.match(/<button(?![^>]*\btype=)[^>]*>/g) ?? [];
if (buttonsWithoutType.length) throw new Error("Every button needs an explicit type.");
console.log("Core-State accessibility markers: ok");

import { readFile } from "node:fs/promises";

const adapter = await readFile(new URL("../src/lib/adapters.ts", import.meta.url), "utf8");
for (const marker of [
  '"benni_core_state/ux_snapshot"',
  '"benni_core_state/ux_projection"',
  '"benni_core_state/ux_command"',
  '"/api/benni_core_state/snapshot"',
  '"/api/benni_core_state/commands"',
]) {
  if (!adapter.includes(marker)) throw new Error(`Adapter route missing: ${marker}`);
}
for (const forbidden of ["wake_planner/", "callService", "benni_core_state/get_status"]) {
  if (adapter.includes(forbidden)) throw new Error(`Legacy browser route found: ${forbidden}`);
}
console.log("Core-State adapter links: ok");

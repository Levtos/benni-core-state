import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/lib/contracts.ts", import.meta.url), "utf8");
const required = [
  '"benni_core_state.snapshot"',
  '"benni_core_state.projection"',
  '"benni_core_state.command_ack"',
  '"loading"',
  '"blocked"',
  '"provisional_sleep"',
  '"waking"',
];
const missing = required.filter((value) => !source.includes(value));
if (missing.length) {
  throw new Error(`Contract markers missing: ${missing.join(", ")}`);
}
console.log("Core-State browser contract markers: ok");

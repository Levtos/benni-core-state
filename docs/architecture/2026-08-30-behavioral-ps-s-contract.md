# Behavioral PS -> S contract

- Status: implemented for technical testing; not released, installed, or live verified
- Date: 2026-08-30
- Tracking: [Levtos/benni-core-state#59](https://github.com/Levtos/benni-core-state/issues/59)
- Contract version: `2.0.0`

## Ownership

Core State owns the Bio-/Activity lifecycle, sleep provenance, confirmation
status, and Wake evidence. Media Apply remains the only owner of TV actuation,
the absolute 45-minute deadline, physical extension, and continuous TV-off
confirmation. Media Policy and Light Policy consume PS/S as a sleep context.
Core State never calls a TV, HomePod, or light service.

## Behavioral lifecycle

`awake -> provisional_sleep` is admitted only at home in `early_night` or
`late_night`, with a canonically active TV and canonically inactive PC, PS5,
and Switch. Every required input is tri-state: unknown or unavailable blocks
the transition. The same decision runs on every input update and phase change,
so a TV already active at the night boundary and devices becoming inactive
during the night are covered without a second timer.

Media Apply publishes versioned TV evidence. Core accepts
`off_confirmed` only while Bio is PS and only when its
`sleep_reference_start` exactly matches the current lifecycle reference.
Ten continuous minutes of confirmed canonical TV-off then produce:

- `bio_state=sleep`
- `sleep_source=inferred_tv_off`
- `sleep_confirmed=false`
- `inferred_tv_off_at=<evidence timestamp>`

Manual Sleep remains immediate and produces `sleep_source=manual` and
`sleep_confirmed=true`. PS and inferred S use the regular wake time directly;
only confirmed S can participate in a future minimum-sleep calculation.

## Activity and Wake

PS/S with a canonically active TV publishes `activity_state=entertainment`.
PS/S without an active TV publishes `sleep`. TV, light, motion, HomePods, and
generic media state are never Wake evidence.

Fresh rising edges after `sleep_reference_start` from PC, active PS5, active
Switch, coffee, shower/water heater, and entry-door open/unlock are strong
phase-independent Wake evidence. Canonical device contracts retain their
existing standby thresholds, debounce, and hysteresis. Opening-Master window or
patio-door changes are blocked in `early_night`/`late_night` and admitted
from `early_morning`. Restored levels without a persisted edge timestamp are
not fabricated as new actions.

## Persistence and diagnostics

Core storage includes sleep provenance/reference, inferred timestamp, last
observed strong-signal levels, their rising-edge timestamps, and Opening-Master
levels. Bio attributes expose the contract version, complete PS entry decision,
input values/quality, Wake decision, and the consumed Media-Apply evidence.
Media Apply separately persists deadline/off-confirmation state and reconciles
it against current canonical TV truth after restart.

The old schedule-derived PS corridor is no longer an entry source. Its planning
data remains diagnostic/compatibility input, while `provisional_active` cannot
create PS under this contract.

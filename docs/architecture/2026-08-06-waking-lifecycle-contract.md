# Core State: waking lifecycle and wake-input inventory

- Status: implemented for technical testing; no consumer cutover or live proof
- Date: 2026-08-06
- Tracking: [Levtos/benni-core-state#28](https://github.com/Levtos/benni-core-state/issues/28)
- Depends on: [Phase-1 provisional-sleep contract](2026-08-06-provisional-sleep-contract.md)

## Lifecycle decision

`waking` begins at the calculated Core-State wake start from confirmed
`sleep` or `provisional_sleep`. It ends at the first valid regular wake
interaction or after 30 elapsed minutes, whichever occurs first. The start
timestamp is persisted and restored across a Home Assistant restart.

A day-phase change, Media state or Light state cannot complete `waking`.
Core State only publishes the Bio truth and owner-local diagnostics; Consumer
actuation and cutover remain separate.

## Inventoried Phase-1 wake inputs

| Input | Source slot | Class | Required edge/freshness | Context exception | State effect |
| --- | --- | --- | --- | --- | --- |
| Coffee | `coffee_active` | strong | active after the current sleep/provisional reference | ignored in early/late night | completes `sleep`, `provisional_sleep` or `waking` to `awake` |
| Door | `door_wake` | strong | active after the current sleep/provisional reference | ignored in early/late night | completes to `awake` |
| PC | `pc_active` | soft | active after the current sleep/provisional reference | ignored in early/late night | completes to `awake` |
| PS5 | `ps5_active` | soft | active after the current sleep/provisional reference | ignored in early/late night | completes to `awake` |
| Home-office ping | `homeoffice_ping` | collected only | none | not a Phase-1 wake signal | no Bio effect |
| Presence departure | Core-State Presence | physical invariant | definite `abwesend` | no day-phase gate | completes any non-awake Bio state to `awake` |
| Calculated wake start | internal E/L/M/A contract | scheduled | deterministic time edge | hard L remains binding | `sleep/provisional_sleep -> waking` |
| Waking timeout | internal persisted timer | lifecycle | 30 elapsed minutes | restart-safe | `waking -> awake` |

Strong and soft retain the existing ordering vocabulary, but both are valid
completion signals once their existing freshness and phase gates pass. Repeated
level signals do not create another transition after `awake`.

## Diagnostics

The Bio-State attributes expose the persisted waking start, timeout duration,
calculated timeout timestamp and one of the bounded transition reasons:
`calculated_wake_start`, `hard_l_wake_start`,
`regular_wake_interaction`, `presence_departure`, `waking_timeout`,
`waking_start_recovered_after_restart`, or a steady-state reason.

The nested `wake_interaction` diagnostic is a pure decision projection. It
reports the selected source, `signal_strength` (`strong`/`soft`), deterministic
priority (coffee 4, door 3, PC 2, PS5 1), freshness, the current
sleep/provisional reference, valid and suppressed candidates, and a bounded
`rejection_reason` such as `no_active_signal`, `day_phase_blocked`, or
`before_reference`. If a source has no usable active edge, its freshness is
reported as `unknown` while the existing level-signal compatibility behavior is
preserved. Signals with a known active edge at or before the current reference
cannot complete the lifecycle.

No `inferred_sleep`, visitor/friends signal, TV-only signal, music-only
signal, Consumer action, release, deployment or live change is introduced.

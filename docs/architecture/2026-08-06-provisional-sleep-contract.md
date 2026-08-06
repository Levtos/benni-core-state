# Core State: Phase-1 provisional-sleep contract

- Status: implemented for technical testing; no consumer cutover or live proof
- Date: 2026-08-06
- Tracking: [Levtos/benni-core-state#27](https://github.com/Levtos/benni-core-state/issues/27)
- Source decision: [2026-08-02 Core-State decision delta](2026-08-02-core-state-decision-delta.md)

## Decision

Core State publishes `provisional_sleep` as a value of the existing Bio-State
entity. It is a protection corridor, never confirmed sleep, never
`inferred_sleep`, and never creates or satisfies a minimum-sleep timestamp.

The internal sleep-window contract calculates:

```text
E = scheduled wake - configured wake window
L = scheduled wake + configured wake window
M = configured minimum confirmed sleep
A = configured provisional lead

provisional_start = E - A
minimum_reached_at = manual_sleep_start + M
effective_earliest = max(E, minimum_reached_at)
actual_wake_start = min(effective_earliest, L)
```

Without confirmed manual sleep, `actual_wake_start` is E. With confirmed sleep,
M may move it inside `[E, L]`; L always remains hard and an unmet minimum is
diagnosed. Missing or invalid M/A values are visible and are not guessed.

## Runtime boundary

- The internal Core-State wake plan is evaluated before Bio.
- A configured E/L/M/A plan may enter `awake -> provisional_sleep`.
- Manual `mark_sleep` changes the state to confirmed `sleep` and owns the
  real sleep-start timestamp.
- The calculated wake start changes either `sleep` or `provisional_sleep`
  to `waking`.
- While the internal contract is unavailable, the pre-existing legacy
  `wake_needed` input remains an explicit compatibility fallback.
- No Media, Light, notification, timer, release, deployment or live change is
  performed here.

M and A are persisted through
`benni_core_state.configure_sleep_window`. E and L remain outputs of the
internal automatic wake plan. The full 30-minute waking lifecycle and consumer
cutovers remain separate gates.

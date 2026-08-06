# Core-State Startup-/Apply-Readiness

Issue: [#33](https://github.com/Levtos/benni-core-state/issues/33)

## Contract

Core State publishes the read-only, process-wide entity
`binary_sensor.benni_core_state_apply_ready`. The versioned mapping key is
`apply_ready`; the mapping records owner, lifecycle source, status, reason,
legacy resolution, cutover and rollback information. The target contains no
`system_` prefix.

The contract represents only the Home Assistant process lifecycle. It does not
read or calculate `apply_enabled`, Lux, Manual-Off, source health, or any
policy decision. A consumer may therefore expose a calculated plan while
keeping its own Apply operation blocked until this entity is `on`.

## Lifecycle

1. Before `EVENT_HOMEASSISTANT_STARTED`, the entity is available and `off`.
2. The first HA-start signal records a monotonic start point and starts the
   default 90-second timer.
3. At the exact boundary the state changes once to `on`; duplicate STARTED
   events are ignored.
4. `ready_at`, `startup_started_at`, `startup_delay`, `startup_phase`,
   `startup_elapsed_s`, `reason`, and `transition_count` are diagnostic
   attributes.

The runtime is stored outside the config-entry coordinator bucket in
`hass.data[DOMAIN]`. Unloading and reloading the Core-State config entry
recreates the entity only; it does not recreate the process timer or reset an
already reached Ready state. A Core-State load after Home Assistant is already
running is treated as a late load and becomes ready immediately, with an
explicit diagnostic reason because Home Assistant does not expose the original
process start timestamp to a late-loaded integration.

A complete Home Assistant restart creates a new `hass.data` runtime and starts
the contract from `off` again. The old YAML helper and automation are not
written by Core State and remain a separate migration concern until every
consumer has been cut over.

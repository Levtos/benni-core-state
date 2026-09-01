# Eltern profile household-presence decision

- Status: implemented for technical testing; not installed or live verified
- Date: 2026-09-02
- Tracking: [Levtos/benni-core-state#62](https://github.com/Levtos/benni-core-state/issues/62)

## Decision

The `eltern` profile represents one logical household, not two people. It keeps
the existing single Config Entry, one coordinator, one Bio/Wake/Activity state,
one public entity set and the existing per-entry storage namespaces.

The historically named `gps_primary` and `gps_secondary` slots are equal
household-presence evidence only in this profile:

- any fresh, usable `home` value makes the household `zuhause`;
- if no source is home, every currently usable source is away evidence;
- when only one source is usable, that source decides;
- missing, stale, `unknown` or `unavailable` values do not assert away;
- if neither source is usable, the restart-safe previous state is retained.

The existing `presence_personal` public name and values remain unchanged for
compatibility. In the parents profile it describes the shared household state
and does not identify an individual. Benni's primary/fallback, SSID, own-WLAN
and `bei_eltern` rules are unchanged.

## Band and preheat

For `eltern`, confirmed household home always forces band `home`. Confirmed
household away without a usable proximity value produces `far`, even when the
previous band was closer. Unknown/stale tracker gaps still retain the previous
personal state and therefore do not fabricate this transition.

The existing single proximity distance/direction pair is the household-level
input. It can be bound to Home Assistant's documented
[nearest-distance and nearest-direction sensors](https://www.home-assistant.io/integrations/proximity/)
for a Proximity configuration that tracks both mobile sources. That keeps the
existing near/preheat/transition implementation and allows the nearest reliably
approaching source to activate the shared preheat path. No per-person state or
second Core-State implementation is introduced.

Optional Benni-era household occupancy inputs are ignored by the `eltern`
profile so they cannot silently become a third presence source. The same
boundary disables Benni's activity-based assumed-home overlay for this profile:
shared media or device activity may still determine `activity_state`, but it
cannot overrule confirmed household-away evidence.

## Compatibility boundary

There is no Config-Entry migration, entity rename, new public entity, Unique-ID
change or storage-key change. The `benni` profile remains the default and uses
its existing computation path. Installation and behavioral verification on the
parents Home Assistant instance remain Benni's separate Live gate.

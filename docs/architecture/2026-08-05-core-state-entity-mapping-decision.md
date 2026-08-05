# Entscheidungsnotiz: kanonische Core-State-Mappings

**Version:** 1.0.0
**Datum:** 2026-08-05
**Issue:** [Levtos/benni-core-state#25](https://github.com/Levtos/benni-core-state/issues/25)
**Agent:** agent:codex
**Basis:** GitHub main bei cd1db2fd0670c2695a653db1bbdb5eb7648bb6d0

## Beobachtung

Die aktuelle Core-State-Basis veröffentlicht bereits clean benni_core_state-Entities,
verwendet aber in Eingangs- und Diagnosepfaden belegte Old-/system_-Referenzen.
Wake Planner liefert vier automatische Outputs: wake_state, next_wake,
wake_needed und holiday_active. Das vollständige Ist-Inventar steht in
[ha_wake_planner#34](https://github.com/Levtos/ha_wake_planner/issues/34) und
[PR #36](https://github.com/Levtos/ha_wake_planner/pull/36).

## Belegter Ist-Zustand

- Der korrigierte Neun-Phasen-Vertrag kommt aus
  [Core State #24](https://github.com/Levtos/benni-core-state/issues/24) und dem
  ungemergten [PR #30](https://github.com/Levtos/benni-core-state/pull/30).
- Die Basis dieses Issues enthält deshalb noch den alten Runtime-Day-State; #25
  überschreibt #24 nicht.
- wake_needed ist ein inklusives Wake-Fenster-Boolean, kein Bio- oder
  waking-Signal.
- #34 implementiert kein provisional_sleep, inferred_sleep, waking und kein
  Core-State-Bio-Modell.
- Media State bleibt Media-Fakten-Owner; Core State leitet den Activity-Kontext
  aus dem neutralen Feed ab.

## Entschiedener Soll-Zustand

- Zielpfade verwenden sensor.benni_core_state_* beziehungsweise
  binary_sensor.benni_core_state_*; system_ ist ausschließlich als belegte
  aktuelle oder Legacy-Quelle dokumentiert.
- unique_id folgt benni_core_state_<entry_id>_<entity_suffix>.
- provisional_sleep und waking gehören zum bestehenden Bio-State-Vertrag und
  erzeugen keine zusätzlichen veröffentlichten States in #25.
- Wake-Outputs erhalten reservierte clean Zielmappings, werden aber erst in #26
  berechnet und registriert.
- Holiday wird als Wake-Context/Output getrennt von automatic_day_profile
  dokumentiert; vacation erhält mangels belegter eigener Old-Semantik noch keine
  öffentliche Entity.
- automatic_day_profile hat ausschließlich weekday und weekend; Feiertag oder
  Urlaub am Werktag projiziert auf weekend, Samstag ist weekend.
- Der Day-State-Zielvertrag enthält exakt early_night, late_night,
  early_morning, forenoon, midday, afternoon, late_afternoon, evening und
  late_evening. late_morning und early_evening sind keine Zielwerte und keine
  Aliase.
- Owner-lokale Diagnosezeilen enthalten source, target, status und reason.

## Umsetzung

- mapping.py enthält den versionierten Contract, die deklarative Mapping-Registry,
  explizite Legacy-Auflösung, unbekanntes/undecided-Fail-loud-Verhalten und die
  Diagnosezeilen.
- Die vorhandene PC-Config-Kompatibilität bleibt bestehen, wird aber explizit
  aufgelöst und geloggt.
- Der bestehende live_status-Attributpfad erhält Mapping-Version und
  mapping_diagnostics additiv.
- Es gibt keine Registry-Mutation, keinen Consumer-Cutover, keine HA-Aktion,
  keinen neuen Combined-Output und keine #26-Implementierung.
- Die vollständige Tabelle, Legacy-Klassifikation und Consumer-Allowlist steht
  in [2026-08-05-core-state-entity-mapping.md](https://github.com/Levtos/benni-core-state/blob/agent/core-state-entity-mappings/docs/architecture/2026-08-05-core-state-entity-mapping.md).

## Tests

Fokussiert ergänzt:
tests/test_mapping_contract.py

Geprüft werden kanonische IDs ohne system_, Domains, unique_id-Templates,
Zustände, Attribute, die neun Day-State-Werte, explizite Legacy-Auflösung sowie
unbekannte und unentschiedene Mapping-Schlüssel.

## Risiken und offene Gates

- PR #30 und PR #36 bleiben Draft und ungemergt.
- Der Runtime-Day-State muss nach dem separaten #24-Gate aktualisiert werden.
- #26 muss Wake-/Holiday-/Vacation-Source, Quality, Reason, Timestamp und
  Shadow-Parität implementieren.
- Consumer-Repositories bleiben unverändert; ihre Rebinds sind durch die
  Allowlist und die jeweiligen Issues gated.
- Testing/Tests Pass ist weder Merge noch Live, Live Verified, Cutover, Release
  oder Entfernung des alten Wake Planners.

Die verbindliche Governance-Quelle bleibt
[ADR 0002](https://github.com/Levtos/control/blob/main/docs/adr/0002-github-only-governance.md)
mit den [versionierten Regeln unter control/docs](https://github.com/Levtos/control/tree/main/docs).

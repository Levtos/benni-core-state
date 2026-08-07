# Activity-State-Consumer-Inventar

**Stand:** 2026-08-07
**Issue:** [benni-core-state#29](https://github.com/Levtos/benni-core-state/issues/29)
**Scope:** Bestandsaufnahme; keine Consumer-Änderung und kein Cutover.

Die Tabelle trennt den neuen Core-State-Owner vom aktuellen Consumer-Bestand.
Die Pfade und Entity-IDs wurden gegen die lokalen Repositories geprüft; die
verlinkten GitHub-Issues sind die jeweiligen nachgelagerten Arbeits-/Gate-
Schnitte. Kein Consumer wird in #29 geändert.

| Repository | Aktueller Bezug | Zielquelle nach separatem Gate | Status / Hinweis |
|---|---|---|---|
| `Levtos/benni-core-state` | `sensor.benni_core_state_activity_state`; `logic.compute_activity_decision` | bleibt kanonischer Owner | #29 implementiert nur diesen Owner und seine Diagnose. |
| `Levtos/benni_media_state` | `sensor.benni_media_state_activity_context` (historisch auch `sensor.system_benni_media_state_activity_context`) | bleibt neutraler Feed für Core State | Feed liest keinen Core-State-Activity-State; Feed-Contract ist in dessen `tests/test_activity_context.py` zyklusfrei getestet. |
| `Levtos/benni_media_policy` | `custom_components/benni_media_policy/const.py` bindet `sensor.benni_core_state_activity_state`; `logic.py` führt den Wert als Boost-/Kontext-Eingang | kanonische Core-State-Entity plus Decision-Diagnose | Kein Cutover in #29; Wake-Schnitt separat in [#28](https://github.com/Levtos/benni_media_policy/issues/28), bestehender TV-Bug in [#22](https://github.com/Levtos/benni_media_policy/issues/22). |
| `Levtos/benni_light_policy` | `const.py`/`coordinator.py` verwenden aktuell `sensor.benni_combined_context_activity_state` als Activity-Binding | `sensor.benni_core_state_activity_state` nach Allowlist/Shadow/Live-Gate | Nachgelagerter Consumer-Schnitt [#22](https://github.com/Levtos/benni_light_policy/issues/22); #29 ändert kein Light-Repository. |
| `Levtos/benni_blind_policy` | Im lokalen `main` kein aktiver Activity-State-Read gefunden; der fachliche Consumer-Schnitt ist dokumentiert | Core-State-Activity als einheitlicher Policy-/UX-Eingang | [#10](https://github.com/Levtos/benni_blind_policy/issues/10) verlangt Roh-/Effektivwert und stale/degraded-Verhalten; keine Umsetzung in #29. |
| `Levtos/benni_climate_policy` | `const.py`, `integration_contracts.py` und `context_resolver.py` binden aktuell `sensor.benni_combined_context_activity_state` | kanonische Core-State-Entity nach eigenem Contract-Gate | Climate-Contract-Inventar/Cutover sind separat in [#24](https://github.com/Levtos/benni_climate_policy/issues/24) und [#26](https://github.com/Levtos/benni_climate_policy/issues/26). |
| `Levtos/plug_policy_engine` | Defaults und Suggestions referenzieren `sensor.benni_combined_context_activity_state`; zusätzlich existieren Core-State-Vorschläge | Core State direkt, Media-State-Fakten separat | Nur Inventar; kein Repointing oder Policy-Cutover in #29. |
| `Levtos/benni_notification_router` | `coordinator.py` liest einen konfigurierten Activity-State; Routing nutzt u. a. `work_home` und `private_time` | kanonische Core-State-Entity plus Qualitätsdiagnose | Consumer muss `work_away`-Kompatibilität und stale/degraded-Verhalten separat prüfen; keine Änderung in #29. |
| `Levtos/benni_media_context` | Legacy-Integration liest `activity_state` als Eingang für Quiet-/Context-Echos | späterer Legacy-Retirement-/Rebind-Schnitt | Keine neue Abhängigkeit; kein Cutover in #29. |
| `Levtos/benni-core-devices` | historische Dokumentation referenziert `sensor.benni_combined_context_activity_state` | kein neuer Combined-/Atomic-Zielpfad | Legacy-Dokumentations-/Retirement-Kontext; keine Änderung in #29. |

## Gate-Reihenfolge

1. #29: Core-State-Entscheidungsvertrag und owner-lokale Diagnose.
2. Je Consumer: eigene Allowlist, Shadow-/Parity-Nachweis, PR und technische
   Tests; keine implizite Rebind-Annahme aus diesem Inventar.
3. Je Consumer: separates Cutover-/Rollback-Gate und danach Benni's Live-/Live-
   Verified-Gate.

Die Aktivitätsberechnung bleibt damit genau einmal in Core State. Consumer dürfen
die Entscheidung verwenden, aber keine parallele Activity-Wahrheit oder Media-
Rohdetektion aufbauen.

# Core-State Entity-Mapping-Vertrag

**Version:** 1.5.0
**Stand:** 2026-08-07
**Repository:** Levtos/benni-core-state
**Issue-Agent:** agent:codex
**Issue:** [Levtos/benni-core-state#25](https://github.com/Levtos/benni-core-state/issues/25)
**Verifizierte Basis:** GitHub-Default-Branch main, 21a0f070cb42db7f510045d84e9dde060dfbc8e7
**Vertragsschlüssel:** MAPPING_CONTRACT_VERSION = "1.5.0"

Dieses Dokument legt die kanonischen Core-State-Mappings, Legacy-Klassifikationen
und die owner-lokale Diagnoseform fest. Die #26-Umsetzung veröffentlicht die
reservierten Wake-Targets additiv als Shadow; sie bindet keinen Consumer um.
Der bestehende Bio-State-Vertrag enthält seit #27 den Schutzkorridor
`provisional_sleep` und seit #28 den restart-sicheren `waking`-Lifecycle; beide
Werte bleiben Attribute beziehungsweise Werte des bestehenden Bio-State-Contracts.

## Quellen und Entscheidungsgrenze

- [ADR 0002 – GitHub-only Governance](https://github.com/Levtos/control/blob/main/docs/adr/0002-github-only-governance.md)
  und die [versionierten Control-Regeln](https://github.com/Levtos/control/tree/main/docs);
- [Levtos/control#30](https://github.com/Levtos/control/issues/30);
- [Levtos/benni-core-state#21](https://github.com/Levtos/benni-core-state/issues/21);
- [Levtos/benni-core-state#24](https://github.com/Levtos/benni-core-state/issues/24) und der
  gemergte [PR #30](https://github.com/Levtos/benni-core-state/pull/30),
  Merge-SHA 26c63c177dd40ca8cfffe85d4c1b3cdc99f4db07;
- [Levtos/ha_wake_planner#34](https://github.com/Levtos/ha_wake_planner/issues/34),
  der ungemergte [Draft-PR #36](https://github.com/Levtos/ha_wake_planner/pull/36)
  und das [Wake-Planner-Inventar](https://github.com/Levtos/ha_wake_planner/blob/agent/ha-wake-planner-34-inventory/docs/wake_planner_inventory_migration_contract.md);
- [Levtos/benni-core-state#26](https://github.com/Levtos/benni-core-state/issues/26),
  das erst nach diesem Mapping den internen Wake-Shadow implementiert;
- die reviewed Lastenhefte für [Context State](https://github.com/Levtos/einhornzentrale/blob/main/docs/lastenhefte/reviewed/context_state/lastenheft.md),
  [Day State](https://github.com/Levtos/einhornzentrale/blob/main/docs/lastenhefte/reviewed/day_state/lastenheft.md)
  und [Day Context](https://github.com/Levtos/einhornzentrale/blob/main/docs/lastenhefte/reviewed/day_context/lastenheft.md).

#24 ist fachlich maßgeblich und der korrigierte Runtime-Stand aus PR #30 ist in
der verifizierten Basis enthalten. Die neun Phasen werden datumsermittelt
berechnet; ein Solar-Noon-Pfad gehört nicht mehr zum Runtime-Contract.

## Kanonische Benennung und unique_id

Für die Route Benni gelten als konkrete kanonische Ziel-IDs:

- Sensor: sensor.benni_core_state_<mapping_key>;
- Binary Sensor: binary_sensor.benni_core_state_<mapping_key>;
- Eltern-Route: derselbe Contract mit eltern_core_state statt
  benni_core_state.

Die stabilen IDs folgen der bereits veröffentlichten Integration-Konvention:

~~~text
benni_core_state_<entry_id>_<entity_suffix>
~~~

entry_id bleibt die Config-Entry-Identität; entity_suffix ist der explizite
Mapping-Schlüssel. Für noch nicht registrierte Ziel-Outputs ist diese Form nur
reserviert und wird in #25 nicht in die Entity Registry geschrieben.

Kein Wert in der Spalte kanonische Entity-ID oder im ID-Pattern beginnt mit
system_. Ein system_-Wert in aktuelle Quelle oder Legacy-Referenz ist eine
belegte Ist-/Alt-Referenz und kein neuer Zielpfad.

## Statuswerte

| Status | Bedeutung |
|---|---|
| canonical_current | Bereits veröffentlichte Core-State-Entity mit clean ID. |
| canonical_target | Kanonische Zielwerte/ID sind beschlossen, der technische Stand liegt noch in einem ungemergten Vorgänger-PR. |
| attribute_only | Der Fakt wird als Wert oder Attribut eines bestehenden Contracts geführt; keine zusätzliche Entity. |
| planned | Mapping ist beschlossen, die Implementierung folgt in einem nachgelagerten Issue. |
| undecided | Quelle, Owner oder öffentliche Entity ist nicht entschieden; es gibt keinen geratenen Zielwert. |

## Versionierte Mapping-Tabelle

Die Tabelle zeigt konkrete IDs für die Benni-Route. — bedeutet absichtlich
„keine öffentliche Entity in #25“, nicht „Alias suchen“.

| Mapping-Schlüssel | Fachlicher Contract/Fakt | Kanonische Entity-ID | Domain | Stabile unique_id | Erlaubte Zustände | Attribute | Fachlicher Owner | Aktuelle Quelle | Legacy-Entity oder Legacy-Referenz | Legacy-Auflösung | Status | reason | Geplanter Cutover | Rollback-Verhalten | Verlinktes Consumer-Issue |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| bio_state | Bio-State | sensor.benni_core_state_bio_state | sensor | benni_core_state_<entry_id>_bio_state | sleep, provisional_sleep, waking, awake | last_sleep_start, last_provisional_sleep_start, last_awake_start, last_waking_start, sleep_window, wake_interaction, indicator_* | Core State, L1 | internal:coordinator.compute_bio_state; internal:core_state.sleep_window | sensor.benni_context_bio_state; sensor.benni_combined_context_bio_state | Mirror/Toolbox erst nach Consumer-Gate ersetzen; keine neue Combined-Entity | canonical_current | Core State ist die einzige Bio-Wahrheit; `provisional_sleep` ist ein Schutzstatus und `waking` folgt dem restart-sicheren Lifecycle. | Kein Rebind in #25; spätere Consumer-Issues verwenden den clean Bio-State. | Aktuellen Bio-State und alle alten Referenzen behalten. | [Core State#25](https://github.com/Levtos/benni-core-state/issues/25) |
| provisional_sleep | Rechnerischer Schutzkorridor, nicht bestätigter Schlaf | sensor.benni_core_state_bio_state | sensor | benni_core_state_<entry_id>_bio_state | sleep, provisional_sleep, waking, awake | last_provisional_sleep_start, sleep_window, reason, source | Core State, L1; Umsetzung #27 | internal:core_state.sleep_window; internal:coordinator.compute_bio_state | — | kein Alias, keine eigene Entity und keine Veröffentlichung im Wake Planner | canonical_current | #27 veröffentlicht `provisional_sleep` additiv im bestehenden Bio-State; es schreibt keinen bestätigten Schlaf gut und bleibt ein Schutzstatus. | Consumer-Rebind bleibt ein separates Shadow-/Cutover-Gate. | Bio-Consumer bleiben bis zu ihrem eigenen Cutover auf den bisherigen Quellen; keine Legacy-Entity wird entfernt. | [Core State#27](https://github.com/Levtos/benni-core-state/issues/27) |
| waking | Bio-State-Wert im späteren Lifecycle | sensor.benni_core_state_bio_state | sensor | benni_core_state_<entry_id>_bio_state | sleep, provisional_sleep, waking, awake | last_waking_start, waking_timeout_minutes, waking_timeout_at, reason, wake_interaction | Core State, L1; Lifecycle #28 | internal:coordinator.compute_bio_state | — | Kein separater Rebind; Consumers lesen den bestehenden Bio-State | attribute_only | #28 beendet `waking` durch die erste reguläre Wachinteraktion oder spätestens nach 30 Minuten; der Übergang ist restart-sicher und idempotent. | Kein eigener Rebind; spätere Consumer-Gates verwenden sensor.*_core_state_bio_state. | Kein separater waking-Sensor; aktuelle Bio-Entity bleibt aktiv. | [Core State#28](https://github.com/Levtos/benni-core-state/issues/28) |
| activity_state | Kanonischer, diagnostizierter Gesamt-Activity-State | sensor.benni_core_state_activity_state | sensor | benni_core_state_<entry_id>_activity_state | sleep, waking, private_time, gaming, entertainment, music, work_home, household, pc_active, free_time, idle; Legacy work_away bleibt erlaubt | activity_reason, activity_decision, media_activity_context, media_activity_source, media_activity_feed_quality, pc_active | Core State, L1; Media State nur qualitätsgeprüfter Feed-Owner | internal:logic.compute_activity_decision; sensor.system_benni_media_state_activity_context als neutraler Media-Feed | sensor.benni_combined_context_activity_state | Consumer-Rebind erst nach eigener Allowlist; system_-Feed bleibt kompatible Ist-Referenz, unbekannte/stale/degraded Feedwerte gewinnen nicht | canonical_current | Core State entscheidet exakt nach sleep > waking > private_time > gaming > entertainment > music > work_home > household > pc_active > free_time > idle. Gewinner, Kandidaten, Quellen, Freshness, Qualität, Fallback und Zeitpunkt stehen in activity_decision. Keine Media-Rohwerte und kein Zyklus. | Consumer-Rebind erst über #29 und jeweilige Consumer-Freigabe. | Media State bleibt Feed-Owner; bei degradiertem Feed fällt Core State deterministisch auf eine niedrigere gültige lokale Aktivität beziehungsweise idle zurück. | [Core State#29](https://github.com/Levtos/benni-core-state/issues/29) |
| day_state | Neun datumsermittelte Tagesphasen | sensor.benni_core_state_day_state | sensor | benni_core_state_<entry_id>_day_state | early_night, late_night, early_morning, forenoon, midday, afternoon, late_afternoon, evening, late_evening | phase_starts, source | Core State, L1 | runtime:const.DAY_STATES/runtime:logic.compute_day_state; kein Solar-Noon-Input | sensor.benni_combined_context_day_state; sensor.benni_core_day_state; sensor.lights_dayphase | Nach #24-/Consumer-Gates als kanonische Quelle verwenden; keine versteckten alten Phasen-Aliase | canonical_current | Die korrigierte #24-Liste ist die einzige Zielwertliste und ist in main implementiert. | Consumer-Allowlist und jeweilige Live-Gates; #25 ändert den Runtime-Pfad nicht. | Aktuellen neunphasigen Code behalten; Legacy-Consumer bleiben bis Gate. | [Core State#24](https://github.com/Levtos/benni-core-state/issues/24) / [Core State#25](https://github.com/Levtos/benni-core-state/issues/25) |
| wake_state | Wake-Entscheidung / Plan-State | sensor.benni_core_state_wake_state | sensor | benni_core_state_<entry_id>_wake_state | scheduled, skipped, overridden, holiday, inactive | Wake-Zeit, decided_by, reason, Holiday-Name, Skip/Override, next_wake, Fenster, Regel-/Konfliktfelder | Core State, L1; Berechnung #26 | sensor.wake_planner_benni_wake_state | dieselbe Old-Entity, Old-unique_id, WakeDecision | Temporär weiterverwenden; erst nach Shadow-/Cutover-Gate ersetzen | planned | #34 belegt genau diese fünf Old-Werte; sie sind keine Bio-/waking-Semantik. | Nach #26, control#27/#28, Consumer-Allowlist und Bennis Live-Gate. | Old Planner, Config, Store, Entity, Service und Eventpfad bleiben aktivierbar. | [Core State#26](https://github.com/Levtos/benni-core-state/issues/26) |
| next_wake | Nächster geplanter Wake-Zeitpunkt | sensor.benni_core_state_next_wake | sensor | benni_core_state_<entry_id>_next_wake | timezone-aware Timestamp oder None | Old-Decision-Attribute, Fenster, reason, Regel-ID | Core State, L1; Berechnung #26 | sensor.wake_planner_benni_next_wake; 30-Tage-Suche | Old Timestamp-Sensor und Preview/WS-Ausgabe | Old-Ausgabe bleibt bis Timestamp-/Timezone-Parität; kein Rebind in #25 | planned | #34 belegt 30-Tage-Horizont und lokale Zeitsemantik, nicht die neue Runtime. | Nach #26-Parität und control-/Consumer-Gates. | Old Next-Wake und 30-Tage-Suche bleiben Rückfallebene. | [Core State#26](https://github.com/Levtos/benni-core-state/issues/26) |
| wake_needed | Boolean innerhalb des Wake-Fensters | binary_sensor.benni_core_state_wake_needed | binary_sensor | benni_core_state_<entry_id>_wake_needed | on, off | Fenstergrenzen, Wake-Zeit, Wake-State, reason | Core State, L1; Berechnung #26 | binary_sensor.wake_planner_benni_wake_needed | Old Binary Sensor, Device-Class running | Temporär; nicht als Bio-/waking-Signal umdeuten | planned | #34 definiert wake_needed als Zeitfenster-Boolean für scheduled/overridden. | Nach #26-Fensterparität und Media-/Light-Cutover-Gates. | Old Binary Sensor bleibt unverändert aktiv. | [Media Policy#28](https://github.com/Levtos/benni_media_policy/issues/28) |
| holiday | Feiertag als Wake-Input/Context | binary_sensor.benni_core_state_holiday_active als geplanter Output; kein eigener Holiday-Sensor | binary_sensor | benni_core_state_<entry_id>_holiday_active | on, off | Holiday-Name, Quelle, Quality, reason | Core State, L1; Source-/Quality-Contract vor #26 | konfigurierte holiday_sensor-Quelle plus Old holiday_source.py | binary_sensor.wake_planner_benni_holiday_active und Holiday-Map | Old-Quelle/Output bleibt; keine neue Holiday-ID in #25 | planned | Feiertag und automatische Profilwahl werden getrennt dokumentiert; day_context ist kein verstecktes Wake-Profil. | Nach Holiday-Source-/Quality-Entscheidung und #26-Shadow. | Old Holiday-Map/Cache weiterverwenden. | [Core State#26](https://github.com/Levtos/benni-core-state/issues/26) |
| holiday_active | Tatsächlicher Old Holiday-Active-Output | binary_sensor.benni_core_state_holiday_active | binary_sensor | benni_core_state_<entry_id>_holiday_active | on, off | Holiday-Name, matched_rule_id, reason | Core State, L1; Berechnung #26 | binary_sensor.wake_planner_benni_holiday_active | Old Entity und Holiday-Entscheidungsdiagnostik | Temporär weiter; kein stiller Rebind und keine Entfernung | planned | on bei Holiday-Name oder profile_holiday; bei Cold Start/fehlender Entscheidung off, wie #34 belegt. | Erst nach Shadow-/Quality-/Cutover-Gates. | Old Holiday-Active bleibt rückschaltbar. | [Core State#26](https://github.com/Levtos/benni-core-state/issues/26) |
| vacation | Urlaub bzw. manuelles Abwesenheitsdatum | — (interner Input noch nicht öffentlich entschieden) | — | — | not_separately_published | Quelle, Datumsbereich, reason | Core State/Source noch offen; #26 darf nicht raten | Old Holiday-Kalender und manual_holiday_dates | Keine eigene vacation-Entity oder eigene Old-Priorität in #34 | Offenes Gate; keine Ziel-ID und kein Alias | undecided | Urlaub wird im Old-Code über Holiday-/All-Day-/Manual-Intervalle repräsentiert; ein eigener Contract ist nicht belegt. | Erst nach fachlicher Source-/Contract-Entscheidung in #26. | Old Holiday-/Manual-Pfade und Store unverändert behalten. | [Core State#26](https://github.com/Levtos/benni-core-state/issues/26) |
| automatic_day_profile | Wirksames automatisches Tagesprofil | sensor.benni_core_state_wake_state als Attribut, keine eigene Entity | sensor | benni_core_state_<entry_id>_wake_state | weekday, weekend | automatic_day_profile, reason, Holiday-/Vacation-Projektion | Core State, L1; Berechnung #26 | Old profile_weekday, profile_weekend, profile_holiday | Regelkonfiguration und Old-Profilwahl | Manuelle Old-Overrides bleiben separat; keine neue Profil-Entity | attribute_only | Nur weekday und weekend; Feiertag/Urlaub am Werktag projiziert auf weekend, Samstag ist Wochenende. | Als Wake-Plan-Attribut erst nach #26-Parität; kein #25-Consumer-Cutover. | Old-Regeln/Profile vollständig beibehalten. | [Core State#26](https://github.com/Levtos/benni-core-state/issues/26) |
| live_status / mapping_diagnostics | Read-only Status mit owner-lokaler Mapping-Diagnose | sensor.benni_core_state_live_status | sensor | benni_core_state_<entry_id>_live_status | Diagnose-Text | source, status, reason, mapping_contract_version, mapping_diagnostics, source_entities | Core State, L1 | internal:logic.compute_live_status; aktuelle Quellen bleiben in Diagnosezeilen sichtbar | bestehender UX-/Statuspfad, kein Consumer-Contract | Additive owner-lokale Diagnose; keine neue Status-Entity | canonical_current | Jede Zeile enthält source, target, status und reason; ein gemeinsames Trace-Schema wird nicht vorweggenommen. | Kein Consumer-Cutover; spätere Diagnose-/Trace-Gates können die Form erweitern. | Bestehender Live-Status bleibt; keine Registry-Mutation. | [Core State#25](https://github.com/Levtos/benni-core-state/issues/25) |

Die vollständige deklarative Registry der bestehenden Presence-/Context-Outputs
sowie die explizite Legacy-Auflösung liegt technisch in
[custom_components/benni_core_state/mapping.py](https://github.com/Levtos/benni-core-state/blob/main/custom_components/benni_core_state/mapping.py).
Die Registry ist rein deklarativ; mapping_diagnostics() schreibt nichts in die
Home-Assistant-Entity-Registry.

## Wake-Planner-Abgrenzung

Aus [#34](https://github.com/Levtos/ha_wake_planner/issues/34) werden für die
spätere Contract-Rolle nur folgende belegte automatische Funktionen übernommen:

- Datum/Zeit, Wochentag/Wochenende inklusive Samstag, Datumsbereiche,
  Wochenintervalle und belegte Zyklusregeln, soweit #26 die technische Abbildung
  bestätigt;
- Holiday-/als Holiday repräsentierte Urlaubsdaten, automatische
  weekday-/weekend-Profilwahl, Kalender-Wake, Calendar-Skip und Early-Conflict;
- Cache-, Fehler-, Stale-/Fallback- und Reason-Diagnostik;
- die vier Old-Outputs wake_state, next_wake, wake_needed und holiday_active
  mit ihrer Ist-Semantik.

Nicht als Wake-Planner-Funktion behauptet werden:

- provisional_sleep;
- inferred_sleep;
- waking;
- das Core-State-Bio-Modell.

wake_needed ist ausschließlich ein Zeitfenster-Boolean. Es ist kein Beweis für
Schlaf, Aufwachen oder waking. Manuelle skip_next-/Zeit-Overrides bleiben
Old-only User-Control und werden nicht als automatisches Core-State-Ziel
umgedeutet.

## Legacy-Klassifikation

Die folgende Klassifikation ist eine Bestandsentscheidung, keine Lösch- oder
Rebind-Aktion.

| belegte alte Referenz | Kategorie | Auflösung in #25 | Gate für spätere Aktion |
|---|---|---|---|
| sensor.benni_device_living_pc | kompatibel und vorerst weiter zu verwenden | Nur bestehende Core-State-Config-Kompatibilität auf sensor.benni_master_pc; wird geloggt und diagnostisch aufgelöst. Kein Consumer-Alias. | Keine weitere Aktion in #25. |
| sensor.system_benni_media_state_activity_context | kompatibel und vorerst weiter zu verwenden | Aktuelle Media-State-Feed-Quelle; Core State benennt sie nicht um und berechnet keine Media-Wahrheit. | Media-State-eigener Contract; kein Core-State-Rebind in #25. |
| sensor.benni_core_state_presence_personal, ..._presence_household, ..._presence_band, ..._presence_transition, ..._presence_effective, ..._activity_state, ..._bio_state, ..._day_state, ..._day_context | kompatibel und vorerst weiter zu verwenden | Bereits clean publizierte Core-State-IDs; keine stille Umbenennung. | Nur spätere Contract-/Consumer-Gates. |
| sensor.wake_planner_benni_wake_state | durch kanonische Core-State-Referenz zu ersetzen | Ziel sensor.benni_core_state_wake_state; Old bleibt bis Shadow-/Cutover-Gate. | #26, control#27/#28, Bennis Live-Gate. |
| sensor.wake_planner_benni_next_wake | durch kanonische Core-State-Referenz zu ersetzen | Ziel sensor.benni_core_state_next_wake; Timestamp-/Timezone-Parität zuerst. | #26 und Consumer-Gates. |
| binary_sensor.wake_planner_benni_wake_needed | durch kanonische Core-State-Referenz zu ersetzen | Ziel binary_sensor.benni_core_state_wake_needed; Zeitfenster-Semantik bleibt erhalten. | #26, Media/Light-Cutover. |
| binary_sensor.wake_planner_benni_holiday_active | durch kanonische Core-State-Referenz zu ersetzen | Ziel binary_sensor.benni_core_state_holiday_active; Holiday-Quality zuerst. | #26 und control-Gates. |
| sensor.system_benni_core_state_presence_effective | durch kanonische Core-State-Referenz zu ersetzen | Ziel sensor.benni_core_state_presence_effective; aktueller Door-Consumer bleibt bis Gate. | Door-Consumer-/Control-Gate, kein Rebind in #25. |
| sensor.benni_combined_context_presence_personal | nach erfolgreichem Cutover zu entfernen | Verbraucher auf sensor.benni_core_state_presence_personal; keine neue Combined-Entity. | Alle Consumer-Allowlist-Gates und Core-Devices-Retirement. |
| sensor.benni_combined_context_presence_household | nach erfolgreichem Cutover zu entfernen | Verbraucher auf sensor.benni_core_state_presence_household. | Consumer-Gates. |
| sensor.benni_combined_context_presence_band | nach erfolgreichem Cutover zu entfernen | Verbraucher auf sensor.benni_core_state_presence_band. | Consumer-Gates. |
| sensor.benni_combined_context_presence_transition | nach erfolgreichem Cutover zu entfernen | Verbraucher auf sensor.benni_core_state_presence_transition. | Consumer-Gates. |
| sensor.benni_combined_context_bio_state | nach erfolgreichem Cutover zu entfernen | Verbraucher auf sensor.benni_core_state_bio_state. | Media/Light/Climate/Blind-Gates. |
| sensor.benni_combined_context_day_state | nach erfolgreichem Cutover zu entfernen | Verbraucher auf die neunphasige Core-State-Zielentity. | #24, Consumer-Gates. |
| sensor.benni_combined_context_day_context | nach erfolgreichem Cutover zu entfernen | Verbraucher auf sensor.benni_core_state_day_context; kein Wake-Profil-Alias. | Light/Climate-Gates. |
| sensor.benni_combined_context_activity_state | nach erfolgreichem Cutover zu entfernen | Verbraucher auf sensor.benni_core_state_activity_state; Core State bleibt Owner. | #29 und Consumer-Gates. |
| binary_sensor.workday, binary_sensor.workday_today_combined, binary_sensor.system_workday | durch kanonische Core-State-Referenz zu ersetzen | Enum sensor.benni_core_state_day_context; keine Boolean-/Alias-Entity neu veröffentlichen. | Day-Context-/Consumer-Gates. |
| sensor.benni_context_bio_state, sensor.benni_context_presence_personal | nach erfolgreichem Shadow-Cutover zu entfernen | Historische Toolbox-Shadow-Referenzen; nicht in #25 rebinden. | Shadow-/Live-Verified-Gates. |
| sensor.benni_core_day_state, sensor.lights_dayphase | fachlich offen beziehungsweise als Gate behandeln | Historische/Consumer-Referenzen; nur nach #24-Phasenparität auf day_state ersetzen. | #24 und Light-Gate. |
| binary_sensor.benni_core_state_away | fachlich offen beziehungsweise als Gate behandeln | Historischer Kurzslug, am verifizierten benni_media_state-Stand kein aktiver Config-Binding. Kein Alias auf presence_away. | Aktiver-Consumer-Nachweis vor jeder Aktion. |
| manual_holiday_dates, holiday_calendar_entity als Urlaubspfad | fachlich offen beziehungsweise als Gate behandeln | Keine eigene Vacation-ID; Quelle/Contract in #26 entscheiden. | Fachliche Vacation-/Source-Entscheidung. |

## Consumer-Allowlist

Diese Liste erlaubt später nur die jeweils genannte, eigene Consumer-Änderung.
In #25 werden keine dieser Repositories geändert.

| Repository | Issue | Aktueller Input | Künftiger kanonischer Input | Erlaubter Änderungsumfang | Shadow-Verhalten | Cutover-Gate | Rollback-Gate |
|---|---|---|---|---|---|---|---|
| Levtos/benni_media_policy | [#28](https://github.com/Levtos/benni_media_policy/issues/28), bestehend [#22](https://github.com/Levtos/benni_media_policy/issues/22) | binary_sensor.wake_planner_benni_wake_needed; sensor.benni_core_state_bio_state; sensor.benni_combined_context_day_state; sensor.benni_core_state_activity_state | binary_sensor.benni_core_state_wake_needed; sensor.benni_core_state_bio_state; sensor.benni_core_state_day_state; sensor.benni_core_state_activity_state | Nur eigene Source-Bindings und Wake-/Sleep-Policy nach freigegebenem Contract; keine Media-State-Neuberechnung. | Old wake_needed und Combined-Day-State bleiben parallel; keine Doppelaktion. | #25, #26/#28, control#27/#28 und Media-Tests. | Bei Error, Unavailable oder unklarer Parität auf Old-Bindings zurück. |
| Levtos/benni_media_apply | [#35](https://github.com/Levtos/benni_media_apply/issues/35) | Verifiziert sensor.benni_core_state_bio_state; kein aktiver Wake-Planner-Entity-Binding im untersuchten Stand. | Bestehender Bio-State, später waking als Bio-State-Wert; kein separater Wake-Sensor ohne Entscheidung. | Nur Apply-Reaktion auf den freigegebenen Bio-State; keine Entity-Erzeugung und keine Media-Wahrheit. | Bestehende Apply-/Bio-Flanken bleiben; keine neue Aktion im Shadow. | #25/#28, #26-Shadow, Apply-Safety und control#28. | Bestehende Bio-/Old-Flanke reaktivieren; keine Old-Entity entfernen. |
| Levtos/benni_media_state | kein eigenes Wake-Cutover-Issue; Facts-Grenze in [control#30](https://github.com/Levtos/control/issues/30) | sensor.benni_core_state_activity_state, ...bio_state, ...presence_personal, ...presence_household, ...presence_transition, ...day_state; eigener Media-Feed bleibt Owner. | Dieselben clean Core-State-Inputs; kein Input aus abgeleitetem Core-State-activity_state zurück in Media State. | Nur eigene technische Source-Bindings; keine Core-State-Abhängigkeit ergänzen, kein Media-Fakt in Core State verschieben. | Feed muss bei unterschiedlichem Core-Activity-State identisch bleiben; bestehende Zyklus-Tests gelten. | Mapping #25, Activity-Owner #29, Published-/Quality-Gate. | Media-State-Facts und aktuelle Bindings unverändert weiterführen. |
| Levtos/benni_light_policy | [#22](https://github.com/Levtos/benni_light_policy/issues/22), Live-Gate [#15](https://github.com/Levtos/benni_light_policy/issues/15) | Combined-Context-Bio, Activity, Day, Presence und Day Context; Wake-Hinweise im bestehenden Policy-Code. | Clean Core-State-Entities, insbesondere Bio, neunphasiger Day State, Day Context, Activity und Presence. | Nur Light-Source-Rebind und bestehende Waking-/Provisional-No-Change-Regel; kein Ambient-/Lux-/Apply-Neubau in #25. | Combined/Old-Werte weiter lesen und gegen Core-State diffen; keine Doppel-Actuation. | #24/#25, #28, Light-Tests, control#27/#28 und #15. | Auf Combined/Old-Bindings und bestehendes Teardown zurück. |
| Levtos/benni_blind_policy | [#10](https://github.com/Levtos/benni_blind_policy/issues/10), Diagnose [#13](https://github.com/Levtos/benni_blind_policy/issues/13) | Bereits clean: sensor.benni_core_state_bio_state, ...day_state, ...day_context, ...presence_household; weitere Opening-/Environment-Fakten bleiben eigene Contracts. | Dieselben clean Core-State-Entities; später nur beschlossene waking-/Day-State-Werte. | Nur eigene Config-/Consumer-Referenzen und Diagnose; keine Ambient-, Lux-, Weather- oder Opening-Logik in Core State. | Aktuelle Policy-Inputs bleiben führend; neue Werte höchstens read-only vergleichen. | #25, #24, #28, Blind-Contract-/Opening-Gates. | Bestehende clean Bindings und Policy-Safety beibehalten. |
| Levtos/benni_climate_policy | [#24](https://github.com/Levtos/benni_climate_policy/issues/24), [#26](https://github.com/Levtos/benni_climate_policy/issues/26) | Combined-Context-Activity, Bio, Day Context, Day State und Presence; Climate verarbeitet eigene Weather-/Thermal-Fakten. | Core-State Bio/Day/Context/Activity/Presence nach den jeweiligen Gates; keine Wake-/Holiday-Entity ohne #26. | Nur eigene Context-Bindings; keine Climate-/Thermal-/Lux-/Weather-Ableitung in Core State. | Combined und Core-State parallel vergleichen; Policy-Entscheidung bleibt Climate-Owner. | #24/#25, Climate-/Core-Contracts-Gates, control#27/#28. | Combined-/bestehende Climate-Quellen wieder verwenden. |
| Levtos/benni_door_policy | Migrations-/Consumer-Gate in [control#30](https://github.com/Levtos/control/issues/30) | sensor.system_benni_core_state_presence_effective; clean sensor.benni_core_state_presence_effective ist als Legacy-/Fallback-Referenz belegt. | sensor.benni_core_state_presence_effective | Nur eigene Source-Migration; Lock-Safety und raw_presence-Semantik unverändert. | System-ID bleibt aktiv, clean ID nur shadow-/paritätsweise. | #25, Door-Review, control#28 und Bennis Live-Gate. | System-ID/aktuelle Door-Quelle wieder aktivieren; keine Core-State-Registry-Mutation. |
| Levtos/benni-core-contracts | [#1](https://github.com/Levtos/benni-core-contracts/issues/1) | Am verifizierten Stand keine Core-State-Entity-Referenz und keine abgeleitete Context-Funktion. | Keine Core-State-Mappings; nur technische Facts, Source-Auswahl, Freshness und Quality. | Keine Änderung aus #25; Core Contracts darf keine Bio-/Day-/Activity-/Wake-Kontexte ableiten. | Eigene L0-Contracts separat shadow-/quality-prüfen. | Published-/U200-/Quality-Gate und eigener Issue. | Bestehende technische Quellen weiterverwenden. |
| Levtos/einhornzentrale | Konkreter Consumer-Issue vor Cutover noch zu benennen; Flottenrahmen [control#30](https://github.com/Levtos/control/issues/30) | Readiness-/Template-Referenzen auf sensor.benni_core_state_* sowie historische HA-Paketpfade; keine Änderung in #25. | Clean Core-State-IDs aus dieser Tabelle, nach den jeweiligen Consumer-Gates. | Nur spätere HA-Config-Umstellung in eigenem Issue; keine HA-Änderung, kein Reload/Restart in #25. | Old-/Core-State-Outputs nur beobachten und diffen. | Vollständige Allowlist, Shadow-Parität und Bennis Live-Gate. | Alte HA-Referenzen und Old Planner unverändert wieder nutzbar. |

## Owner- und Architekturgrenzen

- Core State bleibt L1-Orchestrator und Kontext-Rechenkopf: Er besitzt bio_state,
  die abgeleiteten Tagesphasen und activity_state sowie die bestehenden
  Presence-/Context-Outputs.
- Core Contracts normalisiert und wählt technische Quellen aus. Es leitet
  keinen Bio-, Day-, Activity- oder Wake-Kontext ab.
- Media State bleibt Owner der Media-Wahrheit. activity_state darf den neutralen
  Feed konsumieren, aber keine HomePod-/Denon-Rohwerte oder Media-Fusion neu
  einführen.
- Kein Ambient-, Environment-, Thermal-, Lux- oder Wetterpfad wird in #25
  ergänzt.
- Kein neuer system_-Zielpfad, keine neuen Combined-Entities, keine stillen
  Aliase, keine zusätzlichen veröffentlichten Consumer-States.
- Jede Legacy-Auflösung ist temporär, explizit, im Code mit status und reason
  nachvollziehbar und bis zum jeweiligen Gate rückrollbar.

## Implementierungsumfang in #25

- mapping.py enthält den versionierten, reinen Mapping-Vertrag, neun Zielphasen,
  konkrete clean IDs, unique_id-Templates, Legacy-Resolver sowie
  source/target/status/reason-Diagnosezeilen.
- Die bestehende PC-Config-Kompatibilität bleibt erhalten, wird aber über den
  expliziten Resolver aufgelöst und geloggt. Kein Consumer-Rebind und keine
  Registry-Mutation.
- Der bestehende live_status-Attributpfad erhält additiv
  mapping_contract_version und mapping_diagnostics. Es wird keine neue Entity
  registriert.
- test_mapping_contract.py prüft IDs, Domains, States, Attribute, stabile
  unique_ids, neun Phasen, Legacy-Auflösung und unbekannte beziehungsweise
  unentschiedene Mapping-Schlüssel.

## Risiken und offene Gates

1. Der korrigierte Neun-Phasen-Stand aus PR #30 ist in main enthalten; die
   fachlichen Consumer-Gates für Legacy-Phasen bleiben separat offen.
2. Wake-/Holiday-/Vacation-Outputs werden jetzt als #26-Shadow veröffentlicht;
   Shadow-Parität und jeder spätere Consumer-Cutover bleiben separate Gates.
3. Consumer-Repositorys enthalten nachweislich gemischte clean-, system_- und
   Combined-Referenzen. Keine davon wird in #25 geändert.
4. Testing beziehungsweise Tests Pass bedeutet technischen Abschluss des
   Agenten. Es bedeutet weder Merge noch Deployment, Cutover, Release, Live oder
   Live Verified.

Die nächste zulässige technische Stufe ist
[Levtos/benni-core-state#26](https://github.com/Levtos/benni-core-state/issues/26).
Die alte Wake-Planner-Integration, Consumer-Cutovers, Releases, Live, Live
Verified und die spätere Entfernung bleiben Bennis Gate.

# Entscheidungsnotiz: Core-State Wake Planning Shadow

**Version:** 1.0.0
**Datum:** 2026-08-05
**Issue:** [Levtos/benni-core-state#26](https://github.com/Levtos/benni-core-state/issues/26)
**Agent:** `agent:codex`
**Verifizierte Basis:** GitHub `main` bei `852086442a3719b73497dfd28004f7d014f477f3`

## Beobachtung

Core State konsumierte bisher `wake_needed` und `wake_next` aus dem externen
`ha_wake_planner`, berechnete aber keinen eigenen Wake-Plan. Die belegte
Migrationsquelle ist [ha_wake_planner#34](https://github.com/Levtos/ha_wake_planner/issues/34)
mit dem unverändert als Referenz behandelten [Inventar-/Migrationsvertrag aus
PR #36](https://github.com/Levtos/ha_wake_planner/pull/36). Der alte Planner
besitzt automatische Regel-, Datums-, Holiday-, Kalender- und Konfliktlogik
und die vier relevanten Outputs `wake_state`, `next_wake`, `wake_needed` und
`holiday_active`.

Der alte Planner implementiert weder ein Core-State-Bio-Modell noch
`provisional_sleep`, `inferred_sleep` oder `waking`. Sein Code besitzt auch
keinen 06:00-Floor; dieser Floor ist eine neue, bereits in #21/#26 entschiedene
Core-State-Grenze und darf deshalb nicht als Legacy-Parität behauptet werden.

## Belegter Ist-Zustand

- #24 ist mit [PR #30](https://github.com/Levtos/benni-core-state/pull/30)
  in der Basis enthalten. `day_state` wird über den kanonischen neunphasigen,
  lokalen Kalender-/Zivilzeitpfad berechnet und nicht über Solar-Noon, Wetter,
  Lux oder Sunrise.
- #25 ist mit [PR #31](https://github.com/Levtos/benni-core-state/pull/31)
  in der Basis enthalten und legt ausschließlich die kanonischen IDs,
  Domains und `unique_id`-Form fest.
- Die alten Entities bleiben Inputs und Vergleichsreferenz. Es gibt keinen
  Consumer-Rebind, keine Entfernung alter Entities und keine HA-Aktion.
- Urlaub hat keine eigene öffentliche Entity. Urlaub wird wie im belegten
  Old-Vertrag über Holiday-/All-Day-/manuelle Intervalle für die Profilwahl
  repräsentiert.

## Entschiedener Soll-Zustand

Core State erhält ein reines, separat testbares Wake-Planning-Modul als
Shadow. Es berechnet lokale Zeit und lokales Kalenderdatum, Werk-/Wochenende
(einschließlich Samstag), Holiday-/Holiday-repräsentierte Urlaubsprofile,
Regel-/Datums-/Zyklus-Treffer, Kalender-Wake-/Skip-Marker, Early-Conflict,
Wake-Plan, Next-Wake, Wake-Window und Wake-Needed.

Der absolute Floor ist konfigurierbar und standardmäßig `06:00` lokaler
Zivilzeit. Er ist von `day_state` und astronomischen Rohdaten entkoppelt.
Das Weckfenster bleibt konfigurierbar und inklusiv; der bestehende Planner-
Default `±5` Minuten wird als Referenz verwendet. Eine Mindestschlafdauer ist
in #26 nicht verbindlich entschieden und wird daher nicht berechnet. Sie wird
als `minimum_sleep_status=not_in_scope_by_issue_26` diagnostiziert. Gleiches
gilt für `provisional_sleep`, `inferred_sleep`, `waking` und das vollständige
Bio-Modell.

## Umsetzung

- `wake_planning.py` enthält `WakePlanningInputs`, Regeln, Holiday-/Urlaubs-
  intervalle, Kalendermarker, die reine Entscheidung, den 30-Tage-Horizont,
  das inklusive Fenster, den Floor und die explizite Mindestschlaf-Grenze.
- Die Core-State-Entities werden additiv und read-only veröffentlicht:
  `sensor.benni_core_state_wake_state`,
  `sensor.benni_core_state_next_wake`,
  `binary_sensor.benni_core_state_wake_needed` und
  `binary_sensor.benni_core_state_holiday_active`. Ihre Domains und stabilen
  `unique_id`s folgen ausschließlich dem #25-Mapping.
- Der Coordinator liest die belegten Legacy-Outputs nur als Vergleichs- und
  Konfigurationsgrundlage. Der bestehende `wake_needed`-Input bleibt für den
  bestehenden Bio-Pfad unverändert führend; der Shadow wird nicht zurück in
  Bio, Activity oder Consumer eingespeist.
- Die Shadow-Diagnose enthält Ergebnis, Eingangsgrundlage, Quelle, Quality,
  Freshness, Reason, Berechnungszeitpunkt, lokales Datum, `day_state`, Profil,
  Regel, Wake-Zeit, Floor, Fenster, Mindestschlaf-Gate und Vergleich. Alte
  Kalender-Titel oder sonstige private Freitexte werden nicht gespeichert.
- Vergleichsstatus sind `same_decision`, `different_decision`,
  `legacy_unavailable`, `core_state_unavailable` und `not_decidable`.
  Manuelle Legacy-Overrides werden als `not_decidable` behandelt und nicht
  als automatische Core-State-Funktion erfunden.
- Der stale/invalid/missing Status bleibt sichtbar. Ein stale Cache darf für
  einen diagnostizierten Vergleich verwendet werden; er wird nicht als frisch
  ausgegeben.

### 1:1-Vergleich und ausdrückliche Nichtübernahme

1:1 verglichen werden die belegten automatischen Old-Funktionen: Regelpriorität
und -matching, Werktag-/Wochenend-/Holiday-Profil, Samstag, Datumsbereiche,
Wochenintervalle, Zyklusregeln, Holiday-/Urlaubsintervalle,
Kalender-Wake-/Skip-Marker, Early-Conflict und die vier Old-Output-Felder
`wake_state`, `next_wake`, `wake_needed` und `holiday_active`.

Nicht als bereits vorhandene Wake-Planner-Funktion übernommen werden
`provisional_sleep`, `inferred_sleep`, `waking`, das Core-State-Bio-Modell,
manuelle Profil-Overrides, neue Media-/Ambient-/Weather-/Lux-/Thermal-Logik
oder Actuation. Der 06:00-Floor wird als Core-State-Entscheidung separat
diagnostiziert; der alte Planner liefert dafür keinen Beleg.

## Tests

Die fokussierten Tests decken Werktag, Wochenende, Samstag, Feiertag, Urlaub,
Regel-/Datums-/Zyklusgrenzen, Kalender-Wake-/Skip-/Konflikte, Floor, Fenster,
lokales Datum, Jahres- und Tagesgrenzen, DST-aware timestamps, fehlende,
ungültige und stale Eingänge, deterministische Ergebnisse, private-Daten-
Redaktion, Vergleichsstatus sowie kanonische Entity-/Domain-/`unique_id`-
Mappings ab. Der vollständige exakte Teststand wird im Issue-Kommentar nach
dem finalen Lauf dokumentiert.

## Risiken

- Der alte Planner bleibt Konfigurations- und Datenquelle. Wenn Regeln,
  Holiday- oder Kalendermarker im L1-Input fehlen, liefert der Shadow einen
  sichtbaren degraded/unavailable Status und behauptet keine Parität.
- Der alte Planner besitzt keinen 06:00-Floor; dadurch ist eine Abweichung bei
  einem Legacy-Wake vor 06:00 fachlich erklärbar, aber noch kein Paritäts-
  oder Cutover-Nachweis.
- Die normale HA-Laufzeit und echte lokale Kalender-/Cache-Qualität sind in
  dieser technischen Testphase nicht live verifiziert.

## Offene Gates

- Shadow-Parität: vollständiger Referenzabgleich einschließlich realer
  Kalender-/Holiday-Cache- und Fehlerfälle.
- Consumer-Cutover: separate Consumer-Issues, Allowlist, Rückfallprüfung und
  fachliche Freigabe; in dieser Änderung bleiben alle Consumer unverändert.
- Cutover/Rollback: alter Planner, seine Entities, Services, Store und
  Eventpfad bleiben bis zum separaten Gate aktivierbar.
- Draft-PR-/Merge-Gate: technische Prüfung und Draft-PR sind kein Merge.
- Release-, Deployment-, Live- und Live-Verified-Gates bleiben getrennt;
  Live und Live Verified bleiben Bennis Gate.

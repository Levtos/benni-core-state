# Core State: Entscheidungsdelta zur Fleet-Zielweg-Quelle

**Stand:** 2026-08-03

**Status:** Dokumentierter Entscheidungsstand für [Issue #21](https://github.com/Levtos/benni-core-state/issues/21); keine Umsetzung, kein Cutover und kein Live-Nachweis  
**Bezug:** [unveränderte Quellnotiz](2026-08-02-fleet-zielweg-source.md)

## Einordnung und Geltung

Die Quellnotiz ist vollständig und inhaltlich unverändert abgelegt. Ihr eigener
Status ist ein **nicht normativer Vorschlag** zur Vereinbarung. Dieses Delta
dokumentiert ausschließlich die in Issue #21 belegten Ergänzungen,
Korrekturen und Abweichungen vom 2026-08-02 und 2026-08-03. Es macht daraus
weder eine Änderung der laufenden Integration noch eine neue kanonische
Fleet-ADR.

Spätere Kommentare ersetzen frühere Aussagen nur dort, wo sie dies
ausdrücklich benennen. Dieses Dokument konsolidiert den dadurch entstandenen
aktuellen Stand. Es ersetzt weder `control/docs/` noch die spätere kanonische
Fleet-Entscheidung in `Levtos/control`.

## Beschlossen

### Core Contracts und Eingabegrenzen

- **Core Contracts** liefert einheitliche technische Fakten einschließlich
  Quelle, Freshness, Qualität und fachlich begründetem Fallback. Es
  normalisiert und bewertet die technische Verlässlichkeit, leitet aber keinen
  fachlichen Kontext und keine Policy-Entscheidung ab.
- **Core State** und **Media State** lesen relevante technische Signale nicht
  direkt aus einzelnen Home-Assistant-Integrationen, sondern über passende
  Core-Contracts-Grenzen.
- Für ein Opening ist Heizen nur zulässig, wenn jede relevante Öffnung frisch,
  zuverlässig und positiv als `closed` bestätigt ist. `unknown`,
  `unavailable`, `stale` und `source_conflict` sperren beziehungsweise
  pausieren die Heizung. Ein alter Wert `closed` ist kein positiver Nachweis.
- Eine reine Batteriewarnung sperrt die Heizung nicht automatisch. Erst eine
  mangelnde Verlässlichkeit des zugehörigen Contracts hat diese
  Safety-Wirkung.
- Für die Außentemperatur-Ableitung liefert L0 die Fakten Temperatur,
  Luftfeuchtigkeit, Wind und Sonne. `thermal_context` beziehungsweise
  `effective_outdoor_temperature` wird genau einmal in Core State abgeleitet.
  Blind und Climate konsumieren diesen gemeinsamen Kontext; Climate ergänzt
  nur heizungsspezifische Logik.

### Core State, Media und Activity

- **Media State** erkennt ausschließlich neutrale Medienzustände oder
  Medienkontext, zum Beispiel TV, PS5, Musik und ein Private-Time-Signal. Es
  liest keinen Core-State-Kontext.
- **Core State** konsumiert ausgewählte Media-State-Fakten und leitet zusammen
  mit Presence und Bio den `activity_state` ab. `activity_state` gehört damit
  verbindlich zu Core State.
- Es gibt kein `Core Apply`: Core State veröffentlicht Zustände; Policies
  entscheiden in ihrer jeweiligen Domäne und Apply-Module führen aus.

### Wake Planning und Profilwahl

- Wake Planning wird ein intern abgegrenztes, separat testbares Modul von
  **Core State**. `Bio` / Core State bleibt Owner von `sleep`,
  `provisional_sleep`, `waking` und `awake`.
- Die bisherige `ha_wake_planner`-Integration bleibt bis zum belegten
  Shadow-Cutover als Migrationsquelle parallel bestehen. Ihre vorhandenen
  Regeln für Werktag, Wochenende, Feiertage, Urlaub sowie Datums- und
  Zeitraumregeln werden in das interne Modul übernommen. Erst nach
  nachgewiesener funktionaler Gleichheit einschließlich Sonderfällen erfolgt
  der Cutover; danach wird die Integration entfernt und ihr Repository
  archiviert, nicht gelöscht.
- Die Wake-Entscheidung hat eine konfigurierbare absolute 06:00-Grenze. Sie ist
  von Sonnenaufgang und `day_state` entkoppelt.
- Für die wirksame Bewertung gibt es nur die Profile **Werktag** und
  **Wochenende**. Samstag ist Wochenende. Urlaub oder Feiertag an einem
  Werktag stufen diesen Tag auf das Wochenendprofil um. Treffen mehrere dieser
  Bedingungen zusammen, bleibt das Ergebnis Wochenende. Die Profile werden
  nicht manuell überschrieben.

### Schlafschichten, Korridor und Mindestschlaf

Die Schlafschichten bleiben fachlich getrennt:

| Schicht | Bedeutung | Zählt als tatsächlicher Schlafbeginn? |
| --- | --- | --- |
| Manuell gesetztes `sleep` | bewusste Bestätigung des Schlafbeginns | Ja |
| `provisional_sleep` | rechnerischer Schutzkorridor beziehungsweise Mini-Schlafstatus | Nein |
| `inferred_sleep` | aus belastbarer Evidenz abgeleiteter Schlafbeginn | Erst in Phase 2 |

Für ein Profil gelten:

```text
E = frühester Weckzeitpunkt
L = spätester Weckzeitpunkt
M = Mindestschlafdauer
A = maximal angenommene Schlafdauer / Schutzvorlauf

Beginn provisional_sleep  = E - A
letzter Start für M bis L = L - M
```

`A` ist keine maximale Schlafdauer mit Zwangswecken, sondern bestimmt nur den
Beginn des Schutzkorridors. `provisional_sleep` schreibt keine Schlafzeit gut
und erfüllt die Mindestschlafdauer nicht. In Phase 1 zählt hierfür nur der
manuell bestätigte Schlafbeginn.

Für flexibles Wecken gilt:

```text
min_schlaf_erreicht_ab = manueller_schlafbeginn + M
effektiver_frühester_weckzeitpunkt = max(E, min_schlaf_erreicht_ab)
tatsächlicher_weckbeginn = min(effektiver_frühester_weckzeitpunkt, L)
```

`L` bleibt immer die harte späteste Grenze. Liegt der Zeitpunkt zum Erreichen
von `M` hinter `L`, beginnt `waking` trotzdem bei `L`; die Mindestschlafdauer
gilt für diese Nacht als nicht vollständig erreicht.

Während `provisional_sleep` gilt:

- TV-/PC-Aus oder Heimkehr dürfen Musik beziehungsweise HomePods nicht
  automatisch starten;
- bereits laufende Musik wird nicht zwangsweise beendet;
- das Licht bleibt unverändert.

Manuelles Aktivieren von `sleep` führt von `provisional_sleep` zu bestätigtem
`sleep`. Ohne manuellen Schlaf endet `provisional_sleep`, wenn der berechnete
Weckvorgang beginnt; der Übergang lautet `provisional_sleep -> waking`.
Reguläre Wachinteraktionen, die bestätigten `sleep` beenden, gelten auch für
den Mini-Schlafstatus `provisional_sleep`.

### `waking`-Lebenszyklus und bestehender TV-Timer

- Beim berechneten Weckbeginn wechselt Core State aus `sleep` oder
  `provisional_sleep` nach `waking`.
- Das fachliche Signal `waking` bleibt erhalten, wird künftig aber von Core
  State veröffentlicht. Licht- und Medienlogik werden beim Cutover auf diese
  Core-State-Quelle umgebunden; ihre fachliche Reaktion bleibt erhalten.
- Beim Eintritt in `waking` dürfen beziehungsweise sollen die vorhandene
  HomePod-/Medien-Wecklogik und die vorhandene Licht-Wecklogik starten.
- `waking` endet, sobald eine reguläre Wachinteraktion `awake` bestätigt oder
  spätestens 30 Minuten nach Beginn von `waking` — je nachdem, was zuerst
  eintritt. Danach gilt der reguläre Betrieb auch dann, wenn Benni tatsächlich
  noch nicht aufgestanden ist.

Der bestehende 45-Minuten-TV-Timer gehört ausschließlich zum manuell
bestätigten `sleep` bei laufendem Fernseher:

1. Beim Eintritt in den manuellen Schlaf startet der Timer.
2. Eine Minute vor Ablauf erfolgt die vorhandene Benachrichtigung.
3. Die vorhandene Lichtschaltertaste setzt über das bestehende Skript den
   Timer auf volle 45 Minuten zurück.
4. Ohne Reset wird der Fernseher beim Ablauf ausgeschaltet.

Der Timer gilt nicht in `provisional_sleep` und erzeugt weder
`provisional_sleep` noch `inferred_sleep`. Auch TV-/PC-Aus, ein stilles Haus
oder eine geplante Weckzeit reichen in Phase 1 nicht für `inferred_sleep`.

### Tagesphasen

`day_state` erhält neun fachlich aufeinanderfolgende Phasen:

| Phase | Ziviles Leitfenster |
| --- | --- |
| Frühe Nacht | 00:00–04:00 |
| Späte Nacht | 04:00–06:00 |
| Früher Morgen | 06:00–09:00 |
| Vormittag | 09:00–12:00 |
| Mittag | 12:00–14:00 |
| Nachmittag | 14:00–16:00 |
| Später Nachmittag | 16:00–18:00 |
| Abend | 18:00–21:00 |
| Später Abend | 21:00–00:00 |

`Morgen` bleibt ein sprachlicher Oberbegriff und ist keine zehnte Sensorphase.
Die Leitfenster bilden das zivile Referenzprofil. Winter- und
Sommersonnenwende sind die beiden Richtungswechsel des deterministischen
Jahresrhythmus. Jeder variable Phasenübergang wandert mit 20 Sekunden pro
Kalendertag in seine Saisonrichtung und wird unmittelbar aus dem Datum
berechnet, sodass keine fortlaufende Drift entsteht. Tatsächlicher
Sonnenaufgang, Solar-Noon, Wetter, Lux, Licht-, Rollo- sowie Bio-/Wake-Logik
gehören nicht in diese Tagesphasenberechnung.

### Ambient-Abgrenzung

Die frühere Pflicht zu einem L1-Ambient-Submodul ist überholt. Für Phase 1
entsteht:

- kein eigener Ambient-Owner;
- kein verpflichtendes Ambient-Submodul in Core State;
- keine eigene Environment-Integration;
- kein einzelner Ambient-Zustand als Automations- oder Policy-Signal.

„Ambient“ darf höchstens als rein lesbare Status-, UX- oder Debugansicht
mehrere voneinander unabhängige Fakten und Kontexte zusammenfassen. Diese
Ansicht besitzt keine eigene Wahrheit, entscheidet nichts und führt nichts
aus.

Core Contracts liefert Umweltfakten. Core State darf daraus neutrale,
mehrfach benötigte Kontexte wie `day_state` und `thermal_context` ableiten.
Policies behalten domänenspezifische Regeln und Schwellen. „In der Wohnung ist
es kalt“ kann neutraler Core-State-Kontext sein; „es soll geheizt werden“ ist
eine Climate-Policy-Entscheidung. Weitere gemeinsame Helligkeits- oder
Sonnenlaststufen entstehen erst, wenn mehrere Verbraucher nachweislich exakt
dieselbe fachliche Bedeutung benötigen.

### Benennung, Warden und Diagnostik

- Das alternative Präfix `system_` entfällt. Konkrete Entity-IDs und technische
  Mappings bleiben Umsetzungsgegenstand.
- `Warden` ist als optionaler vierter Core-Contract-Typ neben `Atomic`, `State`
  und `Fusion` vorgemerkt. Ein Warden überwacht Verlässlichkeit und erwartete
  Aktualität, verändert aber weder Contract-Wahrheit noch Policy-Entscheidung
  oder Gerät. Seine Bindung wird im Core-Contracts-Kontext geklärt.
- State-, Policy- und Apply-Owner erhalten langfristig eine einheitliche,
  versionierte Diagnose-/Decision-Trace-Schnittstelle. Jeder Owner erklärt nur
  seine eigenen Eingaben, Ableitung und Ausgabe; eine gemeinsame `trace_id`
  kann die Kette verbinden. Neue oder wesentlich umgebaute Module sollen diese
  owner-lokale Diagnosefähigkeit von Beginn an mitdenken, ohne daraus einen
  neuen zentralen Owner oder ein Automationssignal zu machen.

## Offen

- **Konkrete Entity-IDs und Mapping:** saubere Slugs ohne `system_`, technische
  Migration und Kompatibilitätsweg.
- **Wake-Planner-Migration:** konkrete technische Übernahme, Entity-Mapping,
  Tests, Shadow-Vergleich und Cutover.
- **Diagnose-/Decision-Trace-Vertrag:** konkretes Schema, Pflichtfelder,
  Versionierung, Historienumfang, Aufbewahrung und UX-/Home-Assistant-
  Darstellung. Als Entwurfsrichtung gelten owner-lokale Eingaben mit Quelle,
  Freshness und Qualität, Ergebnis beziehungsweise Ziel, Reason Code,
  Zeitstempel und optionaler `trace_id`; dies ist noch kein beschlossenes
  Schema.
- **Gemeinsame Umweltkontexte:** zusätzliche Helligkeits- oder Sonnenlaststufen
  nur bei belegtem identischem Bedarf mehrerer Verbraucher.
- **Warden-Bindung:** einzelne Öffnungen oder ein möglicher Sammel-Opening-
  Contract; zuständig ist der Core-Contracts-Kontext.

## Vertagt

- `inferred_sleep`, seine Evidenz, Confidence und automatischen Übergänge sind
  vollständig Phase 2.
- Eine Warden-Implementierung ist nicht Teil von Phase 1.
- Elternprofil beziehungsweise Eltern-Rollout wird später behandelt.
- Das vollständige Besucher-/Freundesmodus-Backlog wird später spezifiziert.
- Eine Ambient-Ausgliederung oder ein steuernder Ambient-Zustand ist nicht Teil
  von Phase 1.
- Die Abschaltung von `ha_wake_planner` bleibt an Shadow-Nachweis, Cutover und
  Bennis Live-Gate gebunden.

## Abgleichmatrix

| Quellaussage | Heutige Entscheidung | Status / Folge |
| --- | --- | --- |
| Die Quelle bezeichnet sich als Vorschlag. | Die Quelle bleibt unverändert und nicht normativ; dieses Delta konsolidiert nur belegte Issue-Entscheidungen. | Klarstellung; keine Runtime- oder ADR-Änderung. |
| §0/§3.1 ordnen `thermal_context` Core State zu; §5/D1 bezeichnet ihn teils als L0-Fakt. | L0 liefert Umweltfakten; Core State leitet `thermal_context` / `effective_outdoor_temperature` einmal zentral ab. | **Quellwiderspruch aufgelöst.** |
| §1/§3 enthalten noch Rohquellen in einzelnen Zielwegen. | Core State und Media State beziehen relevante technische Signale über Core Contracts. | Eingabegrenze bestätigt und präzisiert. |
| Die Quelle legt die Safety-Wirkung unsicherer Openings nicht fest. | Heizen nur bei frischem, zuverlässigem und positivem `closed`; Batteriewarnung allein sperrt nicht. | Contract-/Policy-Grenze entschieden. |
| Die Quelle führt `ha_wake_planner` separat fort. | Wake Planning wird internes Core-State-Modul; die alte Integration bleibt bis zum Shadow-Cutover Migrationsquelle und wird danach archiviert. | **Abweichung zur Quelle.** |
| Die Quelle enthält vorhandene Wake-Planungslogik, aber nicht den vollständigen Zielvertrag. | Bestehende Werktag-/Wochenend-, Feiertags-, Urlaubs- und Datumslogik wird übernommen; Urlaub/Feiertag stufen Werktage auf Wochenende um. | Migration fachlich präzisiert; Technik offen. |
| Die Quelle nennt `provisional_sleep` und `inferred_sleep`, lässt Trigger und Übergänge offen. | Phase 1 trennt manuellen Schlaf, Schutzkorridor und `waking`; `inferred_sleep` ist Phase 2. Korridor, harte Grenze und Waking-Lebenszyklus sind festgelegt. | Phase-1-Spec fachlich konkretisiert. |
| Die Quelle beschreibt Media State mit Core-State-Leserichtung. | Media State erkennt nur neutrale Medienfakten und liest keinen Core-State-Kontext. | **Abweichung zur Quelle; Kreis verhindert.** |
| §5/D3 nennt Core State als Activity-Ziel, §6 lässt den Owner offen. | `activity_state` gehört verbindlich zu Core State. | **Offene Quellfrage entschieden.** |
| §3.5 empfiehlt ein Ambient-Submodul und nennt eine Environment-Integration als Gabelung. | Kein Ambient-Owner, kein Pflicht-Submodul und keine Environment-Integration in Phase 1; Ambient höchstens als lesbare Ansicht. | Frühere Issue-Entscheidung ausdrücklich ersetzt. |
| §3.5 skizziert ein hybrides astronomisches Tagesphasen-Modell. | Neun zivile Phasen mit deterministischem 20-Sekunden-Jahresrhythmus; keine astronomischen Tagesanker. | **Hypothese ersetzt und konkret entschieden.** |
| §3.5/§5 schlagen gemeinsame Solar-/Heat-Kontexte vor. | Nur nachweislich mehrfach identisch benötigte neutrale Kontexte werden zentral abgeleitet; Policy-Schwellen bleiben domänenspezifisch. | Keine vorsorglichen Sammelbänder. |
| Die Quelle enthält unterschiedliche Slugs mit und ohne `system_`. | Das alternative Präfix `system_` entfällt; konkrete IDs und Migration bleiben offen. | Naming-Grundsatz entschieden. |
| Die Quelle enthält keinen Warden-Typ. | Warden bleibt optionale Core-Contracts-Vormerkung; Bindung und Umsetzung sind nicht Phase 1. | Additiv vorgemerkt und vertagt. |
| Die Quelle enthält keine modulübergreifende Diagnoseschnittstelle. | Owner-lokale, versionierte Diagnose-/Decision-Trace-Fähigkeit wird für neue und wesentlich umgebaute Module mitgedacht; jeder Owner erklärt nur seine eigene Stufe. | Architekturprinzip beschlossen; Schema und UX offen. |

## Nachweisgrenze dieses Dokuments

Der Commit zu diesem Dokument belegt ausschließlich die versionierte
Architekturdokumentation. Er belegt weder getestete Runtime-Änderungen noch
einen Shadow-Vergleich, einen Migrations-Cutover, ein Release, Deployment oder
Live-Verhalten. Diese Gates bleiben in ihren jeweiligen Issues und bei Bennis
abschließender Live-Verifikation.

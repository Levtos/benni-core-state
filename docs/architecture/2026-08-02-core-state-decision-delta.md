# Core State: Entscheidungsdelta zur Fleet-Zielweg-Quelle

**Stand:** 2026-08-02

**Status:** Dokumentierter Entscheidungsstand für [Issue #21](https://github.com/Levtos/benni-core-state/issues/21); keine Umsetzung, kein Cutover und kein Live-Nachweis
**Bezug:** [unveränderte Quellnotiz](2026-08-02-fleet-zielweg-source.md)

## Einordnung und Geltung

Die Quellnotiz ist vollständig und inhaltlich unverändert abgelegt. Ihr eigener
Status ist ein **nicht normativer Vorschlag** zur Vereinbarung. Dieses Delta
dokumentiert ausschließlich die im Issue entschiedenen Ergänzungen und
Abweichungen vom 2026-08-02; es macht daraus weder eine Änderung der laufenden
Integration noch eine neue kanonische Fleet-ADR.

Offene Punkte bleiben offen. Insbesondere ersetzt dieses Dokument weder
`control/docs/` noch eine spätere, fachlich beschlossene Architekturentscheidung
in der dafür zuständigen kanonischen Dokumentation.

## Beschlossen

### Core Contracts und Eingabegrenzen

- **Core Contracts** liefert einheitliche technische Fakten einschließlich
  Quelle, Freshness, Qualität und fachlich begründetem Fallback. Es
  normalisiert und bewertet die technische Verlässlichkeit, leitet aber keinen
  fachlichen Kontext ab.
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
  `effective_outdoor_temperature` wird
  genau einmal in Core State abgeleitet. Blind und Climate konsumieren diesen
  gemeinsamen Wert; Climate ergänzt nur heizungsspezifische Logik.

### Core State, Wake, Media und Activity

- Wake Planning wird ein intern abgegrenztes, separat testbares Modul von
  **Core State**.
- Die bisherige `ha_wake_planner`-Integration bleibt während der Migration nur
  als parallele Quelle bestehen. Erst ein Shadow-Vergleich mit identischen
  produktiven Daten einschließlich Sonderfällen erlaubt den Cutover; danach
  wird die Integration entfernt und ihr Repository archiviert, nicht gelöscht.
- Die Wake-Entscheidung hat eine konfigurierbare absolute 06:00-Grenze. Sie ist
  von Sonnenaufgang und `day_state` entkoppelt.
- `provisional_sleep` und `inferred_sleep` werden ergänzt. Die konkrete
  Zustands-Spezifikation folgt separat.
- **Media State** erkennt ausschließlich neutrale Medienzustände oder
  Medienkontext, zum Beispiel TV, PS5, Musik und ein Private-Time-Signal. Es
  liest keinen Core-State-Kontext.
- **Core State** konsumiert ausgewählte Media-State-Fakten und leitet zusammen
  mit Presence und Bio den `activity_state` ab. `activity_state` gehört damit
  verbindlich zu Core State.
- Es gibt kein `Core Apply`: Core State veröffentlicht Zustände; Policies
  entscheiden in ihrer jeweiligen Domäne und Apply-Module führen aus.
- Ein Besucher-/Freundesmodus gehört später fachlich zu Core State, ist jedoch
  aus Phase 1 ausgeschlossen. TV oder Musik sind nie allein ein Besuchsbeweis.
  `bei_eltern` ist ausdrücklich kein Besuchshinweis; dort darf Musik
  weiterlaufen.

### Warden und Nachvollziehbarkeit

- `Warden` ist als optionaler vierter Core-Contract-Typ neben `Atomic`,
  `State` und `Fusion` vorgemerkt.
- Ein Warden überwacht gezielt Verlässlichkeit und erwartete Aktualität eines
  überwachungswürdigen Contracts, überwiegend bei batteriebetriebenen Geräten.
  Er verändert weder Contract-Wahrheit noch Policy-Entscheidungen oder Geräte.
- State-, Policy- und Apply-Owner erhalten langfristig eine einheitliche,
  versionierte Debug-/Decision-Trace-Schnittstelle. Jeder Owner erklärt nur
  seine eigene Entscheidung; eine gemeinsame `trace_id` verknüpft die Kette.

## Offen

- **Ambient Owner:** internes, profil- und standortgebundenes Core-State-
  Submodul oder eigenständige Environment-Integration.
- **Tagesphasen:** das konkrete hybride Modell, seine astronomischen Anker,
  Offsets, Clamp-Grenzen und Konfiguration.
- **Schlafzustände:** Trigger und Übergänge von `provisional_sleep` und
  `inferred_sleep`.
- **Gemeinsame Umweltbänder:** Solar-, Heat- und Bright-Bänder sowie
  kanonische Entity-IDs.
- **Warden-Bindung:** einzelne Öffnungen oder ein möglicher Sammel-Opening-
  Contract.
- **Decision Trace:** konkretes Schema, Historienumfang und UX.

## Vertagt

- Eine Warden-Implementierung ist nicht Teil von Phase 1.
- Das vollständige Besucher-/Freundesmodus-Backlog wird erst später spezifiziert.
- Die Abschaltung von `ha_wake_planner` ist kein Ergebnis dieser Dokumentation;
  sie bleibt an den beschriebenen Migrations- und Shadow-Nachweis gebunden.

## Abgleichmatrix

Diese Matrix ist auf den entschiedenen Scope von Issue #21 begrenzt. Sie
vergleicht keine unentschiedenen Fleet-Empfehlungen als wären sie bereits
verbindlich.

| Quellaussage | Heutige Entscheidung | Status / Folge |
| --- | --- | --- |
| Die Quelle bezeichnet sich selbst als Vorschlag zur Vereinbarung und nicht als GitHub-definierte Umsetzung. | Die Quelle bleibt vollständig erhalten, ist aber nicht normativ. Dieses Delta hält nur die im Issue belegten Entscheidungen fest. | Klarstellung; keine Runtime- oder ADR-Änderung. |
| §0 und §3.1 ordnen `thermal_context` / `effective_outdoor_temperature` Core State als L1-Ableitung zu; §5/D1 bezeichnet ihn dagegen teilweise als L0-Fakt von Core Contracts. | Für die Außentemperatur-Ableitung liefert L0 Temperatur, Luftfeuchtigkeit, Wind und Sonne als Fakten. Core State leitet `thermal_context` / `effective_outdoor_temperature` einmal zentral ab. | **Quellwiderspruch aufgelöst**; Blind und Climate konsumieren den einen L1-Wert. |
| §1 und §3 beschreiben L0-Fakten als Contract-Grenze, enthalten aber noch Rohquellen in einzelnen Zielwegen. | Core State und Media State beziehen relevante technische Signale ausschließlich über passende Core Contracts. | Bestätigt und präzisiert die Eingabegrenze. |
| Die Quelle kennt Opening-Fakten, legt aber die konkrete Safety-Wirkung bei unsicherem Öffnungszustand nicht fest. | Heizen ist nur bei frischem, zuverlässigem und positiv bestätigtem `closed` erlaubt; unsichere Zustände pausieren oder sperren. Eine Batteriewarnung allein reicht nicht. | Neu festgelegte Contract-/Policy-Grenze; keine Umsetzung in diesem Issue. |
| §2 und „Seiten-Planer & periphere Feeder“ führen `ha_wake_planner` als separate Integration fort. | Wake Planning wird ein internes, testbares Core-State-Modul. Die alte Integration bleibt nur bis zum erfolgreichen Shadow-Cutover als Migrationsquelle parallel. | **Abweichung zur Quelle**; später entfernen und Repository archivieren, nicht löschen. |
| §3.1 beschreibt, dass Media State aus `presence_personal` einen Away-Zustand ableitet. | Media State erkennt nur neutrale Medienfakten und liest keinen Core-State-Kontext. | **Abweichung zur Quelle**; verhindert den Kreis Core State → Media State → Core State. |
| §5/D3 nennt Core State als Ziel für Activity, §6 lässt die Activity-Ownership jedoch noch offen. | `activity_state` wird verbindlich in Core State aus Presence, Bio und ausgewählten Media-State-Fakten abgeleitet. | **Offene Quellfrage entschieden**. |
| Die Quelle enthält kein `Core Apply` als eigene Zielkomponente. | Ein `Core Apply` wird nicht eingeführt. | Entscheidung bestätigt die Trennung State → Policy → Apply. |
| Die Quelle enthält keinen Besucher-/Freundesmodus als Phase-1-Entscheidung. | Der Kontext gehört später fachlich zu Core State, bleibt aber aus Phase 1 ausgeschlossen; TV oder Musik sind kein Besuchsnachweis. | Vorgemerkt und vertagt. |
| Die Quelle enthält keinen Warden-Contract-Typ. | `Warden` wird als optionaler vierter Core-Contract-Typ vorgemerkt; seine Bindung und Umsetzung bleiben offen beziehungsweise vertagt. | Additive Architekturvormerkung, keine Phase-1-Umsetzung. |
| Die Quelle enthält keine modulübergreifende Decision-Trace-Schnittstelle. | Owner erklären jeweils nur ihre eigene Entscheidung; `trace_id` verbindet die Kette. | Langfristig beschlossen; Schema, Historie und UX bleiben offen. |
| §3.5 empfiehlt ein internes Ambient-Submodul in Core State, nennt die eigenständige Environment-Integration jedoch ausdrücklich als verbleibende Gabelung. | Es wird kein Ambient Owner bestimmt. | **Weiterhin offen**; aus diesem Dokument folgt keine Implementierung. |
| §3.5 skizziert ein hybrides Tagesphasen-Modell als zu bewertende Hypothese. | Es werden weder Anker noch Offsets, Clamp-Grenzen oder Konfiguration festgelegt. | **Weiterhin offen**; die Hypothese ist keine Entscheidung. |
| §0 beschließt die Ergänzung von `provisional_sleep` / `inferred_sleep`, verweist für Trigger und Übergänge aber auf eine Spec. | Die Ergänzung ist beschlossen; ihre konkrete Zustands-Spezifikation bleibt offen. | Teilweise entschieden, Detail-Spec separat. |
| §3.5 und §5/D4 schlagen gemeinsame Solar-/Heat-Kontexte vor. | Konkrete Solar-, Heat- und Bright-Bänder werden nicht festgelegt. | Weiterhin offen; keine Band- oder Schwellenentscheidung aus der Quelle übernehmen. |

## Nachweisgrenze dieses Dokuments

Der Commit zu diesem Dokument belegt ausschließlich die versionierte
Architekturdokumentation. Er belegt weder getestete Runtime-Änderungen noch
einen Shadow-Vergleich, einen Migrations-Cutover, ein Release, Deployment oder
Live-Verhalten. Diese Gates bleiben in ihren jeweiligen Issues und bei Bennis
abschließender Live-Verifikation.

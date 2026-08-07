# Core-State Umbrella-UX – Entscheidungsnotiz v1.1.0

**Status:** PR #46 ist in `main` gemergt; die Shadow-DOM-Korrektur für #36 wird
technisch nachverifiziert. Kein Consumer-Cutover und keine Live-Freigabe.
**Scope:** ausschließlich `Levtos/benni-core-state#36`.
**Start-Gate:** Core-State #27, #28 und #29 sind im am 2026-08-07 verifizierten
Default-Branch `main` enthalten (`338c73f0c386893cd145f1d0d03ae78e60f0f2cd`,
Merge von PR #46).

## Entscheidungen

1. **Ein Zielsystem und eine fachliche Wahrheit.** Core State besitzt Snapshot,
   Tageskontext, Presence, Bio, Day, Activity und Wake Planning. Wake Planning
   ist ein internes, separat testbares Core-State-Modul; es ist kein zweites
   Produkt und keine globale Shell. Einen Baustein „Control State“ gibt es
   nicht.

2. **Adaptergrenzen.** Das fachliche Modul bleibt ohne eigene globale Shell,
   Accountzeile oder zweiten Avatar. Die Svelte-App spricht ausschließlich über
   `HostAdapter`, `HaPanelAdapter` oder `StandaloneAdapter`. Home Assistant Panel
   und Standalone verwenden die gleichen versionierten Verträge; der Host-Adapter
   bleibt die einzige Integrationsgrenze.

3. **Versionierte Verträge.** Die öffentliche UX nutzt:

   - `benni_core_state.snapshot` v1.0.0 für die zentrale Heute-Wahrheit,
   - `benni_core_state.projection` v1.0.0 für die backendseitige 14-Tage-Projektion,
   - `benni_core_state.command_ack` v1.0.0 für autorisierte Commands.

   Panel-WebSocket-Namen sind `ux_snapshot`, `ux_projection`, `ux_command` und
   `ux_subscribe`; REST ist nur der Standalone-Adapter. Requests tragen eine
   idempotente ID, deren Ergebnis begrenzt persistiert wird.

4. **Frontend.** Svelte 5, Vite und TypeScript folgen ADR 0001. Tailwind-
   Utilities, CSS Custom Properties, Lucide, Bits UI für die Timeline-Tooltips
   und eine kontrolliert übernommene shadcn-svelte-kompatible Button-Primitivität
   werden fachlich begrenzt eingesetzt. Die fünf internen Ansichten sind Heute,
   Kalender, Profile & Regeln, Diagnose und Einstellungen. Die Timeline mit neun
   Phasen, Eintrittszeiten, proportionalen Breiten, Jetzt-Markierung, Fortschritt
   und nächstem Wechsel wird im Backend berechnet. Das Frontend formatiert und
   rendert nur Vertragsdaten; es besitzt keine Regelengine, Wake-Berechnung,
   Profilwahl, Mindestschlaf- oder Bio-Logik.

5. **Shadow-DOM-Adaptergrenze.** `bcs-app` mountet das Svelte-Modul in einen
   eigenen offenen Shadow Root. Pro Instanz wird genau ein Stylesheet und ein
   Mount-Container innerhalb dieses Roots verwaltet; Mount, Unmount, Remount und
   mehrere Instanzen sind idempotent. Styles werden nicht in `document.head`
   injiziert. Die Graphite-Tokens liegen auf `:host`, fachliche Selektoren sind
   auf den Modul-Root begrenzt, und Dokumenttitel, Host-Typografie, Host-
   Hintergrund sowie äußere Shadow Roots bleiben unverändert.

6. **Wake-/Sleep-Verträge.** `awake`, `provisional_sleep`, `sleep` und `waking`
   bleiben getrennt. `provisional_sleep` ist Schutzstatus und keine bestätigte
   Schlafzeit. Werktag und Wochenende sind die einzigen wirksamen Profile;
   Samstag ist Wochenende. Feiertage und Urlaub werden als Werktag-auf-
   Wochenendprofil behandelt. E/L/M/A, Mindestschlaf, Schutzkorridor, harte
   L-Grenze, Floor und der vollständige `waking`-Lebenszyklus kommen aus den
   Core-State-Verträgen. Das Frontend bietet ausschließlich belegte
   `bio.mark_sleep`- und `bio.mark_awake`-Commands an; kein `waking`-Button,
   kein `inferred_sleep`.

7. **Eigene Persistenz und Migration.** Die automatische Konfiguration liegt
   versioniert in `.storage/benni_core_state_wake_planning_<entry_id>` (Storage
   v1); der idempotente Command-Log liegt in
   `.storage/benni_core_state_ux_commands_<entry_id>` (Storage v1). Die
   Migration übernimmt nur belegte automatische Profile, Regeln, Kalenderquellen,
   Intervalle, Wake Window, Routine, Konfliktverhalten und Floor. Manuelle
   Skip-/Zeit-/Profil-Overrides werden nicht übernommen. Die Übernahme ist
   idempotent; der frühere Core-State-Datensatz wird als Rollback-Dokument im
   eigenen Namespace gesichert. Rollback schreibt ausschließlich Core State und
   liest oder schreibt keine Legacy-Entity.

8. **Legacy-Grenze.** `ha_wake_planner` ist während der Migration ausschließlich
   Vergleichs-, Diagnose- und Rollbackquelle. Die temporäre Legacy-vs-Core-
   Capability erscheint nur, wenn eine Legacy-Referenz tatsächlich verfügbar
   ist, und kann nach dem Cutover vollständig verschwinden. Browser und Gateway
   rufen keine alten Entities, Services, WebSockets oder Stores auf.

9. **Status und Berechtigungen.** Snapshot- und Projektionsdaten tragen
   Datenstatus, Qualität, Freshness und Degradation; bei Verbindungsabbruch
   folgt Reconnect mit Resync statt konkurrierender Statuswahrheit. Schreibende
   Commands benötigen einen authentifizierten Home-Assistant-Admin. `testing`
   und technische Checks sind nicht `live`; Live und Live Verified bleiben
   Bennis Gate.

## Verifikation und offene Risiken

- Die nested-Shadow-DOM-Browserprüfung deckt den generierten Vite-Build und den
  Source-Modus ab: Graphite-Hintergrund/Text, Kartenflächen/-rahmen, Grid/Flex,
  Navigation/Active-State, Timeline, Touch-Ziele, Fokus, Accessibility-
  Semantik, alle fünf Ansichten, zwei Instanzen, Remount und Style-Isolation.
  Desktop (1280px) und Tablet (768px) sind geprüft; der Build-Viewport-
  Screenshot liegt als lokales Testartefakt unter
  `artifacts/core-state-shadow-dom-viewport.png`.
- Python-, Contract-, Migrations-, Frontend-, Component-, Type-, Lint-, Build-,
  Accessibility-, JSON-, Link- und Diff-Prüfungen werden im Fix-PR mit den
  aktuellen Ergebnissen dokumentiert.
- Der Legacy-freie Migrationstest plant mit der eigenen migrierten Konfiguration
  ohne verfügbare Wake-Planner-Entity.
- HA-Runtime-Importe und die Adapterkommunikation sind lokal ohne laufende
  Home-Assistant-Instanz nicht vollständig ausführbar; das bleibt ein
  technisches PR-/Integrationsrisiko.
- Es gibt keinen Consumer-Cutover, keine Entfernung alter Entities, keinen
  Reload/Restart/Deploy/Release und keine Live-Verifikation in diesem Scope.

## Rollback

Vor dem Cutover bleibt der Legacy-Verbrauch unverändert. Für eine technische
Rücknahme wird der Draft-PR nicht gemergt; nach einer späteren autorisierten
Übernahme kann der versionierte Core-State-Rollback-Command den gesicherten
Core-State-Datensatz wiederherstellen. Eine Rückkehr zu alter UX oder ein
direkter Legacy-Aufruf ist kein Zielzustand dieser Notiz.

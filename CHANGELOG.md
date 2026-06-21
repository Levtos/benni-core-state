# Changelog

Alle nennenswerten Änderungen an dieser Integration. Neuester Eintrag oben.
Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## [0.5.1] – 2026-06-22

### Changed
- PC-Wake-Indikator im Benni-Prefill von `sensor.benni_device_living_pc` auf
  den bestehenden Core-Devices-Master `sensor.benni_master_pc` umgebunden.
- Bestehende ConfigEntries migrieren gespeicherte alte PC-Bindings automatisch
  auf den Master; der Options-Flow normalisiert den alten Wert ebenfalls.

## [0.5.0] – 2026-06-21

### Added
- **FLEET-100 — SSID-Anker für sofortige Presence.** Die WLAN-SSID wird jetzt
  **nativ in core_state** ausgewertet (kein externer Template-Helper): das
  Gehirn liest die rohe SSID-Entität (`CONF_SSID_SOURCE`) und matcht gegen
  konfigurierbare Sets `CONF_HOME_SSIDS` / `CONF_PARENTS_SSIDS`. Auf dem
  Heim-WLAN zu hängen → `zuhause` in Sekunden, GPS-unabhängig (vorher hing
  Presence am ~15-Min-GPS-Poll → bis zu 60 Min Lag beim Heimkommen).
  - Mehrere SSIDs je Anker, weil das iPhone zwischen 2,4-/5-GHz-Netzen mit
    unterschiedlichen Namen wechselt (`Einhornaufzuchtsfarm` /
    `Einhornaufzuchtsstation`). Single-String-Match wäre brüchig.
  - SSID ist **positive-only** Evidenz: unbekanntes Netz (Geschwister/Café)
    oder ein `Not Connected`-Blip beim Bandwechsel zieht Presence nie auf
    `abwesend` — dann entscheidet weiter GPS.
  - Prefill für Profil `benni`: `sensor.iphone_von_benjamin_ssid` + die zwei
    Heim-SSIDs + Eltern-SSID. Override per neuem Options-Step „WLAN-SSIDs".

### Note
- Strangler-Cutover offen: nach Live-Verifikation wird der externe Template-
  Helper `binary_sensor.benni_bei_eltern_wlan` (heute `wlan_eltern_1`) abgelöst
  und entbunden — Eltern-SSID-Match ist der neue, präzisere Owner.

## [0.4.5] – 2026-06-13

### Fixed
- Der manuelle Schlafmodus ignoriert nur noch Wake-Indikatoren, die bereits
  vor `last_sleep_start` aktiv waren. Frisch nach Sleep aktiv werdende
  PC-/Kaffee-/Tür-/PS5-Signale können weiterhin wecken; kein pauschales
  Zeitfenster mehr.

## [0.4.4] – 2026-06-13

### Fixed
- `benni_core_state.mark_sleep` bleibt nach einem manuellen Schlafmodus-Request
  stabil: bereits aktive Level-Signale wie PC/Kaffee dürfen den frischen
  Sleep-State nicht im selben Refresh direkt wieder auf `awake` heben.

## [0.4.2] – 2026-06-10

### Changed
- **FLEET-36 Cut-over (Schritt 1):** `PROFILE_PREFILL[benni]` für den
  Media-Context-Input zeigt auf den extrahierten L1-Feeder
  `sensor.benni_media_state_media_context` (statt Toolbox
  `sensor.benni_media_context_media_context`). Dank Override-only-Storage
  binden Live-Instanzen ohne expliziten Override nach Reload automatisch um
  (Strangler, per-Konsument). `eltern` bleibt leer (später
  `eltern_media_state_*`).

## [0.4.1] – 2026-06-05

### Added
- **Proximity im Benni-Prefill**: `proximity_distance` →
  `sensor.home_entfernung_von_iphone_von_benjamin` (m), `proximity_direction` →
  `sensor.home_bewegung_von_iphone_von_benjamin` (Enum, Wert `towards` passt zur
  Annäherungs-Logik). Aktiviert Presence-Band/Preheat/Transition-nach-Distanz
  (war in der Toolbox `null` = schlummernd). Entity-IDs der Proximity-Integration
  bewusst **nicht** umbenannt (Roh-Input, gekapselt; Rename-Risiko mid-migration).

## [0.4.0] – 2026-06-05

### Added
- **Auto-Bind der Quell-Entities** aus dem Profil-Map (Code): der Coordinator
  löst jeden Input als `Override (entry) ▶ Profil-Map ▶ leer` auf
  (`_entity_id`). Inputs binden ohne Klicken automatisch.

### Changed
- Der `entities`-Schritt ist jetzt eine **reine Override-Schicht**: es werden nur
  Abweichungen vom Code-Default gespeichert (`_entity_overrides`). Leere/Default-
  gleiche Felder fallen auf den Auto-Bind zurück → **Repo-Map-Updates propagieren**
  auf nicht-überschriebene Slots. Options-Flow ebenso (Override-Diff statt
  Vollkopie). Panel-Diagnose nutzt denselben Resolver.

## [0.3.0] – 2026-06-05

### Added
- **Profil-Hub / Route-Auswahl**: Beim Hinzufügen der Integration wird zuerst die
  Route gewählt (`user`-Step: **Benni** / **Eltern**), dann Entities, dann
  Thresholds. Profil wird im Config-Entry gespeichert.
- **Profil im Entity-Slug** über den Device-Namen (`<Profil> Core State`):
  Route Benni → `sensor.benni_core_state_*`, Route Eltern →
  `sensor.eltern_core_state_*`. Integration-Domain bleibt `benni_core_state`.
- **Per-Profil-Prefill** (`PROFILE_PREFILL`): Benni vorbefüllt, Eltern bewusst
  leer (kommt, wenn die Eltern-Anlage real wird).
- Panel zeigt die aktive **Route** (Chip + Footer); WS `get_status` liefert
  `profile`/`profile_label`.

### Changed
- `ENTITY_PREFILL` → `PROFILE_PREFILL` (profil-gestaffelt).
- Config-Flow von 2- auf 3-stufig (Route → Entities → Thresholds).

## [0.2.0] – 2026-06-05

### Added
- **Vanilla-Lit-Panel** „Core State" in der HA-Sidebar (Muster aus
  `benni_light_policy`): `view.py` (Static-Path + Custom-Panel),
  `websocket_api.py` (`benni_core_state/get_status` — States, Attribute,
  Input-Readiness), `frontend/app/` (main/store/styles + Views **Übersicht**
  und **Diagnose**). Bio-Aktionen (mark_sleep/waking/mark_awake) laufen über
  die regulären Services.
- **`ENTITY_PREFILL`** (Konvention wie light_policy): der Config-Flow belegt die
  Quell-Slots mit bekannten Live-IDs vor, gefiltert auf real existierende
  Entities — auf der getrennten Eltern-Anlage greift es schadlos nicht.
- **`bei_eltern`-Quelle**: `wlan_eltern_1` wird mit
  `binary_sensor.benni_bei_eltern_wlan` (SSID == „Martin Router King 2")
  vorbelegt.

### Changed
- `wlan_eltern_*`-Selektoren akzeptieren `binary_sensor`/`input_boolean`
  zusätzlich zu `device_tracker` (für den SSID-Template-Sensor).
- `manifest.json`: `dependencies: [http, websocket_api, frontend]` (Panel),
  Version 0.2.0.

## [0.1.0] – 2026-06-04

### Added
- **Extraktion von `benni_context` aus Bennis Toolbox** in eine eigenständige
  Integration `Benni Core State`.
- Neue Standalone-HA-Domain **`benni_core_state`**, direkt über
  *Geräte & Dienste → Integration hinzufügen* einrichtbar (eigener zweistufiger
  Config-Flow `user → thresholds`, Options-Menü `entities | thresholds`,
  Single-Instance).
- Eigene Services: `benni_core_state.set_bio_state`, `benni_core_state.mark_sleep`,
  `benni_core_state.mark_awake` (funktional identisch zum Ist-Stand).
- Eigene Storage-Keys `benni_core_state_state_<entry_id>` (restart-fest für
  Bio-, Sleep-/Awake-Start-, Transition- und Preheat-State).
- Eigener Entity-Namespace `sensor.benni_core_state_*` /
  `binary_sensor.benni_core_state_*` und eigener `unique_id`-Prefix —
  **kollisionsfrei** zur weiterhin produktiven Toolbox-Version.
- Logik-Tests gegen den Ist-Stand (bio, presence/`bei_eltern`, preheat,
  transition, activity-priority, day_state, persistence).
- README (Ist-Stand) und dieses CHANGELOG.

### Changed
- Config-Flow: die `wlan_eltern_1`/`wlan_eltern_2`-Selektoren akzeptieren nun
  zusätzlich `binary_sensor`/`input_boolean` (nicht nur `device_tracker`), damit
  z.B. ein SSID-basierter Template-Sensor direkt als `bei_eltern`-Quelle dienen
  kann. Keine Logikänderung — `_is_home()` wertet `on`/`true`/`home` ohnehin gleich.
- Nur technische Verdrahtung: Umbrella-Abhängigkeiten entfernt
  (`...const`, `...storage`, `...services`, `..base`, Modul-Registry,
  Platform-Dispatcher). Eigene `const.py`-Helfer (`storage_key`, `unique_id`),
  flache `hass.data`-Wurzel, eigener `ConfigFlow`/`OptionsFlow`,
  direkte Service-Registrierung.

### Notes
- **Shadow-Test vorbereitet:** läuft parallel zur alten Toolbox-Version; alt
  bleibt produktiv.
- **Keine fachliche Logik geändert.** `logic.py`/`models.py` sind ein 1:1-Lift
  des Toolbox-Ist-Stands.
- `master_context` bewusst beim Ist-Stand-Namen belassen (Auftrags-Beispiel
  nannte `master_state`) — Umbenennung erst im späteren Core-State-Auftrag.
- Keine Storage-Migration aus dem alten Toolbox-Key; Shadow-Instanz startet mit
  Default-`sleep`.

# Changelog

Alle nennenswerten Änderungen an dieser Integration. Neuester Eintrag oben.
Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

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

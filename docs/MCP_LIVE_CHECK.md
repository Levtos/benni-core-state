# MCP-Liveprüfung — Shadow-Test-Vorbereitung

Stand: 2026-06-04 · HA-Instanz: *Einhornzentrale* (Europe/Berlin)

Diese Integration lag zum Prüfzeitpunkt nur lokal im Dev-Repo vor und war
**noch nicht auf den HA-Host deployt** (kein MCP-Dateizugriff auf
`config/custom_components/`, Repo nicht in HACS publiziert). Die Checks zerfallen
daher in **jetzt verifizierbar** (gegen die laufende HA) und **blockiert bis
Deployment**.

## Prüftabelle

| Check | Ergebnis | Hinweis |
| --- | --- | --- |
| 1. Integration installierbar? | ⏳ blockiert | Erfordert Deployment nach `config/custom_components/benni_core_state/`. Code kompiliert lokal (`py_compile` ok), `manifest.json`/`hacs.json` valide. |
| 2. Config Entry anlegbar? | ⏳ blockiert | Setzt Schritt 1 voraus. Flow-Code: single-instance `user → thresholds`. |
| 3. Erwartete Entities erstellt? | ⏳ blockiert | Erwartet 9 Sensoren + 1 binary_sensor (s. README). |
| 4. Entity-ID-Konflikte mit Toolbox? | ✅ keine | In HA existiert **kein** `sensor.benni_core_state_*` / `binary_sensor.benni_core_state_*`. Geplanter Namespace ist frei. Toolbox nutzt `benni_context_*`; die 3 Herzen nutzen `benni_core_day_state` / `benni_core_user_*` / `benni_core_presence_*` (anderer Stamm). |
| 5. Gültige States? | ⏳ blockiert | Nach Deployment gegen Baseline (unten) vergleichen. |
| 6. Wichtige Attribute vorhanden? | ✅ Parität verifiziert (Code) | `coordinator.py` erzeugt dieselbe Attribut-Struktur wie der Toolbox-Ist-Stand (per Baseline-Snapshot bestätigt). |
| 7. Services funktionieren? | ⏳ blockiert (Registrierung verifiziert) | Service-Domain `benni_core_state` ist in HA noch leer (0 Services) → keine Kollision. Ziel: `set_bio_state`, `mark_sleep`, `mark_awake`. Toolbox-Pendants existieren als `bennis_toolbox.benni_context_*`. |
| 8. States nach Neustart erhalten? | ⏳ blockiert | Eigener Storage-Key `benni_core_state_state_<entry_id>`; Restore-Logik 1:1 aus Toolbox. |
| 9. Logs / Warnings / Errors? | ⏳ blockiert | Erst nach Setup aussagekräftig. |
| 10. Shadow-States ≈ Toolbox? | ⏳ blockiert (Baseline erfasst) | Baseline-Snapshot unten als Vergleichsbasis abgelegt. |

Legende: ✅ verifiziert · ⏳ blockiert (Deployment nötig)

## Verifizierte Fakten (laufende HA)

* **Keine Domain-Kollision:** `ha_get_integration` listet 11 Einträge; **kein**
  `benni_core_state`. Toolbox-Eintrag „Benni Context" (`bennis_toolbox`,
  `01KS776D160P47MEX7VQMW13WT`) ist `loaded`.
* **Keine Entity-Kollision:** kein `*.benni_core_state_*` vorhanden.
* **Keine Service-Kollision:** Domain `benni_core_state` hat 0 Services.
  Toolbox: `bennis_toolbox.benni_context_set_bio_state` / `_mark_sleep` /
  `_mark_awake`.

## Shadow-Baseline (Toolbox-Ist-Stand, Snapshot 2026-06-03/04)

| Toolbox-Entity | State | wichtige Attribute |
| --- | --- | --- |
| `sensor.benni_context_master_context` | `zuhause.awake.early_night.frei.free_time` | presence, bio, day_state, day_context, activity |
| `sensor.benni_context_bio_state` | `awake` | last_sleep_start, last_awake_start, wake_needed, wake_next, indicator_pc/ps5/coffee/door/homeoffice |
| `sensor.benni_context_presence_personal` | `zuhause` | — |
| `sensor.benni_context_presence_band` | `home` | — |
| `sensor.benni_context_activity_state` | `free_time` | — |
| `sensor.benni_context_day_state` | `early_night` | — |
| `sensor.benni_context_day_context` | `frei` | — |
| `binary_sensor.benni_context_presence_preheat_active` | `off` | source, started, max_duration_s |

Nach Deployment sollten die `benni_core_state_*`-Pendants — **bei identischer
Eingangs-Konfiguration** — dieselben States liefern. Mögliche legitime
Abweichungen: `bio_state` startet als `sleep` (kein Storage-Import), bis ein
Wake-Indiz/Service greift; zeitabhängige States (`day_state`) hängen am
Auswertungszeitpunkt.

## Deploy-Checkliste (für die echte Liveprüfung)

1. `custom_components/benni_core_state/` auf den HA-Host kopieren
   (oder Repo in HACS als Custom-Repository hinzufügen) und HA neu starten.
2. *Einstellungen → Geräte & Dienste → Integration hinzufügen → Benni Core State*;
   im Flow **dieselben** Quell-Entities/Schwellen wie bei der Toolbox-Instanz wählen.
3. Checks 1–3, 5, 9 ausführen; 10 gegen obige Baseline vergleichen.
4. Service-Test: `benni_core_state.mark_sleep` → `bio_state=sleep`,
   `benni_core_state.mark_awake` → `awake`.
5. HA-Neustart → Check 8 (Persistenz).

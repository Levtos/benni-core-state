# Fahrplan — benni_core_state

**Stand:** 2026-06-08. Teil der koordinierten `benni_*`-Überarbeitung.

## Rolle in der abgestimmten Welt
**Gehirn / Single Source of Truth** für presence / bio / day / activity. Policies (light/climate/…) leiten diese Zustände **nie selbst** ab, sondern konsumieren sie hier als Entities. Trägt außerdem die **Profil-Modell-Blaupause** (`PROFILE_BENNI/ELTERN`, `PROFILE_PREFILL`), an der sich light_policy & Co. ausrichten.

## Offene Punkte (Bahn B — Context-Layer)
- **B3 — Theme-Detection als wiederverwendbarer Kontext.** Statt hardcodierter Jahreszeiten in light_policy soll der Context-Layer das *aktive Theme* liefern. Quellen:
  - **Kalender / Datumsbereiche** (inkl. Eintages-Themes und Bereiche über den Jahreswechsel — z.B. Silvester 30.12.–01.01.).
  - **Season-Sensor** (meteorologisch) für generische Jahreszeiten.
  - **Berechnete Feste** (Ostern, Karneval) — jedes Jahr anderes Datum.
  - Begriff: **Theme** (Jahreszeit *oder* Event/Zeitraum: Pride, Halloween, Geburtstag, Urlaub, Party, custom …).
  - light_policy konsumiert das Theme; die Matrix `theme×phase→look` bleibt dort.

## Status
core_state ist extrahiert, deployt + shadow-verifiziert (1:1 vs Toolbox benni_context). Cut-over bewusst vertagt. Theme-Detection ist additiv und kommt, sobald die Pipeline (core_devices → …) Luft lässt.

## UX
WS-Contract vorhanden; Panel später in der zentralen Umbrella-UX.

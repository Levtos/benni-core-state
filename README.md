# Benni Core State

Standalone Home-Assistant-Integration, die stabile, meinungsstarke Kontext-Sensoren
für ein persönliches Smart-Home liefert: **Presence**, **Bio**, **Day**, **Activity**
und ein **Master-Context**. Statt YAML-Template-Spaghetti gibt es einen einzigen,
testbaren Coordinator mit Enum-Sensoren, Attributen, Hysterese, Freshness-Checks
und Restore-on-Restart.

> **Ist-Stand-Dokumentation.** Diese README beschreibt den **aktuellen Stand**:
> Presence, Bio und Activity stammen aus der extrahierten Toolbox-Logik; der
> Day-State folgt inzwischen neun deterministischen, datumsermittelten
> saisonalen Phasen.

## Herkunft: Extraktion aus Bennis Toolbox

`benni_core_state` ist eine **konservative, technische Extraktion** des Moduls
`benni_context` aus der Umbrella-Integration **Bennis Toolbox**
(`custom_components/bennis_toolbox/modules/benni_context/`).

* Die Presence-/Bio-/Activity-Regeln wurden konservativ übernommen (`logic.py`,
  `models.py` bleiben reine, testbare Compute-Module).
* Der **Day-State** nutzt neun stabile Phasen mit einem saisonalen
  Kalender-Akkordeon. Die Grenzen werden ausschließlich aus lokalem Datum und
  lokaler Zivilzeit berechnet; Solar-Noon, Sonne, Lux, Wetter und Wake-Signale
  sind keine Eingaben.
* Geändert wurde **nur die technische Verdrahtung**: eigene HA-Domain, eigener
  Config-/Options-Flow (statt Umbrella-Modulauswahl), eigene Services, eigene
  Storage-Keys, eigene `unique_id`/Entity-Namespaces.
* Die **alte Toolbox-Version bleibt produktiv** und läuft unverändert weiter.
  Diese Integration läuft im **Shadow-Modus parallel** dazu (siehe unten).

## Neue Domain

```
benni_core_state
```

Einrichtung als eigene Integration:

```
Einstellungen → Geräte & Dienste → Integration hinzufügen → Benni Core State
```

(Nicht mehr „Bennis Toolbox → Modul auswählen → Benni Context".)

## Entities

Alle Entities hängen am Gerät **„<Profil> Core State"**; die Entity-IDs ergeben
sich aus `has_entity_name` und tragen damit das **Profil im Slug** —
kollisionsfrei zur Toolbox-Version (`sensor.benni_context_*`) **und** zwischen
den Routen:

* Route **Benni** → `sensor.benni_core_state_*`
* Route **Eltern** → `sensor.eltern_core_state_*`

Die folgende Tabelle zeigt die Route **Benni**:

| Entity | Typ | Werte |
| --- | --- | --- |
| `sensor.benni_core_state_presence_personal` | enum | `zuhause`, `bei_eltern`, `abwesend` |
| `sensor.benni_core_state_presence_household` | enum | `leer`, `nicht_leer` |
| `sensor.benni_core_state_presence_band` | enum | `home`, `preheat`, `near`, `far` |
| `sensor.benni_core_state_presence_transition` | enum | `none`, `coming_home`, `leaving_home`, `passing_through` |
| `sensor.benni_core_state_presence_effective` | enum | `home`, `away`, `arriving`, `leaving`, `uncertain`, `stale` |
| `sensor.benni_core_state_presence_effective_transition` | enum | `home`, `away`, `arriving`, `leaving`, `uncertain`, `stale` |
| `binary_sensor.benni_core_state_presence_preheat_active` | running | on / off |
| `sensor.benni_core_state_bio_state` | enum | `sleep`, `waking`, `awake` |
| `sensor.benni_core_state_day_state` | enum | `early_night`, `late_night`, `early_morning`, `forenoon`, `midday`, `afternoon`, `late_afternoon`, `evening`, `late_evening` |
| `sensor.benni_core_state_day_context` | enum | `werktag`, `wochenende`, `frei` |
| `sensor.benni_core_state_activity_state` | enum | `sleep`, `waking`, `idle`, `free_time`, `work_home`, `work_away`, `private_time`, `household` |
| `sensor.benni_core_state_master_context` | string | komposit `presence.bio.day_state.day_context.activity` |

Jeder Sensor trägt seine Rohdaten/Schwellen als `extra_state_attributes`
(Tracker-Werte, Distanz, Radien, Wake-Indizien, Preheat-Quelle …). Presence- und
Master-Sensoren bleiben verfügbar und fallen auf dokumentierte Defaults zurück,
statt auf `unavailable` zu gehen.

> **Hinweis zum Master-Sensor:** Der Ist-Stand-Begriff ist `master_context`
> (Objekt-ID `…_master_context`). Die Auftrags-Beispielliste nannte
> `…_master_state`; die Umbenennung wurde **bewusst nicht** vorgenommen, weil
> dieser Auftrag rein technisch ist. Sie gehört in den späteren Core-State-Auftrag.

## Fachregeln (binding, unverändert)

* **`bei_eltern`** ist ein eigener Presence-State und **home-equivalent**: keine
  Away-Abschaltung, keine Anwesenheitssimulation. Eltern-WLAN wird ohne
  Freshness-Gate gewertet. Aus `bei_eltern` heraus gibt es **kein** `coming_home`
  und **kein** Preheat.
* **`coming_home`** entsteht nur aus echter Abwesenheit (vorheriger *realer*
  Presence-State war `abwesend`).
* **Bio-State** ist die einzige Wahrheit für sleep/waking/awake. PC/PS5/Kaffee/Tür
  sind Wake-Indizien (nur in Nicht-Nacht-Phasen wirksam), `wake_needed` nudgt nur
  `sleep → waking`.
* **Day-State** folgt neun kalender-/datumsermittelten Phasen. Keine Grenze,
  einschließlich `00:00`, `midday` oder `14:00`, ist dauerhaft fest. Zwischen
  Winter- und Sommersonnenwende wächst der gesamte Nicht-Nacht-Block mit einer
  Zielgröße von 60 Sekunden je Kalendertag; 40 % der Ausdehnung liegen am
  Morgen, 60 % am Abend. Alle sieben Nicht-Nacht-Phasen werden gleichmäßig
  länger, die zwei Nachtphasen bleiben ungefähr im Verhältnis 2:1 und bilden
  das saisonale Akkordeon. Sonnenwenden sind die Richtungswechsel, Äquinoktien
  liegen in der Mitte des jeweiligen Weges. Die Berechnung ist nicht
  akkumulativ, verwendet die tatsächlichen Kalenderintervalle und erzeugt die
  Grenzen zuerst als lokale Wandzeit; CET/CEST verursacht daher keinen sichtbaren
  einstündigen Sprung in den lokalen Phasen.
  Die `day_state`-Attribute enthalten Datum, aktive Phase, effektive lokale
  Grenzen, Saisonparameter, Reason und Modellversion.
* **Activity** bleibt klein; `sleep`/`waking` spiegeln den Bio-State, TV/Gaming
  etc. sind Media-Kontext (Attribut), kein Activity-Hauptstate.

## Services

```
benni_core_state.set_bio_state   (state: sleep | waking | awake)
benni_core_state.mark_sleep      (Shortcut für state=sleep)
benni_core_state.mark_awake      (Shortcut für state=awake)
```

Funktional identisch zum Toolbox-Ist-Stand: der persistierte Bio-Zustand wird
gepatcht und ein Refresh ausgelöst.

## Config-/Options-Flow

* **Add-Flow** (dreistufig, single-instance): `user` (**Route/Profil**:
  Benni · Eltern) → `entities` (Quell-Entities, profil-vorbefüllt) →
  `thresholds` (Radien & Zeitfenster).
* **Options-Flow** als Menü: `entities` | `thresholds`.
* Das gewählte Profil bestimmt (a) den Entity-Slug (`benni_`/`eltern_`),
  (b) das Vorbefüll-Set und (c) das Panel-Label. Route **Eltern** ist heute
  ohne Prefill (alle Slots leer) — wird befüllt, sobald die Eltern-Anlage real ist.

### Quell-Bindung (Auto-Bind)

Die Eingangs-Entities werden **automatisch aus dem Profil-Map** (`PROFILE_PREFILL`
in `const.py`, Code) gebunden — der `entities`-Schritt ist nur eine **Override-
Schicht**:

```
Auflösung je Slot:  Override (entry.data / später Custom-UX)  ▶  Profil-Map (Code)  ▶  leer
```

* Im `entities`-Schritt werden nur **Abweichungen** vom Code-Default gespeichert.
  Felder leer lassen = Auto-Bind aus Code übernehmen.
* Dadurch **propagieren Map-Updates aus dem Repo** auf alle Anlagen, die den Slot
  nicht überschrieben haben (config-as-code statt 18 Dropdowns klicken).
* Ein späteres Custom-UX schreibt seine Änderungen ebenfalls als Override in
  `entry.data` — der Code-Map bleibt der Default, kein Bruch.

Entity-Auswahl und Schwellwerte folgen dem Toolbox-Muster. Es gibt keine
Solar-Noon-Entity-Bindung: Die Day-State-Berechnung ist vollständig
datumsermittelt.

### Media-/Light-Phasen: Ist-/Soll-Differenz

Die bestehenden Consumer verwenden weiterhin ihre historische Acht-Phasen-
Slugmenge. Media Policy führt in den [Volume-Baselines](https://github.com/Levtos/benni_media_policy/blob/main/custom_components/benni_media_policy/const.py)
`early_morning`, `late_morning`, `forenoon`, `afternoon`, `early_evening`,
`late_evening`, `early_night` und `late_night`; das Subwoofer-Fenster verwendet
ebenfalls `late_morning` bis `late_evening` plus einen separaten lokalen
09:00-Floor. Light Policy führt in seiner [Phasenmatrix](https://github.com/Levtos/benni_light_policy/blob/main/custom_components/benni_light_policy/const.py)
dieselbe historische Menge und erzeugt daraus Theme-/Preset-Keys.

Der aktuelle Core-State-Sollvertrag lautet dagegen:
`early_night`, `late_night`, `early_morning`, `forenoon`, `midday`,
`afternoon`, `late_afternoon`, `evening`, `late_evening`. Die semantische
Zuordnung der historischen `late_morning`-/`early_evening`-Keys sowie die
Consumer-Cutovers bleiben bei den jeweiligen Consumer-Issues und dem
Mapping-Issue [Levtos/benni-core-state#25](https://github.com/Levtos/benni-core-state/issues/25);
dieses Repository führt dafür keine stillen Aliase oder Cutovers aus.

### Schwellwerte (Defaults / Range)

| Schwelle | Default | Range |
| --- | --- | --- |
| `home_radius` | 100 m | 10–5000 |
| `preheat_radius` | 800 m | 50–20000 |
| `near_radius` | 3000 m | 200–100000 |
| `hysteresis_m` | 50 m | 0–2000 |
| `preheat_duration` | 900 s | 60–7200 |
| `tracker_freshness` | 1800 s | 60–86400 |
| `transition_hold` | 120 s | 10–3600 |

## Persistenz

Eigener Storage-Key — **nicht** der alte Toolbox-Key:

```
.storage/benni_core_state_state_<entry_id>
```

Restart-fest (fachlich identisch zum Ist-Stand):

* `bio_state`, `last_sleep_start`, `last_awake_start`
* `transition_state` + Startzeit
* `preheat_active`, `preheat_source`, `preheat_started`

Defaults beim Erststart: `bio_state = sleep`, `transition_state = none`,
`preheat_active = false`. Für den Shadow-Test ist **keine** harte Migration aus dem
alten Toolbox-Storage vorgesehen — die neue Instanz startet mit eigenem Storage.

## Update-Verhalten

Push-getrieben über State-Change-Listener auf allen konfigurierten Input-Entities.
Zusätzlich tickt der Coordinator alle 30 s (`UPDATE_INTERVAL`), um zeitabhängige
States (Phasenwechsel des day_state, Freshness, Preheat-Ablauf) aktuell zu halten.

## Shadow-Modus

Diese Integration ist dafür gebaut, **parallel** zur produktiven Toolbox-Version
zu laufen:

* Eigene Domain, eigene Entity-IDs, eigene `unique_id`s, eigener Storage →
  **keine Kollision** mit `bennis_toolbox` / `benni_context`.
* Alt bleibt produktiv; neu läuft daneben zum 1:1-Vergleich der States.

Empfehlung: beide Sensorgruppen eine Weile nebeneinander beobachten, bevor
Konsumenten (Automationen, YAML in `einhornzentrale`) umgestellt werden.

## Bekannte Abweichungen / offene Punkte

* **`master_context` vs. `master_state`**: bewusst beim Ist-Stand-Namen belassen
  (s. o.).
* **Keine Storage-Migration**: der alte Toolbox-Bio/Preheat/Transition-Zustand
  wird nicht übernommen; die Shadow-Instanz startet mit Default-`sleep`.
* **Logik-Drift zur alten Standalone-Repo**: das frühere `benni_context`-Repo
  enthielt eine ältere Logikvariante (z. B. PC-aus-Sleep → `waking`,
  `compute_bio_state` ohne `day_state`). Übernommen wurde der **Toolbox-Ist-Stand**
  (PC-aus-Sleep in Nicht-Nacht-Phase → `awake`; Wake-Indizien nachts gegated;
  `activity = sleep/waking` spiegelt Bio).
* **Fachlicher Lastenheft-Audit** gegen *Day State*, *Day Context* und
  *Context State* ist **nicht** Teil dieser Extraktion und folgt separat.

## Tests

Reine Logik-Tests gegen `logic.py` (kein laufendes Home Assistant nötig):

```bash
python -m pytest tests/ -q
```

Abgedeckt: Bio-Persistenz & -Regeln inkl. Day-State-Gating, Presence inkl.
`bei_eltern`, GPS-Stale-Fallback, Band-Hysterese, Transition, Preheat
(Hysterese/Sustain/Max-Dauer), Activity-Priorität, alle neun Day-State-Phasen,
Saisonextreme, Äquinoktien, Jahreswechsel und Day-Context-Buckets.

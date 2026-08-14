# Activity-State-Entscheidungsvertrag v1.0.0

**Stand:** 2026-08-07
**Issue:** [benni-core-state#29](https://github.com/Levtos/benni-core-state/issues/29)
**Mapping-Version:** `1.5.0`

## Entscheidung

Core State ist der einzige Owner der kanonischen `activity_state`-Entscheidung.
Media State bleibt ein neutraler, read-only Media-Activity-Feed und liest keinen
fertigen Core-State-Activity-State. Die verbindliche Reihenfolge lautet:

```text
sleep > waking > private_time > gaming > entertainment > music
       > work_home > household > pc_active > free_time > idle
```

Die Entscheidung wird rein aus dem aktuellen Snapshot berechnet. Sie wird nicht
persistiert; nach einem Neustart entsteht sie erneut aus den aktuellen Quellen.
Das Frontend erhält nur das Ergebnis und berechnet weder Kandidaten noch
Priorität.

## Public Decision Contract

Das owner-lokale Attribut `activity_decision` enthält:

- `winner`: kanonischer Gewinner;
- `valid_candidates`: alle zugelassenen Kandidaten in Präzedenzreihenfolge;
- `suppressed_candidates`: zugelassene, aber durch den Gewinner unterdrückte Kandidaten;
- `precedence_reason`: deterministische Begründung des Vorrangs;
- `input_sources`: Quellen je Kandidat;
- `freshness`: Status, Zeitpunkt, Alter und Altersgrenze je relevanter Quelle;
- `quality_status`: schlechtester relevanter Status;
- `degraded_reason`: konkrete nicht-frische oder nicht-verfügbare Quellen;
- `fallback_reason`: Begründung für den sicheren Fallback;
- `decision_timestamp`: Zeitpunkt der Berechnung;
- `contract_version`: `1.0.0`.

Der aktuelle Media-State-Feed besitzt noch kein eigenes Quality-Attribut. Core
State akzeptiert einen bekannten Feedwert deshalb nur, wenn optionale
`quality`/`freshness`/`degraded`-Marker ihn nicht ablehnen und der HA-
`last_changed`-Zeitpunkt höchstens 1.800 Sekunden alt ist. Ein fehlender
Zeitstempel ohne explizites `fresh` gilt als `unknown`. `unknown`,
`unavailable`, `stale` und `degraded` können keinen Media-Kandidaten gewinnen.

Ein gültiger lokaler Kandidat darf trotz eines degradierten Media-Feeds gewinnen;
der Qualitätsstatus und der Feed-Grund bleiben dabei sichtbar. Ohne gültigen
höheren Kandidaten ist `idle` der deterministische Fallback.

## Kompatibilität

- `work_away` bleibt in `ACTIVITY_STATES`, Mapping und bestehenden Consumer-
  Allowlisten erhalten, weil der Wert historisch öffentlich ist. Es gibt keinen
  belegten, aktuellen Eingang, der ihn sicher berechnet; #29 erzeugt ihn daher
  nicht.
- `free_time` bleibt als expliziter Legacy-Feedwert zulässig. Der aktuelle
  Media-State-Producer emittiert `private_time`, `gaming`, `entertainment`,
  `music` oder `idle`; unbekannte Werte werden nicht still zu `free_time`.
- `compute_activity()` bleibt als Winner-only-Kompatibilitätswrapper bestehen.
  Die separat testbare Quelle der Wahrheit ist `compute_activity_decision()`.
- Bestehende Activity-Hold-Regeln bleiben unverändert: `private_time` und
  `gaming` halten hart, `music` und `entertainment` bleiben weiche Holds,
  `pc_active` und `household` mittlere Holds; `free_time` hält nicht.

## Zyklus- und Consumer-Grenze

Der zulässige Signalfluss ist:

```text
Media-State-Rohquellen -> Media-State activity_context feed
                         -> Core-State activity_decision -> activity_state
```

Core State liest keine HomePod-, Denon-, Stash- oder sonstigen Media-Rohwerte.
Consumer-Cutovers, Allowlisten, Releases und Live-Prüfungen sind nicht Teil von
#29. Das Inventar liegt separat in
[`2026-08-07-activity-state-consumer-inventory.md`](2026-08-07-activity-state-consumer-inventory.md).

Die Core-State-Konfiguration exponiert für `private_time` ausschließlich den
sensor-basierten `media_activity_context`-Feed. Der frühere
`private_source`-Config-Key bleibt für das sichere Laden alter Config Entries
erhalten, wird aber weder als Selector angeboten noch als Entity gelesen; eine
vorhandene Bindung wird als `deprecated_ignored` diagnostiziert.

## Quellen

- [Issue #21](https://github.com/Levtos/benni-core-state/issues/21)
- [gemergter PR #23](https://github.com/Levtos/benni-core-state/pull/23)
- [Entscheidungsdelta vom 2026-08-02](2026-08-02-core-state-decision-delta.md)
- [ADR 0002](https://github.com/Levtos/control/blob/main/docs/adr/0002-github-only-governance.md)

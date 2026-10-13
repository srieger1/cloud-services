---
marp: true
theme: default
html: true
inlineSVG: true
paginate: true
header: "Cloud Services | HS Fulda – Bachelor AI"
footer: "Sebastian Rieger · MMNet · Hochschule Fulda"
style: |
  :root {
    --color-primary: #003366;
    --color-accent:  #0066cc;
    --color-light:   #e8f0f8;
  }
  section {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 20px;
    line-height: 1.4;
    padding: 56px 62px;
    color: #1a1a1a;
    background: #ffffff;
  }
  h1 {
    color: var(--color-primary);
    font-size: 1.8em;
    border-bottom: 3px solid var(--color-accent);
    padding-bottom: 0.2em;
  }
  h2 {
    color: var(--color-accent);
    font-size: 1.3em;
  }
  section.title {
    background: var(--color-primary);
    color: #ffffff;
    text-align: center;
    justify-content: center;
  }
  section.title h1 {
    color: #ffffff;
    border-bottom: 3px solid #ffffff;
    font-size: 2em;
  }
  section.title p, section.title h2 {
    color: #cce0ff;
  }
  section.section-break {
    background: var(--color-accent);
    color: #ffffff;
    justify-content: center;
    text-align: center;
  }
  section.section-break h1 {
    color: #ffffff;
    border-color: #ffffff;
    font-size: 2.2em;
  }
  section.section-break p {
    color: #cce0ff;
    font-size: 1.1em;
  }
  ul { margin: 0.4em 0; padding-left: 1.4em; }
  li { margin: 0.3em 0; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
  th { background: var(--color-primary); color: white; padding: 6px 10px; }
  td { padding: 5px 10px; border-bottom: 1px solid #ddd; }
  tr:nth-child(even) td { background: var(--color-light); }
  code { background: var(--color-light); padding: 2px 6px; border-radius: 3px; font-size: 0.85em; }
  blockquote {
    border-left: 4px solid var(--color-accent);
    background: var(--color-light);
    padding: 0.5em 1em;
    margin: 0.5em 0;
    border-radius: 0 4px 4px 0;
  }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1em; }
  .columns3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.8em; }
  .card {
    background: var(--color-light);
    border-left: 4px solid var(--color-accent);
    border-radius: 0 6px 6px 0;
    padding: 0.6em 0.8em;
  }
  .research-card {
    background: rgba(102,170,255,0.12);
    border-left: 4px solid #66aaff;
    border-radius: 0 6px 6px 0;
    padding: 0.6em 0.8em;
  }
  img[alt~="center"] { display: block; margin: 0 auto; }
---

<!-- _class: title -->

# Überwachung, Wartung, Skalierung

## Kapitel 5

Wintersemester 2026/2027
Bachelor AI – Hochschule Fulda
Sebastian Rieger · MMNet

---

## Logging

- Fast jeder Dienst schreibt **Logfiles** — die Frage ist, was darin steht
- **Log-Level** bestimmen den Umfang: so viel wie nötig, so wenig wie möglich — für Debugging temporär erhöhen, danach zurückstellen
- **Keine personenbezogenen Daten**, die Sie nicht brauchen; Umfang und Aufbewahrung dokumentieren
- **Strukturiertes Logging** (JSON) erleichtert Auswertung und Alarmierung erheblich
- **Im Betrieb:** Logs live verfolgen (`kubectl logs -f`) und an zentraler Stelle bündeln

> Ohne Log kein Nachweis — bei einem Vorfall ist das Log oft die einzige Quelle.

🧠 Was würden Sie in Ihrem Dienst loggen — und was bewusst nicht?

**→ umsetzen in:** Abgabe (Logging nachvollziehbar beschreiben).

---

## Log-Speicherung, Rotation und Zentralisierung

| Aspekt | Optionen |
|---|---|
| **Ablage** | Datei (einfach) · Datenbank (auswertbar) · zentrale Plattform |
| **Rotation** | regelmäßig neue Datei, begrenzte Anzahl aufbewahren — sonst läuft das Dateisystem voll |
| **Aufbewahrung** | kurzfristig für den Betrieb, langfristig nur wenn nötig (Kosten, Datenschutz) |

**Zentrale Stacks:**

| Stack | Bestandteile |
|---|---|
| **ELK/Elastic** | Elasticsearch, Logstash/Beats, Kibana |
| **Grafana Loki** | Loki + Agent (**Grafana Alloy**; Promtail ist abgekündigt) + Grafana |
| **Managed** | Cloud-Anbieter-Lösungen, Splunk (Kosten beachten) |

- Automatisiertes Auswerten: Trigger auf Muster → Ticket/Alarm — **Vorsicht vor Alarm-Müdigkeit**
- Logs gehören **nicht** ins Backup (Volumen, Datenschutz)

💡 [Grafana Loki](https://grafana.com/docs/loki/latest/) · [Fluent Bit](https://docs.fluentbit.io/)

**→ umsetzen in:** Lab 6 — Logging-Namespace und Loki in Grafana.

---

## Monitoring und Observability

- **Monitoring** beantwortet: Läuft der Dienst? Wie ausgelastet ist er?
- **Observability** beantwortet: Warum ist er langsam oder falsch — auch bei Fragen, die Sie vorher nicht gestellt haben
- Drei Signale:

| Signal | Aussage | Beispiele |
|---|---|---|
| **Metrics** | Kennzahlen über Zeit | CPU, Requests/s, Latenz, Fehlerrate |
| **Logs** | Ereignisse im Detail | Fehlermeldungen, Zugriffe |
| **Traces** | Weg einer Anfrage durch die Komponenten | Request über Gateway → Service → DB |

- **Wie überwacht man?** Protokoll-Checks (HTTP/TCP), Metriken (Pull), Agenten/Exporters, externes Monitoring
- Werkzeuge in dieser LVA: **Prometheus + Grafana**, Loki für Logs, OpenTelemetry als Standard für Instrumentierung
- Messen Sie aus **Nutzersicht** (Antwortzeit, Fehlerrate), nicht nur Container-Sicht

🧠 Welche eine Kennzahl würde Ihnen sagen, dass Ihr Dienst für Nutzer gerade kaputt ist?

**→ umsetzen in:** Lab 6 — zwei eigene Dashboards bauen.

---

## Reporting und SLA

- **Reporting** liefert Zahlen an Empfänger: intern (Team, Hochschule) und extern (Kunden, Betreiber)
- **Service Level Agreement (SLA):** zugesicherte Qualität — mit Folgen bei Abweichung (Pönalen, Eskalation)
- Für den Betrieb relevant: **Verfügbarkeit** messen, dokumentieren und **alarmieren**, bevor die Grenze reißt

| Verfügbarkeit (Jahresmittel) | maximaler Ausfall |
|---|---|
| 99 % („zwei Neunen") | ≈ 3,65 Tage |
| 99,9 % | ≈ 8,8 Stunden |
| 99,99 % | ≈ 53 Minuten |
| 99,999 % („fünf Neunen") | ≈ 5 Minuten |

- Jede zusätzliche „Neun" kostet überproportional: Redundanz, Personal, Automatisierung, Tests
- **SLOs** setzen: welches Ziel ist für *Ihren* Dienst angemessen — und was passiert, wenn es reißt?

🧠 Welche Verfügbarkeit ist für Ihren Dienst angemessen — und was kostet die nächste „Neun"?

---

## Alarmierung mit SLI und SLO

- **SLI** (Indikator): die gemessene Größe — z. B. Anteil erfolgreicher Anfragen, p95-Latenz
- **SLO** (Ziel): der Anspruch — z. B. „99,9 % der Anfragen erfolgreich im Monat"
- **Fehlerbudget**: 100 % minus SLO — es erlaubt Fehler und macht sie verhandelbar

**Zwei Regeln, die fast immer sinnvoll sind:**

| Regel | Bedingung (Beispiel, PromQL-Idee) |
|---|---|
| Fehlerrate zu hoch | `rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05` |
| Latenz zu hoch | `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1` |

- Alarm an eine **Person**, nicht in einen Kanal ohne Zuständigkeit
- Schlechte Alarme sind schlimmer als keine: jeder Alarm muss eine Handlung auslösen
- Im Vorfall gilt: erst **mildern**, dann Ursache finden (Kapitel 6 für den Wiederanlauf)

💡 [Prometheus Alerting Rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/) · [Google SRE Book (frei online)](https://sre.google/sre-book/table-of-contents/)

🧠 Welcher Alarm hätte den letzten Ausfall in Ihrem Projekt früher sichtbar gemacht?

**→ umsetzen in:** Lab 6 — mindestens eine Alert-Regel definieren.

---

## Troubleshooting

- Fehleranalyse bleibt nicht aus — planbar ist nur, wie geordnet sie abläuft
- **Systematisch:** Symptom beschreiben → eingrenzen → Hypothese prüfen → Ursache beheben
- **Von außen nach innen:** erreichbar? → antwortet er? → Abhängigkeiten erreichbar? → Logs?
- **Isolieren statt raten:** Strecke verkürzen, Komponente tauschen, Port mit `curl`/`nc` testen, `kubectl describe` lesen
- **Rückfallposition** bereithalten: Rollback, Replikat, Restore — vorher klären, wie Sie zurückkommen

| Werkzeug | Wofür |
|---|---|
| `kubectl logs/describe/events` | Pods, Deployments, Events |
| `curl`, `nc`, `dig` | Erreichbarkeit, Ports, DNS |
| `tcpdump`, Wireshark | Netzverkehr · Logs/Loki: Verlauf |

- **Dokumentieren:** 3–5 typische Fehlerbilder mit Ursache und Lösung gehören ins README

🧠 Was war Ihre letzte Fehlersuche — und wie viel davon würden Sie schriftlich festhalten?

**→ umsetzen in:** Betriebshinweise/Troubleshooting-Abschnitt in der Abgabe.

---

## Skalierung und Autoscaling

<div class="columns">
<div>

**Zwei Richtungen**

- **Vertical Scaling (up/down):** größere Instanz — einfach, aber begrenzt und meist mit Ausfallzeit
- **Horizontal Scaling (out/in):** mehr Instanzen — braucht zustandslose Komponenten und Lastverteilung

</div>
<div>

**Automatisch skalieren**

- **HPA** (Horizontal Pod Autoscaler): Pods anhand CPU/Memory oder eigener Metriken
- **Cluster-Autoscaler:** mehr Nodes, wenn Pods nicht passen · **PDB** (Pod Disruption Budget): Updates räumen den Dienst nicht leer

</div>
</div>

- Voraussetzung: **Ressourcen-Requests/Limits** gesetzt — sonst hat der HPA keine Basis; und Autoscaling ohne **Lasttest** ist Glaube, nicht Wissen
- Was skaliert nicht mit? Datenbanken, State, Sessions — hier hilft Replikation oder Auslagern

💡 [HPA dokumentiert](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) · [k6](https://k6.io/)

🧠 Wo würde Ihr Dienst bei doppelter Last zuerst brechen?

**→ umsetzen in:** Add-on 6 (HPA + Lasttest) und Add-on 7 (Self-Healing).

---

## Live-Demo und Abnahmekriterien

**💡 Live-Demo (5 Minuten)** — Werkzeuge: [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards/) · [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/)

1. Dashboard in Grafana öffnen — CPU/Memory des Beispiel-Workloads
2. Last erzeugen (z. B. `kubectl run load --image=... ` oder kleines k6-Skript)
3. HPA beobachten: `kubectl get hpa -w` → Replicas steigen
4. In Loki nach Logzeilen der Anwendung suchen

<!-- Fallback, falls die Umgebung nicht erreichbar ist: Screenshots von Dashboard, `kubectl get hpa -w` und der Loki-Suche zeigen. -->

**Abnahmekriterien (aus den Projekt-Guidelines):**

- Prometheus sammelt Metriken, Grafana visualisiert, Logs über Loki (empfohlen)
- mindestens **2 eigene Dashboards** — nicht nur ein importiertes Standard-Dashboard
- mindestens eine **Alert-Regel** mit sinnvoller Bedingung
- Ressourcen-Requests/Limits für die Workloads gesetzt

**Bonus:** Autoscaling mit nachgewiesenem Lasttest (Add-on 6), Self-Healing-Demo (Add-on 7)

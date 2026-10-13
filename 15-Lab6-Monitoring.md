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

# Lab 6 – Monitoring & Observability

## Metriken, Logs und Dashboards für Ihren Dienst

Wintersemester 2026/2027
Bachelor AI – Hochschule Fulda

---

## Was Sie heute bauen

- **Stack deployen:** `monitoring.yaml`, `logging.yaml` und `wordpress.yaml` aus `lab6/hsfulda-example-monitoring/manifests` installieren
- **Zugang holen:** das Grafana-Admin-Passwort aus dem Secret dekodieren und sich in beiden Instanzen anmelden
- **Metriken beobachten:** CPU- und RAM-Footprint des WordPress-Beispiels im Monitoring-Grafana verfolgen
- **Logs nutzbar machen:** Loki im Logging-Grafana als Datenquelle konfigurieren und Logzeilen der App suchen
- **Aufräumen:** Namespace löschen — räumt auch Load-Balancer und Floating IPs in OpenStack ab

🧠 Welche Frage zu Ihrem Dienst möchten Sie mit einem Dashboard beantworten können?

---

## Kernkonzepte

- **Metrics · Logs · Traces** – Kennzahlen über Zeit, Ereignisse im Detail, Weg einer Anfrage durch die Komponenten
- **Prometheus zieht (Pull)** – scrapt HTTP-Endpunkte; **Exporters** liefern Werte, die die App selbst nicht hat
- **PromQL** – Abfragesprache der Metriken, z. B. `rate(http_requests_total[5m])` für Anfragen pro Sekunde
- **Grafana** – visualisiert Prometheus- und Loki-Daten in Dashboards und Panels
- **Loki + Agent** – Logs zentral, indexiert über Labels statt Volltext; Agent ist heute **Grafana Alloy**
- **Alert-Regeln & Limits** – Regeln im Prometheus/Alertmanager; `resources.requests` und `limits` machen Auslastung vergleichbar

🧠 Was davon fehlt Ihnen, um einen Vorfall in fünf Minuten zu erklären?

---

## Grundlagen-Kasten

<div class="card">

- **Exporter** – kleiner Prozess, der Messwerte als HTTP-Endpunkt bereitstellt, z. B. `node_exporter` oder `kube-state-metrics`
- **Scrape-Intervall** – wie oft Prometheus die Werte abholt (üblich: 15–30 Sekunden)
- **Label** – Schlüssel-Wert-Paar wie `namespace="wordpress"`; filtert Metriken und Logs gleichermaßen
- **Datasource** – in Grafana die Verbindung zu einer Datenquelle, hier Prometheus bzw. Loki
- **Retention** – wie lange Metriken und Logs gespeichert bleiben, bevor sie gelöscht werden

</div>

🧠 Woran würden Sie erkennen, dass Ihr Monitoring selbst ausgefallen ist?

---

## Live-Demo

Ablauf: Dashboard öffnen → Last erzeugen → CPU/Memory live zeigen → in Loki nach Logzeilen suchen.

```
kubectl get secret -n monitoring -l app.kubernetes.io/component=admin-secret \
  -o jsonpath="{.items[0].data.admin-password}" | base64 -d; echo
kubectl run loadgen --image=busybox --restart=Never -- \
  sh -c 'while true; do wget -q -O- http://wordpress | wc -c; done'
```

In Grafana **Explore** als Log-Abfrage: `{namespace="wordpress"}`

💡 Grafana Dashboards: https://grafana.com/docs/grafana/latest/dashboards/
💡 Prometheus PromQL: https://prometheus.io/docs/prometheus/latest/querying/basics/

🧠 Welche Last haben Sie erzeugt – und wo hätten Sie sie im Dashboard zuerst gesehen?

<!--
Fallback, falls die Umgebung nicht erreichbar ist: Screenshot des Dashboards zeigen und die Kommandozeile live vorführen
(Secret dekodieren, `kubectl get pods -n monitoring -n logging`), statt auf das Cluster zu warten.
Die installierten Charts heißen im Beispiel `monitoring.yaml`, `logging.yaml`, `wordpress.yaml` und werden in der
rke2-Automatik als Helm-Charts angewendet (`kubectl apply -f <datei>.yaml`, Rückbau mit `kubectl delete -f`).
-->

---

## Abnahmekriterien

Aus den Projekt-Guidelines – das zählt für die Bewertung:

- **Prometheus sammelt Metriken, Grafana visualisiert sie** – Pflichtbestandteil Ihres Projekts
- **Loki aggregiert Logs** und ist in Grafana als Datenquelle eingebunden (empfohlen)
- **Mindestens 2 eigene Grafana-Dashboards** – selbst gebaut, nicht nur eine importierte Vorlage
- **Mindestens eine Alarm-Regel**, die auslöst und eine benannte Handlung nach sich zieht
- **README dokumentiert** Metriken, Dashboards und Alarme inklusive Architekturdiagramm

🧠 Wer in Ihrem Team schaut im Vorfall zuerst ins Dashboard – und weiß, wo er suchen muss?

---

## Deep Dive – freiwillig für Fortgeschrittene

- **SLO-Burn-Rate-Alarme:** statt starrer Schwellen das Fehlerbudget beobachten — schnell brennend alarmiert sofort, langsam brennend erzeugt ein Ticket.
- **Chaos-Experiment:** einen Pod killen und die Erholungszeit im Dashboard messen; mit mehreren Nodes dasselbe für einen Node.

💡 Google SRE Workbook – Alerting on SLOs: https://sre.google/workbook/alerting-on-slos/

🧠 Wie viel Ausfall ist für Ihren Dienst noch vertretbar, bevor ein Alarm kommen muss?

---

## Story: „Mal eben schnell … schleichend im Betrieb"

*(Platzhalter)* Hier trägt der Dozent eine erzählte Praxisgeschichte zum Monitoring ein.

<!--
Story/Beispiel trägt der Dozent nach (Kategorie: „mal eben schnell … sicher kaputt" oder „… schleichend im Betrieb").
Vorlage: zwei Merker (Herausforderung / Konsequenz) plus genau eine 🧠-Frage; Beispielfolie siehe 01-Grundlagen.md.
-->

---

## Lessons Learned

- **Promtail ist abgekündigt** – der Standard-Agent für Loki heißt heute **Grafana Alloy**; alte Tutorials führen in die Sackgasse.
- **Alert-Flut macht taub** – feingranulare Regeln (etwa jede Meldung des GPU-Operators) erzeugen mehr Alarme als Handlungen.
- **Unbegrenzte Log-Retention kostet** – jedes zusätzliche Feld und jeder Aufbewahrungstag kostet Speicher und Geld.
- **Dashboard ohne Nutzersicht** – nur Container-CPU und -RAM beantworten im Vorfall keine Nutzerfrage; Requests, Latenz und Fehlerrate gehören dazu.

🧠 Welcher Alarm hat Sie zuletzt gestört – und was hätten Sie gebraucht, damit er Ihnen hilft?

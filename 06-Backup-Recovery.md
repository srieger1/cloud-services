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

# Backup & Recovery

## Kapitel 6

Wintersemester 2026/2027
Bachelor AI – Hochschule Fulda
Sebastian Rieger · MMNet

---

## Wozu Backup — und die 3-2-1-Regel

| Zweck | Frage |
|---|---|
| **Disaster Recovery** | Wie komme ich zurück, wenn Standort oder Cluster ausfällt? |
| **Operational Recovery** | Wie hole ich versehentlich Gelöschtes zurück? |
| **Archivierung** | Was muss ich wie lange aufbewahren (Compliance)? |

**3-2-1-Regel:**

- **3** Kopien der Daten (Original + 2 Backups)
- **2** verschiedene Medien/Technologien
- **1** Kopie **offline/extern** — nicht vom laufenden System erreichbar

- Der teuerste Fehler ist das **ungeprüfte** Backup: Es sieht vorhanden aus, ist aber unbrauchbar
- Backups gehören **nicht** auf denselben Storage wie die Produktivdaten (Volume, Cluster, Account)

🧠 Wo liegt Ihre einzige Kopie gerade — und was passiert, wenn dieser Ort verschwindet?

**→ umsetzen in:** Add-on 8 (Backup & DR).

---

## RPO, RTO und Aufbewahrung

| Kennzahl | Bedeutung | Bestimmt |
|---|---|---|
| **RPO** (Recovery Point Objective) | maximal akzeptabler **Datenverlust** | Backup-Intervall |
| **RTO** (Recovery Time Objective) | maximal akzeptable **Ausfallzeit** | Wiederherstellungsverfahren (Restore, Failover, Standby) |

**Fragen, die Sie beantworten müssen:**

- Welche Daten werden gesichert — und wie oft darf die Sicherung dauern?
- Wie viele Kopien werden aufgehoben, wie lange, an welchem Ort?
- Wird nur der Dienst oder auch sein **Zustand** gesichert (Datenbank, Volumes, Secrets)?
- Wer stellt wieder her — und wie lange darf das im Ernstfall dauern?

- **Retention** ist eine Entscheidung: täglich/wöchentlich/monatlich, gelöscht nach X Tagen
- Unterschied: **Backup** schützt den Betrieb, **Archiv** erfüllt Aufbewahrungspflichten

🧠 Wie lange darf Ihr Dienst ausfallen, bevor es weh tut — und haben Sie das gebaut?

**→ umsetzen in:** Abgabe — RTO/RPO und Retention dokumentieren.

---

## Backup-Typen

| Typ | Prinzip | Vorteil | Nachteil |
|---|---|---|---|
| **Full** | alles vollständig | einfachster Restore | lange Sicherung, viel Platz |
| **Inkrementell** | Änderungen **seit der letzten Sicherung** | schnell, wenig Platz | Restore braucht **Full + alle Inkremente** |
| **Differentiell** | Änderungen **seit dem letzten Full** | Restore braucht Full + letztes Differenzial | wächst zwischen den Fulls |

- Typ und Intervall bestimmen **Sicherungsdauer** und **Wiederherstellungsdauer** — und damit Ihr RTO
- Typische Kombination: wöchentlich Full, täglich inkrementell, dazu stündliche Snapshots für kritische Daten
- Übung: einmal durchrechnen, wie lange ein Restore mit Ihrer Strategie dauert — Papier reicht

🧠 Würden Sie mit Ihrer Strategie einen Restore von letzter Woche heute in 30 Minuten schaffen?

**→ umsetzen in:** Betriebshinweise — Backup-Konzept beschreiben.

---

## Auf welcher Ebene wird gesichert?

<div class="columns">
<div>

**Zustand der Anwendung**

- **Hot/Online:** läuft weiter, Risiko inkonsistenter Dateien → Anwendungs-Backup oder konsistenter **Snapshot**
- **Cold/Offline:** Anwendung gestoppt, konsistent, aber Ausfallzeit

**Verfahren**

- **Datei-basiert:** selektiv, langsam bei vielen Kleindateien
- **Image-/VM-basiert:** ganze Systeme, Snapshots
- **Block-basiert:** Storage-Ebene, schnell
- **Dump-basiert:** z. B. `pg_dump` — für Datenbanken der richtige Weg

</div>
<div>

**Was ist im Kubernetes-Kontext relevant?**

- **Persistente Volumes (PVC)** über CSI-Snapshots
- **Manifeste/Helm-Charts** — liegen im Git, sind also „gesichert"
- **Secrets und ConfigMaps** — nicht im Git, deshalb explizit sichern
- **Cluster-Zustand:** nicht mit Backup verwechseln, sondern **aus Code neu erzeugen**

</div>
</div>

> Merksatz: **Daten restaurieren, Infrastruktur neu erzeugen.**

🧠 Was von Ihrem Dienst können Sie heute nicht wiederherstellen, wenn der Cluster weg ist?

---

## Replikation ist kein Backup

- **Replikation** hält Kopien aktuell: lokal (gleiches Array/RZ) oder remote (anderer Standort), synchron oder asynchron
- Nutzen: schnelle Wiederherstellung, Test-/Analyseumgebung, Migration
- **Aber:**

| Falle | Konsequenz |
|---|---|
| Gelöschtes wird mitrepliziert | Der Fehler ist sofort auf allen Kopien |
| Ransomware verschlüsselt | Auch die Replikate werden verschlüsselt (wenn erreichbar) |
| Keine Historie | Kein Rücksprung auf einen früheren Stand |
| Konsistenz | Replikate können auseinanderlaufen |

- Deshalb: Replikation **plus** echte, versionierte, offline gehaltene Backups
- Objekt-Storage kann das unterstützen: Versionierung und Object Lock (WORM) gegen Löschen/Verändern

💡 [S3 Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html) · [S3 Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html)

🧠 Wenn ein Angreifer heute Schreibzugriff auf Ihre Daten hätte: Welche Kopie überlebt?

---

## Werkzeuge: Velero, Snapshots und Secrets

<div class="columns">
<div>

**Kubernetes-Backup mit Velero**

- sichert **Ressourcen** (Manifeste) und **Volumes** (über CSI-Snapshots)
- Wiederherstellung in ein neues Namespace oder einen neuen Cluster
- Zeitplan (Schedule) und Retention gehören zur Konfiguration
- 💡 [Velero](https://velero.io/docs/) — im Lab-Repo liegen fertige Manifeste (`velero.yaml`, `velero-ns.yaml`)

</div>
<div>

**Was oft vergessen wird**

- **Secrets**: der Schlüssel für Sealed Secrets ist verloren = alle Secrets verloren
- **Konfiguration**: `tfvars`, `values.yaml`, Chart-Versionen
- **Datenbanken**: konsistente Dumps statt Dateikopien
- **Ziele außerhalb**: S3-kompatibler Speicher, anderes Konto, anderer Standort

</div>
</div>

- Backup-Jobs gehören **überwacht**: ein fehlgeschlagenes Backup, das niemand bemerkt, ist kein Backup

🧠 Wo in Ihrem Setup würde ein Restore heute zuerst scheitern?

**→ umsetzen in:** Add-on 8 — Velero einrichten und Ziel konfigurieren.

---

## Restore-Nachweis

**Der Nachweis ist Teil der Bonus-Abgabe (Add-on 8):**

| Punkt | Nachweis |
|---|---|
| Was wird gesichert? | Daten, Konfiguration, Secrets, Manifeste |
| Wie und wie oft? | Werkzeug, Zeitplan, Retention |
| Wo liegen die Kopien? | Ziel, Zugriff, Offline-Anteil |
| **RTO/RPO** | Zielwerte mit Begründung |
| **Restore-Test** | Datum, Dauer, was lief schief, was wurde gefixt |

💡 Live-Demo (6 Minuten) — [Velero Docs](https://velero.io/docs/): Backup starten → `velero backup get` → Daten löschen → Restore in ein neues Namespace → Ergebnis zeigen.

<!-- Fallback: `velero describe backup <name>` und die Logs zeigen, wenn der Cluster nicht bereitsteht. -->

- **Fehler aus dem letzten Semester:** Der Restore war der größte Zeitfresser — üben Sie ihn **vor** der Abgabe, einmal reicht
- Messen Sie die Dauer: Sie ist Ihr tatsächlicher RTO, nicht der gewünschte

🧠 Ist Ihr Restore jemals getestet worden — oder ist er bisher eine Annahme?

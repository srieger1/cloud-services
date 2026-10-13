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

# Dokumentation im Repo

## Kapitel 4

Wintersemester 2026/2027
Bachelor AI – Hochschule Fulda
Sebastian Rieger · MMNet

---

## Warum dokumentieren?

**Ihre Abgabe ist Code — und der Code allein erklärt sich nicht.**

- **Zielgruppe:** Ihre Nachfolger:innen (auch Sie selbst in vier Wochen), die Bewertung, im Beruf: das nächste Team
- Ein fremder Mensch soll Ihr Deployment **in 30 Minuten nachbauen** können — ohne Sie zu fragen
- Gute Dokumentation ist **kurz**, **aktuell** und **auffindbar**; schlechte Dokumentation ist schlimmer als keine
- Dokumentation ist Teil der Abgabe: README mit **Architekturdiagramm** ist ausdrücklich gefordert

> **Was zählt:** Reproduzierbarkeit. Ein Dienst, den nur Sie starten können, ist ein Risiko für den Betrieb.

🧠 Wenn Sie nächste Woche ausfallen — was fehlt Ihrer Vertretung als Erstes?

---

## README-Struktur

| Abschnitt | Inhalt |
|---|---|
| **Zweck** | Ein Absatz: welcher Dienst, für wen, welcher Nutzen |
| **Architektur** | Diagramm: Komponenten, Datenfluss, externe Abhängigkeiten |
| **Voraussetzungen** | Zugänge, Tools, Versionen, Ressourcen (Cluster, Netz, Storage) |
| **Deploy** | Schritt-für-Schritt: `terraform apply`, Helm/Argo CD, Reihenfolge der Namespaces |
| **Konfiguration** | die wirklich wichtigen Parameter und wo sie stehen (`tfvars`, `values.yaml`) |
| **Betrieb** | Start/Stop, Zugriff, Monitoring-Link, Backup, Teardown |
| **Troubleshooting** | 3–5 typische Fehlerbilder mit Ursache und Lösung |

- Kurz halten: Verweise auf IaC-Dateien statt Inhalte doppelt zu pflegen

💡 [README-Guidelines (Make a README)](https://www.makeareadme.com/) · [Diátaxis (Doku-Struktur)](https://diataxis.fr/)

**→ umsetzen in:** Abgabe — README ist Teil der Bewertung.

---

## Repo-Hygiene

<div class="columns">
<div>

**Struktur, die sich selbst erklärt**

```
.
├── app/        Anwendung, Dockerfile
├── infra/      Terraform
├── k8s/        Manifeste oder Helm-Chart
├── docs/       Betriebshinweise, Diagramme
└── README.md
```

- `.gitignore` für State-Dateien, `.env`, lokale Artefakte
- `terraform.tfvars.example` als Vorlage **ohne echte Werte**

</div>
<div>

**Was nicht ins Repo gehört**

- Zugangsdaten, Tokens, Kubeconfigs, `.tfstate` mit Secrets
- große Binaries, Build-Artefakte, Kopien fremder Charts (als Abhängigkeit einbinden)

**Kurzprüfung:** `git status` ansehen und verdächtige Dateien mit `gitleaks` prüfen

</div>
</div>

🧠 Was würde ein Fremder aus Ihrem Repo lernen — und was würde er über Ihre Infrastruktur erraten müssen?

**→ umsetzen in:** W2 — Repo anlegen und ab dann pflegen.

---

## Betriebshinweise für die Vorführung

<div class="columns">
<div>

**Damit es im Ernstfall läuft**

- **Start/Stop und Zugriff:** welche Befehle, welche URLs/Ports, welche Rollen (Zugangsdaten **ohne** Passwörter)
- **Abhängigkeiten:** Cluster, Netz, Storage, externe Dienste
- **Wartung und Kosten:** wie aktualisieren/zurückrollen, was kostet Geld, was muss beim Teardown weg?

</div>
<div>

**Was die Bewertung sehen will**

- README mit Architekturdiagramm, alle Infrastruktur als Code
- Deployment über Pipeline/GitOps statt per Hand
- Monitoring mit eigenen Dashboards; Restore nachweisbar (Bonus)

</div>
</div>

> **Abgabe:** IaC-Code als Repo oder Archiv — plus kurze Betriebshinweise, damit wir Ihren Dienst prüfen können.

---

## Vorlagen, Begriffe und weiterführende Links

<div class="columns">
<div class="card">

**Grundlagen-Kasten**
**IaC** – Infrastruktur als Code (Terraform)
**GitOps** – Git als Quelle der Wahrheit
**Runbook** – Handlungsanleitung für wiederkehrende Aufgaben
**Architekturdiagramm** – Komponenten und Datenflüsse, nicht Kabelpläne

</div>
<div>

- 💡 [Terraform Dokumentation](https://developer.hashicorp.com/terraform/docs)
- 💡 [Argo CD](https://argo-cd.readthedocs.io/) · [Helm](https://helm.sh/docs/)
- 💡 [Kubernetes Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
- 💡 Beispiel-Repos: [cloud-services-examples](https://github.com/srieger1/cloud-services-examples)

</div>
</div>

- Als Team gepflegt: eine Datei, eine Wahrheit — keine drei README-Versionen in Chats
- Änderungen an der Doku laufen **mit** der Änderung am Code, nicht danach

🧠 Wer in Ihrem Team aktualisiert das README, wenn morgen eine Komponente dazukommt?

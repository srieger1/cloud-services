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

# Anforderungen

## Kapitel 3

Wintersemester 2026/2027
Bachelor AI – Hochschule Fulda
Sebastian Rieger · MMNet

---

## Kapitelübersicht und Lernziele

**Wie ein Dienst geplant, eingeführt und betrieben wird** — und welche Anforderungen daraus für Ihre Abgabe folgen.

Nach diesem Kapitel sollten Sie wissen…

- Wie der Weg von der **Bedarfsanalyse** bis zum **Go-Live** aussieht (inkl. Rollback)
- Was **DevOps, GitOps, SRE und Platform Engineering** unterscheiden — und was sie verbindet
- Wie **Automatisierung** und **Kostenkontrolle** zusammenhängen
- Wie Sie **Secrets**, **Images** und **Regeln** im Griff behalten (Secrets Management, Supply Chain, Policy as Code)
- Worauf Sie beim **sicheren Betrieb** achten — und was diese LVA bewusst nicht abdeckt

> **Ziel:** Sie können für Ihren Dienst begründen, was Sie automatisiert, abgesichert und dokumentiert haben.

---

## Planung, Einführung und Betrieb

<div class="columns">
<div>

**Planung**

- Bedarf und Anforderungen klären (mit den Nutzer:innen); Infrastruktur, Abhängigkeiten, Kostenrahmen
- Konzept: Architektur, Use-Cases, Betriebsmodell
- **Proof of Concept**, dann Prototyp und Lasttest

</div>
<div>

**Einführung und Betrieb**

- Kein „Big Bang": Migration nutzergruppenweise, Rollback-Option, günstiger Zeitpunkt
- **Change/Configuration Management:** Änderungen nachvollziehbar — Git ist die Historie
- **Problem/Incident + SLA:** Zuständigkeit, Vertretung, Wartungsfenster, Eskalation

</div>
</div>

🧠 Was müsste passieren, damit Sie Ihren Dienst in fünf Minuten auf den vorherigen Stand zurückrollen können?

> **→ umsetzen in:** Exposé (W1) und Abgabe-Dokumentation.

---

## DevOps, GitOps, SRE und Platform Engineering

<div class="columns">
<div class="card">

**DevOps**
Verzahnung von Entwicklung und Betrieb: kurze Release-Zyklen, gemeinsame Verantwortung. Ursprünglich eine Reaktion auf langsame, riskante Releases.

</div>
<div class="card">

**GitOps**
Der gewünschte Zustand steht **deklarativ im Git**; ein Controller gleicht die Umgebung laufend ab. Änderungen laufen über Pull Requests.

</div>
</div>
<div class="columns">
<div class="card">

**SRE**
Betrieb als Ingenieursdisziplin: **SLOs**, Fehlerbudget, Blameless Postmortems, Automatisierung statt Handarbeit.

</div>
<div class="card">

**Platform Engineering**
Die interne **Plattform als Produkt**: Self-Service und Golden Paths, damit Teams nicht jede Entscheidung neu treffen.

</div>
</div>

- Gemeinsamer Nenner: **Automatisierung** und **Nachvollziehbarkeit**
- Für Sie relevant: Git als Quelle der Wahrheit, Pipeline als Änderungswerkzeug, Betrieb als Teil der Entwicklung

🧠 Welche dieser Ideen brauchen Sie für Ihr Projekt wirklich — und welche ist für ein Semesterprojekt zu viel?

> **→ umsetzen in:** Lab 5 (CI/CD und Argo CD).

---

## Automatisierung und Kostenkontrolle

- **Automatisieren** Sie die immer gleichen Aufgaben: Provisionieren (Terraform), Bootstrapping (cloud-init), Deployen (Helm/Argo CD), Testen (Pipeline)
- **Git als Quelle der Wahrheit:** Was nicht im Repo steht, existiert nicht — Reproduzierbarkeit ist der Gewinn
- **Kostenkontrolle (FinOps):** Budget kennen und **Alarm** setzen; Ressourcen sofort beenden
- **Achtung Reste:** Volumes, Floating IPs, Load Balancer und Snapshots überleben ihr Deployment — Konsole prüfen

💡 [AWS Pricing Calculator](https://calculator.aws/) · [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

🧠 Was kostet Ihr Dienst pro Woche, wenn Sie ihn laufen lassen — und wer merkt es, wenn das Budget reißt?

> **→ umsetzen in:** jedes Lab endet mit Aufräumen; Kostenschätzung gehört in Ihre Abgabe.

---

## Secrets Management

**Regel Nummer eins: keine Secrets im Git.**

| Ort | Bewertung |
|---|---|
| Im Quellcode oder in `values.yaml` | ❌ sofort im Commit-Verlauf, auch nach dem Löschen |
| `.env`-Datei im Repo | ❌ nur, wenn ausschließlich lokal und per `.gitignore` ausgeschlossen |
| CI-Variablen/Secrets (GitHub/GitLab) | ✅ für Pipeline-Zugänge |
| Kubernetes-Secret (manuell) | ⚠️ sichtbar für alle mit Lesezugriff im Namespace |
| **Sealed Secrets**, **SOPS**, **External Secrets**, **Vault** | ✅ verschlüsselt im Git bzw. zentral verwaltet |

- Auch **Zugangsdaten für Dienste** (Datenbank, Registry, Cloud) gehören in diesen Prozess
- **Rotation** einplanen: Wie wechseln Sie ein Passwort, ohne alles neu zu deployen?
- Werkzeug zum Prüfen: `gitleaks`/`trufflehog` über das eigene Repo laufen lassen

🧠 Wo liegen die Zugangsdaten Ihres Dienstes heute — und wer hat sie schon gesehen?

> **→ umsetzen in:** Lab 5 (Secrets in der Pipeline) und Abgabe (README ohne Secrets).

---

## Images und Regeln im Griff

<div class="columns">
<div class="card">

**Supply-Chain-Sicherheit**

- Fremde Images sind fremder Code — Registry-Ausfälle passieren (Bitnami-Images wurden im letzten Semester entfernt)
- **Digest pinnen** statt `latest`; Images **scannen** (`trivy`, `grype`)
- **SBOM** erzeugen, Images signieren (`cosign`) — für den Ausblick

</div>
<div class="card">

**Policy as Code**

- Regeln als Code im Cluster: **Kyverno** oder **OPA Gatekeeper**
- Beispiele: kein `privileged: true`, Ressourcen-Limits, Labels erzwingen
- Nutzen: Guardrails und nachweisbare Einhaltung — für Sie genügt „wissen, dass es das gibt"

</div>
</div>

💡 [Trivy](https://trivy.dev/) · [Kyverno](https://kyverno.io/) · [SLSA](https://slsa.dev/)

🧠 Wer prüft eigentlich, dass die Regeln eingehalten werden — im Cluster und in Ihrem Repo?

---

## Sicherheit im Betrieb: worauf achten

- **Angriffsfläche minimieren:** nur notwendige Dienste und Ports
- **Verschlüsseln:** TLS überall dort, wo Zugangsdaten oder Nutzerdaten fließen
- **Authentifizieren:** Rollen statt geteilter Passwörter (OIDC oder Kubernetes-RBAC)
- **Aktualisieren:** Images regelmäßig neu bauen — „läuft ja" ist kein Sicherheitskonzept
- **Beobachten:** Logging und Alarme für Anmeldungen, Fehlerraten, Ressourcen
- **Wiederherstellen:** Backup und Restore testen (Kapitel 6)

> Security wird hier **anwendungsbezogen** behandelt, nicht als eigenes Fach. **Merker: Verweis Prof. Zohner.**

💡 [BSI IT-Grundschutz](https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/it-grundschutz_node.html) · [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

🧠 Welche Ihrer offenen Ports würden Sie einem Angreifer zuerst erklären müssen?

---

## Abnahmekriterien für Ihre Abgabe

**Pflicht (mindestens 5 von 6 Labs umgesetzt):**

- **1 Anwendung:** Dockerfile(s), Multi-Stage, `docker-compose.yml`
- **2 IaC:** alles in Terraform, Variablen/Outputs, `terraform.tfvars.example`, Remote State, README mit Architekturdiagramm
- **3 Orchestrierung:** Manifeste **oder** Helm-Chart; Exposure über ClusterIP/LoadBalancer/Ingress
- **4 CI/CD:** Build, Test, Image, Push, Deploy; zwei Umgebungen; Secrets über CI-Secrets
- **5 Monitoring:** Prometheus, Grafana, **2 eigene Dashboards**; Loki empfohlen

**Bonus:** 6 Auto-Scaling (HPA + k6) · 7 HA & Self-Healing (Replicas, Probes, PDB) · 8 Backup & DR (Velero, RTO/RPO, Restore)

> **Abgabe:** IaC-Code als Repo oder Archiv; Präsentation entfällt — Beitrag Einzelner im Rundgang.

---

## Lernzielkontrolle ✍️🧠

- Beschreiben Sie den Weg von der **Bedarfsanalyse** bis zum **Go-Live** — inklusive Rollback-Option.
- Was unterscheidet **DevOps, GitOps, SRE und Platform Engineering**? Was ist der gemeinsame Nenner?
- Was heißt **„Git als Quelle der Wahrheit"** — und was folgt daraus für Ihre Änderungen?
- Welche **Kostenfallen** kennen Sie in Ihrem Projekt (Volumes, Load Balancer, vergessene Instanzen)?
- Wo liegen Ihre **Secrets**, und wie kämen Sie an ein geleaktes Secret heran?
- Warum reicht es nicht, ein Image nur zu „ziehen" — was sollten Sie vor dem Deploy prüfen?
- Nennen Sie **fünf Maßnahmen**, mit denen Sie Ihren Dienst im Betrieb absichern.

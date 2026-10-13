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

# Lab 3 – Infrastructure as Code

## Vom Klick zur deklarierten Infrastruktur mit Terraform

Wintersemester 2026/2027
Bachelor AI – Hochschule Fulda

---

## Was Sie heute bauen

- **cloud-init-Rückblick:** bash-Skript gegen cloud-config vergleichen, Logs unter `/var/log/cloud-init*.log` auswerten
- **Terraform installieren** und ein Remote-State-Backend einrichten
- **Lab 2 als Code:** die manuellen Schritte als Terraform nachbauen — Instanz + Docker + Container
- **Alternativen ansehen:** Ansible/SaltStack prüfen und mit Terraform kombinieren
- **Diskussion:** Vor- und Nachteile von Terraform in der Gruppe abwägen
- 💡 Lab-Repo: [cloud-services-examples/lab3](https://github.com/srieger1/cloud-services-examples/tree/main/lab3)

<!--
Zeitbedarf: 15–20 min Intro; die Bearbeitung läuft in Block B.
Aufgabe 1 ist Wiederholung aus Lab 2 — kurz halten, Fokus liegt auf Aufgabe 2.
-->

---

## Kernkonzepte

- **Deklarativ:** Sie beschreiben den **Zielzustand**, nicht die einzelnen Schritte
- **Provider & Ressourcen:** der OpenStack-Provider spricht die API an, z. B. `openstack_compute_instance_v2`
- **Variablen & Outputs:** Eingaben oben, Ergebnisse unten — Outputs wie die Floating IP weiterverwenden
- **State:** Terraform-Gedächtnis, welche Ressource zu welchem Code gehört — lokal oder in einem Remote-Backend
- **Workflow:** `init` → `plan` → `apply` → `destroy`; den Plan **vor** dem Apply lesen
- **Module, Idempotenz, Drift:** wiederverwendbare Bausteine; wiederholtes `apply` ändert nichts; `plan` zeigt Abweichungen

---

## Grundlagen-Kasten

<div class="card">

**IaC** — Infrastruktur als versionierter Code im Git statt als Handarbeit in der Konsole.
**Provider** — Plugin, das die API eines Anbieters anspricht (OpenStack, AWS …).
**State** — Abbildung Code ↔ reale Ressource; ohne ihn kennt Terraform seinen Bestand nicht.
**Idempotenz** — mehrfaches Ausführen führt zum selben Zustand.
**Drift** — Änderung außerhalb von Terraform; der nächste `plan` macht sie sichtbar.

</div>

---

## Live-Demo

Wir bauen die Lab-2-Instanz mit Terraform nach und verfolgen, was dabei entsteht.

1. `terraform init && terraform plan` — Provider laden, Plan lesen
2. `terraform apply` — Instanz anlegen, Ausgabe der Floating IP
3. Im OpenStack-Dashboard die Ressourcen zeigen, `terraform state list`, dann `terraform destroy`

💡 [Terraform-Dokumentation](https://developer.hashicorp.com/terraform/docs)

<!--
Fallback, falls die Umgebung nicht erreichbar ist: Screenshot bzw. die Kommando-Zeile zeigen
(`terraform plan`-Ausgabe, Dashboard-Ansicht Instanz/Netzwerk) und die Erwartung mündlich erklären.
Nach dem `destroy` bewusst auf das schauen, was übrig bleibt (Volume, Floating IP, Security Group).
-->

---

## Abnahmekriterien

- **Gesamte Infrastruktur** ist in Terraform definiert — keine manuellen Schritte
- **Variablen und Outputs** werden sinnvoll genutzt
- **Module** für wiederkehrende Bausteine (empfohlen bei komplexeren Setups)
- **`terraform.tfvars.example`** liegt im Repo — echte Secrets nicht
- **State-Management** über ein Remote-Backend
- **README mit Architekturdiagramm** — eine fremde Person kann es nachbauen

🧠 Könnte eine fremde Person Ihr Deployment in 30 Minuten aus dem Repo nachbauen?

---

## Deep Dive

**Freiwillig — für Fortgeschrittene:**

- **Crossplane vs. Terraform:** Kubernetes-native Provisionierung — Ressourcen als CRDs im Cluster, ein Controller hält den Soll-Zustand fortlaufend; Terraform arbeitet pro `apply`-Lauf.
  → [Crossplane-Dokumentation](https://docs.crossplane.io/)
- **Policy as Code:** OPA/Kyverno erzwingen Regeln (z. B. „keine offenen Security Groups"), bevor etwas entsteht — statt Prüfung per Review.
  → [Open Policy Agent](https://www.openpolicyagent.org/docs/), [Kyverno](https://kyverno.io/docs/)

🧠 Wann ist fortlaufende Reconciliation wie bei Crossplane die bessere Wahl — und wann genügt der `apply`-Lauf?

---

## Story: Der Klick, den niemand kennt

*Platzhalter — hier erzählt der Dozent eine passende Praxisgeschichte.*

<!--
Story/Beispiel trägt der Dozent nach (Kategorie: „mal eben schnell … sicher kaputt" oder „… schleichend im Betrieb").
-->

---

## Lessons Learned

- **`destroy` hängt:** Volumes und Load-Balancer bleiben zurück und blockieren das Löschen — danach im Dashboard prüfen, was übrig ist.
- **Secrets im Git:** Zugangsdaten in `.tf` oder `tfvars` landen im Repository — Werte über Variablen und externe Quellen zuführen.
- **Ohne Remote-State kein Team:** parallele Läufe überschreiben sich, es gibt kein Locking — State gehört in ein Backend.
- **`apply` ohne `plan` lesen:** die häufigste Ursache für unerwartete Änderungen an laufender Infrastruktur.

💡 [State-Management (Remote Backends)](https://developer.hashicorp.com/terraform/language/state)

🧠 Welchen Ihrer manuellen Handgriffe aus Lab 2 würden Sie als Erstes in Code gießen — und warum?

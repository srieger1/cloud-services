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

# Lab 7 – Referenzprojekt & Ausblick

## Vom Projekt zum Berufsbild

Wintersemester 2026/2027
Bachelor AI – Hochschule Fulda
Sebastian Rieger · MMNet

<!--
Abschluss-Deck des Lab-Tracks (kein Hands-on-Lab): Rückblick auf das Semesterprojekt,
Einordnung in Plattform-Engineering und Berufsfelder. Zeitbedarf: ein Block.
Ersatzlos für die bisherigen Moodle-Lab-Intros zum Ausblick.
-->

---

## Referenzprojekt: So sieht eine sehr gute Abgabe aus

- **Infrastruktur als Code:** Terraform modular, Remote State, `terraform.tfvars.example` — ein `destroy` räumt alles ab
- **Workload als Helm-Chart:** eigene `values.yaml` je Umgebung, Storage Class, Ingress oder Gateway
- **Pipeline:** Build, Test und Image in die Registry — reproduzierbar aus einem Commit
- **GitOps:** Argo CD synchronisiert Staging und Produktion, Rollback ist ein Commit
- **Betrieb belegt:** Prometheus/Grafana/Loki, mindestens zwei eigene Dashboards, Alarme
- **Wiederherstellbar und dokumentiert:** Backup mit getestetem Restore, README mit Architekturdiagramm

💡 Vorlagen und Beispiele: [cloud-services-examples](https://github.com/srieger1/cloud-services-examples)

🧠 Kann eine fremde Person Ihr Deployment in 30 Minuten aus dem Repo nachbauen?

<!--
Maßstab: nicht "es lief einmal", sondern "ein Dritter kann es nachvollziehen und wiederherstellen".
Ergänzend prüfen: getaggte Image-Versionen (keine :latest), Secrets nicht im Repo,
Teardown dokumentiert, RTO/RPO benannt.
-->

---

## Was aus dem letzten Semester hängen blieb

| Beobachtung | Was daraus folgt |
|---|---|
| **MTU/VXLAN in Pods** — die VM-MTU stimmte, die Pods kamen nicht durch | Overlay-MTU einrechnen und im CNI/Deployment prüfen, nicht nur auf der VM |
| **Volume-`retain`** — Daten überlebten `helm uninstall` | PVCs und Storage Class bewusst wählen; Aufräumen ist ein eigener Schritt |
| **Bitnami-Images aus der Registry entfernt** — die Pipeline brach | Base-Images spiegeln und auf einen Digest pinnen |
| **Restore war der größte Zeitfresser** | Wiederherstellung vorher trocken üben und die Dauer messen |

🧠 Warum stimmt die MTU in der VM, aber nicht im Pod?

<!--
Belege aus den Projektpräsentationen des letzten Durchlaufs (mehrere Gruppen): MTU/VXLAN
trat gruppenübergreifend auf, Volume-retain überraschte, Bitnami-Images verschwanden
während des Semesters, Restore kostete am meisten Zeit. Bewusst als Erfahrungswissen,
nicht als Anklage.
-->

---

## Plattform-Engineering und was danach kommt

- **Internal Developer Platform (IDP):** die Plattform ist ein Produkt für die Entwicklungsteams
- **Golden Paths:** ein vorgespurter Weg aus Template, Pipeline, Helm-Chart und Monitoring — der bequemste Weg ist der richtige
- **Service-Katalog:** sichtbar machen, wer welchen Dienst besitzt und wie er erreichbar ist
- **Self-Service:** Teams deployen ohne Ticket; Standards werden von der Plattform durchgesetzt (Policy as Code)
- **FinOps:** Kosten sichtbar machen — Labels/Tags, Budget-Alarme, Teardown-Routinen
- **Ihr Stand:** Helm-Chart + Pipeline + Argo CD sind bereits der Anfang eines Golden Path

💡 [Backstage](https://backstage.io/) als offenes Portal und Katalog · [Platforms Whitepaper](https://tag-app-delivery.cncf.io/whitepapers/platforms/)

🧠 Wie viel Selbstbedienung vertragen Sie, ohne dass Kosten und Sicherheit aus dem Ruder laufen?

<!--
Anschluss an Kapitel 3 (DevOps → GitOps → SRE → Platform Engineering).
Pointe: Eine IDP automatisiert genau die Schritte, die Sie im Projekt manuell getan haben.
FinOps knüpft an die vergessenen OpenStack-/AWS-Ressourcen aus Lab 2 an.
-->

---

## Ausblick: Wohin sich das Feld bewegt

- **Edge & Fog Computing:** Rechenleistung näher an Sensor und Nutzer — wegen Latenz, Bandbreite und Datenhoheit
- **Green IT & Energieeffizienz:** Energie pro Anfrage wird zur Kennzahl; Scheduling und Standort zählen
- **Multi-/Hybrid-Cloud & Sovereign Cloud Stack:** offene Standards statt Bindung an einen Anbieter, Betrieb in eigener Hand
- **AIOps & LLM im Betrieb:** Anomalieerkennung und Assistenten für Logs und Runbooks — Beschleuniger, kein Ersatz für Verständnis

💡 [Sovereign Cloud Stack](https://scs.community/) — offener, föderierbarer Cloud-Stack

🧠 Welche dieser Entwicklungen verändert Ihre künftige Rolle im Betrieb am stärksten?

<!--
Kein Technologie-Versprechen, sondern Richtungsanzeige: Wer die Grundlagen aus diesem
Semester beherrscht, kann jede dieser Entwicklungen einordnen. Die Themen sind bewusst
offen gehalten — Details gehören in Abschlussarbeiten und Vertiefungsmodule.
-->

---

## Karrierepfade

| Rolle | Was zählt |
|---|---|
| **Cloud Engineer** | Infrastruktur als Code, Netz und Storage verstehen, Kosten im Blick behalten |
| **DevOps/Platform Engineer** | Pipeline und GitOps beherrschen, Entwicklung und Betrieb zusammenbringen |
| **Site Reliability Engineer (SRE)** | Verfügbarkeit messen (SLO), Fehlerbudget, systematische Fehleranalyse |
| **Full-Stack Engineer** | Anwendung und Deployment verstehen — von der Datenbank bis zum Frontend |

💡 Weiterlesen: [Google SRE Book](https://sre.google/sre-book/table-of-contents/) · [CNCF Trail Map](https://github.com/cncf/trailmap)

🧠 Welche Rolle passt zu Ihnen — und welche Lücke schließen Sie bis zum Abschluss?

<!--
Quelle: "Job description related to Cloud Engineer and DevOps Engineer" im Kursordner.
Der Stack der Stellenanzeigen deckt sich fast vollständig mit diesem Semester:
Docker/Podman, OpenStack/AWS, Terraform, Kubernetes/Helm, GitHub/Argo CD, Grafana/Prometheus/Loki.
Üblich sind Einstiege über Werkstudentenstellen und Abschlussarbeiten.
-->

---

## Abschluss und Kontakt

<div class="research-card">
💡 <strong>Abschlussarbeiten, HiWi- und Projektstellen am MMNet</strong> — Network Digital Twins, Future Internet Architectures, AI/ML in Networking: <a href="https://mmnet.informatik.hs-fulda.de">mmnet.informatik.hs-fulda.de</a> · Kontakt: sebastian.rieger@informatik.hs-fulda.de
</div>

- Ihre Unterlagen und Beispiele bleiben verfügbar: [cloud-services-examples](https://github.com/srieger1/cloud-services-examples)
- Für die Abgabe zählt, was reproduzierbar, dokumentiert und wiederherstellbar ist — nicht, was einmal lief

🧠 Was wollen Sie als Nächstes lernen?

<!--
Sprechstunde: Fr 11:40–13:10, Raum 46 (E) 126, Anmeldung erwünscht.
Themen am MMNet sind anschlussfähig an das Projekt: Netzwerke, Cloud-Plattformen,
Betrieb automatisierter Systeme. Bei Interesse gerne direkt ansprechen.
-->

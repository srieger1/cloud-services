# Cloud Services (AI1034) — Planung WiSe 2026/27

Foliensatz und Ablaufplan der Lehrveranstaltung *Cloud Services* (Bachelor AI, Hochschule Fulda, Prof. Sebastian Rieger).
Die Veranstaltung ist ein **Praktikum mit begleitendem Impuls**: Die Studierenden bauen und betreiben in Teams einen eigenen Cloud-Service.

## Ausrichtung

- **Deliverable ist der IaC-Code** (Repository oder Archiv) plus README mit Architekturdiagramm — **kein Betriebshandbuch**, keine Präsentationspflicht.
- **Bestehensgrenze:** mindestens **5 der 6 Labs** umgesetzt. Add-ons (Auto-Scaling, HA/Self-Healing, Backup/DR) sind Extra Credit.
- Die Studierenden wählen **eine primäre Plattform** (OpenStack im NetLab oder AWS Academy) — dieselben Muster werden auf beiden gezeigt.
- Kein Vorlesungsformat: kurzer Impuls, Übung/Diskussion, dann Projektarbeit mit Betreuung.
- Theorie ist **Orientierungswissen** für die Umsetzung, nicht Prüfungsstoff. Jede Theorie-Folie trägt deshalb den Marker „→ umsetzen in: …".

## Struktur des Foliensatzes

| Bereich | Decks | Inhalt |
|---|---|---|
| Theorie | `00-Gliederung.md` … `06-Backup-Recovery.md` | Organisation, Grundlagen, Infrastruktur, Anforderungen, Dokumentation, Überwachung, Backup |
| Lab-Track | `10-Lab1-Docker.md` … `15-Lab6-Monitoring.md` | je Lab: Ziel, Tasks, Kernkonzepte, Grundlagen-Kasten, Live-Demo, Abnahmekriterien, Deep Dive, Story, Lessons Learned |
| Abschluss | `16-Lab7-Referenzprojekt-Ausblick.md` | Referenzprojekt, Plattform-Engineering, Ausblick, Karrierepfade |
| Konferenzwoche | `20-Flipped-Classroom-Auftrag.md` | Auftrag und Material für die selbstständige Woche |

Alle Abbildungen liegen als eigene SVGs in `figures/`. Marp-Markdown ist die Quelle; die Slidev-Fassung wird per `devenv shell -- slidev-convert` erzeugt (Details: `AGENTS.md`).

## Ablauf (14 Wochen, zwei Blöcke à 90 Minuten)

Block A = Impuls + Übung/Diskussion, Block B = Projektarbeit mit Betreuung.

| Woche | KW (vorl.) | Block A | Block B |
|---|---|---|---|
| W1 | 42 | Organisation, Projekt, Bewertung, Rollenbilder, Scope | Gruppeneinteilung, Projektideen, Elevator-Pitch |
| W2 | 43 | Grundlagen Teil 1–2 (Internet-/Clouddienst, NIST, cloud-native, Story) + Lab 1 | Zugänge, Projekt-Repo anlegen, Docker |
| W3 | 44 | **Konferenzwoche → Flipped Classroom** (1-Seiter: drei Bereitstellungswege vergleichen) | entfällt (Online-Sprechstunde) |
| W4 | 45 | Diskussion der Ergebnisse + Grundlagen Teil 3–4 (Sourcing, Virtualisierung) + Lab 2 | Container + erste Cloud-Instanz |
| W5 | 46 | Infrastruktur: was der Provider leistet (Redundanz, Storage, Netz) | Instanz + Dienst erreichbar machen |
| W6 | 47 | Anforderungen Teil 1 (Planung, Einführung, Betrieb, Automatisierung) + Lab 3 | Terraform ersetzt manuelle Schritte |
| W7 | 48 | Anforderungen Teil 2 (Secrets, Supply Chain, Policy as Code, SLO) + Diskussion „K8s oder Compose?" | **Status-Update 1 + Rundgang 1** |
| W8 | 49 | Lab 4: Kubernetes (Cluster, Helm) | Cluster + erster Workload |
| W9 | 50 | Lab 4: Storage/Netz/Ingress + Dokumentation im Repo | PV/PVC, Ingress, README/Repo-Struktur |
| W10 | 51 | Lab 5: CI/CD und GitOps | Pipeline + Argo CD |
| — | 52–2 | **Weihnachtspause** | — |
| W11 | 3 | Überwachung Teil 1 (Logging, Monitoring, Reporting) + Lab 6 | Prometheus/Grafana/Loki |
| W12 | 4 | Überwachung Teil 2 (SLO, Alarme, Skalierung, HPA) | **Status-Update 2 + Rundgang 2**, Bonus-Track |
| W13 | 5 | Backup & Recovery + Referenzprojekt/Ausblick (Lab 7) | Bonus-Track (Velero/Restore), Abgabevorbereitung |
| W14 | 6 | Offene Fragen, Evaluation, Ausblick | **Status-Update 3 + Rundgang 3**, Abgabe, Galerie |

> Die KW-Angaben sind aus dem Anker „Konferenzwoche ab 26.10.2026" abgeleitet und vor Semesterbeginn mit der Stundenplanung abzugleichen. Puffer: der Backup-Block kann bei Zeitnot entfallen (Folien bleiben Selbstlernmaterial).

## Labs und Zuordnung zur Abgabe

| Lab | Thema | Werkzeuge | Beitrag zur Abgabe |
|---|---|---|---|
| 1 | Containerisierung | Docker, Compose, Registry | Dockerfile (multi-stage), `docker-compose.yml`, Image |
| 2 | Cloud | OpenStack, AWS Academy, cloud-init | Instanz, Floating IP, Security Group |
| 3 | Scripting & IaC | cloud-init, Terraform | Infrastruktur als Code, Module, Remote State, `tfvars.example` |
| 4 | Orchestrierung | Kubernetes (RKE2), Helm | Manifeste oder Helm-Chart, Service-Exposure, Storage |
| 5 | CI/CD & GitOps | GitHub Actions/GitLab CI, Argo CD | Pipeline (Build → Test → Image → Push → Deploy), zwei Umgebungen |
| 6 | Monitoring & Observability | Prometheus, Grafana, Loki | zwei eigene Dashboards, Alert-Regel |
| Add-on 6 | Auto-Scaling | HPA, k6 | Lasttest mit nachgewiesener Skalierung |
| Add-on 7 | HA & Self-Healing | Replicas, Probes, PDB | Ausfall eines Pods demonstriert |
| Add-on 8 | Backup & DR | Velero, S3-kompatibler Speicher | Retention, RTO/RPO, Restore-Nachweis |

## Organisation im Semester

- **Status-Update** vor jedem Rundgang: drei Fragen (was läuft, was fehlt, wo hängen wir), 1 Seite, nicht bewertet — Grundlage für das Gespräch.
- **Rundgänge** in W7, W12, W14: je Gruppe ~10 Minuten am Arbeitsplatz; jede Person erklärt ihren Teil (Beitragsnachweis).
- **Projekt-Roster** (Gruppennummer, Dienst, Repo-Link) ist für alle sichtbar; keine zwei Teams am selben Dienst.
- **Galerie** am Semesterende: pro Team zwei Bullets im Repo — Problem/Herausforderung und Lösung („was hat uns Zeit gekostet").
- **Flipped Classroom** in der Konferenzwoche: schriftlicher 1-Seiter, Auswertung als Kurzstatements und Diskussion in W4.

## Recht und Open Source

- **Nur eigene Grafiken** (`figures/*.svg`) — keine Screenshots, Logos oder Memes. Der Foliensatz ist damit für eine Veröffentlichung als offenes Lehrmaterial vorbereitet.
- Zitate: kurze Passagen mit Quellenangabe; ansonsten wird auf externe Quellen **verlinkt** statt Inhalte zu übernehmen.
- Nicht Bestandteil eines Repos: Altbestand mit Fremdmaterial (`old-pptx/`, `!alt/`, `!Neues-Material/`), personenbezogene Daten (Noten, Teilnehmerlisten, Gruppenzuordnungen) sowie Fremddokumente — die entsprechenden Muster stehen in `.gitignore`.

## Offene Punkte

- Modulbeschreibung in der PO an die tatsächliche Fassung angleichen (Rename „Internet Services" → „Cloud Services" wurde dort nicht nachgezogen).
- Optional: Kapitel „Ausblick" als eigenes Deck; weitere SVGs (`internetdienst-architektur.svg`); Lab-Deep-Dives ausbauen.

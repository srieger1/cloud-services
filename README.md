# Cloud Services — Foliensatz

Foliensatz und Ablaufplan der Lehrveranstaltung **Cloud Services** (Modul AI1034) im Bachelor AI an der Hochschule Fulda, Prof. Sebastian Rieger · MMNet.

Die Veranstaltung ist praktisch angelegt: Studierende bauen und betreiben in Teams einen eigenen Cloud-Service. Die Folien begleiten die Labs als kurze Impulse; das eigentliche Arbeiten findet im Praktikum statt.

## Inhalt

| Datei(en) | Inhalt |
|---|---|
| `00-Gliederung.md` | Organisation, Projekt, Bewertung, Semesterplan, Scope |
| `01-Grundlagen.md` | Was ist ein Internet-/Clouddienst, NIST-Modelle, cloud-native, IT-Sourcing |
| `02-Infrastruktur.md` | Was unter dem Service liegt: Redundanz, Cloud-Komponenten, Storage, Netz |
| `03-Anforderungen.md` | Planung bis Betrieb, DevOps/GitOps/SRE, Automatisierung, Secrets, Kosten, Sicherheit |
| `04-Dokumentation.md` | Dokumentation im Repo, Abgabeformat (IaC-Code) |
| `05-Ueberwachung-Wartung.md` | Logging, Monitoring, Reporting, Alarmierung, Skalierung |
| `06-Backup-Recovery.md` | Backup-Strategie, RPO/RTO, Replikation, Velero, Restore |
| `10-…15-Lab*.md` | Lab-Track 1–6 (Docker, Cloud, IaC, Kubernetes, CI/CD, Monitoring) |
| `16-Lab7-…md` | Referenzprojekt, Plattform-Engineering, Ausblick, Karrierepfade |
| `20-Flipped-Classroom-Auftrag.md` | Auftrag für die Konferenzwoche |
| `PLAN.md` | Ablauf der Veranstaltung (14 Wochen, Labs, Rundgänge, Bewertung) |
| `AGENTS.md` | Konventionen und Werkzeuge für die Mitarbeit an den Folien |
| `figures/` | eigene SVG-Abbildungen |

Die Lab-Aufgaben und Beispiel-Repositories liegen im Schwester-Repo: [srieger1/cloud-services-examples](https://github.com/srieger1/cloud-services-examples).

## Erzeugen und Präsentieren

Die Umgebung kommt aus [devenv](https://devenv.sh) (marp-cli, Chromium, Node):

```sh
direnv allow          # einmalig
devenv shell          # Shell mit allen Werkzeugen

# in der Shell:
pdfs                  # alle Decks als PDF rendern
slidev-watch 01-Grundlagen.md   # Live-Vorschau im Browser (http://localhost:3030)
slidev 01-Grundlagen.md         # Presenter-Modus
slidev-build          # statische Slidev-Fassung nach slidev/dist/ bauen
```

**Marp ist die Quelle**; die Slidev-Fassung wird per `slidev-convert` erzeugt und nicht versioniert.

## Prüfen

```sh
devenv shell -- check        # Folien-Dichte, Marker-Konventionen, Links (Exit ≠ 0 bei Verstoß)
devenv shell -- slidevcheck  # Überlauf in der gerenderten Slidev-Fassung (0 erwartet)
```

Die Regeln dahinter stehen in `tools/slidecheck.mjs` bzw. `tools/linkcheck.mjs` und sind in `AGENTS.md` beschrieben.

## Lizenz

- **Folien und Abbildungen** (`*.md`, `figures/`, `PLAN.md`, `AGENTS.md`): [Creative Commons Namensnennung 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) — siehe `LICENSE`.
- **Werkzeuge und Skripte** (`tools/`, `devenv.nix`): MIT — siehe `LICENSE-MIT`.

Bei Nachnutzung bitte nennen: *Sebastian Rieger, MMNet, Hochschule Fulda — LVA Cloud Services*.

## Hinweise

- Alle Abbildungen sind eigene SVG-Grafiken; es werden bewusst keine Screenshots, Produktlogos oder fremden Grafiken verwendet.
- Externe Inhalte sind verlinkt, nicht übernommen. Kurze Zitate sind mit Quelle gekennzeichnet.
- Nicht Teil des Repos: Altmaterial früherer Semester, Moodle-Exporte, Prüfungs- und Teilnehmendendaten (siehe `.gitignore`).

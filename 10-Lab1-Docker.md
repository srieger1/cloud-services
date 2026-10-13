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

# Lab 1 – Docker

## Container bauen, verstehen und mit Compose orchestrieren

Wintersemester 2026/2027
Bachelor AI – Hochschule Fulda

<div class="card">

💡 [Lab-Repo: cloud-services-examples/lab1](https://github.com/srieger1/cloud-services-examples/tree/main/lab1)

</div>

Zeitbedarf: ca. 90 Minuten

<!--
Ziel des Lab-Intros (ca. 15–20 min am Ende des Theorie-Blocks): Aufgabenstellung, Begriffe und Abnahmekriterien klären.
Die eigentliche Arbeit findet in Block B statt; die Aufgaben selbst stehen im README des Lab-Repos.
-->

---

## Was Sie heute bauen

- **Task 1 – Image bauen:** Aus dem mitgelieferten `Dockerfile` ein Image `ubuntu-htop` bauen, starten und die Kommandos aus den Kommentaren ausprobieren
- **Task 2 – Einordnen:** In der Gruppe die Vor- und Nachteile von Containern gegenüber VM und Bare Metal diskutieren
- **Task 3 – Mounten:** nginx im Container starten und eine eigene `index.html` per `-v`/`--mount` hineinreichen
- **Task 4 – Orchestrieren:** Mit `docker compose` mehrere Container samt Netz und Storage auf- und wieder abbauen

> **Zeitrahmen:** Task 1–3 in Block B dieser Woche, Task 4 als Überleitung zur nächsten Sitzung.

---

## Kernkonzepte

- **Image ≠ Container ≠ Runtime:** Das Image ist der unveränderliche Bauplan, der Container seine laufende Instanz – ausgeführt von der Runtime (`containerd`/`runc`).
- **Registry:** verteilt Images unter Name und Tag (`nginx:1.27`) – Docker Hub, GHCR oder eine GitLab-Registry.
- **Dockerfile:** beschreibt den Build in Layern; jeder Layer wird gecacht und ist nur so reproduzierbar wie seine Basis.
- **Multi-Stage-Build:** im ersten Stage bauen, im zweiten nur das Ergebnis übernehmen – kleineres Image, keine Build-Werkzeuge im Auslieferungsstand.
- **Ports, Volumes, Mounts:** `-p` veröffentlicht Ports, `-v`/`--mount` verbindet Host-Dateien und -Verzeichnisse mit dem Container.
- **Compose:** beschreibt mehrere Container, Netze und Volumes in einer `docker-compose.yml` – lokale Orchestrierung, aber kein Cluster.

<!--
Warum „lokal Orchestrierung, aber kein Cluster": compose startet Container auf einem Host, ohne Ausfallsicherheit, Rolling Updates oder Scheduling über mehrere Knoten. Genau hier setzt Lab 4 (Kubernetes) an — Diskussionsstoff für die 🧠-Frage in W7.
-->

---

## Grundlagen-Kasten

<div class="card">

- **Image:** unveränderliches Paket aus Anwendung und Abhängigkeiten (Read-only-Vorlage).
- **Container:** laufende Instanz eines Images – ein isolierter Prozess auf demselben Kernel.
- **Dockerfile:** Rezept für den Build; `docker build -t name:tag .` erzeugt das Image.
- **Volume / Bind-Mount:** Speicher, der den Container überlebt bzw. Host-Dateien hineinreicht.
- **Registry:** Ablage und Verteiler für Images (Docker Hub, GHCR, GitLab).

</div>

> **So sieht Erfolg aus:** `docker images` zeigt `ubuntu-htop`, `docker ps` einen laufenden nginx, und `curl localhost:8080` liefert Ihre `index.html`.

---

## Live-Demo

Ablauf: Image starten und Container inspizieren → nginx mit gemounteter `index.html` erreichbar zeigen → Compose-Umgebung auf- und wieder abbauen.

```bash
docker run -d --name demo nginx:1.27 && docker ps && docker logs demo
docker run -d -p 8080:80 -v "$PWD/index.html:/usr/share/nginx/html/index.html:ro" nginx:1.27
docker compose up -d && docker compose down -v
```

💡 [Get started with Docker Compose](https://docs.docker.com/compose/gettingstarted/)

<!--
Fallback, falls die Umgebung nicht erreichbar ist: Screenshot der Kommandozeile zeigen oder die Ausgabe von `docker ps`, `docker logs` und `docker compose ps` als Konservenausgabe einspielen – der Ablauf (Build → Lauf → Inspektion → Teardown) muss sichtbar bleiben.
💡 Beispielsammlung für Task 4: https://github.com/docker/awesome-compose
Hinweis: `docker compose down -v` entfernt auch die Volumes – das ist Absicht („destroy after use"), bei produktiven Daten wäre es der falsche Befehl.
-->

---

## Abnahmekriterien

- **Dockerfile (multi-stage):** baut ein lauffähiges Image; Build-Werkzeuge bleiben im Build-Stage.
- **`docker-compose.yml`:** startet den Dienst lokal reproduzierbar – Container, Netz und Volume definiert.
- **Image in einer Registry verfügbar:** Docker Hub, GHCR oder GitLab – per `docker pull` abrufbar.
- **README:** Start-/Stop-Kommandos und Zugriff (ohne Secrets) dokumentiert.
- **Aufgeräumt nach der Vorführung:** Container, Netze und Volumes entfernt (`docker compose down -v`).

> Grundlage: `Cloud & DevOps Engineering – Semester Project Guidelines` (Deliverable Dockerfile, compose, Registry-Image).

---

## Deep Dive

**Freiwillig – für alle, die mehr wollen (Extra Credit, kein Pflichtteil):**

- **Image-Härtung & -Größe:** Basis auf `alpine` oder `distroless` umstellen, `.dockerignore` ergänzen, die Layer-Reihenfolge für den BuildKit-Cache optimieren – messen Sie `docker image ls` vorher/nachher.
- **Security-Scan:** `trivy image <image>` bzw. `docker scout cves <image>` in den Build einhängen und die Befunde bewerten – welche CVE ist für Ihren Dienst wirklich relevant?

💡 [Trivy](https://trivy.dev/) · 💡 [Docker Scout](https://docs.docker.com/scout/) · 💡 [Distroless Images](https://github.com/GoogleContainerTools/distroless)

---

## Story: „Mal eben schnell … sicher kaputt"

*Platzhalter – hier erzählt der Dozent eine anonymisierte Praxisgeschichte zum Bauen und Ausliefern von Container-Images.*

Stichwort: multi-layer versus flattened

<!--
Story/Beispiel trägt der Dozent nach (Kategorie: „mal eben schnell … sicher kaputt" oder „… schleichend im Betrieb").
Vorlage: 2–4 Sätze Erzählung (anonymisiert, ohne Firmennamen und ohne unbelegte Zahlen), zwei Merker (Herausforderung / Konsequenz), genau eine 🧠-Frage am Ende.
-->

---

## Lessons Learned

- **`latest` statt Digest:** Ohne festen Tag oder Digest zieht der nächste Build unbemerkt eine neue Version – reproduzierbare Builds brauchen feste Tags oder `image@sha256:…`.
- **Secrets im Image:** Zugangsdaten in `Dockerfile`, `ENV` oder `COPY .env` landen in den Layern und bleiben auch nach dem Löschen lesbar.
- **Container ohne Volume:** Daten im Container-Dateisystem verschwinden beim Neuerstellen – alles Zustandsbehaftete gehört auf ein Volume oder Bind-Mount.
- **Compose ist kein Produktionsbetrieb:** keine Ausfallsicherheit, keine Rolling Updates, kein Scheduling über Hosts.

🧠 Welches Ihrer Images würden Sie heute unverändert in Produktion einsetzen – und was fehlt dafür noch?

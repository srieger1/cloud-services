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

# Lab 5 – CI/CD & GitOps

## Von der Pipeline bis zum selbstheilenden Rollout

Wintersemester 2026/2027
Bachelor AI – Hochschule Fulda
Sebastian Rieger · MMNet

---

## Was Sie heute bauen

- Demo-Anwendung (**Calendar App**) ansehen und die `docker-compose.yml` lesen
- Helm-Chart der Anwendung (`calendar-chart`) verstehen
- **Argo CD** im RKE2-Cluster installieren und konfigurieren
- Eine Anwendung **über Argo CD** deployen
- Eine Änderung committen und **Sync/Rollout** beobachten

💡 [Lab-5-README](https://github.com/srieger1/cloud-services-examples/tree/main/lab5) – Aufgaben, Repos und Setup-Anleitung

<!--
Zeitbedarf: ~20 min Intro, danach freie Arbeit im Praktikumsblock.
Die Studierenden arbeiten entlang der drei Tasks im Lab-README.
-->

---

## Kernkonzepte

- **CI** = Build → Test → Image bauen → Push in die Registry; **CD** = Ausrollen auf das Zielsystem
- **Push- vs. Pull-Modell:** Pipeline drückt Änderungen ins Cluster vs. Agent im Cluster zieht den Sollzustand
- **GitOps:** Git ist die **Quelle der Wahrheit** – der Cluster gleicht sich laufend an den Commit an
- **Sync-Status & Drift:** `OutOfSync` = Abweichung; Sync = Abgleich; Rollback = vorherige Revision auswählen
- **Secrets** nie ins Repo: GitHub Secrets/GitLab Variables; im Cluster z. B. Sealed Secrets
- **Ein Repo für App + Deployment:** Image-Tag, Chart und Umgebung liegen versioniert beieinander

🧠 Wem gehört der Sollzustand Ihres Clusters – der Pipeline oder dem Git?

---

## Grundlagen-Kasten

<div class="card">

- **Argo CD** – Controller im Cluster, der Git-Repos überwacht und Manifeste anwendet (**Pull**).
- **Helm-Chart** – Paket aus Templates + `values.yaml`: ein Chart, mehrere Umgebungen.
- **Registry** – Ablage für Container-Images (`ghcr.io`, GitLab Registry, Docker Hub).
- **Revision** – ein Commit; Argo CD kann gezielt darauf zurückrollen.
- **Sync-Wave** – Reihenfolge, in der Ressourcen angewendet werden (erst Secrets, dann Pods).

</div>

<!--
Für Einsteiger: Argo CD ist kein Build-Tool – es deployt nur. Gebaut/getestet wird in der CI.
-->

---

## Live-Demo

Änderung im Git-Repo committen → Argo CD zeigt **OutOfSync** → Sync auslösen → Rollout der neuen Pods beobachten → auf die vorherige Revision zurückrollen.

```sh
kubectl -n argocd get applications
argocd app sync calendar
kubectl -n calendar rollout status deploy/calendar
```

💡 [Argo CD – Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/) · 💡 [Guestbook-Beispiel](https://github.com/argoproj/argocd-example-apps/tree/master/guestbook)

<!--
Fallback: Falls die Umgebung nicht erreichbar ist, Screenshot der Argo-CD-Oberfläche bzw.
die Kommando-Zeilen (OutOfSync → Synced → Rollout) zeigen. Rollback:
`argocd app history calendar` (Revision wählen) bzw. im UI „History and Rollback".
-->

---

## Abnahmekriterien

- Pipeline mit **Build, Test, Docker-Build, Push in eine Registry, Deploy**
- Mindestens **zwei Umgebungen** (Staging/Production) **oder** Branch-basiertes Deployment
- Secrets ausschließlich über **CI-Secrets** (GitHub Secrets / GitLab Variables)
- Deployment nachvollziehbar über **Argo CD** (Sync-Status sichtbar)
- **Bonus:** automatischer Rollback bei fehlgeschlagenem Deployment

<!--
Quelle: Cloud & DevOps Engineering – Semester Project Guidelines, REQUIRED 4 (CI/CD Pipeline).
-->

---

## Deep Dive

*Freiwillig – für alle, die schon eine grüne Pipeline haben.*

- **Flux CD** als Alternative zu Argo CD: Pull-Modell mit **Image-Automation** – neue Image-Tags werden automatisch zu Commits
  💡 [fluxcd.io](https://fluxcd.io/)
- **Argo Rollouts** für **Canary/Blue-Green**: Traffic schrittweise verschieben, bei Fehlschlag automatisch zurückrollen
  💡 [Argo Rollouts](https://argo-rollouts.readthedocs.io/)

---

## Story: „Mal eben schnell … sicher kaputt"

*Platzhalter – Beispielgeschichte trägt der Dozent mündlich nach.*

**→ umsetzen in:** Galerie-Beitrag im Repo (Problem + Lösung, zwei Bullets).

<!--
Story/Beispiel trägt der Dozent nach (Kategorie: „mal eben schnell … sicher kaputt" oder
„… schleichend im Betrieb"). Merker-Struktur wie in der Story-Folie aus 01-Grundlagen.
-->

---

## Lessons Learned

- **Bitnami-Images wurden aus der Registry entfernt** → die Pipeline brach: Quelle prüfen, freie Ersatz-Images wählen, per **Digest statt Tag** pinnen
- **Sealed Secrets in Argo CD in Reihenfolge synchronisieren** – sonst starten Pods ohne Secret (Sync-Waves)
- **`latest`-Tags machen Rollbacks unmöglich** – konkrete, unveränderliche Tags verwenden

🧠 Was tun Sie, wenn ein Base-Image morgen aus der Registry verschwindet?

<!--
Belege aus dem letzten Semester (PLANNED-CHANGES §12, Lab 5 CI/CD):
Bitnami-Entfernung durch Broadcom; Sealed-Secrets-Reihenfolge; `latest`-Tag und Rollback.
-->

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

# Lab 2 – Cloud

## Erste Instanz, Floating IP und cloud-init in OpenStack und AWS

Wintersemester 2026/2027
Bachelor AI – Hochschule Fulda

---

## Was Sie heute bauen

- **Erste Instanz in OpenStack (Nova)** erstellen — Image, Flavor und Keypair auswählen
- **cloud-init nutzen:** die Instanz installiert beim ersten Boot Docker und startet nginx
- **Dienst erreichbar machen:** Floating IP zuordnen und `http://<ip>` im Browser aufrufen
- **Analog in AWS (EC2)** nachvollziehen — der Dozent zeigt beides, Sie wählen eine primäre Plattform
- 💡 Lab-Repo: [cloud-services-examples/lab2](https://github.com/srieger1/cloud-services-examples/tree/main/lab2)

<!--
Zeitbedarf: 15–20 min Intro; die Bearbeitung läuft in Block B.
Beide Plattformen werden gezeigt. Jede Gruppe wählt eine primäre Plattform (OpenStack privat / AWS public),
begründet die Wahl kurz und dokumentiert sie im README.
-->

---

## Kernkonzepte

- **Image · Flavor · Keypair:** Startvorlage (z. B. Ubuntu), Größe (vCPU/RAM), SSH-Schlüssel für den Login
- **Netz · Subnet · Router:** die Instanz liegt in einem privaten Netz und kommt darüber nach außen
- **Security Group:** Firewall der Instanz — ohne Port 22/80 erreichen Sie weder SSH noch nginx
- **Floating IP:** öffentliche Adresse, die Sie der Instanz zuordnen; ohne sie bleibt der Dienst privat
- **cloud-init:** Skript, das beim **ersten** Boot läuft — Docker, nginx und alles Weitere automatisch
- **AWS-Gegenstücke:** EC2 · VPC · Security Group · Elastic IP — gleiche Bausteine, andere Namen

---

## Grundlagen-Kasten

<div class="card">

**Instanz** — virtuelle Maschine in der Cloud; auf ihr läuft Ihr Dienst.
**Image / Flavor** — Startvorlage des Betriebssystems und die Größe (vCPU, RAM, Platte).
**cloud-init** — Skript oder Konfiguration, die beim ersten Start automatisch ausgeführt wird.
**Floating IP / Elastic IP** — feste öffentliche Adresse, die Sie einer Instanz zuordnen.
**Teardown** — alles nach der Nutzung beenden und löschen: Instanz, IP, Router, Volumes.

</div>

---

## Live-Demo

Wir starten eine Instanz mit dem cloud-init-Skript, rufen den nginx über die Floating IP ab — und schließen dann die Security Group.

1. `openstack server create … --user-data cloud-init_docker-install lab2-web`
2. `openstack server add floating ip lab2-web <floating-ip>`
3. `curl http://<floating-ip>` → nginx-Begrüßung; danach Port 80 in der Security Group schließen und erneut `curl`

💡 [cloud-init-Beispiel: Docker + nginx](https://github.com/srieger1/cloud-services-examples/blob/main/lab2/cloud-init-examples/cloud-init_docker-install)

<!--
Fallback, falls die Umgebung nicht erreichbar ist: Screenshot bzw. die Kommando-Zeile zeigen
(Floating IP und Instanz im Dashboard, `/var/log/cloud-init-output.log`, curl-Ausgabe) und die
Erwartung mündlich erklären. Der zweite curl nach dem Schließen der Security Group läuft in einen
Timeout — das ist das eigentliche Lernziel.
-->

---

## Abnahmekriterien

- **Instanz läuft** und ist per SSH mit dem Keypair erreichbar
- **Dienst erreichbar:** nginx antwortet über die Floating IP (HTTP 200)
- **Zugangsdaten dokumentiert** — Instanz, IP und Ports im README, keine Secrets im Repo
- **Automatisiert:** die Einrichtung steckt in cloud-init, nicht in manuellen Kommandos
- **Aufgeräumt:** alle Ressourcen nach der Nutzung beendet oder gelöscht

🧠 Wer prüft in Ihrem Projekt am Semesterende, dass wirklich nichts mehr läuft — und was kostet ein Übersehenes?

---

## Deep Dive

**Freiwillig — für Fortgeschrittene:**

- **Zwei Netze, zwei Subnetze, ein eigener Router:** ein internes Netz für die Anwendung und ein getrenntes Netz für die Verwaltung — Router-Interface und Routen selbst konfigurieren.
- **Bastion statt Floating IP:** das Anwendungsnetz ohne öffentliche Adresse betreiben und nur über einen Jump Host (Bastion) darauf zugreifen.
  → [AWS VPC – Grundlagen](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html)

🧠 Warum sollte eine Datenbank-Instanz keine Floating IP haben?

---

## Story: Die Instanz, die niemand löschte

*Platzhalter — hier erzählt der Dozent eine passende Praxisgeschichte.*

<!--
Story/Beispiel trägt der Dozent nach (Kategorie: „mal eben schnell … sicher kaputt" oder „… schleichend im Betrieb").
-->

---

## Lessons Learned

- **Vergessene Ressourcen kosten Budget:** Instanz, Floating IP, Router und Volumes laufen weiter, auch wenn niemand sie nutzt.
- **Security Group blockiert:** ohne Freigabe für Port 80/443 (und 22 für SSH) erreichen Sie den Dienst nie.
- **Ohne cloud-init nicht reproduzierbar:** jede Instanz wird zum Einzelfall — dieselbe Umgebung entsteht nie zweimal.
- **„Kostenlos" heißt nicht ohne Konsequenz:** die Sandbox wird am Semesterende gelöscht — alles Wichtige gehört ins Repo.

🧠 Was passiert mit Ihrem Dienst, wenn die Sandbox abgeräumt wird — können Sie ihn aus Ihrem Repo neu aufbauen?

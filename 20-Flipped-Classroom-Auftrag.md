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

# Flipped Classroom

## Konferenzwoche (W3) · Ihr Auftrag

Wintersemester 2026/2027
Bachelor AI – Hochschule Fulda
Sebastian Rieger · MMNet

---

## Ihr Auftrag für die Konferenzwoche

**Kein Präsenztermin in W3 — Sie arbeiten selbst, wir besprechen das Ergebnis in W4.**

**Aufgabe (1 Seite, Abgabe in Moodle):**

Vergleichen Sie für **Ihren** Dienst drei Bereitstellungswege:

1. **VM + Docker Compose** — selbst installiert und betrieben
2. **Kubernetes** — Deployment über Helm, betrieben auf unserem Cluster
3. **Verwalteter Dienst in der Public Cloud** — z. B. Container-Service oder vergleichbarer Dienst

**Und begründen Sie Ihre Wahl** für das Semesterprojekt.

- Umfang: **1 Seite** (Markdown oder PDF) — kurz und begründet ist besser als ausführlich und unentschieden
- Form: gern als Tabelle mit Kriterien, dahinter 3–5 Sätze Begründung
- Es gibt keine falsche Antwort — es gibt nicht begründete Antworten

🧠 Was würde Sie dazu bringen, Ihre Entscheidung im Semester zu ändern?

---

## Woran eine gute Antwort erkennbar ist

| Kriterium | Was wir lesen wollen |
|---|---|
| **Betriebsaufwand** | Wer aktualisiert, wer beobachtet, wer reagiert nachts? |
| **Skalierung & Ausfallsicherheit** | Wie viele Instanzen, was passiert beim Ausfall? |
| **Kosten** | Was kostet der Betrieb pro Woche/Monat — grob geschätzt? |
| **Passung zum Dienst** | Braucht Ihr Dienst State, Datenbank, Anmeldung, GPU? |
| **Passung zum Team** | Welches Vorwissen ist da, was ist zumutbar? |
| **Risiken** | Was könnte schiefgehen, was ist der Plan B? |

- Keine Bewertung von Prosa-Qualität — bewertet wird die **Begründung**
- Eine Entscheidung gegen Kubernetes ist völlig legitim, wenn sie begründet ist

> „Wir nehmen Kubernetes, weil es alle nehmen" ist keine Begründung. „Wir nehmen Compose, weil unser Dienst zustandslos ist und wir in drei Wochen liefern müssen" schon.

---

## Material und Ablauf

<div class="columns">
<div>

**Wo Sie nachschauen**

- 💡 [Lab-Repositories](https://github.com/srieger1/cloud-services-examples) — Lab 1 bis 6
- 💡 [The Twelve-Factor App](https://12factor.net/de/) — Grundlagen für betreibbare Anwendungen
- 💡 [docker compose](https://docs.docker.com/compose/) · [Kubernetes](https://kubernetes.io/docs/concepts/) · [Helm](https://helm.sh/docs/)
- 💡 Cloud-Doku Ihres Anbieters: [OpenStack Docs](https://docs.openstack.org/) · [AWS Academy](https://www.awsacademy.com/)

</div>
<div>

**Wie es weitergeht**

- Abgabe des 1-Seiters bis zum Termin in Moodle
- **W4, Block A:** 3–4 Kurzstatements (je 5 min) und moderierte Diskussion
- Die Ergebnisse fließen in das Kapitel „Anforderungen" ein (Sourcing-Entscheidung)
- Offene Fragen sammeln wir in der Online-Sprechstunde

</div>
</div>

🧠 Welche Annahme in Ihrer Begründung würden Sie zuerst testen, wenn Sie Zeit hätten?

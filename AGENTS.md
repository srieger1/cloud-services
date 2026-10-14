# AGENTS.md — Mitarbeit an den Cloud-Services-Folien

Hinweise für Agenten und Mitwirkende. **Marp ist kanonisch** — die Slidev-Fassung wird erzeugt.

## Setup und Befehle

```sh
direnv allow          # einmalig
devenv shell          # Umgebung: marp-cli, chromium, node
```

| Befehl | Wirkung |
|---|---|
| `pdfs` | alle Decks (`[0-9][0-9]-*.md`) als PDF rendern |
| `pages` / `site` | veröffentlichte Fassung lokal bauen (`public/*.pdf` + `public/index.html`) |
| `slidecheck` | DoD: Folien-Dichte, Marker, Links, Checkboxen, Abschlussfolien |
| `linkcheck` | alle Links prüfen (403/405/429 = „prüfen", interne HS-Hosts = „nur im VPN") |
| `check` | `slidecheck` + `linkcheck`, Exit ≠ 0 bei Verstoß |
| `slidev-convert` / `slidev-build` | Slidev-Fassung in `slidev/` erzeugen und bauen |
| `slidevcheck` | Überlauf in der gerenderten Slidev-Fassung messen (braucht frischen Build) |
| `slidev <deck>.md` / `slidev-watch [deck.md]` | präsentieren / Live-Vorschau |

**Abnahme jeder Änderung:** `check` Exit 0 **und** `slidevcheck` 0 Überläufe. Zusätzlich `pdfs` laufen lassen.

## Dateien

- **Decks:** `00`–`06` Theorie, `10`–`16` Lab-Track, `20` Flipped-Classroom-Auftrag — jede Datei eigenständig, damit sie im Semester einzeln anpassbar bleibt.
- **`figures/*.svg`** — ausschließlich eigene Grafiken.
- **`tools/`** — Konverter und Prüfskripte. Prüfregeln hier erweitern, **nicht** die Folien an falsche Regeln anpassen.
- **`slidev/`** — generiert, nie direkt editieren.

## Konventionen

- **Frontmatter ist die Quelle der Wahrheit** für das Slidev-Stylesheet (Kopf-/Fußzeile, `font-size: 20px`, `padding: 56px 62px`, `line-height: 1.4`). Werte ändern → `slidev-convert` + `slidev-build` neu laufen lassen.
- **Sie-Form** durchgängig.
- **Marker:** `💡` immer mit Link (nackte URL zählt), **genau eine** 🧠-Frage pro Inhaltsfolie als letzte Zeile, max. 3 Links pro Folie (Ausnahme `## Hintergrund & Vertiefung`: bis 5).
- **Slide-Typen:** `<!-- _class: title -->`, `<!-- _class: section-break -->`, `#` für Kapitel/Teil, `##` für Folientitel; dazu `## Live-Demo`, `## Abnahmekriterien`, `## Grundlagen-Kasten`, `## Deep Dive`, `## Story`, `## Lernzielkontrolle ✍️🧠`, `## Praktische Übungen 🛠️🧑‍🔬🔬`.
- **Umsetzungs-Marker** auf Theorie-Folien: `> **→ umsetzen in:** Lab N — …`
- **Dichte:** ≤ 6 Bullets, Tabellen ≤ 8 Zeilen, eine Aussage pro Folie. Bildgrößen in **px** (`![w:940px center](figures/…)`) — Prozentangaben ignoriert Marp.
- **Keine `- [ ]`-Checkboxen** (Marp rendert sie wörtlich als „[ ]") → fette Bullets.
- **Speaker-Notes** (`<!-- … -->`) für Quellen, Fallbacks und Vorlagen; sie zählen nicht als Folieninhalt und dürfen ausführlich sein.

## Harte Regeln

- **Keine Fremdbilder im Repo** (Screenshots, Logos, Karten, Memes) — im Repo liegen nur eigene SVGs. Fremdmaterial ausschließlich lokal über `figures/copyrighted/` (siehe unten). Grund: öffentliches Repo.
- Keine Secrets und keine personenbezogenen Daten in den Decks (keine Noten, Teilnehmerlisten, Gruppenzuordnungen — auch nicht in Speaker-Notes).
- Links nur auf stabile Ziele (offizielle Doku, GitHub-Repos, HS-Ressourcen); keine Versions-Deeplinks.

## Bilder, die nicht ins öffentliche Repo dürfen

Fremdmaterial (z. B. ein Meme) wird **nicht** committet, kann aber lokal in den Folien erscheinen:

1. Datei in `figures/copyrighted/` legen — der Ordner ist im `.gitignore` (also nie im Repo).
2. In der Folie mit **relativem** Pfad einbinden: `![h:130px center](figures/copyrighted/datei.jpg)`
3. Lokal rendern: Marp (`pdfs`) und die Slidev-Vorschau (`slidev-watch`) zeigen das Bild. In der
   **Public-Fassung** entfernt die CI diese Zeilen vor dem Rendern (Schritt *Nicht-öffentliche Bilder
   ausblenden* in `.github/workflows/pages.yml`): Die Datei ist im Repo nicht vorhanden, und Marp
   ignoriert fehlende Bilder **nicht** still — es rendert den Alt-Text als kaputtes Bild-Symbol.
   Deshalb wird die Zeile gestrichen statt auf einen fehlenden Pfad zu zeigen.

Warum das so sein muss:

- **Bildsyntax statt Link:** `![Alt](pfad)` rendert ein Bild; `[Text](pfad)` erzeugt nur einen Hyperlink.
- **Kein `~/`**, keine absoluten Pfade und keine Leerzeichen im Pfad — Marp/Chromium expandiert die Tilde
  nicht und bricht sonst am ersten Leerzeichen (oder URL-kodieren: `%20`).
- Die Datei muss **innerhalb** des Projektordners liegen, sonst findet sie weder Marp noch die
  generierte Slidev-Fassung (dort werden Bildpfade auf `/figures/…` umgeschrieben und über den
  Symlink `slidev/figures` aufgelöst).

## Veröffentlichung (GitHub Pages)

Die PDFs sind **Build-Artefakte** und werden nicht committet. Bei Änderungen an Decks oder `figures/`
baut die CI (`.github/workflows/pages.yml`) alle PDFs, erzeugt `public/index.html`
(`tools/site.mjs`) und veröffentlicht beides über GitHub Pages:

- Übersicht: https://srieger1.github.io/cloud-services/
- einzelne Decks: `https://srieger1.github.io/cloud-services/<deck>.pdf` — stabile Links für Moodle.

Die CI prüft zusätzlich die DoD (`slidecheck`, unverbindlich) — die verbindliche Prüfung bleibt
`devenv shell -- check` vor dem Commit. Lokal dieselbe Ausgabe: `devenv shell -- pages`.

## Fallen (belegt)

| Falle | Konsequenz |
|---|---|
| `![w:78%]` | wird ignoriert → px verwenden |
| `- [ ]` | wird wörtlich gerendert → fette Bullets |
| Slidev rechnet das Layout anders als Marp | immer `slidevcheck` mitlaufen lassen |
| Kopf/Fuß sind absolut positioniert | Überlauf nur über `scrollHeight − clientHeight` messen, nicht über Kind-Rechtecke |
| Datei in mehreren Editoren (Nextcloud-Sync) | vor dem Schreiben neu einlesen, sonst überschreibt ein alter Puffer die Änderung |
| Speaker-Notes in der Messung | verfälschen Dichte/Chars → `slidecheck` blendet Kommentare aus |

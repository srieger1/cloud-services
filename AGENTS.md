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

- **Keine Fremdbilder** (Screenshots, Logos, Karten, Memes) — nur eigene SVGs. Grund: öffentliches Repo, siehe `PLAN.md`.
- Keine Secrets und keine personenbezogenen Daten in den Decks.
- Links nur auf stabile Ziele (offizielle Doku, GitHub-Repos, HS-Ressourcen); keine Versions-Deeplinks.

## Fallen (belegt)

| Falle | Konsequenz |
|---|---|
| `![w:78%]` | wird ignoriert → px verwenden |
| `- [ ]` | wird wörtlich gerendert → fette Bullets |
| Slidev rechnet das Layout anders als Marp | immer `slidevcheck` mitlaufen lassen |
| Kopf/Fuß sind absolut positioniert | Überlauf nur über `scrollHeight − clientHeight` messen, nicht über Kind-Rechtecke |
| Datei in mehreren Editoren (Nextcloud-Sync) | vor dem Schreiben neu einlesen, sonst überschreibt ein alter Puffer die Änderung |
| Speaker-Notes in der Messung | verfälschen Dichte/Chars → `slidecheck` blendet Kommentare aus |

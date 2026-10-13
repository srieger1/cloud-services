#!/usr/bin/env node
// site.mjs — erzeugt die Index-Seite für die veröffentlichte Fassung (GitHub Pages).
//
// Aufruf: node tools/site.mjs [zielverzeichnis]      (Standard: public)
//
// Erwartet, dass die PDFs bereits unter <ziel>/<deck>.pdf liegen (CI: `marp --pdf`),
// und schreibt <ziel>/index.html mit Links auf die Deck-PDFs. Die Deck-Titel werden aus
// den Markdown-Dateien gelesen (erste `# `-Zeile = Titel, erste `## `-Zeile = Untertitel),
// damit die Übersicht nicht doppelt gepflegt werden muss.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = process.cwd();
const outDir = process.argv[2] ?? "public";
const files = readdirSync(dir).filter((f) => /^[0-9][0-9]-.*\.md$/.test(f)).sort();

if (!files.length) {
  console.error("Keine Decks gefunden ([0-9][0-9]-*.md).");
  process.exit(1);
}

const deck = (file) => {
  const text = readFileSync(join(dir, file), "utf8");
  const title = (text.match(/^#\s+(.*)$/m) || [, file.replace(/\.md$/, "")])[1].trim();
  const sub = (text.match(/^##\s+(.*)$/m) || [, ""])[1].trim();
  const pages = (text.match(/^---$/gm) || []).length - 1; // Frontmatter-Trenner abziehen
  return { file, pdf: file.replace(/\.md$/, ".pdf"), title, sub, pages };
};

const groups = [
  { name: "Theorie", match: (f) => /^0[0-6]-/.test(f) },
  { name: "Lab-Track", match: (f) => /^1[0-6]-/.test(f) },
  { name: "Weitere Folien", match: (f) => /^2[0-9]-/.test(f) },
];

const rows = groups
  .map((g) => {
    const items = files.filter(g.match).map(deck);
    if (!items.length) return "";
    const lis = items
      .map(
        (d) =>
          `        <li><a href="${d.pdf}"><strong>${d.title}</strong></a>` +
          (d.sub ? `<span class="sub">${d.sub}</span>` : "") +
          `<span class="meta">${d.pdf} · ${d.pages} Folien</span></li>`
      )
      .join("\n");
    return `      <h2>${g.name}</h2>\n      <ul>\n${lis}\n      </ul>`;
  })
  .filter(Boolean)
  .join("\n");

const html = `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cloud Services — Foliensatz (HS Fulda)</title>
  <style>
    :root { --primary: #003366; --accent: #0066cc; --light: #e8f0f8; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff;
           max-width: 62rem; margin: 0 auto; padding: 2rem 1.2rem 4rem; line-height: 1.5; }
    h1 { color: var(--primary); border-bottom: 3px solid var(--accent); padding-bottom: .2em; }
    h2 { color: var(--accent); font-size: 1.2em; margin-top: 1.8em; }
    ul { list-style: none; padding: 0; }
    li { background: var(--light); border-left: 4px solid var(--accent);
         border-radius: 0 6px 6px 0; padding: .6em .8em; margin: .5em 0; }
    a { color: var(--primary); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .sub { display: block; font-size: .92em; color: #444; }
    .meta { display: block; font-size: .8em; color: #666; font-family: ui-monospace, monospace; }
    footer { margin-top: 3em; font-size: .85em; color: #666; border-top: 1px solid #ddd; padding-top: 1em; }
  </style>
</head>
<body>
  <h1>Cloud Services — Foliensatz</h1>
  <p>Lehrveranstaltung <strong>Cloud Services</strong> (AI1034), Bachelor AI, Hochschule Fulda ·
     Prof. Sebastian Rieger · MMNet.
     Quelle und Lizenz: <a href="https://github.com/srieger1/cloud-services">github.com/srieger1/cloud-services</a>
     (Inhalte CC BY 4.0, Werkzeuge MIT).</p>
  <p>Die PDFs werden bei jeder Änderung automatisch aus den Markdown-Decks erzeugt.</p>
${rows}
  <footer>
    Erzeugt aus den Marp-Markdown-Decks · Lab-Aufgaben: <a href="https://github.com/srieger1/cloud-services-examples">cloud-services-examples</a>
  </footer>
</body>
</html>
`;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "index.html"), html);
console.log(`${files.length} Decks → ${join(outDir, "index.html")}`);

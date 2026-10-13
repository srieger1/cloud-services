#!/usr/bin/env node
// to-slidev.mjs — erzeugt aus den Marp-Decks eine Slidev-Fassung.
//
//   node tools/to-slidev.mjs [datei.md ...]     (ohne Argumente: alle [0-9][0-9]-*.md)
//   -> schreibt slidev/<deck>.md  und einmalig slidev/style.css
//
// Warum generieren statt dual pflegen: Marp und Slidev haben unterschiedliche
// Mechanismen für Layout pro Folie (HTML-Kommentar `<!-- _class: … -->` vs.
// YAML-Frontmatter `layout:`), unterschiedliche Bildgrößen-Syntax
// (`![w:800px](…)` vs. HTML-Attribut) und unterschiedliche CSS-Wurzeln
// (`section` vs. `.slidev-page`). Ein gemeinsamer Quelltext kann nur die
// Schnittmenge nutzen — deshalb bleibt **Marp kanonisch**, Slidev wird erzeugt.
//
// Marp-Syntax, die übersetzt wird:
//   <!-- _class: title -->           -> layout: cover
//   <!-- _class: section-break -->   -> layout: section
//   ![w:800px](bild.png)             -> <img src="bild.png" style="width:800px">
//   ![h:400px](…) / ![w:60%](…)      -> analog (height / Prozent)
//   ![alt text](…)                   -> unverändert
// Frontmatter wird durch Slidev-Headmatter ersetzt; die Marp-CSS wird nach
// slidev/style.css übertragen (dort auf .slidev-page/.slidev-layout gescopet).

import { readFileSync, writeFileSync, mkdirSync, readdirSync, symlinkSync, readlinkSync, unlinkSync, existsSync } from "node:fs";
import { basename, join } from "node:path";

const dir = process.cwd();
const args = process.argv.slice(2);
const files = (args.length
  ? args
  : readdirSync(dir).filter((f) => /^[0-9][0-9]-.*\.md$/.test(f) && !/notes\.md$/.test(f))
).sort();

const outDir = join(dir, "slidev");
mkdirSync(outDir, { recursive: true });
let exitCode = 0;
const manifest = {}; // Folienzahlen für tools/slidevcheck.mjs (slidev/decks.json)

// Slidev-Projektwurzel ist das Arbeitsverzeichnis; die Decks verweisen root-relativ
// auf /figures/... (relative Pfade löst Vite nicht auf). Der Symlink macht slidev/
// zum vollständigen Projekt — kein Kopieren der Bilder nötig.
// readlink (folgt dem Link nicht) statt existsSync: auch ein defekter oder falsch
// gesetzter Symlink wird ersetzt; ein echtes Verzeichnis bleibt unangetastet.
const linkPath = join(outDir, "figures");
const linkTarget = "../figures";
let figuresEntryExists = true;
try {
  if (readlinkSync(linkPath) !== linkTarget) {
    unlinkSync(linkPath);
    figuresEntryExists = false;
  }
} catch (e) {
  if (e.code === "ENOENT") figuresEntryExists = false; // nichts vorhanden -> anlegen
  else if (e.code !== "EINVAL") throw e; // EINVAL: echtes Verzeichnis -> so lassen
}
if (!figuresEntryExists) symlinkSync(linkTarget, linkPath, "dir");

// ---------------------------------------------------------------- Stylesheet
const style = `/* Automatisch erzeugt von tools/to-slidev.mjs — nicht direkt bearbeiten.
   Quelle der Wahrheit: Frontmatter der Marp-Decks (<deck>.md). */

:root {
  --color-primary: #003366;
  --color-accent:  #0066cc;
  --color-light:   #e8f0f8;
}

.slidev-page {
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 20px;
  color: #1a1a1a;
  background: #ffffff;
  /* Marp setzt den Innenabstand auf section (≙ .slidev-layout), nicht auf die Seite.
     Deshalb hier 0 — sonst stapelt er sich mit dem Theme-Abstand (2.5rem 3.5rem). */
  padding: 0 !important;
}

/* Standardlayout (hell) — überschreibt das dunkle Slidev-Default-Theme */
.slidev-layout {
  background: #ffffff;
  color: #1a1a1a;
  /* Marp-Default-Theme: section { padding: 56px 62px; font-size: 20px } (gemessen am Marp-Render).
     Das Theme setzt sonst padding 2.5rem 3.5rem und font-size 1.1rem (17.6px). */
  padding: 56px 62px !important;
  font-size: 20px;
}

/* Marp-Theme-Parität: das Slidev-Theme setzt für Absätze/Listen eigene Zeilenhöhen und macht die
   Codeblöcke viel kleiner (12px statt 18.7px). Werte am Marp-Render gemessen (canvas-relative
   Rechtecke): section line-height 1.5 (22px -> 33px Zeile), p erbt die Schriftgröße und hat
   16px Rand unten (0.73em), h2 0.33em Innenabstand unten, pre/code 0.85em mit line-height 1.15
   und 16px Innenabstand. Ohne diese Regeln bleiben die Folien deutlich leerer als in Marp. */
.slidev-layout {
  font-family: 'Segoe UI', Arial, sans-serif;
  line-height: 1.4;
}
.slidev-layout p { font-size: inherit; line-height: 1.4; margin: 0 0 0.73em; }
.slidev-layout li { line-height: 1.4; }
.slidev-layout h2 { padding-bottom: 0.33em; }
.slidev-layout pre { font-size: 0.85em !important; line-height: 1.15 !important; padding: 16px !important; margin: 0 0 0.73em; }
.slidev-layout pre code { font-size: inherit !important; background: none !important; padding: 0 !important; }

/* Marps Kopf-/Fußzeile und Seitenzahl (Slidev kennt header/footer/paginate nicht). Werte am
   Marp-Render gemessen: Kopf oben links 30/21px, Fuß unten links, Seitenzahl unten rechts
   (24px, #777), Text 16.5px in rgba(102,102,102,0.75) — auf allen Folien inkl. Cover. */
.slidev-chrome {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  font-size: 16.5px;
  line-height: 1.2;
  color: rgba(102, 102, 102, 0.75);
}
.slidev-chrome .hdr { position: absolute; top: 21px; left: 30px; }
.slidev-chrome .ftr { position: absolute; bottom: 21px; left: 30px; }
.slidev-chrome .pno { position: absolute; bottom: 21px; right: 30px; font-size: 24px; color: #777; }

/* Opt-in aus dem Marp-Deck: <!-- _class: fill --> zentriert den Inhalt vertikal (für Folien,
   die sonst oben kleben). Passende Regel für den PDF-Export einmal ins Deck-CSS:
   section.fill { display: flex; flex-direction: column; justify-content: center } */
.slidev-layout.fill { display: flex; flex-direction: column; justify-content: center; }
.slidev-layout h1 {
  color: var(--color-primary);
  font-size: 1.8em;
  border-bottom: 3px solid var(--color-accent);
  padding-bottom: 0.2em;
}
.slidev-layout h2 {
  color: var(--color-accent);
  font-size: 1.3em;
  border-bottom: none;
}
.slidev-layout a { color: var(--color-accent); }

/* Cover (Marp: <!-- _class: title -->) */
.slidev-layout.cover {
  background: var(--color-primary);
  color: #ffffff;
  text-align: center;
  align-content: center;
  height: 100%;
}
.slidev-layout.cover h1 {
  color: #ffffff;
  border-bottom: 3px solid #ffffff;
  font-size: 2em;
}
.slidev-layout.cover h2 { color: #cce0ff; }
.slidev-layout.cover p { color: #cce0ff; margin: 0.15em 0; }

/* Abschnittstrenner (Marp: <!-- _class: section-break -->) */
.slidev-layout.section {
  background: var(--color-accent);
  color: #ffffff;
  text-align: center;
  align-content: center;
  height: 100%;
}
.slidev-layout.section h1 {
  color: #ffffff;
  border-color: #ffffff;
  border-bottom: 3px solid #ffffff;
  font-size: 2.1em;
}
.slidev-layout.section p { color: #cce0ff; font-size: 1.1em; }

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
  font-style: normal;
}
blockquote p { margin: 0.2em 0; }

/* Layout-Klassen aus den Marp-Decks (identisch benannt, funktionieren in beiden) */
/* .columns/.columns3 ohne align-items — Marp-Deck-CSS setzt es nur für .columns4/.cols-tree/
   .columns-15; Grid-Stretch macht .card-Kästen pro Reihe gleich hoch (z. B. Gliederung F6). */
.columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1em; }
.columns3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.8em; }
.columns4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.6em; align-items: start; }
.cols-tree { display: grid; grid-template-columns: 1.2fr 1.1fr 1fr; gap: 1em; align-items: start; }
.columns-15 { display: grid; grid-template-columns: 1.5fr 1fr; gap: 1em; align-items: start; }
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
.hands-on {
  border-left: 4px solid #b8860b;
  background: #fff8e1;
  border-radius: 0 6px 6px 0;
  padding: 0.5em 0.8em;
  margin: 0.6em 0;
}
.food-for-thought {
  border-left: 4px solid #00695c;
  background: #e0f2f1;
  border-radius: 0 6px 6px 0;
  padding: 0.5em 0.8em;
  margin: 0.6em 0;
}
.takeaway {
  border-left: 4px solid var(--color-primary);
  background: var(--color-light);
  font-weight: 600;
  padding: 0.5em 0.8em;
  border-radius: 0 6px 6px 0;
}
img { max-width: 100%; }
`;
// Das Schreiben von slidev/style.css erfolgt weiter unten (nach den Hilfsfunktionen),
// weil dabei Regeln aus dem Deck-CSS übersetzt werden.

// ---------------------------------------------------------------- Konverter
const rootRel = (src) => (/^(https?:|\/|data:)/.test(src) ? src : "/" + src);

// Alt-Text kann mehrere Angaben kombinieren: ![h:140px center](…), ![w:60% float-right](…).
// Größe und Ausrichtung werden deshalb einzeln ausgelesen; bleibt nichts übrig, ist der
// Alt-Text echter Alternativtext und bleibt erhalten.
const convertImages = (s) =>
  s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, src0) => {
    const src = rootRel(src0);
    const w = alt.match(/(?:^|\s)w:(\d+(?:px|%)?|auto)(?=\s|$)/);
    const h = alt.match(/(?:^|\s)h:(\d+(?:px|%)?|auto)(?=\s|$)/);
    const classes = [
      /(?:^|\s)float-right(?=\s|$)/.test(alt) ? "float-right" : "",
      /(?:^|\s)center(?=\s|$)/.test(alt) ? "center" : "",
    ].filter(Boolean).join(" ");
    const styles = [w && `width:${w[1]}`, h && `height:${h[1]}`].filter(Boolean).join(";");
    if (styles || classes)
      return `<img src="${src}"${styles ? ` style="${styles}"` : ""}${classes ? ` class="${classes}"` : ""} alt="">`;
    return `<img src="${src}" alt="${alt.replace(/"/g, "'")}">`;
  });

const chip = (front) => (front ? `---\n${front.trim()}\n---\n\n` : "");

// Shiki (Slidev) bringt keine p4-Grammatik mit und bricht den Build ab; Marp hebt p4
// ohnehin nicht hervor -> als "text" ausgeben (optisch identisch, Build läuft durch).
const convertFences = (s) => s.replace(/^```p4\s*$/gm, "```text");

// Marps Folienschnitt exakt nachzählen (Trenner = Zeile mit nur "---", max. 3 Leerzeichen
// davor, Codeblöcke ausgenommen; Headmatter zählt nicht mit). Weicht das Ergebnis von der
// eigenen Aufteilung ab, hat eine Folie einen mehrdeutigen Trenner (z. B. "---  " mit
// Leerzeichen) oder der Konverter schneidet in einem Codeblock -> sofort abbrechen.
const countMarpSlides = (text) => {
  const lines = text.split("\n");
  let i = 0;
  if (lines[0]?.trim() === "---") {
    i = 1;
    while (i < lines.length && lines[i].trim() !== "---") i++;
    i++;
  }
  let inFence = false;
  let seps = 0;
  for (; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) { inFence = !inFence; continue; }
    if (!inFence && /^\s{0,3}-{3,}\s*$/.test(lines[i])) seps++;
  }
  return seps + 1;
};

// Marp-Frontmatter-Werte lesen (header/footer/paginate) — Anführungszeichen entfernen.
const fmValue = (text, key) => {
  const m = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
};

// Marps Kopf-/Fußzeile und Seitenzahl: Slidev kennt die Optionen header/footer/paginate nicht
// (nur einen Punkt), deshalb werden sie als Element je Folie nachgebaut. Werte am Marp-Render
// gemessen (siehe .slidev-chrome im Stylesheet). Pro Folie abschaltbar wie in Marp:
// <!-- _header: '' -->, <!-- _footer: '' -->, <!-- _paginate: false -->.
const escHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const chromeFor = (slide, { header, footer, paginate }) => {
  const parts = [];
  if (header && !/_header:\s*(''|"")/.test(slide)) parts.push(`<span class="hdr">${escHtml(header)}</span>`);
  if (footer && !/_footer:\s*(''|"")/.test(slide)) parts.push(`<span class="ftr">${escHtml(footer)}</span>`);
  if (paginate && !/_paginate:\s*false/.test(slide)) parts.push(`<span class="pno"><SlideCurrentNo /></span>`);
  return parts.length ? `\n\n<div class="slidev-chrome">${parts.join("")}</div>` : "";
};

// Weitere Marp-Klassen nach Slidev durchreichen, z. B. <!-- _class: fill -->.
// Slidevs eingebautes `default`-Layout ignoriert das Frontmatter-Feld `class` (Quelle:
// @slidev/client/layouts/default.vue), deshalb wird die Klasse auf ein eigenes, erzeugtes
// Layout abgebildet (slidev/layouts/fill.vue).
const LAYOUT_FOR_CLASS = { fill: "fill" };

const extraClassOf = (slide) => {
  const m = slide.match(/<!--\s*_class:\s*([^>]*?)\s*-->/);
  if (!m) return null;
  return m[1].split(/\s+/).filter(Boolean).find((c) => c !== "title" && c !== "section-break") || null;
};

// Marp steuert die Bildausrichtung über den Alt-Text (`img[alt~="center"]`); Slidev bekommt
// stattdessen eine Klasse. Die Regeln werden deshalb aus dem Deck-CSS übersetzt, damit sie
// nicht doppelt gepflegt werden müssen (genau diese Regeln fehlten vorher: Bilder mit
// "h:140px center" landeten in Originalgröße und liefen aus der Folie).
const alignRulesOf = (text) => {
  const block = text.match(/^style:\s*\|([\s\S]*?)\n---\s*$/m);
  if (!block) return [];
  const out = [];
  for (const m of block[1].matchAll(/([^{}]*\[alt~="[a-z-]+"\][^{}]*)\{([^}]*)\}/g)) {
    out.push(
      m[1].replace(/\[alt~="([a-z-]+)"\]/g, ".$1").trim().replace(/\s+/g, " ") + ` {${m[2]}}`
    );
  }
  return out;
};

// Marp rendert einzelne Zeilenumbrüche als Zeilen (breaks), Slidev nicht.
// Deshalb bekommen aufeinanderfolgende "reine Textzeilen" zwei Leerzeichen am Ende
// (Markdown-Hard-Break) — Bullets, Überschriften, HTML, Tabellen bleiben unberührt.
const hardBreaks = (s) => {
  const lines = s.split("\n");
  const plain = (l) => {
    const t = l.trim();
    if (/^[-=*_]{3,}$/.test(t)) return false; // Trenner/Thematic Breaks nie anfassen
    return t && !/^([-*+]\s|\d+[.)]\s|#|<|\||>|!\[)/.test(t);
  };
  let inFence = false;
  for (let i = 0; i < lines.length - 1; i++) {
    if (/^\s*```/.test(lines[i])) { inFence = !inFence; continue; } // Codeblöcke unverändert lassen
    if (inFence) continue;
    if (plain(lines[i]) && plain(lines[i + 1])) lines[i] = lines[i].replace(/\s+$/, "") + "  ";
  }
  return lines.join("\n");
};

// ---------------------------------------------------------------- Stylesheet schreiben
// Slidev-spezifische Korrekturen stehen in der versionierten Datei slidev-extra.css und werden
// angehängt, damit sie jedes Neuerzeugen von style.css überleben. Aus dem Deck-CSS übersetzte
// Alt-Text-Regeln (Bildausrichtung) kommen ebenfalls dazu.
const alignRules = [...new Set(files.flatMap((f) => alignRulesOf(readFileSync(join(dir, f), "utf8"))))];
const extraCss = join(dir, "slidev-extra.css");
const cssParts = [style];
if (alignRules.length) cssParts.push(`/* aus dem Deck-CSS übersetzt (Alt-Text-Ausrichtung) */\n${alignRules.join("\n")}\n`);
if (existsSync(extraCss))
  cssParts.push(`/* ---- slidev-extra.css (versioniert, handgepflegt) ---- */\n${readFileSync(extraCss, "utf8")}`);
writeFileSync(join(outDir, "style.css"), cssParts.join("\n"));

// Eigenes Layout für <!-- _class: fill --> — Slidevs eingebautes `default`-Layout ignoriert das
// Frontmatter-Feld `class`, ein eigenes Layout (layouts/<name>.vue) wird von Slidev automatisch geladen.
const layoutsDir = join(outDir, "layouts");
mkdirSync(layoutsDir, { recursive: true });
writeFileSync(
  join(layoutsDir, "fill.vue"),
  `<template>\n  <div class="slidev-layout default fill">\n    <slot />\n  </div>\n</template>\n`
);

for (const file of files) {
  const text = readFileSync(join(dir, file), "utf8");
  const fmEnd = text.indexOf("\n---\n", text.indexOf("style: |"));
  const body = text.slice(fmEnd + "\n---\n".length);
  const slides = body.split("\n---\n");

  const chrome = {
    header: fmValue(text, "header") || "",
    footer: fmValue(text, "footer") || "",
    paginate: fmValue(text, "paginate") !== "false",
  };

  const deckTitle = (slides[0].match(/^#\s+(.*)$/m) || [, basename(file)])[1];
  const subtitle = (slides[0].match(/^##\s+(.*)$/m) || [, ""])[1];
  const headLines = [
    "---",
    "theme: default",
    "colorSchema: light",
    "highlighter: shiki",
    "title: " + JSON.stringify(deckTitle),
    "info: " + JSON.stringify(subtitle),
    "class: text-left",
    "transition: none",
    // Marp rendert auf 1280x720; Slidev nutzt sonst 980x552. Bei gleicher Schriftgröße
    // wirkt der Text dort ~31 % größer, wodurch Folien überlaufen, die in Marp passen.
    "canvasWidth: 1280",
    "canvasHeight: 720",
    "fonts:",
    "  sans: 'Segoe UI, Arial, sans-serif'",
  ];

  const out = slides.map((slide, i) => {
    let front = "";
    if (/<!-- _class: title -->/.test(slide)) front = "layout: cover\nclass: text-center";
    else if (/<!-- _class: section-break -->/.test(slide)) front = "layout: section";
    else {
      const extra = extraClassOf(slide);
      if (extra && LAYOUT_FOR_CLASS[extra]) front = `layout: ${LAYOUT_FOR_CLASS[extra]}`;
      else if (extra) console.warn(`Hinweis ${file}: Klasse "${extra}" hat in Slidev kein Layout — wird ignoriert.`);
    }
    // Folie 1: Slidev sähe zwischen Headmatter- und Folien-Frontmatter zwei aufeinander
    // folgende "---" und würde daraus eine leere erste Folie machen -> Layout in die
    // Headmatter ziehen statt eines eigenen Chips.
    if (i === 0 && front) {
      // nur das Layout übernehmen — "class" steht schon in der Headmatter (YAML-Doppelkey vermeiden);
      // eine zusätzliche Klasse (z. B. fill) wird dort angehängt statt als eigener Chip erzeugt.
      const lines = front.split("\n");
      headLines.push(...lines.filter((l) => l.startsWith("layout:")));
      const extra = lines.filter((l) => l.startsWith("class:")).map((l) => l.slice(6).trim());
      if (extra.length) {
        const idx = headLines.findIndex((l) => l.startsWith("class: "));
        headLines[idx] = headLines[idx] + " " + extra.join(" ");
      }
      front = "";
    }
    let s = slide.replace(/<!-- _class: [^>]*-->\s*/g, "");
    s = hardBreaks(convertFences(convertImages(s)));
    return chip(front) + s.trim() + chromeFor(slide, chrome);
  });

  const target = join(outDir, file);
  const head = [...headLines, "---", ""].join("\n");
  // Trennzeichen setzen: Folien mit eigenem Frontmatter-Chip beginnen bereits mit "---",
  // das dann zugleich als Trenner dient (sonst entstehen leere Folien in Slidev).
  let doc = head;
  out.forEach((part, i) => {
    const sep = i === 0 ? "\n" : part.startsWith("---") ? "\n" : "\n\n---\n\n";
    doc += sep + part;
  });
  writeFileSync(target, doc + "\n");
  manifest[file] = { slides: out.length, marp: countMarpSlides(text) };

  // Foliengleichheit gegen die Marp-Quelle prüfen (siehe countMarpSlides).
  const marpCount = manifest[file].marp;
  if (marpCount !== out.length) {
    console.error(
      `FEHLER ${file}: ${marpCount} Marp-Folien, aber ${out.length} Slidev-Folien erzeugt — ` +
        "mehrdeutiger Trenner (--- mit Leerzeichen) oder --- in einem Codeblock."
    );
    exitCode = 1;
  }
  console.log(`${file}  ->  slidev/${file}  (${out.length} Folien, Marp: ${marpCount})`);
}
console.log(`\nStylesheet: slidev/style.css`);
writeFileSync(join(outDir, "decks.json"), JSON.stringify(manifest, null, 2) + "\n");
process.exit(exitCode);

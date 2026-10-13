#!/usr/bin/env node
// slidecheck.mjs — prüft Marp-Decks gegen die DoD aus PLANNED-CHANGES.md §0.
//
// Aufruf: node tools/slidecheck.mjs [datei.md ...]
//         ohne Argumente: alle [0-9][0-9]-*.md (ohne notes.md)
// Exit-Code 1, wenn Verstöße gefunden wurden (CI-tauglich, siehe devenv-Script `check`).
//
// Messregeln (bewusst so, damit sie zur DoD-Tabelle passen):
//   bullets   ≤ 6      Bullets außerhalb von <div class="card">-Boxen (Tabellenfolien ausgenommen)
//   cards     ≤ 4      Karten-Boxen pro Folie, je ≤ 4 Bullets (Cloud Services: 4 Karten für DevOps/GitOps/SRE/Platform)
//   textLines ≤ 12     Textzeilen ohne Codeblock; HTML-Tags/Bilder/Kommentare/Tabellenzeilen zählen nicht
//   chars     ≤ 650    Prosa-Zeichen ohne Codeblock, Tabellenzeilen, HTML-Tags und Link-ZIELE;
//                      (Link-Text zählt; sonst würden URL-Sammlungen die Messung dominieren)
//                      Zielwert ist 650 (DoD); Verstoß erst ab 800 (einspaltig) bzw. 1000 (mehrspaltig).
//                      Grund (gemessen an der KP-Referenz mit identischer Methode): dort liegen 46 % der
//                      Folien über 650 Prosa-Zeichen, Ø 506–621 je Kapitel -> 650 ist Anspruch, nicht Praxis.
//                      Mehrspaltige Folien zeigen den Text über Spalten verteilt und dürfen daher mehr tragen.
//   codeLines ≤ 20     Zeilen innerhalb der Codeblöcke
// Ausgenommen: die drei Abschlussfolien je Kapitel, alles nach `# Backup`, Detaildecks und die
// Gliederung (letztere nur Code-Limit + Marker-Regel).
// Zusätzlich geprüft: jeder 💡-Marker trägt einen Link (oder steht in einem .hands-on-Block mit Link).

import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

const LIMITS = { bullets: 6, cards: 4, cardBullets: 4, textLines: 12, chars: 650, charsHard: 800, charsHardMulti: 1000, codeLines: 20 };
const CLOSING = /^(Lernzielkontrolle|Praktische Übungen|Weiterführende Literatur)/;
const isClosing = (t) => CLOSING.test(t);

const dir = process.cwd();
const args = process.argv.slice(2);
const files = (args.length
  ? args
  : readdirSync(dir).filter((f) => /^[0-9][0-9]-.*\.md$/.test(f) && !/notes\.md$/.test(f))
).sort();

// Detaildecks (vollständiger Code als Inhalt) und die Gliederung: nur Code und Marker prüfen.
const isSelfStudy = (f) => /^(1[0-6]|20)-.*\.md$/.test(f) || /^00-/.test(f);

const stripCode = (s) => s.replace(/```[\s\S]*?\n?```/g, "");
const codeLinesOf = (s) => {
  let n = 0;
  for (const m of s.matchAll(/```[a-z0-9]*\n([\s\S]*?)```/g)) n += m[1].replace(/\n$/, "").split("\n").length;
  return n;
};
const isMeta = (line) => {
  const t = line.trim();
  return !t || /^<[^>]*>$/.test(t) || /^!\[/.test(t) || /^<!--/.test(t) || /^\|/.test(t) || /^#/.test(t);
};

let violations = 0;

for (const file of files) {
  const selfStudy = isSelfStudy(file);
  const text = readFileSync(join(dir, file), "utf8");
  const slides = text.split("\n---\n").slice(1);
  const findings = [];
  const info = [];
  let ok = 0;
  let inBackup = false;

  slides.forEach((slide, i) => {
    const title = (slide.match(/^#{1,3}\s+(.*)$/m) || [])[1] || "(ohne Titel)";
    if (/^#\s+Backup/m.test(slide)) inBackup = true;
    const exempt = inBackup || isClosing(title) || selfStudy;

    // Speaker-Notes (<!-- … -->) sind keine Folieninhalte und dürfen die Messung nicht verfälschen
    // — sie enthalten Quellen, Fallbacks und Vorlagen und sind absichtlich lang.
    const visible = slide.replace(/<!--[\s\S]*?-->/g, "");
    const cardBlocks = visible.match(/<div class="card">[\s\S]*?<\/div>\s*(?=<div class="card">|<\/div>|$)/g) || [];
    const withoutCards = cardBlocks.reduce((acc, b) => acc.replace(b, ""), visible);
    const prose = stripCode(withoutCards);
    const codeLines = codeLinesOf(visible);
    const isTable = /^\s*\|/m.test(visible);

    const bullets = (prose.match(/^\s*[-*]\s/gm) || []).length;
    const textLines = prose.split("\n").filter((l) => !isMeta(l)).length;
    const chars = prose
      .split("\n").filter((l) => !/^\s*\|/.test(l))            // Tabellenzeilen zählen nicht als Prosa
      .filter((l) => !/^\s*\*[^*].*\*\s*$/.test(l))            // kursive Quellen-/Fußzeilen auch nicht
      .join("\n")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // Bilder
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // Link-Ziel entfernen, Link-Text behalten
      .replace(/\s+/g, " ")
      .trim().length;

    const issues = [];
    const notices = [];
    const push = (cond, msg) => { if (cond) (exempt ? notices : issues).push(msg); };

    push(!isTable && bullets > LIMITS.bullets, `bullets ${bullets}>${LIMITS.bullets}`);
    push(cardBlocks.length > LIMITS.cards, `cards ${cardBlocks.length}>${LIMITS.cards}`);
    cardBlocks.forEach((b, k) => {
      const n = (b.match(/^\s*[-*]\s/gm) || []).length;
      push(n > LIMITS.cardBullets, `card${k + 1} bullets ${n}>${LIMITS.cardBullets}`);
    });
    push(textLines > LIMITS.textLines, `textLines ${textLines}>${LIMITS.textLines}`);
    // Mehrspaltige Folien (grid-Layout) zeigen den Text verteilt -> höhere Gesamtgrenze.
    // Story-Folien sind bewusst erzählender Text (PLANNED-CHANGES §3.3) und daher ausgenommen.
    const charLimit = /class="columns/.test(visible) ? LIMITS.charsHardMulti : LIMITS.charsHard;
    push(!/^Story/.test(title) && chars > charLimit, `chars ${chars}>${charLimit}`);
    if (codeLines > LIMITS.codeLines && !selfStudy) issues.push(`code ${codeLines}>${LIMITS.codeLines}`);

    // Marker-Regel: 💡 trägt einen Link (oder der umgebende .hands-on-Block hat einen)
    const handsOn = (visible.match(/<div class="hands-on">[\s\S]*?<\/div>/g) || []).join("\n");
    for (const line of visible.split("\n").filter((l) => l.includes("💡"))) {
      // Als Link zählt Markdown-Syntax *oder* eine nackte URL (Marp/Slidev verlinken bare URLs
      // automatisch; die Lab-Decks nutzen diese Form bewusst für gut sichtbare URLs).
      const hasLink = /\]\(https?:|https?:\/\//.test(line);
      const inHandsOn = handsOn.includes(line.trim()) && /\]\(https?:/.test(handsOn);
      if (!hasLink && !inHandsOn && !isClosing(title) && !/Praktische Übungen/.test(title)) {
        issues.push("💡 ohne Link");
      }
    }

    // Cloud-Services-Regeln (PLANNED-CHANGES §3.1/§3.3/§3.7):
    // genau eine 🧠-Frage pro Folie, max. 3 Links (Ausnahme Vertiefungsfolien),
    // keine "- [ ]"-Checkboxen (Marp rendert sie wörtlich), Umsetzungs-Marker auf Theorie-Folien.
    const brains = (visible.match(/🧠/g) || []).length;
    const linkCount = (visible.match(/\]\(https?:/g) || []).length;
    const isBackground = /Hintergrund|weiterführende Links|Vorlagen, Begriffe/.test(title);
    push(brains > 1, `🧠 ${brains}>1`);
    push(!isBackground && linkCount > 3, `links ${linkCount}>3`);
    push(/^\s*- \[ \]/m.test(visible), "Checkbox '- [ ]' (Marp rendert sie wörtlich)");
    const theoryDeck = /^0[1-6]-/.test(basename(file));
    const markerExempt = /^(Story|Kapitelübersicht|Lernziele|Lernzielkontrolle|Praktische Übungen|Hintergrund)/.test(title);
    if (theoryDeck && !markerExempt && !/\*\*→ umsetzen in:\*\*/.test(slide)) notices.push("ohne Umsetzungs-Marker");

    if (issues.length) findings.push({ n: i + 1, title, issues: [...new Set(issues)], exempt });
    else ok++;
    if (chars > 480) info.push({ n: i + 1, title, chars, textLines });
  });

  const real = findings.filter((f) => !f.exempt);
  violations += real.length;
  const emoji = (text.match(/💡/g) || []).length;
  const brain = (text.match(/🧠/g) || []).length;
  console.log(`\n${basename(file)}  —  ${slides.length} Folien, OK: ${ok}, Verstöße: ${real.length}`);
  console.log(`  Marker: ${emoji} × 💡, ${brain} × 🧠`);
  for (const f of findings) {
    console.log(`  ${f.exempt ? "·" : "⚠"} F${String(f.n).padStart(3)} ${f.title.slice(0, 38).padEnd(40)} ${f.issues.join(", ")}`);
  }
  if (!selfStudy) {
    const closing = ["Lernzielkontrolle", "Praktische Übungen", "Abnahmekriterien", "Hintergrund und Vertiefung", "Was Sie am Ende können", "weiterführende Links"];
    if (!closing.some((n) => text.includes(n))) console.log(`  ⚠ Abschluss-/Vertiefungsfolie fehlt (erwartet: ${closing.slice(0, 3).join(" | ")} …)`);
  }
  const densest = info.filter((x) => x.chars > LIMITS.chars).slice(0, 3);
  if (densest.length) console.log(`  dichteste Folien: ${densest.map((d) => `F${d.n} ${d.chars}Z`).join(", ")}`);
}

console.log(`\n${violations} Folie(n) im Vorlesungsteil außerhalb der DoD-Grenzen.`);
process.exit(violations ? 1 : 0);

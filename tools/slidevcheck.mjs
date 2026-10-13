#!/usr/bin/env node
// slidevcheck.mjs — prüft die erzeugte Slidev-Fassung auf Folienüberlauf.
//
//   node tools/slidevcheck.mjs [--deck <datei.md>] [--verbose]
//
// Voraussetzung: `devenv shell -- slidev-build` (also slidev/dist/<deck>/ und slidev/decks.json).
//
// Warum ein eigenes Werkzeug: slidecheck.mjs prüft die **Marp**-Quelle anhand von Zeichen- und
// Zeilenbudgets. Slidev bricht Text aber anders um (andere Schriftmetrik, andere CSS-Wurzel), und
// im Hörsaal sehen die Studierenden die Slidev-Fassung. Deshalb wird hier das gerenderte Ergebnis
// gemessen und nicht die Quelle gezählt.
//
// Umsetzung ohne npm-Abhängigkeit: Mini-Statikserver über slidev/dist, Chromium aus dem devenv
// (CHROME_PATH) über das DevTools-Protokoll (globales WebSocket in Node >= 22) gesteuert.
//
// Gemessen wird je Folie (in CSS-Pixeln, also unabhängig vom Skalierungsfaktor des Browsers):
//   - Überlauf aus der Folie heraus (Unterkante des tiefsten Inhalts gegen Folienunterkante)
//   - Überlauf innerhalb des Layouts (scrollHeight vs. clientHeight, d. h. das Layout schneidet ab)
// Exit-Code 1, sobald eine Folie überläuft — damit in `check`/CI verwendbar.

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { tmpdir } from "node:os";

const dir = process.cwd();
const args = process.argv.slice(2);
const argOf = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};
const verbose = args.includes("--verbose");
const onlyDeck = argOf("--deck");
// --free <px>: zusätzlich Folien auflisten, auf denen so viel Platz ungenutzt bleibt
// (Standard 150 px) — zeigt, wo Text/Bilder größer sein könnten.
const freeArg = args.indexOf("--free");
const freeLimit = (() => {
  if (freeArg < 0) return null;
  const v = Number(args[freeArg + 1]);
  return Number.isFinite(v) && v >= 0 ? v : 150;
})();

const distDir = join(dir, "slidev", "dist");
const manifestPath = join(dir, "slidev", "decks.json");
if (!existsSync(distDir) || !existsSync(manifestPath)) {
  console.error("slidev/dist oder slidev/decks.json fehlt — erst `devenv shell -- slidev-build` laufen lassen.");
  process.exit(2);
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const decks = Object.keys(manifest).filter((d) => !onlyDeck || d === onlyDeck);
if (onlyDeck && decks.length === 0) {
  console.error(`Deck nicht gefunden: ${onlyDeck} (bekannt: ${Object.keys(manifest).join(", ")})`);
  process.exit(2);
}

// ------------------------------------------------------------- Mini-Statikserver
// Wichtig: Slidev-Builds mit `--base ./` müssen als Wurzel serviert werden — die Routen
// heißen dann /1, /2, … Läge das Deck in einem Unterordner, würde die SPA ihre Assets
// nicht mehr finden (sie bootet dann nicht, ohne Fehlermeldung außer 404s).
const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
  ".webp": "image/webp", ".woff2": "font/woff2", ".woff": "font/woff",
};

let root = distDir; // wird je Deck auf slidev/dist/<deck> gesetzt
const server = createServer((req, res) => {
  const path = decodeURIComponent(req.url.split("?")[0]);
  let file = join(root, normalize(path).replace(/^(\.\.[/\\])+/, ""));
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(root, "index.html"); // SPA-Route /12
  if (!existsSync(file) || statSync(file).isDirectory()) {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, { "Content-Type": MIME[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
const port = await new Promise((r) => server.listen(0, "127.0.0.1", () => r(server.address().port)));

// ------------------------------------------------------------- Chromium + CDP
const chrome = process.env.CHROME_PATH || "chromium";
if (!existsSync(chrome) && !process.env.PATH.split(":").some((p) => existsSync(join(p, chrome)))) {
  console.error(`Chromium nicht gefunden (CHROME_PATH=${chrome}) — im devenv-Shell ausführen.`);
  process.exit(2);
}
const userDataDir = mkdtempSync(join(tmpdir(), "slidevcheck-"));
// Port 0 = Chromium wählt selbst und meldet die URL auf stderr. Ein fester/zufälliger Port
// kollidiert mit verwaisten Instanzen früherer Läufe (die hängen dann die Messung auf).
const child = spawn(chrome, [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  "--hide-scrollbars", "--force-device-scale-factor=1",
  "--remote-debugging-port=0", `--user-data-dir=${userDataDir}`,
  "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });

let cdpPort = null;
child.stderr.setEncoding("utf8");
child.stderr.on("data", (chunk) => {
  const m = chunk.match(/ws:\/\/127\.0\.0\.1:(\d+)\//);
  if (m && !cdpPort) cdpPort = Number(m[1]);
});

const stop = () => {
  try { child.kill("SIGKILL"); } catch {}
  try { rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  server.close();
};
process.on("exit", stop);
process.on("SIGINT", () => { stop(); process.exit(130); });

const wsUrl = await (async () => {
  for (let i = 0; i < 100; i++) {
    if (cdpPort) {
      try {
        const r = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
        const pages = await r.json();
        const page = pages.find((p) => p.type === "page" && p.webSocketDebuggerUrl);
        if (page) return page.webSocketDebuggerUrl;
      } catch {}
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  console.error("Chromium meldet keine Zielseite.");
  stop();
  process.exit(2);
})();

const ws = new WebSocket(wsUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

let msgId = 0;
const pending = new Map();
const listeners = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(m.error.message)) : resolve(m.result);
  } else if (m.method && listeners.has(m.method)) {
    const l = listeners.get(m.method);
    listeners.delete(m.method);
    l(m.params);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const waitEvent = (method, timeout = 15000) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout: ${method}`)), timeout);
    listeners.set(method, (p) => { clearTimeout(t); resolve(p); });
  });

await send("Page.enable");
await send("Runtime.enable");

// ------------------------------------------------------------- Messung im Browser
// Läuft als IIFE in der Seite; alles in CSS-Pixeln (Skalierung herausgerechnet).
const MEASURE = `(async (n) => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  let el = null;
  for (let i = 0; i < 40; i++) {
    el = document.querySelector('.slidev-page-' + n);
    if (el && (el.innerText || '').trim().length) break;
    await sleep(100);
  }
  if (!el) return { error: 'nicht gerendert' };
  const layout = el.querySelector('.slidev-layout') || el;
  const pageRect = el.getBoundingClientRect();
  const scale = pageRect.height / (el.offsetHeight || 1) || 1;
  const layoutTop = layout.getBoundingClientRect().top;
  let deepest = layoutTop;
  let deepestEl = null;
  for (const c of layout.querySelectorAll('*')) {
    if (c.closest('.slidev-chrome')) continue;   // Kopf-/Fußzeile zählt nicht als Inhalt
    const r = c.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    if (r.bottom > deepest) { deepest = r.bottom; deepestEl = c; }
  }
  const overPage = (deepest - pageRect.top) / scale - (el.offsetHeight || 0);
  const overLayout = layout.scrollHeight - layout.clientHeight;
  return {
    title: ((el.innerText || '').trim().split('\\n')[0] || '').slice(0, 46),
    overPage: Math.round(overPage),
    overLayout: Math.round(overLayout),
    offender: deepestEl ? (deepestEl.tagName.toLowerCase() + (deepestEl.className && typeof deepestEl.className === 'string' ? '.' + deepestEl.className.trim().split(/\\s+/).join('.') : '')).slice(0, 60) : null,
  };
})`;

// Kriterium: nur Inhalte, die tatsächlich aus der Folie herausragen (overPage), werden
// als Verstoß gewertet. `overLayout` (scrollHeight > clientHeight) meldet schon
// Unterkanten-Margins der letzten Zeile als "abgeschnitten", obwohl der Inhalt sichtbar
// innerhalb der Folie endet -> nur informativ (--verbose).
const OVER_PAGE_LIMIT = 2;
let violations = 0;
let checked = 0;

for (const deck of decks) {
  const count = manifest[deck].slides;
  const deckDir = join(distDir, deck.replace(/\.md$/, ""));
  if (!existsSync(join(deckDir, "index.html"))) {
    console.log(`${deck}  —  kein Build gefunden (slidev/dist fehlt) — übersprungen`);
    continue;
  }
  root = deckDir;
  const base = `http://127.0.0.1:${port}`;
  const findings = [];
  const free = [];
  for (let n = 1; n <= count; n++) {
    await send("Page.navigate", { url: `${base}/${n}` });
    await waitEvent("Page.loadEventFired").catch(() => {});
    const { result, exceptionDetails } = await send("Runtime.evaluate", {
      expression: `${MEASURE}(${n})`,
      awaitPromise: true,
      returnByValue: true,
    });
    if (exceptionDetails) {
      findings.push({ n, note: `Messfehler: ${exceptionDetails.text}` });
      continue;
    }
    const v = result.value;
    checked++;
    if (v.error) {
      findings.push({ n, note: v.error });
      continue;
    }
    if (v.overPage > OVER_PAGE_LIMIT) {
      findings.push({ n, ...v });
      violations++;
    } else {
      if (verbose) console.log(`   F${n} ok (${v.overPage} px / ${v.overLayout} px) — ${v.title}`);
      if (freeLimit !== null && -v.overPage >= freeLimit) free.push({ n, frei: -v.overPage, title: v.title });
    }
  }
  if (findings.length === 0) {
    console.log(`${deck}  —  ${count} Folien, OK`);
  } else {
    console.log(`${deck}  —  ${count} Folien, ${findings.length} auffällig:`);
    for (const f of findings) {
      if (f.note) console.log(`   F${f.n}  ${f.note}`);
      else
        console.log(
          `   F${f.n}  ${String(f.overPage).padStart(4)} px über den Folienrand (Layout: ${f.overLayout} px)  „${f.title}“` +
            (f.offender ? `  [${f.offender}]` : "")
        );
    }
  }
  if (free.length) {
    console.log(`   ungenutzter Platz ≥ ${freeLimit} px auf ${free.length} Folien:`);
    for (const f of free.sort((a, b) => b.frei - a.frei).slice(0, 8))
      console.log(`     F${String(f.n).padStart(3)}  ${String(f.frei).padStart(4)} px frei  „${f.title}“`);
  }
}

console.log(`\n${checked} Folien gemessen, ${violations} laufen über den Folienrand.`);
stop();
process.exit(violations ? 1 : 0);

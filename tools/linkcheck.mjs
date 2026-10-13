#!/usr/bin/env node
// linkcheck.mjs — prüft alle http(s)-Links der Decks (und optional der Lab-Sheets).
// Aufruf: node tools/linkcheck.mjs [datei.md ...]   (ohne Argumente: alle [0-9][0-9]-*.md)
// Ausgabe: Status je URL, am Ende Zusammenfassung. Exit-Code 1 bei toten Links.
// Hinweis: 403/405 sind meist Bot-Schutz und werden als "prüfen" markiert, nicht als tot.

import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

const dir = process.cwd();
const args = process.argv.slice(2);
const files = (args.length ? args : readdirSync(dir).filter((f) => /^[0-9][0-9]-.*\.md$/.test(f))).sort();

const links = new Map(); // url -> Set(dateien)
for (const f of files) {
  const text = readFileSync(join(dir, f), "utf8");
  for (const m of text.matchAll(/\]\((https?:[^)\s]+)\)/g)) {
    const url = m[1];
    if (!links.has(url)) links.set(url, new Set());
    links.get(url).add(basename(f));
  }
}

const urls = [...links.keys()];
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131 Safari/537.36";
const results = new Map();
let i = 0;
const CONCURRENCY = 16;

async function check(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try {
    let r = await fetch(url, { method: "HEAD", redirect: "follow", signal: ctl.signal, headers: { "user-agent": UA } });
    if (r.status === 405 || r.status === 403 || r.status === 400) {
      r = await fetch(url, { method: "GET", redirect: "follow", signal: ctl.signal, headers: { "user-agent": UA } });
    }
    results.set(url, r.status);
  } catch (e) {
    results.set(url, `ERR:${(e.name || "fetch").slice(0, 24)}`);
  } finally {
    clearTimeout(t);
  }
}

await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (i < urls.length) await check(urls[i++]);
  })
);

const dead = [];
const review = [];
// Hosts, die automatisierte Anfragen blockieren oder je nach Netz blocken (Bot-Schutz/CDN) —
// Fehler dort sind "nicht prüfbar", nicht "tot". Ebenso: interne HS-Fulda-Hosts (nur im VPN).
const BLOCKED = /(^|\.)bsi\.bund\.de$/i;
const INTERNAL = /\.hs-fulda\.de$/i;
for (const [url, status] of results) {
  const s = String(status);
  let internal = false;
  let blocked = false;
  try {
    const host = new URL(url).hostname;
    internal = INTERNAL.test(host);
    blocked = BLOCKED.test(host);
  } catch { /* URL nicht parsebar */ }
  if (internal && s !== "200") { review.push([url, "intern (nur im HS-Netz/VPN)"]); continue; }
  if (blocked && s !== "200") { review.push([url, "Host blockt automatisierte Prüfung"]); continue; }
  if (s === "ERR:AbortError") review.push([url, "Timeout"]);
  else if (s.startsWith("ERR")) dead.push([url, s]);
  else if (Number(s) >= 400 && Number(s) !== 403 && Number(s) !== 405 && Number(s) !== 429) dead.push([url, s]);
  else if (Number(s) === 403 || Number(s) === 405 || Number(s) === 429) review.push([url, `${s} (Bot-Schutz?)`]);
}
const ok = urls.length - dead.length - review.length;

console.log(`${urls.length} eindeutige Links in ${files.length} Dateien · OK: ${ok} · tot: ${dead.length} · prüfen: ${review.length}`);
if (dead.length) {
  console.log("\nTOT:");
  for (const [u, s] of dead) console.log(`  ${s.padEnd(10)} ${u}\n             in: ${[...links.get(u)].join(", ")}`);
}
if (review.length) {
  console.log("\nPRÜFEN:");
  for (const [u, s] of review) console.log(`  ${s.padEnd(18)} ${u}\n             in: ${[...links.get(u)].join(", ")}`);
}
process.exit(dead.length ? 1 : 0);

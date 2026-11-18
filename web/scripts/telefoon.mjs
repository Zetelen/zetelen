// Schermcontrole voor zetelen.nl (18 november 2026), overgenomen van de telefooncontrole van Oorlog in kaart.
// Opent de pagina's in Chrome zonder venster, scrolt elke pagina langzaam door en meet:
//   1. zijwaarts scrollen: de pagina of een element is breder dan het scherm (ook met alle uitklapblokken open);
//   2. lege stroken: een stuk pagina zonder tekst of beeld, hoger dan 35 procent van het scherm;
//   3. scrollverhalen: ruimte tussen tekstvlakken meer dan 64 px;
//   4. kleine letters: lopende tekst kleiner dan 16 px (waarschuwing);
//   5. kleine knoppen: knoppen, velden en losse links kleiner dan 44 px (waarschuwing);
//   6. eerste grafiek: op hoeveel px de eerste grafiek of keuze begint (informatie, voor "elk gereedschap opent met een antwoord").
// Per pagina een schermafbeelding van de hele pagina in <uitmap>/<breedte>/.
//
// Gebruik: node web/scripts/telefoon.mjs [basisadres] [pad ...]
//   node web/scripts/telefoon.mjs http://localhost:3001             lokale server, vaste lijst
//   BREEDTE=768 HOOGTE=1024 node web/scripts/telefoon.mjs https://zetelen.nl /coalitie
//   UIT=/pad/naar/map zet de schermafbeeldingen ergens anders neer (standaard de tijdelijke map van het systeem)
// Exitcode 1 als er een fout is; waarschuwingen laten de controle slagen.
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BREED = Number(process.env.BREEDTE || 375), HOOG = Number(process.env.HOOGTE || 812);
const PAGINAS = [
  "/", "/actueel", "/actueel/demissionair", "/actueel/akkoord-belastingplan", "/uitgelicht",
  "/verkenner", "/onderwerpen", "/coalitie", "/stemgenoten", "/oppositie",
  "/fracties", "/kamerleden", "/methodiek", "/over", "/privacy",
];
const basis = (process.argv[2] || "https://zetelen.nl").replace(/\/$/, "");
const paginas = process.argv.length > 3 ? process.argv.slice(3) : PAGINAS;
const dag = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
const uitmap = join(process.env.UIT || join(tmpdir(), "zetelen-controle", dag), String(BREED));
mkdirSync(uitmap, { recursive: true });

const slaap = (ms) => new Promise((r) => setTimeout(r, ms));
const werk = join(tmpdir(), `telefoon-${Date.now()}`);
mkdirSync(werk, { recursive: true });
const poort = 9300 + Math.floor(Math.random() * 400);
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ["--headless=new", `--remote-debugging-port=${poort}`, `--user-data-dir=${werk}`, "--hide-scrollbars", "--no-first-run", "about:blank"],
  { stdio: "ignore" });
let doel;
for (let i = 0; i < 50 && !doel; i++) {
  await slaap(200);
  try { doel = (await (await fetch(`http://127.0.0.1:${poort}/json`)).json()).find((t) => t.type === "page"); } catch { /* nog niet klaar */ }
}
const ws = new WebSocket(doel.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let nr = 0;
const wacht = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && wacht.has(d.id)) { wacht.get(d.id)(d); wacht.delete(d.id); } };
const cdp = (method, params = {}) => new Promise((r) => { const n = ++nr; wacht.set(n, (d) => r(d.result ?? {})); ws.send(JSON.stringify({ id: n, method, params })); });
const js = async (expr) => (await cdp("Runtime.evaluate", { returnByValue: true, awaitPromise: true, expression: expr })).result?.value;

await cdp("Page.enable");
const telefoon = BREED < 768;
await cdp("Emulation.setDeviceMetricsOverride", { width: BREED, height: HOOG, deviceScaleFactor: 1, mobile: telefoon });
if (telefoon) await cdp("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });

// De meting draait in de pagina. Alles in px; vh = schermhoogte.
const METING = `(async () => {
  const vh = innerHeight, vw = innerWidth;
  const slaap = (ms) => new Promise((r) => setTimeout(r, ms));
  // uitklapblokken open: wat een bezoeker kan openen, moet ook passen (tabel transporten, 17 november 2026)
  for (const d of document.querySelectorAll("details")) d.open = true;
  // langzaam doorscrollen zodat lazy content en scrollstappen laden
  for (let y = 0; y < document.documentElement.scrollHeight; y += vh * 0.6) { scrollTo(0, y); await slaap(120); }
  scrollTo(0, 0); await slaap(300);
  const hoogte = document.documentElement.scrollHeight;
  const zichtbaar = (e) => { const s = getComputedStyle(e); return s.display !== "none" && s.visibility !== "hidden"; };
  const fouten = [], waarsch = [];

  // 1. zijwaarts scrollen of afgeknipt: een element steekt rechts buiten het scherm.
  //    Niet meegeteld: vaste elementen en wat in een bewust zijwaarts scrollende strook staat (overflow-x auto of scroll).
  const scroller = (e) => { for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { if (/auto|scroll/.test(getComputedStyle(p).overflowX)) return true; } return false; };
  const uit = [];
  for (const e of document.querySelectorAll("body *")) {
    const b = e.getBoundingClientRect();
    if (b.width > 0 && b.height > 0 && b.right > vw + 1 && b.left < vw && getComputedStyle(e).position !== "fixed" && zichtbaar(e) && !scroller(e)) {
      uit.push(e.tagName.toLowerCase() + "." + String(e.className?.baseVal ?? e.className).split(" ")[0] + " tot " + Math.round(b.right) + " px");
      if (uit.length >= 3) break;
    }
  }
  if (uit.length || document.documentElement.scrollWidth > vw + 1)
    fouten.push("breder dan het scherm (" + vw + " px): " + (uit.join(", ") || "pagina " + document.documentElement.scrollWidth + " px"));

  // 2. lege stroken: verzamel alles wat inhoud is (tekst, beeld, kaart, knoppen) en zoek gaten in de hoogte
  const blokken = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const t = w.currentNode; if (!t.textContent.trim() || !t.parentElement || !zichtbaar(t.parentElement)) continue;
    const r = document.createRange(); r.selectNodeContents(t);
    for (const b of r.getClientRects()) if (b.height > 0) blokken.push([b.top + scrollY, b.bottom + scrollY]);
  }
  for (const e of document.querySelectorAll("img,svg,canvas,video,iframe,button,input,select,textarea,[role=img]")) {
    if (e.closest("svg") && e.tagName.toLowerCase() !== "svg") continue;
    const b = e.getBoundingClientRect(); if (b.height > 4 && b.width > 4 && zichtbaar(e)) blokken.push([b.top + scrollY, b.bottom + scrollY]);
  }
  // een element dat meeschuift (sticky) staat tijdens het scrollen over de hele hoogte van zijn ouder in beeld
  for (const e of document.querySelectorAll("body *")) {
    if (getComputedStyle(e).position !== "sticky" || !zichtbaar(e) || !e.parentElement) continue;
    const b = e.getBoundingClientRect(), p = e.parentElement.getBoundingClientRect();
    if (b.height > 4) blokken.push([p.top + scrollY, p.bottom + scrollY]);
  }
  blokken.sort((a, b) => a[0] - b[0]);
  let tot = 0; const gaten = [];
  for (const [a, b] of blokken) { if (a - tot > vh * 0.35) gaten.push([Math.round(tot), Math.round(a)]); tot = Math.max(tot, b); }
  if (hoogte - tot > vh * 0.35) gaten.push([Math.round(tot), Math.round(hoogte)]);
  for (const [a, b] of gaten) fouten.push("lege strook van " + (b - a) + " px (" + Math.round((b - a) / vh * 100) + "% van het scherm) op " + a + " px");

  // 3. scrollverhalen
  const stappen = [...document.querySelectorAll("[data-nr]")].filter(zichtbaar);
  if (stappen.length > 1) {
    const r = stappen.map((e) => e.getBoundingClientRect());
    const gat = Math.max(...r.slice(1).map((b, i) => b.top - r[i].bottom));
    // grens 64 px (--r-8, de grootste ruimtemaat); 10svh (81 px) was al te veel (feedback Niels, 16 november 2026)
    if (gat > 64) fouten.push("scrollverhaal: " + Math.round(gat) + " px tussen tekstvlakken (hoogstens 64)");
    const film = stappen.at(-1).closest("[class*=film]");
    if (film) {
      const na = film.getBoundingClientRect().bottom - r.at(-1).bottom;
      const tekst = "scrollverhaal: " + Math.round(na) + " px wit na het laatste tekstvlak (" + Math.round(na / vh * 100) + "%)";
      if (na > vh * 0.35) fouten.push(tekst); else if (na > vh * 0.2) waarsch.push(tekst);
    }
  }

  // 3b. een foutscherm of een grafiek die niet laadt: de site toont dan zelf een melding
  for (const e of document.querySelectorAll("main *")) {
    if (e.children.length === 0 && /^Er ging iets mis|laden mislukt/i.test(e.textContent.trim()) && zichtbaar(e) && e.getBoundingClientRect().height > 0) {
      fouten.push("foutmelding op de pagina: " + e.textContent.trim().slice(0, 60)); break;
    }
  }

  // 4. kleine letters in lopende tekst
  let klein = 0; let voorbeeld = "";
  for (const e of document.querySelectorAll("p, li, dd, blockquote")) {
    if (!zichtbaar(e) || !e.textContent.trim() || e.closest("footer, figcaption, small, [class*=bron], [class*=Bron], [class*=label]")) continue;
    const cs = getComputedStyle(e);
    if (/mono/i.test(cs.fontFamily)) continue;   // labels en datums in de schrijfmachineletter zijn bewust klein
    const px = parseFloat(cs.fontSize);
    if (px < 16) { klein++; if (!voorbeeld) voorbeeld = px + " px: " + e.textContent.trim().slice(0, 40); }
  }
  if (klein) waarsch.push(klein + " stukken lopende tekst kleiner dan 16 px (" + voorbeeld + ")");

  // 5. kleine knoppen (links midden in een zin tellen niet mee)
  const kn = [];
  for (const e of document.querySelectorAll("button, input:not([type=hidden]), select, textarea, a, [role=button]")) {
    if (!zichtbaar(e)) continue;
    if (e.tagName === "A" && e.closest("p, li, dd, figcaption, small, footer")) continue;
    const b = e.getBoundingClientRect(); if (!b.width || !b.height) continue;
    if (b.bottom < 0 || b.right < 0 || /inhoud/i.test(e.textContent) && b.top < 60 && e.getAttribute("href")?.startsWith("#")) continue;   // link "Direct naar inhoud" is pas zichtbaar bij toetsenbord
    if (b.height < 44 || b.width < 44) kn.push((e.textContent.trim() || e.getAttribute("aria-label") || e.tagName).slice(0, 25) + " " + Math.round(b.width) + "x" + Math.round(b.height));
  }
  if (kn.length) waarsch.push(kn.length + " knoppen of links kleiner dan 44 px (" + kn.slice(0, 4).join("; ") + ")");

  // 6. eerste grafiek of keuze (informatie)
  const graf = [...document.querySelectorAll("main svg, main canvas, main figure, main [role=img], main [data-vlak]")].filter((e) => zichtbaar(e) && e.getBoundingClientRect().height > 120).map((e) => Math.round(e.getBoundingClientRect().top + scrollY)).sort((a, b) => a - b)[0];
  const info = "eerste grafiek op " + (graf === undefined ? "geen" : graf + " px");
  return { hoogte, fouten, waarsch, info };
})()`;

let totaalFout = 0;
const verslag = [];
for (const pad of paginas) {
  const adres = basis + pad;
  await cdp("Page.navigate", { url: adres });
  await slaap(3500);
  // alleen om de controle zelf te testen: CONTROLE_CSS zet extra stijlregels in de pagina (bijvoorbeeld een oude fout)
  if (process.env.CONTROLE_CSS) await js(`(()=>{const s=document.createElement('style');s.textContent=${JSON.stringify(process.env.CONTROLE_CSS)};document.head.append(s)})()`);
  const m = await js(METING);
  if (!m) { verslag.push(`?? ${pad}: meting mislukt`); totaalFout++; continue; }
  // schermafbeelding van de hele pagina (hoogstens 12 schermen), voor het oog
  const h = Math.min(m.hoogte, HOOG * 12);
  const shot = await cdp("Page.captureScreenshot", { format: "jpeg", quality: 60, captureBeyondViewport: true, clip: { x: 0, y: 0, width: BREED, height: h, scale: 1 } });
  const naam = (pad.replace(/^\/|\/$/g, "").replace(/\//g, "_") || "voorpagina") + ".jpg";
  if (shot.data) writeFileSync(join(uitmap, naam), Buffer.from(shot.data, "base64"));
  const status = m.fouten.length ? "FOUT" : m.waarsch.length ? "let op" : "goed";
  if (m.fouten.length) totaalFout++;
  verslag.push(`${status.padEnd(6)} ${pad}  (${m.info}, pagina ${m.hoogte} px)`);
  for (const f of m.fouten) verslag.push(`         fout: ${f}`);
  for (const f of m.waarsch) verslag.push(`         let op: ${f}`);
}
verslag.push(`\n${paginas.length} pagina's op ${BREED} x ${HOOG}, ${totaalFout} met een fout. Schermafbeeldingen: ${uitmap}`);
console.log(verslag.join("\n"));
writeFileSync(join(uitmap, "verslag.txt"), verslag.join("\n") + "\n");
ws.close(); chrome.kill(); await slaap(500);
try { rmSync(werk, { recursive: true, force: true }); } catch { /* bezet */ }
process.exit(totaalFout ? 1 : 0);

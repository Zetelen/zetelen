// Haalt de gegevens voor de video "Hoe vaak stemmen VVD en PRO hetzelfde?" op uit de publieke API van Zetelen en schrijft
// src/gegevens/vvd-pro.json. Dezelfde cijfers als op /uitgelicht/vvd-en-pro (web/lib/vvdPro.ts), nagekeken door een
// aparte controle op 28 oktober 2026. PRO is de lijn GroenLinks-PvdA en PRO (web/content/fractie-opvolgers.json).
// Gebruik: node scripts/vvd_pro.mjs  (leest SUPABASE_URL en SUPABASE_PUBLISHABLE_KEY uit ../web/.env.local)
import { readFileSync, writeFileSync } from "node:fs";

const env = Object.fromEntries(readFileSync(new URL("../../web/.env.local", import.meta.url), "utf8").split("\n")
  .filter((r) => r.includes("=") && !r.startsWith("#")).map((r) => [r.slice(0, r.indexOf("=")).trim(), r.slice(r.indexOf("=") + 1).trim()]));
const basis = env.SUPABASE_URL.replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
const lees = async (pad) => {
  const r = await fetch(`${basis}/rest/v1/${pad}`, { headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY, "Accept-Profile": "api" } });
  if (!r.ok) throw new Error(`API ${r.status} op ${pad.split("?")[0]}`);
  return r.json();
};

const fr = await lees("fractie_periode?select=fractie,afkorting,periodesoort,periode,zetels,in_zaal&limit=1000");
const id = (a) => fr.find((f) => f.afkorting === a).fractie;
const VVD = id("VVD"), PVDA = id("PvdA"), GL = id("GL"), PVV = id("PVV");
const PRO = [id("GroenLinks-PvdA"), id("PRO")];

// Per half jaar, opgeteld over de fracties van een lijn; onder de 25 stemmingen samen geen percentage
async function halfjaar(ids) {
  const r = await lees(`cohesie_halfjaar?select=halfjaar,gezamenlijk,gelijk&variant=eq.alle&fractie=eq.${VVD}&andere_fractie=in.(${ids.join(",")})&limit=1000`);
  const per = new Map();
  for (const x of r) {
    const h = x.halfjaar.slice(0, 10), v = per.get(h) ?? { g: 0, s: 0 };
    per.set(h, { g: v.g + x.gezamenlijk, s: v.s + x.gelijk });
  }
  return [...per].sort().map(([h, v]) => ({ h, c: v.g >= 25 ? Math.round((1000 * v.s) / v.g) / 10 : null }));
}

const kabinet = await lees(`cohesie?select=periode,andere_fractie,andere_fractie_afkorting,gezamenlijk,gelijk&periodesoort=eq.kabinet&variant=eq.alle&fractie=eq.${VVD}&limit=1000`);
const perKabinet = (k, ids) => {
  const d = kabinet.filter((r) => r.periode === k && ids.includes(r.andere_fractie));
  const g = d.reduce((t, r) => t + r.gezamenlijk, 0), s = d.reduce((t, r) => t + r.gelijk, 0);
  return Math.round((1000 * s) / g) / 10;
};

// Rangorde onder Jetten: fracties met minstens 3 zetels in de zaal, PRO als één lijn
const zaal = new Map();
for (const f of fr.filter((x) => x.periodesoort === "kabinet" && x.periode === "Jetten" && x.in_zaal)) {
  const n = PRO.includes(f.fractie) ? "PRO" : f.afkorting;
  zaal.set(n, Math.max(zaal.get(n) ?? 0, f.zetels));
}
const per = new Map();
for (const r of kabinet.filter((x) => x.periode === "Jetten")) {
  const n = PRO.includes(r.andere_fractie) ? "PRO" : r.andere_fractie_afkorting, v = per.get(n) ?? { g: 0, s: 0 };
  per.set(n, { g: v.g + r.gezamenlijk, s: v.s + r.gelijk });
}
const rangorde = [...per].filter(([n, v]) => v.g >= 200 && (zaal.get(n) ?? 0) >= 3)
  .map(([naam, v]) => ({ naam, c: Math.round((1000 * v.s) / v.g) / 10 })).sort((a, b) => b.c - a.c);

const [pro, pvda, gl, pvv] = await Promise.all([halfjaar(PRO), halfjaar([PVDA]), halfjaar([GL]), halfjaar([PVV])]);
const kab = (await lees("kabinet?select=naam,begin,einde")).sort((a, b) => a.begin.localeCompare(b.begin));
const uit = {
  opgehaald: new Date().toISOString().slice(0, 10),
  lijnen: { pro, pvda, gl },
  kabinetten: kab,
  rangorde,
  pvdaPerKabinet: { "Rutte I": perKabinet("Rutte I", [PVDA]), "Rutte II": perKabinet("Rutte II", [PVDA]), "Rutte III": perKabinet("Rutte III", [PVDA]) },
  pvv: { samen: pvv.find((x) => x.h === "2024-07-01")?.c, oppositie: pvv.find((x) => x.h === "2026-01-01")?.c },
};
writeFileSync(new URL("../src/gegevens/vvd-pro.json", import.meta.url), JSON.stringify(uit, null, 1) + "\n");
console.log(`Geschreven: ${pro.length} halve jaren, ${rangorde.length} fracties in de rangorde`);

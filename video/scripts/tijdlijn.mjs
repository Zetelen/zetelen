// Haalt de gegevens voor de tijdlijn-video op uit de publieke API van Zetelen (schema api) en schrijft
// src/gegevens/tijdlijn.json: per kabinet sinds Rutte IV de zetels per fractie bij de start (30 dagen na het begin,
// migratie 013) en aan het eind, en wie er in het kabinet zat, met de datum van uittreden. Geen namen van personen.
// Gebruik: node scripts/tijdlijn.mjs  (leest SUPABASE_URL en SUPABASE_PUBLISHABLE_KEY uit ../web/.env.local)
import { readFileSync, writeFileSync } from "node:fs";

const env = Object.fromEntries(readFileSync(new URL("../../web/.env.local", import.meta.url), "utf8").split("\n")
  .filter((r) => r.includes("=") && !r.startsWith("#")).map((r) => [r.slice(0, r.indexOf("=")).trim(), r.slice(r.indexOf("=") + 1).trim()]));
const basis = env.SUPABASE_URL.replace(/\/+$/, "");
const lees = async (pad) => {
  const r = await fetch(`${basis}/rest/v1/${pad}`, { headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY, "Accept-Profile": "api" } });
  if (!r.ok) throw new Error(`API ${r.status} op ${pad.split("?")[0]}`);
  return r.json();
};

const KABINETTEN = ["Rutte IV", "Schoof", "Jetten"];
const kabinetten = (await lees("kabinet?select=naam,begin,einde")).filter((k) => KABINETTEN.includes(k.naam));
const coalitie = await lees(`coalitie?select=kabinet,afkorting,rol,tot&kabinet=in.(${KABINETTEN.map(encodeURIComponent).join(",")})`);
const uit = [];
for (const k of KABINETTEN) {
  const f = await lees(`fractie_periode?select=afkorting,zetels,zetels_begin,in_zaal,bij_begin&periodesoort=eq.kabinet&periode=eq.${encodeURIComponent(k)}`);
  const meta = kabinetten.find((x) => x.naam === k);
  uit.push({
    kabinet: k, begin: meta.begin, einde: meta.einde,
    begin_zetels: Object.fromEntries(f.filter((r) => r.bij_begin && (r.zetels_begin ?? 0) > 0).map((r) => [r.afkorting, r.zetels_begin])),
    eind_zetels: Object.fromEntries(f.filter((r) => r.in_zaal && r.zetels > 0).map((r) => [r.afkorting, r.zetels])),
    coalitie: coalitie.filter((c) => c.kabinet === k && c.rol === "kabinet").map((c) => ({ fractie: c.afkorting, tot: c.tot })),
  });
}
writeFileSync(new URL("../src/gegevens/tijdlijn.json", import.meta.url), JSON.stringify({
  _bron: "Zetelen, api.kabinet, api.coalitie en api.fractie_periode (open data van de Tweede Kamer). Gemaakt met video/scripts/tijdlijn.mjs.",
  opgehaald: new Date().toISOString().slice(0, 10), kabinetten: uit,
}, null, 2) + "\n");
console.log(`Tijdlijn: ${uit.length} kabinetten, ${uit.map((k) => Object.keys(k.begin_zetels).length).join("/")} fracties bij de start`);

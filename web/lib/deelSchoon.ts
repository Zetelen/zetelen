// Controle van de keuzes in een deellink (lib/deel.ts). De titel en het plaatje van een deellink tonen wat in de link
// staat; zonder controle kan iemand er willekeurige tekst in zetten die dan onder de naam van Zetelen verschijnt. Alleen
// partijen, perioden en stemmingen die bestaan, en vaste waarden voor de rest, gaan mee.
import { alleFracties, perioden } from "./cohesie";
import { type Grafiek, geheel, schoneUitslag, waardenVan } from "./deel";
import { schoonActueel, titelActueel } from "./actueel";
import { UITGELICHT } from "./uitgelichtLijst";

type Zoek = Record<string, string | string[] | undefined> | URLSearchParams;
const VAST: Record<string, string[]> = {
  soort: ["kabinet", "kamerperiode"], variant: ["alle", "verdeeld"], stuk: ["Motie", "Amendement", "Wetsvoorstel"], rol: ["kabinet", "oppositie"],
};

// Een half jaar uit Door de jaren: 2010-01 tot en met het lopende jaar, beginmaand januari of juli
const halfjaar = (v: string) => /^\d{4}-(01|07)$/.test(v) && Number(v.slice(0, 4)) >= 2010 && Number(v.slice(0, 4)) <= new Date().getFullYear();

export async function schoonZoek(g: Grafiek, zoek: Zoek): Promise<Record<string, string>> {
  const w = waardenVan(g, zoek);
  if (!Object.keys(w).length) return {};
  // Actueel: alleen een bestaand stuk en een blok daarvan; daarvoor is geen database nodig
  if (g === "actueel") return schoonActueel(w);
  const [lijst, alle] = await Promise.all([perioden(), alleFracties()]);
  const partijen = new Set((alle ?? []).map((f) => f.afkorting));
  const uit: Record<string, string> = {};
  for (const [k, v] of Object.entries(w)) {
    if (k === "fractie" || k === "met") { if (partijen.has(v)) uit[k] = v; }
    else if (k === "groep") { const p = v.split(",").filter((a) => partijen.has(a)).slice(0, 20); if (p.length) uit[k] = p.join(","); }
    else if (k === "periode") { if (lijst.some((p) => p.naam === v)) uit[k] = v; }
    else if (k === "casus") { if (UITGELICHT.some((u) => u.slug === v)) uit[k] = v; }
    else if (k === "u") { const u = schoneUitslag(v, partijen); if (u) uit[k] = u; }
    else if (k === "van" || k === "tot") { if (halfjaar(v)) uit[k] = v; }
    else if (k === "b" || k === "n") { if (geheel(v, 1, 200)) uit[k] = String(Number(v)); }
    else if (VAST[k]?.includes(v)) uit[k] = v;
  }
  return uit;
}

// Titel met de gegevens van de site erbij: bij een uitgelichte stemming de vraag van die stemming
export function titelMetData(g: Grafiek, zoek: Record<string, string>): string | null {
  if (g === "stemming") return UITGELICHT.find((u) => u.slug === zoek.casus)?.vraag ?? null;
  if (g === "actueel") return titelActueel(zoek);
  return null;
}

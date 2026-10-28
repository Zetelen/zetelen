// Uitgelicht: liggen VVD en PRO ver uit elkaar? (verzoek Niels, 28 oktober 2026; opzet in de vault, K13). Alles uit
// de bestaande tabellen: cohesie per kabinet (api.cohesie), per half jaar (api.cohesie_halfjaar) en per beleidsterrein
// (api.cohesie_terrein). PRO is de lijn GroenLinks-PvdA en PRO; GroenLinks en PvdA apart tot oktober 2023
// (content/fractie-opvolgers.json). Geen oordeel: de pagina zet twee lezingen naast elkaar.
import opvolgers from "@/content/fractie-opvolgers.json";
import { leesApi } from "./api";
import type { TerreinPaar } from "./onderwerpen";
import { DREMPEL, type Opvolger, lijnVan } from "./trend";

export const KABINETTEN = ["Balkenende IV", "Rutte I", "Rutte II", "Rutte III", "Rutte IV", "Schoof", "Jetten"];
// Het kabinet van de ranglijst op de pagina en in het deelplaatje
export const KABINET_NU = "Jetten";

export type PeriodeRij = { periode: string; andere_fractie: string; andere_fractie_afkorting: string; gezamenlijk: number; gelijk: number };
export type Coalitie = { kabinet: string; afkorting: string; rol: string; tot: string | null };

// Cohesie uit tellingen, opgeteld over een groep fracties (een lijn); onder de 25 stemmingen samen geen percentage
export function cohesieVan(rijen: PeriodeRij[], periode: string, ids: string[]): { cohesie: number | null; gezamenlijk: number } {
  const deel = rijen.filter((r) => r.periode === periode && ids.includes(r.andere_fractie));
  const g = deel.reduce((t, r) => t + r.gezamenlijk, 0), s = deel.reduce((t, r) => t + r.gelijk, 0);
  return { cohesie: g >= 25 ? (100 * s) / g : null, gezamenlijk: g };
}

// Rangorde in een kabinet: met welke fracties stemde de VVD het vaakst hetzelfde (lijnen samengevoegd, fracties met
// minstens `minZetels` zetels)
export function rangorde(rijen: PeriodeRij[], periode: string, zetels: Map<string, number>, lijnen: Map<string, string>, minZetels = 3) {
  const per = new Map<string, { g: number; s: number }>();
  for (const r of rijen.filter((x) => x.periode === periode)) {
    const naam = lijnen.get(r.andere_fractie) ?? r.andere_fractie_afkorting;
    const x = per.get(naam) ?? { g: 0, s: 0 };
    per.set(naam, { g: x.g + r.gezamenlijk, s: x.s + r.gelijk });
  }
  return [...per].filter(([n, x]) => x.g >= 200 && (zetels.get(n) ?? 0) >= minZetels)
    .map(([naam, x]) => ({ naam, cohesie: (100 * x.s) / x.g, gezamenlijk: x.g }))
    .sort((a, b) => b.cohesie - a.cohesie || a.naam.localeCompare(b.naam));
}

// Per beleidsterrein, opgeteld over de fracties van een lijn
export function perTerrein(rijen: Array<{ beleidsterrein: string; andere_fractie: string; cohesie: number | null; gezamenlijk: number }>, ids: string[]): TerreinPaar[] {
  const per = new Map<string, { g: number; s: number }>();
  for (const r of rijen.filter((x) => ids.includes(x.andere_fractie) && x.cohesie != null)) {
    const x = per.get(r.beleidsterrein) ?? { g: 0, s: 0 };
    per.set(r.beleidsterrein, { g: x.g + r.gezamenlijk, s: x.s + (r.cohesie! * r.gezamenlijk) / 100 });
  }
  return [...per].map(([terrein, x]) => ({ terrein, cohesie: (100 * x.s) / x.g, gezamenlijk: x.g, teWeinig: x.g < 25 }))
    .sort((a, b) => (b.gezamenlijk >= 50 ? 1 : 0) - (a.gezamenlijk >= 50 ? 1 : 0) || b.cohesie! - a.cohesie!);
}

export async function laadVvdPro() {
  const lijnPro = lijnVan("d60f373a-5bb2-477f-9979-a8f3a0514e6b", "PRO", opvolgers.opvolgers as Opvolger[]);
  const fr = await leesApi<Array<{ fractie: string; afkorting: string; periode: string; zetels: number; in_zaal: boolean }>>(
    "fractie_periode?select=fractie,afkorting,periode,zetels,in_zaal&periodesoort=eq.kabinet&limit=1000");
  const vvd = fr?.find((f) => f.afkorting === "VVD")?.fractie;
  if (!fr || !vvd) return null;
  const idVan = (a: string) => fr.find((f) => f.afkorting === a)?.fractie;
  const [rijen, coalitie, terrein] = await Promise.all([
    leesApi<PeriodeRij[]>(`cohesie?select=periode,andere_fractie,andere_fractie_afkorting,gezamenlijk,gelijk&periodesoort=eq.kabinet&variant=eq.alle&fractie=eq.${vvd}&limit=1000`),
    leesApi<Coalitie[]>("coalitie?select=kabinet,afkorting,rol,tot"),
    leesApi<Array<{ beleidsterrein: string; andere_fractie: string; cohesie: number | null; gezamenlijk: number }>>(
      `cohesie_terrein?select=beleidsterrein,andere_fractie,cohesie,gezamenlijk&periodesoort=eq.kabinet&periode=eq.Jetten&variant=eq.alle&fractie=eq.${vvd}&andere_fractie=in.(${lijnPro.ids.join(",")})&limit=1000`),
  ]);
  // GroenLinks met PvdA, onderling: stemden ze voor de fusie al hetzelfde?
  const gl = idVan("GL"), pvda = idVan("PvdA");
  const onderling = gl && pvda ? await leesApi<Array<{ periode: string; cohesie: number | null }>>(
    `cohesie?select=periode,cohesie&periodesoort=eq.kabinet&variant=eq.alle&fractie=eq.${gl}&andere_fractie=eq.${pvda}`) : null;
  if (!rijen || !coalitie || !terrein) return null;
  return { vvd, lijnPro, idVan, fracties: fr, rijen, coalitie, terrein, onderling: onderling ?? [] };
}

// De VVD met elke fractie per half jaar (api.cohesie_halfjaar)
export type HalfjaarRij = { halfjaar: string; andere_fractie: string; andere_fractie_afkorting: string; gezamenlijk: number; gelijk: number };
export async function halfjarenVvd(vvd: string): Promise<HalfjaarRij[]> {
  return (await leesApi<HalfjaarRij[]>(
    `cohesie_halfjaar?select=halfjaar,andere_fractie,andere_fractie_afkorting,gezamenlijk,gelijk&variant=eq.alle&fractie=eq.${vvd}&limit=5000`)) ?? [];
}

// Streepje in de ranglijst: de VVD met elke fractie van 2010 tot en met 2023, opgeteld over alle halve jaren (vanaf 25
// stemmingen samen). Op afkorting, dus ook PvdA, GroenLinks en PVV. Gedeeld door de pagina en het deelplaatje
export function gemiddeldTot2024(rijen: HalfjaarRij[]): Record<string, number | null> {
  const opgeteld = new Map<string, { gezamenlijk: number; gelijk: number }>();
  for (const x of rijen.filter((x) => x.halfjaar.slice(0, 10) < "2024-01-01")) {
    const t = opgeteld.get(x.andere_fractie_afkorting) ?? { gezamenlijk: 0, gelijk: 0 };
    opgeteld.set(x.andere_fractie_afkorting, { gezamenlijk: t.gezamenlijk + x.gezamenlijk, gelijk: t.gelijk + x.gelijk });
  }
  return Object.fromEntries([...opgeteld].map(([k, t]) => [k, t.gezamenlijk >= DREMPEL ? (100 * t.gelijk) / t.gezamenlijk : null]));
}

// Zetels per fractie in een kabinet, met PRO als één lijn
export function zetelsIn(fracties: Array<{ fractie: string; afkorting: string; periode: string; zetels: number; in_zaal: boolean }>,
  kabinet: string, lijnNaam: Map<string, string>): Map<string, number> {
  const m = new Map<string, number>();
  for (const f of fracties.filter((x) => x.periode === kabinet && x.in_zaal)) {
    const n = lijnNaam.get(f.fractie) ?? f.afkorting;
    m.set(n, Math.max(m.get(n) ?? 0, f.zetels));
  }
  return m;
}

// Uitgelicht: liggen VVD en PRO ver uit elkaar? (verzoek Niels, 28 oktober 2026; opzet in de vault, K13). Alles uit
// de bestaande tabellen: cohesie per kabinet (api.cohesie), per half jaar (api.cohesie_halfjaar) en per beleidsterrein
// (api.cohesie_terrein). PRO is de lijn GroenLinks-PvdA en PRO; GroenLinks en PvdA apart tot oktober 2023
// (content/fractie-opvolgers.json). Geen oordeel: de pagina zet twee lezingen naast elkaar.
import opvolgers from "@/content/fractie-opvolgers.json";
import { leesApi } from "./api";
import type { TerreinPaar } from "./onderwerpen";
import { type Opvolger, lijnVan } from "./trend";

export const KABINETTEN = ["Balkenende IV", "Rutte I", "Rutte II", "Rutte III", "Rutte IV", "Schoof", "Jetten"];

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

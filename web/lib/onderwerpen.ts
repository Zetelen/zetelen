// Cohesie per beleidsterrein (component onderwerpen, hoofdstuk 3 van het verhaal), uit api.cohesie_terrein
// en api.beleidsterrein_periode. Zelfde definitie en drempel als de gewone cohesie.
import { leesApi } from "./api";
import type { Periodesoort, Variant } from "./cohesie";
import type { Paar } from "./zaal";

export type TerreinPaar = Paar & { terrein: string };

// Per beleidsterrein: de cohesie van een fractie met elke andere fractie
export async function cohesiePerTerrein(soort: Periodesoort, periode: string, variant: Variant, fractie: string): Promise<Map<string, Map<string, Paar>> | null> {
  const rijen = await leesApi<Array<{ beleidsterrein: string; andere_fractie: string; cohesie: number | null; gezamenlijk: number; te_weinig_data: boolean }>>(
    `cohesie_terrein?select=beleidsterrein,andere_fractie,cohesie,gezamenlijk,te_weinig_data&limit=1000` +
      `&periodesoort=eq.${soort}&periode=eq.${encodeURIComponent(periode)}&variant=eq.${variant}&fractie=eq.${fractie}`,
  );
  if (!rijen) return null;
  const uit = new Map<string, Map<string, Paar>>();
  for (const r of rijen) {
    const m = uit.get(r.beleidsterrein) ?? new Map<string, Paar>();
    m.set(r.andere_fractie, { cohesie: r.cohesie == null ? null : Number(r.cohesie), gezamenlijk: r.gezamenlijk, teWeinig: r.te_weinig_data });
    uit.set(r.beleidsterrein, m);
  }
  return uit;
}

// Aantal stemmingen per beleidsterrein in de periode
export async function stemmingenPerTerrein(soort: Periodesoort, periode: string): Promise<Map<string, number>> {
  const rijen = await leesApi<Array<{ beleidsterrein: string; stemmingen: number }>>(
    `beleidsterrein_periode?select=beleidsterrein,stemmingen&periodesoort=eq.${soort}&periode=eq.${encodeURIComponent(periode)}`,
  );
  return new Map((rijen ?? []).map((r) => [r.beleidsterrein, r.stemmingen]));
}

// Het paar per terrein, van meest naar minst eens; terreinen met te weinig data achteraan
export function paarPerTerrein(perTerrein: Map<string, Map<string, Paar>>, met: string): TerreinPaar[] {
  const lijst: TerreinPaar[] = [];
  for (const [terrein, m] of perTerrein) {
    const p = m.get(met);
    if (p) lijst.push({ terrein, ...p });
  }
  const waarde = (p: TerreinPaar) => (p.teWeinig || p.cohesie == null ? -1 : p.cohesie);
  return lijst.sort((a, b) => waarde(b) - waarde(a) || a.terrein.localeCompare(b.terrein));
}

// Het terrein waarop het paar het vaakst en het minst vaak hetzelfde stemde. Alleen terreinen met minstens
// 50 gezamenlijke stemmingen: een klein terrein geeft snel een uitschieter die de kop zou halen.
export const MINIMUM_UITERSTEN = 50;
export function uitersten(lijst: TerreinPaar[]): { hoog: TerreinPaar; laag: TerreinPaar } | null {
  const geldig = lijst.filter((p) => !p.teWeinig && p.cohesie != null && p.gezamenlijk >= MINIMUM_UITERSTEN);
  return geldig.length >= 2 ? { hoog: geldig[0], laag: geldig[geldig.length - 1] } : null;
}

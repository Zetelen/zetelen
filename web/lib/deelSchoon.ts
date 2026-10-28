// Controle van de keuzes in een deellink (lib/deel.ts). De titel en het plaatje van een deellink tonen wat in de link
// staat; zonder controle kan iemand er willekeurige tekst in zetten die dan onder de naam van Zetelen verschijnt. Alleen
// partijen en perioden die in de data bestaan, en vaste waarden voor de rest, gaan mee.
import { alleFracties, perioden } from "./cohesie";
import { type Grafiek, zoekVan } from "./deel";

type Zoek = Record<string, string | string[] | undefined> | URLSearchParams;
const VAST: Record<string, string[]> = { soort: ["kabinet", "kamerperiode"], variant: ["alle", "verdeeld"] };

export async function schoonZoek(g: Grafiek, zoek: Zoek): Promise<Record<string, string>> {
  const q = new URLSearchParams(zoekVan(g, zoek));
  if (![...q.keys()].length) return {};
  const [lijst, alle] = await Promise.all([perioden(), alleFracties()]);
  const partijen = new Set((alle ?? []).map((f) => f.afkorting));
  const uit: Record<string, string> = {};
  for (const [k, v] of q) {
    if (k === "fractie" || k === "met") { if (partijen.has(v)) uit[k] = v; }
    else if (k === "periode") { if (lijst.some((p) => p.naam === v)) uit[k] = v; }
    else if (VAST[k]?.includes(v)) uit[k] = v;
  }
  return uit;
}

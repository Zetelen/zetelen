// Cijfers voor de vaste lezingen (docs/plan/lezingen-kandidaten.md): elke lezing is een paar, onderbouwd met
// dezelfde berekeningen als de tools. Alleen pure functies hier; de pagina haalt de data op.
import { type Stemmatrix, verdeeld, zetelTabel } from "./coalitie";

// Lezing 1 en 2: hoe vaak stemden fracties buiten de groep mee, over alle verdeelde eensgezinde stemmingen en over
// de krappe (verschil hooguit `krap` zetels), en hoe vaak won de groep
export type Meestemmen = { afkorting: string; alle: number; krap: number };
export function meestemmen(m: Stemmatrix, groep: string[], krap = 10): { eensgezind: number; gewonnen: number; krappe: number; fracties: Meestemmen[] } {
  const zetels = zetelTabel(m);
  const idx = groep.map((a) => m.fracties.findIndex((f) => f.afkorting === a)).filter((i) => i >= 0);
  const n = m.fracties.length;
  const mee = new Array<number>(n).fill(0), meeKrap = new Array<number>(n).fill(0);
  let eensgezind = 0, gewonnen = 0, krappe = 0;
  for (let b = 0; b < m.stemmen.length; b++) {
    const r = m.stemmen[b];
    const s = r[idx[0]];
    if (!idx.length || s === "-" || idx.some((i) => r[i] !== s) || !verdeeld(r)) continue;
    let voor = 0, tegen = 0;
    for (let f = 0; f < n; f++) if (r[f] === s) voor += zetels[f][b]; else if (r[f] !== "-") tegen += zetels[f][b];
    eensgezind++;
    if (voor > tegen) gewonnen++;
    const isKrap = Math.abs(voor - tegen) <= krap;
    if (isKrap) krappe++;
    for (let f = 0; f < n; f++) {
      if (idx.includes(f) || r[f] !== s) continue;
      mee[f]++;
      if (isKrap) meeKrap[f]++;
    }
  }
  const fracties = m.fracties
    .map((fr, f) => ({ afkorting: fr.afkorting, alle: eensgezind ? (100 * mee[f]) / eensgezind : 0, krap: krappe ? (100 * meeKrap[f]) / krappe : 0 }))
    .filter((x, f) => !idx.includes(f) && x.alle > 0)
    .sort((a, b) => b.alle - a.alle);
  return { eensgezind, gewonnen, krappe, fracties };
}

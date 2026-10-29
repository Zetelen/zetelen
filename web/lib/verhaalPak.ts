// Stippen van een scrollverhaal compact versturen (Oppositie lichter, 29 oktober 2026). Een verhaal heeft duizenden
// stippen; als losse objecten met sleutels als "key", "tint" en "kleur" werd de pagina Oppositie 1,4 MB, waarvan 1 MB
// stippen. Ingepakt is een stip zeven getallen: de sleutel en de tint als plek in een woordenlijst, de rest als getal.
// De server pakt in (components/verhaal/ScrollVerhaal.tsx), de browser pakt uit (ScrollVerhaalKlant.tsx). De straal
// gaat afgerond op een tiende mee; dat verschil is niet te zien.
import { type Kleur, type Stap, type Stip, type Verhaal, rond } from "./verhaal";

const KLEUREN: Kleur[] = [null, "kabinet", "nadruk", "uit", "zacht", "hol"];
const VELDEN = 7; // sleutel, x, y, kleur, tint, r, wacht; -1 is: niet ingevuld

export type GepakteStap = Omit<Stap, "stippen"> & { stippen: number[] };
export type GepaktVerhaal = { sleutels: string[]; tinten: string[]; breed: GepakteStap[]; smal?: GepakteStap[] };

export function pakVerhaal(v: Verhaal): GepaktVerhaal {
  const sleutels: string[] = [], tinten: string[] = [];
  const plekS = new Map<string, number>(), plekT = new Map<string, number>();
  const plek = (lijst: string[], plekken: Map<string, number>, w: string) => {
    let i = plekken.get(w);
    if (i === undefined) { i = lijst.length; lijst.push(w); plekken.set(w, i); }
    return i;
  };
  const pakStap = ({ stippen, ...rest }: Stap): GepakteStap => ({
    ...rest,
    stippen: stippen.flatMap((p) => [plek(sleutels, plekS, p.key), p.x, p.y, KLEUREN.indexOf(p.kleur), plek(tinten, plekT, p.tint), p.r === undefined ? -1 : rond(p.r), p.wacht ?? -1]),
  });
  return { breed: v.breed.map(pakStap), ...(v.smal ? { smal: v.smal.map(pakStap) } : {}), sleutels, tinten };
}

export function pakUit(g: GepaktVerhaal): Verhaal {
  const pakStap = ({ stippen, ...rest }: GepakteStap): Stap => {
    const uit: Stip[] = [];
    for (let i = 0; i < stippen.length; i += VELDEN) {
      const p: Stip = { key: g.sleutels[stippen[i]], x: stippen[i + 1], y: stippen[i + 2], kleur: KLEUREN[stippen[i + 3]], tint: g.tinten[stippen[i + 4]] };
      if (stippen[i + 5] !== -1) p.r = stippen[i + 5];
      if (stippen[i + 6] !== -1) p.wacht = stippen[i + 6];
      uit.push(p);
    }
    return { ...rest, stippen: uit };
  };
  return { breed: g.breed.map(pakStap), ...(g.smal ? { smal: g.smal.map(pakStap) } : {}) };
}

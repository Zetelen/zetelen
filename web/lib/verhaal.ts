// Rekenkern van de scroll graphics op /verhaal (ontwerp: docs/ontwerp/scroll-graphics.md).
// De server rekent per stap de plek van elke stip uit; de browser verplaatst alleen nog stippen.
import { MIDDEN, punt, zetels as zaalZetels } from "./zaal";

// Nadruk per stip: kabinet (gouden rand), nadruk (lichte rand), uit (gedimd), zacht (sterk gedimd)
export type Kleur = "kabinet" | "nadruk" | "uit" | "zacht" | null;
export type Stip = { key: string; x: number; y: number; kleur: Kleur; tint: string };
export type Tekstlabel = { x: number; y: number; tekst: string; waarde?: string; anchor?: "start" | "middle" | "end"; tint?: string };
// Kader: een lijn om de stippen van een fractie (alleen in de gegroepeerde blokken)
export type Kader = { x: number; y: number; b: number; h: number; fractie: string; tint?: string };
export type Stap = { datum: string; tekst: string; stippen: Stip[]; labels: Tekstlabel[]; kaders?: Kader[]; groot?: string; klein?: string };
export type Verhaal = { breed: Stap[]; smal?: Stap[] }; // smal: alleen als het op mobiel anders is
export const rond = (n: number) => Math.round(n * 10) / 10;

// Vaste volgorde over alle stappen: de volgorde van de zaal op /verkenner voor de Kamerperiode 2023-2025
// (MDS op cohesie), met fracties die toen niet bestonden naast hun voorganger of opvolger.
// Zelfde volgorde in elke stap, zodat stippen niet onnodig van kant wisselen.
export const VOLGORDE = ["PvdD", "BIJ1", "GL", "PvdA", "GroenLinks-PvdA", "PRO", "SP", "DENK", "Volt", "D66", "ChristenUnie", "CDA", "50PLUS",
  "Omtzigt", "Nieuw Sociaal Contract", "Fractie Den Haan", "SGP", "VVD", "FVD", "Groep Van Haga", "JA21", "BBB", "Lid Keijzer", "PVV", "Groep Markuszower"];
// Een opvolger neemt de stippen van zijn voorganger over
export const VOORGANGER: Record<string, string[]> = {
  "GroenLinks-PvdA": ["GL", "PvdA"], PRO: ["GroenLinks-PvdA"], "Groep Markuszower": ["PVV"], "Nieuw Sociaal Contract": ["Omtzigt"], "Lid Keijzer": ["BBB"],
};
export const KORT: Record<string, string> = { "GroenLinks-PvdA": "GL-PvdA", "Nieuw Sociaal Contract": "NSC", ChristenUnie: "CU", "Groep Markuszower": "Gr. Markuszower" };

// Eigen palet per fractie (geen partijkleuren: besluit 22 oktober 2026). Tien tinten, elk minstens
// 6:1 contrast op nacht-950. Fracties met minder dan 5 zetels in elke stap delen een neutrale tint.
export const PALET = ["#7fb7c9", "#e0915a", "#a08fe0", "#6fbf8e", "#e57f93", "#d2bb5a", "#5f93dc", "#d46fc0", "#c2885c", "#b9bfcc"];
export const KLEIN = "#6d7590";
// Een opvolger die de fractie voortzet (naamswijziging), houdt de tint
export const ERFT_TINT: Record<string, string> = { PRO: "GroenLinks-PvdA" };

const rang = (f: string) => { const i = VOLGORDE.indexOf(f); return i < 0 ? VOLGORDE.length : i; };

export type ZaalStip = { fractie: string; x: number; y: number; hoek: number };

// Tint per fractie: grote fracties krijgen, in zaalvolgorde, de eerste tint die geen andere grote fractie
// in dezelfde stap al heeft. Zo zijn buren en tijdgenoten altijd verschillend; een tint komt pas terug
// bij een fractie die nooit tegelijk in de Kamer zat.
export function tinten(verdelingen: Array<Record<string, number>>): Map<string, string> {
  const max = new Map<string, number>();
  for (const v of verdelingen) for (const [f, n] of Object.entries(v)) max.set(f, Math.max(max.get(f) ?? 0, n));
  const groot = (f: string) => (max.get(f) ?? 0) >= 5;
  const samen = new Map<string, Set<string>>();
  for (const v of verdelingen) {
    const hier = Object.keys(v).filter((f) => v[f] > 0 && groot(f));
    for (const f of hier) for (const g of hier) if (f !== g) samen.set(f, (samen.get(f) ?? new Set()).add(g));
  }
  const uit = new Map<string, string>();
  for (const f of [...max.keys()].sort((a, b) => rang(a) - rang(b) || a.localeCompare(b))) {
    if (ERFT_TINT[f] && uit.has(ERFT_TINT[f])) { uit.set(f, uit.get(ERFT_TINT[f])!); continue; }
    if (!groot(f)) { uit.set(f, KLEIN); continue; }
    const bezet = new Set([...(samen.get(f) ?? [])].map((g) => uit.get(g)).filter(Boolean));
    uit.set(f, PALET.find((t) => !bezet.has(t)) ?? PALET[uit.size % PALET.length]);
  }
  return uit;
}

// De zaal voor een verdeling van zetels, in de vaste volgorde (onbekende fracties achteraan, op naam)
export function zaal(zetels: Record<string, number>): ZaalStip[] {
  const lijst = Object.entries(zetels).filter(([, n]) => n > 0)
    .sort(([a], [b]) => rang(a) - rang(b) || a.localeCompare(b));
  return zaalZetels(lijst.map(([id, n]) => ({ id, zetels: n })))
    .filter((z) => z.fractie)
    .map((z) => ({ fractie: z.fractie!, x: z.x, y: z.y, hoek: z.hoek }));
}

// Kent vaste sleutels toe over de stappen heen: een fractie houdt haar stippen, een opvolger
// neemt de vrije stippen van zijn voorganger over, de rest krijgt nieuwe stippen
export function sleutels(stappen: ZaalStip[][]): string[][] {
  let vorige: Record<string, string[]> = {};
  let teller = 0;
  return stappen.map((stap) => {
    const vrij: Record<string, string[]> = Object.fromEntries(Object.entries(vorige).map(([f, k]) => [f, [...k]]));
    const nu: Record<string, string[]> = {};
    const uit = stap.map((z) => {
      let key = vrij[z.fractie]?.shift();
      if (!key) for (const v of VOORGANGER[z.fractie] ?? []) { key = vrij[v]?.pop(); if (key) break; }
      key ??= `s${teller++}`;
      (nu[z.fractie] ??= []).push(key);
      return key;
    });
    vorige = nu;
    return uit;
  });
}

// Labels buiten het hoefijzer, voor fracties vanaf 5 zetels
export function zaalLabels(stippen: ZaalStip[], tint?: Map<string, string>): Tekstlabel[] {
  const per = new Map<string, ZaalStip[]>();
  for (const z of stippen) per.set(z.fractie, [...(per.get(z.fractie) ?? []), z]);
  return [...per].filter(([, zs]) => zs.length >= 5).map(([f, zs]) => {
    const h = zs.reduce((t, z) => t + z.hoek, 0) / zs.length;
    const p = punt(475, h);
    return { x: Math.round(p.x), y: Math.round(p.y), tekst: KORT[f] ?? f, waarde: String(zs.length), tint: tint?.get(f),
      anchor: p.x < MIDDEN.x - 40 ? "end" : p.x > MIDDEN.x + 40 ? "start" : "middle" };
  });
}

export type Stemming = Record<string, Record<string, number>>; // stem -> fractie -> leden
export const STEMSOORTEN = ["Voor", "Tegen", "Niet deelgenomen"] as const;
export type StemStip = ZaalStip & { stem: string; key: string };

// De zaal van een stemming: elke zetel krijgt een stem (per fractie voor, dan tegen, dan niet deelgenomen)
export function stemZaal(stemming: Stemming): StemStip[] {
  const zetels: Record<string, number> = {};
  for (const s of STEMSOORTEN) for (const [f, n] of Object.entries(stemming[s] ?? {})) zetels[f] = (zetels[f] ?? 0) + n;
  const per = new Map<string, number>();
  return zaal(zetels).map((z, i) => {
    const k = per.get(z.fractie) ?? 0;
    per.set(z.fractie, k + 1);
    let grens = 0, stem = "Niet deelgenomen";
    for (const s of STEMSOORTEN) { grens += stemming[s]?.[z.fractie] ?? 0; if (k < grens) { stem = s; break; } }
    return { ...z, stem, key: `e${i}` };
  });
}

// Blokken per stem; gegroepeerd: per fractie een eigen rij met naam
export function blokken(zaalStippen: StemStip[], gegroepeerd: boolean, smal: boolean): { stippen: Array<StemStip>; labels: Tekstlabel[]; kaders: Kader[] } {
  const blok = smal
    ? { Voor: { x: 200, y: 20 }, Tegen: { x: 200, y: 330 }, "Niet deelgenomen": { x: 200, y: 900 } }
    : { Voor: { x: 40, y: 0 }, Tegen: { x: 560, y: 0 }, "Niet deelgenomen": { x: 300, y: 420 } };
  const stap = smal ? 31 : 23, kolommen = smal ? 27 : 18;
  const stippen: StemStip[] = [], labels: Tekstlabel[] = [], kaders: Kader[] = [];
  const marge = 5; // ruimte tussen stip en kader
  for (const s of STEMSOORTEN) {
    const b = blok[s];
    const leden = zaalStippen.filter((z) => z.stem === s).sort((p, q) => rang(p.fractie) - rang(q.fractie) || p.hoek - q.hoek);
    labels.push({ x: b.x, y: b.y - 22, tekst: s, waarde: String(leden.length) });
    let rij = 0, kol = 0, vorige: string | null = null;
    for (const z of leden) {
      if (gegroepeerd && vorige && z.fractie !== vorige) { rij += kol ? 1 : 0; kol = 0; rij += 0.6; }
      if (gegroepeerd && z.fractie !== vorige) labels.push({ x: b.x - 14, y: Math.round(b.y + rij * stap + 5), tekst: KORT[z.fractie] ?? z.fractie, anchor: "end" });
      stippen.push({ ...z, x: b.x + 11 + kol * stap, y: b.y + 11 + rij * stap });
      vorige = z.fractie;
      if (++kol === kolommen) { kol = 0; rij++; }
    }
    if (gegroepeerd) {
      const per = new Map<string, StemStip[]>();
      for (const z of stippen) if (z.stem === s) per.set(z.fractie, [...(per.get(z.fractie) ?? []), z]);
      for (const [fractie, zs] of per) {
        const xs = zs.map((z) => z.x), ys = zs.map((z) => z.y);
        const x = Math.min(...xs) - 10.5 - marge, y = Math.min(...ys) - 10.5 - marge;
        kaders.push({ fractie, x, y, b: Math.max(...xs) + 10.5 + marge - x, h: Math.max(...ys) + 10.5 + marge - y });
      }
    }
  }
  return { stippen, labels, kaders };
}

export function maandJaar(datum: string): string {
  return new Date(datum).toLocaleDateString("nl-NL", { month: "long", year: "numeric", timeZone: "Europe/Amsterdam" });
}
export function dagMaandJaar(datum: string): string {
  return new Date(datum).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Amsterdam" });
}

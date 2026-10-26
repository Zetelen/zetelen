// Tegen het advies van het kabinet in (besluit Niels B18, 26 oktober 2026): moties die het kabinet ontraadde en die de
// Kamer toch aannam. Gegevens uit content/ontraden/moties.json (pipeline/ontraden.py), vanaf 1 april 2019: sindsdien
// legt de bron het oordeel van het kabinet vast. Alle zinnen worden uit de tellingen opgebouwd.
import moties from "../content/ontraden/moties.json";
import { kabinetOp } from "./uitgelicht";
import { type Stap, type Stip, type Tekstlabel, rond } from "./verhaal";

export type Motie = { n: string; d: string; o: "O" | "K" | "V" | "A"; u: 0 | 1 | null; f: string[] };
export const MOTIES = moties as Motie[];
export type Rol = "kabinet" | "oppositie" | "gemengd" | "onbekend";

// Rol van de indieners op de dag van indiening: allemaal uit het kabinet, allemaal uit de oppositie, of gemengd
export function rolVan(m: Motie): Rol {
  const k = kabinetOp(m.d);
  if (!k || !m.f.length) return "onbekend";
  const kant = new Set([...k.leden, ...k.gedoog]);
  const inKabinet = m.f.filter((f) => kant.has(f)).length;
  return inKabinet === m.f.length ? "kabinet" : inKabinet === 0 ? "oppositie" : "gemengd";
}

export type Telling = {
  totaal: number; gestemd: number; aangenomen: number;
  perOordeel: Record<Motie["o"], { gestemd: number; aangenomen: number }>;
  tochAangenomen: Motie[];
  perKabinet: Array<{ kabinet: string; aangenomen: number; ontraden: number }>;
  perRol: Record<Rol, number>;
  perFractie: Array<{ fractie: string; n: number }>;
};

export function telling(rijen: Motie[]): Telling {
  const gestemd = rijen.filter((m) => m.u !== null);
  const perOordeel = { O: { gestemd: 0, aangenomen: 0 }, K: { gestemd: 0, aangenomen: 0 }, V: { gestemd: 0, aangenomen: 0 }, A: { gestemd: 0, aangenomen: 0 } };
  for (const m of gestemd) { perOordeel[m.o].gestemd++; if (m.u === 1) perOordeel[m.o].aangenomen++; }
  const toch = gestemd.filter((m) => m.o === "O" && m.u === 1);
  const kabinetten = [...new Set(gestemd.map((m) => kabinetOp(m.d)?.naam).filter((k): k is string => !!k))];
  const perKabinet = kabinetten.map((k) => {
    const hier = gestemd.filter((m) => kabinetOp(m.d)?.naam === k && m.u === 1);
    return { kabinet: k, aangenomen: hier.length, ontraden: hier.filter((m) => m.o === "O").length };
  });
  const perRol: Record<Rol, number> = { kabinet: 0, oppositie: 0, gemengd: 0, onbekend: 0 };
  for (const m of toch) perRol[rolVan(m)]++;
  const tel = new Map<string, number>();
  for (const m of toch) for (const f of m.f) tel.set(f, (tel.get(f) ?? 0) + 1);
  return {
    totaal: rijen.length, gestemd: gestemd.length, aangenomen: gestemd.filter((m) => m.u === 1).length, perOordeel, tochAangenomen: toch,
    perKabinet, perRol, perFractie: [...tel].map(([fractie, n]) => ({ fractie, n })).sort((a, b) => b.n - a.n || a.fractie.localeCompare(b.fractie)),
  };
}

// Blokken stippen naast elkaar, een blok per groep; elke stip is een aantal moties. De sleutel per plek blijft gelijk,
// zodat een stip van kleur kan wisselen zonder te verspringen.
type Segment = { n: number; tint: string; zacht?: boolean; sleutel: string };
export function blokken(groepen: Array<{ label: string; segmenten: Segment[] }>, per: number): { stippen: Stip[]; labels: Tekstlabel[] } {
  const BREED = 10, STAP = 13, BODEM = 420, X0 = 40, KOL = 920 / Math.max(groepen.length, 1);
  const stippen: Stip[] = [], labels: Tekstlabel[] = [];
  groepen.forEach((g, j) => {
    const x0 = X0 + j * KOL + (KOL - BREED * STAP) / 2;
    let i = 0;
    for (const s of g.segmenten) for (let k = 0; k < Math.round(s.n / per); k++, i++) {
      stippen.push({ key: `${s.sleutel}-${k}`, x: rond(x0 + (i % BREED) * STAP), y: rond(BODEM - Math.floor(i / BREED) * STAP), kleur: s.zacht ? "zacht" : null, tint: s.tint, r: 5 });
    }
    labels.push({ x: rond(x0 + ((BREED - 1) * STAP) / 2), y: BODEM + 30, tekst: g.label, anchor: "middle", groot: true });
  });
  return { stippen, labels };
}

export const KLEUR = { O: "#e57f93", K: "#7fb7c9", V: "#6fbf8e", A: "#8a96b8" };
export type StapZonderTekst = Omit<Stap, "tekst" | "datum">;

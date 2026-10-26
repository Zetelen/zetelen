// Eigen beelden per uitgelichte stemming (feedback Niels K7, 26 oktober 2026: "nu is het telkens hetzelfde"),
// met dezelfde keuze als de explainervideo's (docs/plan/video-pipeline.md):
//   weegschaal  hooguit drie stemmen verschil
//   hoefijzer   de uiteinden van de rij stemmen hetzelfde en het midden anders
//   van dichtbij  een fractie stemt verdeeld, of er is een vergissing: inzoomen op die fractie
// Elke vorm geeft extra stappen voor het scrollverhaal; de stippen houden hun sleutel, dus ze schuiven van de
// zaal naar de nieuwe vorm. Alle zinnen komen uit de gegevens.
import { type FractieStem, lijst, naam, perFractie, telwoord } from "./uitgelicht";
import { type Kleur, type Pad, type Stap, type StemStip, type Stemming, type Tekstlabel, VOLGORDE, rond } from "./verhaal";

type Kleurer = (p: StemStip) => Kleur;
const rang = (f: string) => { const i = VOLGORDE.indexOf(f); return i < 0 ? VOLGORDE.length : i; };
const volgorde = (a: StemStip, b: StemStip) => rang(a.fractie) - rang(b.fractie) || a.fractie.localeCompare(b.fractie) || a.key.localeCompare(b.key);

// De uiteinden van de rij (in de volgorde van de zaal) stemmen hetzelfde, en minstens één fractie in het midden anders
export function hoefijzerPast(pf: FractieStem[]): boolean {
  const rij = pf.filter((f) => f.kant !== "Niet deelgenomen").sort((a, b) => rang(a.fractie) - rang(b.fractie));
  if (rij.length < 4) return false;
  const eerste = rij[0], laatste = rij[rij.length - 1];
  return eerste.kant === laatste.kant && rij.slice(1, -1).some((f) => f.kant !== eerste.kant);
}

// Weegschaal: voor in de linkerschaal, tegen in de rechter; de balk kantelt naar de zwaarste kant
export function weegschaal(zs: StemStip[], tint: (p: StemStip) => string): Stap {
  const voor = zs.filter((p) => p.stem === "Voor").sort(volgorde), tegen = zs.filter((p) => p.stem === "Tegen").sort(volgorde);
  const niet = zs.filter((p) => p.stem === "Niet deelgenomen").sort(volgorde);
  const hoek = Math.max(-9, Math.min(9, (tegen.length - voor.length) * 3)) * (Math.PI / 180);
  const M = { x: 500, y: 150 }, HALF = 300, HANG = 150, BREED = 13, STAP = 17;
  const eind = (k: -1 | 1) => ({ x: rond(M.x + k * HALF * Math.cos(hoek)), y: rond(M.y + k * HALF * Math.sin(hoek)) });
  const L = eind(-1), R = eind(1);
  const stapel = (ps: StemStip[], p: { x: number; y: number }) => ps.map((s, i) => ({
    key: s.key, x: rond(p.x - ((BREED - 1) * STAP) / 2 + (i % BREED) * STAP), y: rond(p.y + HANG - 8 - Math.floor(i / BREED) * STAP), kleur: null as Kleur, tint: tint(s), r: 7,
  }));
  const schaal = (p: { x: number; y: number }): Pad[] => [
    { d: `M${p.x},${p.y} L${rond(p.x - 120)},${rond(p.y + HANG)} M${p.x},${p.y} L${rond(p.x + 120)},${rond(p.y + HANG)}`, tint: "#566aa6" },
    { d: `M${rond(p.x - 125)},${rond(p.y + HANG)} Q${p.x},${rond(p.y + HANG + 40)} ${rond(p.x + 125)},${rond(p.y + HANG)}`, tint: "#d08a55", breedte: 3 },
  ];
  const paden: Pad[] = [
    { d: `M${M.x},${M.y} L${M.x - 30},440 L${M.x + 30},440 Z`, tint: "#2a3a63", breedte: 2 },
    { d: `M${L.x},${L.y} L${R.x},${R.y}`, tint: "#e3b76a", breedte: 6 },
    ...schaal(L), ...schaal(R),
  ];
  const labels: Tekstlabel[] = [
    { x: L.x, y: rond(L.y + HANG + 70), tekst: "voor", waarde: String(voor.length), anchor: "middle", groot: true },
    { x: R.x, y: rond(R.y + HANG + 70), tekst: "tegen", waarde: String(tegen.length), anchor: "middle", groot: true },
    ...(niet.length ? [{ x: M.x, y: 495, tekst: "niet mee", waarde: String(niet.length), anchor: "middle" as const }] : []),
  ];
  const stippen = [...stapel(voor, L), ...stapel(tegen, R),
    ...niet.map((s, i) => ({ key: s.key, x: rond(M.x - ((niet.length - 1) * 16) / 2 + i * 16), y: 470, kleur: "zacht" as Kleur, tint: tint(s), r: 6 }))];
  const v = Math.abs(voor.length - tegen.length);
  return {
    datum: "op de weegschaal",
    tekst: `${voor.length} tegen ${tegen.length}: de balk zakt naar de kant met ${telwoord(v)} ${v === 1 ? "stem" : "stemmen"} meer.${niet.length ? ` ${Hoofd(telwoord(niet.length))} ${niet.length === 1 ? "Kamerlid deed" : "Kamerleden deden"} niet mee: genoeg om het anders te laten uitvallen.` : ""}`,
    stippen, labels, paden,
  };
}

// Hoefijzer: eerst de 150 stemmen op een rij in de volgorde van de zaal, dan buigt de rij dicht
export function hoefijzer(zs: StemStip[], st: Stemming, tint: (p: StemStip) => string): Stap[] {
  const rij = [...zs].sort(volgorde);
  const BAAN = 3, kolommen = Math.ceil(rij.length / BAAN);
  const plek = (i: number, buig: number) => {
    const u = Math.floor(i / BAAN) / Math.max(1, kolommen - 1), baan = (i % BAAN) - 1;
    const recht = { x: 20 + u * 960, y: 260 + baan * 16 };
    const hoek = (-150 + u * 300) * (Math.PI / 180), r = 200 + baan * 16;
    const boog = { x: 500 + r * Math.sin(hoek), y: 250 - r * Math.cos(hoek) };
    return { x: rond(recht.x + (boog.x - recht.x) * buig), y: rond(recht.y + (boog.y - recht.y) * buig) };
  };
  const stemKleur = (p: StemStip): Kleur => (p.stem === "Voor" ? null : p.stem === "Tegen" ? "uit" : "zacht");
  const bouw = (buig: number) => rij.map((p, i) => ({ key: p.key, ...plek(i, buig), kleur: stemKleur(p), tint: tint(p), r: 7 }));
  const pf = perFractie(st).filter((f) => f.kant !== "Niet deelgenomen").sort((a, b) => rang(a.fractie) - rang(b.fractie));
  const eerste = pf[0], laatste = pf[pf.length - 1];
  const midden = pf.filter((f) => f.kant !== eerste.kant).map((f) => naam(f.fractie));
  const eindLabels = (buig: number): Tekstlabel[] => {
    const a = plek(1, buig), z = plek(rij.length - 2, buig);
    const y = Math.max(a.y, z.y) + 40;
    return [
      { x: a.x, y, tekst: naam(eerste.fractie), anchor: buig ? "end" : "start", groot: true, halo: true },
      { x: z.x, y, tekst: naam(laatste.fractie), anchor: buig ? "start" : "end", groot: true, halo: true },
    ];
  };
  return [
    { datum: "op een rij", tekst: `Dezelfde 150 stemmen op een rij, in de volgorde van de zaal: fracties die vaak hetzelfde stemmen, staan naast elkaar. Voor in volle kleur, tegen gedimd.`,
      stippen: bouw(0), labels: eindLabels(0) },
    { datum: "buig de rij", tekst: `Buig de rij en de uiteinden raken elkaar: ${naam(eerste.fractie)} en ${naam(laatste.fractie)} stemmen allebei ${eerste.kant.toLowerCase()}. Het midden stemt anders: ${lijst(midden.slice(0, 4))}${midden.length > 4 ? " en meer" : ""}.`,
      stippen: bouw(1), labels: eindLabels(1) },
  ];
}

// Van dichtbij: de stippen van één fractie groot in beeld; wie anders stemt dan de meerderheid, schuift opzij
export function dichtbij(zs: StemStip[], fractie: string, tint: (p: StemStip) => string, uitleg: string): Stap {
  const eigen = zs.filter((p) => p.fractie === fractie);
  const voor = eigen.filter((p) => p.stem === "Voor").length, tegen = eigen.filter((p) => p.stem === "Tegen").length;
  const meer = voor >= tegen ? "Voor" : "Tegen";
  const groepen = [eigen.filter((p) => p.stem === meer), eigen.filter((p) => p.stem !== meer && p.stem !== "Niet deelgenomen"), eigen.filter((p) => p.stem === "Niet deelgenomen")];
  const KOL = 6, STAP = 46;
  const x0 = [120, 560, 820];
  const stippen = groepen.flatMap((g, j) => g.map((p, i) => ({
    key: p.key, x: rond(x0[j] + (i % (j === 0 ? KOL : 3)) * STAP), y: rond(60 + Math.floor(i / (j === 0 ? KOL : 3)) * STAP),
    kleur: (j === 1 ? "nadruk" : j === 2 ? "zacht" : null) as Kleur, tint: tint(p), r: 17,
  })));
  const woord = (s: string) => (s === "Voor" ? "voor" : "tegen");
  const labels: Tekstlabel[] = [
    { x: x0[0], y: 30, tekst: woord(meer), waarde: String(groepen[0].length), groot: true },
    ...(groepen[1].length ? [{ x: x0[1], y: 30, tekst: woord(meer === "Voor" ? "Tegen" : "Voor"), waarde: String(groepen[1].length), groot: true }] : []),
    ...(groepen[2].length ? [{ x: x0[2], y: 30, tekst: "niet mee", waarde: String(groepen[2].length), groot: true }] : []),
  ];
  return { datum: `${naam(fractie)} van dichtbij`, tekst: uitleg, stippen, labels };
}

const Hoofd = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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

// Weegschaal in twee stappen (feedback Niels K9, 27 oktober 2026: "langzaam vollopen en bewegen", zoals in de video):
// eerst vallen de stemmen een voor een in de schalen terwijl de balk recht hangt, dan kantelt de balk naar de zwaarste
// kant. De balk en de schalen houden hun sleutel, zodat ze meedraaien en meeschuiven in plaats van opnieuw te verschijnen.
export function weegschaal(zs: StemStip[], tint: (p: StemStip) => string): Stap[] {
  const voor = zs.filter((p) => p.stem === "Voor").sort(volgorde), tegen = zs.filter((p) => p.stem === "Tegen").sort(volgorde);
  const niet = zs.filter((p) => p.stem === "Niet deelgenomen").sort(volgorde);
  const M = { x: 500, y: 150 }, HALF = 300, HANG = 150, BREED = 13, STAP = 17, WACHT = 14;
  const L0 = { x: M.x - HALF, y: M.y }, R0 = { x: M.x + HALF, y: M.y };
  const stand = (graden: number, vullen: boolean): Stap => {
    const hoek = graden * (Math.PI / 180);
    const eind = (k: -1 | 1) => ({ x: rond(M.x + k * HALF * Math.cos(hoek)), y: rond(M.y + k * HALF * Math.sin(hoek)) });
    const L = eind(-1), R = eind(1);
    // Vullen: de onderste rij eerst, elke stip iets later dan de vorige; beide schalen tegelijk
    const stapel = (ps: StemStip[], p: { x: number; y: number }) => ps.map((s, i) => ({
      key: s.key, x: rond(p.x - ((BREED - 1) * STAP) / 2 + (i % BREED) * STAP), y: rond(p.y + HANG - 8 - Math.floor(i / BREED) * STAP), kleur: null as Kleur, tint: tint(s), r: 7,
      ...(vullen ? { wacht: i * WACHT } : {}),
    }));
    // De schalen getekend op hun plek bij een rechte balk, en verschoven naar het eind van de balk
    const schaal = (p0: { x: number; y: number }, p: { x: number; y: number }, kant: string): Pad[] => {
      const verschuif = `translate(${rond(p.x - p0.x)}px, ${rond(p.y - p0.y)}px)`;
      return [
        { naam: `touw-${kant}`, verschuif, d: `M${p0.x},${p0.y} L${p0.x - 120},${p0.y + HANG} M${p0.x},${p0.y} L${p0.x + 120},${p0.y + HANG}`, tint: "#566aa6" },
        { naam: `schaal-${kant}`, verschuif, d: `M${p0.x - 125},${p0.y + HANG} Q${p0.x},${p0.y + HANG + 40} ${p0.x + 125},${p0.y + HANG}`, tint: "#d08a55", breedte: 3 },
      ];
    };
    const paden: Pad[] = [
      { naam: "voet", d: `M${M.x},${M.y} L${M.x - 30},440 L${M.x + 30},440 Z`, tint: "#2a3a63", breedte: 2 },
      { naam: "balk", d: `M${L0.x},${L0.y} L${R0.x},${R0.y}`, tint: "#e3b76a", breedte: 6,
        verschuif: `translate(${M.x}px, ${M.y}px) rotate(${graden}deg) translate(${-M.x}px, ${-M.y}px)` },
      ...schaal(L0, L, "voor"), ...schaal(R0, R, "tegen"),
    ];
    const labels: Tekstlabel[] = [
      { x: L.x, y: rond(L.y + HANG + 70), tekst: "voor", waarde: String(voor.length), anchor: "middle", groot: true },
      { x: R.x, y: rond(R.y + HANG + 70), tekst: "tegen", waarde: String(tegen.length), anchor: "middle", groot: true },
      ...(niet.length ? [{ x: M.x, y: 495, tekst: "niet mee", waarde: String(niet.length), anchor: "middle" as const }] : []),
    ];
    const stippen = [...stapel(voor, L), ...stapel(tegen, R),
      ...niet.map((s, i) => ({ key: s.key, x: rond(M.x - ((niet.length - 1) * 16) / 2 + i * 16), y: 470, kleur: "zacht" as Kleur, tint: tint(s), r: 6 }))];
    return { datum: "", tekst: "", stippen, labels, paden };
  };
  const v = Math.abs(voor.length - tegen.length);
  const kantel = Math.max(-9, Math.min(9, (tegen.length - voor.length) * 3));
  return [
    { ...stand(0, true), datum: "op de weegschaal", tekst: "Elke stip is een Kamerlid. Voor gaat in de linkerschaal, tegen in de rechter." },
    { ...stand(kantel, false), datum: "de balk zakt",
      tekst: `${voor.length} tegen ${tegen.length}: de balk zakt naar de kant met ${telwoord(v)} ${v === 1 ? "stem" : "stemmen"} meer.${niet.length ? ` ${Hoofd(telwoord(niet.length))} ${niet.length === 1 ? "Kamerlid deed" : "Kamerleden deden"} niet mee: genoeg om het anders te laten uitvallen.` : ""}` },
  ];
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
  const pf = perFractie(st).filter((f) => f.kant !== "Niet deelgenomen").sort((a, b) => rang(a.fractie) - rang(b.fractie));
  const eerste = pf[0], laatste = pf[pf.length - 1];
  // Gebogen: de twee uiteinden lichten op (feedback Niels K7, 27 oktober 2026: "niet per se duidelijk dat die uiteinden
  // hetzelfde hebben gestemd"); de rest houdt de kleur van de stem
  const uiteinde = (p: StemStip) => p.fractie === eerste.fractie || p.fractie === laatste.fractie;
  const bouw = (buig: number) => rij.map((p, i) => ({ key: p.key, ...plek(i, buig), kleur: buig && uiteinde(p) ? "nadruk" as Kleur : stemKleur(p), tint: tint(p), r: 7 }));
  const midden = pf.filter((f) => f.kant !== eerste.kant).map((f) => naam(f.fractie));
  const eindLabels = (buig: number): Tekstlabel[] => {
    const a = plek(1, buig), z = plek(rij.length - 2, buig);
    const y = Math.max(a.y, z.y) + 40;
    return [
      { x: a.x, y, tekst: naam(eerste.fractie), anchor: buig ? "end" : "start", groot: true, halo: true },
      { x: z.x, y, tekst: naam(laatste.fractie), anchor: buig ? "start" : "end", groot: true, halo: true },
    ];
  };
  // Een boog onder de opening, van het ene uiteinde naar het andere
  const verbinding = (): Pad => {
    const a = plek(1, 1), z = plek(rij.length - 2, 1);
    return { d: `M${rond(a.x + 14)},${a.y} Q500,${rond(Math.max(a.y, z.y) + 50)} ${rond(z.x - 14)},${z.y}`, tint: "#e3b76a", breedte: 2.5, streep: true };
  };
  return [
    { datum: "op een rij", tekst: `Dezelfde 150 stemmen op een rij, in de volgorde van de zaal: fracties die vaak hetzelfde stemmen, staan naast elkaar. Voor in volle kleur, tegen gedimd.`,
      stippen: bouw(0), labels: eindLabels(0) },
    { datum: "buig de rij", tekst: `Buig de rij en de uiteinden raken elkaar: ${naam(eerste.fractie)} en ${naam(laatste.fractie)} stemmen allebei ${eerste.kant.toLowerCase()}. Het midden stemt anders: ${lijst(midden.slice(0, 4))}${midden.length > 4 ? " en meer" : ""}.`,
      stippen: bouw(1), labels: [...eindLabels(1), { x: 500, y: rond(plek(1, 1).y - 24), tekst: `allebei ${eerste.kant.toLowerCase()}`, anchor: "middle", groot: true, halo: true }],
      paden: [verbinding()] },
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

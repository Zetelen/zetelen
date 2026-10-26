// Uitgelicht: één hoofdelijke stemming uit elkaar gehaald (besluit Niels B16, 26 oktober 2026).
// Dezelfde scroll graphic als de motie-Eerdmans op /onderwerpen (lib/stemmingVerhaal.ts), maar algemeen: de stappen
// worden opgebouwd uit de gegevens in content/uitgelicht/<zaak>.json (gemaakt met pipeline/stemming_casus.py).
// Alleen de omschrijving van het onderwerp is per casus met de hand geschreven. Elke casus staat op zichzelf
// (later explainervideo's), dus geen verwijzingen naar andere casussen in de stappen.
import ritueel from "../content/uitgelicht/2008Z01504.json";
import weddenschappen from "../content/uitgelicht/2016Z13537.json";
import studievoorschot from "../content/uitgelicht/2018Z19777.json";
import defensie from "../content/uitgelicht/2025Z05204.json";
import mercosur from "../content/uitgelicht/2025Z21858.json";
import gehandicaptenzorg from "../content/uitgelicht/2026Z04746.json";
import { KORT, type Kader, type Kleur, type Stap, type StemStip, type Stemming, STEMSOORTEN, type Tekstlabel, dagMaandJaar, rond, stemZaal, tinten, zaalLabels } from "./verhaal";

// Vorm van content/uitgelicht/<zaak>.json
export type Besluit = {
  datum: string; besluitSoort: string | null; besluitTekst: string | null;
  stemmen: Stemming; vergissingen: Partial<Stemming>; telling: Record<string, number>;
  bron: { voor: number; tegen: number } | null; verschillen: string[];
};
export type CasusData = { zaak: string; soort: string | null; onderwerp: string | null; indieners: string[]; besluiten: Besluit[] };
export type Casus = {
  slug: string;
  titel: string; // kort, voor de lijst
  vraag: string; // kop op de eigen pagina
  omschrijving: string; // wat stond er op het spel: neutraal, zonder oordeel
  data: CasusData;
};

export const CASUSSEN: Casus[] = [
  {
    slug: "ritueel-slachten", titel: "Verdoving bij ritueel slachten", vraag: "Moeten dieren verdoofd zijn bij ritueel slachten?", data: ritueel as unknown as CasusData,
    omschrijving: "De Kamer stemt over een initiatiefwet: dieren moeten verdoofd zijn voordat ze ritueel geslacht worden. Nu mag slachten zonder verdoving nog, als het om religieuze redenen gebeurt.",
  },
  {
    slug: "live-weddenschappen", titel: "Reclame voor live-weddenschappen", vraag: "Mag er reclame komen voor wedden tijdens de wedstrijd?", data: weddenschappen as unknown as CasusData,
    omschrijving: "De Kamer behandelt de wet die online gokken regelt. Een motie vraagt om een verbod op reclame voor live-weddenschappen: wedden op wat er tijdens een wedstrijd gebeurt.",
  },
  {
    slug: "studievoorschot", titel: "Stoppen met het woord studievoorschot", vraag: "Wat gebeurt er als de stemmen staken?", data: studievoorschot as unknown as CasusData,
    // Uit de tekst van de motie (Kamerstuk 35 000 VIII, nr. 56), nagelezen op 26 oktober 2026
    omschrijving: "Een motie bij de begroting van Onderwijs vraagt de regering het woord studievoorschot niet meer te gebruiken: volgens de indieners is voor studenten niet duidelijk dat het om een lening gaat. Ook vraagt ze om op de site van DUO te melden: geld lenen kost geld.",
  },
  {
    slug: "behandelvoorbehoud-defensie", titel: "Behandelvoorbehoud bij een Europees defensievoorstel", vraag: "Wil de Kamer meekijken in Brussel?", data: defensie as unknown as CasusData,
    omschrijving: "De Europese Commissie doet een voorstel over defensie: \"Veiligheidsmaatregelen voor Europa\". De Kamer stemt over een parlementair behandelvoorbehoud. Dan maakt ze afspraken met het kabinet over hoe ze tijdens de onderhandelingen in Brussel op de hoogte blijft.",
  },
  {
    slug: "gehandicaptenzorg", titel: "Niet bezuinigen op de gehandicaptenzorg", vraag: "Hoe krap kan een meerderheid zijn?", data: gehandicaptenzorg as unknown as CasusData,
    omschrijving: "Bij het debat over de kabinetsformatie stemt de Kamer over een motie: niet bezuinigen op de gehandicaptenzorg.",
  },
  {
    slug: "mercosur", titel: "Het handelsakkoord met Mercosur", vraag: "Wie stemt er samen voor een handelsakkoord?", data: mercosur as unknown as CasusData,
    omschrijving: "Een motie vraagt de regering in te stemmen met het handelsakkoord tussen de EU en de Mercosur-landen in Zuid-Amerika, en te werken aan een snelle invoering.",
  },
];

// Kabinetten en hun fracties, overgenomen uit db/migrations/003_core.sql en 011_coalitie.sql (nog na te kijken door Niels).
// demissionair: alleen gevuld waar een casus erin valt (Schoof viel op 3 juni 2025).
type KabinetFractie = { fractie: string; gedoog?: boolean; tot?: string };
type Kabinet = { naam: string; begin: string; einde: string | null; demissionair?: string; fracties: KabinetFractie[] };
export const KABINETTEN: Kabinet[] = [
  { naam: "Rutte I", begin: "2010-10-14", einde: "2012-11-05", fracties: [{ fractie: "VVD" }, { fractie: "CDA" }, { fractie: "PVV", gedoog: true, tot: "2012-04-21" }] },
  { naam: "Rutte II", begin: "2012-11-05", einde: "2017-10-26", fracties: [{ fractie: "VVD" }, { fractie: "PvdA" }] },
  { naam: "Rutte III", begin: "2017-10-26", einde: "2022-01-10", fracties: [{ fractie: "VVD" }, { fractie: "CDA" }, { fractie: "D66" }, { fractie: "ChristenUnie" }] },
  { naam: "Rutte IV", begin: "2022-01-10", einde: "2024-07-02", fracties: [{ fractie: "VVD" }, { fractie: "D66" }, { fractie: "CDA" }, { fractie: "ChristenUnie" }] },
  { naam: "Schoof", begin: "2024-07-02", einde: "2026-02-23", demissionair: "2025-06-03",
    fracties: [{ fractie: "PVV", tot: "2025-06-03" }, { fractie: "VVD" }, { fractie: "Nieuw Sociaal Contract", tot: "2025-08-22" }, { fractie: "BBB" }] },
  { naam: "Jetten", begin: "2026-02-23", einde: null, fracties: [{ fractie: "D66" }, { fractie: "VVD" }, { fractie: "CDA" }] },
];

export function kabinetOp(datum: string): { naam: string; demissionair: boolean; leden: string[]; gedoog: string[] } | null {
  const k = KABINETTEN.find((k) => k.begin <= datum && (k.einde === null || datum < k.einde));
  if (!k) return null;
  const actief = k.fracties.filter((f) => !f.tot || datum < f.tot);
  return {
    naam: k.naam, demissionair: !!k.demissionair && datum >= k.demissionair,
    leden: actief.filter((f) => !f.gedoog).map((f) => f.fractie), gedoog: actief.filter((f) => f.gedoog).map((f) => f.fractie),
  };
}

// Taalhulpen
export const naam = (f: string) => KORT[f] ?? f;
export const lijst = (l: string[]) => (l.length < 2 ? l.join("") : `${l.slice(0, -1).join(", ")} en ${l[l.length - 1]}`);
const WOORDEN = ["nul", "één", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien"];
export const telwoord = (n: number) => WOORDEN[n] ?? String(n);
const Hoofd = (t: string) => (t.startsWith("één") ? `Eén${t.slice(3)}` : t.charAt(0).toUpperCase() + t.slice(1));
const kamerleden = (n: number) => `${telwoord(n)} ${n === 1 ? "Kamerlid" : "Kamerleden"}`;
const doenNietMee = (n: number) => `${Hoofd(kamerleden(n))} ${n === 1 ? "doet" : "doen"} niet mee.`;
// Wat er werd gestemd, uit Zaak.Soort
export function watVan(soort: string | null): string {
  if (soort === "Motie") return "de motie";
  if (soort === "Initiatiefwetgeving" || soort === "Wetgeving") return "het wetsvoorstel";
  return "het voorstel";
}

// Per fractie: leden voor, tegen en niet deelgenomen, en de kant van de meerderheid
export type FractieStem = { fractie: string; voor: number; tegen: number; niet: number; kant: "Voor" | "Tegen" | "Niet deelgenomen" };
export function perFractie(st: Stemming): FractieStem[] {
  const volgorde = [...new Set(stemZaal(st).map((z) => z.fractie))]; // zaalvolgorde, van links naar rechts
  return volgorde.map((f) => {
    const voor = st.Voor?.[f] ?? 0, tegen = st.Tegen?.[f] ?? 0, niet = st["Niet deelgenomen"]?.[f] ?? 0;
    return { fractie: f, voor, tegen, niet, kant: voor === 0 && tegen === 0 ? "Niet deelgenomen" : voor >= tegen ? "Voor" : "Tegen" };
  });
}
export const verdeeld = (st: Stemming) => perFractie(st).filter((f) => f.voor > 0 && f.tegen > 0);

// Hoe vaak wisselt het tussen voor en tegen als je de zaal van links naar rechts doorloopt (per fractie, meerderheid)
export function wissels(st: Stemming): number {
  const kanten = perFractie(st).map((f) => f.kant).filter((k) => k !== "Niet deelgenomen");
  return kanten.slice(1).filter((k, i) => k !== kanten[i]).length;
}

export function totalen(b: Besluit) {
  const som = (s: string) => Object.values(b.stemmen[s] ?? {}).reduce((a, n) => a + n, 0);
  return { voor: som("Voor"), tegen: som("Tegen"), niet: som("Niet deelgenomen") };
}

// Vergissingen als lijst (stem, fractie, aantal)
export function vergissingen(b: Besluit): Array<{ stem: string; fractie: string; aantal: number }> {
  return Object.entries(b.vergissingen ?? {}).flatMap(([stem, per]) => Object.entries(per ?? {}).map(([fractie, aantal]) => ({ stem, fractie, aantal })));
}

// Uitslag in woorden, uit BesluitSoort
export function uitslagZin(b: Besluit, wat: string): string {
  const s = (b.besluitSoort ?? "").toLowerCase();
  if (s.includes("gestaakt")) return "De stemmen staken.";
  if (s.includes("niet aangenomen")) return `${Hoofd(wat)} is niet aangenomen.`;
  if (s.includes("verworpen")) return `${Hoofd(wat)} is verworpen.`;
  if (s.includes("aangenomen")) return `${Hoofd(wat)} is aangenomen.`;
  return "";
}

// Stippen in blokken per stem, zoals blokken() in lib/verhaal.ts, maar met een plek per blok die zich aanpast aan
// de inhoud: bij veel kleine fracties wordt een blok hoog. Breed: voor links, tegen rechts, niet deelgenomen onder
// het kortste blok. Smal: alles onder elkaar. Geeft ook de onderkant, voor de hoogte van de tekening op een telefoon.
export function indeling(zs: StemStip[], gegroepeerd: boolean, smal: boolean): { stippen: StemStip[]; labels: Tekstlabel[]; kaders: Kader[]; onder: number } {
  const stap = smal ? 31 : 23, kolommen = smal ? 27 : 18, gat = 0.45, marge = 5;
  const orde = new Map([...new Set(zs.map((z) => z.fractie))].map((f, i) => [f, i]));
  // Een blok op (0, 0): plekken, fractielabels en de hoogte
  const blok = (s: string) => {
    const leden = zs.filter((z) => z.stem === s).sort((p, q) => orde.get(p.fractie)! - orde.get(q.fractie)! || p.hoek - q.hoek);
    const plek: Array<{ z: StemStip; x: number; y: number }> = [], namen: Array<{ y: number; tekst: string }> = [];
    let rij = 0, kol = 0, vorige: string | null = null;
    for (const z of leden) {
      if (gegroepeerd && vorige && z.fractie !== vorige) { rij += kol ? 1 : 0; kol = 0; rij += gat; }
      if (gegroepeerd && z.fractie !== vorige) namen.push({ y: rij * stap + 5, tekst: naam(z.fractie) });
      plek.push({ z, x: 11 + kol * stap, y: 11 + rij * stap });
      vorige = z.fractie;
      if (++kol === kolommen) { kol = 0; rij++; }
    }
    return { s, n: leden.length, plek, namen, hoogte: (rij + (kol ? 1 : 0)) * stap };
  };
  const [voor, tegen, niet] = STEMSOORTEN.map(blok);
  const plaats: Record<string, { x: number; y: number }> = {};
  if (smal) {
    plaats.Voor = { x: 200, y: 20 };
    plaats.Tegen = { x: 200, y: 20 + voor.hoogte + 70 };
    plaats["Niet deelgenomen"] = { x: 200, y: plaats.Tegen.y + tegen.hoogte + 70 };
  } else {
    plaats.Voor = { x: 40, y: 0 };
    plaats.Tegen = { x: 560, y: 0 };
    const kort = voor.hoogte <= tegen.hoogte ? voor : tegen;
    plaats["Niet deelgenomen"] = { x: plaats[kort.s].x, y: kort.hoogte + 60 };
  }
  const stippen: StemStip[] = [], labels: Tekstlabel[] = [], kaders: Kader[] = [];
  let onder = 0;
  for (const b of [voor, tegen, niet]) {
    if (b.n === 0 && b.s === "Niet deelgenomen") continue;
    const p = plaats[b.s];
    labels.push({ x: p.x, y: p.y - 22, tekst: b.s, waarde: String(b.n) });
    for (const n of b.namen) labels.push({ x: p.x - 14, y: Math.round(p.y + n.y), tekst: n.tekst, anchor: "end" });
    for (const q of b.plek) stippen.push({ ...q.z, x: p.x + q.x, y: p.y + q.y });
    onder = Math.max(onder, p.y + b.hoogte);
    if (gegroepeerd) {
      const per = new Map<string, Array<{ x: number; y: number }>>();
      for (const q of b.plek) per.set(q.z.fractie, [...(per.get(q.z.fractie) ?? []), { x: p.x + q.x, y: p.y + q.y }]);
      for (const [fractie, ps] of per) {
        const xs = ps.map((q) => q.x), ys = ps.map((q) => q.y);
        const x = Math.min(...xs) - 10.5 - marge, y = Math.min(...ys) - 10.5 - marge;
        kaders.push({ fractie, x, y, b: Math.max(...xs) + 10.5 + marge - x, h: Math.max(...ys) + 10.5 + marge - y });
      }
    }
  }
  return { stippen, labels, kaders, onder };
}

// Welke stippen een vergissing zijn: per (stem, fractie) de eerste zoveel stippen
function vergissingSleutels(zs: StemStip[], b: Besluit): Set<string> {
  const uit = new Set<string>();
  for (const v of vergissingen(b)) zs.filter((z) => z.stem === v.stem && z.fractie === v.fractie).slice(0, v.aantal).forEach((z) => uit.add(z.key));
  return uit;
}

// De stappen van een casus. Volgorde: wat stond er op het spel, de uitslag, per fractie, (bij een herstemming: de
// herstemming en wat er veranderde), kabinet en oppositie, het bijzondere (verdeeld, krap, vergissing), terug in de zaal.
export function casusStappen(c: Casus, smal: boolean): Stap[] {
  const { besluiten } = c.data;
  const wat = watVan(c.data.soort);
  const zalen = besluiten.map((b) => stemZaal(b.stemmen));
  const tint = tinten(zalen.map((z) => Object.fromEntries(z.map((p) => [p.fractie, z.filter((q) => q.fractie === p.fractie).length]))));
  const t = (p: StemStip) => tint.get(p.fractie)!;
  const metKleur = (ps: StemStip[], kleur: (p: StemStip) => Kleur) => ps.map((p) => ({ key: p.key, x: rond(p.x), y: rond(p.y), kleur: kleur(p), tint: t(p) }));
  const kaders = (ks: Kader[]) => ks.map((k) => ({ ...k, tint: tint.get(k.fractie) }));
  const stappen: Stap[] = [];

  // 1. Wat stond er op het spel
  const eerste = besluiten[0], laatste = besluiten[besluiten.length - 1];
  const [ind, ...mede] = c.data.indieners.map(naam);
  const ingediend = ind ? (mede.length ? ` Ingediend door ${ind}, samen met ${lijst(mede)}.` : ` Ingediend door ${ind}.`) : "";
  stappen.push({ datum: dagMaandJaar(eerste.datum), tekst: `${c.omschrijving}${ingediend}`, stippen: metKleur(zalen[0], () => null), labels: zaalLabels(zalen[0], tint) });

  besluiten.forEach((b, i) => {
    const zs = zalen[i], los = indeling(zs, false, smal), groep = indeling(zs, true, smal);
    const { voor, tegen, niet } = totalen(b);
    const bronVerschil = b.bron && (b.bron.voor !== voor || b.bron.tegen !== tegen)
      ? ` Let op: in de bron staat ${b.bron.voor}-${b.bron.tegen}, geteld uit de stemmen is het ${voor}-${tegen}.` : "";
    if (i === 0) {
      // 2. De uitslag
      const staakt = (b.besluitSoort ?? "").toLowerCase().includes("gestaakt");
      const regel = staakt
        ? ` ${doenNietMee(niet)} Staken de stemmen en is niet iedereen er, dan stemt de Kamer in een volgende vergadering opnieuw. Staken ze dan weer, dan is ${wat} niet aangenomen.`
        : "";
      stappen.push({ datum: "de uitslag", tekst: `${voor} voor, ${tegen} tegen. ${uitslagZin(b, wat)}${regel}${bronVerschil}`, stippen: metKleur(los.stippen, () => null), labels: los.labels });
      // 3. Per fractie
      stappen.push({ datum: "per fractie", tekst: perFractieZin(b.stemmen), stippen: metKleur(groep.stippen, () => null), labels: groep.labels, kaders: kaders(groep.kaders) });
    } else {
      // Herstemming: de nieuwe uitslag en wat er veranderde
      const vorig = besluiten[i - 1], tv = totalen(vorig);
      const dagen = Math.round((Date.parse(b.datum) - Date.parse(vorig.datum)) / 864e5);
      const later = dagen === 7 ? "Een week later" : `${dagen} dagen later`;
      const gelijk = voor === tegen ? `Weer gelijk, dus ${wat} is niet aangenomen.` : uitslagZin(b, wat);
      stappen.push({ datum: dagMaandJaar(b.datum), tekst: `${later} stemt de Kamer opnieuw: ${voor} voor, ${tegen} tegen. ${gelijk}${bronVerschil}`,
        stippen: metKleur(los.stippen, () => null), labels: los.labels });
      const nu = perFractie(b.stemmen), toen = new Map(perFractie(vorig.stemmen).map((f) => [f.fractie, f]));
      const anders = nu.filter((f) => { const o = toen.get(f.fractie); return !o || o.voor !== f.voor || o.tegen !== f.tegen || o.niet !== f.niet; }).map((f) => f.fractie);
      const verschuiving = `Voor ging van ${tv.voor} naar ${voor}, tegen van ${tv.tegen} naar ${tegen}. Niet mee deden er eerst ${tv.niet}, nu ${niet}.`;
      stappen.push({ datum: "wat veranderde", tekst: `${verschuiving}${anders.length ? ` Anders dan de eerste keer: de telling bij ${lijst(anders.map(naam))}.` : ""}`,
        stippen: metKleur(groep.stippen, (p) => (anders.includes(p.fractie) ? "nadruk" : "zacht")), labels: groep.labels, kaders: kaders(groep.kaders) });
    }
  });

  // Vanaf hier: het laatste besluit
  const b = laatste, zs = zalen[zalen.length - 1];
  const los = indeling(zs, false, smal), groep = indeling(zs, true, smal);
  const { voor, tegen, niet } = totalen(b);
  const pf = perFractie(b.stemmen);

  // 4. Kabinet en oppositie
  const k = kabinetOp(b.datum);
  if (k) {
    const kant = new Set([...k.leden, ...k.gedoog]);
    const zetels = zs.filter((p) => kant.has(p.fractie)).length;
    const kabVoor = pf.filter((f) => kant.has(f.fractie) && f.kant === "Voor").map((f) => naam(f.fractie));
    const kabTegen = pf.filter((f) => kant.has(f.fractie) && f.kant === "Tegen").map((f) => naam(f.fractie));
    const opp = pf.filter((f) => !kant.has(f.fractie));
    const oppVoor = opp.filter((f) => f.kant === "Voor").length, oppTegen = opp.filter((f) => f.kant === "Tegen").length;
    const wie = `Kabinet-${k.naam}${k.demissionair ? " is demissionair en bestaat nog uit" : " steunt op"} ${lijst(k.leden.map(naam))}${k.gedoog.length ? `, met gedoogsteun van ${lijst(k.gedoog.map(naam))}` : ""}: samen ${zetels} zetels${zetels < 76 ? ", geen meerderheid" : ""}.`;
    const kabinet = !kabTegen.length ? ` Die stemmen allemaal voor.` : !kabVoor.length ? ` Die stemmen allemaal tegen.`
      : ` ${lijst(kabVoor)} ${kabVoor.length === 1 ? "stemt" : "stemmen"} voor, ${lijst(kabTegen)} tegen.`;
    const fr = (n: number) => `${telwoord(n)} ${n === 1 ? "fractie" : "fracties"}`;
    const oppositie = ` Uit de oppositie stemmen ${fr(oppVoor)} voor en ${fr(oppTegen)} tegen.`;
    stappen.push({ datum: "kabinet en oppositie", tekst: `${wie}${kabinet}${oppositie}`,
      stippen: metKleur(groep.stippen, (p) => (kant.has(p.fractie) ? "kabinet" : null)), labels: groep.labels, kaders: kaders(groep.kaders) });
  }

  // 5. Het bijzondere: een verdeelde fractie
  const split = verdeeld(b.stemmen);
  if (split.length) {
    const delen = split.map((f) => `${naam(f.fractie)}: ${f.voor} voor, ${f.tegen} tegen`);
    stappen.push({ datum: "verdeeld", tekst: `Bij een hoofdelijke stemming zie je per Kamerlid hoe het stemde. ${Hoofd(split.length === 1 ? "één fractie is" : `${telwoord(split.length)} fracties zijn`)} verdeeld. ${delen.join(". ")}.`,
      stippen: metKleur(groep.stippen, (p) => { const f = split.find((s) => s.fractie === p.fractie); if (!f) return "zacht"; const minder = f.voor < f.tegen ? "Voor" : "Tegen"; return p.stem === minder ? "nadruk" : null; }),
      labels: groep.labels, kaders: kaders(groep.kaders) });
  }
  // Krap: drie stemmen verschil of minder (een gelijke stand staat al bij de uitslag)
  const verschil = Math.abs(voor - tegen);
  if (verschil > 0 && verschil <= 3) {
    const meerderheid = Math.max(voor, tegen) >= 76 ? ` Met ${Math.max(voor, tegen)} stemmen is het ook een meerderheid van alle 150 zetels.` : "";
    stappen.push({ datum: verschil === 1 ? "één stem" : `${telwoord(verschil)} stemmen`,
      tekst: `${voor} voor en ${tegen} tegen: ${telwoord(verschil)} ${verschil === 1 ? "stem" : "stemmen"} verschil. ${niet ? doenNietMee(niet) : "Iedereen doet mee."}${meerderheid}`,
      stippen: metKleur(los.stippen, (p) => (p.stem === "Niet deelgenomen" ? "nadruk" : null)), labels: los.labels });
  }
  // Een stem die achteraf een vergissing heette
  const fout = vergissingen(b);
  if (fout.length) {
    const sleutels = vergissingSleutels(groep.stippen, b);
    const n = fout.reduce((a, v) => a + v.aantal, 0);
    const wie = fout.map((v) => `${telwoord(v.aantal)} ${naam(v.fractie)}-${v.aantal === 1 ? "Kamerlid stemt" : "Kamerleden stemmen"} ${v.stem === "Voor" ? "voor" : v.stem === "Tegen" ? "tegen" : "niet mee"}`);
    stappen.push({ datum: "een vergissing",
      tekst: `${Hoofd(lijst(wie))}. Achteraf ${n === 1 ? "laat dit Kamerlid" : "laten deze Kamerleden"} vastleggen dat het een vergissing was. De stem telt toch mee: een uitslag ligt vast.`,
      stippen: metKleur(groep.stippen, (p) => (sleutels.has(p.key) ? "nadruk" : fout.some((v) => v.fractie === p.fractie) ? null : "zacht")), labels: groep.labels, kaders: kaders(groep.kaders) });
  }

  // 6. Terug in de zaal: voor in volle kleur, tegen gedimd
  const w = wissels(b.stemmen);
  stappen.push({ datum: "terug in de zaal",
    tekst: `In deze zaal staan fracties die de laatste jaren vaak hetzelfde stemden naast elkaar. Voor in volle kleur, tegen gedimd. Loop je van links naar rechts, dan wisselt het ${w === 1 ? "één keer" : `${telwoord(w)} keer`} tussen voor en tegen.`,
    stippen: metKleur(zs, (p) => (p.stem === "Voor" ? null : p.stem === "Tegen" ? "uit" : "zacht")), labels: zaalLabels(zs, tint) });
  return stappen;
}

// "Voor stemmen A en B. Tegen C. Verdeeld: D." in zaalvolgorde
export function perFractieZin(st: Stemming): string {
  const pf = perFractie(st);
  const heel = (k: "Voor" | "Tegen") => pf.filter((f) => f.kant === k && !(f.voor > 0 && f.tegen > 0)).map((f) => naam(f.fractie));
  const v = heel("Voor"), t = heel("Tegen"), split = verdeeld(st).map((f) => naam(f.fractie));
  const weg = pf.filter((f) => f.kant === "Niet deelgenomen").map((f) => naam(f.fractie));
  return [
    v.length ? `Voor ${v.length === 1 ? "stemt" : "stemmen"} ${lijst(v)}.` : "",
    t.length ? `Tegen ${t.length === 1 ? "stemt" : "stemmen"} ${lijst(t)}.` : "",
    split.length ? `Verdeeld: ${lijst(split)}.` : "",
    weg.length ? `${lijst(weg)} ${weg.length === 1 ? "doet" : "doen"} niet mee.` : "",
  ].filter(Boolean).join(" ");
}

// Hoogte van de tekening op een telefoon: genoeg voor het hoogste blok en minstens die van de zaal
export function hoogteSmal(c: Casus): number {
  const onder = Math.max(...c.data.besluiten.map((b) => indeling(stemZaal(b.stemmen), true, true).onder));
  return Math.max(1000, Math.ceil(onder + 80));
}

// Korte uitslag voor de lijst: "aangenomen, 116-30"
export function uitslagKort(c: Casus): string {
  const b = c.data.besluiten[c.data.besluiten.length - 1], { voor, tegen } = totalen(b);
  const zin = uitslagZin(b, "").replace(/^ ?is /i, "").replace(/\.$/, "").trim();
  return `${c.data.besluiten.length > 1 ? "na herstemming " : ""}${zin.toLowerCase()}, ${voor}-${tegen}`;
}

export const zoekLink = (zaak: string) => `https://www.tweedekamer.nl/zoeken?qry=${encodeURIComponent(zaak)}`;

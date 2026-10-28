// Het verhaal op de voorpagina (docs/ontwerp/scroll-graphics.md): de plekken van de stippen per stap,
// uit de data. Alleen op de server; de browser krijgt de uitkomst (components/verhaal/ScrollVerhaal.tsx).
import { leesApi } from "./api";
import { cohesieIn, fractiesIn, procent, slug } from "./cohesie";
import { schaalkleur } from "./kleur";
import {
  KLEIN, KORT, type Kleur, type Stap, type ZaalStip,
  dagMaandJaar, maandJaar, rond, sleutels, tinten, zaal, zaalLabels,
} from "./verhaal";
import { sleutel } from "./zaal";

type FP = { periodesoort: string; periode: string; afkorting: string; zetels: number; zetels_begin: number; bij_begin: boolean; in_zaal: boolean; eerste_stemming: string };
type Co = { kabinet: string; afkorting: string; rol: string; tot: string | null };
type Ov = { periodesoort: string; periode: string; van: string; naar: string; leden: number };
type Per = { naam: string; begin: string };

const KABINETTEN = ["Rutte IV", "Schoof", "Jetten"];
const KAMER = "2025-";
const naam = (f: string) => KORT[f] ?? f;
const som = (z: Record<string, number>, fr: string[]) => fr.reduce((t, f) => t + (z[f] ?? 0), 0);
const lijstTekst = (l: string[]) => (l.length < 2 ? l.join("") : `${l.slice(0, -1).join(", ")} en ${l[l.length - 1]}`);

export async function laadVerhaal() {
  const lijst = KABINETTEN.map((k) => `"${k}"`).join(",");
  const [fp, co, ov, kab, kp] = await Promise.all([
    leesApi<FP[]>(`fractie_periode?select=periodesoort,periode,afkorting,zetels,zetels_begin,bij_begin,in_zaal,eerste_stemming&or=(and(periodesoort.eq.kabinet,periode.in.(${encodeURIComponent(lijst)})),and(periodesoort.eq.kamerperiode,periode.eq.${encodeURIComponent(KAMER)}))`),
    leesApi<Co[]>(`coalitie?select=kabinet,afkorting,rol,tot&kabinet=in.(${encodeURIComponent(lijst)})`),
    leesApi<Ov[]>(`overstap?select=periodesoort,periode,van,naar,leden&or=(and(periodesoort.eq.kabinet,periode.eq.Jetten),and(periodesoort.eq.kamerperiode,periode.eq.${encodeURIComponent(KAMER)}))`),
    leesApi<Per[]>("kabinet?select=naam,begin"),
    leesApi<Per[]>("kamerperiode?select=naam,begin"),
  ]);
  // Hoofdstuk 2: cohesie in het huidige kabinet (zelfde cijfers als de verkenner)
  const [cohesie, fracties] = await Promise.all([cohesieIn("kabinet", "Jetten", "alle"), fractiesIn("kabinet", "Jetten")]);
  return fp && co && ov && kab && kp && cohesie && fracties ? { fp, co, ov, kab, kp, cohesie, fracties } : null;
}
export type VerhaalData = NonNullable<Awaited<ReturnType<typeof laadVerhaal>>>;

// Het verhaal in een zaal: hoofdstuk 1 (de zaal door de tijd, van Rutte IV tot nu) en hoofdstuk 2
// (hoe stemt elke partij nu: de zaal kleurt naar cohesie met de grootste kabinets- en oppositiefractie)
export function zaalVerhaal(d: VerhaalData): Stap[] {
  const zetels = (soort: string, periode: string, begin: boolean) =>
    Object.fromEntries(d.fp.filter((r) => r.periodesoort === soort && r.periode === periode && (begin ? r.bij_begin : r.in_zaal))
      .map((r) => [r.afkorting, begin ? r.zetels_begin : r.zetels]));
  const beginVan = (k: string) => d.kab.find((x) => x.naam === k)?.begin ?? "";
  const kabinet = (k: string, op?: string) => d.co.filter((c) => c.kabinet === k && c.rol === "kabinet" && (!op || !c.tot || c.tot > op)).map((c) => c.afkorting);

  type Ruw = {
    datum: string; tekst: string; zetels: Record<string, number>; kleur: (f: string) => Kleur; groot?: string; klein?: string;
    hoofdstuk?: string; link?: { href: string; tekst: string };
    tint?: (f: string) => string | undefined; // anders de eigen tint van de fractie
    waarde?: (f: string) => string | undefined; // anders het aantal zetels
    genoemd?: string[]; // fracties die de tekst noemt: altijd een label en een rand, ook als ze klein zijn
  };
  const ruw: Ruw[] = [];
  // Elke stap eindigt bij een plek op de site waar je verder kunt kijken: het verhaal is op de telefoon acht schermen
  // lang, en wie daar afhaakte had geen uitweg (bezoekerscijfers en verzoek Niels, 28 oktober 2026)
  const zoek = (pad: string, w: Record<string, string>) => `${pad}?${new URLSearchParams(w).toString()}`;
  // Kabinetsfracties met een gouden rand, de oppositie gedimd
  const koper = (fr: string[]) => (f: string): Kleur => (fr.includes(f) ? "kabinet" : "uit");
  const kabinetStap = (k: string, z: Record<string, number>, intro: string) => {
    const fr = kabinet(k);
    const n = som(z, fr);
    ruw.push({ datum: maandJaar(beginVan(k)), tekst: `${intro} ${lijstTekst(fr.map(naam))}: samen ${n} van de 150 zetels${n < 76 ? ", een minderheid" : ""}.`,
      zetels: z, kleur: koper(fr), groot: String(n), klein: "zetels voor het kabinet",
      link: { href: zoek("/verkenner", { soort: "kabinet", periode: k }), tekst: `Wie stemde met wie onder kabinet-${k}` } });
  };

  kabinetStap("Rutte IV", zetels("kabinet", "Rutte IV", true), "Kabinet-Rutte IV begint met");
  ruw[0].hoofdstuk = "1 · Hoe kwam deze Kamer tot stand?";
  const schoof = zetels("kabinet", "Schoof", true);
  kabinetStap("Schoof", schoof, "Na de verkiezingen van 2023 begint kabinet-Schoof met");
  for (const c of d.co.filter((x) => x.kabinet === "Schoof" && x.tot).sort((a, b) => a.tot!.localeCompare(b.tot!))) {
    const fr = kabinet("Schoof", c.tot!);
    const n = som(schoof, fr);
    ruw.push({ datum: dagMaandJaar(c.tot!), tekst: `${naam(c.afkorting)} stapt uit het kabinet. Er blijven ${n} zetels over.`, zetels: schoof, kleur: koper(fr), groot: String(n), klein: "zetels voor het kabinet",
      link: { href: zoek("/coalitie", { soort: "kabinet", periode: "Schoof", groep: fr.join(",") }), tekst: "Bij wie haalde de rest een meerderheid" } });
  }
  const nieuweKamer = zetels("kamerperiode", KAMER, true);
  const grootste = Math.max(...Object.values(nieuweKamer));
  const kop = Object.keys(nieuweKamer).filter((f) => nieuweKamer[f] === grootste);
  ruw.push({ datum: maandJaar(d.kp.find((p) => p.naam === KAMER)?.begin ?? ""), tekst: `Verkiezingen, en een nieuwe Kamer. De grootste: ${lijstTekst(kop.map(naam))}, met ${grootste} zetels.`,
    zetels: nieuweKamer, kleur: (f) => (kop.includes(f) ? "nadruk" : null),
    link: { href: zoek("/fracties", { soort: "kamerperiode", periode: KAMER }), tekst: "Alle fracties in deze Kamer" } });
  const jettenBegin = zetels("kabinet", "Jetten", true);
  for (const o of d.ov.filter((x) => x.periodesoort === "kamerperiode" && x.leden >= 2 && jettenBegin[x.naar] && !nieuweKamer[x.naar])) {
    const eerste = d.fp.find((r) => r.periodesoort === "kamerperiode" && r.afkorting === o.naar)?.eerste_stemming ?? "";
    ruw.push({ datum: maandJaar(eerste), tekst: `${o.leden} Kamerleden verlaten de ${naam(o.van)} en gaan verder als ${naam(o.naar)}.`,
      zetels: jettenBegin, kleur: (f) => (f === o.naar ? "nadruk" : f === o.van ? null : "zacht"),
      link: { href: `/fracties/${slug(o.naar)}`, tekst: `Meer over ${naam(o.naar)}` } });
  }
  kabinetStap("Jetten", jettenBegin, "Kabinet-Jetten begint met");
  ruw[ruw.length - 1].link = { href: zoek("/coalitie", { soort: "kabinet", periode: "Jetten", groep: kabinet("Jetten").join(",") }), tekst: "Bij wie haalt dit kabinet een meerderheid" };
  const nu = zetels("kabinet", "Jetten", false);
  const fr = kabinet("Jetten");
  const n = som(nu, fr);
  const verder = d.ov.filter((o) => o.periodesoort === "kabinet" && !jettenBegin[o.naar] && nu[o.naar] && o.leden >= 0.8 * (jettenBegin[o.van] ?? 0))
    .map((o) => `${naam(o.van)} gaat verder als ${naam(o.naar)}.`);
  ruw.push({ datum: "nu", tekst: `${verder.join(" ")} ${n < 76 ? `Per stemming moet het kabinet minstens ${76 - n} zetels bij de oppositie vinden.` : ""}`.trim(),
    zetels: nu, kleur: koper(fr), groot: String(n), klein: n < 76 ? "van de 76 voor een meerderheid" : "zetels voor het kabinet",
    link: { href: "/fracties", tekst: "Alle fracties per kabinet" } });

  // Hoofdstuk 2: cohesie met de grootste kabinetsfractie en de grootste oppositiefractie
  const idVan = new Map(d.fracties.filter((f) => f.inZaal).map((f) => [f.afkorting, f.id]));
  const cohesie = (a: string, b: string) => {
    const ia = idVan.get(a), ib = idVan.get(b);
    const p = ia && ib ? d.cohesie.get(sleutel(ia, ib)) : undefined;
    return p && !p.teWeinig && p.cohesie != null ? p.cohesie : null;
  };
  const grootsteVan = (lijst: string[]) => [...lijst].sort((a, b) => (nu[b] ?? 0) - (nu[a] ?? 0))[0];
  const kabinetsfractie = grootsteVan(fr);
  const oppositie = grootsteVan(Object.keys(nu).filter((f) => !fr.includes(f)));
  const cohesieStap = (wie: string, intro: string, hoofdstuk?: string, link?: Ruw["link"]) => {
    const anderen = Object.keys(nu).filter((f) => f !== wie && cohesie(wie, f) != null)
      .sort((a, b) => cohesie(wie, b)! - cohesie(wie, a)!);
    const hoog = anderen[0], laag = anderen[anderen.length - 1];
    ruw.push({ datum: naam(wie), hoofdstuk, link,
      tekst: `${intro} ${naam(wie)} stemt het vaakst hetzelfde als ${naam(hoog)} (${procent(cohesie(wie, hoog))}) en het minst vaak als ${naam(laag)} (${procent(cohesie(wie, laag))}).`,
      zetels: nu, kleur: (f) => (f === wie || f === hoog || f === laag ? "nadruk" : null), groot: naam(wie), klein: "lichter is vaker hetzelfde",
      genoemd: [hoog, laag],
      tint: (f) => (f === wie ? "var(--koper)" : cohesie(wie, f) != null ? schaalkleur(cohesie(wie, f)!) : KLEIN),
      waarde: (f) => (f === wie ? undefined : cohesie(wie, f) != null ? procent(cohesie(wie, f)) : undefined) });
  };
  cohesieStap(kabinetsfractie, "Neem de grootste kabinetspartij:", "2 · Wie stemt er nu met wie?",
    { href: zoek("/verkenner", { fractie: kabinetsfractie }), tekst: `${naam(kabinetsfractie)} in de verkenner` });
  cohesieStap(oppositie, "En de grootste oppositiepartij:", undefined, { href: "/verkenner", tekst: "Kies zelf een fractie in de verkenner" });

  const zalen: ZaalStip[][] = ruw.map((r) => zaal(r.zetels));
  const keys = sleutels(zalen);
  const tint = tinten(ruw.map((r) => r.zetels));
  return ruw.map((r, i) => ({
    datum: r.datum, tekst: r.tekst, groot: r.groot, klein: r.klein, hoofdstuk: r.hoofdstuk, link: r.link,
    labels: zaalLabels(zalen[i], r.tint ? undefined : tint, r.genoemd).map((l) => (r.waarde ? { ...l, waarde: r.waarde(l.fractie ?? "") } : l)),
    stippen: zalen[i].map((z, j) => ({ key: keys[i][j], x: rond(z.x), y: rond(z.y), kleur: r.kleur(z.fractie),
      tint: r.tint?.(z.fractie) ?? tint.get(z.fractie)! })),
  }));
}


// Het huidige kabinet en zijn zetels nu (voor de oproep naar de coalitiebouwer)
export function kabinetNu(d: VerhaalData): { naam: string; zetels: number } {
  const naam = KABINETTEN[KABINETTEN.length - 1];
  const fr = d.co.filter((c) => c.kabinet === naam && c.rol === "kabinet" && !c.tot).map((c) => c.afkorting);
  const zetels = d.fp.filter((r) => r.periodesoort === "kabinet" && r.periode === naam && r.in_zaal && fr.includes(r.afkorting))
    .reduce((t, r) => t + r.zetels, 0);
  return { naam, zetels };
}

// Hoofdstuk 3: de twee grootste fracties van het huidige kabinet, met hun cohesie over alle stemmingen
export function kabinetspartners(d: VerhaalData): { a: { id: string; afkorting: string }; b: { id: string; afkorting: string }; totaal: number | null } | null {
  const naam = KABINETTEN[KABINETTEN.length - 1];
  const fr = new Set(d.co.filter((c) => c.kabinet === naam && c.rol === "kabinet" && !c.tot).map((c) => c.afkorting));
  const [a, b] = d.fracties.filter((f) => f.inZaal && fr.has(f.afkorting)).sort((x, y) => y.zetels - x.zetels);
  if (!a || !b) return null;
  return { a: { id: a.id, afkorting: a.afkorting }, b: { id: b.id, afkorting: b.afkorting }, totaal: d.cohesie.get(sleutel(a.id, b.id))?.cohesie ?? null };
}

// Opening van de voorpagina (besluit Niels B14, 26 oktober 2026): waar vinden ze elkaar? Per kabinet de moties
// waarover gestemd is, hoeveel er aangenomen zijn, hoeveel met brede steun (stemmen voor uit kabinet én oppositie),
// en welk deel van de oppositiemoties het haalde. Rekent elke dag opnieuw, want het huidige kabinet loopt nog.
export type Samenwerking = { moties: number; aangenomen: number; breed: number; oppositieNu: number; oppositieEerst: number; eerste: string };
type PeriodeRij = { periode: string; soort: string; indiener_rol: string; ingediend: number; aangenomen: number; brede_steun: number };

export function samenwerking(rijen: PeriodeRij[], kabinet: string, eerste: string): Samenwerking | null {
  const moties = (k: string) => rijen.filter((r) => r.periode === k && r.soort === "Motie");
  const som = (rs: PeriodeRij[], v: "ingediend" | "aangenomen" | "brede_steun") => rs.reduce((t, r) => t + r[v], 0);
  const aandeel = (k: string) => {
    const o = moties(k).filter((r) => r.indiener_rol === "oppositie");
    const n = som(o, "ingediend");
    return n ? Math.round((100 * som(o, "aangenomen")) / n) : null;
  };
  const nu = moties(kabinet);
  const oppositieNu = aandeel(kabinet), oppositieEerst = aandeel(eerste);
  if (!nu.length || oppositieNu == null || oppositieEerst == null) return null;
  return { moties: som(nu, "ingediend"), aangenomen: som(nu, "aangenomen"), breed: som(nu, "brede_steun"), oppositieNu, oppositieEerst, eerste };
}

// Brede steun per kabinet (feedback Niels K3, 26 oktober 2026): welk deel van de ingediende moties en amendementen
// werd aangenomen met stemmen voor van ten minste één kabinets- en één oppositiefractie (die geen indiener is).
// Per kabinet, niet per jaar: zo valt een wissel van kabinet niet midden in een staaf.
export const KABINETTEN_SINDS_2010 = ["Rutte I", "Rutte II", "Rutte III", "Rutte IV", "Schoof", "Jetten"];
export type BredeSteun = { kabinet: string; moties: number | null; amendementen: number | null };

export function bredeSteunPerKabinet(rijen: PeriodeRij[]): BredeSteun[] {
  const aandeel = (k: string, soort: string) => {
    const rs = rijen.filter((r) => r.periode === k && r.soort === soort);
    const ingediend = rs.reduce((t, r) => t + r.ingediend, 0);
    return ingediend ? (100 * rs.reduce((t, r) => t + r.brede_steun, 0)) / ingediend : null;
  };
  return KABINETTEN_SINDS_2010.map((k) => ({ kabinet: k, moties: aandeel(k, "Motie"), amendementen: aandeel(k, "Amendement") }))
    .filter((b) => b.moties != null || b.amendementen != null);
}

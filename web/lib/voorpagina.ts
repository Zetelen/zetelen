// Het verhaal op de voorpagina (docs/ontwerp/scroll-graphics.md): de plekken van de stippen per stap,
// uit de data. Alleen op de server; de browser krijgt de uitkomst (components/verhaal/ScrollVerhaal.tsx).
import { leesApi } from "./api";
import { cohesieIn, fractiesIn, procent } from "./cohesie";
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
  };
  const ruw: Ruw[] = [];
  // Kabinetsfracties met een gouden rand, de oppositie gedimd
  const koper = (fr: string[]) => (f: string): Kleur => (fr.includes(f) ? "kabinet" : "uit");
  const kabinetStap = (k: string, z: Record<string, number>, intro: string) => {
    const fr = kabinet(k);
    const n = som(z, fr);
    ruw.push({ datum: maandJaar(beginVan(k)), tekst: `${intro} ${lijstTekst(fr.map(naam))}: samen ${n} van de 150 zetels${n < 76 ? ", een minderheid" : ""}.`,
      zetels: z, kleur: koper(fr), groot: String(n), klein: "zetels voor het kabinet" });
  };

  kabinetStap("Rutte IV", zetels("kabinet", "Rutte IV", true), "Kabinet-Rutte IV begint met");
  ruw[0].hoofdstuk = "1 · Hoe zijn we hier gekomen?";
  const schoof = zetels("kabinet", "Schoof", true);
  kabinetStap("Schoof", schoof, "Na de verkiezingen van 2023 begint kabinet-Schoof met");
  for (const c of d.co.filter((x) => x.kabinet === "Schoof" && x.tot).sort((a, b) => a.tot!.localeCompare(b.tot!))) {
    const fr = kabinet("Schoof", c.tot!);
    const n = som(schoof, fr);
    ruw.push({ datum: dagMaandJaar(c.tot!), tekst: `${naam(c.afkorting)} stapt uit het kabinet. Er blijven ${n} zetels over.`, zetels: schoof, kleur: koper(fr), groot: String(n), klein: "zetels voor het kabinet" });
  }
  const nieuweKamer = zetels("kamerperiode", KAMER, true);
  const grootste = Math.max(...Object.values(nieuweKamer));
  const kop = Object.keys(nieuweKamer).filter((f) => nieuweKamer[f] === grootste);
  ruw.push({ datum: maandJaar(d.kp.find((p) => p.naam === KAMER)?.begin ?? ""), tekst: `Een nieuwe Kamer na de verkiezingen. Grootste: ${lijstTekst(kop.map(naam))}, met ${grootste} zetels.`,
    zetels: nieuweKamer, kleur: (f) => (kop.includes(f) ? "nadruk" : null) });
  const jettenBegin = zetels("kabinet", "Jetten", true);
  for (const o of d.ov.filter((x) => x.periodesoort === "kamerperiode" && x.leden >= 2 && jettenBegin[x.naar] && !nieuweKamer[x.naar])) {
    const eerste = d.fp.find((r) => r.periodesoort === "kamerperiode" && r.afkorting === o.naar)?.eerste_stemming ?? "";
    ruw.push({ datum: maandJaar(eerste), tekst: `${o.leden} Kamerleden verlaten de ${naam(o.van)} en gaan verder als ${naam(o.naar)}.`,
      zetels: jettenBegin, kleur: (f) => (f === o.naar ? "nadruk" : f === o.van ? null : "zacht") });
  }
  kabinetStap("Jetten", jettenBegin, "Kabinet-Jetten begint met");
  const nu = zetels("kabinet", "Jetten", false);
  const fr = kabinet("Jetten");
  const n = som(nu, fr);
  const verder = d.ov.filter((o) => o.periodesoort === "kabinet" && !jettenBegin[o.naar] && nu[o.naar] && o.leden >= 0.8 * (jettenBegin[o.van] ?? 0))
    .map((o) => `${naam(o.van)} gaat verder als ${naam(o.naar)}.`);
  ruw.push({ datum: "nu", tekst: `${verder.join(" ")} ${n < 76 ? `Het kabinet zoekt per stemming ${76 - n} zetels of meer bij de oppositie.` : ""}`.trim(),
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
      zetels: nu, kleur: (f) => (f === wie ? "nadruk" : null), groot: naam(wie), klein: "lichter is vaker hetzelfde",
      tint: (f) => (f === wie ? "var(--koper)" : cohesie(wie, f) != null ? schaalkleur(cohesie(wie, f)!) : KLEIN),
      waarde: (f) => (f === wie ? undefined : cohesie(wie, f) != null ? procent(cohesie(wie, f)) : undefined) });
  };
  cohesieStap(kabinetsfractie, "Hoe stemt elke partij nu? Neem de grootste kabinetspartij:", "2 · Hoe stemt elke partij nu?");
  cohesieStap(oppositie, "En de grootste oppositiepartij:", undefined, { href: "/verkenner", tekst: "Kies zelf een fractie in de verkenner" });

  const zalen: ZaalStip[][] = ruw.map((r) => zaal(r.zetels));
  const keys = sleutels(zalen);
  const tint = tinten(ruw.map((r) => r.zetels));
  return ruw.map((r, i) => ({
    datum: r.datum, tekst: r.tekst, groot: r.groot, klein: r.klein, hoofdstuk: r.hoofdstuk, link: r.link,
    labels: zaalLabels(zalen[i], r.tint ? undefined : tint).map((l) => (r.waarde ? { ...l, waarde: r.waarde(l.fractie ?? "") } : l)),
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

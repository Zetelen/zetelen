// Cohesie door de jaren (verzoek Niels, 27 oktober 2026): per half jaar hoe vaak twee fracties hetzelfde stemden, uit
// api.cohesie_halfjaar (migratie 026). De database bewaart tellingen; hier worden ze opgeteld voor de periode die de
// bezoeker met de schuif kiest. Zelfde drempel als overal: onder 25 stemmingen samen geen percentage.
import { leesApi } from "./api";
import type { Variant } from "./cohesie";

export const DREMPEL = 25;
export const EERSTE_JAAR = 2010;

export type HalfjaarRij = { halfjaar: string; gezamenlijk: number; gelijk: number };
export type Punt = { halfjaar: string; gezamenlijk: number; gelijk: number; cohesie: number | null };

// Rijen van alle paren tussen twee groepen fracties, per half jaar opgeteld. Fracties uit één lijn (een naamswijziging)
// stemmen nooit op hetzelfde besluit, dus optellen telt geen besluit dubbel.
export async function cohesiePerHalfjaar(fracties: string[], andere: string[], variant: Variant): Promise<HalfjaarRij[] | null> {
  const rijen = await leesApi<HalfjaarRij[]>(
    `cohesie_halfjaar?select=halfjaar,gezamenlijk,gelijk&variant=eq.${variant}&fractie=in.(${fracties.join(",")})&andere_fractie=in.(${andere.join(",")})&order=halfjaar&limit=1000`,
  );
  if (!rijen) return null;
  const per = new Map<string, HalfjaarRij>();
  for (const r of rijen) {
    const h = r.halfjaar.slice(0, 10);
    const x = per.get(h) ?? { halfjaar: h, gezamenlijk: 0, gelijk: 0 };
    per.set(h, { halfjaar: h, gezamenlijk: x.gezamenlijk + r.gezamenlijk, gelijk: x.gelijk + r.gelijk });
  }
  return [...per.values()];
}

// Opvolgers (content/fractie-opvolgers.json): een naamswijziging maakt van twee fracties één lijn, bij een fusie worden
// de voorgangers aparte lijnen
export type Opvolger = { soort: "fusie" | "naamswijziging"; van: Array<{ id: string; afkorting: string }>; naar: { id: string; afkorting: string }; tekst: string };
export type Lijn = { ids: string[]; naam: string; eerder: string[]; voorgangers: Array<{ id: string; afkorting: string }>; teksten: string[] };

export function lijnVan(id: string, afkorting: string, opvolgers: Opvolger[]): Lijn {
  const namen = new Map<string, string>([[id, afkorting]]);
  const ids = new Set([id]);
  const hernoemd = opvolgers.filter((o) => o.soort === "naamswijziging");
  // Naamswijzigingen in beide richtingen volgen, tot er niets meer bijkomt
  for (let nieuw = true; nieuw;) {
    nieuw = false;
    for (const o of hernoemd) {
      const leden = [o.naar, ...o.van];
      if (leden.some((f) => ids.has(f.id)) && leden.some((f) => !ids.has(f.id))) {
        for (const f of leden) { ids.add(f.id); namen.set(f.id, f.afkorting); }
        nieuw = true;
      }
    }
  }
  // De naam is die van de nieuwste fractie in de lijn: de fractie waar geen naamswijziging meer op volgt
  const nieuwste = [...ids].find((i) => !hernoemd.some((o) => o.van.some((f) => f.id === i))) ?? id;
  const fusies = opvolgers.filter((o) => o.soort === "fusie" && ids.has(o.naar.id));
  const relevant = opvolgers.filter((o) => ids.has(o.naar.id) || o.van.some((f) => ids.has(f.id)));
  return {
    ids: [...ids], naam: namen.get(nieuwste)!, eerder: [...ids].filter((i) => i !== nieuwste).map((i) => namen.get(i)!),
    voorgangers: fusies.flatMap((o) => o.van), teksten: relevant.map((o) => o.tekst),
  };
}

// Alle halve jaren van januari 2010 tot en met het halve jaar van vandaag, als "2024-01-01" en "2024-07-01"
export function halveJaren(vandaag: Date): string[] {
  const uit: string[] = [];
  const laatste = vandaag.getFullYear() * 2 + (vandaag.getMonth() < 6 ? 0 : 1);
  for (let n = EERSTE_JAAR * 2; n <= laatste; n++) uit.push(`${Math.floor(n / 2)}-${n % 2 ? "07" : "01"}-01`);
  return uit;
}

// Een punt per half jaar, ook waar de fracties niets samen stemden (gezamenlijk 0)
export function punten(rijen: HalfjaarRij[], jaren: string[]): Punt[] {
  const per = new Map(rijen.map((r) => [r.halfjaar.slice(0, 10), r]));
  return jaren.map((h) => {
    const r = per.get(h);
    const g = r?.gezamenlijk ?? 0, s = r?.gelijk ?? 0;
    return { halfjaar: h, gezamenlijk: g, gelijk: s, cohesie: g >= DREMPEL ? (100 * s) / g : null };
  });
}

const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
// "januari 2024" of "juli 2024": het begin van een half jaar
export const beginTekst = (h: string) => `${MAANDEN[Number(h.slice(5, 7)) - 1]} ${h.slice(0, 4)}`;
// "juni 2024" of "december 2024": het eind van een half jaar
export const eindTekst = (h: string) => `${h.slice(5, 7) === "01" ? "juni" : "december"} ${h.slice(0, 4)}`;
// Kort, voor de as en de schuif: "2024" en "2024 II"
export const kortTekst = (h: string) => `${h.slice(0, 4)}${h.slice(5, 7) === "07" ? " II" : ""}`;

// Aaneengesloten reeksen halve jaren als tekst: "januari 2010 tot en met juni 2012"
export function reeksTekst(halfjaren: string[], alle: string[]): string[] {
  const idx = halfjaren.map((h) => alle.indexOf(h)).filter((i) => i >= 0).sort((a, b) => a - b);
  const stukken: Array<[number, number]> = [];
  for (const i of idx) {
    const laatste = stukken[stukken.length - 1];
    if (laatste && laatste[1] === i - 1) laatste[1] = i;
    else stukken.push([i, i]);
  }
  return stukken.map(([a, b]) => (a === b ? `${beginTekst(alle[a])} tot en met ${eindTekst(alle[a])}` : `${beginTekst(alle[a])} tot en met ${eindTekst(alle[b])}`));
}

const lijstTekst = (l: string[]) => (l.length < 2 ? l.join("") : `${l.slice(0, -1).join(", ")} en ${l[l.length - 1]}`);

export type Samenvatting = { gezamenlijk: number; gelijk: number; cohesie: number | null; zonder: string[]; teWeinig: string[] };

// De gekozen periode (van en tot als index in de punten, tot en met): totaal, en welke halve jaren uitvallen
export function samenvatting(p: Punt[], van: number, tot: number): Samenvatting {
  const deel = p.slice(van, tot + 1);
  const g = deel.reduce((t, x) => t + x.gezamenlijk, 0), s = deel.reduce((t, x) => t + x.gelijk, 0);
  return {
    gezamenlijk: g, gelijk: s, cohesie: g >= DREMPEL ? (100 * s) / g : null,
    zonder: deel.filter((x) => x.gezamenlijk === 0).map((x) => x.halfjaar),
    teWeinig: deel.filter((x) => x.gezamenlijk > 0 && x.gezamenlijk < DREMPEL).map((x) => x.halfjaar),
  };
}

// De toelichting onder de grafiek: welke halve jaren in de gekozen periode niet meetellen, en waarom
export function uitvalTekst(a: string, b: string, sv: Samenvatting, alle: string[]): string | null {
  const zinnen: string[] = [];
  if (sv.zonder.length) {
    zinnen.push(`Geen stemmingen waarin ${a} en ${b} allebei stemden in ${lijstTekst(reeksTekst(sv.zonder, alle))}. Meestal zat een van beide toen niet (meer) in de Kamer, of onder een andere naam.`);
  }
  if (sv.teWeinig.length) {
    zinnen.push(`Te weinig stemmingen samen (minder dan ${DREMPEL}) voor een eigen punt in ${lijstTekst(reeksTekst(sv.teWeinig, alle))}; die tellen wel mee in het totaal.`);
  }
  return zinnen.length ? zinnen.join(" ") : null;
}

// Alles voor het blok "door de jaren": de lijn van de gekozen fractie en van de tweede fractie (standaard de grootste),
// de keuzelijst zonder dubbele lijnen, en een extra lijn per voorganger bij een fusie
export type Trenddata = { a: Lijn; b: Lijn; keuzes: string[]; hoofd: HalfjaarRij[]; extra: Array<{ naam: string; rijen: HalfjaarRij[] }> };

export async function laadTrend(fracties: Array<{ id: string; afkorting: string; zetels: number }>, gekozen: string | undefined,
  met: string | undefined, variant: Variant, opvolgers: Opvolger[]): Promise<Trenddata | null> {
  const groot = [...fracties].filter((f) => f.zetels > 0).sort((x, y) => y.zetels - x.zetels || x.afkorting.localeCompare(y.afkorting));
  const lijnen: Lijn[] = [];
  for (const f of groot) {
    const l = lijnVan(f.id, f.afkorting, opvolgers);
    if (!lijnen.some((x) => x.naam === l.naam)) lijnen.push(l);
  }
  const bevat = (l: Lijn, afk: string | undefined) => !!afk && (l.naam === afk || l.eerder.includes(afk));
  const a = lijnen.find((l) => bevat(l, gekozen)) ?? lijnen[0];
  const keuzes = lijnen.filter((l) => l !== a);
  const b = keuzes.find((l) => bevat(l, met)) ?? keuzes[0];
  if (!a || !b) return null;
  const hoofd = await cohesiePerHalfjaar(a.ids, b.ids, variant);
  if (!hoofd) return null;
  const extra = await Promise.all([
    ...a.voorgangers.map(async (v) => ({ naam: `${v.afkorting} en ${b.naam}`, rijen: (await cohesiePerHalfjaar([v.id], b.ids, variant)) ?? [] })),
    ...b.voorgangers.map(async (v) => ({ naam: `${a.naam} en ${v.afkorting}`, rijen: (await cohesiePerHalfjaar(a.ids, [v.id], variant)) ?? [] })),
  ]);
  return { a, b, keuzes: keuzes.map((l) => l.naam), hoofd, extra: extra.filter((e) => e.rijen.length) };
}

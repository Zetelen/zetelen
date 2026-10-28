// "Wat opvalt" bovenaan de pagina's (K11, 27 oktober 2026): één feitelijke zin per pagina, uit de data berekend,
// zodat hij na elke verversing klopt. Alleen metingen (hoogste, laagste, aantal), geen oordeel. Zonder genoeg data
// geeft elke functie null en valt de regel weg.
import type { FractieInPeriode, Periodesoort, Rol } from "./cohesie";
import { MINIMUM_UITERSTEN, paarPerTerrein, uitersten, type TerreinPaar } from "./onderwerpen";
import { type CohesieKaart, type Paar, sleutel } from "./zaal";
import type { FractieWerk, Stuk } from "./zetelwerk";

// Alleen fracties met minstens zoveel zetels tellen mee in de uitersten: een eenmansfractie geeft snel een uitschieter
export const MINIMUM_ZETELS = 5;

const pct = (c: number) => `${Math.round(c).toLocaleString("nl-NL")}%`;
const getal = (n: number) => n.toLocaleString("nl-NL");

// "Onder kabinet-Schoof", "In de Kamerperiode 2023-2025" of, voor de lopende periode "2025-", "In de Kamerperiode sinds 2025"
const kamerperiode = (periode: string) => (periode.endsWith("-") ? `Kamerperiode sinds ${periode.slice(0, -1)}` : `Kamerperiode ${periode}`);
export function periodeTekst(soort: Periodesoort, periode: string): string {
  return soort === "kabinet" ? `Onder kabinet-${periode}` : `In de ${kamerperiode(periode)}`;
}

// Verkenner: het paar fracties dat het vaakst en het minst vaak hetzelfde stemde
export function verkennerOpvalt(soort: Periodesoort, periode: string, fracties: FractieInPeriode[], kaart: CohesieKaart): string | null {
  const groot = fracties.filter((f) => f.inZaal && f.zetels >= MINIMUM_ZETELS);
  const paren: Array<{ a: string; b: string; c: number }> = [];
  for (const a of groot) for (const b of groot) {
    if (a.afkorting >= b.afkorting) continue;
    const p = kaart.get(sleutel(a.id, b.id));
    if (p && !p.teWeinig && p.cohesie != null) paren.push({ a: a.afkorting, b: b.afkorting, c: p.cohesie });
  }
  if (paren.length < 2) return null;
  paren.sort((x, y) => y.c - x.c || x.a.localeCompare(y.a) || x.b.localeCompare(y.b));
  const hoog = paren[0], laag = paren[paren.length - 1];
  // Ligt het volgende paar binnen 1 procentpunt, dan is "het vaakst" geen echt verschil: noem het erbij (feitencontrole
  // 28 oktober 2026)
  const tweede = paren[1], voorlaatste = paren[paren.length - 2];
  const bijHoog = paren.length > 2 && hoog.c - tweede.c < 1 ? `, vrijwel gelijk met ${tweede.a} en ${tweede.b}` : "";
  const bijLaag = paren.length > 2 && voorlaatste.c - laag.c < 1 ? `, vrijwel gelijk met ${voorlaatste.a} en ${voorlaatste.b}` : "";
  return `${periodeTekst(soort, periode)} stemden ${hoog.a} en ${hoog.b} het vaakst hetzelfde (${pct(hoog.c)}${bijHoog}), ${laag.a} en ${laag.b} het minst (${pct(laag.c)}${bijLaag}). Dat geldt voor fracties met minstens ${MINIMUM_ZETELS} zetels.`;
}

// Onderwerpen met twee fracties: het terrein waarop ze het vaakst en het minst vaak eens waren
export function paarOpvalt(a: string, b: string, paar: TerreinPaar[]): string | null {
  const u = uitersten(paar);
  if (!u) return null;
  return `${a} en ${b} stemden het vaakst hetzelfde bij ${u.hoog.terrein} (${pct(u.hoog.cohesie!)}), het minst bij ${u.laag.terrein} (${pct(u.laag.cohesie!)}).`;
}

// Onderwerpen met één fractie: de andere fractie waarmee het verschil tussen de onderwerpen het grootst is. Alleen de
// vijf grootste andere fracties, zodat de zin over herkenbare fracties gaat (besluit Niels, 27 oktober 2026)
export const GROOTSTE = 5;
export function onderwerpenOpvalt(soort: Periodesoort, periode: string, gekozen: string, anderen: Array<{ id: string; afkorting: string; zetels: number }>,
  perTerrein: Map<string, Map<string, Paar>>): string | null {
  let beste: { afkorting: string; hoog: TerreinPaar; laag: TerreinPaar } | null = null;
  const groot = [...anderen].sort((a, b) => b.zetels - a.zetels || a.afkorting.localeCompare(b.afkorting)).slice(0, GROOTSTE);
  for (const f of groot) {
    const u = uitersten(paarPerTerrein(perTerrein, f.id));
    if (!u) continue;
    const verschil = u.hoog.cohesie! - u.laag.cohesie!;
    if (!beste || verschil > beste.hoog.cohesie! - beste.laag.cohesie!) beste = { afkorting: f.afkorting, ...u };
  }
  if (!beste) return null;
  return `${periodeTekst(soort, periode)} verschilt het per onderwerp het meest tussen ${gekozen} en ${beste.afkorting}, van de ${GROOTSTE} grootste andere fracties: het vaakst eens bij ${beste.hoog.terrein} (${pct(beste.hoog.cohesie!)}), het minst bij ${beste.laag.terrein} (${pct(beste.laag.cohesie!)}). Alleen onderwerpen met minstens ${MINIMUM_UITERSTEN} stemmingen samen.`;
}

// Zetels van het kabinet bij de start: de fracties die bij de start in het kabinet zaten
export function kabinetBijStart(fracties: FractieInPeriode[], rollen: Map<string, Rol>): number {
  return fracties.filter((f) => f.bijBegin && rollen.get(f.afkorting)?.rol === "kabinet").reduce((t, f) => t + f.zetelsBegin, 0);
}

// Coalitie: had het kabinet bij de start een meerderheid?
export function coalitieOpvalt(kabinet: string, zetels: number): string | null {
  if (!zetels) return null;
  return zetels >= 76
    ? `Kabinet-${kabinet} begon met ${zetels} van de 150 zetels: genoeg voor een meerderheid.`
    : `Kabinet-${kabinet} begon met ${zetels} van de 150 zetels. Voor een meerderheid zijn er 76 nodig, dus het kabinet heeft stemmen van de oppositie nodig.`;
}

// Oppositie: welk deel van de oppositiemoties werd aangenomen, nu (nog lopend), onder het vorige en onder het eerste
// kabinet (feitencontrole 28 oktober 2026: alleen het begin van de reeks noemen was selectief)
export function oppositieOpvalt(kabinet: string, nu: number, vorige: string, vorig: number, eerste: string, toen: number): string {
  return `Onder kabinet-${kabinet}, dat nog loopt, nam de Kamer ${nu}% van de oppositiemoties aan. Onder ${vorige} was dat ${vorig}%, onder ${eerste} ${toen}%.`;
}

// Fracties: hoeveel fracties er bij de start waren, en de grootste
export function fractiesOpvalt(soort: Periodesoort, periode: string, rijen: Array<{ fractie: { afkorting: string }; zetels: number }>): string | null {
  if (!rijen.length) return null;
  const [groot] = [...rijen].sort((a, b) => b.zetels - a.zetels);
  const begin = soort === "kabinet" ? `Bij de start van kabinet-${periode}` : `Aan het begin van de ${kamerperiode(periode)}`;
  return `${begin} zaten er ${rijen.length} fracties in de Kamer. De grootste was ${groot.fractie.afkorting} met ${groot.zetels} zetels.`;
}

// Kamerleden: de fractie die de meeste stukken van deze soort indiende
// Een fractie onder een nieuwe naam telt samen met haar voorganger (GroenLinks-PvdA en PRO; feitencontrole 28 oktober
// 2026: apart geteld leek de PVV de meeste moties in te dienen). hernoemd: oude afkorting naar de nieuwste.
export function kamerledenOpvalt(soort: Periodesoort, periode: string, stuk: Stuk, meervoud: string, rijen: FractieWerk[],
  hernoemd: Map<string, string> = new Map()): string | null {
  const per = new Map<string, { n: number; namen: Set<string> }>();
  for (const r of rijen.filter((x) => x.soort === stuk && x.ingediend > 0)) {
    const naam = hernoemd.get(r.afkorting) ?? r.afkorting, x = per.get(naam) ?? { n: 0, namen: new Set<string>() };
    x.n += r.ingediend; x.namen.add(r.afkorting); per.set(naam, x);
  }
  const eigen = [...per].map(([afkorting, x]) => ({ afkorting, n: x.n, eerder: [...x.namen].filter((a) => a !== afkorting) }))
    .sort((a, b) => b.n - a.n);
  if (!eigen.length) return null;
  // Geen totaal erbij: een stuk met indieners uit meer fracties telt bij elke fractie mee
  const tekst = (x: (typeof eigen)[number]) => `${x.afkorting} (${getal(x.n)}${x.eerder.length ? `, ook als ${x.eerder.join(" en ")}` : ""})`;
  const [een, twee] = eigen;
  return `${periodeTekst(soort, periode)} diende ${tekst(een)} de meeste ${meervoud} in${twee ? `, daarna ${tekst(twee)}` : ""}.`;
}

// Naamswijzigingen uit content/fractie-opvolgers.json als kaart van oude naar nieuwste afkorting
export function hernoemingen(opvolgers: Array<{ soort: string; van: Array<{ afkorting: string }>; naar: { afkorting: string } }>): Map<string, string> {
  const stap = new Map(opvolgers.filter((o) => o.soort === "naamswijziging").flatMap((o) => o.van.map((v) => [v.afkorting, o.naar.afkorting] as const)));
  const nieuwste = (a: string): string => (stap.has(a) ? nieuwste(stap.get(a)!) : a);
  return new Map([...stap.keys()].map((a) => [a, nieuwste(a)]));
}

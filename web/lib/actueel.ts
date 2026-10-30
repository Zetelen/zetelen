// Actueel (besluit Niels, 30 oktober 2026): een stuk bij het nieuws in vier vaste blokken, geen scrollverhaal. Elk blok
// beantwoordt één vraag (hoe hecht is de groep, gaat ze mee, waar wringt het, telt het op) met een kop die de conclusie
// is, één grafiek en een regel met de marge. Dezelfde blokken zijn de deelplaatjes en de scènes van de video.
// De getallen komen uit web/content/actueel/<slug>.json (pipeline/actueel.py), vastgelegd op de dag van publicatie:
// een actueel stuk is een momentopname, met de stand erbij. De zinnen staan hieronder en lezen hun getallen uit dat
// bestand; de tests controleren dat elke zin klopt met de data.
import blokKabinet from "../content/actueel/blok-kabinet.json";

export type Stemming = {
  besluit: string; datum: string; zaakNummer: string | null; soort: string | null; onderwerp: string | null;
  uitslag: string | null; groep: string | null; ref: string | null; stand: "tegen" | "samen" | "verdeeld";
};
export type ActueelData = {
  slug: string; kabinet: string; groep: string[]; tegen: string[]; stand: string; gemaakt: string; besluiten: number; verdeeld: number;
  hechtheid: { paren: Array<{ a: string; b: string; cohesie: number; gezamenlijk: number; plek: number }>; parenTotaal: number };
  meegaan: {
    basis: number; fracties: Array<{ afkorting: string; gestemd: number; mee: number; pct: number | null }>;
    groep: { eensgezind: number; mee: number; pct: number | null };
  };
  samen: Array<{ naam: string; gestemd: number; samen: number; pct: number | null }>;
  botspunten: {
    themas: Array<{ thema: string; patroon: string; verdeeld: number; beide: number; tegenover: number; stemmingen: Stemming[] }>;
    alles: { beide: number; tegenover: number; pct: number | null };
  };
  zetelsom: { meerderheid: number; zetels: Record<string, number>; ref: number; groep: number; samen: number; kleinsteMeerderheid: string[][] };
};

export type Blok = { id: string; vraag: string; kop: string; tekst: string[]; data: string };
export type Stuk = {
  slug: string; datum: string; label: string; kop: string; beschrijving: string; ziet: string; opvalt: string;
  aanleiding: string; blokken: Blok[]; lezingen?: { links: { titel: string; tekst: string }; rechts: { titel: string; tekst: string } };
  slot: string; data: ActueelData;
};

// Getallen zoals op de rest van de site: hele procenten, punt voor duizendtallen
export const procent = (p: number | null | undefined) => (p == null ? "" : `${Math.round(p)}%`);
export const aantal = (n: number) => n.toLocaleString("nl-NL");
const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
export const datumTekst = (iso: string) => `${Number(iso.slice(8, 10))} ${MAANDEN[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
const opsomming = (l: string[]) => (l.length < 2 ? l.join("") : `${l.slice(0, -1).join(", ")} en ${l[l.length - 1]}`);

export const paar = (d: ActueelData, a: string, b: string) =>
  d.hechtheid.paren.find((p) => (p.a === a && p.b === b) || (p.a === b && p.b === a));
export const mee = (d: ActueelData, afk: string) => d.meegaan.fracties.find((f) => f.afkorting === afk);
export const thema = (d: ActueelData, naam: string) => d.botspunten.themas.find((t) => t.thema === naam);
// Alleen de stemmingen waarop beide groepen eensgezind waren: die staan als vierkantjes in blok 3
export const vierkantjes = (t: ActueelData["botspunten"]["themas"][number]) => t.stemmingen.filter((s) => s.stand !== "verdeeld");

function blokTegenKabinet(d: ActueelData): Stuk {
  const binnen = (l: string[]) => l.flatMap((a, i) => l.slice(i + 1).map((b) => paar(d, a, b)!));
  const blok = binnen(d.groep), kab = binnen(d.tegen);
  const kruis = d.groep.flatMap((a) => d.tegen.map((b) => paar(d, a, b)!)).sort((x, y) => y.cohesie - x.cohesie);
  const bereik = (l: typeof blok) => [Math.min(...l.map((p) => p.cohesie)), Math.max(...l.map((p) => p.cohesie))];
  const [bMin, bMax] = bereik(blok), [kMin, kMax] = bereik(kab);
  const plekken = blok.map((p) => p.plek).sort((x, y) => x - y);
  const hoog = kruis[0], laag = kruis[kruis.length - 1];
  const [sgp, pro, ja21, bbb] = ["SGP", "PRO", "JA21", "BBB"].map((a) => mee(d, a)!);
  const stik = thema(d, "Stikstof")!, asiel = thema(d, "Asielopvang en spreidingswet")!, abortus = thema(d, "Abortus, embryo, draagmoeder")!;
  const z = d.zetelsom;
  const kort = z.meerderheid - z.ref;
  const metJa21 = z.ref + z.zetels.JA21;
  const kleintjes = z.kleinsteMeerderheid.map((c) => c.find((a) => a !== "JA21")!);

  return {
    slug: d.slug, datum: d.gemaakt, label: "Actueel · JA21, BBB en SGP",
    kop: `Op stikstof stonden blok en kabinet ${stik.tegenover} van de ${stik.beide} keer tegenover elkaar`,
    beschrijving: "JA21, BBB en SGP stellen samen eisen aan het kabinet-Jetten. Hoe hecht is dat blok, hoe vaak stemt het mee met D66, VVD en CDA, en waar botst het?",
    ziet: `Hoe JA21, BBB en SGP stemden tegenover D66, VVD en CDA, onder kabinet-${d.kabinet} tot en met ${datumTekst(d.stand)}.`,
    opvalt: `Op stikstof stonden blok en kabinet ${stik.tegenover} van de ${stik.beide} keer tegenover elkaar, terwijl dat over alle stemmingen samen ${aantal(d.botspunten.alles.tegenover)} van de ${aantal(d.botspunten.alles.beide)} keer was.`,
    aanleiding: "JA21, BBB en SGP presenteerden op 29 oktober 2026 samen eisen voor een rechtse meerderheid, onder meer over stikstof en abortus. Of het kabinet daarop ingaat, is politiek. Wat wel te meten is: hoe deze zes partijen tot nu toe in de Kamer stemden.",
    blokken: [
      {
        id: "hecht", vraag: "Hoe hecht is de groep?", kop: "Het blok is hecht, het kabinet hechter",
        tekst: [
          `JA21, BBB en SGP kozen onderling in ${procent(bMin)} tot ${procent(bMax)} van de verdeelde stemmingen dezelfde kant. Daarmee staan ze op plek ${plekken[0]} tot ${plekken[plekken.length - 1]} van de ${d.hechtheid.parenTotaal} paren. De drie kabinetspartijen halen ${procent(kMin)} tot ${procent(kMax)}.`,
          `Tussen blok en kabinet ligt het lager: van ${procent(hoog.cohesie)} (${hoog.a} en ${hoog.b}) tot ${procent(laag.cohesie)} (${laag.a} en ${laag.b}).`,
        ],
        data: `Cohesie onder kabinet-${d.kabinet}: van de verdeelde stemmingen waarin beide fracties voor of tegen stemden, het deel waarin ze dezelfde kant kozen. Verdeeld: niet alle fracties stemden hetzelfde. Plek onder alle paren van fracties met minstens 3 zetels.`,
      },
      {
        id: "mee", vraag: "Gaat de groep mee?", kop: "Als het kabinet eensgezind stemt, gaat PRO vaker mee dan JA21 of BBB",
        tekst: [
          `Op ${aantal(d.meegaan.basis)} verdeelde stemmingen kozen D66, VVD en CDA alle drie dezelfde kant. De SGP ging daarin het vaakst mee, in ${procent(sgp.pct)}. PRO volgt met ${procent(pro.pct)}, voor JA21 (${procent(ja21.pct)}) en BBB (${procent(bbb.pct)}).`,
          `Was het blok zelf eensgezind, dan ging het in ${procent(d.meegaan.groep.pct)} van die stemmingen mee met het kabinet.`,
        ],
        data: "Per fractie alleen de stemmingen waarop die fractie zelf stemde. PRO: GroenLinks-PvdA en PRO samen, als één lijn.",
      },
      {
        id: "wringt", vraag: "Waar wringt het?", kop: "Op de dossiers uit de eisen staan ze bijna altijd tegenover elkaar",
        tekst: [
          `Als kabinet en blok allebei eensgezind stemden, stonden ze in ${procent(d.botspunten.alles.pct)} van de stemmingen tegenover elkaar. Op stikstof was dat ${stik.tegenover} van de ${stik.beide} keer, op asielopvang en de spreidingswet ${asiel.tegenover} van de ${asiel.beide}, op abortus ${abortus.tegenover} van de ${abortus.beide}.`,
          "Bij abortus is het blok minder eensgezind dan het lijkt. Bij twee hoofdelijke stemmingen op 27 oktober stemde JA21 verdeeld. Zetelen telt de kant van de meerderheid van een fractie.",
        ],
        data: "Een vierkantje is één verdeelde stemming waarin kabinet en blok allebei eensgezind stemden, gekozen op trefwoorden in het onderwerp. Klik voor de stemming op tweedekamer.nl.",
      },
      {
        id: "telt", vraag: "Telt het op?", kop: `Het kabinet heeft JA21 nodig, en ${kleintjes.length > 1 ? "een van de twee kleine" : kleintjes[0]}`,
        tekst: [
          `D66, VVD en CDA hebben ${z.ref} zetels, ${kort} te weinig voor een meerderheid. Met JA21 erbij is het ${metJa21}. Dan is ${opsomming(kleintjes).replace(" en ", " of ")} genoeg, met elk ${z.zetels[kleintjes[0]]} zetels.`,
          `Het blok telt ${z.groep} zetels. Lid Keijzer, in het nieuws vaak bij BBB geteld, is een eigen fractie. De Eerste Kamer telt hier niet mee.`,
        ],
        data: `Zetels in de zaal onder kabinet-${d.kabinet}. Meerderheid: ${z.meerderheid} van de 150.`,
      },
    ],
    lezingen: {
      links: { titel: "Een breekpunt", tekst: "Wat het blok vraagt, heeft het kabinet tot nu toe bijna steeds afgewezen. Op deze dossiers is er geen gewoonte van samen stemmen om op te bouwen." },
      rechts: { titel: "Ruimte voor een ruil", tekst: `Het gaat om ${stik.beide + asiel.beide + abortus.beide} van de ${aantal(d.verdeeld)} verdeelde stemmingen, vaak moties: verzoeken, geen wetten. Een akkoord kan juist op zulke punten een ruil zijn. Of dat gebeurt, staat niet in de data.` },
    },
    slot: "Voor de rekensom is het blok één partij te groot.",
    data: d,
  };
}

export const STUKKEN: Stuk[] = [blokTegenKabinet(blokKabinet as ActueelData)];
export const stukVan = (slug: string) => STUKKEN.find((s) => s.slug === slug);

// Deellinks (lib/deelSchoon.ts): alleen een bestaand stuk en een blok daarvan gaan mee; de titel is de kop van het blok
export function schoonActueel(w: Record<string, string>): Record<string, string> {
  const x = stukVan(w.stuk ?? "");
  if (!x) return {};
  return x.blokken.some((b) => b.id === w.blok) ? { stuk: x.slug, blok: w.blok } : { stuk: x.slug };
}
export function titelActueel(w: Record<string, string>): string | null {
  const x = stukVan(w.stuk ?? "");
  return x?.blokken.find((b) => b.id === w.blok)?.kop ?? x?.kop ?? null;
}

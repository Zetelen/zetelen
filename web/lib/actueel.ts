// Actueel (besluit Niels, 30 oktober 2026): een stuk bij het nieuws in vier blokken, geen scrollverhaal. Elk blok
// beantwoordt één vraag met een kop die de conclusie is, één grafiek en een regel met de marge. De vragen volgen het
// verhaal van het stuk (herzien met Niels op 30 oktober: eerst het contrast, dan waar het blok zelf verdeeld is; geen
// bewering over wie nodig is, want de Eerste Kamer staat niet in de data). Dezelfde blokken zijn de deelplaatjes en de scènes van de video.
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
  perThema: Array<{ thema: string; verdeeld: number; groepEensgezind: number; refEensgezind: number;
    fracties: Array<{ afkorting: string; gestemd: number; mee: number; pct: number | null }> }>;
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
export const perThema = (d: ActueelData, naam: string) => d.perThema.find((t) => t.thema === naam);
// Per blokpartij hoe vaak mee met het eensgezinde kabinet op de drie thema's samen (alles behalve "Alles")
export const opDrieThemas = (d: ActueelData) => d.groep.map((a) => {
  const f = d.perThema.filter((t) => t.thema !== "Alles").map((t) => t.fracties.find((x) => x.afkorting === a)!);
  const m = f.reduce((n, x) => n + x.mee, 0), g = f.reduce((n, x) => n + x.gestemd, 0);
  return { afkorting: a, mee: m, gestemd: g, pct: g ? (100 * m) / g : null };
});
export const vierkantjes = (t: ActueelData["botspunten"]["themas"][number]) => t.stemmingen.filter((s) => s.stand !== "verdeeld");

function blokTegenKabinet(d: ActueelData): Stuk {
  const [sgp, pro, ja21, bbb] = ["SGP", "PRO", "JA21", "BBB"].map((a) => mee(d, a)!);
  const stik = thema(d, "Stikstof")!, asiel = thema(d, "Asielopvang en spreidingswet")!, abortus = thema(d, "Abortus, embryo, draagmoeder")!;
  const pAlles = perThema(d, "Alles")!, pStik = perThema(d, "Stikstof")!, pAsiel = perThema(d, "Asielopvang en spreidingswet")!;
  const pAbortus = perThema(d, "Abortus, embryo, draagmoeder")!;
  const fr = (t: typeof pAlles, a: string) => t.fracties.find((f) => f.afkorting === a)!;
  const z = d.zetelsom;
  const drie = [stik, asiel, abortus];
  const beideDrie = drie.reduce((n, t) => n + t.beide, 0), tegenDrie = drie.reduce((n, t) => n + t.tegenover, 0);
  const motiesDrie = drie.flatMap(vierkantjes).filter((x) => x.soort === "Motie").length;
  const g = d.meegaan.groep;
  const drieMee = opDrieThemas(d);
  const driePct = drieMee.map((f) => f.pct ?? 0);
  const vanTot = (l: number[]) => `${Math.round(Math.min(...l))} tot ${procent(Math.max(...l))}`;
  const drieFr = (a: string) => drieMee.find((f) => f.afkorting === a)!;
  const blokPct = [sgp, ja21, bbb].map((f) => f.pct ?? 0);
  const abortusBlok = perThema(d, "Abortus, embryo, draagmoeder")!;
  const kabinet = opsomming(d.tegen), blok = opsomming(d.groep);

  return {
    slug: d.slug, datum: d.gemaakt, label: "Actueel · JA21, BBB en SGP",
    kop: "Het blok stelt eisen waar het kabinet tot nu toe bijna altijd de andere kant koos",
    beschrijving: `${blok} stellen samen eisen aan het kabinet-${d.kabinet}. Hoe vaak stemt het blok mee met ${kabinet}, waar botst het, en is het blok wel één blok?`,
    ziet: `Hoe ${blok} stemden tegenover ${kabinet}, onder kabinet-${d.kabinet} tot en met ${datumTekst(d.stand)}.`,
    opvalt: `Op stikstof, asiel en abortus stemden ${blok} in ${vanTot(driePct)} mee met het kabinet, over alle onderwerpen in ${vanTot(blokPct)}. Als het blok eensgezind was, stond het op die thema's ${tegenDrie} van de ${beideDrie} keer tegenover het kabinet. Bij abortus stemde het blok maar ${pAbortus.groepEensgezind} van de ${pAbortus.verdeeld} keer eensgezind.`,
    aanleiding: "JA21, BBB en SGP stuurden het kabinet op 29 oktober 2026 een gezamenlijk eisenpakket, in ruil voor steun aan het belastingplan. Het gaat onder meer over lastenverlichting, stikstof, asiel, draagmoederschap en abortus. Of het kabinet daarop ingaat, is politiek. Wat wel te meten is: hoe deze zes partijen tot nu toe in de Kamer stemden.",
    blokken: [
      {
        id: "mee", vraag: "Stemt het blok mee?", kop: `${opsomming(d.groep)} stemden in ${Math.round(Math.min(...blokPct))} tot ${procent(Math.max(...blokPct))} van de stemmingen mee met het kabinet, de oppositiepartij PRO in ${procent(pro.pct)}`,
        tekst: [
          `Op ${aantal(d.meegaan.basis)} verdeelde stemmingen kozen ${kabinet} alle drie dezelfde kant. Was het blok daarbij ook eensgezind (${aantal(g.eensgezind)} keer), dan koos het ${aantal(g.mee)} keer dezelfde kant als het kabinet, in ${procent(g.pct)}.`,
          `Per partij ging de SGP het vaakst mee, in ${procent(sgp.pct)}. Daarna volgen JA21 (${procent(ja21.pct)}) en BBB (${procent(bbb.pct)}). PRO hoort niet bij het blok en komt op ${procent(pro.pct)}, ongeveer zo vaak als JA21.`,
        ],
        data: "Per fractie alleen de stemmingen waarop die fractie zelf stemde. PRO: GroenLinks-PvdA en PRO samen, als één lijn.",
      },
      {
        id: "wringt", vraag: "Waar wringt het?", kop: `Op stikstof, asiel en abortus stemden ze in ${vanTot(driePct)} mee, over alles in ${vanTot(blokPct)}`,
        tekst: [
          `Op de drie thema's samen stemde de SGP ${drieFr("SGP").mee} van de ${drieFr("SGP").gestemd} keer mee met het eensgezinde kabinet, JA21 ${drieFr("JA21").mee} keer en BBB ${drieFr("BBB").mee} keer. Als het blok zelf eensgezind was, stonden kabinet en blok ${tegenDrie} van de ${beideDrie} keer tegenover elkaar. Over alle onderwerpen was dat ${aantal(d.botspunten.alles.tegenover)} van de ${aantal(d.botspunten.alles.beide)} keer. Op stikstof was dat ${stik.tegenover} van de ${stik.beide} keer, op asielopvang en de spreidingswet ${asiel.tegenover} van de ${asiel.beide}, op abortus ${abortus.tegenover} van de ${abortus.beide}.`,
          `Op stikstof en asiel zijn beide groepen hechter dan gemiddeld. Het blok stemde daar ${pStik.groepEensgezind} van de ${pStik.verdeeld} en ${pAsiel.groepEensgezind} van de ${pAsiel.verdeeld} keer eensgezind, tegen ${procent((100 * pAlles.groepEensgezind) / pAlles.verdeeld)} over alle stemmingen. Het kabinet was eensgezind op ${pStik.refEensgezind} van de ${pStik.verdeeld} en ${pAsiel.refEensgezind} van de ${pAsiel.verdeeld}.`,
        ],
        data: "Een vierkantje is één verdeelde stemming waarin kabinet en blok allebei eensgezind stemden, gekozen op trefwoorden in het onderwerp. Klik voor de stemming op tweedekamer.nl.",
      },
      {
        id: "abortus", vraag: "Is het blok één blok?", kop: "Bij abortus valt het blok uiteen",
        tekst: [
          `Op de ${pAbortus.verdeeld} verdeelde stemmingen over abortus, embryo's en draagmoederschap stemde het blok ${pAbortus.groepEensgezind} keer eensgezind. JA21 ging ${fr(pAbortus, "JA21").mee} van de ${fr(pAbortus, "JA21").gestemd} keer mee met het eensgezinde kabinet, ongeveer zoals over alle stemmingen (${procent(fr(pAlles, "JA21").pct)}). De SGP deed dat ${fr(pAbortus, "SGP").mee} keer, BBB ${fr(pAbortus, "BBB").mee} keer.`,
          // Uit de controle tegen de bron (30 oktober 2026): JA21 was bij alle zeven hoofdelijke stemmingen over dit thema
          // verdeeld; vier van de zeven keer meegaan rusten op een meerderheid van 5 tegen 4
          "Ook JA21 is hier niet eensgezind: bij alle zeven hoofdelijke stemmingen over dit thema stemden de leden verschillend, vier keer met 5 tegen 4. Zetelen telt de kant van de meerderheid van een fractie. Het gaat om kleine aantallen: één stemming verschuift het beeld al.",
        ],
        data: `Per fractie en thema: van de verdeelde stemmingen waarop ${kabinet} eensgezind stemden en de fractie zelf stemde, hoe vaak ze dezelfde kant koos. Thema's op trefwoorden in het onderwerp.`,
      },
      {
        id: "telt", vraag: "Hoeveel zetels?", kop: `Samen hebben kabinet en blok ${z.samen} zetels in de Tweede Kamer`,
        tekst: [
          `${kabinet} hebben ${z.ref} zetels, ${z.meerderheid - z.ref} te weinig voor een meerderheid. ${d.groep.map((a) => `${a} (${z.zetels[a]})`).join(", ").replace(/, ([^,]*)$/, " en $1")} hebben er samen ${z.groep}. Lid Keijzer (1 zetel) is een eigen fractie en hoort er niet bij.`,
          "Een wet moet ook door de Eerste Kamer, en die staat niet in Zetelen. Welke partijen het kabinet daar nodig heeft, is hier dus niet te zien.",
        ],
        data: `Zetels in de zaal onder kabinet-${d.kabinet}. Meerderheid: ${z.meerderheid} van de 150.`,
      },
    ],
    lezingen: {
      links: { titel: "Een breekpunt", tekst: "Op deze dossiers stemden de kabinetsfracties tot nu toe bijna steeds anders dan het blok, als beide groepen eensgezind stemden. Een gewoonte van samen stemmen is er hier niet." },
      rechts: { titel: "Ruimte voor een ruil", tekst: `Het gaat om ${beideDrie} van de ${aantal(d.verdeeld)} verdeelde stemmingen, ${motiesDrie} daarvan moties: verzoeken, geen wetten. Een akkoord kan juist op zulke punten een ruil zijn. Of dat gebeurt, staat niet in de data.` },
    },
    slot: `Wil het kabinet op de eisen ingaan, dan moet het opschuiven waar het tot nu toe ${tegenDrie} van de ${beideDrie} keer de andere kant koos. Bij abortus is niet duidelijk welke kant het blok wil: het stemde daar maar ${abortusBlok.groepEensgezind} van de ${abortusBlok.verdeeld} keer eensgezind.`,
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

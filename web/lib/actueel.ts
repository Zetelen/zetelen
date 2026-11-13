// Actueel (besluit Niels, 30 oktober 2026): een stuk bij het nieuws in vier blokken, geen scrollverhaal. Elk blok
// beantwoordt één vraag met een kop die de conclusie is, één grafiek en een regel met de marge. De vragen volgen het
// verhaal van het stuk (herzien met Niels op 30 oktober: eerst het contrast, dan waar het blok zelf verdeeld is; geen
// bewering over wie nodig is, want de Eerste Kamer staat niet in de data). Dezelfde blokken zijn de deelplaatjes en de scènes van de video.
// De getallen komen uit web/content/actueel/<slug>.json (pipeline/actueel.py), vastgelegd op de dag van publicatie:
// een actueel stuk is een momentopname, met de stand erbij. De zinnen staan hieronder en lezen hun getallen uit dat
// bestand; de tests controleren dat elke zin klopt met de data.
import blokKabinet from "../content/actueel/blok-kabinet.json";
import kabinetCu50Plus from "../content/actueel/kabinet-cu-50plus.json";
import akkoordBelastingplanJson from "../content/actueel/akkoord-belastingplan.json";
import coalitieVerdeeldJson from "../content/actueel/coalitie-verdeeld.json";

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
  // Optioneel, alleen in stukken die erom vragen (pipeline/actueel.py met --stap en --doorslag, 4 november 2026)
  gemiddelden?: Array<{ naam: string; fracties: string[]; paren: number; gemiddelde: number; laagste: number; hoogste: number }>;
  perFractie?: Array<{ afkorting: string; gemiddelde: number }>;
  paren?: Array<{ a: string; b: string; cohesie: number; gezamenlijk: number }>;
  doorslag?: { extra: string; kern: string[]; eensgezind: number; nietGestemd: number; gestemd: number; mee: number; tegen: number; nodig: number; kostte: number; krap: number };
};

// Stuk 3 (11 november 2026): het akkoord over het belastingplan, met eigen cijfers uit pipeline/akkoord_belastingplan.py.
// "soort" onderscheidt deze data van ActueelData, zodat de pagina en de deelplaatjes de juiste grafieken kiezen.
type Kans = { gestemd: number; eensgezind: number; pct: number | null };
type Cohesie = { cohesie: number; gezamenlijk: number; gelijk: number };
type Mee = { afkorting: string; gestemd: number; mee: number; pct: number | null };
type Venster = { van: string; tot: string; basis: number; fracties: Mee[] };
export type Fractiestem = { afkorting: string; stem: "Voor" | "Tegen"; zetels: number; kabinet: boolean };
export type UitslagStemming = {
  rol: "amendement" | "wet"; zaak: string; datum: string; uitslag: string; aangenomen: boolean; hoofdelijk: boolean | null;
  voor: number; tegen: number; fracties: Fractiestem[];
};
export type AkkoordData = {
  slug: string; soort: "akkoord"; kabinet: string; groep: string[]; tegen: string[]; stand: string; gemaakt: string; besluiten: number; verdeeld: number;
  partners: {
    paren: Array<{ kabinetspartij: string; partner: string } & Cohesie>;
    perKabinetspartij: Record<string, Array<{ afkorting: string } & Cohesie>>;
    binnen: Array<{ a: string; b: string } & Cohesie>;
    meegaan: { basis: number; fracties: Mee[] }; minZetels: number;
  };
  buiten: {
    kabinetten: Array<{ kabinet: string; van: string; tot: string; verdeeld: number; keer: number; pct: number; gedoog: boolean;
      partijen: Array<{ afkorting: string; rol: string; basis: number; keer: number; won: number; pct: number }> }>;
    belastingplan: Array<{ zaak: string; datum: string; buiten: string; rest: string[]; kabinet: string }>;
    precedent: { zaak: string; datum: string; buiten: string; rest: string[]; kabinet: string; onderwerp: string; uitslag: string };
  };
  kader: { eindstemmingen: number; metCoalitieTegen: number; eerste: string; laatste: string };
  kamers: {
    tk: { meerderheid: number; zetels: Record<string, number> };
    ek: { bron: string; geraadpleegd: string; zetels: Record<string, number>; eenmansfracties: number; meerderheid: number; totaal: number };
    vier: string[]; buiten: string;
    kabinet: { fracties: string[]; tk: number; ek: number } & Kans;
    vierMaat: Kans;
    routes: Array<{ zonder: string; start: string[]; extra: string[]; tk: number; ek: number; combinaties: number } & Kans>;
  };
  toen: {
    "2013": { kabinet: string; ref: string[]; akkoord: string; tot: string; partners: string[]; anderen: string[]; voor: Venster; na: Venster };
    "2012": { kabinet: string; ref: string[]; akkoord: string; partij: string; partners: string[]; eindeGedoog: string; voor: Venster; na: Venster };
    nu: { kabinet: string; ref: string[]; basis: number; fracties: Mee[] };
  };
  uitslag: null | { bron: string; opgehaald: string; stemmingen: UitslagStemming[] };
  // Blok "plannen" (13 november 2026): de eindstemming over elk Belastingplan sinds 2008, uit de OData
  plannen?: null | { bron: string; opgehaald: string; lijst: Plan[] };
};
// Eén eindstemming over een Belastingplan. Bij een hoofdelijke stemming zonder telling per fractie zijn tegenFracties
// en coalitieTegen null; voor en tegen komen dan uit de besluittekst.
export type Plan = {
  plan: string; zaak: string; datum: string; kabinet: string; coalitie: string[]; uitslag: string; aangenomen: boolean; hoofdelijk: boolean;
  voor: number; tegen: number; tegenFracties: null | Array<{ fractie: string; zetels: number }>; coalitieTegen: null | string[];
};

export type Blok = { id: string; vraag: string; kop: string; tekst: string[]; data: string };
export type Stuk = {
  slug: string; datum: string; label: string; kop: string; beschrijving: string; ziet: string; opvalt: string;
  aanleiding: string; blokken: Blok[]; lezingen?: { links: { titel: string; tekst: string }; rechts: { titel: string; tekst: string } };
  slot: string; data: ActueelData | AkkoordData | VerdeeldData;
  // Link onder de aanleiding naar een stuk waar dit stuk op voortbouwt
  verwijzing?: { href: string; tekst: string };
  // Link onder het stuk naar de coalitiebouwer; zonder dit veld: de groep en de andere groep samen ("deze zes")
  bouwer?: { fracties: string[]; tekst: string };
};
export const isAkkoord = (d: Stuk["data"]): d is AkkoordData => (d as AkkoordData).soort === "akkoord";

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

// Stuk 2 (4 november 2026, idee Niels uit de vault): het kabinet met ChristenUnie, 50PLUS en de Groep Markuszower.
// Neutraal geformuleerd: de cijfers gaan over stemgedrag, niet over hoe logisch een combinatie is.
export const gemiddelde = (d: ActueelData, naam: string) => d.gemiddelden!.find((g) => g.naam === naam)!;
export const perFractieGemiddelde = (d: ActueelData, afk: string) => d.perFractie!.find((f) => f.afkorting === afk)!.gemiddelde;
export const paarCohesie = (d: ActueelData, a: string, b: string) => {
  const p = d.paren!.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
  if (!p) throw new Error(`Geen paar ${a} en ${b}`);
  return p.cohesie;
};
const vanTot = (l: number[]) => `${Math.round(Math.min(...l))} tot ${procent(Math.max(...l))}`;

function kabinetMetSteun(d: ActueelData): Stuk {
  const M = "Groep Markuszower", CU = "ChristenUnie", PLUS = "50PLUS";
  const kabinet = opsomming(d.tegen);
  const vijf = [...d.tegen, CU, PLUS];
  const [g3, g5, g6] = ["kabinet", "met-cu-50plus", "met-markuszower"].map((n) => gemiddelde(d, n));
  const cu = mee(d, CU)!, plus = mee(d, PLUS)!, mk = mee(d, M)!, pvv = mee(d, "PVV")!;
  const z = d.zetelsom, ds = d.doorslag!;
  const zVijf = z.ref + z.zetels[CU] + z.zetels[PLUS];
  const mkMetKabinet = d.tegen.map((a) => paarCohesie(d, M, a));
  const cuPlusMetKabinet = d.tegen.flatMap((a) => [paarCohesie(d, CU, a), paarCohesie(d, PLUS, a)]);
  // Smal en telbaar: bleef de uitslag dezelfde als de zetels van de Groep Markuszower niet meetelden? Voor de uitslag tellen
  // alle fracties mee (de vijf plus iedereen die dezelfde kant koos), niet alleen de vijf.
  const zonderHaar = ds.nodig === 0 ? "bleef de uitslag ook zonder haar zetels dezelfde" : `was de uitslag zonder haar zetels in ${aantal(ds.nodig)} van de ${aantal(ds.mee)} gevallen niet dezelfde geweest`;
  const afwijkMk = procent(100 - (mk.pct ?? 0)), afwijkCu = procent(100 - (cu.pct ?? 0)), afwijkPlus = procent(100 - (plus.pct ?? 0));

  return {
    slug: d.slug, datum: d.gemaakt, label: "Actueel · Kabinet, ChristenUnie, 50PLUS en Groep Markuszower",
    kop: "ChristenUnie en 50PLUS stemmen vaker mee met het kabinet dan de Groep Markuszower",
    beschrijving: `Hoe vaak stemmen ${kabinet} met ${CU} en ${PLUS} hetzelfde, en wat verandert er als de ${M} erbij komt?`,
    ziet: `Hoe vaak ${opsomming(vijf)} dezelfde kant kozen, en wat de ${M} daaraan verandert, onder kabinet-${d.kabinet} tot en met ${datumTekst(d.stand)}.`,
    opvalt: `Het gemiddelde van de cohesie tussen alle paren is ${procent(g3.gemiddelde)} bij het kabinet, ${procent(g5.gemiddelde)} met ${CU} en ${PLUS} erbij en ${procent(g6.gemiddelde)} met ook de ${M}. Als het kabinet eensgezind stemde, ging ${CU} in ${procent(cu.pct)} van de stemmingen mee, ${PLUS} in ${procent(plus.pct)} en de ${M} in ${procent(mk.pct)}.`,
    // Bron van de aanleiding: NOS, "Kabinet praat morgen met verschillende oppositie-combinaties" (nos.nl/artikel/2637182) en
    // "Geen deal met oppositie over belastingplan" (nos.nl/artikel/2637476), eind oktober 2026. De zetelsommen zijn eigen rekenwerk.
    aanleiding: `Eind oktober 2026 sprak het kabinet met verschillende combinaties van oppositiepartijen over steun voor het belastingplan, onder meer met ${CU} en ${PLUS}. Er was toen geen deal (NOS, 29 en 31 oktober 2026: nos.nl/artikel/2637182 en nos.nl/artikel/2637476). Het kabinet haalt met die twee ${zVijf} zetels, ${z.meerderheid - zVijf} te weinig voor een meerderheid, en met de ${M} erbij ${z.samen} (zetels volgens tweedekamer.nl, eigen optelling). Dit stuk meet hoe vaak deze partijen tot nu toe dezelfde kant kozen, eerst zonder en dan met de ${M}. De cijfers gaan over stemgedrag, niet over inhoud of afspraken.`,
    blokken: [
      {
        id: "hecht", vraag: "Hoe vaak stemmen ze hetzelfde?",
        kop: `Het gemiddelde zakt van ${procent(g3.gemiddelde)} bij het kabinet naar ${procent(g5.gemiddelde)} met ${CU} en ${PLUS}, en naar ${procent(g6.gemiddelde)} met de ${M}`,
        tekst: [
          `Cohesie is het percentage gezamenlijke verdeelde stemmingen waarop twee fracties dezelfde kant kozen. Het gemiddelde is het gemiddelde over alle paren in de groep: ${g3.paren} bij het kabinet, ${g5.paren} met ${CU} en ${PLUS}, ${g6.paren} met de ${M}.`,
          `${CU} en ${PLUS} halen met de drie kabinetspartijen ${vanTot(cuPlusMetKabinet)}. De ${M} haalt met dezelfde drie ${vanTot(mkMetKabinet)}. Per partij is de cohesie met de rest van de zes het laagst bij de ${M} (${procent(perFractieGemiddelde(d, M))}), tegen ${procent(perFractieGemiddelde(d, CU))} bij ${CU} en ${procent(perFractieGemiddelde(d, PLUS))} bij ${PLUS}. De volgorde van de drie stappen is een keuze: bij een andere volgorde verschuift de daling per stap.`,
        ],
        data: "Alleen verdeelde stemmingen, zoals overal op Zetelen. Gemiddelde: ongewogen gemiddelde over alle paren in de groep. Elk paar rust op ongeveer 3.900 gezamenlijke stemmingen.",
      },
      {
        id: "stappen", vraag: "Stemmen ze mee met het kabinet?",
        kop: `Als het kabinet eensgezind stemde, ging ${CU} in ${procent(cu.pct)} van de stemmingen mee en ${PLUS} in ${procent(plus.pct)}; de ${M}, die erbij komt, in ${procent(mk.pct)}`,
        tekst: [
          `Op ${aantal(d.meegaan.basis)} verdeelde stemmingen kozen ${kabinet} alle drie dezelfde kant. ${CU} koos op ${aantal(cu.mee)} van de ${aantal(cu.gestemd)} stemmingen waarop ze stemde dezelfde kant, ${PLUS} op ${aantal(plus.mee)} van de ${aantal(plus.gestemd)}.`,
          `De ${M}, die erbij komt, koos op ${aantal(mk.mee)} van de ${aantal(mk.gestemd)} stemmingen waarop ze stemde dezelfde kant, ${procent(mk.pct)}. Ter vergelijking ging de PVV in ${procent(pvv.pct)} van de stemmingen mee.`,
        ],
        data: "Per fractie alleen de stemmingen waarop die fractie zelf stemde.",
      },
      {
        id: "telt", vraag: "Hoeveel zetels?",
        kop: `Het kabinet, ${CU} en ${PLUS} hebben samen ${zVijf} zetels, met de ${M} ${z.samen}`,
        tekst: [
          `De meerderheid is ${z.meerderheid} van de 150. ${kabinet} hebben ${z.ref} zetels. ${CU} (${z.zetels[CU]}) en ${PLUS} (${z.zetels[PLUS]}) brengen dat op ${zVijf}, ${z.meerderheid - zVijf} te weinig. De ${M} heeft ${z.zetels[M]} zetels. ${CU} en de ${M} samen brengen het kabinet op ${z.ref + z.zetels[CU] + z.zetels[M]}.`,
          "Een wet moet ook door de Eerste Kamer, en die staat niet in Zetelen. Welke partijen het kabinet daar nodig heeft, is hier dus niet te zien.",
        ],
        data: `Zetels in de zaal onder kabinet-${d.kabinet}. Meerderheid: ${z.meerderheid} van de 150.`,
      },
      {
        id: "steun", vraag: "Veranderden haar zetels de uitslag?",
        kop: `Waar de ${M} met de vijf partijen meestemde, ${zonderHaar}`,
        tekst: [
          `Op ${aantal(ds.eensgezind)} verdeelde stemmingen kozen ${opsomming(vijf)} dezelfde kant. De ${M} stemde op ${aantal(ds.gestemd)} daarvan (${ds.nietGestemd} keer niet) en koos ${aantal(ds.mee)} keer dezelfde kant en ${aantal(ds.tegen)} keer de andere.`,
          `Van de ${aantal(ds.mee)} keer dat ze dezelfde kant koos, ${zonderHaar}. Voor de uitslag tellen alle fracties mee, niet alleen de vijf. Van de ${aantal(ds.tegen)} keer dat ze de andere kant koos, was de uitslag ${ds.kostte} keer anders geweest als haar ${z.zetels[M]} zetels bij de vijf partijen hadden gestaan. In ${ds.krap} van de ${aantal(ds.gestemd)} stemmingen was het verschil tussen beide kanten kleiner dan ${2 * z.zetels[M]} zetels, twee keer haar zetels.`,
        ],
        data: "Zetels per fractie in de periode, niet het aantal op de dag zelf. Bij hoofdelijke stemmingen telt de kant van de meerderheid van een fractie. Gelijk aantal zetels telt als geen meerderheid. De uitslag is hier de kant met de meeste zetels van de fracties die stemden.",
      },
    ],
    lezingen: {
      links: { titel: `${CU} en ${PLUS} kozen in ${procent(cu.pct)} en ${procent(plus.pct)} van de gevallen dezelfde kant als het eensgezinde kabinet`, tekst: `${CU} en ${PLUS} kozen in ${procent(cu.pct)} en ${procent(plus.pct)} van de stemmingen dezelfde kant als het eensgezinde kabinet, de PVV in ${procent(pvv.pct)}. In de overige gevallen (${afwijkCu} en ${afwijkPlus}) kozen ze een andere kant.` },
      rechts: { titel: `De ${M} koos vaker dan ${CU} en ${PLUS} een andere kant dan het eensgezinde kabinet`, tekst: `De ${M} koos in ${afwijkMk} van de stemmingen een andere kant dan het eensgezinde kabinet, tegen ${afwijkCu} bij ${CU} en ${afwijkPlus} bij ${PLUS}. Waar ze met de vijf partijen (${opsomming(vijf)}) meestemde, ${zonderHaar}. Of dat in een nieuwe verhouding anders uitpakt, staat niet in de data.` },
    },
    slot: `${CU} en ${PLUS} kozen in ${procent(cu.pct)} en ${procent(plus.pct)} van de gevallen dezelfde kant als het eensgezinde kabinet. De ${M} deed dat in ${procent(mk.pct)} van de gevallen; het gemiddelde van de zes is ${procent(g6.gemiddelde)}, van de vijf zonder haar ${procent(g5.gemiddelde)}.`,
    data: d,
  };
}

// Stuk 3 (11 november 2026, verhaal en opbouw goedgekeurd door Niels): het akkoord van D66 en CDA met PRO en Volt over
// één amendement op het Belastingplan 2027, zonder de VVD. Vijf blokken: de uitslag van 12 november, de partners van de
// kabinetspartijen in de oppositie, hoe vaak één kabinetspartij alleen staat, de zetels in beide Kamers, en wat een
// akkoord eerder deed. Blok 1 bestaat als de uitslag in de data staat (sinds 13 november); zonder uitslag staat het stuk
// alleen op een preview.
export const stemmingVan = (d: AkkoordData, rol: UitslagStemming["rol"]) => d.uitslag?.stemmingen.find((s) => s.rol === rol);
export const metStem = (s: UitslagStemming, stem: Fractiestem["stem"]) => s.fracties.filter((f) => f.stem === stem).map((f) => f.afkorting);
export const ekSom = (d: AkkoordData, fracties: string[]) => fracties.reduce((n, a) => n + (d.kamers.ek.zetels[a] ?? 0), 0);
export const tkSom = (d: AkkoordData, fracties: string[]) => fracties.reduce((n, a) => n + (d.kamers.tk.zetels[a] ?? 0), 0);
export const buitenVan = (d: AkkoordData, kabinet: string) => d.buiten.kabinetten.find((k) => k.kabinet === kabinet)!;
// Per kabinetspartij de oppositiefracties die vaker met haar stemden dan de genoemde partner
export const hogerDanPartner = (d: AkkoordData, kabinetspartij: string) => {
  const p = d.partners.paren.find((x) => x.kabinetspartij === kabinetspartij)!;
  return d.partners.perKabinetspartij[kabinetspartij].filter((x) => x.cohesie > p.cohesie);
};
export const verschuiving = (v: { voor: Venster; na: Venster }, afk: string) =>
  v.na.fracties.find((f) => f.afkorting === afk)!.pct! - v.voor.fracties.find((f) => f.afkorting === afk)!.pct!;
const paarNaam = (a: string, b: string) => `${a} en ${b}`;
// Met lidwoord, zoals elders op de site ("de SGP", "het CDA"); alleen waar een fractie alleen het onderwerp is
const LIDWOORD: Record<string, string> = { VVD: "de", CDA: "het", SGP: "de", PVV: "de" };
const deNaam = (a: string, begin = false) => {
  const l = LIDWOORD[a];
  return l ? `${begin ? l[0].toUpperCase() + l.slice(1) : l} ${a}` : a;
};
const stemWoord = (s: UitslagStemming, afk: string) => s.fracties.find((f) => f.afkorting === afk)?.stem;
const AKKOORD_BOUWER = "/coalitie?soort=kabinet&periode=";
export const bouwerLink = (d: AkkoordData) => `${AKKOORD_BOUWER}${d.kabinet}&groep=${d.kamers.vier.map(encodeURIComponent).join(",")}`;

// Blok "plannen": de eindstemmingen over alle Belastingplannen; het laatste plan is dat van dit stuk
export const plannenVan = (d: AkkoordData) => {
  const lijst = d.plannen?.lijst ?? [];
  if (lijst.length < 2) return null;
  const nu = lijst[lijst.length - 1], eerder = lijst.slice(0, -1);
  const marge = (p: Plan) => Math.abs(p.voor - p.tegen);
  const krapste = eerder.reduce((k, p) => (marge(p) < marge(k) ? p : k));
  const tegen = new Map<string, number>();
  for (const p of eerder) for (const f of p.tegenFracties ?? []) tegen.set(f.fractie, (tegen.get(f.fractie) ?? 0) + 1);
  const vaakst = [...tegen.entries()].sort((a, b) => b[1] - a[1]);
  return {
    lijst, nu, eerder, krapste, marge,
    sinds: eerder[0].datum.slice(0, 4),
    alleAangenomen: eerder.every((p) => p.aangenomen),
    geenCoalitieTegen: eerder.every((p) => p.coalitieTegen !== null && p.coalitieTegen.length === 0),
    handopsteken: eerder.filter((p) => !p.hoofdelijk).length,
    vaakst: vaakst.length && (vaakst.length === 1 || vaakst[0][1] > vaakst[1][1]) ? { fractie: vaakst[0][0], keer: vaakst[0][1] } : null,
  };
};
// Het kader voor blok 1 en de lezing: de eerdere Belastingplannen als die er zijn, anders de oudere telling uit Zetelen
const kaderVan = (d: AkkoordData) => {
  const p = plannenVan(d);
  return p ? { n: p.eerder.length, sinds: p.sinds, geen: p.geenCoalitieTegen, wat: "eindstemmingen over een Belastingplan" }
    : { n: d.kader.eindstemmingen, sinds: d.kader.eerste.slice(0, 4), geen: d.kader.metCoalitieTegen === 0, wat: "eindstemmingen over een belastingplan" };
};
const deLidwoord: Record<string, string> = { SP: "de SP", PVV: "de PVV", VVD: "de VVD", PvdD: "de PvdD", FVD: "FVD", CDA: "het CDA" };

function blokPlannen(d: AkkoordData): Blok | null {
  const p = plannenVan(d);
  if (!p) return null;
  const { nu, eerder, krapste: k } = p;
  const krapper = p.marge(nu) < p.marge(k) ? "krapper dan alle plannen ervoor" : p.marge(nu) === p.marge(k) ? `even krap als het Belastingplan ${k.plan}` : `minder krap dan het Belastingplan ${k.plan}`;
  const nuZin = nu.aangenomen
    ? `Het Belastingplan ${nu.plan} nam de Kamer op ${datumTekst(nu.datum)} aan met ${nu.voor} tegen ${nu.tegen}, ${krapper}.`
    : `Het Belastingplan ${nu.plan} verwierp de Kamer op ${datumTekst(nu.datum)} met ${nu.tegen} tegen ${nu.voor}.`;
  const wijze = p.handopsteken === eerder.length && nu.hoofdelijk
    ? ` Over de ${eerder.length} plannen ervoor stemde de Kamer bij handopsteken, per fractie; over dit plan hoofdelijk, elk Kamerlid apart.` : "";
  const coalitieZin = p.geenCoalitieTegen
    ? `Bij geen van de ${eerder.length} eerdere plannen stemde een coalitiefractie of gedoogpartner tegen; alle tegenstemmen kwamen uit de oppositie${p.vaakst ? `, het vaakst van ${deLidwoord[p.vaakst.fractie] ?? p.vaakst.fractie} (${p.vaakst.keer} van de ${eerder.length} keer)` : ""}.`
    : `Bij ${eerder.filter((x) => (x.coalitieTegen ?? []).length > 0).length} van de ${eerder.length} eerdere plannen stemde een coalitiefractie of gedoogpartner tegen.`;
  const wet = stemmingVan(d, "wet");
  const nuTegen = nu.coalitieTegen ?? (wet && wet.zaak === nu.zaak ? d.tegen.filter((a) => stemWoord(wet, a) === "Tegen") : null);
  const nuCoalitie = nuTegen === null
    ? ` Hoe de fracties over het Belastingplan ${nu.plan} stemden, staat nog niet in de open data.`
    : nuTegen.length === 0 ? ` Ook bij het Belastingplan ${nu.plan} stemde geen coalitiefractie tegen.`
    : ` Bij het Belastingplan ${nu.plan} stemde${nuTegen.length > 1 ? "n" : ""} ${opsomming(nuTegen.map((a) => deNaam(a)))} tegen.`;
  return {
    id: "plannen", vraag: "Hoe stemde de Kamer over eerdere Belastingplannen?",
    kop: `Zo stemde de Kamer over ${p.lijst.length} Belastingplannen`,
    tekst: [
      `${p.alleAangenomen ? `De Kamer nam elk Belastingplan sinds het Belastingplan ${eerder[0].plan} aan.` : ""} De krapste uitslag was tot nu toe ${k.voor} tegen ${k.tegen}, voor het Belastingplan ${k.plan} op ${datumTekst(k.datum)}. ${nuZin}${wijze}`.trim(),
      `${coalitieZin}${nuCoalitie}`,
    ],
    data: `Bron: ${d.plannen!.bron}, opgehaald op ${datumTekst(d.plannen!.opgehaald)}. Eindstemmingen over de wetsvoorstellen met "(Belastingplan JJJJ)" in de titel, zonder amendementen en zonder de andere wetten uit het pakket, ${datumTekst(eerder[0].datum)} tot en met ${datumTekst(nu.datum)}. Het jaartal is dat van het plan; de Kamer stemt in het najaar ervoor. Zetels zoals de Kamer ze per fractie telde${nu.hoofdelijk ? `; bij de hoofdelijke stemming ${nu.tegenFracties ? "de kant van de leden per fractie, met al haar zetels; geen fractie stemde verdeeld en de som klopt met de telling in het besluit" : "de telling uit het besluit"}` : ""}. Coalitie: kabinetspartijen en gedoogpartner op de dag van de stemming. Fractienamen zoals in de open data, ook van afgesplitste leden.`,
  };
}

// Blok 1: wat de Kamer stemde. De zinnen kiezen hun vorm uit de uitslag; twee varianten voor het kader (stemde een
// kabinetspartij tegen het belastingplan of niet), zonder iets te zeggen over wat dat voor het kabinet betekent.
function blokUitslag(d: AkkoordData): Blok | null {
  const am = stemmingVan(d, "amendement"), wet = stemmingVan(d, "wet");
  if (!am || !wet) return null;
  const k = kaderVan(d);
  const deel = (s: UitslagStemming, naam: string) => s.aangenomen
    ? `nam ${naam} aan met ${s.voor} tegen ${s.tegen} zetels`
    : `verwierp ${naam} met ${s.tegen} tegen ${s.voor} zetels`;
  const wetKort = wet.aangenomen === am.aangenomen ? `${wet.aangenomen ? wet.voor : wet.tegen} tegen ${wet.aangenomen ? wet.tegen : wet.voor}` : null;
  const kop = `De Kamer ${deel(am, "het amendement")} en ${wetKort ? `het belastingplan met ${wetKort}` : deel(wet, "het belastingplan")}`;
  const kabTegenAm = d.tegen.filter((a) => stemWoord(am, a) === "Tegen"), kabVoorAm = d.tegen.filter((a) => stemWoord(am, a) === "Voor");
  const kabTegenWet = d.tegen.filter((a) => stemWoord(wet, a) === "Tegen");
  const kabZin = (voor: string[], tegen: string[]) => voor.length === d.tegen.length ? `De kabinetspartijen stemden alle drie voor.`
    : tegen.length === d.tegen.length ? `De kabinetspartijen stemden alle drie tegen.`
    : `Van de kabinetspartijen stemden ${opsomming(voor.map((a) => deNaam(a)))} voor en ${opsomming(tegen.map((a) => deNaam(a)))} tegen.`;
  const kader = kabTegenWet.length === 0 && d.tegen.every((a) => stemWoord(wet, a) === "Voor")
    ? `Alle drie de kabinetspartijen stemden voor het belastingplan. Dat past in de lijn sinds ${k.sinds}: bij geen van de ${k.n} eerdere ${k.wat} stemde een coalitiefractie of gedoogpartner tegen.`
    : kabTegenWet.length === 0
    ? `Niet alle kabinetspartijen stemden. Bij de ${k.n} eerdere ${k.wat} sinds ${k.sinds} stemde geen coalitiefractie of gedoogpartner tegen.`
    : `${opsomming(kabTegenWet.map((a, i) => deNaam(a, i === 0)))} stemde${kabTegenWet.length > 1 ? "n" : ""} tegen het belastingplan. Dat gebeurde sinds ${k.sinds} niet eerder: bij de ${k.n} eerdere ${k.wat} stemde nooit een coalitiefractie of gedoogpartner tegen. Wat het betekent voor het kabinet, staat niet in de data.`;
  const hoofdelijk = [am, wet].some((s) => s.hoofdelijk) ? " Bij een hoofdelijke stemming telt de kant van de leden per fractie, met al haar zetels; de som klopt met de telling in het besluit." : "";
  return {
    id: "uitslag", vraag: "Wat stemde de Kamer?", kop,
    tekst: [
      `Voor het amendement stemden ${opsomming(metStem(am, "Voor"))}, tegen stemden ${opsomming(metStem(am, "Tegen"))}. ${kabZin(kabVoorAm, kabTegenAm)}`,
      `Voor het belastingplan stemden ${opsomming(metStem(wet, "Voor"))}, tegen stemden ${opsomming(metStem(wet, "Tegen"))}. ${kader}`,
    ],
    data: `Uitslag uit de ${d.uitslag!.bron}: amendement ${am.zaak}, wetsvoorstel ${wet.zaak}, zetels per fractie zoals in de stemming.${hoofdelijk} ${plannenVan(d) ? "Eerdere eindstemmingen: zie het blok over de Belastingplannen." : `Eerdere eindstemmingen: wetsvoorstellen met Belastingplan in de dossiertitel, ${datumTekst(d.kader.eerste)} tot en met ${datumTekst(d.kader.laatste)}.`}`,
  };
}

// Kop van het stuk (13 november 2026, na de feitencontrole): het akkoord en, zodra de telling er is, de krapste uitslag
function kopVan(d: AkkoordData) {
  const p = plannenVan(d);
  return p && p.nu.aangenomen && p.marge(p.nu) < p.marge(p.krapste)
    ? `Een akkoord zonder de ${d.kamers.buiten} en het krapste van ${p.lijst.length} Belastingplannen sinds ${p.sinds}`
    : `Een akkoord zonder de ${d.kamers.buiten} over het Belastingplan 2027`;
}

export function akkoordBelastingplan(d: AkkoordData): Stuk & { data: AkkoordData } {
  const [vier, buiten, kab] = [d.kamers.vier, d.kamers.buiten, d.tegen];
  const vierTekst = opsomming(vier), u = d.uitslag, am = stemmingVan(d, "amendement");
  const tk = d.kamers.tk, ek = d.kamers.ek;
  const tkVier = tkSom(d, vier), ekVier = ekSom(d, vier), tkMet = tkSom(d, [...vier, buiten]), ekMet = ekSom(d, [...vier, buiten]);
  const ekMetBbb = ekSom(d, [...vier, "BBB"]);
  // Blok 2
  const paren = d.partners.paren, binnen = d.partners.binnen;
  const [eerste, ...rest] = paren;
  const hoger = kab.map((c) => ({ c, l: hogerDanPartner(d, c) }));
  const overal = hoger[0].l.map((x) => x.afkorting).filter((a) => hoger.every((h) => h.l.some((x) => x.afkorting === a)));
  const overalTekst = overal.map((a) => {
    const w = kab.map((c) => d.partners.perKabinetspartij[c].find((x) => x.afkorting === a)!.cohesie);
    return `${a} met alle drie de kabinetspartijen (${vanTot(w)})`;
  });
  const losTekst = hoger.flatMap((h) => h.l.filter((x) => !overal.includes(x.afkorting)).map((x) => `${x.afkorting} met de ${h.c} (${procent(x.cohesie)})`));
  const hogerZin = overalTekst.length + losTekst.length === 0 ? "Geen andere oppositiefractie koos vaker dezelfde kant als een van de kabinetspartijen."
    : `Nog vaker dezelfde kant kozen ${opsomming([...overalTekst, ...losTekst])}.`;
  const meeP = d.partners.meegaan.fracties.find((f) => f.afkorting === "PRO")!, meeJ = d.partners.meegaan.fracties.find((f) => f.afkorting === "JA21")!;
  // Blok 3
  const nu = buitenVan(d, d.kabinet);
  const anderen = d.buiten.kabinetten.filter((k) => k.kabinet !== d.kabinet);
  const dichtst = [...anderen].sort((a, b) => Math.abs(a.pct - nu.pct) - Math.abs(b.pct - nu.pct))[0];
  const kabNaam = (k: AkkoordData["buiten"]["kabinetten"][number]) => k.gedoog
    ? `${k.kabinet} (met gedoogpartner ${k.partijen.find((p) => p.rol === "gedoogsteun")!.afkorting})`
    : k.kabinet;
  const restKab = anderen.filter((k) => k.kabinet !== dichtst.kabinet);
  const perPartijNu = nu.partijen.map((p, i) => {
    const tegen = kab.filter((a) => a !== p.afkorting);
    const naam = deNaam(p.afkorting, i === 0);
    return `${naam}${i === 0 ? " stond" : ""} ${aantal(p.keer)} keer alleen tegenover ${opsomming(tegen)} (${procent(p.pct)})`;
  });
  const pr = d.buiten.precedent;
  const metGedoog = d.buiten.belastingplan.some((g) => d.buiten.kabinetten.find((k) => k.kabinet === g.kabinet)?.partijen.find((p) => p.afkorting === g.buiten)?.rol === "gedoogsteun");
  const aantalPartijen = (k: AkkoordData["buiten"]["kabinetten"][number]) => k.partijen.length;
  const vierPartijen = anderen.filter((k) => aantalPartijen(k) === 4 && !k.gedoog).map((k) => k.kabinet);
  // Blok 4
  const routes = [...d.kamers.routes].sort((a, b) => (a.zonder === buiten ? -1 : b.zonder === buiten ? 1 : kab.indexOf(a.zonder) - kab.indexOf(b.zonder)));
  const [rBuiten, ...rAnders] = routes;
  const hetCda = (a: string) => (a === "CDA" ? "het CDA" : a);
  // Blok 5
  const t13 = d.toen["2013"], t12 = d.toen["2012"], nuToen = d.toen.nu;
  const sprong = t13.partners.map((a) => verschuiving(t13, a));
  const anderBewoog = Math.max(...t13.anderen.map((a) => Math.abs(verschuiving(t13, a))));
  const p13 = (v: Venster, a: string) => procent(v.fracties.find((f) => f.afkorting === a)!.pct);
  const lijst13 = (v: Venster) => `${t13.partners.slice(0, -1).map((a) => Math.round(v.fracties.find((f) => f.afkorting === a)!.pct!)).join(", ")} en ${p13(v, t13.partners[t13.partners.length - 1])}`;
  const pvv = t12.partij;
  const nuPct = nuToen.fracties.map((f) => f.pct ?? 0);
  const vd = d.buiten.kabinetten.find((k) => k.kabinet === d.kabinet)!;
  const alleenBuiten = vd.partijen.find((p) => p.afkorting === buiten)!, alleenAnder = vd.partijen.find((p) => p.afkorting !== buiten && p.keer === Math.max(...vd.partijen.filter((x) => x.afkorting !== buiten).map((x) => x.keer)))!;

  const blokken: Blok[] = [
    {
      id: "partners", vraag: "Met wie stemmen de kabinetspartijen?",
      kop: `${paarNaam(eerste.kabinetspartij, eerste.partner)} kozen in ${procent(eerste.cohesie)} van de stemmingen dezelfde kant, ongeveer zo vaak als ${rest.map((p) => `${paarNaam(p.kabinetspartij, p.partner)} (${procent(p.cohesie)})`).join(" en ")}`,
      tekst: [
        `Deze partners zijn gekozen, niet gemeten: PRO zit in het akkoord, SGP en JA21 horen bij het blok van JA21, BBB en SGP uit een eerder stuk. Tussen de kabinetspartijen zelf ligt het hoger: het laagste paar, ${paarNaam(binnen[0].a, binnen[0].b)}, koos in ${procent(binnen[0].cohesie)} dezelfde kant, ${binnen.slice(1).map((p) => `${paarNaam(p.a, p.b)} in ${procent(p.cohesie)}`).join(" en ")}.`,
        hogerZin,
        `Met de maat van het stuk over JA21, BBB en SGP: als de drie kabinetspartijen dezelfde kant kozen (${aantal(d.partners.meegaan.basis)} keer), ging PRO in ${procent(meeP.pct)} mee en JA21 in ${procent(meeJ.pct)}.`,
      ],
      data: `Cohesie: het aandeel verdeelde stemmingen onder kabinet-${d.kabinet} waarop beide fracties stemden en dezelfde kant kozen, ongeveer ${aantal(Math.min(...paren.map((p) => p.gezamenlijk)))} per paar. Oppositie: fracties met minstens ${d.partners.minZetels} zetels, zoals in de ranglijst van de site; Volt heeft minder zetels en staat daarom niet in die lijst. PRO: GroenLinks-PvdA en PRO samen, als één lijn.`,
    },
    {
      id: "buiten", vraag: "Hoe vaak staat een kabinetspartij alleen?",
      kop: `Onder ${d.kabinet} stond een kabinetspartij in ${procent(nu.pct)} van de stemmingen alleen, ongeveer zoals onder ${dichtst.kabinet} (${procent(dichtst.pct)})`,
      tekst: [
        `${opsomming(perPartijNu)}. Bij de andere kabinetten sinds ${d.buiten.kabinetten[0].van.slice(0, 4)}: ${opsomming(restKab.map((k) => `${kabNaam(k)} ${procent(k.pct)}`))}.`,
        `Bij een belastingplan gebeurde het eerder. Op ${datumTekst(pr.datum)} nam de Kamer onder ${pr.kabinet} een amendement over ${pr.onderwerp} aan met de andere coalitiepartijen ${opsomming(pr.rest)} voor en de ${pr.buiten} tegen. Sinds ${d.buiten.kabinetten[0].van.slice(0, 4)} werd zo ${d.buiten.belastingplan.length} keer een amendement op een belastingplan aangenomen tegen één ${metGedoog ? "coalitiepartij of de gedoogpartner" : "coalitiepartij"} in.`,
        `Een coalitie van vier partijen heeft vier kansen op een partij die alleen staat, een coalitie van drie partijen drie. ${opsomming(vierPartijen)} begonnen met vier, ${d.kabinet} heeft er ${nu.partijen.length === 3 ? "drie" : aantal(nu.partijen.length)}.`,
      ],
      data: "Alleen staan: op een verdeelde stemming kozen alle andere coalitiepartijen dezelfde kant en deze partij de andere. Een partij die niet stemde, telt niet mee, net als een stem die de Kamer als vergissing heeft aangemerkt. Aandeel van de verdeelde stemmingen met minstens drie partijen in de coalitie, gedoogpartner meegeteld, ook in demissionaire maanden. Rutte II had twee partijen en staat er daarom niet in.",
    },
    {
      id: "kamers", vraag: "Hoeveel zetels?",
      kop: `In de Eerste Kamer hebben ${vierTekst} ${ekVier} van de ${ek.totaal} zetels, ${ek.meerderheid - ekVier} minder dan een meerderheid`,
      tekst: [
        `In de Tweede Kamer hebben de vier ${tkVier} zetels, ${tk.meerderheid - tkVier} te weinig voor een meerderheid; met de ${buiten} erbij ${tkMet}.`,
        `In de Eerste Kamer is de meerderheid ${ek.meerderheid} van de ${ek.totaal}. De vier hebben er ${ekVier} en hebben dus steun van buiten nodig: met de ${buiten} (${ek.zetels[buiten]}) komen ze op ${ekMet}, met BBB (${ek.zetels.BBB}) op ${ekMetBbb}, en met een combinatie van kleinere fracties kan het ook. Dit is een rekensom op zetels: Zetelen heeft geen stemmingen van de Eerste Kamer, en daar stemt niet elke fractie als blok.`,
        `De hechtste meerderheid in de Tweede Kamer zonder de ${buiten} telt ${rBuiten.start.length + rBuiten.extra.length} fracties en ${rBuiten.tk} zetels, en stemde in ${procent(rBuiten.pct)} van de stemmingen eensgezind. Zonder ${rAnders.map((r) => `${hetCda(r.zonder)} is dat ${procent(r.pct)}`).join(", zonder ")}. De drie kabinetspartijen samen: ${procent(d.kamers.kabinet.pct)}.`,
      ],
      data: `Tweede Kamer: zetels in de zaal onder kabinet-${d.kabinet}, meerderheid ${tk.meerderheid} van de 150. Eerste Kamer: ${ek.bron}, geraadpleegd op ${datumTekst(ek.geraadpleegd)}, meerderheid ${ek.meerderheid} van de ${ek.totaal}. Hechtste meerderheid: van alle combinaties met minstens ${tk.meerderheid} zetels zonder een fractie die gemist kan worden, die met het hoogste aandeel eensgezinde stemmingen.`,
    },
    {
      id: "toen", vraag: "Wat deed een akkoord eerder?",
      kop: `Na het begrotingsakkoord van ${t13.akkoord.slice(0, 4)} gingen ${opsomming(t13.partners)} het jaar erna ${Math.round(Math.min(...sprong))} tot ${Math.round(Math.max(...sprong))} procentpunt vaker mee met het kabinet`,
      tekst: [
        `Op ${datumTekst(t13.akkoord)} sloten ${opsomming(t13.ref)} (kabinet-${t13.kabinet}) een begrotingsakkoord met ${opsomming(t13.partners)}. Tot dan gingen die drie in ${lijst13(t13.voor)} van de stemmingen mee met het eensgezinde kabinet, in het jaar erna in ${lijst13(t13.na)}. De andere oppositiepartijen bewogen hooguit ${Math.round(anderBewoog)} procentpunt.`,
        `In ${t12.akkoord.slice(0, 4)} ging het andersom. De gedoogsteun van de ${pvv} hield op en ${opsomming(t12.ref)} sloten het Lenteakkoord met ${opsomming(t12.partners)}. De ${pvv} ging daarna in ${p13(t12.na, pvv)} mee met het kabinet, tegen ${p13(t12.voor, pvv)} ervoor. Het kabinet was toen demissionair.`,
        `Nu gaan PRO en Volt in ${nuPct.map((p) => Math.round(p)).join(" en ")}% mee met het eensgezinde kabinet. Of dat na dit akkoord ook gebeurt, zie je over een half jaar in de lijn.`,
      ],
      data: `Mee: op verdeelde stemmingen waarop de kabinetspartijen allemaal dezelfde kant kozen, hoe vaak de fractie dezelfde kant koos; alleen stemmingen waarop ze zelf stemde. ${t13.akkoord.slice(0, 4)}: ${datumTekst(t13.voor.van)} tot en met ${datumTekst(t13.voor.tot)} tegenover ${datumTekst(t13.na.van)} tot en met ${datumTekst(t13.na.tot)}. ${t12.akkoord.slice(0, 4)}: tot en met ${datumTekst(t12.voor.tot)} tegenover ${datumTekst(t12.na.van)} tot ${datumTekst(t12.na.tot)}. Of het akkoord de oorzaak was, laten de cijfers niet zien: de agenda verschilt per periode.`,
    },
  ];
  const b1 = blokUitslag(d), bp = blokPlannen(d), pl = plannenVan(d);
  const kd = kaderVan(d);

  return {
    slug: d.slug, datum: u ? u.opgehaald : d.gemaakt, label: "Actueel · Belastingplan 2027",
    kop: kopVan(d),
    beschrijving: `D66 en CDA sloten een akkoord met PRO en Volt over een amendement op het belastingplan, zonder de VVD. Met wie stemmen de kabinetspartijen, hoe vaak staat er één alleen, en wat tellen de zetels in beide Kamers?`,
    ziet: `Hoe de drie kabinetspartijen en de partijen van het akkoord stemden onder kabinet-${d.kabinet} tot en met ${datumTekst(d.stand)}${am ? `, de uitslag van ${datumTekst(am.datum)}` : ""}, eerdere kabinetten sinds ${d.buiten.kabinetten[0].van.slice(0, 4)}${pl ? ` en de eindstemmingen over de Belastingplannen sinds ${pl.sinds}` : ""}.`,
    opvalt: `${pl && pl.marge(pl.nu) < pl.marge(pl.krapste) ? `Het Belastingplan ${pl.nu.plan} ging met ${pl.nu.voor} tegen ${pl.nu.tegen}, de krapste uitslag van de ${pl.lijst.length} Belastingplannen sinds ${pl.sinds}. ` : ""}In de Eerste Kamer hebben ${vierTekst} ${ekVier} van de ${ek.totaal} zetels, ${ek.meerderheid - ekVier} minder dan een meerderheid.`,
    // Lezing links (13 november 2026, Niels): indiener PRO, mede-indiener Volt (OData ZaakActor 2026Z24909); de afspraak
    // van D66 en CDA: NOS 2639001 en Hart van Nederland; het ontraden: OData Kabinetsappreciatie en NOS 2639200.
    // Bronnen van de aanleiding: NOS, 11 november 2026 (artikel 2639001 en liveblog 2639007); zie akkoord-1 in de scratchpad
    // van 11 november. Het akkoord gaat over één amendement, niet over het hele belastingplan.
    aanleiding: `Op 11 november 2026 sloten D66 en CDA een akkoord met PRO en Volt over één amendement op het Belastingplan 2027: een afgezwakte versie van wat PRO en Volt de "miljonairsbelasting" noemen. De ${buiten} zat er niet bij (NOS, 11 november 2026: nos.nl/artikel/2639001 en nos.nl/liveblog/2639007). PRO en Volt wilden het belastingplan alleen steunen als hun voorstel werd aangenomen (Hart van Nederland, 12 november 2026: hartvannederland.nl/politiek/debat/artikelen/vvd-tegen-belastingplan-voorstel-pro-volt-coalitiecrisis). ${am ? `De Tweede Kamer stemde op ${datumTekst(am.datum)} over beide.` : pl && pl.nu.plan === "2027" ? `De Tweede Kamer stemde op ${datumTekst(pl.nu.datum)} over het belastingplan; hoe elke fractie stemde, staat nog niet in de open data.` : "De Tweede Kamer moet er nog over stemmen."} Dit stuk zet de uitslag naast hoe deze partijen tot nu toe stemden.`,
    blokken: [...(b1 ? [b1] : []), ...(bp ? [bp] : []), ...blokken],
    lezingen: {
      links: { titel: "Per onderwerp een andere meerderheid", tekst: `Onder ${d.kabinet} stonden ${opsomming(kab.filter((a) => a !== buiten))} ${aantal(alleenBuiten.keer)} keer samen tegenover de ${buiten}, en ${opsomming(kab.filter((a) => a !== alleenAnder.afkorting))} ${aantal(alleenAnder.keer)} keer tegenover ${alleenAnder.afkorting}. D66 en CDA maakten een afspraak met PRO en Volt over dit amendement. PRO en Volt dienden het in. Het kabinet ontried het.` },
      rechts: { titel: `Een kabinetspartij buiten het akkoord`, tekst: `Bij de ${kd.n} eerdere ${kd.wat} sinds ${kd.sinds} stemde geen coalitiefractie of gedoogpartner tegen. In de Eerste Kamer hebben ${vierTekst} ${ekVier} van de ${ek.totaal} zetels; voor een meerderheid van ${ek.meerderheid} is ook daar steun van buiten de vier nodig.` },
    },
    slot: `In de Tweede Kamer hebben de vier ${tkVier} zetels en in de Eerste Kamer ${ekVier}, in beide Kamers minder dan een meerderheid. Of PRO en Volt na dit akkoord vaker meestemmen met het kabinet, zie je over een half jaar in de lijn.`,
    data: d,
    bouwer: { fracties: vier, tekst: "deze vier in de coalitiebouwer" },
  };
}

export const AKKOORD_BELASTINGPLAN = akkoordBelastingplan(akkoordBelastingplanJson as unknown as AkkoordData);

// Stuk 4 (13 november 2026): hoe vaak stond één kabinetspartij per maand alleen, en is er zonder de VVD een meerderheid
// die ook samen stemde? Bouwt voort op akkoord-belastingplan (de aanleiding verwijst ernaar): een paar benoemde groepen,
// en ter vergelijking de hechtste meerderheid zonder de VVD uit blok "kamers" daar (feitencontrole 13 november). Cijfers uit
// pipeline/coalitie_verdeeld.py; "alleen staan" is daar dezelfde functie als in blok "buiten", per maand gefilterd.
type Groep = { fracties: string[]; tk: number; ek: number; laagstePaar: null | ({ a: string; b: string } & Cohesie) } & Kans;
export type Maand = { maand: string; van: string | null; tot: string | null; verdeeld: number; alleen: Record<string, number>; eensgezind: number };
export type GroepNaam = "kabinet" | "kabinetSteun" | "zonder" | "zonderSteun" | "zonderAkkoord" | "zonderBeide";
export type VerdeeldData = {
  slug: string; soort: "verdeeld"; kabinet: string; begin: string; buiten: string; groep: string[]; tegen: string[];
  steun: string[]; partners: string[]; stand: string; gemaakt: string; besluiten: number; verdeeld: number;
  maanden: Maand[];
  totaal: { verdeeld: number; alleen: Record<string, number>; won: Record<string, number> };
  // Dezelfde telling tot en met de stand van akkoord-belastingplan, om de twee stukken naast elkaar te leggen
  controle: { stuk: string; stand: string; verdeeld: number; alleen: Record<string, number> };
  zonder: {
    tk: { meerderheid: number; zetels: Record<string, number> };
    ek: { bron: string; geraadpleegd: string; zetels: Record<string, number>; eenmansfracties: number; meerderheid: number; totaal: number };
    groepen: Record<GroepNaam, Groep>;
  };
};
export const isVerdeeld = (d: Stuk["data"]): d is VerdeeldData => (d as VerdeeldData).soort === "verdeeld";

export const maandTekst = (m: string) => `${MAANDEN[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`;
const KORT = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
export const maandKort = (m: string) => `${KORT[Number(m.slice(5, 7)) - 1]} ${m.slice(2, 4)}`;
// Aandeel van de verdeelde stemmingen in een maand waarop de partij alleen stond; null in een maand zonder stemmingen
export const maandPct = (m: Maand, a: string) => (m.verdeeld ? (100 * m.alleen[a]) / m.verdeeld : null);
export const metStemmingen = (d: VerdeeldData) => d.maanden.filter((m) => m.verdeeld > 0);
// Het bereik per maand telt alleen maanden met minstens MIN_MAAND verdeelde stemmingen (feitencontrole 13 november
// 2026: februari had er 43, op één stemdag, en bepaalde anders de bovengrens)
export const MIN_MAAND = 100;
export const bereik = (d: VerdeeldData, a: string) => {
  const p = metStemmingen(d).filter((m) => m.verdeeld >= MIN_MAAND).map((m) => maandPct(m, a)!);
  return { min: Math.min(...p), max: Math.max(...p) };
};
// Schaal van de maandgrafiek: het hoogste maandaandeel, naar boven afgerond op 5 procent
export const schaalMaanden = (d: VerdeeldData) =>
  Math.ceil(Math.max(...d.maanden.flatMap((m) => d.tegen.map((x) => maandPct(m, x) ?? 0))) / 5) * 5;
// Korte naam van een groep in de grafiek en het plaatje
export const groepNaam = (d: VerdeeldData, n: GroepNaam) => {
  const kort = (l: string[]) => l.map((x) => x.replace(/^Groep /, "Gr. ")).join(", ");
  return { kabinet: `Kabinet: ${kort(d.tegen)}`, kabinetSteun: `Kabinet + ${kort(d.steun)}`, zonder: kort(d.groep),
    zonderAkkoord: `${kort(d.groep)} + ${kort(d.partners)}`, zonderSteun: `${kort(d.groep)} + ${kort(d.steun)}`,
    zonderBeide: `${kort(d.groep)} + ${kort([...d.partners, ...d.steun])}` }[n];
};
// De kabinetspartijen buiten de VVD, op volgorde van hoe vaak ze alleen stonden (D66, dan CDA)
export const anderen = (d: VerdeeldData) => d.tegen.filter((a) => a !== d.buiten).sort((a, b) => d.totaal.alleen[b] - d.totaal.alleen[a]);
// Link naar de coalitiebouwer met de snelkeuze "Kabinet zonder VVD"
export const zonderLink = (d: VerdeeldData) => `/coalitie?soort=kabinet&periode=${encodeURIComponent(d.kabinet)}&groep=${d.groep.map(encodeURIComponent).join(",")}`;
// Waar de som tot de stand van akkoord-belastingplan afwijkt van blok "buiten" daar: alleen door een bijgewerkte bron
export const afwijkingAkkoord = (d: VerdeeldData, ak: AkkoordData) => {
  const j = buitenVan(ak, d.kabinet);
  return d.tegen.flatMap((a) => {
    const daar = j.partijen.find((p) => p.afkorting === a)!.keer;
    return daar === d.controle.alleen[a] ? [] : [{ afkorting: a, hier: d.controle.alleen[a], daar }];
  });
};
// Stond de VVD over de hele periode vaker alleen dan D66? Binnen 1 procentpunt van de verdeelde stemmingen: "ongeveer even vaak"
export const vergelijking = (d: VerdeeldData) => {
  const [ander] = anderen(d), t = d.totaal;
  const verschil = (100 * (t.alleen[d.buiten] - t.alleen[ander])) / t.verdeeld;
  return Math.abs(verschil) < 1 ? "ongeveer even vaak alleen als" : verschil > 0 ? "vaker alleen dan" : "minder vaak alleen dan";
};
const hoofd = (t: string) => t[0].toUpperCase() + t.slice(1);
const WOORD = ["nul", "één", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien"];
const woord = (n: number) => WOORD[n] ?? aantal(n);
// "de Groep Markuszower" in een opsomming, zoals in het stuk over het kabinet met ChristenUnie en 50PLUS
const metDe = (a: string) => (a.startsWith("Groep ") ? `de ${a}` : a);
const lijstMetDe = (l: string[]) => opsomming(l.map(metDe));

function blokMaanden(d: VerdeeldData, ak: AkkoordData): Blok {
  const B = d.buiten, [ander, derde] = anderen(d), t = d.totaal;
  const mnd = metStemmingen(d), leeg = d.maanden.filter((m) => m.verdeeld === 0);
  const eerste = d.maanden[0], laatste = d.maanden[d.maanden.length - 1];
  const vanTotPct = (b: { min: number; max: number }) => `${Math.round(b.min)} tot ${procent(b.max)}`;
  const vergelijk = vergelijking(d);
  const vaker = mnd.filter((m) => m.alleen[B] > m.alleen[ander]).length, minder = mnd.filter((m) => m.alleen[B] < m.alleen[ander]).length;
  const even = mnd.length - vaker - minder;
  const kleinst = [...mnd].sort((x, y) => x.verdeeld - y.verdeeld)[0], grootst = [...mnd].sort((x, y) => y.verdeeld - x.verdeeld)[0];
  const tegenover = (a: string) => opsomming(d.tegen.filter((x) => x !== a));
  const reces = leeg.length
    ? ` In ${opsomming(leeg.map((m) => maandTekst(m.maand)))} was er geen stemming${leeg.every((m) => ["07", "08"].includes(m.maand.slice(5, 7))) ? " (zomerreces)" : ""}.` : "";
  const af = afwijkingAkkoord(d, ak), c = d.controle;
  const controleZin = af.length === 0
    ? `Tot en met ${datumTekst(c.stand)}, de stand van het stuk over het Belastingplan, zijn de aantallen gelijk aan blok "alleen staan" daar.`
    : `Tot en met ${datumTekst(c.stand)}, de stand van het stuk over het Belastingplan, telt dit stuk ${opsomming(af.map((x) => `${deNaam(x.afkorting)} ${aantal(x.hier)} keer in plaats van ${aantal(x.daar)}`))}: de bron is sindsdien bijgewerkt.`;
  return {
    id: "maanden", vraag: "Hoe vaak stemde de coalitie verdeeld?",
    kop: `Sinds ${maandTekst(eerste.maand)} stond ${deNaam(B)} ${vergelijk} ${ander}, per maand in ${vanTotPct(bereik(d, B))} van de verdeelde stemmingen`,
    tekst: [
      `Op ${aantal(t.verdeeld)} verdeelde stemmingen tot en met ${datumTekst(d.stand)} stond ${deNaam(B)} ${aantal(t.alleen[B])} keer alleen tegenover ${tegenover(B)}: die twee stemden allebei en kozen dezelfde kant, ${deNaam(B)} de andere. ${ander} stond ${aantal(t.alleen[ander])} keer alleen tegenover ${tegenover(ander)}, ${deNaam(derde)} ${aantal(t.alleen[derde])} keer.`,
      `Per maand stond ${ander} in ${vanTotPct(bereik(d, ander))} van de verdeelde stemmingen alleen, ${deNaam(derde)} in ${vanTotPct(bereik(d, derde))}. In ${vaker} van de ${mnd.length} maanden met stemmingen stond ${deNaam(B)} vaker alleen dan ${ander}, in ${minder} minder vaak${even ? `, in ${even} even vaak` : ""}.`,
      `Een maand is een kleine eenheid: ${maandTekst(kleinst.maand)} telde ${aantal(kleinst.verdeeld)} verdeelde stemmingen, ${maandTekst(grootst.maand)} ${aantal(grootst.verdeeld)}. In de kleinste maand verschuift één stemming het aandeel al ${(100 / kleinst.verdeeld).toLocaleString("nl-NL", { maximumFractionDigits: 1 })} procentpunt.${reces} ${hoofd(maandTekst(laatste.maand))} loopt tot en met ${datumTekst(d.stand)}.`,
    ],
    data: `Alleen staan: op een verdeelde stemming stemden de twee andere kabinetspartijen allebei voor of allebei tegen en kozen ze dezelfde kant, en koos deze partij de andere kant. Een partij die niet stemde, telt niet mee, net als een stem die de Kamer als vergissing heeft aangemerkt. Noemer: alle verdeelde stemmingen in de maand (minstens één fractie voor en één tegen). Het bereik per maand in de kop en de tekst telt alleen maanden met minstens ${MIN_MAAND} verdeelde stemmingen${metStemmingen(d).some((m) => m.verdeeld < MIN_MAAND) ? ` (niet: ${opsomming(metStemmingen(d).filter((m) => m.verdeeld < MIN_MAAND).map((m) => maandTekst(m.maand)))})` : ""}; de grafiek toont alle maanden. Kalendermaanden op de datum van de stemming, vanaf ${datumTekst(d.begin)}, de start van kabinet-${d.kabinet}. Dezelfde telling als "alleen staan" in het stuk over het Belastingplan, nu per maand. ${controleZin}`,
  };
}

function blokZonder(d: VerdeeldData, ak: AkkoordData): Blok {
  const B = d.buiten, z = d.zonder, g = z.groepen;
  const zb = g.zonderBeide, n = zb.fracties.length, lp = zb.laagstePaar!;
  const geenEk = zb.fracties.filter((a) => !z.ek.zetels[a]);
  const hechtst = ak.kamers.routes.find((r) => r.zonder === B);
  // De stemming over het Belastingplan (blok 1 van akkoord-belastingplan), zodra die per fractie in de data staat
  const wet = stemmingVan(ak, "wet");
  const steunVoor = wet ? d.steun.filter((x) => stemWoord(wet, x) === "Voor") : [], steunTegen = wet ? d.steun.filter((x) => stemWoord(wet, x) === "Tegen") : [];
  const planZin = !wet ? ": hoe elke fractie daar stemde, staat nog niet in de open data"
    : `. Daar stemden ${opsomming(metStem(wet, "Voor"))} voor (${wet.voor} zetels)${steunTegen.length ? `; van de drie stemde${steunVoor.length > 1 ? "n" : ""} ${lijstMetDe(steunVoor)} voor en ${lijstMetDe(steunTegen)} tegen` : ""}`;
  return {
    id: "zonder", vraag: `Is er een meerderheid zonder de ${B}?`,
    kop: `Zonder de ${B} hebben ${opsomming(d.groep)} ${g.zonder.tk} zetels, met ${opsomming(d.partners)} ${g.zonderAkkoord.tk}, alle ${woord(n)} samen ${zb.tk}; een meerderheid is ${z.tk.meerderheid}`,
    tekst: [
      `${opsomming(d.groep)} hebben samen ${g.zonder.tk} zetels in de Tweede Kamer. Met ${opsomming(d.partners)}, de partners van het akkoord over het Belastingplan, komen ze op ${g.zonderAkkoord.tk}; met ${lijstMetDe(d.steun)} op ${g.zonderSteun.tk}; dat zijn de drie fracties uit het stuk over het kabinet met ChristenUnie en 50PLUS. Met ChristenUnie en 50PLUS sprak het kabinet eind oktober, zonder afspraak; met de Groep Markuszower sprak de minister van Financiën die week apart (NOS, 29 oktober 2026: nos.nl/artikel/2637182). Alle ${woord(n)} samen hebben er ${zb.tk}; een meerderheid is ${z.tk.meerderheid}. Deze groepen zijn gekozen, niet afgeleid uit de stemming over het Belastingplan${planZin}.`,
      `Hoe vaak stemden die groepen eensgezind? ${opsomming(d.groep)} in ${procent(g.zonder.pct)} van de verdeelde stemmingen, met ${opsomming(d.partners)} in ${procent(g.zonderAkkoord.pct)}, met ${lijstMetDe(d.steun)} in ${procent(g.zonderSteun.pct)}, alle ${woord(n)} in ${procent(zb.pct)}. Het kabinet van ${opsomming(d.tegen)} stemde in ${procent(g.kabinet.pct)} eensgezind, met ${lijstMetDe(d.steun)} erbij in ${procent(g.kabinetSteun.pct)}. Binnen de groep van ${woord(n)} kozen ${metDe(lp.a)} en ${metDe(lp.b)} het minst vaak dezelfde kant: in ${procent(lp.cohesie)} van hun gezamenlijke verdeelde stemmingen.${hechtst ? ` De meerderheid zonder ${deNaam(B)} die over alle fracties het vaakst eensgezind stemde, uit het stuk over het Belastingplan, is ${opsomming(hechtst.start)} met ${opsomming(hechtst.extra)}: ${woord(hechtst.start.length + hechtst.extra.length)} fracties, ${hechtst.tk} zetels, in ${procent(hechtst.pct)} eensgezind.` : ""}`,
      `In de Eerste Kamer hebben de ${woord(n)} ${zb.ek} van de ${z.ek.totaal} zetels; een meerderheid is ${z.ek.meerderheid}.${geenEk.length ? ` ${lijstMetDe(geenEk).replace(/^de /, "De ")} ${geenEk.length > 1 ? "hebben" : "heeft"} daar geen zetels.` : ""} Dit is een rekensom op zetels: Zetelen heeft geen stemmingen van de Eerste Kamer.`,
    ],
    data: `Eensgezind: op een verdeelde stemming stemden alle fracties uit de groep voor of tegen en kozen ze dezelfde kant; alleen stemmingen waarop alle fracties uit de groep stemden. Paar: cohesie zoals op de rest van de site, op verdeelde stemmingen waarop beide stemden. Tweede Kamer: zetels in de zaal onder kabinet-${d.kabinet}, meerderheid ${z.tk.meerderheid} van de 150. Eerste Kamer: ${z.ek.bron}, geraadpleegd op ${datumTekst(z.ek.geraadpleegd)}, meerderheid ${z.ek.meerderheid} van de ${z.ek.totaal}. PRO: GroenLinks-PvdA en PRO samen, als één lijn. Welke meerderheid zonder de ${B} over alle fracties het vaakst eensgezind stemde, staat in het stuk over het Belastingplan.${wet ? ` Stemming over het Belastingplan: wetsvoorstel ${wet.zaak}, ${datumTekst(wet.datum)}, ${ak.uitslag!.bron}.` : ""}`,
  };
}

export function coalitieVerdeeld(d: VerdeeldData, ak: AkkoordData): Stuk & { data: VerdeeldData } {
  const B = d.buiten, [ander] = anderen(d), t = d.totaal, zb = d.zonder.groepen.zonderBeide;
  const pl = plannenVan(ak), wet = stemmingVan(ak, "wet");
  const nu = pl?.nu;
  const vvdStem = wet && nu && wet.zaak === nu.zaak ? stemWoord(wet, B) : nu?.coalitieTegen ? (nu.coalitieTegen.includes(B) ? "Tegen" : "Voor") : undefined;
  const uitslag = nu
    ? `Het Belastingplan ${nu.plan} ging op ${datumTekst(nu.datum)} met ${nu.voor} tegen ${nu.tegen} door de Tweede Kamer.${vvdStem ? ` ${deNaam(B, true)} stemde ${vvdStem === "Tegen" ? "tegen" : "voor"}.` : ""} `
    : "";
  const bm = blokMaanden(d, ak), bz = blokZonder(d, ak);
  return {
    slug: d.slug, datum: d.gemaakt, label: `Actueel · Kabinet-${d.kabinet}`,
    kop: `Sinds ${maandTekst(d.maanden[0].maand)} stond ${deNaam(B)} ${vergelijking(d)} ${ander}`,
    beschrijving: `Per maand hoe vaak ${deNaam(B)} de andere kant koos dan ${opsomming(d.groep)}, en of er zonder ${deNaam(B)} een meerderheid is die ook samen stemde.`,
    ziet: `Per maand hoe vaak één kabinetspartij de andere kant koos dan de twee andere, en hoe vaak groepen zonder ${deNaam(B)} eensgezind stemden, onder kabinet-${d.kabinet} tot en met ${datumTekst(d.stand)}.`,
    opvalt: `${deNaam(B, true)} stond per maand in ${Math.round(bereik(d, B).min)} tot ${procent(bereik(d, B).max)} van de verdeelde stemmingen alleen, ${ander} in ${Math.round(bereik(d, ander).min)} tot ${procent(bereik(d, ander).max)}. Zonder ${deNaam(B)} hebben ${opsomming(d.groep)} ${d.zonder.groepen.zonder.tk} zetels; ze stemden in ${procent(d.zonder.groepen.zonder.pct)} van de verdeelde stemmingen eensgezind.`,
    // Het stuk over het Belastingplan staat er al: de uitslag, de 19 Belastingplannen, de partners, alleen staan, de
    // zetels en toen. Dit stuk herhaalt dat niet en verwijst ernaar (link onder de aanleiding).
    aanleiding: `${uitslag}Het stuk over het Belastingplan zet die uitslag naast de eerdere Belastingplannen, de partners van de kabinetspartijen in de oppositie, hoe vaak één kabinetspartij alleen stond, de zetels in beide Kamers en wat een akkoord eerder deed. Dit stuk gaat op twee vragen verder: hoe vaak stond één kabinetspartij per maand alleen, en is er zonder ${deNaam(B)} een meerderheid die in de praktijk ook samen stemde?`,
    verwijzing: { href: `/actueel/${ak.slug}`, tekst: "Lees eerst het stuk over het Belastingplan" },
    blokken: [bm, bz],
    slot: `De cijfers laten zien hoe er gestemd is: ${deNaam(B)} stond ${aantal(t.alleen[B])} keer alleen tegenover ${opsomming(d.groep)}, ${ander} ${aantal(t.alleen[ander])} keer tegenover de twee andere. Of het kabinet valt, voorspellen ze niet.`,
    data: d,
    bouwer: { fracties: d.groep, tekst: `${opsomming(d.groep)} zonder ${deNaam(B)} in de coalitiebouwer` },
  };
}

export const COALITIE_VERDEELD = coalitieVerdeeld(coalitieVerdeeldJson as unknown as VerdeeldData, akkoordBelastingplanJson as unknown as AkkoordData);

// Pas op de site als de uitslag in de data staat (pipeline/akkoord_belastingplan.py uitslag). Op een preview van Vercel
// staat het er al eerder, zodat Niels het kan lezen voordat het live gaat. Coalitie-verdeeld verwijst naar dat stuk en
// staat er daarom precies tegelijk.
const AKKOORD_ZICHTBAAR = !!(akkoordBelastingplanJson as unknown as AkkoordData).uitslag || process.env.VERCEL_ENV === "preview";

export const STUKKEN: Stuk[] = [
  blokTegenKabinet(blokKabinet as ActueelData), kabinetMetSteun(kabinetCu50Plus as ActueelData),
  ...(AKKOORD_ZICHTBAAR ? [AKKOORD_BELASTINGPLAN, COALITIE_VERDEELD] : []),
];
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

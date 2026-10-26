// De lijst op /uitgelicht: de zes casussen uit lib/uitgelicht.ts plus de motie-Eerdmans als zevende. Die heeft
// zijn eigen, al goedgekeurde stappen (lib/stemmingVerhaal.ts, ook op /onderwerpen) en dezelfde gegevens.
// Apart van lib/uitgelicht.ts, omdat stemmingVerhaal.ts met het @-pad importeert en vitest dat niet kent.
import type { Verhaal } from "./verhaal";
import { CASUSSEN, casusStappen, hoogteSmal, uitslagKort } from "./uitgelicht";
import { stemVerhaal, stemming } from "./stemmingVerhaal";

export type Uitgelicht = {
  slug: string; titel: string; vraag: string; zaak: string; datums: string[]; uitslag: string; besluitTekst: string[];
  onderwerp: string; verhaal: () => Verhaal; hoogteSmal: number;
};

export const UITGELICHT: Uitgelicht[] = [
  ...CASUSSEN.map((c) => ({
    slug: c.slug, titel: c.titel, vraag: c.vraag, zaak: c.data.zaak,
    datums: c.data.besluiten.map((b) => b.datum), uitslag: uitslagKort(c),
    besluitTekst: c.data.besluiten.map((b) => b.besluitTekst ?? ""), onderwerp: c.data.onderwerp ?? "",
    verhaal: () => ({ breed: casusStappen(c, false), smal: casusStappen(c, true) }), hoogteSmal: hoogteSmal(c),
  })),
  {
    slug: "motie-eerdmans", titel: "Het asielplan uitwerken", vraag: "Wie stemt voor het uitwerken van het asielplan?", zaak: stemming.zaak,
    datums: [stemming.datum], uitslag: stemming.uitslag.replace(/ \((\d+-\d+)\)/, ", $1").toLowerCase(), besluitTekst: [stemming.uitslag], onderwerp: stemming.onderwerp,
    verhaal: () => ({ breed: stemVerhaal(false), smal: stemVerhaal(true) }), hoogteSmal: 1080,
  },
].sort((a, b) => a.datums[0].localeCompare(b.datums[0]));

// Alle keuzes voor de kiezer bovenaan Uitgelicht: de stemmingen en de pagina's in hetzelfde format
export const KIEZER = [
  ...UITGELICHT.map((c) => ({ slug: c.slug, titel: c.titel, jaar: c.datums[0].slice(0, 4) })),
  { slug: "hoe-lang-duurt-een-wet", titel: "Hoe lang duurt een wet?", jaar: "2010 tot nu" },
  { slug: "tegen-het-advies-in", titel: "Tegen het advies in", jaar: "2019 tot nu" },
];

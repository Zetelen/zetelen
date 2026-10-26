// Gegevens voor de video's: de casussen van /uitgelicht en de motie-Eerdmans, uit dezelfde bestanden als de site.
// Rekenfuncties (zaal, tinten, stem per fractie, kabinet op een datum) komen uit web/lib, zodat site en video gelijk tellen.
import eerdmans from "../../web/content/verhaal-stemming.json";
import { CASUSSEN, type Besluit, kabinetOp, perFractie, totalen, vergissingen, verdeeld } from "../../web/lib/uitgelicht";
import { KORT, type Stemming, stemZaal, tinten } from "../../web/lib/verhaal";

export type VideoCasus = {
  slug: string;
  titel: string;
  vraag: string;
  omschrijving: string;
  zaak: string;
  soort: string;
  besluiten: Besluit[];
};

export const CASUS_LIJST: VideoCasus[] = [
  ...CASUSSEN.map((c) => ({
    slug: c.slug, titel: c.titel, vraag: c.vraag, omschrijving: c.omschrijving, zaak: c.data.zaak, soort: c.data.soort ?? "Stemming", besluiten: c.data.besluiten,
  })),
  {
    slug: "motie-eerdmans", titel: "Het asielplan uitwerken", vraag: "Wie stemt voor het uitwerken van het asielplan?", zaak: eerdmans.zaak, soort: "Motie",
    omschrijving: "Een week na de val van kabinet-Schoof stemt de Kamer over een motie: werk het asielplan uit en voer het waar mogelijk uit.",
    besluiten: [{
      datum: eerdmans.datum, besluitSoort: "Stemmen - verworpen", besluitTekst: eerdmans.uitslag, stemmen: eerdmans.stemmen as Stemming,
      // De tegenstem van één VVD-Kamerlid staat in de bron als vergissing (gevonden 26 oktober 2026)
      vergissingen: { Tegen: { VVD: 1 } },
    } as unknown as Besluit],
  },
];

export const casus = (slug: string): VideoCasus => {
  const c = CASUS_LIJST.find((x) => x.slug === slug);
  if (!c) throw new Error(`Onbekende casus: ${slug}`);
  return c;
};

export const naam = (f: string) => KORT[f] ?? f;
export const lijstTekst = (l: string[]) => (l.length < 2 ? l.join("") : `${l.slice(0, -1).join(", ")} en ${l[l.length - 1]}`);

export function datumTekst(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

// Zetels per fractie in deze stemming (voor, tegen en niet deelgenomen samen)
export function zetelsPer(st: Stemming): Record<string, number> {
  const uit: Record<string, number> = {};
  for (const soort of Object.values(st)) for (const [f, n] of Object.entries(soort)) uit[f] = (uit[f] ?? 0) + n;
  return uit;
}

export const tintenVan = (st: Stemming) => tinten([zetelsPer(st)]);

// De zaal van een stemming in videocoördinaten: dezelfde opstelling als op de site, groter en lager in beeld
export type Punt = { key: string; fractie: string; stem: string; x: number; y: number };
export function zaalPunten(st: Stemming, middenY = 1060, schaal = 1.12): Punt[] {
  return stemZaal(st).map((z) => ({ key: z.key, fractie: z.fractie, stem: z.stem, x: 540 + (z.x - 500) * schaal, y: middenY + (z.y - 455) * schaal }));
}

// De uitslag in één woord, uit BesluitSoort
export function uitslagWoord(b: Besluit): string {
  const s = (b.besluitSoort ?? "").toLowerCase();
  if (s.includes("gestaakt")) return "Gestaakt";
  if (s.includes("niet aangenomen")) return "Niet aangenomen";
  if (s.includes("verworpen")) return "Verworpen";
  if (s.includes("aangenomen")) return "Aangenomen";
  return "";
}

export { type Besluit, kabinetOp, perFractie, totalen, vergissingen, verdeeld };

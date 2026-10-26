// Cohesie per beleidsterrein (component onderwerpen, hoofdstuk 3 van het verhaal), uit api.cohesie_terrein
// en api.beleidsterrein_periode. Zelfde definitie en drempel als de gewone cohesie.
import { leesApi } from "./api";
import type { Periodesoort, Variant } from "./cohesie";
import type { Paar } from "./zaal";

export type TerreinPaar = Paar & { terrein: string };
// Onder dit aantal gezamenlijke stemmingen telt een terrein niet mee in de koppen en staat het onderaan
export const MINIMUM_UITERSTEN = 50;

// Per beleidsterrein: de cohesie van een fractie met elke andere fractie
export async function cohesiePerTerrein(soort: Periodesoort, periode: string, variant: Variant, fractie: string): Promise<Map<string, Map<string, Paar>> | null> {
  const rijen = await leesApi<Array<{ beleidsterrein: string; andere_fractie: string; cohesie: number | null; gezamenlijk: number; te_weinig_data: boolean }>>(
    `cohesie_terrein?select=beleidsterrein,andere_fractie,cohesie,gezamenlijk,te_weinig_data&limit=1000` +
      `&periodesoort=eq.${soort}&periode=eq.${encodeURIComponent(periode)}&variant=eq.${variant}&fractie=eq.${fractie}`,
  );
  if (!rijen) return null;
  const uit = new Map<string, Map<string, Paar>>();
  for (const r of rijen) {
    const m = uit.get(r.beleidsterrein) ?? new Map<string, Paar>();
    m.set(r.andere_fractie, { cohesie: r.cohesie == null ? null : Number(r.cohesie), gezamenlijk: r.gezamenlijk, teWeinig: r.te_weinig_data });
    uit.set(r.beleidsterrein, m);
  }
  return uit;
}

// Aantal stemmingen per beleidsterrein in de periode
export async function stemmingenPerTerrein(soort: Periodesoort, periode: string): Promise<Map<string, number>> {
  const rijen = await leesApi<Array<{ beleidsterrein: string; stemmingen: number }>>(
    `beleidsterrein_periode?select=beleidsterrein,stemmingen&periodesoort=eq.${soort}&periode=eq.${encodeURIComponent(periode)}`,
  );
  return new Map((rijen ?? []).map((r) => [r.beleidsterrein, r.stemmingen]));
}

// Het paar per terrein, van meest naar minst eens. Daarna de kleine terreinen (minder dan 50 stemmingen samen,
// zie MINIMUM_UITERSTEN): een klein terrein haalt anders de top met 100%. Te weinig data helemaal achteraan.
export function paarPerTerrein(perTerrein: Map<string, Map<string, Paar>>, met: string): TerreinPaar[] {
  const lijst: TerreinPaar[] = [];
  for (const [terrein, m] of perTerrein) {
    const p = m.get(met);
    if (p) lijst.push({ terrein, ...p });
  }
  const groep = (p: TerreinPaar) => (p.teWeinig || p.cohesie == null ? 2 : p.gezamenlijk < MINIMUM_UITERSTEN ? 1 : 0);
  return lijst.sort((a, b) => groep(a) - groep(b) || (b.cohesie ?? -1) - (a.cohesie ?? -1) || a.terrein.localeCompare(b.terrein));
}

// Het terrein waarop het paar het vaakst en het minst vaak hetzelfde stemde. Alleen terreinen met minstens
// 50 gezamenlijke stemmingen: een klein terrein geeft snel een uitschieter die de kop zou halen.
export function uitersten(lijst: TerreinPaar[]): { hoog: TerreinPaar; laag: TerreinPaar } | null {
  const geldig = lijst.filter((p) => !p.teWeinig && p.cohesie != null && p.gezamenlijk >= MINIMUM_UITERSTEN);
  return geldig.length >= 2 ? { hoog: geldig[0], laag: geldig[geldig.length - 1] } : null;
}

// Verdieping: de stemmingen van een terrein in een periode, met wat twee fracties stemden (api.stemming_dossier).
// Een stemming bij meer dossiers komt per dossier terug. De Data API geeft hooguit 1.000 rijen per verzoek.
export type StemmingRij = {
  besluit: string; dossier: string; datum: string; zaakNummer: string | null; zaakSoort: string | null; onderwerp: string | null;
  uitslag: string | null; dossierNummer: number | null; dossierToevoeging: string | null; dossierTitel: string | null;
  andereDossiers: string[]; a: string | null; b: string | null;
};

type RuwStemming = {
  besluit: string; dossier: string; datum: string; zaak_nummer: string | null; zaak_soort: string | null; onderwerp: string | null;
  uitslag: string | null; dossier_nummer: number | null; dossier_toevoeging: string | null; dossier_titel: string | null;
  andere_dossiers: string[]; stemmen: Record<string, string>;
};

// Alle stemmingen van een terrein in een periode, met de stem van elke fractie (sleutel: fractie-id)
async function ruweStemmingen(soort: Periodesoort, periode: string, variant: Variant, terrein: string): Promise<RuwStemming[] | null> {
  const uit: RuwStemming[] = [];
  for (let vanaf = 0; ; vanaf += 1000) {
    const rijen = await leesApi<RuwStemming[]>(
      `stemming_dossier?select=besluit,dossier,datum,zaak_nummer,zaak_soort,onderwerp,uitslag,dossier_nummer,dossier_toevoeging,dossier_titel,andere_dossiers,stemmen` +
        `&beleidsterrein=eq.${encodeURIComponent(terrein)}&${soort}=eq.${encodeURIComponent(periode)}` +
        (variant === "verdeeld" ? "&verdeeld=is.true" : "") + `&order=datum.desc,besluit,dossier&limit=1000&offset=${vanaf}`,
    );
    if (!rijen) return null;
    uit.push(...rijen);
    if (rijen.length < 1000) return uit;
  }
}

export async function stemmingenInTerrein(
  soort: Periodesoort, periode: string, variant: Variant, terrein: string, a: string, b: string,
): Promise<StemmingRij[] | null> {
  const rijen = await ruweStemmingen(soort, periode, variant, terrein);
  return rijen?.map((r) => ({
    besluit: r.besluit, dossier: r.dossier, datum: r.datum, zaakNummer: r.zaak_nummer, zaakSoort: r.zaak_soort, onderwerp: r.onderwerp,
    uitslag: r.uitslag, dossierNummer: r.dossier_nummer, dossierToevoeging: r.dossier_toevoeging, dossierTitel: r.dossier_titel,
    andereDossiers: r.andere_dossiers ?? [], a: r.stemmen[a] ?? null, b: r.stemmen[b] ?? null,
  })) ?? null;
}

// Per dossier de cohesie van een fractie met elke andere fractie, voor de uitklapbare tabel (feedback Niels K1,
// 26 oktober 2026: van terrein naar dossier, zoals een matrix in Power BI). Zelfde telling als de cohesie: alleen
// stemmingen waarop beide fracties voor of tegen stemden. Dossiers met de meeste stemmingen eerst.
export type DossierRij = { dossier: string; titel: string; stemmingen: number; per: Map<string, { samen: number; eens: number }> };

export function dossierMatrix(rijen: Array<{ dossier: string; dossier_titel: string | null; stemmen: Record<string, string> }>, fractie: string): DossierRij[] {
  const per = new Map<string, DossierRij>();
  const telt = (v: string | undefined) => v === "Voor" || v === "Tegen";
  for (const r of rijen) {
    const d = per.get(r.dossier) ?? { dossier: r.dossier, titel: r.dossier_titel ?? "Onbekend dossier", stemmingen: 0, per: new Map() };
    d.stemmingen++;
    const eigen = r.stemmen[fractie];
    if (telt(eigen)) {
      for (const [f, v] of Object.entries(r.stemmen)) {
        if (f === fractie || !telt(v)) continue;
        const t = d.per.get(f) ?? { samen: 0, eens: 0 };
        t.samen++;
        if (v === eigen) t.eens++;
        d.per.set(f, t);
      }
    }
    per.set(r.dossier, d);
  }
  return [...per.values()].sort((x, y) => y.stemmingen - x.stemmingen || x.titel.localeCompare(y.titel));
}

export async function dossiersVoorMatrix(soort: Periodesoort, periode: string, variant: Variant, terrein: string, fractie: string): Promise<DossierRij[] | null> {
  const rijen = await ruweStemmingen(soort, periode, variant, terrein);
  return rijen ? dossierMatrix(rijen, fractie) : null;
}

export type DossierTelling = {
  dossier: string; titel: string; nummer: string; samen: number; eens: number; stemmingen: number; beideVoor: number; beideTegen: number;
};

// Per dossier: op hoeveel stemmingen beide fracties stemden (samen), hoe vaak hetzelfde (eens) en daarvan hoe
// vaak allebei voor en allebei tegen; samen min eens is het aantal keer verschillend.
// Gesorteerd op het meest eens (hoogste aandeel; verzoek Niels K1, 26 oktober 2026), dan op het aantal stemmingen samen.
export function perDossier(rijen: StemmingRij[]): DossierTelling[] {
  const per = new Map<string, DossierTelling>();
  for (const r of rijen) {
    const d = per.get(r.dossier) ?? {
      dossier: r.dossier, titel: r.dossierTitel ?? "Onbekend dossier",
      nummer: `${r.dossierNummer ?? ""}${r.dossierToevoeging ? ` ${r.dossierToevoeging}` : ""}`, samen: 0, eens: 0, stemmingen: 0, beideVoor: 0, beideTegen: 0,
    };
    d.stemmingen++;
    if (r.a && r.b) {
      d.samen++;
      if (r.a === r.b) {
        d.eens++;
        if (r.a === "Voor") d.beideVoor++; else d.beideTegen++;
      }
    }
    per.set(r.dossier, d);
  }
  const aandeel = (d: DossierTelling) => (d.samen ? d.eens / d.samen : -1);
  return [...per.values()].filter((d) => d.samen > 0).sort((x, y) => aandeel(y) - aandeel(x) || y.samen - x.samen || x.titel.localeCompare(y.titel));
}

// Zoeken op tweedekamer.nl op het zaaknummer (een directe link per motie werkt niet met alleen het nummer)
export function linkTweedeKamer(zaakNummer: string): string {
  return `https://www.tweedekamer.nl/zoeken?qry=${encodeURIComponent(zaakNummer)}`;
}

// De stemmingen waarop twee fracties allebei stemden en verschilden, elk een keer (een stemming bij meer
// dossiers komt in de rijen vaker voor), nieuwste eerst
export function verschillen(rijen: StemmingRij[]): StemmingRij[] {
  const gezien = new Set<string>();
  return rijen
    .filter((r) => r.a && r.b && r.a !== r.b && !gezien.has(r.besluit) && (gezien.add(r.besluit), true))
    .sort((x, y) => y.datum.localeCompare(x.datum));
}

// Data voor de verkenner en de fractiepagina's (component cohesie-pagina), uit schema api.
// De Data API geeft maximaal 1.000 rijen per verzoek: daarom per periode en variant opvragen.
import { leesApi } from "./api";
import { type CohesieKaart, sleutel } from "./zaal";

export type Periodesoort = "kabinet" | "kamerperiode";
export type Variant = "alle" | "verdeeld";
export type Periode = { soort: Periodesoort; naam: string; begin: string; einde: string | null };
export type FractieInPeriode = {
  id: string;
  afkorting: string;
  naam: string;
  zetels: number;
  stemmingen: number;
  eerste: string;
  laatste: string;
  inZaal: boolean;
  zetelsBegin: number;
  bijBegin: boolean;
};

export const PERIODESOORTEN: Array<{ waarde: Periodesoort; tekst: string }> = [
  { waarde: "kabinet", tekst: "Kabinet" },
  { waarde: "kamerperiode", tekst: "Kamerperiode" },
];
export const VARIANTEN: Array<{ waarde: Variant; tekst: string }> = [
  { waarde: "alle", tekst: "Alle stemmingen" },
  { waarde: "verdeeld", tekst: "Alleen verdeelde stemmingen" },
];

// Perioden waarvoor data is, nieuwste eerst. Kabinetten en Kamerperiodes uit api, gefilterd op
// perioden die in api.fractie_periode voorkomen (Balkenende IV telt alleen vanaf 2010).
export async function perioden(): Promise<Periode[]> {
  const [kab, kp, metData] = await Promise.all([
    leesApi<Array<{ naam: string; begin: string; einde: string | null }>>("kabinet?select=naam,begin,einde"),
    leesApi<Array<{ naam: string; begin: string; einde: string | null }>>("kamerperiode?select=naam,begin,einde"),
    leesApi<Array<{ periodesoort: Periodesoort; periode: string }>>(
      "fractie_periode?select=periodesoort,periode&limit=1000",
    ),
  ]);
  if (!kab || !kp || !metData) return [];
  const bestaat = new Set(metData.map((r) => `${r.periodesoort}|${r.periode}`));
  const lijst: Periode[] = [
    ...kab.map((p) => ({ soort: "kabinet" as const, ...p })),
    ...kp.map((p) => ({ soort: "kamerperiode" as const, ...p })),
  ].filter((p) => bestaat.has(`${p.soort}|${p.naam}`));
  return lijst.sort((a, b) => b.begin.localeCompare(a.begin));
}

export async function fractiesIn(soort: Periodesoort, periode: string): Promise<FractieInPeriode[] | null> {
  const rijen = await leesApi<
    Array<{
      fractie: string;
      afkorting: string;
      naam: string;
      zetels: number;
      stemmingen: number;
      eerste_stemming: string;
      laatste_stemming: string;
      in_zaal: boolean;
      zetels_begin: number;
      bij_begin: boolean;
    }>
  >(
    `fractie_periode?select=fractie,afkorting,naam,zetels,stemmingen,eerste_stemming,laatste_stemming,in_zaal,zetels_begin,bij_begin` +
      `&periodesoort=eq.${soort}&periode=eq.${encodeURIComponent(periode)}`,
  );
  if (!rijen) return null;
  return rijen.map((r) => ({
    id: r.fractie,
    afkorting: r.afkorting,
    naam: r.naam,
    zetels: r.zetels,
    stemmingen: r.stemmingen,
    eerste: r.eerste_stemming,
    laatste: r.laatste_stemming,
    inZaal: r.in_zaal,
    zetelsBegin: r.zetels_begin,
    bijBegin: r.bij_begin,
  }));
}

export async function cohesieIn(soort: Periodesoort, periode: string, variant: Variant): Promise<CohesieKaart | null> {
  const rijen = await leesApi<
    Array<{ fractie: string; andere_fractie: string; cohesie: number | null; gezamenlijk: number; te_weinig_data: boolean }>
  >(
    `cohesie?select=fractie,andere_fractie,cohesie,gezamenlijk,te_weinig_data&limit=1000` +
      `&periodesoort=eq.${soort}&periode=eq.${encodeURIComponent(periode)}&variant=eq.${variant}`,
  );
  if (!rijen) return null;
  const kaart: CohesieKaart = new Map();
  for (const r of rijen) {
    kaart.set(sleutel(r.fractie, r.andere_fractie), {
      cohesie: r.cohesie == null ? null : Number(r.cohesie),
      gezamenlijk: r.gezamenlijk,
      teWeinig: r.te_weinig_data,
    });
  }
  return kaart;
}

// Keuze uit de URL, met de standaard: het nieuwste kabinet, alle stemmingen
export function keuzeUitUrl(
  zoek: Record<string, string | string[] | undefined>,
  lijst: Periode[],
): { soort: Periodesoort; periode: Periode | null; variant: Variant } {
  const waarde = (k: string) => (Array.isArray(zoek[k]) ? zoek[k]?.[0] : zoek[k]) as string | undefined;
  const soort: Periodesoort = waarde("soort") === "kamerperiode" ? "kamerperiode" : "kabinet";
  const variant: Variant = waarde("variant") === "verdeeld" ? "verdeeld" : "alle";
  const binnenSoort = lijst.filter((p) => p.soort === soort);
  const gevraagd = waarde("periode");
  const periode = gevraagd ? binnenSoort.find((p) => p.naam === gevraagd) ?? null : binnenSoort[0] ?? null;
  return { soort, periode, variant };
}

// Stabiele URL per fractie: de afkorting, in kleine letters, zonder accenten en spaties
export function slug(afkorting: string): string {
  return afkorting
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function procent(c: number | null, decimalen = 0): string {
  if (c == null) return "";
  return `${c.toLocaleString("nl-NL", { minimumFractionDigits: decimalen, maximumFractionDigits: decimalen })}%`;
}

export function getal(n: number): string {
  return n.toLocaleString("nl-NL");
}

// Alle fracties sinds 2010, met de perioden waarin ze stemden (voor het overzicht en de fractiepagina's)
export type FractieOverzicht = { afkorting: string; naam: string; perioden: Array<{ soort: Periodesoort; periode: string; zetels: number; inZaal: boolean }> };

export async function alleFracties(): Promise<FractieOverzicht[] | null> {
  const rijen = await leesApi<Array<{ afkorting: string; naam: string; periodesoort: Periodesoort; periode: string; zetels: number; in_zaal: boolean }>>(
    "fractie_periode?select=afkorting,naam,periodesoort,periode,zetels,in_zaal&limit=1000",
  );
  if (!rijen) return null;
  const per = new Map<string, FractieOverzicht>();
  for (const r of rijen) {
    if (!r.afkorting) continue;
    const f = per.get(r.afkorting) ?? { afkorting: r.afkorting, naam: r.naam ?? r.afkorting, perioden: [] };
    f.perioden.push({ soort: r.periodesoort, periode: r.periode, zetels: r.zetels, inZaal: r.in_zaal });
    per.set(r.afkorting, f);
  }
  return [...per.values()].sort((a, b) => a.afkorting.localeCompare(b.afkorting, "nl"));
}

// Kabinet of oppositie per fractie (api.coalitie)
export type Rol = { rol: "kabinet" | "gedoogsteun"; tot: string | null };

export async function coalitieVan(kabinet: string): Promise<Map<string, Rol>> {
  const rijen = await leesApi<Array<{ afkorting: string; rol: "kabinet" | "gedoogsteun"; tot: string | null }>>(
    `coalitie?select=afkorting,rol,tot&kabinet=eq.${encodeURIComponent(kabinet)}`,
  );
  return new Map((rijen ?? []).map((r) => [r.afkorting, { rol: r.rol, tot: r.tot }]));
}

export function rolTekst(rol: Rol | undefined): string {
  if (!rol) return "Oppositie";
  const naam = rol.rol === "kabinet" ? "Kabinet" : "Gedoogsteun";
  if (!rol.tot) return naam;
  const datum = new Date(rol.tot).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  return `${naam} tot ${datum}`;
}

// Overstappers per periode (api.overstap): Kamerleden die van de ene naar de andere fractie gingen
export type Overstap = { van: string; naar: string; leden: number };

export async function overstappenIn(soort: Periodesoort, periode: string): Promise<Overstap[]> {
  const rijen = await leesApi<Overstap[]>(
    `overstap?select=van,naar,leden&periodesoort=eq.${soort}&periode=eq.${encodeURIComponent(periode)}`,
  );
  return rijen ?? [];
}

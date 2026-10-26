// Zetelwerk: wat fracties en Kamerleden indienen, wat er aangenomen wordt en met wiens steun (component zetelwerk,
// docs/plan/08-componenten/zetelwerk.md). Moties en amendementen blijven altijd apart.
import { leesApi } from "./api";
import type { Periodesoort } from "./cohesie";

export type Stuk = "Motie" | "Amendement";
export const STUKKEN: Array<{ waarde: Stuk; tekst: string; meervoud: string }> = [
  { waarde: "Motie", tekst: "Moties", meervoud: "moties" },
  { waarde: "Amendement", tekst: "Amendementen", meervoud: "amendementen" },
];
// Onder dit aantal ingediende stukken tonen we geen percentage (definitie 8)
export const MINIMUM = 10;

export type FractieWerk = {
  fractie: string; afkorting: string; soort: Stuk; rol: "kabinet" | "oppositie"; ingediend: number; mede: number;
  aangenomen: number; brede_steun: number; mediaan_zetels_voor: number | null; tegen_aandeel: number | null;
};
export type PersoonWerk = {
  persoon: string; naam: string; fractie_afkorting: string | null; soort: Stuk; ingediend: number; mede: number; aangenomen: number; brede_steun: number;
};
export type StukVan = {
  zaak: string; relatie: "Indiener" | "Medeindiener"; fractie_afkorting: string | null; rol: string; soort: Stuk; nummer: string | null;
  onderwerp: string | null; datum: string; zetels_voor: number; zetels_tegen: number; aangenomen: boolean; brede_steun: boolean;
};
export type PeriodeWerk = { periode: string; soort: Stuk; indiener_rol: string; ingediend: number; aangenomen: number; brede_steun: number };
export type JaarWerk = { jaar: number; soort: Stuk; indiener_rol: string; ingediend: number; aangenomen: number };
export type Verbinding = { fractie_a: string; fractie_b: string; stukken: number };

const per = (soort: Periodesoort, periode: string) => `periodesoort=eq.${soort}&periode=eq.${encodeURIComponent(periode)}`;

export async function fractieWerk(soort: Periodesoort, periode?: string): Promise<Array<FractieWerk & { periode: string }> | null> {
  const rijen = await leesApi<Array<Record<string, unknown>>>(
    `zetelwerk_fractie?select=periode,fractie,afkorting,soort,rol,ingediend,mede,aangenomen,brede_steun,mediaan_zetels_voor,tegen_aandeel` +
      `&periodesoort=eq.${soort}${periode ? `&periode=eq.${encodeURIComponent(periode)}` : ""}&limit=1000`,
  );
  return rijen?.map((r) => ({
    ...(r as unknown as FractieWerk & { periode: string }),
    mediaan_zetels_voor: r.mediaan_zetels_voor == null ? null : Number(r.mediaan_zetels_voor),
    tegen_aandeel: r.tegen_aandeel == null ? null : Number(r.tegen_aandeel),
  })) ?? null;
}

export async function persoonWerk(soort: Periodesoort, periode: string): Promise<PersoonWerk[] | null> {
  const uit: PersoonWerk[] = [];
  for (let vanaf = 0; ; vanaf += 1000) {
    const rijen = await leesApi<PersoonWerk[]>(
      `zetelwerk_persoon?select=persoon,naam,fractie_afkorting,soort,ingediend,mede,aangenomen,brede_steun&${per(soort, periode)}&order=persoon,soort&limit=1000&offset=${vanaf}`,
    );
    if (!rijen) return null;
    uit.push(...rijen);
    if (rijen.length < 1000) return uit;
  }
}

export async function stukkenVan(persoon: string, soort: Periodesoort, periode: string): Promise<StukVan[] | null> {
  return leesApi<StukVan[]>(
    `indiening_stuk?select=zaak,relatie,fractie_afkorting,rol,soort,nummer,onderwerp,datum,zetels_voor,zetels_tegen,aangenomen,brede_steun` +
      `&persoon=eq.${persoon}&${soort}=eq.${encodeURIComponent(periode)}&order=datum.desc&limit=1000`,
  );
}

export async function periodeWerk(soort: Periodesoort = "kabinet"): Promise<PeriodeWerk[] | null> {
  return leesApi<PeriodeWerk[]>(`zetelwerk_periode?select=periode,soort,indiener_rol,ingediend,aangenomen,brede_steun&periodesoort=eq.${soort}`);
}

export async function jaarWerk(): Promise<JaarWerk[] | null> {
  return leesApi<JaarWerk[]>("zetelwerk_jaar?select=jaar,soort,indiener_rol,ingediend,aangenomen&order=jaar");
}

export async function netwerk(soort: Periodesoort, periode: string, stuk: Stuk): Promise<Verbinding[] | null> {
  return leesApi<Verbinding[]>(`indiening_netwerk?select=fractie_a,fractie_b,stukken&${per(soort, periode)}&soort=eq.${stuk}&order=stukken.desc&limit=1000`);
}

// Aandeel aangenomen als heel percentage, of null onder het minimum
export function aandeel(aangenomen: number, ingediend: number): number | null {
  return ingediend >= MINIMUM ? Math.round((100 * aangenomen) / ingediend) : null;
}

// Per Kamerlid de moties en amendementen in een rij, gesorteerd op ingediend (moties, dan amendementen)
export type Kamerlid = { persoon: string; naam: string; fractie: string | null; motie?: PersoonWerk; amendement?: PersoonWerk };
export function kamerleden(rijen: PersoonWerk[]): Kamerlid[] {
  const per = new Map<string, Kamerlid>();
  for (const r of rijen) {
    const k = per.get(r.persoon) ?? { persoon: r.persoon, naam: r.naam, fractie: r.fractie_afkorting };
    if (r.soort === "Motie") k.motie = r; else k.amendement = r;
    per.set(r.persoon, k);
  }
  const telt = (k: Kamerlid) => (k.motie?.ingediend ?? 0) + (k.amendement?.ingediend ?? 0) / 1000;
  return [...per.values()].sort((a, b) => telt(b) - telt(a) || a.naam.localeCompare(b.naam, "nl"));
}

// Opgeteld per rol (kabinet of oppositie) uit de tellingen per periode; gemengd en onbekend apart gehouden
export function perRol(rijen: PeriodeWerk[], periode: string, soort: Stuk) {
  const rol = (r: string) => rijen.find((x) => x.periode === periode && x.soort === soort && x.indiener_rol === r) ?? { ingediend: 0, aangenomen: 0, brede_steun: 0 };
  return { kabinet: rol("kabinet"), oppositie: rol("oppositie"), gemengd: rol("gemengd") };
}

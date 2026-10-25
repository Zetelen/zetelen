// Titel, datum en uitslag van een paar stemmingen (coalitiebouwer: waarop was een partner beslissend).
// Leest op de server uit api.stemming_dossier, zodat de publieke sleutel niet in de browser hoeft.
// Hooguit 40 besluiten per verzoek; een stemming bij meer dossiers komt maar een keer terug.
import { leesApi } from "@/lib/api";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export async function GET(verzoek: Request) {
  const ids = (new URL(verzoek.url).searchParams.get("ids") ?? "").split(",").filter((id) => UUID.test(id)).slice(0, 40);
  if (!ids.length) return Response.json([]);
  const rijen = await leesApi<Array<{ besluit: string; datum: string; onderwerp: string | null; uitslag: string | null; zaak_nummer: string | null; zaak_soort: string | null; dossier_titel: string | null }>>(
    `stemming_dossier?select=besluit,datum,onderwerp,uitslag,zaak_nummer,zaak_soort,dossier_titel&besluit=in.(${ids.join(",")})&order=datum.desc`,
  );
  if (!rijen) return Response.json({ fout: "niet bereikbaar" }, { status: 503 });
  const gezien = new Set<string>();
  const uniek = rijen.filter((r) => (gezien.has(r.besluit) ? false : (gezien.add(r.besluit), true)));
  return Response.json(uniek, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}

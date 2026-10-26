// Stemmatrix per periode voor de coalitiebouwer. Leest op de server uit de Data API, zodat de
// publieke sleutel niet in de browser hoeft; het CDN van Vercel bewaart het antwoord een uur.
// select=*: de kolom besluiten (migratie 017) is er pas na de migratie; zonder kolom werkt alles behalve de verdieping.
import { leesApi } from "@/lib/api";

export async function GET(verzoek: Request) {
  const zoek = new URL(verzoek.url).searchParams;
  const soort = zoek.get("soort") === "kamerperiode" ? "kamerperiode" : "kabinet";
  const periode = zoek.get("periode") ?? "";
  const rijen = await leesApi<Array<{ fracties: unknown; stemmen: unknown; zetels: unknown; besluiten: unknown }>>(
    `stemmatrix?select=*&periodesoort=eq.${soort}&periode=eq.${encodeURIComponent(periode)}`,
  );
  if (!rijen) return Response.json({ fout: "niet bereikbaar" }, { status: 503 });
  if (!rijen.length) return Response.json({ fout: "geen stemmingen" }, { status: 404 });
  return Response.json(rijen[0], {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}

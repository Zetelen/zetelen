// Voorbeeldplaatje van een deellink (lib/deel.ts, components/deel/plaatjes.tsx). Een uur in de cache: de data
// ververst één keer per dag.
import { ImageResponse } from "next/og";
import { bredeSteunPlaatje, verkennerPlaatje, vvdProPlaatje } from "@/components/deel/plaatjes";
import { isGrafiek } from "@/lib/deel";
import { schoonZoek } from "@/lib/deelSchoon";

export async function GET(verzoek: Request, { params }: { params: Promise<{ grafiek: string }> }) {
  const g = (await params).grafiek;
  if (!isGrafiek(g)) return new Response("Onbekende grafiek", { status: 404 });
  const zoek = await schoonZoek(g, new URL(verzoek.url).searchParams);
  const inhoud = g === "verkenner" ? await verkennerPlaatje(zoek) : g === "vvd-en-pro" ? await vvdProPlaatje() : await bredeSteunPlaatje();
  return new ImageResponse(inhoud, { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" } });
}

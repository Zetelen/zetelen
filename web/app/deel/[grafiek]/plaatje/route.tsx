// Voorbeeldplaatje van een deellink (lib/deel.ts, components/deel/plaatjes*.tsx). Een uur in de cache: de data
// ververst één keer per dag. De keuzes uit de link zijn gecontroleerd (lib/deelSchoon.ts).
import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import { actueelPlaatje } from "@/components/actueel/plaatje";
import { bredeSteunPlaatje, verkennerPlaatje, vvdProPlaatje } from "@/components/deel/plaatjes";
import {
  kamerledenPlaatje, onderwerpenPlaatje, ontradenPlaatje, oppositieJarenPlaatje, oppositieKabinettenPlaatje, oppositieSpreidingPlaatje,
  ranglijstPlaatje, stemgenotenPlaatje, stemmingPlaatje, trendPlaatje, wettenPlaatje,
} from "@/components/deel/plaatjesMeer";
import { type Grafiek, isGrafiek } from "@/lib/deel";
import { schoonZoek } from "@/lib/deelSchoon";

// De coalitie heeft al een eigen plaatje (app/coalitie/plaatje); de deellink verwijst daarheen
const PLAATJES: Record<Exclude<Grafiek, "coalitie">, (zoek: Record<string, string>) => Promise<ReactElement>> = {
  verkenner: verkennerPlaatje, trend: trendPlaatje, "vvd-en-pro": vvdProPlaatje, "brede-steun": bredeSteunPlaatje,
  stemgenoten: stemgenotenPlaatje, onderwerpen: onderwerpenPlaatje, stemming: stemmingPlaatje, kamerleden: kamerledenPlaatje,
  ranglijst: ranglijstPlaatje, "oppositie-jaren": oppositieJarenPlaatje, "oppositie-kabinetten": oppositieKabinettenPlaatje,
  "oppositie-spreiding": oppositieSpreidingPlaatje, ontraden: ontradenPlaatje, wetten: wettenPlaatje, actueel: actueelPlaatje,
};

export async function GET(verzoek: Request, { params }: { params: Promise<{ grafiek: string }> }) {
  const g = (await params).grafiek;
  if (!isGrafiek(g) || g === "coalitie") return new Response("Onbekende grafiek", { status: 404 });
  const zoek = await schoonZoek(g, new URL(verzoek.url).searchParams);
  return new ImageResponse(await PLAATJES[g](zoek), { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" } });
}

// Deellink van één grafiek (verzoek Niels, 28 oktober 2026; lib/deel.ts). De pagina bestaat voor het voorbeeldplaatje:
// WhatsApp, LinkedIn en X lezen de titel en het plaatje hier. Een bezoeker gaat direct door naar de grafiek op de site.
// Niet in zoekmachines (noindex); wel te volgen, zodat de voorbeeldlezers het plaatje mogen ophalen.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Inhoud, knopKlasse } from "@/components/Kader";
import { Label, SectieKop, Tekst } from "@/components/Typografie";
import { Doorsturen } from "@/components/deel/Doorsturen";
import { BRON, deellinkVan, doelVan, isGrafiek, plaatjeVan, titelVan } from "@/lib/deel";
import s from "@/components/deel/deel.module.css";

type Props = { params: Promise<{ grafiek: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const g = (await params).grafiek;
  if (!isGrafiek(g)) return {};
  const zoek = await searchParams;
  const titel = titelVan(g, zoek), plaatje = plaatjeVan(g, zoek);
  const beschrijving = `${BRON}. Bekijk de grafiek en kies zelf een partij of periode.`;
  return {
    title: titel,
    description: beschrijving,
    robots: { index: false, follow: true },
    openGraph: { title: titel, description: beschrijving, url: deellinkVan(g, zoek), images: [{ url: plaatje, width: 1200, height: 630, alt: titel }] },
    twitter: { card: "summary_large_image", title: titel, description: beschrijving, images: [plaatje] },
  };
}

export default async function Deellink({ params, searchParams }: Props) {
  const g = (await params).grafiek;
  if (!isGrafiek(g)) notFound();
  const zoek = await searchParams;
  const doel = doelVan(g, zoek);
  return (
    <Inhoud>
      <Doorsturen naar={doel} />
      <section className={s.tussen}>
        <Label>Gedeeld van Zetelen</Label>
        <SectieKop niveau={1}>{titelVan(g, zoek)}</SectieKop>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={plaatjeVan(g, zoek)} alt={titelVan(g, zoek)} width={1200} height={630} />
        <Tekst>Je gaat zo door naar de grafiek. Gebeurt dat niet?</Tekst>
        <Link href={doel} className={knopKlasse}>Bekijk de grafiek op Zetelen</Link>
      </section>
    </Inhoud>
  );
}

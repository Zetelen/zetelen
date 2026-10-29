// Eén uitgelichte stemming op een eigen pagina (besluit Niels B16): de scroll graphic, de datum, het zaaknummer met
// een link naar tweedekamer.nl, en de uitslag zoals de bron hem noteert. Statisch gebouwd voor elke casus.
import { GrafiekKader, GrafiekVlak } from "@/components/deel/GrafiekKader";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd, MAKER } from "@/components/JsonLd";
import { Inhoud } from "@/components/Kader";
import { HoofdstukKop, Kern, Lezingen } from "@/components/Onderdelen";
import { Data, HeroKop, Label, Tekst } from "@/components/Typografie";
import { ScrollVerhaal } from "@/components/verhaal/ScrollVerhaal";
import { CasusKiezer } from "@/components/verhaal/CasusKiezer";
import { Inklapbaar } from "@/components/Inklapbaar";
import { lijst, zoekLink } from "@/lib/uitgelicht";
import { KIEZER, UITGELICHT } from "@/lib/uitgelichtLijst";
import { DOMEIN } from "@/lib/site";
import { dagMaandJaar } from "@/lib/verhaal";
import s from "@/components/verhaal/uitgelicht.module.css";

type Props = { params: Promise<{ casus: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return UITGELICHT.map((u) => ({ casus: u.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).casus;
  const u = UITGELICHT.find((x) => x.slug === slug);
  return u ? { title: `${u.titel} · Uitgelicht`, description: `${u.vraag} Een hoofdelijke stemming ontleed.`, alternates: { canonical: `/uitgelicht/${u.slug}` } } : {};
}

export default async function CasusPagina({ params }: Props) {
  const slug = (await params).casus;
  const i = UITGELICHT.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const u = UITGELICHT[i];
  const vorige = UITGELICHT[i - 1], volgende = UITGELICHT[i + 1];
  const datums = lijst(u.datums.map(dagMaandJaar));
  return (
    <Inhoud>
      {/* Article met maker; zonder publicatiedatum, want die houden we per casus niet bij */}
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: u.titel, description: u.vraag, author: MAKER, inLanguage: "nl", url: `${DOMEIN}/uitgelicht/${u.slug}` }} />
      <section className={s.blok}>
        <CasusKiezer casussen={KIEZER} gekozen={u.slug} />
        <Label>Uitgelicht · {datums}</Label>
        <HeroKop>{u.vraag}</HeroKop>
        {/* Kern van de pagina (K11, 27 oktober 2026); geen "wat opvalt", dat verklapt de uitslag van het verhaal */}
        <Kern ziet={`${u.titel}: één hoofdelijke stemming, stap voor stap. De uitslag, per fractie, en wie anders stemde.`} />
        {/* De inleiding van de reeks, die eerst op /uitgelicht stond (die opent nu meteen een stemming) */}
        <Inklapbaar titel="Waarom deze stemmingen?" dicht>
          <Tekst>
            Het zijn allemaal hoofdelijke stemmingen: elk Kamerlid stemt apart, en de bron legt elke stem vast. Bij gewoon
            handopsteken telt de fractie als één stem. We kozen ze met de hand, op spreiding: over de jaren en kabinetten,
            ingediend door fracties van links, midden en rechts, uit kabinet en oppositie. Een andere keuze had net zo goed gekund.
          </Tekst>
          <Lezingen
            links={{ titel: "Eén stemming zegt veel", tekst: "Je ziet wat bij handopsteken verdwijnt: wie in een fractie anders stemt, wie er niet is, en hoe krap het was." }}
            rechts={{ titel: "Eén stemming zegt weinig", tekst: "Hoofdelijk stemmen is een uitzondering. Hoe de Kamer meestal stemt, zie je pas in duizenden stemmingen samen." }}
          />
        </Inklapbaar>
      </section>

      <GrafiekKader grafiek="stemming" zoek={{ casus: u.slug }} titel={u.vraag} vergroot={false} id="stemming" className={s.graphic}>
        <HoofdstukKop titel={u.titel} />
        <GrafiekVlak><ScrollVerhaal verhaal={u.verhaal()} label={`De stemming: ${u.titel}`} hoogteSmal={u.hoogteSmal} stapHoogte="45vh" tijdlijn /></GrafiekVlak>
        <Data>
          Stemming over zaak <a href={zoekLink(u.zaak)}>{u.zaak}</a>, hoofdelijk, {datums}. Uitslag in de bron:{" "}
          {u.besluitTekst.join("; ")}. Kleuren zijn een eigen palet, geen partijkleuren.
        </Data>
        <Data>Onderwerp in de bron: {u.onderwerp.trim()}</Data>
      </GrafiekKader>

      <nav className={s.verder} aria-label="Andere uitgelichte stemmingen">
        {vorige ? <Link href={`/uitgelicht/${vorige.slug}`}>← {vorige.titel}</Link> : <span />}
        {volgende ? <Link href={`/uitgelicht/${volgende.slug}`}>{volgende.titel} →</Link> : <span />}
      </nav>
    </Inhoud>
  );
}

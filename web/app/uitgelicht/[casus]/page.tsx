// Eén uitgelichte stemming op een eigen pagina (besluit Niels B16): de scroll graphic, de datum, het zaaknummer met
// een link naar tweedekamer.nl, en de uitslag zoals de bron hem noteert. Statisch gebouwd voor elke casus.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Inhoud } from "@/components/Kader";
import { HoofdstukKop } from "@/components/Onderdelen";
import { Data, HeroKop, Label, Tekst } from "@/components/Typografie";
import { ScrollVerhaal } from "@/components/verhaal/ScrollVerhaal";
import { lijst, zoekLink } from "@/lib/uitgelicht";
import { UITGELICHT } from "@/lib/uitgelichtLijst";
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
  return u ? { title: `${u.titel} · Uitgelicht`, description: `${u.vraag} Een hoofdelijke stemming uit elkaar gehaald.` } : {};
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
      <section className={s.blok}>
        <Label>Uitgelicht · {datums}</Label>
        <HeroKop>{u.vraag}</HeroKop>
        <Tekst>
          Eén hoofdelijke stemming van dichtbij. Scroll door de stappen: de zaal valt uiteen in voor, tegen en per fractie.{" "}
          <Link href="/uitgelicht">Alle uitgelichte stemmingen</Link>
        </Tekst>
      </section>

      <section id="stemming" className={s.graphic}>
        <HoofdstukKop titel={u.titel} />
        <ScrollVerhaal verhaal={u.verhaal()} label={`De stemming: ${u.titel}`} hoogteSmal={u.hoogteSmal} stapHoogte="45vh" tijdlijn />
        <Data>
          Stemming over zaak <a href={zoekLink(u.zaak)}>{u.zaak}</a>, hoofdelijk, {datums}. Uitslag in de bron:{" "}
          {u.besluitTekst.join("; ")}. Kleuren zijn een eigen palet, geen partijkleuren.
        </Data>
        <Data>Onderwerp in de bron: {u.onderwerp.trim()}</Data>
      </section>

      <nav className={s.verder} aria-label="Andere uitgelichte stemmingen">
        {vorige ? <Link href={`/uitgelicht/${vorige.slug}`}>← {vorige.titel}</Link> : <span />}
        {volgende ? <Link href={`/uitgelicht/${volgende.slug}`}>{volgende.titel} →</Link> : <Link href="/uitgelicht">Alle uitgelichte stemmingen →</Link>}
      </nav>
    </Inhoud>
  );
}

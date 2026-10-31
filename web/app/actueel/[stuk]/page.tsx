// Een Actueel-stuk in vier blokken (lib/actueel.ts, components/actueel/Blokken.tsx). De getallen staan vast op
// de dag van publicatie; de kop van elk blok is de conclusie, de regel eronder de marge.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Botspunten, Meegaan, PerThema, Zetelsom } from "@/components/actueel/Blokken";
import { Inhoud } from "@/components/Kader";
import { GrafiekKader, GrafiekVlak } from "@/components/deel/GrafiekKader";
import { Kern, Lezingen } from "@/components/Onderdelen";
import { Data, HeroKop, Label, Tekst } from "@/components/Typografie";
import { type ActueelData, STUKKEN, datumTekst, stukVan } from "@/lib/actueel";
import u from "@/components/verhaal/uitgelicht.module.css";
import s from "@/components/actueel/actueel.module.css";

export const generateStaticParams = () => STUKKEN.map((x) => ({ stuk: x.slug }));
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ stuk: string }> }): Promise<Metadata> {
  const x = stukVan((await params).stuk);
  if (!x) return {};
  return { title: x.kop, description: x.beschrijving, alternates: { canonical: `/actueel/${x.slug}` } };
}

const GRAFIEK: Record<string, (p: { d: ActueelData }) => React.ReactNode> = { mee: Meegaan, wringt: Botspunten, abortus: PerThema, telt: Zetelsom };

export default async function ActueelStuk({ params }: { params: Promise<{ stuk: string }> }) {
  const x = stukVan((await params).stuk);
  if (!x) notFound();
  return (
    <Inhoud>
      <section className={u.blok}>
        <Label>{x.label} · {datumTekst(x.datum)}</Label>
        <HeroKop>{x.kop}</HeroKop>
        <Kern ziet={x.ziet} opvalt={x.opvalt} />
        <Tekst>{x.aanleiding}</Tekst>
      </section>

      <div className={s.blokken}>
        {x.blokken.map((b, i) => {
          const Grafiek = GRAFIEK[b.id];
          return (
            <GrafiekKader key={b.id} grafiek="actueel" zoek={{ stuk: x.slug, blok: b.id }} titel={b.kop} id={b.id} className={s.blok}>
              <p className={s.vraag}>{i + 1} · {b.vraag}</p>
              <h2 className={s.blokKop}>{b.kop}</h2>
              {b.tekst.map((t) => <Tekst key={t}>{t}</Tekst>)}
              <GrafiekVlak><Grafiek d={x.data} /></GrafiekVlak>
              <Data>{b.data}</Data>
            </GrafiekKader>
          );
        })}
        {x.lezingen && <Lezingen links={x.lezingen.links} rechts={x.lezingen.rechts} />}
        <p className={s.slot}>{x.slot}</p>
        <Data>
          Bron: open data van de Tweede Kamer, eigen berekening (<Link href="/methodiek">methodiek</Link>). Stand van de
          data: {datumTekst(x.data.stand)}. {x.data.verdeeld.toLocaleString("nl-NL")} verdeelde stemmingen onder
          kabinet-{x.data.kabinet}. Zelf verder kijken:{" "}
          <Link href={`/coalitie?soort=kabinet&periode=${x.data.kabinet}&groep=${[...x.data.tegen, ...x.data.groep].join(",")}`}>deze zes in de coalitiebouwer</Link>.
        </Data>
      </div>
    </Inhoud>
  );
}

// Een Actueel-stuk in vier blokken (lib/actueel.ts, components/actueel/Blokken.tsx). De getallen staan vast op
// de dag van publicatie; de kop van elk blok is de conclusie, de regel eronder de marge.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bladeren } from "@/components/Bladeren";
import { plaatjeVan } from "@/lib/deel";
import { Botspunten, Doorslag, Hechtheid, Meegaan, MeegaanStappen, PerThema, Zetelsom } from "@/components/actueel/Blokken";
import { Buiten, Kamers, Partners, Plannen, Toen, Uitslag } from "@/components/actueel/AkkoordBlokken";
import { Maanden, Zonder } from "@/components/actueel/VerdeeldBlokken";
import { Oppositie, Val } from "@/components/actueel/DemissionairBlokken";
import { Inhoud } from "@/components/Kader";
import { GrafiekKader, GrafiekVlak } from "@/components/deel/GrafiekKader";
import { Kern, Lezingen } from "@/components/Onderdelen";
import { Data, HeroKop, Label, Tekst } from "@/components/Typografie";
import { type ActueelData, type AkkoordData, type DemissionairData, type Stuk, type VerdeeldData, STUKKEN, datumTekst, isAkkoord, isDemissionair, isVerdeeld, stukVan } from "@/lib/actueel";
import u from "@/components/verhaal/uitgelicht.module.css";
import s from "@/components/actueel/actueel.module.css";

export const generateStaticParams = () => STUKKEN.map((x) => ({ stuk: x.slug }));
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ stuk: string }> }): Promise<Metadata> {
  const x = stukVan((await params).stuk);
  if (!x) return {};
  // Eigen deelplaatje per stuk (16 november 2026): de kop en de eerste grafiek, zoals de deellink zonder blok
  const plaatje = plaatjeVan("actueel", { stuk: x.slug });
  return {
    title: x.kop, description: x.beschrijving, alternates: { canonical: `/actueel/${x.slug}` },
    openGraph: { title: x.kop, description: x.beschrijving, url: `/actueel/${x.slug}`, images: [{ url: plaatje, width: 1200, height: 630, alt: x.kop }] },
    twitter: { card: "summary_large_image", title: x.kop, description: x.beschrijving, images: [plaatje] },
  };
}

const GRAFIEK: Record<string, (p: { d: ActueelData }) => React.ReactNode> = { mee: Meegaan, wringt: Botspunten, abortus: PerThema, telt: Zetelsom, hecht: Hechtheid, stappen: MeegaanStappen, steun: Doorslag };
// Stuk akkoord-belastingplan (11 november 2026): eigen data, eigen grafieken
const AKKOORD: Record<string, (p: { d: AkkoordData }) => React.ReactNode> = { uitslag: Uitslag, plannen: Plannen, partners: Partners, buiten: Buiten, kamers: Kamers, toen: Toen };
// Stuk coalitie-verdeeld (13 november 2026): eigen data, eigen grafieken
const VERDEELD: Record<string, (p: { d: VerdeeldData }) => React.ReactNode> = { maanden: Maanden, zonder: Zonder };
// Stuk demissionair (14 november 2026): zes kabinetten, eigen data, eigen grafieken
const DEMISSIONAIR: Record<string, (p: { d: DemissionairData }) => React.ReactNode> = { val: Val, oppositie: Oppositie };
function Grafiek({ d, id }: { d: Stuk["data"]; id: string }) {
  if (isAkkoord(d)) {
    const G = AKKOORD[id];
    return <G d={d} />;
  }
  if (isVerdeeld(d)) {
    const G = VERDEELD[id];
    return <G d={d} />;
  }
  if (isDemissionair(d)) {
    const G = DEMISSIONAIR[id];
    return <G d={d} />;
  }
  const G = GRAFIEK[id];
  return <G d={d} />;
}

export default async function ActueelStuk({ params }: { params: Promise<{ stuk: string }> }) {
  const x = stukVan((await params).stuk);
  if (!x) notFound();
  return (
    <Inhoud licht>
      <section className={u.blok}>
        <Label>{x.label} · {datumTekst(x.datum)}</Label>
        {/* Op de telefoon een kleinere kop: de koppen van stukken zijn lang (K23 B3, 16 november 2026) */}
        <HeroKop className={s.stukKop}>{x.kop}</HeroKop>
        {/* Wat je ziet blijft open: daar staat de periode van de cijfers (feitencontrole 16 november 2026) */}
        <Kern ziet={x.ziet} opvalt={x.opvalt} inklappen={false} />
        <Tekst>{x.aanleiding}</Tekst>
        {x.verwijzing && <Tekst><Link href={x.verwijzing.href}>{x.verwijzing.tekst}</Link></Tekst>}
      </section>

      <div className={s.blokken}>
        {/* Telefoon: de blokken en de conclusie als delen om door te vegen (1 november 2026) */}
        <Bladeren label={x.kop}>
        {x.blokken.map((b, i) => {
          return (
            <GrafiekKader key={b.id} grafiek="actueel" zoek={{ stuk: x.slug, blok: b.id }} titel={b.kop} id={b.id} className={s.blok}>
              <p className={s.vraag}>{i + 1} · {b.vraag}</p>
              <h2 className={s.blokKop}>{b.kop}</h2>
              {b.tekst.map((t) => <Tekst key={t}>{t}</Tekst>)}
              <GrafiekVlak><Grafiek d={x.data} id={b.id} /></GrafiekVlak>
              <Data>{b.data}</Data>
            </GrafiekKader>
          );
        })}
        <section className={s.slotDeel} aria-label="De conclusie">
          {x.lezingen && <Lezingen links={x.lezingen.links} rechts={x.lezingen.rechts} />}
          <p className={s.slot}>{x.slot}</p>
        </section>
        </Bladeren>
        <Data>
          Bron: open data van de Tweede Kamer, eigen berekening (<Link href="/methodiek">methodiek</Link>). Stand van de
          data: {datumTekst(x.data.stand)}. {x.data.verdeeld.toLocaleString("nl-NL")} verdeelde stemmingen onder
          {/* Het stuk over demissionaire kabinetten telt zes kabinetten, de andere stukken één */}
          {isDemissionair(x.data) ? ` ${x.data.kabinetten.length} kabinetten sinds 2010` : ` kabinet-${x.data.kabinet}`}. Zelf verder kijken:{" "}
          <Link href={`/coalitie?soort=kabinet&periode=${x.data.kabinet}&groep=${(x.bouwer?.fracties ?? (isDemissionair(x.data) ? x.data.jetten.partijen : [...x.data.tegen, ...x.data.groep])).map(encodeURIComponent).join(",")}`}>{x.bouwer?.tekst ?? "deze zes in de coalitiebouwer"}</Link>.
        </Data>
      </div>
    </Inhoud>
  );
}

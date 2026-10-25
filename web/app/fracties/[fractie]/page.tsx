// Fractiepagina (E2-S6): met wie stemt deze fractie het vaakst hetzelfde, per periode.
// Stabiele URL per afkorting: /fracties/pvv. Periode en variant in de URL, net als in de verkenner.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Inhoud, LegeStaat, knopKlasse } from "@/components/Kader";
import { Data, HeroKop, Label, Tekst } from "@/components/Typografie";
import { alleFracties, cohesieIn, fractiesIn, getal, perioden, procent, slug, type Periodesoort, type Variant } from "@/lib/cohesie";
import { schaalkleur } from "@/lib/kleur";
import { sleutel } from "@/lib/zaal";
import { Bronregel } from "@/components/cohesie/Bronregel";
import s from "@/components/cohesie/fractie.module.css";

type Props = {
  params: Promise<{ fractie: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function zoekFractie(slugWaarde: string) {
  const alle = await alleFracties();
  return alle?.find((f) => slug(f.afkorting) === slugWaarde) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = await zoekFractie((await params).fractie);
  if (!f) return { title: "Fractie niet gevonden" };
  return {
    title: f.afkorting,
    description: `Met wie stemt ${f.naam} het vaakst hetzelfde in de Tweede Kamer? Per kabinet en per Kamerperiode.`,
  };
}

export default async function FractiePagina({ params, searchParams }: Props) {
  const f = await zoekFractie((await params).fractie);
  if (!f) notFound();
  const zoek = await searchParams;
  const w = (k: string) => (Array.isArray(zoek[k]) ? zoek[k]?.[0] : zoek[k]) as string | undefined;
  const lijst = await perioden();
  // Perioden waarin deze fractie stemde, nieuwste eerst
  const eigen = lijst.filter((p) => f.perioden.some((q) => q.soort === p.soort && q.periode === p.naam));
  const soort: Periodesoort = w("soort") === "kamerperiode" ? "kamerperiode" : "kabinet";
  const variant: Variant = w("variant") === "verdeeld" ? "verdeeld" : "alle";
  const binnenSoort = eigen.filter((p) => p.soort === soort);
  const periode = binnenSoort.find((p) => p.naam === w("periode")) ?? binnenSoort[0];
  const basis = `/fracties/${slug(f.afkorting)}`;
  const link = (wijziging: Record<string, string>) => {
    const q = new URLSearchParams({ soort, variant, ...(periode ? { periode: periode.naam } : {}), ...wijziging });
    return `${basis}?${q.toString()}`;
  };

  const [fracties, kaart] = periode ? await Promise.all([fractiesIn(soort, periode.naam), cohesieIn(soort, periode.naam, variant)]) : [null, null];
  const ik = fracties?.find((x) => x.afkorting === f.afkorting);
  const rijen = ik && kaart
    ? fracties!.filter((x) => x.id !== ik.id).map((x) => ({ x, p: kaart.get(sleutel(ik.id, x.id)) }))
        .sort((a, b) => (b.p?.cohesie ?? -1) - (a.p?.cohesie ?? -1))
    : [];

  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)" }}>
        <Label>Fractie</Label>
        <HeroKop>{f.afkorting}</HeroKop>
        {f.naam !== f.afkorting && <Tekst>{f.naam}</Tekst>}
        {ik && <Data>{ik.zetels} zetels aan het eind van {periode!.naam} · {getal(ik.stemmingen)} stemmingen in deze periode</Data>}
      </section>

      <nav aria-label="Periode" className={s.keuzes}>
        <div className={s.keuzerij}>
          {(["kabinet", "kamerperiode"] as const).filter((k) => eigen.some((p) => p.soort === k)).map((k) => (
            <Link key={k} href={`${basis}?soort=${k}&variant=${variant}`} aria-current={k === soort ? "true" : undefined} className={s.pil}>
              {k === "kabinet" ? "Kabinet" : "Kamerperiode"}
            </Link>
          ))}
        </div>
        <div className={s.keuzerij}>
          {binnenSoort.map((p) => (
            <Link key={p.naam} href={link({ periode: p.naam })} aria-current={p.naam === periode?.naam ? "true" : undefined} className={s.pil}>
              {p.naam}
            </Link>
          ))}
        </div>
        <div className={s.keuzerij}>
          {(["alle", "verdeeld"] as const).map((v) => (
            <Link key={v} href={link({ variant: v })} aria-current={v === variant ? "true" : undefined} className={s.pil}>
              {v === "alle" ? "Alle stemmingen" : "Alleen verdeelde stemmingen"}
            </Link>
          ))}
        </div>
      </nav>

      {!periode || !ik ? (
        <LegeStaat label="Geen stemmingen" titel={`${f.afkorting} stemde niet mee in deze ${soort === "kabinet" ? "kabinetsperiode" : "Kamerperiode"}`}
          uitleg="Deze fractie bestond toen niet, of deed niet mee aan de stemmingen. Kies een andere periode." />
      ) : (
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)" }}>
          <Label>Met wie stemt {f.afkorting} het vaakst hetzelfde? · {periode.naam}</Label>
          <ol className={s.lijst}>
            {rijen.map(({ x, p }) => (
              <li key={x.id} className={s.rij}>
                <span className={s.naam}>{x.afkorting}</span>
                <span className={s.balkKader}>
                  {p && !p.teWeinig && p.cohesie != null ? (
                    <span className={s.balk} style={{ width: `${p.cohesie}%`, background: schaalkleur(p.cohesie) }} />
                  ) : (
                    <span className={`${s.balk} ${s.teWeinig}`} style={{ width: "100%" }} />
                  )}
                </span>
                <span className={s.waarde}>{p && !p.teWeinig ? procent(p.cohesie, 1) : "te weinig stemmingen"}</span>
                <span className={s.aantal}>{p ? `${getal(p.gezamenlijk)} stemmingen` : ""}</span>
              </li>
            ))}
          </ol>
          <Bronregel toelichting={`${periode.naam} · ${variant === "alle" ? "alle stemmingen" : "alleen verdeelde stemmingen"}`} />
          {/* Verder op de site (samentrekken, 25 oktober 2026): dezelfde fractie en periode in de andere tools */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--r-3)" }}>
            <Link href={`/verkenner?${new URLSearchParams({ soort, periode: periode.naam, variant, fractie: ik.afkorting }).toString()}`} className={knopKlasse}>
              Bekijk in de verkenner
            </Link>
            <Link href={`/onderwerpen?${new URLSearchParams({ soort, periode: periode.naam, variant, fractie: ik.afkorting }).toString()}`} className={knopKlasse}>
              {ik.afkorting} per onderwerp
            </Link>
            <Link href={`/coalitie?${new URLSearchParams({ soort, periode: periode.naam, groep: ik.afkorting }).toString()}`} className={knopKlasse}>
              Bij wie haalt {ik.afkorting} een meerderheid?
            </Link>
          </div>
        </section>
      )}
    </Inhoud>
  );
}

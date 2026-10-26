// De uitklap onder een beleidsterrein voor een paar fracties (component onderwerpen): de dossiers met een
// gestapelde balk, per dossier de stemmingen (verschillen eerst), en onderaan alle stemmingen in het terrein waarop
// het paar verschilde. Gedeeld door /onderwerpen en de fractiepagina's (verzoek Niels K5, 26 oktober 2026).
// href(extra) geeft de link naar dezelfde pagina met dit paar en dit terrein open, plus de extra keuzes.
import Link from "next/link";
import type { Periodesoort, Variant } from "@/lib/cohesie";
import { perDossier, stemmingenInTerrein, verschillen } from "@/lib/onderwerpen";
import { Data, Label, Tekst } from "@/components/Typografie";
import { ASIEL, AsielLezing } from "@/components/lezingen/AsielLezing";
import { terreinAnker } from "./TerreinBalken";
import { DossierLijst, StemLegenda, StemmingLijst } from "./Verdieping";

type Fractie = { id: string; afkorting: string };
type Props = {
  soort: Periodesoort; periode: string; variant: Variant; a: Fractie; b: Fractie; terrein: string;
  dossier: string | null; toonVerschillen: boolean; href: (extra: Record<string, string>) => string; sluitHref: string;
};

export async function TerreinUitklap({ soort, periode, variant, a, b, terrein, dossier, toonVerschillen, href, sluitHref }: Props) {
  const stemmingen = await stemmingenInTerrein(soort, periode, variant, terrein, a.id, b.id);
  if (!stemmingen) return <Tekst>De dossiers laden nu niet. Probeer het over een paar minuten nog eens.</Tekst>;
  const dossiers = perDossier(stemmingen);
  const open = dossiers.find((d) => d.dossier === dossier) ?? null;
  const anders = verschillen(stemmingen);
  const verschilt = (x: (typeof stemmingen)[number]) => Number(!!(x.a && x.b && x.a !== x.b));
  return (
    <>
      <Label>{terrein} · per dossier, van meest naar minst eens</Label>
      <StemLegenda a={a.afkorting} b={b.afkorting} />
      <Data>Geteld: de stemmingen waarop {a.afkorting} en {b.afkorting} allebei voor of tegen stemden. Klik op een dossier voor de stemmingen.</Data>
      <DossierLijst dossiers={dossiers} a={a.afkorting} b={b.afkorting} actief={open?.dossier ?? null}
        hrefVoor={(d) => `${href({ dossier: d })}#dossier-${d}`} sluitHref={`${sluitHref}#${terreinAnker(terrein)}`}
        uitklap={open ? (
          <StemmingLijst rijen={stemmingen.filter((r) => r.dossier === open.dossier).sort((x, y) => verschilt(y) - verschilt(x) || y.datum.localeCompare(x.datum))}
            a={a.afkorting} b={b.afkorting} titel={`${open.eens} van de ${open.samen} keer eens · verschillen eerst`} />
        ) : null} />
      {anders.length > 0 ? (
        <>
          <Data>
            <Link href={`${href(toonVerschillen ? {} : { alle: "1" })}#verschillen`} scroll={false} aria-expanded={toonVerschillen}>
              {toonVerschillen ? "▾" : "▸"} Alle {anders.length} {anders.length === 1 ? "stemming" : "stemmingen"} in {terrein} waarop {a.afkorting} en {b.afkorting} verschilden, nieuwste eerst
            </Link>
          </Data>
          {toonVerschillen && (
            <div id="verschillen" style={{ scrollMarginTop: 80 }}>
              <StemmingLijst rijen={anders} a={a.afkorting} b={b.afkorting} titel={`${terrein} · hier verschilden ${a.afkorting} en ${b.afkorting}`} />
            </div>
          )}
        </>
      ) : (
        <Tekst>Als ze allebei stemden, stemden ze in dit terrein steeds hetzelfde.</Tekst>
      )}
      {terrein === ASIEL && <AsielLezing soort={soort} periode={periode} variant={variant} a={a} b={b} />}
    </>
  );
}

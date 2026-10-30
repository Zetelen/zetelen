// Fracties per periode (component cohesie-pagina, herzien op feedback van Niels, 24 oktober 2026):
// een bullet chart op volgorde van zetels bij het begin van de periode, met per fractie kabinet,
// gedoogsteun of oppositie, en wie tijdens de periode naar een andere fractie overstapte.
import type { Metadata } from "next";
import Link from "next/link";
import { PeriodeKeuze } from "@/components/cohesie/PeriodeKeuze";
import { Inhoud, LegeStaat } from "@/components/Kader";
import { Data, Label, SectieKop, Tekst } from "@/components/Typografie";
import { Kern } from "@/components/Onderdelen";
import { fractiesOpvalt } from "@/lib/kern";
import { type Rol, alleFracties, coalitieVan, fractiesIn, keuzeUitUrl, overstappenIn, perioden, rolTekst, slug } from "@/lib/cohesie";
import { balken } from "@/lib/fracties";
import s from "@/components/cohesie/fractie.module.css";

export const metadata: Metadata = {
  title: "Fracties",
  description: "Alle fracties in de Tweede Kamer sinds 2010. Hoeveel zetels, kabinet of oppositie, en met wie stemden ze het vaakst hetzelfde?",
  alternates: { canonical: "/fracties" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Fracties({ searchParams }: Props) {
  const lijst = await perioden();
  const { soort, periode } = keuzeUitUrl(await searchParams, lijst);
  const [fracties, alle, rollen, overstappen] = await Promise.all([
    periode ? fractiesIn(soort, periode.naam) : null,
    alleFracties(),
    soort === "kabinet" && periode ? coalitieVan(periode.naam) : Promise.resolve(new Map<string, Rol>()),
    periode ? overstappenIn(soort, periode.naam) : Promise.resolve([]),
  ]);
  if (!fracties || !alle || !periode) {
    return (
      <Inhoud>
        <LegeStaat label="Niet bereikbaar" titel="De fracties laden nu niet" uitleg="Probeer het over een paar minuten nog eens." />
      </Inhoud>
    );
  }
  const { rijen, nieuw } = balken(fracties, overstappen);
  const max = Math.max(...rijen.map((r) => r.zetels), 1);
  const metRollen = soort === "kabinet" && rollen.size > 0;
  const soortRol = (rol: Rol | undefined) => (rol && !rol.tot ? rol.rol : rol ? "uit" : "oppositie");
  const kabinetZetels = rijen.filter((r) => rollen.get(r.fractie.afkorting)?.rol === "kabinet").reduce((t, r) => t + r.zetels, 0);
  const query = `?soort=${soort}&periode=${encodeURIComponent(periode.naam)}`;

  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)" }}>
        <Label>Fracties</Label>
        <SectieKop niveau={1}>Wie zit er in de Kamer?</SectieKop>
        {/* Kern van de pagina (K11, 27 oktober 2026) */}
        <Kern ziet="De fracties bij het begin van de gekozen periode, de grootste bovenaan, en wie er tijdens de periode overstapte."
          opvalt={fractiesOpvalt(soort, periode.naam, rijen)} />
        <Tekst>
          Het lichte stuk van een balk: Kamerleden die
          tijdens de periode overstapten naar een andere fractie. Kies een fractie en zie met wie ze het vaakst hetzelfde stemde.
        </Tekst>
        <PeriodeKeuze perioden={lijst} soort={soort} periode={periode.naam} pad="/fracties" />
        {metRollen && (
          <Data>
            Kabinet-{periode.naam} begon met {kabinetZetels} van de 150 zetels{kabinetZetels < 76 ? ", als minderheidskabinet" : ""}.
            Deze samenstelling wordt nog nagekeken.
          </Data>
        )}
      </section>

      <ol className={s.bullets} aria-label={`Fracties bij het begin van ${periode.naam}, op volgorde van zetels`}>
        {rijen.map(({ fractie: f, zetels, gebleven, delen }) => {
          const rol = rollen.get(f.afkorting);
          return (
            <li key={f.id}>
              <Link href={`/fracties/${slug(f.afkorting)}${query}`} className={s.bulletRij}>
                <span className={s.bulletNaam}>
                  <span className={s.tegelNaam}>{f.afkorting}</span>
                  {f.naam !== f.afkorting && <span className={s.bulletVoluit}>{f.naam}</span>}
                </span>
                <span className={s.bulletKolom}>
                  <span className={s.bulletBaan} aria-hidden="true">
                    <span className={s.bulletBalk} data-rol={soortRol(rol)} style={{ width: `${(100 * gebleven) / max}%` }} />
                    {delen.map((d) => (
                      <span key={d.naar} className={s.bulletDeel} style={{ width: `${(100 * d.leden) / max}%` }} />
                    ))}
                  </span>
                  {delen.length > 0 && (
                    <span className={s.bulletNoot}>{delen.map((d) => `${d.leden} naar ${d.naar}`).join(", ")}</span>
                  )}
                </span>
                <span className={s.bulletGetal}>{zetels}</span>
                {metRollen ? <span className={s.rol} data-rol={soortRol(rol)}>{rolTekst(rol)}</span> : <span />}
              </Link>
            </li>
          );
        })}
      </ol>

      {nieuw.length > 0 && (
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-3)" }}>
          <Label>Nieuw in de Kamer tijdens {periode.naam}</Label>
          <ul className={s.kolommen}>
            {nieuw.map(({ fractie: f, uit }) => (
              <li key={f.id}>
                <Link href={`/fracties/${slug(f.afkorting)}${query}`}>
                  {f.afkorting} <span className={s.bulletVoluit}>{f.zetels} zetels{uit.length ? `, uit ${uit.map((u) => u.van).join(" en ")}` : ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-3)" }}>
        <Label>Alle fracties sinds 2010</Label>
        <ul className={s.kolommen}>
          {alle.map((f) => (
            <li key={f.afkorting}><Link href={`/fracties/${slug(f.afkorting)}`}>{f.afkorting}</Link></li>
          ))}
        </ul>
      </section>
    </Inhoud>
  );
}

// Telefoon (component onderwerpen): in plaats van de kaart van terrein tegen fractie een regel per terrein
// met de spreiding; openklappen toont alle fracties als gesorteerde staafjes. Tikken op een fractie opent
// de vergelijking van het paar. Werkt zonder JavaScript (details en summary).
import Link from "next/link";
import { procent } from "@/lib/cohesie";
import { schaalkleur } from "@/lib/kleur";
import type { Paar } from "@/lib/zaal";
import s from "./onderwerpen.module.css";

type Fractie = { id: string; afkorting: string };

export function TerreinLijst({ terreinen, perTerrein, fracties, aantallen, hrefMet }: {
  terreinen: string[]; perTerrein: Map<string, Map<string, Paar>>; fracties: Fractie[]; aantallen: Map<string, number>;
  hrefMet: (afkorting: string) => string;
}) {
  return (
    <ul className={s.terreinLijst}>
      {terreinen.map((t) => {
        const rij = fracties.map((f) => ({ f, p: perTerrein.get(t)?.get(f.id) }))
          .map((x) => ({ ...x, c: x.p && !x.p.teWeinig && x.p.cohesie != null ? x.p.cohesie : null }))
          .sort((x, y) => (y.c ?? -1) - (x.c ?? -1));
        const geldig = rij.filter((x) => x.c != null);
        const hoog = geldig[0], laag = geldig[geldig.length - 1];
        return (
          <li key={t}>
            <details>
              <summary>
                <strong>{t}</strong>
                <span className={s.aantal}>{aantallen.get(t)} stemmingen</span>
                <span className={s.spreiding}>
                  {hoog && laag && hoog !== laag
                    ? `vaakst eens met ${hoog.f.afkorting} ${procent(hoog.c)}, minst vaak met ${laag.f.afkorting} ${procent(laag.c)}`
                    : "te weinig stemmingen"}
                </span>
                {/* Zichtbaar dat de regel uitklapt (feedback Niels, 27 oktober 2026) */}
                <span className={s.uitklapHint} aria-hidden="true">
                  <span className={s.dicht}>Toon alle fracties</span><span className={s.open}>Verberg</span>
                </span>
              </summary>
              <ol className={s.staafjes}>
                {rij.map(({ f, c }) => (
                  <li key={f.id}>
                    <Link href={hrefMet(f.afkorting)}>
                      <span className={s.staafNaam}>{f.afkorting}</span>
                      <span className={s.staafBaan} aria-hidden="true">
                        {c != null ? <span style={{ width: `${c}%`, background: schaalkleur(c) }} /> : <span className={s.teWeinig} />}
                      </span>
                      <span className={s.staafWaarde}>{c != null ? procent(c) : "–"}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </details>
          </li>
        );
      })}
    </ul>
  );
}

// Cohesie van een paar fracties per beleidsterrein (component onderwerpen): een balk per terrein in de
// kleur van de schaal, met de cohesie over alle stemmingen als verticale lijn ter vergelijking.
import { getal, procent } from "@/lib/cohesie";
import { schaalkleur } from "@/lib/kleur";
import type { TerreinPaar } from "@/lib/onderwerpen";
import s from "./onderwerpen.module.css";

export function TerreinBalken({ lijst, totaal, label }: { lijst: TerreinPaar[]; totaal?: number | null; label: string }) {
  return (
    <ol className={s.balken} aria-label={label}>
      {lijst.map((p) => {
        const geldig = !p.teWeinig && p.cohesie != null;
        return (
          <li key={p.terrein} className={s.balkRij}>
            <span className={s.terrein}>
              {p.terrein}
              <span className={s.aantal}>{getal(p.gezamenlijk)} stemmingen samen</span>
            </span>
            <span className={s.baan} aria-hidden="true">
              {geldig ? <span style={{ width: `${p.cohesie}%`, background: schaalkleur(p.cohesie!) }} /> : <span className={s.teWeinig} />}
              {totaal != null && <span className={s.referentie} style={{ left: `${totaal}%` }} />}
            </span>
            <span className={s.waarde}>{geldig ? procent(p.cohesie) : "te weinig"}</span>
          </li>
        );
      })}
    </ol>
  );
}

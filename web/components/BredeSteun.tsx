// Grafiek op de voorpagina (feedback Niels K3, 26 oktober 2026): per kabinet het deel van de ingediende moties en
// amendementen dat het haalde met stemmen van kabinet én oppositie. Statische tekening, geen klikken.
import type { BredeSteun as Rij } from "@/lib/voorpagina";
import s from "./bredeSteun.module.css";

const B = 720, H = 300, L = 44, O = 40, T = 24;

export function BredeSteun({ rijen }: { rijen: Rij[] }) {
  const max = 60;
  const sy = (p: number) => Math.round(T + (1 - p / max) * (H - T - O));
  const groep = (B - L) / rijen.length, staaf = Math.min(34, groep / 3);
  const pct = (p: number | null) => (p == null ? "" : `${Math.round(p)}%`);
  return (
    <figure className={s.figuur}>
      <svg viewBox={`0 0 ${B} ${H}`} role="img"
        aria-label={`Aangenomen met stemmen van kabinet én oppositie, als deel van alles wat is ingediend, per kabinet: ${rijen.map((r) => `${r.kabinet} moties ${pct(r.moties)}, amendementen ${pct(r.amendementen)}`).join("; ")}`}>
        {[0, 20, 40, 60].map((p) => (
          <g key={p}>
            <line x1={L} x2={B} y1={sy(p)} y2={sy(p)} className={s.lijn} />
            <text x={L - 8} y={sy(p) + 4} textAnchor="end" className={s.as}>{p}%</text>
          </g>
        ))}
        {rijen.map((r, i) => {
          const x = Math.round(L + i * groep + groep / 2);
          return (
            <g key={r.kabinet}>
              {r.moties != null && <rect x={x - staaf - 2} y={sy(r.moties)} width={staaf} height={sy(0) - sy(r.moties)} className={s.motie} />}
              {r.amendementen != null && <rect x={x + 2} y={sy(r.amendementen)} width={staaf} height={sy(0) - sy(r.amendementen)} className={s.amendement} />}
              {r.moties != null && <text x={x - staaf / 2 - 2} y={sy(r.moties) - 6} textAnchor="middle" className={s.waarde}>{pct(r.moties)}</text>}
              {r.amendementen != null && <text x={x + staaf / 2 + 2} y={sy(r.amendementen) - 6} textAnchor="middle" className={s.waarde}>{pct(r.amendementen)}</text>}
              <text x={x} y={H - O + 22} textAnchor="middle" className={s.kabinet}>{r.kabinet}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className={s.legenda}>
        <span><i className={s.motie} /> moties</span>
        <span><i className={s.amendement} /> amendementen (wijzigingen in een wetsvoorstel)</span>
      </figcaption>
    </figure>
  );
}

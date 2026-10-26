// Spreidingsdiagram voor zetelwerk (feedback Niels K5, 26 oktober 2026): horizontaal het aantal ingediende stukken,
// verticaal het aandeel dat is aangenomen. Een stip per fractie of Kamerlid, gekleurd naar kabinet of oppositie.
// Labels zonder overlap met dezelfde plaatsing als Oppositiewerk. Alleen punten met minstens 10 stukken.
import { ROL_TINT, plaatsLabels } from "@/lib/oppositie";
import s from "./zetelwerk.module.css";

export type Punt = { key: string; label: string; x: number; y: number; rol: string; href?: string; metLabel?: boolean };

const B = 900, H = 470, L = 64, R = 24, T = 24, O = 56;

function rondAf(max: number): number {
  const stap = max <= 50 ? 10 : max <= 200 ? 50 : max <= 1000 ? 100 : 500;
  return Math.max(stap, Math.ceil(max / stap) * stap);
}

export function Spreiding({ punten, xLabel, label }: { punten: Punt[]; xLabel: string; label: string }) {
  const xMax = rondAf(Math.max(1, ...punten.map((p) => p.x)) * 1.05);
  const sx = (x: number) => L + (x / xMax) * (B - L - R);
  const sy = (y: number) => T + (1 - y / 100) * (H - T - O);
  const stappenX = Array.from({ length: 5 }, (_, i) => Math.round((xMax / 4) * i));
  const geplaatst = plaatsLabels(
    punten.filter((p) => p.metLabel !== false).map((p) => ({ x: sx(p.x), y: sy(p.y), r: 7, tekst: p.label, tint: ROL_TINT[p.rol] })),
    [],
    { x0: L, y0: 0, x1: B, y1: H - O + 10 },
  );
  return (
    <figure className={s.spreiding}>
      <svg viewBox={`0 0 ${B} ${H}`} role="img" aria-label={label}>
        {[0, 25, 50, 75, 100].map((y) => (
          <g key={y}>
            <line x1={L} x2={B - R} y1={sy(y)} y2={sy(y)} className={s.raster} />
            <text x={L - 10} y={sy(y) + 4} textAnchor="end" className={s.as}>{y}%</text>
          </g>
        ))}
        {stappenX.map((x) => (
          <text key={x} x={sx(x)} y={H - O + 22} textAnchor="middle" className={s.as}>{x.toLocaleString("nl-NL")}</text>
        ))}
        <text x={B - R} y={H - 8} textAnchor="end" className={s.as}>{xLabel} →</text>
        <text x={L} y={12} textAnchor="start" className={s.as}>↑ aandeel aangenomen</text>
        {geplaatst.lijnen.map((l, i) => <path key={i} d={l.d} className={s.lijntje} style={{ stroke: l.tint }} />)}
        {punten.map((p) => {
          const stip = <circle cx={sx(p.x)} cy={sy(p.y)} r={7} style={{ fill: ROL_TINT[p.rol] ?? ROL_TINT.onbekend }} className={s.stip}><title>{`${p.label}: ${Math.round(p.y)}% van ${p.x} aangenomen`}</title></circle>;
          return p.href ? <a key={p.key} href={p.href}>{stip}</a> : <g key={p.key}>{stip}</g>;
        })}
        {geplaatst.labels.map((l, i) => (
          <text key={i} x={l.x} y={l.y} textAnchor={l.anchor} className={s.puntLabel} style={{ fill: l.tint }}>{l.tekst}</text>
        ))}
      </svg>
      <figcaption className={s.legenda}>
        <span><i style={{ background: ROL_TINT.kabinet }} /> kabinet</span>
        <span><i style={{ background: ROL_TINT.oppositie }} /> oppositie</span>
        <span>Alleen met minstens 10 ingediende stukken.</span>
      </figcaption>
    </figure>
  );
}

// Grafieken voor de vaste lezingen: een lijn per paar fracties door de kabinetten (met een gouden stip waar ze
// samen regeerden), en een haltergrafiek die twee waarden per rij verbindt. Servercomponenten, gewone SVG.
import s from "./lezingen.module.css";

export type Reeks = { naam: string; tint: string; punten: Array<{ kabinet: string; waarde: number | null; samen: boolean }> };

export function LijnKabinetten({ kabinetten, reeksen, label }: { kabinetten: string[]; reeksen: Reeks[]; label: string }) {
  const B = 760, H = 300, L = 50, R = 120, T = 20, O = 40;
  const x = (i: number) => L + (i * (B - L - R)) / Math.max(1, kabinetten.length - 1);
  const y = (v: number) => T + ((100 - v) / 60) * (H - T - O); // as van 40 tot 100%
  return (
    <svg viewBox={`0 0 ${B} ${H}`} className={s.grafiek} role="img" aria-label={label}>
      {[40, 60, 80, 100].map((v) => (
        <g key={v}>
          <line x1={L} x2={B - R} y1={y(v)} y2={y(v)} className={s.raster} />
          <text x={L - 8} y={y(v) + 4} textAnchor="end" className={s.as}>{v}%</text>
        </g>
      ))}
      {kabinetten.map((k, i) => <text key={k} x={x(i)} y={H - 12} textAnchor="middle" className={s.as}>{k}</text>)}
      {reeksen.map((r) => {
        const pt = r.punten.map((p) => ({ ...p, i: kabinetten.indexOf(p.kabinet) })).filter((p) => p.waarde != null && p.i >= 0);
        const laatste = pt[pt.length - 1];
        return (
          <g key={r.naam}>
            <path d={`M${pt.map((p) => `${x(p.i)},${y(p.waarde!)}`).join(" L")}`} className={s.lijn} style={{ stroke: r.tint }} />
            {pt.map((p) => (
              <circle key={p.kabinet} cx={x(p.i)} cy={y(p.waarde!)} r={p.samen ? 7 : 4.5} className={s.punt}
                style={{ fill: p.samen ? "var(--goud)" : r.tint, stroke: p.samen ? r.tint : "none" }}>
                <title>{`${r.naam}, ${p.kabinet}: ${Math.round(p.waarde!)}%${p.samen ? ", samen in het kabinet" : ""}`}</title>
              </circle>
            ))}
            {laatste && <text x={x(laatste.i) + 12} y={y(laatste.waarde!) + 4} className={s.reeksnaam} style={{ fill: r.tint }}>{r.naam}</text>}
          </g>
        );
      })}
    </svg>
  );
}

export function Halter({ rijen, a, b, label }: { rijen: Array<{ naam: string; a: number; b: number }>; a: { naam: string; tint: string }; b: { naam: string; tint: string }; label: string }) {
  const B = 760, L = 150, R = 60, RIJ = 30, T = 46;
  const H = T + rijen.length * RIJ + 10;
  const x = (v: number) => L + (v / 100) * (B - L - R);
  return (
    <svg viewBox={`0 0 ${B} ${H}`} className={s.grafiek} role="img" aria-label={label}>
      <text x={L} y={14} className={s.as} style={{ fill: a.tint }}>● {a.naam}</text>
      <text x={L} y={32} className={s.as} style={{ fill: b.tint }}>● {b.naam}</text>
      {[0, 50, 100].map((v) => <line key={v} x1={x(v)} x2={x(v)} y1={T - 6} y2={H - 6} className={s.raster} />)}
      {rijen.map((r, i) => {
        const yy = T + i * RIJ + RIJ / 2;
        return (
          <g key={r.naam}>
            <text x={L - 10} y={yy + 4} textAnchor="end" className={s.rijnaam}>{r.naam}</text>
            <line x1={x(r.a)} x2={x(r.b)} y1={yy} y2={yy} className={s.halter} />
            <circle cx={x(r.a)} cy={yy} r={6} style={{ fill: a.tint }}><title>{`${r.naam}, ${a.naam}: ${Math.round(r.a)}%`}</title></circle>
            <circle cx={x(r.b)} cy={yy} r={6} style={{ fill: b.tint }}><title>{`${r.naam}, ${b.naam}: ${Math.round(r.b)}%`}</title></circle>
            <text x={Math.max(x(r.a), x(r.b)) + 12} y={yy + 4} className={s.as}>{Math.round(r.a)}% · {Math.round(r.b)}%</text>
          </g>
        );
      })}
    </svg>
  );
}

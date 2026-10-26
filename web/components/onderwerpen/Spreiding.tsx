"use client";
// Spreidingsdiagram voor een paar fracties (verzoek Niels, 26 oktober 2026): elk punt een beleidsterrein, naar rechts
// meer stemmingen samen (logaritmisch), naar boven vaker hetzelfde gestemd. Klik op een terrein en de dossiers
// daarbinnen worden de punten. De keuze staat in de URL; klikken verschuift de pagina niet.
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { procent } from "@/lib/cohesie";
import { schaalkleur } from "@/lib/kleur";
import s from "./onderwerpen.module.css";

export type Punt = { sleutel: string; label: string; samen: number; cohesie: number; href: string; klein: boolean; actief?: boolean };

const B = 1000, H = 520, L = 70, R = 30, T = 20, O = 60;

export function Spreiding({ punten, eenheid, labelVanaf, beschrijving }: { punten: Punt[]; eenheid: string; labelVanaf: number; beschrijving: string }) {
  const router = useRouter();
  if (!punten.length) return null;
  // Logaritmische x-as, afgerond op machten van 10 met tussenstappen
  const max = Math.max(...punten.map((p) => p.samen)), min = Math.max(1, Math.min(...punten.map((p) => p.samen)));
  const lo = Math.log10(Math.max(1, min * 0.7)), hi = Math.log10(max * 1.3);
  // Y-as over het bereik in de data (afgerond op 10), zodat punten niet op een kluitje bovenin staan.
  // Afgerond op een tiende pixel: server en browser rekenen dan precies hetzelfde.
  const bodem = Math.max(0, Math.floor((Math.min(...punten.map((p) => p.cohesie)) - 5) / 10) * 10);
  const rnd = (x: number) => Math.round(x * 10) / 10;
  const sx = (n: number) => rnd(L + ((Math.log10(Math.max(1, n)) - lo) / (hi - lo)) * (B - L - R));
  const sy = (c: number) => rnd(T + (1 - (c - bodem) / (100 - bodem)) * (H - T - O));
  const streepjes = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000].filter((n) => Math.log10(n) >= lo && Math.log10(n) <= hi);
  const ga = (e: MouseEvent, href: string) => { e.preventDefault(); router.push(href, { scroll: false }); };
  // Labels: bij de grootste punten en altijd bij het actieve punt, en alleen als ze niet over een ander label
  // vallen (rechts, links, boven of onder het punt; anders alleen de tooltip)
  const geplaatst: Array<{ x: number; y: number; b: number }> = [];
  const plek = new Map<string, { x: number; y: number; anker: "start" | "end" }>();
  const kandidaten = punten.filter((p) => p.samen >= labelVanaf || p.actief).sort((a, b) => Number(!!b.actief) - Number(!!a.actief) || b.samen - a.samen);
  for (const p of kandidaten) {
    const tekst = p.label.length > 34 ? 33 : p.label.length;
    const b = tekst * 7.4, cx = sx(p.samen), cy = sy(p.cohesie);
    const opties = [{ x: cx + 12, y: cy + 4, anker: "start" as const }, { x: cx - 12, y: cy + 4, anker: "end" as const },
      { x: cx + 8, y: cy - 12, anker: "start" as const }, { x: cx + 8, y: cy + 20, anker: "start" as const }];
    const vrij = opties.find((o) => {
      const x0 = o.anker === "start" ? o.x : o.x - b;
      if (x0 < 0 || x0 + b > B + 60) return false;
      return !geplaatst.some((g) => x0 < g.x + g.b && x0 + b > g.x && Math.abs(o.y - g.y) < 16);
    });
    if (!vrij) continue;
    geplaatst.push({ x: vrij.anker === "start" ? vrij.x : vrij.x - b, y: vrij.y, b });
    plek.set(p.sleutel, vrij);
  }
  return (
    <figure className={s.spreiding}>
      <svg viewBox={`0 0 ${B} ${H}`} role="img" aria-label={beschrijving}>
        {Array.from({ length: (100 - bodem) / 10 + 1 }, (_, i) => bodem + i * 10).filter((c) => (100 - bodem) <= 50 || c % 20 === 0 || c === 100).map((c) => (
          <g key={c}>
            <line x1={L} x2={B - R} y1={sy(c)} y2={sy(c)} className={s.spreidingLijn} />
            <text x={L - 10} y={sy(c) + 4} textAnchor="end" className={s.spreidingAs}>{c}%</text>
          </g>
        ))}
        {streepjes.map((n) => (
          <text key={n} x={sx(n)} y={H - O + 22} textAnchor="middle" className={s.spreidingAs}>{n.toLocaleString("nl-NL")}</text>
        ))}
        <text x={B - R} y={H - 8} textAnchor="end" className={s.spreidingAs}>{eenheid} samen gestemd (logaritmisch) →</text>
        <text x={L - 10} y={H - O + 46} textAnchor="end" className={s.spreidingAs}>↑ hetzelfde</text>
        {punten.map((p) => (
          <a key={p.sleutel} href={p.href} onClick={(e) => ga(e, p.href)} className={s.spreidingPunt} data-klein={p.klein || undefined} data-actief={p.actief || undefined}>
            <title>{`${p.label}: ${procent(p.cohesie)} hetzelfde, ${p.samen} ${eenheid} samen`}</title>
            <circle cx={sx(p.samen)} cy={sy(p.cohesie)} r={p.actief ? 10 : 7} style={{ fill: p.klein ? "transparent" : schaalkleur(p.cohesie), stroke: schaalkleur(p.cohesie) }} />
            {plek.has(p.sleutel) && (
              <text x={plek.get(p.sleutel)!.x} y={plek.get(p.sleutel)!.y} textAnchor={plek.get(p.sleutel)!.anker} className={s.spreidingLabel}>
                {p.label.length > 34 ? `${p.label.slice(0, 32)}…` : p.label}
              </text>
            )}
          </a>
        ))}
      </svg>
    </figure>
  );
}

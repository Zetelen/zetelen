// Tekstcomponenten van het ontwerpsysteem: koppen, lopende tekst, labels, datalabels en cijfers
import type { ReactNode } from "react";
import s from "./typografie.module.css";

export function HeroKop({ children }: { children: ReactNode }) {
  return <h1 className={s.hero}>{children}</h1>;
}

// Met niveau 1 is de sectiekop de H1 van een pagina zonder HeroKop: zelfde stijl, andere tag (SEO-audit 26 oktober)
export function SectieKop({ children, id, niveau = 2 }: { children: ReactNode; id?: string; niveau?: 1 | 2 }) {
  const Kop = niveau === 1 ? "h1" : "h2";
  return (
    <Kop className={s.sectie} id={id}>
      {children}
    </Kop>
  );
}

export function Tekst({ children }: { children: ReactNode }) {
  return <p className={s.tekst}>{children}</p>;
}

// Rubriekslabel: kleine kapitalen in koper
export function Label({ children }: { children: ReactNode }) {
  return <span className={s.label}>{children}</span>;
}

// Datalabel en bronvermelding in DM Mono
export function Data({ children }: { children: ReactNode }) {
  return <span className={s.data}>{children}</span>;
}

// Uitgelicht cijfer, bijvoorbeeld een cohesie in procenten
export function Cijfer({ children }: { children: ReactNode }) {
  return <span className={s.cijfer}>{children}</span>;
}

// Woordmerk (merk van 28 oktober 2026): een kleine zaal in het verloop van koper naar goud, met "zetelen" in Fraunces.
// Het volledige merk met 150 zetels staat in video/src/merk.tsx; hier twee rijen, zodat het op 22 pixels leesbaar blijft.
const MINI = [[0.5, 5], [0.86, 9]].flatMap(([r, n], ri) => Array.from({ length: n }, (_, i) => {
  const a = Math.PI - (Math.PI * i) / (n - 1);
  const t = Math.sin(a) * (ri ? 1 : 0.7);
  return { x: 16 + Math.cos(a) * r * 14, y: 21 - Math.sin(a) * r * 14, kleur: t > 0.85 ? "#FFE4A3" : t > 0.6 ? "#E9A866" : t > 0.3 ? "#D08A55" : "#A66A42" };
}));

export function Woordmerk() {
  return (
    <a href="/" className={s.woordmerk} aria-label="Zetelen, naar de voorpagina">
      <svg width="32" height="24" viewBox="0 0 32 24" aria-hidden="true">
        {MINI.map((z, i) => <circle key={i} cx={z.x.toFixed(1)} cy={z.y.toFixed(1)} r={1.7} fill={z.kleur} />)}
      </svg>
      zetelen
    </a>
  );
}

"use client";
// Scroll graphic (ontwerp: docs/ontwerp/scroll-graphics.md): een vaste tekening met tekstkaarten die
// eroverheen scrollen. Staat een kaart het dichtst bij het midden van het scherm, dan schuiven de stippen naar
// hun plek in die stap. Alleen kijken, geen klikken. Plekken rekent de server uit (lib/verhaal.ts).
import { useEffect, useRef, useState } from "react";
import type { Stap, Verhaal } from "@/lib/verhaal";
import { MIDDEN } from "@/lib/zaal";
import s from "./verhaal.module.css";

export function ScrollVerhaal({ verhaal, label, hoogteSmal = 555 }: { verhaal: Verhaal; label: string; hoogteSmal?: number }) {
  const [smal, setSmal] = useState(false);
  const [actief, setActief] = useState(0);
  const lijst = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const m = matchMedia("(max-width: 640px)");
    const kies = () => setSmal(m.matches);
    kies();
    m.addEventListener("change", kies);
    return () => m.removeEventListener("change", kies);
  }, []);

  // Actieve stap: de kaart waarvan de tekst het dichtst bij het midden van het scherm staat.
  // Rekenen bij het scrollen, hooguit een keer per beeldje (requestAnimationFrame).
  useEffect(() => {
    let wacht = false;
    const kies = () => {
      wacht = false;
      const kaarten = lijst.current?.querySelectorAll<HTMLElement>("[data-stap] > div") ?? [];
      let beste = 0, afstand = Infinity;
      kaarten.forEach((k, i) => {
        const r = k.getBoundingClientRect();
        const d = Math.abs((r.top + r.bottom) / 2 - innerHeight / 2);
        if (d < afstand) { afstand = d; beste = i; }
      });
      setActief(beste);
    };
    const bijScroll = () => { if (!wacht) { wacht = true; requestAnimationFrame(kies); } };
    kies();
    addEventListener("scroll", bijScroll, { passive: true });
    addEventListener("resize", bijScroll);
    return () => { removeEventListener("scroll", bijScroll); removeEventListener("resize", bijScroll); };
  }, []);

  const stappen: Stap[] = smal && verhaal.smal ? verhaal.smal : verhaal.breed;
  const stap = stappen[actief] ?? stappen[0];
  // Alle stippen die ooit voorkomen, zodat een stip die verdwijnt kan uitfaden
  const alle = [...new Set(stappen.flatMap((st) => st.stippen.map((p) => p.key)))];
  const hier = new Map(stap.stippen.map((p) => [p.key, p]));
  const hoogte = smal ? hoogteSmal : 555;

  return (
    <div className={s.verhaal}>
      <div className={s.figuur}>
        <svg viewBox={`-60 -50 1120 ${hoogte}`} className={s.svg} role="img" aria-label={`${label}: ${stap.datum}. ${stap.tekst}`}>
          {alle.map((k) => {
            const p = hier.get(k);
            return (
              <circle key={k} r={10.5} className={s.stip} data-kleur={p?.kleur ?? ""} data-weg={p ? "nee" : "ja"}
                style={{ transform: p ? `translate(${p.x}px, ${p.y}px)` : `translate(${MIDDEN.x}px, ${MIDDEN.y}px)` }} />
            );
          })}
          <g aria-hidden="true">
            {stap.labels.map((l, i) => (
              <text key={`${actief}-${i}`} x={l.x} y={l.y} textAnchor={l.anchor} className={s.label}>
                {l.tekst}{l.waarde ? <tspan className={s.waarde}> {l.waarde}</tspan> : null}
              </text>
            ))}
            {stap.groot && (
              <>
                <text x={MIDDEN.x} y={MIDDEN.y - 40} className={s.groot}>{stap.groot}</text>
                <text x={MIDDEN.x} y={MIDDEN.y - 8} className={s.klein}>{stap.klein}</text>
              </>
            )}
          </g>
        </svg>
      </div>
      <ol className={s.kaarten} ref={lijst}>
        {verhaal.breed.map((st, i) => (
          <li key={i} data-stap={i} className={s.kaart} data-actief={i === actief}>
            <div>
              <span className={s.datum}>{st.datum}</span>
              {st.tekst}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

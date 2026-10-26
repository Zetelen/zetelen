"use client";
// Scroll graphic (ontwerp: docs/ontwerp/scroll-graphics.md): een vaste tekening met tekstkaarten ernaast
// (tijdlijn) of eroverheen. Staat een kaart het dichtst bij het midden van het scherm, dan schuiven de
// stippen naar hun plek in die stap. Alleen kijken, geen klikken. Plekken rekent de server uit (lib/verhaal.ts).
import Link from "next/link";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import type { Stap, Verhaal } from "@/lib/verhaal";
import { MIDDEN } from "@/lib/zaal";
import s from "./verhaal.module.css";

type Props = {
  verhaal: Verhaal;
  label: string;
  hoogteSmal?: number; // hoogte van de tekening op smalle schermen (viewBox)
  breedteSmal?: number; // breedte van een eigen telefoontekening (viewBox); zonder: dezelfde breedte als op desktop
  stapHoogte?: string; // scrollafstand per stap
  tijdlijn?: boolean; // kaarten links als tijdlijn, tekening rechts (op brede schermen)
  breed?: boolean; // tekening over de volle breedte, kaarten eronder (feedback Niels K2, 26 oktober 2026)
};

// Sleutel naar de inhoud; komt dezelfde inhoud vaker voor in een stap, dan telt het hoeveelste exemplaar mee
function sleutel(basis: string, i: number, alle: string[]): string {
  return `${basis}#${alle.slice(0, i).filter((x) => x === basis).length}`;
}

export function ScrollVerhaal({ verhaal, label, hoogteSmal = 555, breedteSmal, stapHoogte = "100vh", tijdlijn = false, breed = false }: Props) {
  const [smal, setSmal] = useState(false);
  const [actief, setActief] = useState(0);
  const lijst = useRef<HTMLOListElement>(null);
  const tekening = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const m = matchMedia("(max-width: 640px)");
    const kies = () => setSmal(m.matches);
    kies();
    m.addEventListener("change", kies);
    return () => m.removeEventListener("change", kies);
  }, []);

  // Actieve stap. Breed scherm: de kaart waarvan de tekst het dichtst bij het midden van het scherm staat.
  // Telefoon en tablet (kaarten over de tekening): een stap wisselt zodra de volgende kaart onderin binnenkomt, en
  // een kaart vervaagt zodra hij over de tekening schuift. Zo gebeurt elke verandering in een vrij beeld (feedback
  // Niels, 26 oktober 2026: op de telefoon schoof de tekst over de veranderende tekening).
  // Rekenen bij het scrollen, hooguit een keer per beeldje (requestAnimationFrame).
  useEffect(() => {
    let wacht = false;
    const kies = () => {
      wacht = false;
      const kaarten = lijst.current?.querySelectorAll<HTMLElement>("[data-stap] > div") ?? [];
      // Breed (tekening over de volle breedte) werkt op elk scherm zo: de tekst schuift onder de tekening door
      // (feedback Niels K2, 26 oktober 2026: met vaste tekst leek de pagina op te houden)
      const over = breed || innerWidth <= 900;
      let beste = 0, afstand = Infinity;
      if (over) {
        const onder = tekening.current?.getBoundingClientRect().bottom ?? innerHeight * 0.5;
        kaarten.forEach((k, i) => {
          const r = k.getBoundingClientRect();
          if (r.top < innerHeight * 0.85) beste = i;
          // Zichtbaar onder de tekening, weg in de 100 pixels erboven
          k.style.setProperty("--zicht", String(Math.min(1, Math.max(0, (r.top - (onder - 100)) / 100))));
        });
      } else {
        const leeslijn = innerHeight * 0.5;
        kaarten.forEach((k, i) => {
          const r = k.getBoundingClientRect();
          k.style.removeProperty("--zicht");
          const d = Math.abs((r.top + r.bottom) / 2 - leeslijn);
          if (d < afstand) { afstand = d; beste = i; }
        });
      }
      setActief(beste);
    };
    const bijScroll = () => { if (!wacht) { wacht = true; requestAnimationFrame(kies); } };
    kies();
    addEventListener("scroll", bijScroll, { passive: true });
    addEventListener("resize", bijScroll);
    return () => { removeEventListener("scroll", bijScroll); removeEventListener("resize", bijScroll); };
  }, [breed]);

  const stappen: Stap[] = smal && verhaal.smal ? verhaal.smal : verhaal.breed;
  const stap = stappen[actief] ?? stappen[0];
  // Alle stippen die ooit voorkomen, zodat een stip die verdwijnt kan uitfaden
  const alle = [...new Set(stappen.flatMap((st) => st.stippen.map((p) => p.key)))];
  const hier = new Map(stap.stippen.map((p) => [p.key, p]));
  const hoogte = smal ? hoogteSmal : 555;
  // Breed: de titel van het lopende hoofdstuk staat boven de tekening, niet eronder (feedback Niels K2, 26 oktober 2026)
  const kop = breed ? stappen.slice(0, actief + 1).map((st) => st.hoofdstuk).filter(Boolean).pop() : undefined;

  return (
    <div className={s.verhaal} data-tijdlijn={tijdlijn && !breed} data-breed={breed} style={{ "--stap": stapHoogte } as CSSProperties}>
      <div className={s.figuur}>
        {kop && <div className={s.figuurKop} aria-hidden="true">{kop}</div>}
        <svg ref={tekening} viewBox={smal && breedteSmal ? `-40 -50 ${breedteSmal} ${hoogte}` : `-60 -50 1120 ${hoogte}`} className={s.svg} role="img" aria-label={`${label}: ${stap.datum}. ${stap.tekst}`}>
          {/* Sleutels naar de inhoud, niet naar de stap: een as of lijn die in de volgende stap terugkomt blijft staan
              en flitst niet opnieuw in (feedback Niels K2, 26 oktober 2026) */}
          <g aria-hidden="true">
            {stap.paden?.map((p, i) => (
              <path key={sleutel(`p${p.d}${p.tint}${p.streep}`, i, stap.paden!.map((q) => `p${q.d}${q.tint}${q.streep}`))} d={p.d} className={s.pad} data-zacht={p.zacht ? "ja" : undefined}
                style={{ stroke: p.tint, strokeWidth: p.breedte, strokeDasharray: p.streep ? "4 6" : undefined }} />
            ))}
          </g>
          {alle.map((k) => {
            const p = hier.get(k);
            return (
              <circle key={k} r={p?.r ?? 10.5} className={s.stip} data-kleur={p?.kleur ?? ""} data-weg={p ? "nee" : "ja"}
                style={{ fill: p?.kleur === "hol" ? "var(--nacht-950)" : p?.tint, stroke: p?.kleur === "hol" ? p.tint : undefined,
                  transform: p ? `translate(${p.x}px, ${p.y}px)` : `translate(${MIDDEN.x}px, ${MIDDEN.y}px)` }} />
            );
          })}
          <g aria-hidden="true">
            {stap.kaders?.map((k, i) => (
              <rect key={sleutel(`k${k.x},${k.y},${k.b},${k.h}`, i, stap.kaders!.map((q) => `k${q.x},${q.y},${q.b},${q.h}`))} x={k.x} y={k.y} width={k.b} height={k.h} rx={8} className={s.kader} style={k.tint ? { stroke: k.tint } : undefined} />
            ))}
            {stap.labels.map((l, i) => (
              <text key={sleutel(`l${l.tekst}${l.x},${l.y}`, i, stap.labels.map((q) => `l${q.tekst}${q.x},${q.y}`))} x={l.x} y={l.y} textAnchor={l.anchor} className={s.label} data-halo={l.halo ? "ja" : undefined}
                data-zacht={l.zacht ? "ja" : undefined} data-groot={l.groot ? "ja" : undefined} style={l.tint ? { fill: l.tint } : undefined}>
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
            <div data-lezing={st.lezing}>
              {st.hoofdstuk && <span className={s.hoofdstuk}>{st.hoofdstuk}</span>}
              {st.lezing ? <span className={s.lezingKop}>{st.datum} · {st.lezing} van 2</span> : <span className={s.datum}>{st.datum}</span>}
              {st.tekst}
              {st.link && <Link href={st.link.href} className={s.verder}>{st.link.tekst} →</Link>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

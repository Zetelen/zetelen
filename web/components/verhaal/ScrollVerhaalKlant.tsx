"use client";
// Scroll graphic (ontwerp: docs/ontwerp/scroll-graphics.md): een vaste tekening met tekstkaarten ernaast
// (tijdlijn) of eroverheen. Staat een kaart het dichtst bij het midden van het scherm, dan schuiven de
// stippen naar hun plek in die stap. Alleen kijken, geen klikken. Plekken rekent de server uit (lib/verhaal.ts) en
// stuurt ze ingepakt mee (lib/verhaalPak.ts, via ScrollVerhaal.tsx); hier worden ze uitgepakt.
import Link from "next/link";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import type { Stap } from "@/lib/verhaal";
import { type GepaktVerhaal, pakUit } from "@/lib/verhaalPak";
import { KORT } from "@/lib/verhaal";
import { MIDDEN } from "@/lib/zaal";
import s from "./verhaal.module.css";

export type Props = {
  gepakt: GepaktVerhaal;
  label: string;
  hoogteSmal?: number; // hoogte van de tekening op smalle schermen (viewBox)
  breedteSmal?: number; // breedte van een eigen telefoontekening (viewBox); zonder: dezelfde breedte als op desktop
  stapHoogte?: string; // scrollafstand per stap
  tijdlijn?: boolean; // kaarten links als tijdlijn, tekening rechts (op brede schermen)
  breed?: boolean; // tekening over de volle breedte, kaarten eronder (feedback Niels K2, 26 oktober 2026)
};

// De omvang van alles wat in een van de stappen staat: stippen, labels (geschat op hun lengte), kaders en paden niet
// (die liggen binnen de stippen of zijn assen); met wat ruimte eromheen
type Box = { x: number; y: number; b: number; h: number };
function omvang(stappen: Stap[]): Box {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const neem = (a: number, b: number, c: number, d: number) => { x0 = Math.min(x0, a); y0 = Math.min(y0, b); x1 = Math.max(x1, c); y1 = Math.max(y1, d); };
  for (const st of stappen) {
    for (const p of st.stippen) { const r = p.r ?? 10.5; neem(p.x - r, p.y - r, p.x + r, p.y + r); }
    for (const l of st.labels) {
      const b = (l.tekst.length + (l.waarde ? l.waarde.length + 1 : 0)) * 11;
      const a = l.anchor === "end" ? l.x - b : l.anchor === "middle" ? l.x - b / 2 : l.x;
      neem(a, l.y - 20, a + b, l.y + 6);
    }
    for (const k of st.kaders ?? []) neem(k.x, k.y, k.x + k.b, k.y + k.h);
    if (st.groot) neem(MIDDEN.x - 150, MIDDEN.y - 90, MIDDEN.x + 150, MIDDEN.y + 10);
  }
  if (!Number.isFinite(x0)) return { x: -60, y: -50, b: 1120, h: 555 };
  const rand = 16;
  return { x: Math.round(x0 - rand), y: Math.round(y0 - rand), b: Math.round(x1 - x0 + 2 * rand), h: Math.round(y1 - y0 + 2 * rand) };
}

// Sleutel naar de inhoud; komt dezelfde inhoud vaker voor in een stap, dan telt het hoeveelste exemplaar mee
function sleutel(basis: string, i: number, alle: string[]): string {
  return `${basis}#${alle.slice(0, i).filter((x) => x === basis).length}`;
}

export function ScrollVerhaalKlant({ gepakt, label, hoogteSmal = 555, breedteSmal, stapHoogte = "100vh", tijdlijn = false, breed = false }: Props) {
  const verhaal = useMemo(() => pakUit(gepakt), [gepakt]);
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
          // Zichtbaar onder de tekening; vervaagt pas over de 180 pixels erboven (later en trager dan eerst: feedback
          // Niels K2, 27 oktober 2026)
          k.style.setProperty("--zicht", String(Math.min(1, Math.max(0, (r.top - (onder - 180)) / 180))));
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
  // Telefoon: de tekening sluit aan op wat er echt in staat (over alle stappen), zodat stippen en letters groter
  // worden; de letters krijgen daarbij een minimale maat op het scherm (feedback Niels, 26 oktober 2026: "op de
  // telefoon zijn de visuals heel klein"). Een eigen telefoontekening (breedteSmal) houdt haar eigen maten.
  const [schermBreedte, setSchermBreedte] = useState(0);
  useEffect(() => {
    const meet = () => setSchermBreedte(tekening.current?.getBoundingClientRect().width ?? 0);
    meet();
    addEventListener("resize", meet);
    return () => removeEventListener("resize", meet);
  }, []);
  // Per stap een eigen uitsnede, die in 600 ms meebeweegt naar de volgende (anders maakt de hoogste stap alles klein)
  const doel = smal && !breedteSmal ? omvang([stap]) : null;
  const [passend, setPassend] = useState<Box | null>(null);
  const huidig = useRef<Box | null>(null);
  useEffect(() => {
    if (!doel) { huidig.current = null; setPassend(null); return; }
    const van = huidig.current ?? doel;
    const start = performance.now();
    let frame = 0;
    const tik = (nu: number) => {
      const t = Math.min(1, (nu - start) / 600), e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      const b = { x: van.x + (doel.x - van.x) * e, y: van.y + (doel.y - van.y) * e, b: van.b + (doel.b - van.b) * e, h: van.h + (doel.h - van.h) * e };
      huidig.current = b;
      setPassend(b);
      if (t < 1) frame = requestAnimationFrame(tik);
    };
    frame = requestAnimationFrame(tik);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doel?.x, doel?.y, doel?.b, doel?.h]);
  const viewBox = passend ? `${passend.x.toFixed(1)} ${passend.y.toFixed(1)} ${passend.b.toFixed(1)} ${passend.h.toFixed(1)}`
    : smal && breedteSmal ? `-40 -50 ${breedteSmal} ${hoogte}` : `-60 -50 1120 ${hoogte}`;
  const eenheid = (passend ? passend.b : smal && breedteSmal ? breedteSmal : 1120) / Math.max(schermBreedte || 1120, 1);
  // Lettermaat in eenheden van de tekening, zo dat een label op het scherm minstens 11 pixels is (en nooit kleiner dan nu)
  const letter = smal ? Math.max(15, Math.min(30, 11 * eenheid)) : 15;
  // Breed: de titel van het lopende hoofdstuk staat boven de tekening, niet eronder (feedback Niels K2, 26 oktober 2026)
  const kop = breed ? stappen.slice(0, actief + 1).map((st) => st.hoofdstuk).filter(Boolean).pop() : undefined;

  return (
    <div className={s.verhaal} data-tijdlijn={tijdlijn && !breed} data-breed={breed} style={{ "--stap": stapHoogte } as CSSProperties}>
      <div className={s.figuur}>
        {kop && <div className={s.figuurKop} aria-hidden="true">{kop}</div>}
        <svg ref={tekening} viewBox={viewBox} style={{ "--letter": `${letter}px` } as CSSProperties} className={s.svg} role="img" aria-label={`${label}: ${stap.datum}. ${stap.tekst}`}>
          {/* Sleutels naar de inhoud, niet naar de stap: een as of lijn die in de volgende stap terugkomt blijft staan
              en flitst niet opnieuw in (feedback Niels K2, 26 oktober 2026) */}
          <g aria-hidden="true">
            {stap.paden?.map((p, i) => (
              <path key={p.naam ?? sleutel(`p${p.d}${p.tint}${p.streep}`, i, stap.paden!.map((q) => `p${q.d}${q.tint}${q.streep}`))} d={p.d} className={s.pad} data-zacht={p.zacht ? "ja" : undefined}
                style={{ stroke: p.tint, strokeWidth: p.breedte, strokeDasharray: p.streep ? "4 6" : undefined, transform: p.verschuif }} />
            ))}
          </g>
          {alle.map((k) => {
            const p = hier.get(k);
            return (
              // Lege kenmerken weggelaten: de CSS kijkt alleen naar een ingevulde kleur en naar data-weg="ja"
              <circle key={k} r={p?.r ?? 10.5} className={s.stip} data-kleur={p?.kleur || undefined} data-weg={p ? undefined : "ja"}
                style={{ fill: p?.kleur === "hol" ? "var(--nacht-950)" : p?.tint, stroke: p?.kleur === "hol" ? p.tint : undefined,
                  transform: p ? `translate(${p.x}px, ${p.y}px)` : `translate(${MIDDEN.x}px, ${MIDDEN.y}px)`, transitionDelay: p?.wacht ? `${p.wacht}ms` : undefined }} />
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
              <Beeld stap={st} />
              {st.kort !== undefined ? <><span className="verborgen">{st.tekst}</span>{st.kort}</> : st.tekst}
              {st.link && <Link href={st.link.href} className={s.verder}>{st.link.tekst} →</Link>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Het beeld in het tekstvak: de uitslag als balk, de fracties per kant, en korte balkjes. Voor schermlezers staat
// hetzelfde in de tekst, daarom aria-hidden.
function Beeld({ stap }: { stap: Stap }) {
  const { uitslag, kanten, balken } = stap;
  if (!uitslag && !kanten && !balken) return null;
  const naam = (f: string) => KORT[f] ?? f;
  return (
    <span className={s.beeld} aria-hidden="true">
      {uitslag && (() => {
        const totaal = uitslag.voor + uitslag.tegen + (uitslag.niet ?? 0);
        return (
          <span className={s.uitslag}>
            <span className={s.uitslagBalk}>
              <span className={s.uitslagVoor} style={{ width: `${(100 * uitslag.voor) / totaal}%` }} />
              {uitslag.niet ? <span className={s.uitslagNiet} style={{ width: `${(100 * uitslag.niet) / totaal}%` }} /> : null}
              <span className={s.uitslagTegen} style={{ width: `${(100 * uitslag.tegen) / totaal}%` }} />
            </span>
            <span className={s.uitslagGetallen}>
              <span className={s.kleurVoor}>{uitslag.voor} voor</span>
              {uitslag.niet ? <span>{uitslag.niet} niet mee</span> : null}
              <span className={s.kleurTegen}>{uitslag.tegen} tegen</span>
            </span>
          </span>
        );
      })()}
      {kanten && (
        <span className={s.kanten}>
          {(["voor", "tegen"] as const).map((k) => kanten[k].length > 0 && (
            <span key={k} className={s.kant}>
              <span className={k === "voor" ? s.kleurVoor : s.kleurTegen}>{k === "voor" ? "Voor" : "Tegen"}</span>
              <span className={s.pillen}>{kanten[k].map((f) => <span key={f} className={s.pil} data-kant={k}>{naam(f)}</span>)}</span>
            </span>
          ))}
        </span>
      )}
      {balken && (
        <span className={s.balken}>
          {balken.map((b) => (
            <span key={b.label} className={s.balkRij}>
              <span className={s.balkLabel}>{b.label}</span>
              <span className={s.balkBaan}><span style={{ width: `${Math.max(2, (100 * b.waarde) / b.max)}%`, background: b.tint }} /></span>
              <span className={s.balkTekst}>{b.tekst}</span>
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

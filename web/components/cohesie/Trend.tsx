"use client";
// Door de jaren (verzoek Niels, 27 oktober 2026): hoe vaak twee fracties hetzelfde stemden, per half jaar sinds 2010,
// met de kabinetten als vlakken op de achtergrond. Met een schuif kies je de periode; het totaal en de toelichting
// over wat uitvalt rekenen mee. De tweede fractie staat in de URL (met=), de periode alleen in de pagina.
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DREMPEL, type Punt, beginTekst, eindTekst, kortTekst, samenvatting, uitvalTekst } from "@/lib/trend";
import s from "./trend.module.css";

type Kabinet = { naam: string; begin: string; einde: string | null };
const STANDAARD = 20; // de laatste tien jaar (opmerking van een bezoeker: een Kamerperiode is arbitrair)

export function Trend({ a, b, keuzes, punten, kabinetten }: { a: string; b: string; keuzes: string[]; punten: Punt[]; kabinetten: Kabinet[] }) {
  const router = useRouter(), pad = usePathname(), zoek = useSearchParams();
  const n = punten.length;
  const [van, setVan] = useState(Math.max(0, n - STANDAARD));
  const [tot, setTot] = useState(n - 1);
  // Op een smal scherm een eigen maatvoering: anders krimpt de brede tekening tot onleesbare letters
  const [smal, setSmal] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 640px)");
    const zet = () => setSmal(m.matches);
    zet();
    m.addEventListener("change", zet);
    return () => m.removeEventListener("change", zet);
  }, []);
  const sv = samenvatting(punten, van, tot);
  const alle = punten.map((p) => p.halfjaar);
  const uitval = uitvalTekst(a, b, sv, alle);
  // Het laatste halve jaar loopt nog: dan "tot nu" in plaats van "tot en met december"
  const totTekst = tot === n - 1 ? "tot nu" : `tot en met ${eindTekst(alle[tot])}`;

  const kies = (andere: string) => {
    const q = new URLSearchParams(zoek.toString());
    q.set("met", andere);
    router.replace(`${pad}?${q.toString()}#door-de-jaren`, { scroll: false });
  };

  // Tekening: een maand is de eenheid; een half jaar beslaat zes maanden, het punt staat in het midden
  const B = smal ? 360 : 760, H = smal ? 260 : 290, L = 40, R = 8, T = 34, O = 30;
  const maanden = n * 6;
  const x = (m: number) => L + (m / maanden) * (B - L - R);
  const maandVan = (iso: string) => (Number(iso.slice(0, 4)) - Number(alle[0].slice(0, 4))) * 12 + Number(iso.slice(5, 7)) - 1 + (Number(iso.slice(8, 10)) - 1) / 31;
  const y = (v: number) => T + ((100 - v) / 100) * (H - T - O);
  const px = (i: number) => x(i * 6 + 3);
  // Lijnstukken tussen opeenvolgende halve jaren met een percentage; een gat waar er geen is
  const stukken: Punt[][] = [];
  punten.forEach((p, i) => {
    if (p.cohesie == null) return;
    const vorige = stukken[stukken.length - 1];
    if (vorige && punten[i - 1]?.cohesie != null) vorige.push(p);
    else stukken.push([p]);
  });
  const vlakken = kabinetten
    .map((k) => ({ ...k, m0: Math.max(0, maandVan(k.begin)), m1: Math.min(maanden, k.einde ? maandVan(k.einde) : maanden) }))
    .filter((k) => k.m1 > k.m0);
  const jaarLabels = alle.map((h, i) => ({ h, i })).filter(({ h }) => h.slice(5, 7) === "01" && Number(h.slice(0, 4)) % (smal ? 4 : 2) === 0);

  return (
    <div className={s.trend}>
      <div className={s.keuze}>
        <label htmlFor="trend-met">Vergelijk {a} met</label>
        <select id="trend-met" value={b} onChange={(e) => kies(e.target.value)}>
          {keuzes.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <p className={s.totaal} aria-live="polite">
        {sv.cohesie != null
          ? <>Van {beginTekst(alle[van])} {totTekst} stemden {a} en {b} in <strong>{Math.round(sv.cohesie)}%</strong> van de {sv.gezamenlijk.toLocaleString("nl-NL")} stemmingen samen hetzelfde.</>
          : <>Van {beginTekst(alle[van])} {totTekst} stemden {a} en {b} te weinig samen voor een percentage ({sv.gezamenlijk} stemmingen, minimaal {DREMPEL}).</>}
      </p>

      <svg viewBox={`0 0 ${B} ${H}`} className={s.grafiek} role="img"
        aria-label={`Hoe vaak ${a} en ${b} hetzelfde stemden, per half jaar sinds ${alle[0].slice(0, 4)}`}>
        {vlakken.map((k, i) => (
          <g key={k.naam}>
            <rect x={x(k.m0)} y={T} width={x(k.m1) - x(k.m0)} height={H - T - O} className={i % 2 ? s.vlakB : s.vlakA} />
            {x(k.m1) - x(k.m0) > (smal ? 40 : 46) && <text x={x(k.m0) + 4} y={T - 8} className={s.kabinet}>{k.naam}</text>}
          </g>
        ))}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={L} x2={B - R} y1={y(v)} y2={y(v)} className={s.raster} />
            <text x={L - 6} y={y(v) + 4} textAnchor="end" className={s.as}>{v}%</text>
          </g>
        ))}
        {jaarLabels.map(({ h, i }) => <text key={h} x={x(i * 6)} y={H - 10} textAnchor="middle" className={s.as}>{h.slice(0, 4)}</text>)}
        {stukken.map((st) => (
          <path key={st[0].halfjaar} d={`M${st.map((p) => `${px(alle.indexOf(p.halfjaar))},${y(p.cohesie!)}`).join(" L")}`} className={s.lijn} />
        ))}
        {punten.map((p, i) => p.cohesie != null && (
          <circle key={p.halfjaar} cx={px(i)} cy={y(p.cohesie)} r={smal ? 2.5 : 3.5} className={i >= van && i <= tot ? s.punt : s.puntUit}>
            <title>{`${beginTekst(p.halfjaar)} tot en met ${eindTekst(p.halfjaar)}: ${Math.round(p.cohesie)}% van ${p.gezamenlijk} stemmingen`}</title>
          </circle>
        ))}
        {/* Buiten de gekozen periode gedimd */}
        {van > 0 && <rect x={L} y={T} width={x(van * 6) - L} height={H - T - O} className={s.buiten} />}
        {tot < n - 1 && <rect x={x((tot + 1) * 6)} y={T} width={x(maanden) - x((tot + 1) * 6)} height={H - T - O} className={s.buiten} />}
      </svg>

      <fieldset className={s.schuif}>
        <legend>Periode</legend>
        <label>
          <span>Van <strong>{beginTekst(alle[van])}</strong></span>
          <input type="range" min={0} max={n - 1} value={van} aria-valuetext={beginTekst(alle[van])}
            onChange={(e) => { const v = Number(e.target.value); setVan(Math.min(v, tot)); }} />
        </label>
        <label>
          <span>Tot en met <strong>{tot === n - 1 ? "nu" : eindTekst(alle[tot])}</strong></span>
          <input type="range" min={0} max={n - 1} value={tot} aria-valuetext={eindTekst(alle[tot])}
            onChange={(e) => { const v = Number(e.target.value); setTot(Math.max(v, van)); }} />
        </label>
        <div className={s.snel}>
          <button type="button" onClick={() => { setVan(Math.max(0, n - STANDAARD)); setTot(n - 1); }}>Laatste tien jaar</button>
          <button type="button" onClick={() => { setVan(Math.max(0, n - 10)); setTot(n - 1); }}>Laatste vijf jaar</button>
          <button type="button" onClick={() => { setVan(0); setTot(n - 1); }}>Alles sinds {kortTekst(alle[0])}</button>
        </div>
      </fieldset>

      <p className={s.uitleg}>
        Elk punt is een half jaar: van alle stemmingen waarin {a} en {b} allebei voor of tegen stemden, het deel waarin ze dezelfde
        kant kozen. Een punt vanaf {DREMPEL} stemmingen samen. De vlakken zijn de kabinetten.
        {uitval ? ` ${uitval}` : ""}
      </p>
    </div>
  );
}

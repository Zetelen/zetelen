"use client";
// Door de jaren (verzoek Niels, 27 oktober 2026): hoe vaak twee fracties hetzelfde stemden, per half jaar sinds 2010,
// met de kabinetten als vlakken op de achtergrond. Met een schuif kies je de periode; de as loopt dan alleen over die
// periode, en het totaal en de toelichting over wat uitvalt rekenen mee (Niels, 29 oktober 2026: filteren, niet dimmen).
// De tweede fractie en de periode staan in de URL (met=, van= en tot=), zodat een deellink dezelfde periode toont.
// Bij een fusie (content/fractie-opvolgers.json) staan de voorgangers als dunne lijnen ernaast; die tellen niet mee in
// het totaal (verzoek Niels, 28 oktober 2026).
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DREMPEL, type Punt, beginTekst, eindTekst, kortTekst, samenvatting, uitvalTekst } from "@/lib/trend";
import { GrafiekVlak } from "@/components/deel/GrafiekKader";
import { URL_GEWIJZIGD } from "@/lib/deel";
import { vloeiendPad } from "@/lib/vloeiend";
import s from "./trend.module.css";

type Kabinet = { naam: string; begin: string; einde: string | null };
type Extra = { naam: string; punten: Punt[] };
const TINTEN = ["#7fb7c9", "#e57f93", "#a08fe0", "#6fbf8e"]; // uit het palet van de scroll graphics (lib/verhaal.ts)
const STANDAARD = 20; // de laatste tien jaar (opmerking van een bezoeker: een Kamerperiode is arbitrair)
// Een half jaar in de URL als jaar en beginmaand, bijvoorbeeld 2011-01
const inUrl = (halfjaar: string) => halfjaar.slice(0, 7);

// vast: alleen de grafiek, zonder keuzelijst, totaal en schuif, met een eigen uitleg (op een uitgelichte pagina);
// alles: standaard de hele periode
export function Trend({ a, b, keuzes, punten, extra, eerder, kabinetten, vast = false, alles = false, uitleg: eigenUitleg }: {
  a: string; b: string; keuzes: string[]; punten: Punt[]; extra: Extra[]; eerder: string[]; kabinetten: Kabinet[]; vast?: boolean; alles?: boolean; uitleg?: string;
}) {
  const router = useRouter(), pad = usePathname(), zoek = useSearchParams();
  const n = punten.length;
  const alle = punten.map((p) => p.halfjaar);
  const standaardVan = alles ? 0 : Math.max(0, n - STANDAARD);
  const uitUrl = (k: string, anders: number) => {
    const i = vast ? -1 : alle.findIndex((h) => inUrl(h) === zoek.get(k));
    return i >= 0 ? i : anders;
  };
  const [van, setVanState] = useState(() => uitUrl("van", standaardVan));
  const [tot, setTotState] = useState(() => Math.max(uitUrl("tot", n - 1), uitUrl("van", standaardVan)));
  // De periode in de adresbalk, zonder de pagina opnieuw te laden; de standaard laat de URL schoon
  const zetPeriode = (v: number, t: number) => {
    setVanState(v);
    setTotState(t);
    if (vast) return;
    const q = new URLSearchParams(window.location.search);
    if (v === standaardVan) q.delete("van"); else q.set("van", inUrl(alle[v]));
    if (t === n - 1) q.delete("tot"); else q.set("tot", inUrl(alle[t]));
    const rest = q.toString();
    // De markering van volledig scherm (GrafiekKader) blijft staan; Next.js vult zijn eigen gegevens zelf aan
    window.history.replaceState({ zetelenVol: window.history.state?.zetelenVol }, "", `${pad}${rest ? `?${rest}` : ""}${window.location.hash}`);
    window.dispatchEvent(new Event(URL_GEWIJZIGD));
  };
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
  const uitval = uitvalTekst(a, b, sv, alle);
  // Het laatste halve jaar loopt nog: dan "tot nu" in plaats van "tot en met december"
  const totTekst = tot === n - 1 ? "tot nu" : `tot en met ${eindTekst(alle[tot])}`;

  const kies = (andere: string) => {
    const q = new URLSearchParams(zoek.toString());
    q.set("met", andere);
    router.replace(`${pad}?${q.toString()}#door-de-jaren`, { scroll: false });
  };

  // Tekening: een maand is de eenheid; een half jaar beslaat zes maanden, het punt staat in het midden. De as loopt
  // van het eerste tot het laatste gekozen halve jaar
  const B = smal ? 360 : 760, H = smal ? 260 : 290, L = 40, R = 8, T = 34, O = 30;
  const maanden = (tot - van + 1) * 6;
  const x = (m: number) => L + (m / maanden) * (B - L - R);
  const maandVan = (iso: string) => (Number(iso.slice(0, 4)) - Number(alle[van].slice(0, 4))) * 12 + Number(iso.slice(5, 7)) - Number(alle[van].slice(5, 7)) + (Number(iso.slice(8, 10)) - 1) / 31;
  const y = (v: number) => T + ((100 - v) / 100) * (H - T - O);
  const px = (i: number) => x((i - van) * 6 + 3);
  const binnen = (i: number) => i >= van && i <= tot;
  // Lijnstukken tussen opeenvolgende halve jaren met een percentage; een gat waar er geen is
  const stukkenVan = (reeks: Punt[]) => {
    const uit: Punt[][] = [];
    reeks.forEach((p, i) => {
      if (p.cohesie == null) return;
      const vorige = uit[uit.length - 1];
      if (vorige && reeks[i - 1]?.cohesie != null) vorige.push(p);
      else uit.push([p]);
    });
    return uit;
  };
  // Vloeiend, zonder over de punten heen te schieten (lib/vloeiend.ts)
  const lijnPad = (st: Punt[]) => vloeiendPad(st.map((p) => [px(alle.indexOf(p.halfjaar)), y(p.cohesie!)]));
  const stukken = stukkenVan(punten.slice(van, tot + 1));
  const vlakken = kabinetten
    .map((k, nr) => ({ ...k, nr, m0: Math.max(0, maandVan(k.begin)), m1: Math.min(maanden, k.einde ? maandVan(k.einde) : maanden) }))
    .filter((k) => k.m1 > k.m0);
  // Bij een korte periode elk jaar een label, bij een lange om de twee of vier jaar
  const jaarStap = (tot - van + 1) / 2 > 12 ? (smal ? 4 : 2) : (tot - van + 1) / 2 > 6 ? (smal ? 2 : 1) : 1;
  const jaarLabels = alle.map((h, i) => ({ h, i })).filter(({ h, i }) => binnen(i) && h.slice(5, 7) === "01" && Number(h.slice(0, 4)) % jaarStap === 0);

  return (
    <div className={s.trend}>
      {!vast && <div className={s.keuze}>
        <label htmlFor="trend-met">Vergelijk {a} met</label>
        <select id="trend-met" value={b} onChange={(e) => kies(e.target.value)}>
          {keuzes.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>}

      {!vast && <p className={s.totaal} aria-live="polite">
        {sv.cohesie != null
          ? <>Van {beginTekst(alle[van])} {totTekst} stemden {a} en {b} in <strong>{Math.round(sv.cohesie)}%</strong> van de {sv.gezamenlijk.toLocaleString("nl-NL")} stemmingen samen hetzelfde.</>
          : <>Van {beginTekst(alle[van])} {totTekst} stemden {a} en {b} te weinig samen voor een percentage ({sv.gezamenlijk} stemmingen, minimaal {DREMPEL}).</>}
      </p>}

      {extra.length > 0 && (
        <ul className={s.legenda}>
          <li><span className={s.streep} style={{ background: "var(--goud)" }} />{a} en {b}</li>
          {extra.map((e, j) => <li key={e.naam}><span className={s.streepDun} style={{ background: TINTEN[j % TINTEN.length] }} />{e.naam}, voor de fusie</li>)}
        </ul>
      )}

      <GrafiekVlak>
      <svg viewBox={`0 0 ${B} ${H}`} className={s.grafiek} role="img"
        aria-label={`Hoe vaak ${a} en ${b} hetzelfde stemden, per half jaar sinds ${alle[0].slice(0, 4)}`}>
        {vlakken.map((k) => (
          <g key={k.naam}>
            {/* De kleur wisselt per kabinet in de hele reeks, zodat een kabinet bij elke periode dezelfde kleur houdt */}
            <rect x={x(k.m0)} y={T} width={x(k.m1) - x(k.m0)} height={H - T - O} className={k.nr % 2 ? s.vlakB : s.vlakA} />
            {/* Alleen een naam als die past: ongeveer 7 punten per letter */}
            {x(k.m1) - x(k.m0) > k.naam.length * 7 + 8 && <text x={x(k.m0) + 4} y={T - 8} className={s.kabinet}>{k.naam}</text>}
          </g>
        ))}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={L} x2={B - R} y1={y(v)} y2={y(v)} className={s.raster} />
            <text x={L - 6} y={y(v) + 4} textAnchor="end" className={s.as}>{v}%</text>
          </g>
        ))}
        {jaarLabels.map(({ h, i }) => <text key={h} x={x((i - van) * 6)} y={H - 10} textAnchor="middle" className={s.as}>{h.slice(0, 4)}</text>)}
        {extra.map((e, j) => (
          <g key={e.naam}>
            {stukkenVan(e.punten.slice(van, tot + 1)).map((st) => <path key={st[0].halfjaar} d={lijnPad(st)} className={s.lijnExtra} style={{ stroke: TINTEN[j % TINTEN.length] }} />)}
            {e.punten.map((p, i) => binnen(i) && p.cohesie != null && (
              <circle key={p.halfjaar} cx={px(i)} cy={y(p.cohesie)} r={smal ? 1.8 : 2.5} style={{ fill: TINTEN[j % TINTEN.length] }}>
                <title>{`${e.naam}, ${beginTekst(p.halfjaar)} tot en met ${eindTekst(p.halfjaar)}: ${Math.round(p.cohesie)}% van ${p.gezamenlijk} stemmingen`}</title>
              </circle>
            ))}
          </g>
        ))}
        {stukken.map((st) => <path key={st[0].halfjaar} d={lijnPad(st)} className={s.lijn} />)}
        {punten.map((p, i) => binnen(i) && p.cohesie != null && (
          <circle key={p.halfjaar} cx={px(i)} cy={y(p.cohesie)} r={smal ? 2.5 : 3.5} className={s.punt}>
            <title>{`${beginTekst(p.halfjaar)} tot en met ${eindTekst(p.halfjaar)}: ${Math.round(p.cohesie)}% van ${p.gezamenlijk} stemmingen`}</title>
          </circle>
        ))}
      </svg>
      </GrafiekVlak>

      {!vast && <fieldset className={s.schuif}>
        <legend>Periode</legend>
        <label>
          <span>Van <strong>{beginTekst(alle[van])}</strong></span>
          <input type="range" min={0} max={n - 1} value={van} aria-valuetext={beginTekst(alle[van])}
            onChange={(e) => zetPeriode(Math.min(Number(e.target.value), tot), tot)} />
        </label>
        <label>
          <span>Tot en met <strong>{tot === n - 1 ? "nu" : eindTekst(alle[tot])}</strong></span>
          <input type="range" min={0} max={n - 1} value={tot} aria-valuetext={eindTekst(alle[tot])}
            onChange={(e) => zetPeriode(van, Math.max(Number(e.target.value), van))} />
        </label>
        <div className={s.snel}>
          <button type="button" onClick={() => zetPeriode(Math.max(0, n - STANDAARD), n - 1)}>Laatste tien jaar</button>
          <button type="button" onClick={() => zetPeriode(Math.max(0, n - 10), n - 1)}>Laatste vijf jaar</button>
          <button type="button" onClick={() => zetPeriode(0, n - 1)}>Alles sinds {kortTekst(alle[0])}</button>
        </div>
      </fieldset>}

      {eigenUitleg ? <p className={s.uitleg}>{eigenUitleg}</p> : <p className={s.uitleg}>
        Elk punt is een half jaar: van alle stemmingen waarin {a} en {b} allebei voor of tegen stemden, het deel waarin ze dezelfde
        kant kozen. Een punt vanaf {DREMPEL} stemmingen samen. De vlakken zijn de kabinetten.
        {uitval ? ` ${uitval}` : ""}
        {eerder.length > 0 && ` ${eerder.join(". ")}.`}
        {extra.length > 0 && " De dunne lijnen tellen niet mee in het totaal hierboven."}
      </p>}
    </div>
  );
}

// De vijf grafieken van het Actueel-stuk "akkoord-belastingplan" (lib/actueel.ts). Server-componenten zonder interactie,
// in de stijl van Blokken.tsx: elke grafiek toont de getallen ook als tekst, kleur is nooit de enige drager.
import Link from "next/link";
import { type AkkoordData, type UitslagStemming, aantal, bouwerLink, buitenVan, datumTekst, ekSom, plannenVan, procent, stemmingVan, tkSom } from "@/lib/actueel";
import s from "./actueel.module.css";
import a from "./akkoord.module.css";

const soortVan = (d: AkkoordData, afk: string) => (d.kamers.vier.includes(afk) ? a.vier : d.tegen.includes(afk) ? a.kabinet : a.anders);

function Legenda({ d }: { d: AkkoordData }) {
  return (
    <p className={s.legenda}>
      <span><span className={`${a.vakje} ${a.vier}`} aria-hidden="true" /> {d.kamers.vier.join(", ")}</span>
      <span><span className={`${a.vakje} ${a.kabinet}`} aria-hidden="true" /> {d.tegen.filter((x) => !d.kamers.vier.includes(x)).join(", ")}</span>
      <span><span className={`${a.vakje} ${a.anders}`} aria-hidden="true" /> andere fracties</span>
      <span><span className={a.vakje} style={{ borderLeft: "3px solid var(--goud)", borderRadius: 0 }} aria-hidden="true" /> meerderheid</span>
    </p>
  );
}

// Een rij: de fracties aan één kant als blokjes naar zetels, op een schaal van de hele Kamer, met de streep bij de meerderheid
function KamerRij({ d, label, fracties, totaal, meerderheid }: { d: AkkoordData; label: string; fracties: Array<{ afkorting: string; zetels: number }>; totaal: number; meerderheid: number }) {
  const som = fracties.reduce((n, f) => n + f.zetels, 0);
  return (
    <div className={a.kamerRij}>
      <span className={a.label}>{label}</span>
      <span className={a.kamer} role="img" aria-label={`${label}: ${fracties.map((f) => `${f.afkorting} ${f.zetels}`).join(", ")}; samen ${som} van ${totaal}`}>
        {fracties.map((f) => (
          <span key={f.afkorting} className={soortVan(d, f.afkorting)} style={{ width: `${(100 * f.zetels) / totaal}%` }} title={`${f.afkorting} ${f.zetels}`}>
            {f.zetels / totaal >= 0.08 ? f.afkorting : ""}
          </span>
        ))}
        <span className={a.grens} style={{ left: `${(100 * meerderheid) / totaal}%` }} aria-hidden="true" />
      </span>
    </div>
  );
}

// Blok 1: per stemming twee rijen, voor en tegen
function Stemming({ d, st, naam }: { d: AkkoordData; st: UitslagStemming; naam: string }) {
  const kant = (k: "Voor" | "Tegen") => st.fracties.filter((f) => f.stem === k);
  return (
    <div className={a.stemming}>
      <p className={s.legenda}><span>{naam} · {st.aangenomen ? "aangenomen" : "verworpen"}, {st.voor} tegen {st.tegen} zetels</span></p>
      <KamerRij d={d} label={`Voor ${st.voor}`} fracties={kant("Voor")} totaal={150} meerderheid={d.kamers.tk.meerderheid} />
      <KamerRij d={d} label={`Tegen ${st.tegen}`} fracties={kant("Tegen")} totaal={150} meerderheid={d.kamers.tk.meerderheid} />
    </div>
  );
}
export function Uitslag({ d }: { d: AkkoordData }) {
  const am = stemmingVan(d, "amendement"), wet = stemmingVan(d, "wet");
  if (!am || !wet) return null;
  return (
    <div className={s.botsen}>
      <Stemming d={d} st={am} naam="Amendement" />
      <Stemming d={d} st={wet} naam="Belastingplan 2027" />
      <Legenda d={d} />
    </div>
  );
}

// Blok "plannen": per Belastingplan een balk over de hele Kamer, voor links en tegen rechts, met de meerderheid als streep.
// Het plan van dit stuk in koper; onder elke balk de fracties die tegen stemden.
export function Plannen({ d }: { d: AkkoordData }) {
  const p = plannenVan(d);
  if (!p) return null;
  return (
    <div className={s.botsen}>
      <p className={s.legenda}>
        <span><span className={`${a.vakje} ${a.kabinet}`} aria-hidden="true" /> voor</span>
        <span><span className={`${a.vakje} ${a.anders}`} aria-hidden="true" /> tegen</span>
        <span><span className={a.vakje} style={{ borderLeft: "3px solid var(--goud)", borderRadius: 0 }} aria-hidden="true" /> meerderheid (76)</span>
      </p>
      <ol className={a.plannen} aria-label="Eindstemmingen over de Belastingplannen">
        {p.lijst.map((x) => {
          const nu = x === p.nu;
          const tegen = x.tegenFracties === null ? "per fractie nog niet in de open data" : x.tegenFracties.length ? `tegen: ${x.tegenFracties.map((f) => f.fractie).join(", ")}` : "niemand tegen";
          return (
            <li key={x.plan} className={nu ? a.planNu : undefined}>
              <span className={a.planJaar}>{x.plan}</span>
              <span className={a.planBalk} role="img" aria-label={`Belastingplan ${x.plan}, ${datumTekst(x.datum)}: ${x.voor} voor, ${x.tegen} tegen${x.hoofdelijk ? ", hoofdelijk" : ""}; ${tegen}`}>
                <span className={nu ? a.vier : a.kabinet} style={{ width: `${(100 * x.voor) / 150}%` }} />
                <span className={a.grens} style={{ left: `${(100 * 76) / 150}%` }} aria-hidden="true" />
              </span>
              <span className={a.planGetal}>{x.voor}-{x.tegen}</span>
              <span className={a.planTegen} aria-hidden="true">{x.hoofdelijk ? `hoofdelijk · ${tegen}` : tegen}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// Blok 2: de drie paren met een partner in de oppositie, daaronder de paren binnen het kabinet
export function Partners({ d }: { d: AkkoordData }) {
  const rij = (naam: string, pct: number, n: number, kabinet = false) => (
    <div key={naam} className={s.contrastRij}>
      <span className={s.naam}>{naam}</span>
      <span className={s.cel}><span className={s.vul} style={{ width: `${pct}%`, ...(kabinet ? { background: "var(--lijn-licht)" } : {}) }} /></span>
      <span className={s.getal}>{procent(pct)}<span className="verborgen"> van {aantal(n)} stemmingen</span></span>
    </div>
  );
  return (
    <div className={s.botsen}>
      <div className={s.contrast}>
        <p className={s.legenda}><span>Kabinetspartij en gekozen partner in de oppositie: dezelfde kant</span></p>
        {d.partners.paren.map((p) => rij(`${p.kabinetspartij} en ${p.partner}`, p.cohesie, p.gezamenlijk))}
      </div>
      <div className={s.contrast}>
        <p className={s.legenda}><span>Binnen het kabinet</span></p>
        {d.partners.binnen.map((p) => rij(`${p.a} en ${p.b}`, p.cohesie, p.gezamenlijk, true))}
      </div>
    </div>
  );
}

// Blok 3: per kabinet het aandeel stemmingen waarop één coalitiepartij alleen stond, daaronder per partij onder het huidige
export function Buiten({ d }: { d: AkkoordData }) {
  const max = Math.ceil(Math.max(...d.buiten.kabinetten.map((k) => k.pct)) / 10) * 10;
  const nu = buitenVan(d, d.kabinet);
  const rij = (naam: string, pct: number, uitleg: string, huidig = false) => (
    <div key={naam} className={s.contrastRij}>
      <span className={s.naam} style={huidig ? { color: "var(--koper)" } : undefined}>{naam}</span>
      <span className={s.cel}><span className={s.vul} style={{ width: `${(100 * pct) / max}%`, ...(huidig ? { opacity: 1 } : {}) }} /></span>
      <span className={s.getal}>{procent(pct)}<span className="verborgen"> {uitleg}</span></span>
    </div>
  );
  return (
    <div className={s.botsen}>
      <div className={s.contrast}>
        <p className={s.legenda}><span>Een coalitiepartij alleen tegenover de rest, aandeel van de verdeelde stemmingen (schaal tot {max}%)</span></p>
        {d.buiten.kabinetten.map((k) => rij(k.gedoog ? `${k.kabinet} (met gedoogpartner)` : k.kabinet, k.pct, `${aantal(k.keer)} van ${aantal(k.verdeeld)}`, k.kabinet === d.kabinet))}
      </div>
      <div className={s.contrast}>
        <p className={s.legenda}><span>Onder {d.kabinet}, per partij</span></p>
        {nu.partijen.map((p) => rij(p.afkorting, p.pct, `${aantal(p.keer)} van ${aantal(p.basis)}`))}
      </div>
    </div>
  );
}

// Blok 4: de vier en de VVD in beide Kamers, de hechtste meerderheid zonder elke kabinetspartij, en de coalitiebouwer
export function Kamers({ d }: { d: AkkoordData }) {
  const k = d.kamers, met = [...k.vier, k.buiten];
  const rij = (zetels: Record<string, number>) => met.map((x) => ({ afkorting: x, zetels: zetels[x] ?? 0 })).filter((f) => f.zetels > 0);
  const routes = [...k.routes].sort((x, y) => (x.zonder === k.buiten ? -1 : y.zonder === k.buiten ? 1 : d.tegen.indexOf(x.zonder) - d.tegen.indexOf(y.zonder)));
  return (
    <div className={s.botsen}>
      <KamerRij d={d} label={`Tweede Kamer ${tkSom(d, k.vier)} + ${k.tk.zetels[k.buiten]}`} fracties={rij(k.tk.zetels)} totaal={150} meerderheid={k.tk.meerderheid} />
      <KamerRij d={d} label={`Eerste Kamer ${ekSom(d, k.vier)} + ${k.ek.zetels[k.buiten]}`} fracties={rij(k.ek.zetels)} totaal={k.ek.totaal} meerderheid={k.ek.meerderheid} />
      <Legenda d={d} />
      <div className={`${s.contrast} ${s.breedGetal}`}>
        <p className={s.legenda}><span>Tweede Kamer: hoe vaak eensgezind</span></p>
        {[{ naam: `Kabinet: ${k.kabinet.fracties.join(", ")}`, pct: k.kabinet.pct, uitleg: `${aantal(k.kabinet.eensgezind)} van ${aantal(k.kabinet.gestemd)}` },
          ...routes.map((r) => ({ naam: `Zonder ${r.zonder}: ${[...r.start, ...r.extra].join(", ")}`, pct: r.pct, uitleg: `${aantal(r.eensgezind)} van ${aantal(r.gestemd)}, ${r.tk} zetels` }))].map((r) => (
          <div key={r.naam} className={s.contrastRij}>
            <span className={s.naam}>{r.naam}</span>
            <span className={s.cel}><span className={s.vul} style={{ width: `${r.pct ?? 0}%` }} /></span>
            <span className={s.getal}>{procent(r.pct)}<span className="verborgen"> {r.uitleg}</span></span>
          </div>
        ))}
      </div>
      <p className={a.link}><Link href={bouwerLink(d)}>Zelf combinaties maken in de coalitiebouwer</Link></p>
    </div>
  );
}

// Blok 5: mee met het eensgezinde kabinet, voor (open stip) en na (volle stip) een akkoord; nu alleen het startpunt
type Halter = { naam: string; voor?: number | null; na: number | null };
function Halters({ titel, rijen }: { titel: string; rijen: Halter[] }) {
  return (
    <div>
      <p className={s.legenda}><span>{titel}</span></p>
      <ol className={a.halter} aria-label={titel}>
        {rijen.map((r) => {
          const v = r.voor ?? null, n = r.na ?? 0;
          return (
            <li key={r.naam}>
              <span className={s.naam}>{r.naam}</span>
              <span className={s.as} aria-hidden="true">
                {v !== null && <span className={a.lijntje} style={{ left: `${Math.min(v, n)}%`, width: `${Math.abs(n - v)}%` }} />}
                {v !== null && <span className={a.leeg} style={{ left: `${v}%` }} />}
                <span className={a.vol} style={{ left: `${n}%` }} />
              </span>
              <span className={s.getal}>{v !== null ? `${Math.round(v)} → ${procent(n)}` : procent(n)}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
export function Toen({ d }: { d: AkkoordData }) {
  const t13 = d.toen["2013"], t12 = d.toen["2012"], nu = d.toen.nu;
  const halter = (t: { voor: { fracties: Array<{ afkorting: string; pct: number | null }> }; na: { fracties: Array<{ afkorting: string; pct: number | null }> } }, x: string): Halter =>
    ({ naam: x, voor: t.voor.fracties.find((f) => f.afkorting === x)!.pct, na: t.na.fracties.find((f) => f.afkorting === x)!.pct });
  return (
    <div className={s.botsen}>
      <p className={s.legenda}>
        <span><span className={a.vakje} style={{ borderRadius: "50%", border: "2px solid var(--tekst-zacht)" }} aria-hidden="true" /> voor het akkoord</span>
        <span><span className={a.vakje} style={{ borderRadius: "50%", background: "var(--koper)" }} aria-hidden="true" /> erna</span>
      </p>
      <Halters titel={`${t13.akkoord.slice(0, 4)}: de partijen van het akkoord`} rijen={t13.partners.map((x) => halter(t13, x))} />
      <Halters titel={`${t13.akkoord.slice(0, 4)}: de andere oppositie`} rijen={t13.anderen.map((x) => halter(t13, x))} />
      <Halters titel={`${t12.akkoord.slice(0, 4)}: de gedoogpartner na het einde van de gedoogsteun`} rijen={[halter(t12, t12.partij)]} />
      <Halters titel={`Nu, kabinet-${nu.kabinet}: het startpunt`} rijen={nu.fracties.map((f) => ({ naam: f.afkorting, na: f.pct }))} />
      <p className={a.lijst} aria-hidden="true">Mee met het eensgezinde kabinet, schaal van 0 tot 100%</p>
    </div>
  );
}

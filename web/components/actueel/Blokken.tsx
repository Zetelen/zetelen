// De vier vaste grafieken van een Actueel-stuk (lib/actueel.ts). Server-componenten zonder interactie: elke grafiek
// toont alle getallen ook als tekst, kleur is nooit de enige drager.
import { CohesieCel } from "@/components/Onderdelen";
import { type ActueelData, aantal, datumTekst, paar, procent, vierkantjes } from "@/lib/actueel";
import { zoekLink } from "@/lib/uitgelicht";
import s from "./actueel.module.css";

// Blok 1: cohesie tussen alle zes, als driehoek; de groep eerst, dan de andere groep
export function Hechtheid({ d }: { d: ActueelData }) {
  const alle = [...d.groep, ...d.tegen];
  return (
    <div className={s.schuif}>
      <table className={s.matrix}>
        <caption className="verborgen">Hoe vaak twee fracties dezelfde kant kozen, onder kabinet-{d.kabinet}</caption>
        <thead>
          <tr><td />{alle.slice(1).map((b) => <th key={b} scope="col">{b}</th>)}</tr>
        </thead>
        <tbody>
          {alle.slice(0, -1).map((a, i) => (
            <tr key={a}>
              <th scope="row">{a}</th>
              {alle.slice(1).map((b, j) => (
                <td key={b}>{j >= i ? <CohesieCel procent={paar(d, a, b)?.cohesie ?? null} /> : null}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Blok 2: per fractie hoe vaak mee met de eensgezinde andere groep, als stip op een schaal van 0 tot 100
export function Meegaan({ d }: { d: ActueelData }) {
  const rijen = [...d.meegaan.fracties].sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
  return (
    <ol className={s.stippen} aria-label={`Hoe vaak mee als ${d.tegen.join(", ")} eensgezind stemden`}>
      {rijen.map((f) => (
        <li key={f.afkorting} className={d.groep.includes(f.afkorting) ? s.inGroep : undefined}>
          <span className={s.naam}>{f.afkorting}</span>
          <span className={s.as} aria-hidden="true">
            {[25, 50, 75].map((t) => <span key={t} className={s.streep} style={{ left: `${t}%` }} />)}
            <span className={s.stip} style={{ left: `${f.pct ?? 0}%` }} />
          </span>
          <span className={s.getal}>{procent(f.pct)}<span className="verborgen"> mee, {aantal(f.mee)} van {aantal(f.gestemd)}</span></span>
        </li>
      ))}
      <li className={s.asLabels} aria-hidden="true"><span /><span className={s.as}><span style={{ left: 0 }}>0%</span><span style={{ left: "50%" }}>50%</span><span style={{ left: "100%" }}>100%</span></span><span /></li>
    </ol>
  );
}

// Blok 3: per thema een vierkantje per stemming waarop beide groepen eensgezind waren; elk vierkantje linkt naar de bron
export function Botspunten({ d }: { d: ActueelData }) {
  return (
    <div className={s.botsen}>
      <p className={s.legenda}>
        <span><span className={`${s.vak} ${s.tegen}`} aria-hidden="true" /> tegenover elkaar</span>
        <span><span className={`${s.vak} ${s.samen}`} aria-hidden="true" /> zelfde kant</span>
      </p>
      {d.botspunten.themas.map((t) => (
        <div key={t.thema} className={s.thema}>
          <span className={s.naam}>{t.thema}</span>
          <span className={s.vakken}>
            {vierkantjes(t).map((x) => {
              const titel = `${datumTekst(x.datum)}: ${x.onderwerp ?? ""} (${x.stand === "tegen" ? "tegenover elkaar" : "zelfde kant"})`;
              return x.zaakNummer
                ? <a key={x.besluit} href={zoekLink(x.zaakNummer)} target="_blank" rel="noopener noreferrer" title={titel} className={`${s.vak} ${s[x.stand]}`}><span className="verborgen">{titel}</span></a>
                : <span key={x.besluit} title={titel} className={`${s.vak} ${s[x.stand]}`} />;
            })}
          </span>
          <span className={s.getal}>{t.tegenover} van {t.beide}</span>
        </div>
      ))}
    </div>
  );
}

// Blok 4: zetels als één balk van 150 met de streep bij de meerderheid; eerst de andere groep, dan de groep van groot naar klein
export function Zetelsom({ d }: { d: ActueelData }) {
  const z = d.zetelsom;
  const nodig = new Set(z.kleinsteMeerderheid.flat());
  const groep = [...d.groep].sort((a, b) => z.zetels[b] - z.zetels[a]);
  const vast = groep.filter((a) => z.kleinsteMeerderheid.every((c) => c.includes(a)));
  return (
    <div className={s.zetels}>
      <div className={s.balk} role="img" aria-label={`${d.tegen.join(", ")} ${z.ref} zetels; ${groep.map((a) => `${a} ${z.zetels[a]}`).join(", ")}; meerderheid ${z.meerderheid}`}>
        <span className={s.ref} style={{ width: `${(100 * z.ref) / 150}%` }}>{d.tegen.join(" + ")} {z.ref}</span>
        {groep.map((a) => (
          <span key={a} className={vast.includes(a) ? s.nodig : nodig.has(a) ? s.keuze : s.over} style={{ width: `${(100 * z.zetels[a]) / 150}%` }}>
          </span>
        ))}
        <span className={s.meerderheid} style={{ left: `${(100 * z.meerderheid) / 150}%` }} aria-hidden="true" />
      </div>
      <p className={s.balkLabels}>
        {groep.map((a) => <span key={a}><span className={`${s.vak} ${vast.includes(a) ? s.nodig : nodig.has(a) ? s.keuze : s.over}`} aria-hidden="true" /> {a} {z.zetels[a]}</span>)}
        <span>Streep: {z.meerderheid} zetels</span>
      </p>
    </div>
  );
}

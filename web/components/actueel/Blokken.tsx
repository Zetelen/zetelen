// De vier grafieken van een Actueel-stuk (lib/actueel.ts). Server-componenten zonder interactie: elke grafiek
// toont alle getallen ook als tekst, kleur is nooit de enige drager.
import { type ActueelData, aantal, datumTekst, procent, vierkantjes } from "@/lib/actueel";
import { zoekLink } from "@/lib/uitgelicht";
import s from "./actueel.module.css";

// Blok 1: per fractie hoe vaak mee met de eensgezinde andere groep, als stip op een schaal van 0 tot 100
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

// Blok 2: per thema een vierkantje per stemming waarop beide groepen eensgezind waren; elk vierkantje linkt naar de bron
export function Botspunten({ d }: { d: ActueelData }) {
  const drie = d.botspunten.themas;
  const beide = drie.reduce((n, t) => n + t.beide, 0), tegen = drie.reduce((n, t) => n + t.tegenover, 0);
  // Eerst het contrast, zoals in de video: alle onderwerpen tegenover de drie thema's
  const balken = [
    { label: "Alle onderwerpen", pct: d.botspunten.alles.pct ?? 0, drie: false },
    { label: "Stikstof, asiel en abortus", pct: (100 * tegen) / beide, drie: true },
  ];
  return (
    <div className={s.botsen}>
      <div className={s.contrast}>
        {balken.map((b) => (
          <div key={b.label} className={s.contrastRij}>
            <span className={s.naam}>{b.label}</span>
            <span className={s.cel}><span className={`${s.vul} ${b.drie ? "" : s.vulZacht}`} style={{ width: `${b.pct}%` }} /></span>
            <span className={s.getal}>{procent(b.pct)}</span>
          </div>
        ))}
      </div>
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

// Blok 3: per fractie en thema hoe vaak mee met het eensgezinde kabinet, eerst over alle stemmingen als vergelijking;
// een balkje per cel, de aantallen erbij (kleine aantallen: geen procenten)
const KORT: Record<string, string> = { Alles: "Alles", Stikstof: "Stikstof", "Asielopvang en spreidingswet": "Asiel", "Abortus, embryo, draagmoeder": "Abortus" };
export function PerThema({ d }: { d: ActueelData }) {
  return (
    <div className={s.schuif}>
      <table className={s.perThema}>
        <caption className="verborgen">Hoe vaak elke fractie uit het blok meeging met {d.tegen.join(", ")}, per thema</caption>
        <thead>
          <tr><td />{d.perThema.map((t) => <th key={t.thema} scope="col">{KORT[t.thema] ?? t.thema}</th>)}</tr>
        </thead>
        <tbody>
          {d.groep.map((a) => (
            <tr key={a}>
              <th scope="row">{a}</th>
              {d.perThema.map((t) => {
                const f = t.fracties.find((x) => x.afkorting === a)!;
                return (
                  <td key={t.thema}>
                    <span className={s.cel}>
                      <span className={s.vul} style={{ width: `${f.pct ?? 0}%` }} aria-hidden="true" />
                      <span className={s.celTekst}>{t.thema === "Alles" ? procent(f.pct) : `${aantal(f.mee)} van ${aantal(f.gestemd)}`}</span>
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Blok 4: zetels als één balk van 150 met de streep bij de meerderheid; eerst het kabinet, dan het blok van groot naar klein.
// Geen onderscheid in wie nodig is: de Eerste Kamer staat niet in de data
export function Zetelsom({ d }: { d: ActueelData }) {
  const z = d.zetelsom;
  const groep = [...d.groep].sort((a, b) => z.zetels[b] - z.zetels[a]);
  return (
    <div className={s.zetels}>
      <div className={s.balk} role="img" aria-label={`${d.tegen.join(", ")} ${z.ref} zetels; ${groep.map((a) => `${a} ${z.zetels[a]}`).join(", ")}; samen ${z.samen}; meerderheid ${z.meerderheid}`}>
        <span className={s.ref} style={{ width: `${(100 * z.ref) / 150}%` }}>{d.tegen.join(" + ")} {z.ref}</span>
        {groep.map((a) => (
          <span key={a} className={s.blok4} style={{ width: `${(100 * z.zetels[a]) / 150}%` }}>
          </span>
        ))}
        <span className={s.meerderheid} style={{ left: `${(100 * z.meerderheid) / 150}%` }} aria-hidden="true" />
      </div>
      <p className={s.balkLabels}>
        {groep.map((a) => <span key={a}><span className={`${s.vak} ${s.blok4}`} aria-hidden="true" /> {a} {z.zetels[a]}</span>)}
        <span>Samen {z.samen}</span>
        <span>Streep: {z.meerderheid} zetels</span>
      </p>
    </div>
  );
}

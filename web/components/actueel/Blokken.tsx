// De vier grafieken van een Actueel-stuk (lib/actueel.ts). Server-componenten zonder interactie: elke grafiek
// toont alle getallen ook als tekst, kleur is nooit de enige drager.
import { type ActueelData, aantal, datumTekst, gemiddelde, opDrieThemas, paarCohesie, perThema, procent, vierkantjes } from "@/lib/actueel";
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
  // Eerst de omkering, zoals in de video: per partij hoe vaak mee op de drie thema's, de streep bij alle onderwerpen
  const alles = perThema(d, "Alles")!;
  return (
    <div className={s.botsen}>
      <div className={s.contrast}>
        <p className={s.legenda}><span>Mee met het kabinet op stikstof, asiel en abortus</span><span><span className={s.streepUitleg} aria-hidden="true" /> over alle onderwerpen</span></p>
        {opDrieThemas(d).map((f) => {
          const gem = alles.fracties.find((x) => x.afkorting === f.afkorting)!.pct ?? 0;
          return (
            <div key={f.afkorting} className={s.contrastRij}>
              <span className={s.naam}>{f.afkorting}</span>
              <span className={s.cel}>
                <span className={s.vul} style={{ width: `${f.pct ?? 0}%` }} />
                <span className={s.streep} style={{ left: `${gem}%` }} title={`Over alle onderwerpen ${procent(gem)}`} />
              </span>
              <span className={s.getal}>{procent(f.pct)}</span>
            </div>
          );
        })}
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

// Stuk "kabinet-cu-50plus", blok 1: de gemiddelde cohesie van de groep in drie stappen, daaronder de cohesie van elk paar
const KORT_NAAM: Record<string, string> = { ChristenUnie: "CU", "Groep Markuszower": "Markuszower" };
const STAPPEN: Array<[string, string]> = [["kabinet", "Kabinet"], ["met-cu-50plus", "Plus ChristenUnie en 50PLUS"], ["met-markuszower", "Plus Groep Markuszower"]];
export function Hechtheid({ d }: { d: ActueelData }) {
  const zes = gemiddelde(d, "met-markuszower").fracties;
  return (
    <div className={s.botsen}>
      <div className={s.contrast}>
        <p className={s.legenda}><span>Gemiddelde cohesie van alle paren in de groep</span></p>
        {STAPPEN.map(([id, naam]) => {
          const g = gemiddelde(d, id);
          return (
            <div key={id} className={s.contrastRij}>
              <span className={s.naam}>{naam}</span>
              <span className={s.cel}>
                <span className={s.vul} style={{ width: `${g.gemiddelde}%` }} />
              </span>
              <span className={s.getal}>{procent(g.gemiddelde)}<span className="verborgen"> over {g.paren} paren, van {procent(g.laagste)} tot {procent(g.hoogste)}</span></span>
            </div>
          );
        })}
      </div>
      <div className={s.schuif}>
        <table className={s.perThema}>
          <caption className="verborgen">Cohesie per paar: het percentage gezamenlijke verdeelde stemmingen met dezelfde kant</caption>
          <thead>
            <tr><td />{zes.map((b) => <th key={b} scope="col">{KORT_NAAM[b] ?? b}</th>)}</tr>
          </thead>
          <tbody>
            {zes.map((a) => (
              <tr key={a}>
                <th scope="row">{KORT_NAAM[a] ?? a}</th>
                {zes.map((b) => {
                  if (a === b) return <td key={b} />;
                  const c = paarCohesie(d, a, b);
                  return (
                    <td key={b}>
                      <span className={s.cel}>
                        <span className={s.vul} style={{ width: `${c}%` }} aria-hidden="true" />
                        <span className={s.celTekst}>{procent(c)}</span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Stuk "kabinet-cu-50plus", blok 4: wat de steun van een extra fractie tot nu toe uitmaakte, in vier regels met aantallen
export function Doorslag({ d }: { d: ActueelData }) {
  const x = d.doorslag!;
  const rijen: Array<{ naam: string; deel: number; geheel: number }> = [
    { naam: `${x.extra} stemde mee`, deel: x.mee, geheel: x.gestemd },
    { naam: "Uitslag ook zonder haar zetels dezelfde", deel: x.mee - x.nodig, geheel: x.mee },
    { naam: "Uitslag anders met haar zetels aan de kant van de vijf", deel: x.kostte, geheel: x.tegen },
    { naam: "Krappe uitslag (verschil kleiner dan twee keer haar zetels)", deel: x.krap, geheel: x.gestemd },
  ];
  return (
    <div className={`${s.contrast} ${s.breedGetal}`}>
      <p className={s.legenda}><span>Stemmingen waarop {x.kern.join(", ")} dezelfde kant kozen en de {x.extra} stemde</span></p>
      {rijen.map((r) => (
        <div key={r.naam} className={s.contrastRij}>
          <span className={s.naam}>{r.naam}</span>
          <span className={s.cel}>
            <span className={s.vul} style={{ width: `${r.geheel ? (100 * r.deel) / r.geheel : 0}%` }} />
          </span>
          <span className={s.getal}>{aantal(r.deel)} van {aantal(r.geheel)}</span>
        </div>
      ))}
    </div>
  );
}

// Stuk "kabinet-cu-50plus", blok 2: hoe vaak mee met het eensgezinde kabinet, in de stappen van het stuk: eerst het blok
// (de fracties van de groep behalve de extra fractie), dan de extra fractie erbij, dan de vergelijking
export function MeegaanStappen({ d }: { d: ActueelData }) {
  const extra = d.doorslag!.extra;
  const per = (afk: string) => d.meegaan.fracties.find((f) => f.afkorting === afk)!;
  const groepen: Array<[string, string[]]> = [
    [`Eerst: ${d.groep.filter((a) => a !== extra).join(" en ")} bij het kabinet`, d.groep.filter((a) => a !== extra)],
    [`Erbij: de ${extra}`, [extra]],
    ["Ter vergelijking", d.meegaan.fracties.map((f) => f.afkorting).filter((a) => !d.groep.includes(a))],
  ];
  return (
    <div className={s.botsen}>
      {groepen.map(([label, fr], i) => (
        <div key={label}>
          <p className={s.legenda}><span>{label}</span></p>
          <ol className={s.stippen} aria-label={label}>
            {fr.map((a) => {
              const f = per(a);
              return (
                <li key={a} className={d.groep.includes(a) ? s.inGroep : undefined}>
                  <span className={s.naam}>{a}</span>
                  <span className={s.as} aria-hidden="true">
                    {[25, 50, 75].map((x) => <span key={x} className={s.streep} style={{ left: `${x}%` }} />)}
                    <span className={s.stip} style={{ left: `${f.pct ?? 0}%` }} />
                  </span>
                  <span className={s.getal}>{procent(f.pct)}<span className="verborgen"> mee, {aantal(f.mee)} van {aantal(f.gestemd)}</span></span>
                </li>
              );
            })}
            {i === groepen.length - 1 && <li className={s.asLabels} aria-hidden="true"><span /><span className={s.as}><span style={{ left: 0 }}>0%</span><span style={{ left: "50%" }}>50%</span><span style={{ left: "100%" }}>100%</span></span><span /></li>}
          </ol>
        </div>
      ))}
    </div>
  );
}

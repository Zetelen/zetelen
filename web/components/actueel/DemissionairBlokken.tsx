// De twee grafieken van het Actueel-stuk "demissionair" (lib/actueel.ts). Server-componenten zonder interactie, in de
// stijl van AkkoordBlokken.tsx en VerdeeldBlokken.tsx: elke grafiek toont de getallen ook als tekst, kleur en vorm zijn
// nooit de enige drager. Een kleine periode (minder dan grenzen.klein verdeelde stemmingen) staat er gestippeld bij,
// met het woord "klein".
import { type DemKabinet, type DemPeriode, type DemPeriodeNaam, type DemissionairData, DEM_PERIODES, PERIODE_TEKST, aantal, eensPct, paarPct, kortNaam, periodeGetal, periodeUitleg, procent, puntKort, verschuivingen } from "@/lib/actueel";
import s from "./actueel.module.css";
import a from "./akkoord.module.css";
import m from "./demissionair.module.css";

const TEKEN: Record<DemPeriodeNaam, string> = { missionair: m.missionair, demVoor: m.voor, demNa: m.na };
const KORT: Record<DemPeriodeNaam, string> = { missionair: "mis.", demVoor: "vóór", demNa: "na" };

function Legenda({ klein }: { klein: number }) {
  return (
    <p className={s.legenda}>
      {DEM_PERIODES.map((p) => <span key={p}><span className={`${m.teken} ${TEKEN[p]}`} aria-hidden="true" /> {PERIODE_TEKST[p]}</span>)}
      <span><span className={`${m.teken} ${m.missionair} ${m.klein}`} aria-hidden="true" /> klein: minder dan {aantal(klein)} stemmingen</span>
    </p>
  );
}

// Eén rij: drie tekens op een as van 0 tot 100%, met een lijn van het hoogste naar het laagste teken
function Rij({ naam, periodes, waarde, sub = false }: {
  naam: string; periodes: Partial<Record<DemPeriodeNaam, DemPeriode | null>>; sub?: boolean;
  waarde: (p: DemPeriode) => { pct: number | null; deel: number; geheel: number };
}) {
  const er = DEM_PERIODES.filter((p) => p in periodes);
  const pcts = er.map((p) => periodes[p]).filter((p): p is DemPeriode => !!p && waarde(p).pct != null).map((p) => waarde(p).pct!);
  const lo = Math.min(...pcts), hi = Math.max(...pcts);
  return (
    <li className={sub ? m.sub : undefined} aria-label={`${naam}: ${er.map((p) => { const x = periodes[p] ?? null; return periodeUitleg(x, p, x && waarde(x)); }).join(", ")}`}>
      <span className={m.naam}>{naam}</span>
      <span className={s.as} aria-hidden="true">
        {pcts.length > 1 && <span className={m.lijn} style={{ left: `${lo}%`, width: `${hi - lo}%` }} />}
        {er.map((p) => {
          const x = periodes[p];
          if (!x || waarde(x).pct == null) return null;
          return <span key={p} className={`${m.teken} ${TEKEN[p]} ${x.klein ? m.klein : ""}`} style={{ left: `${waarde(x).pct}%` }} />;
        })}
      </span>
      <span className={m.getal} aria-hidden="true">
        {er.map((p) => {
          const x = periodes[p] ?? null;
          return <span key={p} className={x?.klein ? m.kleinGetal : undefined}>{KORT[p]} {periodeGetal(x, x && waarde(x).pct)}</span>;
        })}
      </span>
    </li>
  );
}

const eens = (p: DemPeriode) => ({ pct: eensPct(p), deel: p.eensgezind.eensgezind, geheel: p.eensgezind.gestemd });

// Blok "val": per kabinet de eensgezindheid van de blijvende partijen in de drie periodes; bij drie of vier partijen
// eronder (uitklapbaar) de paren; onderaan kabinet-Jetten, alleen missionair
export function Val({ d }: { d: DemissionairData }) {
  const paarVan = (k: DemKabinet, a1: string, b1: string) => (p: DemPeriode) => {
    const x = p.paren.find((y) => y.a === a1 && y.b === b1)!;
    return { pct: paarPct(x), deel: x.gelijk, geheel: x.gezamenlijk };
  };
  return (
    <div className={s.botsen}>
      <Legenda klein={d.grenzen.klein} />
      {d.kabinetten.map((k) => (
        <div key={k.kabinet} className={m.kabinet}>
          <ol className={m.rijen} aria-label={`${k.kabinet}: eensgezind`}>
            <Rij naam={`${k.kabinet} · ${k.blijvend.map(kortNaam).join(", ")}`} periodes={k.periodes} waarde={eens} />
          </ol>
          {k.groep.length >= 3 && (
            <details className={m.paren}>
              <summary>Per paar kabinetspartijen</summary>
              <ol className={m.rijen} aria-label={`${k.kabinet}: cohesie per paar`}>
                {k.periodes.missionair!.paren.map((p) => (
                  <Rij key={`${p.a}-${p.b}`} sub naam={`${kortNaam(p.a)} en ${kortNaam(p.b)}`} periodes={k.periodes} waarde={paarVan(k, p.a, p.b)} />
                ))}
              </ol>
            </details>
          )}
        </div>
      ))}
      <div className={m.kabinet}>
        <ol className={m.rijen} aria-label={`${d.jetten.kabinet}: eensgezind, missionair`}>
          <Rij naam={`${d.jetten.kabinet} (nu) · ${d.jetten.partijen.join(", ")}`} periodes={{ missionair: d.jetten.missionair }} waarde={eens} />
        </ol>
      </div>
      <p className={a.lijst} aria-hidden="true">Eensgezind, aandeel van de verdeelde stemmingen waarop alle blijvende partijen stemden, schaal van 0 tot 100% · * klein</p>
    </div>
  );
}

// Blok "oppositie": per kabinet, per kabinetspartij het sterkst stijgende en dalende paar met een oppositiepartij, als
// balk vanaf nul; de stippellijn is de mediane verandering van alle paren
export function Oppositie({ d }: { d: DemissionairData }) {
  const max = Math.ceil(Math.max(...d.kabinetten.filter((k) => k.campagne).flatMap((k) => verschuivingen(k).map((v) => Math.abs(v.verschil)))) / 5) * 5;
  const x = (v: number) => 50 + (50 * v) / max;
  return (
    <div className={s.botsen}>
      <p className={s.legenda}>
        <span><span className={`${a.vakje} ${m.op}`} aria-hidden="true" /> vaker dezelfde kant</span>
        <span><span className={`${a.vakje} ${m.af}`} aria-hidden="true" /> minder vaak</span>
        <span><span className={m.medTeken} aria-hidden="true" /> mediane verandering van alle paren</span>
      </p>
      {d.kabinetten.map((k) => {
        const c = k.campagne, klein = !!k.periodes.missionair?.klein || !!k.periodes.demVoor?.klein;
        if (!c) return (
          <div key={k.kabinet} className={m.kabinet}>
            <p className={m.kop}>{k.kabinet}: geen stemmingen vóór de nieuwe Kamer</p>
          </div>
        );
        const rijen = verschuivingen(k);
        return (
          <div key={k.kabinet} className={`${m.kabinet} ${klein ? m.kleinBlok : ""}`}>
            <p className={m.kop}>
              {k.kabinet} · mediaan alle paren {puntKort(c.mediaan!)}
              {klein && <> · klein: missionair {aantal(k.periodes.missionair!.verdeeld)} stemmingen</>}
            </p>
            <ol className={m.rijen} aria-label={`${k.kabinet}: verandering in cohesie per paar, missionair tegenover vóór de nieuwe Kamer, mediaan van alle paren ${puntKort(c.mediaan!)} procentpunt${klein ? ", klein" : ""}`}>
              {rijen.map((v) => (
                <li key={`${v.kabinetspartij}-${v.oppositie}`} aria-label={`${kortNaam(v.kabinetspartij)} en ${kortNaam(v.oppositie)}: van ${procent(v.voor)} naar ${procent(v.na)}, ${puntKort(v.verschil)} procentpunt, ${aantal(v.nNa)} gezamenlijke stemmingen`}>
                  <span className={m.naam}>{kortNaam(v.kabinetspartij)} en {kortNaam(v.oppositie)}</span>
                  <span className={m.balkAs} aria-hidden="true">
                    <span className={m.nul} />
                    <span className={`${m.balk} ${v.verschil > 0 ? m.op : m.af}`}
                      style={{ left: `${Math.min(50, x(v.verschil))}%`, width: `${Math.abs(x(v.verschil) - 50)}%` }} />
                    <span className={m.mediaan} style={{ left: `${x(c.mediaan!)}%` }} />
                  </span>
                  <span className={m.getal} aria-hidden="true">{puntKort(v.verschil)}</span>
                </li>
              ))}
            </ol>
          </div>
        );
      })}
      <p className={a.lijst} aria-hidden="true">Verandering in procentpunt, missionair tegenover demissionair vóór de nieuwe Kamer, schaal van -{max} tot +{max}</p>
    </div>
  );
}

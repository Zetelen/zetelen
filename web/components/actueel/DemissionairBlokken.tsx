// De twee grafieken van het Actueel-stuk "demissionair" (lib/actueel.ts). Server-componenten zonder interactie.
// Herzien op 18 november 2026 (feedback Niels: "je moet ze echt heel goed bekijken of lezen voor je snapt wat er bedoeld
// wordt"): geen legenda met vormen en geen afkortingen meer.
// - Blok "val": per kabinet drie balken, met de periode voluit en het percentage erachter. Een balk begint bij 0%.
// - Blok "oppositie": per kabinet een stippenstrook. Elke stip is een paar van een kabinetspartij en een oppositiepartij,
//   links minder vaak dezelfde kant, rechts vaker. Een doorgetrokken nullijn, de mediaan van alle paren als stippellijn,
//   alleen de twee uitersten met een naam. Alle paren staan ook als lijst voor schermlezers.
// Een kleine periode (minder dan grenzen.klein verdeelde stemmingen) is gearceerd en heeft het woord "klein".
import { type DemPeriode, type DemPeriodeNaam, type DemissionairData, DEM_PERIODES, aantal, eensPct, paarPct, kortNaam, procent, puntKort } from "@/lib/actueel";
import s from "./actueel.module.css";
import a from "./akkoord.module.css";
import m from "./demissionair.module.css";

// De periodes voluit, zonder legenda
const PERIODE_LABEL: Record<DemPeriodeNaam, string> = {
  missionair: "missionair",
  demVoor: "demissionair, vóór de nieuwe Kamer",
  demNa: "demissionair, met de nieuwe Kamer",
};

// Eén balk: label boven, de balk met het percentage erachter
function Balk({ periode, p, klein }: { periode: DemPeriodeNaam; p: DemPeriode | null; klein: number }) {
  const pct = p ? eensPct(p) : null;
  return (
    <li>
      <span className={m.balkLabel}>{PERIODE_LABEL[periode]}</span>
      <span className={m.balkRij}>
        <span className={m.balkSpoor} aria-hidden="true">
          {pct != null && <span className={`${m.balkVul} ${m.periode} ${p!.klein ? m.gearceerd : ""}`} data-periode={periode} style={{ width: `${pct}%` }} />}
        </span>
        <span className={m.balkGetal}>{pct == null ? "" : procent(pct)}</span>
      </span>
      {/* Op een eigen regel, zodat elk spoor even breed is en de balken te vergelijken blijven */}
      {!p && <span className={m.kleinWoord}>geen stemmingen in deze periode</span>}
      {p?.klein && <span className={m.kleinWoord}>klein: {aantal(p.verdeeld)} verdeelde stemmingen</span>}
      <span className="verborgen">{p && pct != null ? ` (${aantal(p.eensgezind.eensgezind)} van ${aantal(p.eensgezind.gestemd)} verdeelde stemmingen${p.klein ? `, klein: minder dan ${aantal(klein)}` : ""})` : ""}</span>
    </li>
  );
}

// Blok "val": per kabinet de eensgezindheid van de blijvende partijen in de drie periodes; bij drie of vier partijen
// eronder (uitklapbaar) de paren als tabel; onderaan kabinet-Jetten ter vergelijking, alleen missionair
export function Val({ d }: { d: DemissionairData }) {
  return (
    <div className={s.botsen}>
      <p className={a.lijst}>Hoe vaak alle blijvende kabinetspartijen dezelfde kant kozen, van de verdeelde stemmingen</p>
      {d.kabinetten.map((k) => (
        <div key={k.kabinet} className={m.kabinet}>
          <p className={m.kabinetNaam}><strong>{k.kabinet}</strong> · {k.blijvend.map(kortNaam).join(", ")}</p>
          <ul className={m.balken}>
            {DEM_PERIODES.map((p) => <Balk key={p} periode={p} p={k.periodes[p]} klein={d.grenzen.klein} />)}
          </ul>
          {k.groep.length >= 3 && k.periodes.missionair && (
            <details className={m.paren}>
              <summary>Per paar kabinetspartijen</summary>
              <div className={m.tabelStrook}>
                <table className={m.parenTabel}>
                  <thead>
                    <tr><th scope="col">Paar</th><th scope="col">missionair</th><th scope="col">vóór nieuwe Kamer</th><th scope="col">met nieuwe Kamer</th></tr>
                  </thead>
                  <tbody>
                    {k.periodes.missionair.paren.map((q) => (
                      <tr key={`${q.a}-${q.b}`}>
                        <th scope="row">{kortNaam(q.a)} en {kortNaam(q.b)}</th>
                        {DEM_PERIODES.map((p) => {
                          const x = k.periodes[p]?.paren.find((y) => y.a === q.a && y.b === q.b);
                          const pct = x ? paarPct(x) : null;
                          return <td key={p}>{pct == null ? "geen" : `${procent(pct)}${k.periodes[p]!.klein ? " (klein)" : ""}`}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </div>
      ))}
      <div className={m.kabinet}>
        <p className={m.kabinetNaam}><strong>{d.jetten.kabinet}</strong> (nu, ter vergelijking) · {d.jetten.partijen.join(", ")}</p>
        <ul className={m.balken}>
          <Balk periode="missionair" p={d.jetten.missionair} klein={d.grenzen.klein} />
        </ul>
      </div>
      <p className={a.lijst}>Een balk loopt van 0 tot 100%. Gearceerd: klein, minder dan {aantal(d.grenzen.klein)} verdeelde stemmingen; telt niet mee in de vergelijking.</p>
    </div>
  );
}

// Blok "oppositie": per kabinet alle paren van een blijvende kabinetspartij en een oppositiepartij als stippen op een as
// van min tot plus; stippen die bijna samenvallen staan boven elkaar
export function Oppositie({ d }: { d: DemissionairData }) {
  const metPaar = d.kabinetten.filter((k) => k.campagne);
  const max = Math.max(15, Math.ceil(Math.max(...metPaar.flatMap((k) => k.campagne!.kabOpp.map((v) => Math.abs(v.verschil)))) / 5) * 5);
  const x = (v: number) => 50 + (50 * v) / max;
  const STAP = 1.6; // breedte van een stapelvak in procentpunt
  return (
    <div className={s.botsen}>
      <p className={a.lijst}>Elke stip is een kabinetspartij met een oppositiepartij: hoe vaak ze dezelfde kant kozen, demissionair vóór de nieuwe Kamer tegenover missionair</p>
      {d.kabinetten.map((k) => {
        const c = k.campagne;
        const klein = !!k.periodes.missionair?.klein || !!k.periodes.demVoor?.klein;
        if (!c) return (
          <div key={k.kabinet} className={m.kabinet}>
            <p className={m.kabinetNaam}><strong>{k.kabinet}</strong>: geen stemmingen vóór de nieuwe Kamer</p>
          </div>
        );
        const paren = [...c.kabOpp].sort((p, q) => p.verschil - q.verschil);
        const laag = paren[0], hoog = paren[paren.length - 1];
        // Stapelen: per vak van STAP procentpunt de stippen boven elkaar
        const teller = new Map<number, number>();
        const stippen = paren.map((v) => {
          const vak = Math.round(v.verschil / STAP);
          const n = teller.get(vak) ?? 0;
          teller.set(vak, n + 1);
          return { v, rij: n };
        });
        const hoogte = Math.max(...stippen.map((p) => p.rij)) + 1;
        const binnen5 = paren.filter((v) => Math.abs(v.verschil) < 5).length;
        return (
          <div key={k.kabinet} className={`${m.kabinet} ${klein ? m.kleinBlok : ""}`}>
            <p className={m.kabinetNaam}>
              <strong>{k.kabinet}</strong> · {aantal(paren.length)} paren, {aantal(binnen5)} veranderden minder dan 5 procentpunt
              {klein && <> · klein: missionair {aantal(k.periodes.missionair!.verdeeld)} stemmingen</>}
            </p>
            <div className={m.strook} style={{ height: `${hoogte * 12 + 12}px` }} aria-hidden="true">
              <span className={m.nullijn} style={{ left: "50%" }} />
              {c.mediaan != null && <span className={m.mediaanLijn} style={{ left: `${x(c.mediaan)}%` }} />}
              {stippen.map(({ v, rij }) => (
                <span key={`${v.kabinetspartij}-${v.oppositie}`} className={m.stip} style={{ left: `${x(v.verschil)}%`, bottom: `${rij * 12 + 4}px` }} />
              ))}
            </div>
            <p className={m.asLabels} aria-hidden="true"><span>-{max}</span><span>0</span><span>+{max}</span></p>
            <p className={m.uitersten} aria-hidden="true">
              <span>{kortNaam(laag.kabinetspartij)} en {kortNaam(laag.oppositie)}: {puntKort(laag.verschil)}</span>
              <span>{kortNaam(hoog.kabinetspartij)} en {kortNaam(hoog.oppositie)}: {puntKort(hoog.verschil)}</span>
            </p>
            <ul className="verborgen" aria-label={`${k.kabinet}: verandering per paar in procentpunt, mediaan van alle paren ${c.mediaan != null ? puntKort(c.mediaan) : "onbekend"}`}>
              {paren.map((v) => (
                <li key={`${v.kabinetspartij}-${v.oppositie}`}>{kortNaam(v.kabinetspartij)} en {kortNaam(v.oppositie)}: van {procent(v.voor)} naar {procent(v.na)}, {puntKort(v.verschil)} procentpunt</li>
              ))}
            </ul>
          </div>
        );
      })}
      <p className={a.lijst}>
        In procentpunt: links minder vaak dezelfde kant, rechts vaker. Doorgetrokken lijn: geen verandering. Stippellijn: de mediane verandering van alle paren, ook van
        oppositiepartijen onderling, als maat voor de andere agenda in die maanden.
      </p>
    </div>
  );
}

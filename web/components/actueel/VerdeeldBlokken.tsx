// De twee grafieken van het Actueel-stuk "coalitie-verdeeld" (lib/actueel.ts). Server-componenten zonder interactie,
// in de stijl van AkkoordBlokken.tsx: elke grafiek toont de getallen ook als tekst, kleur is nooit de enige drager.
import Link from "next/link";
import { type GroepNaam, type VerdeeldData, aantal, anderen, groepNaam, maandKort, maandPct, maandTekst, procent, schaalMaanden, zonderLink } from "@/lib/actueel";
import s from "./actueel.module.css";
import a from "./akkoord.module.css";
import v from "./verdeeld.module.css";

// Blok "maanden": per maand drie tekens op een as van 0 tot de schaal. De VVD als volle stip, D66 als open stip en het
// CDA als klein vierkant; rechts het aandeel van de VVD en de noemer
export function Maanden({ d }: { d: VerdeeldData }) {
  const max = schaalMaanden(d);
  const [ander, derde] = anderen(d);
  const pos = (p: number | null) => `${(100 * (p ?? 0)) / max}%`;
  return (
    <div className={s.botsen}>
      <p className={s.legenda}>
        <span><span className={`${v.teken} ${v.buiten}`} aria-hidden="true" /> {d.buiten} alleen</span>
        <span><span className={`${v.teken} ${v.ander}`} aria-hidden="true" /> {ander} alleen</span>
        <span><span className={`${v.teken} ${v.derde}`} aria-hidden="true" /> {derde} alleen</span>
      </p>
      <ol className={v.maanden} aria-label={`Per maand het aandeel verdeelde stemmingen waarop een kabinetspartij alleen stond, schaal tot ${max}%`}>
        {d.maanden.map((m) => {
          const leeg = m.verdeeld === 0;
          const uitleg = leeg ? `${maandTekst(m.maand)}: geen stemmingen`
            : `${maandTekst(m.maand)}, ${aantal(m.verdeeld)} verdeelde stemmingen: ${d.tegen.map((x) => `${x} ${m.alleen[x]} keer alleen (${procent(maandPct(m, x))})`).join(", ")}`;
          return (
            <li key={m.maand} aria-label={uitleg}>
              <span className={v.maand}>{maandKort(m.maand)}</span>
              <span className={v.as} aria-hidden="true">
                {!leeg && <>
                  <span className={`${v.teken} ${v.derde}`} style={{ left: pos(maandPct(m, derde)) }} />
                  <span className={`${v.teken} ${v.ander}`} style={{ left: pos(maandPct(m, ander)) }} />
                  <span className={`${v.teken} ${v.buiten}`} style={{ left: pos(maandPct(m, d.buiten)) }} />
                </>}
                {leeg && <span className={v.geen}>geen stemmingen</span>}
              </span>
              <span className={v.getal} aria-hidden="true">{leeg ? "" : `${procent(maandPct(m, d.buiten))} · ${m.alleen[d.buiten]}/${aantal(m.verdeeld)}`}</span>
            </li>
          );
        })}
      </ol>
      <p className={a.lijst} aria-hidden="true">Aandeel van de verdeelde stemmingen in de maand, schaal van 0 tot {max}% · rechts: {d.buiten} alleen, keer van het aantal verdeelde stemmingen</p>
    </div>
  );
}

// Blok "zonder": per groep de zetels in de Tweede Kamer (balk tot 150 met de meerderheid als streep) en hoe vaak de
// groep eensgezind stemde. Eerst het kabinet ter vergelijking, dan de groepen zonder de VVD
const VOLGORDE: GroepNaam[] = ["kabinet", "kabinetSteun", "zonder", "zonderAkkoord", "zonderSteun", "zonderBeide"];
export function Zonder({ d }: { d: VerdeeldData }) {
  const z = d.zonder;
  return (
    <div className={s.botsen}>
      <div className={`${s.contrast} ${s.breedGetal}`}>
        <p className={s.legenda}><span>Zetels in de Tweede Kamer · streep: meerderheid ({z.tk.meerderheid})</span></p>
        {VOLGORDE.map((n) => {
          const g = z.groepen[n], met = n.startsWith("kabinet");
          return (
            <div key={n} className={s.contrastRij}>
              <span className={s.naam}>{groepNaam(d, n)}</span>
              <span className={`${s.cel} ${v.zetelCel}`}>
                <span className={s.vul} style={{ width: `${(100 * g.tk) / 150}%`, ...(met ? { background: "var(--lijn-licht)" } : {}) }} />
                <span className={a.grens} style={{ left: `${(100 * z.tk.meerderheid) / 150}%` }} aria-hidden="true" />
              </span>
              <span className={s.getal}>{g.tk}<span className="verborgen"> zetels{g.tk >= z.tk.meerderheid ? ", een meerderheid" : ""}</span></span>
            </div>
          );
        })}
      </div>
      <div className={`${s.contrast} ${s.breedGetal}`}>
        <p className={s.legenda}><span>Hoe vaak eensgezind, verdeelde stemmingen</span></p>
        {VOLGORDE.map((n) => {
          const g = z.groepen[n], met = n.startsWith("kabinet");
          return (
            <div key={n} className={s.contrastRij}>
              <span className={s.naam}>{groepNaam(d, n)}</span>
              <span className={s.cel}><span className={s.vul} style={{ width: `${g.pct ?? 0}%`, ...(met ? { background: "var(--lijn-licht)" } : {}) }} /></span>
              <span className={s.getal}>{procent(g.pct)}<span className="verborgen"> eensgezind, {aantal(g.eensgezind)} van {aantal(g.gestemd)}</span></span>
            </div>
          );
        })}
      </div>
      <p className={a.lijst} aria-hidden="true">Lichter: met de {d.buiten}, ter vergelijking</p>
      <p className={a.link}><Link href={zonderLink(d)}>Het kabinet zonder de {d.buiten} in de coalitiebouwer</Link></p>
    </div>
  );
}

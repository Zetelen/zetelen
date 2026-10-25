// Tabellen voor zetelwerk (component zetelwerk): per fractie en per Kamerlid ingediend, aangenomen, brede steun
// en mede ingediend. Moties en amendementen apart. Onder 10 ingediende stukken geen percentage.
import Link from "next/link";
import { getal } from "@/lib/cohesie";
import { schaalkleur } from "@/lib/kleur";
import { type FractieWerk, type Kamerlid, type Stuk, aandeel } from "@/lib/zetelwerk";
import s from "./zetelwerk.module.css";

function Aangenomen({ aangenomen, ingediend }: { aangenomen: number; ingediend: number }) {
  const p = aandeel(aangenomen, ingediend);
  return (
    <>
      {getal(aangenomen)} <span className={s.zacht}>{p != null ? `${p}%` : ""}</span>
      {p != null && <span className={s.balkje} aria-hidden="true"><span style={{ width: `${p}%`, background: schaalkleur(p) }} /></span>}
    </>
  );
}

export function FractieTabel({ rijen, hrefVoor, actief, stuk }: { rijen: FractieWerk[]; hrefVoor: (afk: string) => string; actief: string | null; stuk: Stuk }) {
  return (
    <div className={s.tabelKader}>
      <table className={s.tabel}>
        <caption className="verborgen">{stuk === "Motie" ? "Moties" : "Amendementen"} per fractie: ingediend, aangenomen, brede steun en mede ingediend</caption>
        <thead>
          <tr><th scope="col">Fractie</th><th scope="col">Ingediend</th><th scope="col">Aangenomen</th><th scope="col">Brede steun</th><th scope="col">Mede ingediend</th></tr>
        </thead>
        <tbody>
          {rijen.map((r) => (
            <tr key={r.fractie} data-actief={actief === r.afkorting}>
              <td><Link href={hrefVoor(r.afkorting)} scroll={false}>{r.afkorting}</Link><span className={s.rol} data-rol={r.rol}>{r.rol}</span></td>
              <td>{getal(r.ingediend)}</td>
              <td><Aangenomen aangenomen={r.aangenomen} ingediend={r.ingediend} /></td>
              <td>{getal(r.brede_steun)}</td>
              <td>{getal(r.mede)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function KamerledenTabel({ leden, hrefVoor, actief }: { leden: Kamerlid[]; hrefVoor: (persoon: string) => string; actief: string | null }) {
  return (
    <div className={s.tabelKader}>
      <table className={s.tabel}>
        <caption className="verborgen">Kamerleden: moties en amendementen ingediend en aangenomen</caption>
        <thead>
          <tr>
            <th scope="col">Kamerlid</th><th scope="col">Moties</th><th scope="col">Aangenomen</th><th scope="col">Brede steun</th>
            <th scope="col">Amendementen</th><th scope="col">Aangenomen</th><th scope="col">Mede</th>
          </tr>
        </thead>
        <tbody>
          {leden.map((k) => (
            <tr key={k.persoon} data-actief={actief === k.persoon}>
              <td><Link href={hrefVoor(k.persoon)} scroll={false}>{k.naam}</Link> <span className={s.zacht}>{k.fractie}</span></td>
              <td>{getal(k.motie?.ingediend ?? 0)}</td>
              <td><Aangenomen aangenomen={k.motie?.aangenomen ?? 0} ingediend={k.motie?.ingediend ?? 0} /></td>
              <td>{getal(k.motie?.brede_steun ?? 0)}</td>
              <td>{getal(k.amendement?.ingediend ?? 0)}</td>
              <td><Aangenomen aangenomen={k.amendement?.aangenomen ?? 0} ingediend={k.amendement?.ingediend ?? 0} /></td>
              <td>{getal((k.motie?.mede ?? 0) + (k.amendement?.mede ?? 0))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

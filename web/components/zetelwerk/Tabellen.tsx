// Tabellen voor zetelwerk (component zetelwerk): per fractie en per Kamerlid ingediend, aangenomen, brede steun
// en mede ingediend. Moties en amendementen apart. Onder 10 ingediende stukken geen percentage.
import Link from "next/link";
import { getal } from "@/lib/cohesie";
import { schaalkleur } from "@/lib/kleur";
import { type FractieWerk, type Kamerlid, type Plek, type Stuk, aandeel, meervoudVan } from "@/lib/zetelwerk";
import s from "./zetelwerk.module.css";

function Aangenomen({ aangenomen, ingediend }: { aangenomen: number; ingediend: number }) {
  const p = aandeel(aangenomen, ingediend);
  // Vaste kolommen (aantal, procent, balkje), zodat de getallen onder elkaar staan (feedback Niels K5)
  return (
    <span className={s.aangenomenCel}>
      <span>{getal(aangenomen)}</span>
      <span className={s.zacht}>{p != null ? `${p}%` : ""}</span>
      <span className={s.balkje} aria-hidden="true">{p != null && <span style={{ width: `${p}%`, background: schaalkleur(p) }} />}</span>
    </span>
  );
}

export function FractieTabel({ rijen, hrefVoor, actief, stuk }: { rijen: FractieWerk[]; hrefVoor: (afk: string) => string; actief: string | null; stuk: Stuk }) {
  return (
    <div className={s.tabelKader}>
      <table className={s.tabel}>
        <caption className="verborgen">{meervoudVan(stuk)} per fractie: ingediend, aangenomen, brede steun en mede ingediend</caption>
        <thead>
          <tr><th scope="col">Fractie</th><th scope="col" className={s.rolKolom}>Rol</th><th scope="col">Ingediend</th><th scope="col">Aangenomen</th><th scope="col">Brede steun</th><th scope="col">Mede ingediend</th></tr>
        </thead>
        <tbody>
          {rijen.map((r) => (
            <tr key={r.fractie} data-actief={actief === r.afkorting}>
              <td><Link href={hrefVoor(r.afkorting)} scroll={false}>{r.afkorting}</Link></td>
              <td data-label="Rol" className={s.rolKolom}><span className={s.rol} data-rol={r.rol}>{r.rol}</span></td>
              <td data-label="Ingediend">{getal(r.ingediend)}</td>
              <td data-label="Aangenomen"><Aangenomen aangenomen={r.aangenomen} ingediend={r.ingediend} /></td>
              <td data-label="Brede steun">{getal(r.brede_steun)}</td>
              <td data-label="Mede ingediend">{getal(r.mede)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function KamerledenTabel({ leden, hrefVoor, actief, rolVan }: { leden: Kamerlid[]; hrefVoor: (persoon: string) => string; actief: string | null; rolVan: (fractie: string | null) => string | undefined }) {
  return (
    <div className={s.tabelKader}>
      <table className={s.tabel}>
        <caption className="verborgen">Kamerleden: moties, amendementen en initiatiefwetten ingediend en aangenomen</caption>
        <thead>
          <tr>
            <th scope="col">Kamerlid</th><th scope="col" className={s.rolKolom}>Fractie</th><th scope="col">Moties</th><th scope="col">Aangenomen</th><th scope="col">Brede steun</th>
            <th scope="col">Amendementen</th><th scope="col">Aangenomen</th><th scope="col">Initiatiefwetten</th><th scope="col">Mede</th>
          </tr>
        </thead>
        <tbody>
          {leden.map((k) => (
            <tr key={k.persoon} data-actief={actief === k.persoon}>
              <td><Link href={hrefVoor(k.persoon)} scroll={false}>{k.naam}</Link></td>
              <td data-label="Fractie" className={s.rolKolom}>{k.fractie} {rolVan(k.fractie) && <span className={s.rol} data-rol={rolVan(k.fractie)}>{rolVan(k.fractie)}</span>}</td>
              <td data-label="Moties">{getal(k.motie?.ingediend ?? 0)}</td>
              <td data-label="Moties aangenomen">
                <Aangenomen aangenomen={k.motie?.aangenomen ?? 0} ingediend={k.motie?.ingediend ?? 0} />
              </td>
              <td data-label="Brede steun">{getal(k.motie?.brede_steun ?? 0)}</td>
              <td data-label="Amendementen">{getal(k.amendement?.ingediend ?? 0)}</td>
              <td data-label="Amendementen aangenomen">
                <Aangenomen aangenomen={k.amendement?.aangenomen ?? 0} ingediend={k.amendement?.ingediend ?? 0} />
              </td>
              <td data-label="Initiatiefwetten">{k.wetsvoorstel ? `${getal(k.wetsvoorstel.aangenomen)} van ${getal(k.wetsvoorstel.ingediend)}` : "0"}</td>
              <td data-label="Mede ingediend">{getal((k.motie?.mede ?? 0) + (k.amendement?.mede ?? 0) + (k.wetsvoorstel?.mede ?? 0))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Ranglijst over de hele Kamer per rol (B2): op aandeel aangenomen, vanaf 10 ingediende stukken
export function RanglijstTabel({ plekken, hrefVoor, meervoud }: { plekken: Plek[]; hrefVoor: (persoon: string) => string; meervoud: string }) {
  return (
    <div className={s.tabelKader}>
      <table className={s.tabel}>
        <caption className="verborgen">Kamerleden op aandeel aangenomen {meervoud}</caption>
        <thead>
          <tr><th scope="col">#</th><th scope="col" className={s.rolKolom}>Kamerlid</th><th scope="col" className={s.rolKolom}>Fractie</th><th scope="col">Ingediend</th><th scope="col">Aangenomen</th></tr>
        </thead>
        <tbody>
          {plekken.map((p, i) => (
            <tr key={p.persoon}>
              <td>{i + 1}</td>
              <td className={s.rolKolom}><Link href={hrefVoor(p.persoon)} scroll={false}>{p.naam}</Link></td>
              <td data-label="Fractie" className={s.rolKolom}>{p.fractie}</td>
              <td data-label="Ingediend">{getal(p.ingediend)}</td>
              <td data-label="Aangenomen"><Aangenomen aangenomen={p.aangenomen} ingediend={p.ingediend} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

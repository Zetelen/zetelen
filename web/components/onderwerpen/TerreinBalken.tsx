// Cohesie van een paar fracties per beleidsterrein (component onderwerpen): een balk per terrein in de
// kleur van de schaal, met de cohesie over alle stemmingen als verticale lijn ter vergelijking.
// Met hrefVoor is elk terrein een link die de verdieping (dossiers in dat terrein) direct onder de balk
// uitklapt; het actieve terrein klapt met sluitHref weer dicht (verzoek Niels, 26 oktober 2026).
import Link from "next/link";
import type { ReactNode } from "react";
import { getal, procent } from "@/lib/cohesie";
import { schaalkleur } from "@/lib/kleur";
import { MINIMUM_UITERSTEN, type TerreinPaar } from "@/lib/onderwerpen";
import s from "./onderwerpen.module.css";

type Props = {
  lijst: TerreinPaar[]; totaal?: number | null; label: string; hrefVoor?: (terrein: string) => string; actief?: string | null;
  sluitHref?: string; uitklap?: ReactNode;
};

export const terreinAnker = (terrein: string) => `terrein-${terrein.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export function TerreinBalken({ lijst, totaal, label, hrefVoor, actief, sluitHref, uitklap }: Props) {
  return (
    <ol className={s.balken} aria-label={label}>
      {lijst.map((p) => {
        const geldig = !p.teWeinig && p.cohesie != null;
        const klein = geldig && p.gezamenlijk < MINIMUM_UITERSTEN;
        const open = actief === p.terrein;
        const inhoud = (
          <>
            <span className={s.terrein}>
              {p.terrein}
              <span className={s.aantal}>{getal(p.gezamenlijk)} {p.gezamenlijk === 1 ? "stemming" : "stemmingen"} samen{klein ? ", weinig" : ""}</span>
            </span>
            <span className={s.baan} aria-hidden="true">
              {geldig ? <span style={{ width: `${p.cohesie}%`, background: schaalkleur(p.cohesie!) }} /> : <span className={s.teWeinig} />}
              {totaal != null && <span className={s.referentie} style={{ left: `${totaal}%` }} />}
            </span>
            <span className={s.waarde}>
              {geldig ? procent(p.cohesie) : "te weinig"}
              {hrefVoor && <span className={s.pijl} aria-hidden="true">{open ? "▾" : "▸"}</span>}
            </span>
          </>
        );
        return (
          <li key={p.terrein} id={terreinAnker(p.terrein)} className={s.terreinItem}>
            {hrefVoor ? (
              <Link href={open && sluitHref ? sluitHref : hrefVoor(p.terrein)} className={s.balkRij} data-actief={open} data-klein={klein} scroll={false}
                aria-expanded={open}>
                {inhoud}
              </Link>
            ) : (
              <div className={s.balkRij} data-klein={klein}>{inhoud}</div>
            )}
            {open && uitklap && <div className={s.uitklap}>{uitklap}</div>}
          </li>
        );
      })}
    </ol>
  );
}

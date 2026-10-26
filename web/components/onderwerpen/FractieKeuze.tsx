"use client";
// Keuze van een fractie en eventueel een tweede fractie om mee te vergelijken, als knoppen in plaats van
// uitklaplijsten (feedback Niels K1, 26 oktober 2026: intuïtiever). De keuze staat in de URL.
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/Typografie";
import s from "./onderwerpen.module.css";

export function FractieKeuze({ fracties, fractie, met }: { fracties: Array<{ afkorting: string; zetels: number }>; fractie: string; met: string | null }) {
  const router = useRouter();
  const zoek = useSearchParams();
  function ga(k: string, waarde: string) {
    const nieuw = new URLSearchParams(zoek.toString());
    if (waarde) nieuw.set(k, waarde);
    else nieuw.delete(k);
    if (k === "fractie" && nieuw.get("met") === waarde) nieuw.delete("met");
    nieuw.delete("terrein");
    nieuw.delete("dossier");
    router.push(`/onderwerpen?${nieuw.toString()}#zelf`, { scroll: false });
  }
  return (
    <div className={s.fractieKeuze}>
      <div role="group" aria-label="Fractie">
        <Label>1 · Fractie</Label>
        <div className={s.chips}>
          {fracties.map((f) => (
            <button key={f.afkorting} type="button" className={s.chip} aria-pressed={f.afkorting === fractie} onClick={() => ga("fractie", f.afkorting)}>
              {f.afkorting} <span className={s.zetels}>{f.zetels}</span>
            </button>
          ))}
        </div>
      </div>
      <div role="group" aria-label="Vergelijk met">
        <Label>2 · Vergelijk met</Label>
        <div className={s.chips}>
          <button type="button" className={s.chip} aria-pressed={!met} onClick={() => ga("met", "")}>alle fracties</button>
          {fracties.filter((f) => f.afkorting !== fractie).map((f) => (
            <button key={f.afkorting} type="button" className={s.chip} aria-pressed={f.afkorting === met} onClick={() => ga("met", f.afkorting)}>
              {f.afkorting}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

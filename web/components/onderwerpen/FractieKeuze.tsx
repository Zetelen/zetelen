"use client";
// Keuze van een fractie en eventueel een tweede fractie om mee te vergelijken; in de URL
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/Typografie";
import s from "./onderwerpen.module.css";
import v from "@/components/cohesie/verkenner.module.css";

export function FractieKeuze({ fracties, fractie, met }: { fracties: Array<{ afkorting: string; zetels: number }>; fractie: string; met: string | null }) {
  const router = useRouter();
  const zoek = useSearchParams();
  function ga(k: string, waarde: string) {
    const nieuw = new URLSearchParams(zoek.toString());
    if (waarde) nieuw.set(k, waarde);
    else nieuw.delete(k);
    if (k === "fractie" && nieuw.get("met") === waarde) nieuw.delete("met");
    router.push(`/onderwerpen?${nieuw.toString()}`, { scroll: false });
  }
  return (
    <div className={s.keuze}>
      <label>
        <Label>Fractie</Label>
        <select className={v.select} value={fractie} onChange={(e) => ga("fractie", e.target.value)}>
          {fracties.map((f) => <option key={f.afkorting} value={f.afkorting}>{f.afkorting} ({f.zetels})</option>)}
        </select>
      </label>
      <label>
        <Label>Vergelijk met</Label>
        <select className={v.select} value={met ?? ""} onChange={(e) => ga("met", e.target.value)}>
          <option value="">alle fracties</option>
          {fracties.filter((f) => f.afkorting !== fractie).map((f) => <option key={f.afkorting} value={f.afkorting}>{f.afkorting}</option>)}
        </select>
      </label>
    </div>
  );
}

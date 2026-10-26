"use client";
// Keuze van een fractie en eventueel een tweede fractie om mee te vergelijken. Sinds 26 oktober 2026 (feedback Niels
// K1, tweede ronde) twee keuzemenu's naast elkaar, op één regel met het kabinet; eerder knoppen. De keuze staat in de URL.
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/Typografie";
import v from "@/components/cohesie/verkenner.module.css";

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
    <>
      <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Label>1 · Fractie</Label>
        <select value={fractie} onChange={(e) => ga("fractie", e.target.value)} className={v.select}>
          {fracties.map((f) => <option key={f.afkorting} value={f.afkorting}>{f.afkorting} ({f.zetels} zetels)</option>)}
        </select>
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Label>2 · Vergelijk met</Label>
        <select value={met ?? ""} onChange={(e) => ga("met", e.target.value)} className={v.select}>
          <option value="">alle fracties</option>
          {fracties.filter((f) => f.afkorting !== fractie).map((f) => <option key={f.afkorting} value={f.afkorting}>{f.afkorting}</option>)}
        </select>
      </label>
    </>
  );
}

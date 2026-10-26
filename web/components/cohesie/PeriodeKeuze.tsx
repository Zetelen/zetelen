"use client";
// Keuze van periodesoort, periode en variant; alles in de URL, zodat een weergave deelbaar is. Met deel kan een
// pagina de periode (keuzemenu) en de filters (knoppen) op verschillende plekken zetten (feedback Niels K1, 26 oktober)
import { useRouter, useSearchParams } from "next/navigation";
import type { Periode, Periodesoort, Variant } from "@/lib/cohesie";
import { PERIODESOORTEN, VARIANTEN } from "@/lib/cohesie";
import { Data, Label } from "@/components/Typografie";
import s from "./verkenner.module.css";

export function PeriodeKeuze({
  perioden,
  soort,
  periode,
  variant,
  pad = "/verkenner",
  deel = "alles",
}: {
  perioden: Periode[];
  soort: Periodesoort;
  periode: string | null;
  variant?: Variant;
  pad?: string;
  deel?: "alles" | "periode" | "filters";
}) {
  const router = useRouter();
  const zoek = useSearchParams();
  function ga(wijziging: Record<string, string | null>) {
    const nieuw = new URLSearchParams(zoek.toString());
    for (const [k, v] of Object.entries(wijziging)) {
      if (v == null) nieuw.delete(k);
      else nieuw.set(k, v);
    }
    router.push(`${pad}?${nieuw.toString()}`, { scroll: false });
  }
  const binnenSoort = perioden.filter((p) => p.soort === soort);
  const filters = deel !== "periode", keuzemenu = deel !== "filters";
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: deel === "filters" ? "var(--r-4)" : "var(--r-5)", alignItems: "flex-end" }}>
      {filters && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Label>Periodesoort</Label>
        <div className={s.segment} role="group" aria-label="Periodesoort">
          {PERIODESOORTEN.map((p) => (
            <button key={p.waarde} type="button" aria-pressed={p.waarde === soort} onClick={() => ga({ soort: p.waarde, periode: null })}>
              {p.tekst}
            </button>
          ))}
        </div>
      </div>}
      {keuzemenu && <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Label>{soort === "kabinet" ? "Kabinet" : "Kamerperiode"}</Label>
        <select value={periode ?? ""} onChange={(e) => ga({ periode: e.target.value })} className={s.select}>
          {binnenSoort.map((p) => (
            <option key={p.naam} value={p.naam}>
              {p.naam} ({p.begin.slice(0, 4)}{p.einde ? `–${p.einde.slice(0, 4)}` : "–nu"})
            </option>
          ))}
        </select>
      </label>}
      {filters && variant && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Label>Stemmingen</Label>
          <div className={s.segment} role="group" aria-label="Stemmingen">
            {VARIANTEN.map((v) => (
              <button key={v.waarde} type="button" aria-pressed={v.waarde === variant} onClick={() => ga({ variant: v.waarde })}>
                {v.tekst}
              </button>
            ))}
          </div>
        </div>
      )}
      {deel === "alles" && <Data>Een kabinet loopt tot het volgende is beëdigd. De demissionaire tijd telt dus mee.</Data>}
    </div>
  );
}

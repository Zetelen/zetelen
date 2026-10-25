"use client";
// Keuze van periodesoort, periode en variant; alles in de URL, zodat een weergave deelbaar is
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
}: {
  perioden: Periode[];
  soort: Periodesoort;
  periode: string | null;
  variant?: Variant;
  pad?: string;
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
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--r-5)", alignItems: "flex-end" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Label>Periodesoort</Label>
        <div className={s.segment} role="group" aria-label="Periodesoort">
          {PERIODESOORTEN.map((p) => (
            <button key={p.waarde} type="button" aria-pressed={p.waarde === soort} onClick={() => ga({ soort: p.waarde, periode: null })}>
              {p.tekst}
            </button>
          ))}
        </div>
      </div>
      <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Label>{soort === "kabinet" ? "Kabinet" : "Kamerperiode"}</Label>
        <select value={periode ?? ""} onChange={(e) => ga({ periode: e.target.value })} className={s.select}>
          {binnenSoort.map((p) => (
            <option key={p.naam} value={p.naam}>
              {p.naam} ({p.begin.slice(0, 4)}{p.einde ? `–${p.einde.slice(0, 4)}` : "–nu"})
            </option>
          ))}
        </select>
      </label>
      {variant && (
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
      <Data>Een kabinet loopt tot het volgende is beëdigd. De demissionaire tijd telt dus mee.</Data>
    </div>
  );
}

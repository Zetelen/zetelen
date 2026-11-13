"use client";
// De gekozen groep in de vaste balk op de telefoon. De coalitiebouwer zet de keuze in de adresbalk zonder te navigeren
// (K18 punt 3a), dus de server rendert deze regel niet opnieuw; dit leest de adresbalk zelf.
import { useSearchParams } from "next/navigation";

export function GroepSamenvatting() {
  const groep = (useSearchParams().get("groep") ?? "").split(",").filter(Boolean);
  return groep.length ? <> · <strong>{groep.join(" + ")}</strong></> : null;
}

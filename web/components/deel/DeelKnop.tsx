"use client";
// Knop "Deel" bij een grafiek (verzoek Niels, 28 oktober 2026). Deelt de deellink van de grafiek (lib/deel.ts) met de
// keuzes die nu in de adresbalk staan, of met vaste keuzes (zoek) waar die niet in de adresbalk staan, zoals de uitslag van
// Stemgenoten. Op een telefoon het deelmenu van het toestel, anders de link naar het klembord.
import { useState } from "react";
import { BRON, type Grafiek, deellinkVan, titelVan } from "../../lib/deel";
import s from "./deel.module.css";

export function DeelKnop({ grafiek, zoek: vast, tekst = "Deel ↗", titel: vasteTitel }: { grafiek: Grafiek; zoek?: Record<string, string>; tekst?: string; titel?: string }) {
  const [melding, setMelding] = useState<string | null>(null);
  const deel = async () => {
    const zoek = vast ?? new URLSearchParams(window.location.search);
    const url = new URL(deellinkVan(grafiek, zoek), window.location.origin).toString();
    const titel = vasteTitel ?? titelVan(grafiek, zoek);
    if (navigator.share) {
      // Annuleren geeft een fout; dat is geen probleem
      try { await navigator.share({ title: titel, text: `${titel} ${BRON}`, url }); } catch { /* geannuleerd */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setMelding("Link gekopieerd");
    } catch {
      setMelding(url);
    }
    setTimeout(() => setMelding(null), 4000);
  };
  return (
    <span className={s.deel}>
      <button type="button" className={s.knop} onClick={deel} aria-label="Deel deze grafiek">{tekst}</button>
      <span role="status" className={s.melding}>{melding}</span>
    </span>
  );
}

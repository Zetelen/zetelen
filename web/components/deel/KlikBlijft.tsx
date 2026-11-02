"use client";
// De tweede helft van de klikteller (lib/klik.ts): landt een bezoeker uit een post op een pagina (?via= in het adres),
// dan haalt dit de via-code uit het adres en meldt een keer "blijft" zodra de bezoeker iets aanklikt of 30 seconden
// op de pagina is. Niets in de browser opgeslagen; wie de pagina later opnieuw opent, telt niet opnieuw.
import { useEffect } from "react";
import { meld, schoneVia } from "@/lib/klik";

// Een keer per paginabezoek gelezen: React kan het effect twee keer draaien, en na de eerste keer staat de code al
// niet meer in het adres
let gelezen = false;
let wachtend: string | null = null;
let gemeld = false;

export function KlikBlijft() {
  useEffect(() => {
    if (!gelezen) {
      gelezen = true;
      const adres = new URL(window.location.href);
      if (adres.searchParams.has("via")) {
        wachtend = schoneVia(adres.searchParams.get("via"));
        // De code uit het adres, zodat een bladwijzer of een doorgestuurde link hem niet meeneemt
        adres.searchParams.delete("via");
        window.history.replaceState(window.history.state, "", adres.pathname + adres.search + adres.hash);
      }
    }
    const via = wachtend;
    if (!via || gemeld) return;
    const eenmaal = () => {
      if (gemeld) return;
      gemeld = true;
      meld("blijft", via);
      opruimen();
    };
    const bijKlik = (e: MouseEvent) => { if ((e.target as Element | null)?.closest("a, button, summary, [role=tab]")) eenmaal(); };
    const klok = window.setTimeout(() => { if (document.visibilityState === "visible") eenmaal(); }, 30_000);
    const opruimen = () => { window.clearTimeout(klok); document.removeEventListener("click", bijKlik, true); };
    document.addEventListener("click", bijKlik, true);
    return opruimen;
  }, []);
  return null;
}

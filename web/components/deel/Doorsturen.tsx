"use client";
// Stuurt een bezoeker van een deellink direct door naar de grafiek. Zonder JavaScript (zoals de voorbeeldlezers van
// WhatsApp en LinkedIn) blijft de tussenpagina staan, met het plaatje en een link. Komt de bezoeker uit een post
// (?via=, lib/klik.ts), dan wordt de klik eerst gemeld; voorbeeldlezers draaien geen JavaScript en tellen dus niet mee.
import { useEffect } from "react";
import { meld } from "@/lib/klik";

// Een melding per paginabezoek, ook als React het effect twee keer draait
let gemeld = false;

export function Doorsturen({ naar, via, grafiek }: { naar: string; via?: string | null; grafiek?: string }) {
  useEffect(() => {
    if (via && !gemeld) { gemeld = true; meld("klik", via, grafiek); }
    window.location.replace(naar);
  }, [naar, via, grafiek]);
  return null;
}

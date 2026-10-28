"use client";
// Stuurt een bezoeker van een deellink direct door naar de grafiek. Zonder JavaScript (zoals de voorbeeldlezers van
// WhatsApp en LinkedIn) blijft de tussenpagina staan, met het plaatje en een link.
import { useEffect } from "react";

export function Doorsturen({ naar }: { naar: string }) {
  useEffect(() => { window.location.replace(naar); }, [naar]);
  return null;
}

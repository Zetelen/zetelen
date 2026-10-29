// Scrollverhaal: de server pakt de stippen in (lib/verhaalPak.ts) en geeft ze aan het verhaal in de browser
// (ScrollVerhaalKlant.tsx). Zo blijft de pagina klein; de pagina's geven gewoon een Verhaal mee.
import type { Verhaal } from "@/lib/verhaal";
import { pakVerhaal } from "@/lib/verhaalPak";
import { type Props, ScrollVerhaalKlant } from "./ScrollVerhaalKlant";

export function ScrollVerhaal({ verhaal, ...rest }: Omit<Props, "gepakt"> & { verhaal: Verhaal }) {
  return <ScrollVerhaalKlant gepakt={pakVerhaal(verhaal)} {...rest} />;
}

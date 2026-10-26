// Uitgelicht (besluit Niels B16, 26 oktober 2026). Sinds de kiezer bovenaan elke stemming (feedback Niels K7,
// 26 oktober 2026) opent /uitgelicht meteen de nieuwste stemming; de inleiding staat daar inklapbaar. Tijdelijke
// omleiding, want de nieuwste verandert als er een stemming bijkomt.
import { redirect } from "next/navigation";
import { UITGELICHT } from "@/lib/uitgelichtLijst";

export default function Uitgelicht() {
  const nieuwste = [...UITGELICHT].sort((a, b) => b.datums[0].localeCompare(a.datums[0]))[0];
  redirect(`/uitgelicht/${nieuwste.slug}`);
}

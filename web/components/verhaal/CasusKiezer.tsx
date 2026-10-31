"use client";
// Kiezer bovenaan elke uitgelichte stemming (feedback Niels K7, 26 oktober 2026): één stemming tegelijk, en een
// andere kiezen zonder terug naar een lijst. Elke stemming houdt een eigen adres, om te delen en te vinden.
// Sinds 31 oktober 2026 met een korte inleiding erboven en een lijn eronder (feedback Niels: de keuzelijst alleen
// was niet duidelijk); het stuk zelf begint pas onder de lijn.
import { useRouter } from "next/navigation";
import { Label, Tekst } from "@/components/Typografie";
import v from "@/components/cohesie/verkenner.module.css";
import s from "./uitgelicht.module.css";

export function CasusKiezer({ casussen, gekozen }: { casussen: Array<{ slug: string; titel: string; jaar: string }>; gekozen: string }) {
  const router = useRouter();
  return (
    <div className={s.inleiding}>
      <Label>Uitgelicht</Label>
      <Tekst>
        Een stemming of een vraag over de Kamer van dichtbij, stap voor stap. Scrol door het verhaal, of kies hieronder een
        ander stuk.
      </Tekst>
      <label style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 560 }}>
        <Label>Bekijk een ander stuk ({casussen.length})</Label>
        <select className={v.select} value={gekozen} onChange={(e) => router.push(`/uitgelicht/${e.target.value}`)}>
          {casussen.map((c) => <option key={c.slug} value={c.slug}>{c.jaar} · {c.titel}</option>)}
        </select>
      </label>
    </div>
  );
}

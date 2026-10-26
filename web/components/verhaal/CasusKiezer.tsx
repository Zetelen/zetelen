"use client";
// Kiezer bovenaan elke uitgelichte stemming (feedback Niels K7, 26 oktober 2026): één stemming tegelijk, en een
// andere kiezen zonder terug naar een lijst. Elke stemming houdt een eigen adres, om te delen en te vinden.
import { useRouter } from "next/navigation";
import { Label } from "@/components/Typografie";
import v from "@/components/cohesie/verkenner.module.css";

export function CasusKiezer({ casussen, gekozen }: { casussen: Array<{ slug: string; titel: string; jaar: string }>; gekozen: string }) {
  const router = useRouter();
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 560 }}>
      <Label>Kies een stemming</Label>
      <select className={v.select} value={gekozen} onChange={(e) => router.push(`/uitgelicht/${e.target.value}`)}>
        {casussen.map((c) => <option key={c.slug} value={c.slug}>{c.jaar} · {c.titel}</option>)}
      </select>
    </label>
  );
}

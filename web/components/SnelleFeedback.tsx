"use client";
// Snelle vraag onderaan elke pagina (verzoek Niels, 28 oktober 2026): "Was deze pagina duidelijk?" met drie knoppen en
// een optionele toelichting. Lagere drempel dan het volledige formulier op /feedback, en per pagina. Stuurt via
// app/api/feedback met soort "snel"; geen e-mailadres, geen IP-adres. Niet op het formulier zelf.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SNEL_OPTIES } from "@/lib/feedback";
import { FEEDBACK } from "@/lib/site";
import s from "./feedback.module.css";

type Staat = "kies" | "toelichten" | "bezig" | "klaar" | "fout";

export function SnelleFeedback() {
  const pad = usePathname();
  const [staat, setStaat] = useState<Staat>("kies");
  const [keuze, setKeuze] = useState<(typeof SNEL_OPTIES)[number] | null>(null);
  const [tekst, setTekst] = useState("");
  // Een andere pagina begint opnieuw
  useEffect(() => { setStaat("kies"); setKeuze(null); setTekst(""); }, [pad]);
  if (!FEEDBACK || pad.startsWith("/feedback")) return null;

  const verstuur = async () => {
    setStaat("bezig");
    try {
      const r = await fetch("/api/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soort: "snel", pad, antwoorden: { duidelijk: keuze, onduidelijk: tekst } }),
      });
      setStaat(r.ok ? "klaar" : "fout");
    } catch {
      setStaat("fout");
    }
  };

  return (
    <section id="snelle-feedback" className={s.snel} aria-label="Snelle feedback over deze pagina" style={{ scrollMarginTop: 80 }}>
      {staat === "klaar" ? (
        <p className={s.snelVraag}>Dank je. <Link href="/feedback">Meer kwijt? Het hele formulier, 3 minuten.</Link></p>
      ) : (
        <>
          <p className={s.snelVraag}>Was deze pagina duidelijk?</p>
          <div className={s.snelKnoppen} role="group" aria-label="Was deze pagina duidelijk?">
            {SNEL_OPTIES.map((o) => (
              <button key={o} type="button" aria-pressed={keuze === o} className={s.snelKnop}
                onClick={() => { setKeuze(o); setStaat("toelichten"); }}>
                {o[0].toUpperCase() + o.slice(1)}
              </button>
            ))}
          </div>
          {keuze && (
            <div className={s.snelToelichting}>
              <label htmlFor="snel-tekst" className={s.snelLabel}>
                {keuze === "ja" ? "Wat kan nog beter? (mag leeg)" : "Wat was onduidelijk? (mag leeg)"}
              </label>
              <textarea id="snel-tekst" rows={2} maxLength={2000} value={tekst} onChange={(e) => setTekst(e.target.value)} className={s.invoer} />
              <div className={s.snelOnder}>
                <button type="button" className={s.snelVerstuur} onClick={verstuur} disabled={staat === "bezig"}>
                  {staat === "bezig" ? "Versturen…" : "Verstuur"}
                </button>
                <p role="status" className={s.melding}>{staat === "fout" ? "Versturen lukte niet. Probeer het later nog eens." : ""}</p>
              </div>
            </div>
          )}
          {!keuze && <p className={s.snelKlein}><Link href="/feedback">Meer kwijt? Het hele formulier, 3 minuten.</Link></p>}
        </>
      )}
    </section>
  );
}

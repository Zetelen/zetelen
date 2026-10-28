"use client";
// Feedbackformulier (besluit Niels B13, 26 oktober 2026). Stuurt naar app/api/feedback; geen cookies, geen naam.
// Alle vragen zijn vrijwillig; minstens één antwoord is nodig.
import { useState } from "react";
import { VRAGEN } from "@/lib/feedback";
import { knopKlasse } from "./Kader";
import s from "./feedback.module.css";

type Staat = "invullen" | "bezig" | "klaar" | "fout" | "leeg" | "druk";

export function FeedbackFormulier() {
  const [staat, setStaat] = useState<Staat>("invullen");

  async function verstuur(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const gegevens = new FormData(e.currentTarget);
    const antwoorden = Object.fromEntries(VRAGEN.map((v) => [v.id, String(gegevens.get(v.id) ?? "")]));
    setStaat("bezig");
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ antwoorden, website: gegevens.get("website") ?? "" }),
      });
      setStaat(r.ok ? "klaar" : r.status === 429 ? "druk" : r.status === 400 ? "leeg" : "fout");
    } catch {
      setStaat("fout");
    }
  }

  if (staat === "klaar") {
    return <p className={s.klaar} role="status">Dank je wel. Je antwoorden zijn binnen.</p>;
  }

  return (
    <form className={s.formulier} onSubmit={verstuur} noValidate>
      {VRAGEN.map((v, i) => (
        <fieldset key={v.id} className={s.vraag}>
          <legend>
            <span className={s.nummer}>{i + 1}</span> {v.vraag}
          </legend>
          {v.hulp && <p className={s.hulp} id={`hulp-${v.id}`}>{v.hulp}</p>}
          {v.soort === "tekst" && (
            v.id === "mail"
              ? <input type="email" name={v.id} autoComplete="email" aria-describedby={v.hulp ? `hulp-${v.id}` : undefined} className={s.invoer} />
              : <textarea name={v.id} rows={3} maxLength={2000} className={s.invoer} />
          )}
          {v.soort === "keuze" && (
            <div className={s.keuzes}>
              {v.opties!.map((o) => (
                <label key={o} className={s.keuze}><input type="radio" name={v.id} value={o} /> {o}</label>
              ))}
            </div>
          )}
          {v.soort === "schaal" && (
            <div className={s.schaal}>
              {v.uitersten && <span className={s.uiterste} aria-hidden="true">1 = {v.uitersten[0]}</span>}
              <div className={s.keuzes}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <label key={n} className={s.keuze}>
                    <input type="radio" name={v.id} value={n} /> {n}
                    {v.uitersten && (n === 1 || n === 5) && <span className="verborgen"> ({v.uitersten[n === 1 ? 0 : 1]})</span>}
                  </label>
                ))}
              </div>
              {v.uitersten && <span className={s.uiterste} aria-hidden="true">5 = {v.uitersten[1]}</span>}
            </div>
          )}
        </fieldset>
      ))}
      {/* Valkuil voor spambots: verborgen voor mensen en schermlezers */}
      <div className={s.valkuil} aria-hidden="true">
        <label>Website <input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className={s.versturen}>
        <button type="submit" className={knopKlasse} disabled={staat === "bezig"}>{staat === "bezig" ? "Versturen…" : "Verstuur"}</button>
        <p role="status" className={s.melding}>
          {staat === "leeg" && "Vul minstens één vraag in."}
          {staat === "druk" && "Het is even te druk. Probeer het over een paar minuten nog eens."}
          {staat === "fout" && "Versturen lukte niet. Probeer het later nog eens, of mail."}
        </p>
      </div>
    </form>
  );
}

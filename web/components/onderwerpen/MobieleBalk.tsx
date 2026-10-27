"use client";
// Telefoon (component onderwerpen): een vaste balk bovenaan met de gekozen fractie groot, daaronder de vraag,
// periode en stemmingen, en "wijzig". Wijzig opent een paneel dat van onderen omhoog schuift, met periodesoort,
// periode, stemmingen en fractie. Vergelijken gebeurt door in de inhoud op een fractie te tikken.
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Periode, Periodesoort, Variant } from "@/lib/cohesie";
import { PeriodeKeuze } from "@/components/cohesie/PeriodeKeuze";
import { Label } from "@/components/Typografie";
import s from "./onderwerpen.module.css";
import v from "@/components/cohesie/verkenner.module.css";

type Props = {
  perioden: Periode[]; soort: Periodesoort; periode: string; variant: Variant;
  fracties: Array<{ afkorting: string; zetels: number }>; fractie: string; met: string | null;
};

export function MobieleBalk({ perioden, soort, periode, variant, fracties, fractie, met }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const zoek = useSearchParams();
  useEffect(() => {
    if (!open) return;
    const sluit = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", sluit);
    return () => removeEventListener("keydown", sluit);
  }, [open]);
  function kiesFractie(waarde: string) {
    const nieuw = new URLSearchParams(zoek.toString());
    nieuw.set("fractie", waarde);
    for (const k of ["met", "terrein", "dossier"]) nieuw.delete(k);
    router.push(`/onderwerpen?${nieuw.toString()}`, { scroll: false });
  }
  return (
    <>
      <div className={s.mobieleBalk}>
        {/* Twee regels: de fractie groot, daaronder de vraag en de keuze (feedback Niels K1, 27 oktober 2026) */}
        <span className={s.balkTekst}>
          <span className={s.balkFractie}>{fractie}{met ? ` en ${met}` : ""}</span>
          <span className={s.balkVraag}>
            {met ? "Op welke onderwerpen stemmen ze hetzelfde?" : `Met wie stemt ${fractie} het vaakst hetzelfde?`} · {periode},{" "}
            {variant === "alle" ? "alle stemmingen" : "verdeelde stemmingen"}
          </span>
        </span>
        <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="keuzepaneel">wijzig</button>
      </div>
      {open && <div className={s.sluier} onClick={() => setOpen(false)} aria-hidden="true" />}
      <div id="keuzepaneel" className={s.paneel} data-open={open} role="dialog" aria-modal="true" aria-label="Keuze wijzigen" hidden={!open}>
        <PeriodeKeuze perioden={perioden} soort={soort} periode={periode} variant={variant} pad="/onderwerpen" />
        <label className={s.paneelVeld}>
          <Label>Fractie</Label>
          <select className={v.select} value={fractie} onChange={(e) => kiesFractie(e.target.value)}>
            {fracties.map((f) => <option key={f.afkorting} value={f.afkorting}>{f.afkorting} ({f.zetels})</option>)}
          </select>
        </label>
        <button type="button" className={s.klaar} onClick={() => setOpen(false)}>Klaar</button>
      </div>
    </>
  );
}

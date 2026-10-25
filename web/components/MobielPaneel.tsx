"use client";
// Telefoon: een vaste balk bovenaan met de keuze in een regel en een knop "wijzig", die een paneel van
// onderen omhoog laat schuiven (patroon van /onderwerpen, verzoek Niels 25 oktober 2026). Alleen op smalle schermen.
import { type ReactNode, useEffect, useState } from "react";
import s from "./onderwerpen/onderwerpen.module.css";

export function MobielPaneel({ samenvatting, children }: { samenvatting: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const sluit = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", sluit);
    return () => removeEventListener("keydown", sluit);
  }, [open]);
  return (
    <>
      <div className={s.mobieleBalk}>
        <span>{samenvatting}</span>
        <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mobiel-paneel">wijzig</button>
      </div>
      {open && <div className={s.sluier} onClick={() => setOpen(false)} aria-hidden="true" />}
      <div id="mobiel-paneel" className={s.paneel} data-open={open} role="dialog" aria-modal="true" aria-label="Keuze wijzigen" hidden={!open}>
        {children}
        <button type="button" className={s.klaar} onClick={() => setOpen(false)}>Klaar</button>
      </div>
    </>
  );
}

"use client";
// Bladeren (verzoek Niels, 1 november 2026: de telefoon moet voelen als een app). Op de telefoon staan de delen naast
// elkaar en veeg of tik je naar het volgende, met streepjes en een teller die bovenin blijven staan. Op een groter
// scherm gewoon onder elkaar; dat regelt de CSS, dus de server-HTML is overal dezelfde.
import { Children, type ReactNode, useEffect, useRef, useState } from "react";
import s from "./bladeren.module.css";

export function Bladeren({ children, label }: { children: ReactNode; label: string }) {
  const delen = Children.toArray(children);
  const n = delen.length;
  const [actief, setActief] = useState(0);
  const baan = useRef<HTMLDivElement>(null);
  const buiten = useRef<HTMLDivElement>(null);

  // Het deel dat in beeld staat volgt uit hoe ver de baan opzij is geschoven
  useEffect(() => {
    const b = baan.current;
    if (!b) return;
    const kies = () => setActief(Math.round(b.scrollLeft / Math.max(1, b.clientWidth)));
    b.addEventListener("scroll", kies, { passive: true });
    return () => b.removeEventListener("scroll", kies);
  }, []);

  // De baan is zo hoog als het deel in beeld, zodat er onder een kort deel geen leeg vlak staat tot de pagina verdergaat
  useEffect(() => {
    const b = baan.current;
    if (!b) return;
    const m = matchMedia("(max-width: 760px)");
    const pas = () => {
      const blad = b.children[actief] as HTMLElement | undefined;
      b.style.height = m.matches && blad ? `${blad.offsetHeight}px` : "";
    };
    pas();
    const kijk = new ResizeObserver(pas);
    [...b.children].forEach((c) => kijk.observe(c));
    m.addEventListener("change", pas);
    return () => { kijk.disconnect(); m.removeEventListener("change", pas); };
  }, [actief]);

  const naar = (i: number) => {
    const b = baan.current;
    if (!b) return;
    const j = Math.max(0, Math.min(n - 1, i));
    b.scrollTo({ left: j * b.clientWidth, behavior: "smooth" });
    // Staat het begin van het nieuwe deel boven het scherm, dan terug naar boven
    const r = buiten.current?.getBoundingClientRect();
    if (r && r.top < 0) buiten.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  return (
    <div ref={buiten} className={s.bladeren} role="region" aria-roledescription="delen om door te bladeren" aria-label={label}>
      <div className={s.balk}>
        <div className={s.streepjes} aria-hidden="true">
          {delen.map((_, i) => <span key={i} data-af={i <= actief || undefined} />)}
        </div>
        <div className={s.knoppen}>
          <button type="button" className={s.knop} onClick={() => naar(actief - 1)} disabled={actief === 0} aria-label="Vorige deel">←</button>
          <span className={s.teller} aria-live="polite">{actief + 1} van {n}</span>
          <button type="button" className={s.knop} onClick={() => naar(actief + 1)} disabled={actief === n - 1} aria-label="Volgende deel">→</button>
        </div>
      </div>
      <div ref={baan} className={s.baan}>
        {delen.map((d, i) => <div key={i} className={s.blad}>{d}</div>)}
      </div>
    </div>
  );
}

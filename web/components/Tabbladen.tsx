"use client";
// Tabbladen (verzoek Niels, 1 november 2026: de telefoon moet voelen als een app). Op de telefoon staat een rij
// tabbladen bovenin en is steeds een deel van de pagina te zien; opzij vegen gaat naar het volgende. Op een groter
// scherm staat alles onder elkaar, zoals altijd. Alle inhoud staat in de HTML, ook wat op een ander tabblad zit.
// Een link naar een anker (#ranglijst) opent het tabblad waar dat anker in staat.
import { type ReactNode, type TouchEvent, useEffect, useId, useRef, useState } from "react";
import s from "./tabbladen.module.css";

export type Deel = { naam: string; inhoud: ReactNode };

// Delen zonder inhoud (bijvoorbeeld als de data niet laadt) vallen weg, zodat er geen leeg tabblad staat
export function Tabbladen({ delen: alle, label }: { delen: (Deel | null | false | undefined)[]; label: string }) {
  const delen = alle.filter((d): d is Deel => !!d);
  const [actief, setActief] = useState(0);
  const [richting, setRichting] = useState<"verder" | "terug">("verder");
  const id = useId();
  const buiten = useRef<HTMLDivElement>(null);
  const veeg = useRef({ x: 0, y: 0, mag: true });

  const kies = (i: number, naarBoven = true) => {
    const j = Math.max(0, Math.min(delen.length - 1, i));
    if (j === actief) return;
    setRichting(j > actief ? "verder" : "terug");
    setActief(j);
    // Het nieuwe tabblad begint bovenaan, onder de rij tabbladen
    const r = buiten.current?.getBoundingClientRect();
    if (naarBoven && r && r.top < 0) buiten.current?.scrollIntoView({ block: "start" });
  };

  // Anker in de adresbalk: open het tabblad waar het in staat. Ook na een klik op een link binnen de site, want
  // die verandert het adres zonder hashchange.
  useEffect(() => {
    // Alleen bij een nieuw adres, anders zet een klik op een tabblad je terug naar het tabblad van het oude anker
    let gezien = "";
    const zoek = () => {
      if (location.href === gezien) return;
      gezien = location.href;
      const h = decodeURIComponent(location.hash.slice(1));
      if (!h) return;
      const doel = document.getElementById(h);
      const panelen = [...(buiten.current?.querySelectorAll<HTMLElement>(":scope > [data-paneel]") ?? [])];
      const i = panelen.findIndex((p) => p.contains(doel));
      if (i >= 0) { setActief(i); requestAnimationFrame(() => doel?.scrollIntoView({ block: "start" })); }
    };
    const laterZoeken = () => { setTimeout(zoek, 150); setTimeout(zoek, 700); };
    zoek();
    addEventListener("hashchange", zoek);
    addEventListener("popstate", laterZoeken);
    document.addEventListener("click", laterZoeken);
    return () => { removeEventListener("hashchange", zoek); removeEventListener("popstate", laterZoeken); document.removeEventListener("click", laterZoeken); };
  }, []);

  // Vegen: naar links is het volgende tabblad, naar rechts het vorige. Niet als je in iets veegt dat zelf opzij
  // schuift, zoals een brede tabel.
  const begin = (e: TouchEvent) => {
    let el = e.target as HTMLElement | null, mag = true;
    while (el && el !== buiten.current) { if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== "visible") { mag = false; break; } el = el.parentElement; }
    veeg.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, mag };
  };
  const eind = (e: TouchEvent) => {
    if (!veeg.current.mag) return;
    const dx = e.changedTouches[0].clientX - veeg.current.x, dy = e.changedTouches[0].clientY - veeg.current.y;
    if (Math.abs(dx) > 70 && Math.abs(dx) > 2 * Math.abs(dy)) kies(actief + (dx < 0 ? 1 : -1));
  };

  return (
    <div ref={buiten} className={s.tabbladen}>
      <div className={s.rij} role="tablist" aria-label={label}>
        {delen.map(({ naam: n }, i) => (
          <button key={n} type="button" role="tab" id={`${id}-tab-${i}`} aria-controls={`${id}-paneel-${i}`} aria-selected={i === actief}
            className={s.tab} onClick={() => kies(i)}>{n}</button>
        ))}
      </div>
      {delen.map((d, i) => (
        <div key={i} data-paneel id={`${id}-paneel-${i}`} role="tabpanel" aria-labelledby={`${id}-tab-${i}`} className={s.paneel}
          data-actief={i === actief} data-richting={richting} onTouchStart={begin} onTouchEnd={eind}>
          {d.inhoud}
        </div>
      ))}
    </div>
  );
}

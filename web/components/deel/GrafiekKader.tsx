"use client";
// Omhulsel van een grafiek (verzoek Niels, 29 oktober 2026): rechtsboven altijd dezelfde knoppen, Vergroot en Deel, en
// een volledig-schermweergave. Vergroten zet hetzelfde blok over de hele pagina, zodat keuzes in de grafiek (een
// schuif, een gekozen fractie) blijven staan. Klik op de grafiek zelf vergroot ook, behalve op een knop of link.
// Sluiten met de knop, Escape of de terugknop van de browser. Scrollverhalen krijgen geen Vergroot (besluit Niels).
import { type CSSProperties, type MouseEvent, type ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { type Grafiek, URL_GEWIJZIGD } from "../../lib/deel";
import { DeelKnop } from "./DeelKnop";
import s from "./deel.module.css";

type Kader = { grafiek: Grafiek; zoek?: Record<string, string>; titel?: string; vergroot: boolean; vol: boolean; zet: (vol: boolean) => void };
const KaderContext = createContext<Kader | null>(null);

// Klikken hierop vergroot niet: dan wil de bezoeker iets kiezen of lezen
const NIET_VERGROTEN = "a, button, input, select, textarea, label, summary, details, [tabindex], [role=button], p, h1, h2, h3, [data-knoppen]";

export function GrafiekKader({ grafiek, zoek, titel, vergroot = true, id, className, style, children }: {
  grafiek: Grafiek; zoek?: Record<string, string>; titel?: string; vergroot?: boolean;
  id?: string; className?: string; style?: CSSProperties; children: ReactNode;
}) {
  const [vol, setVol] = useState(false);
  // Een keuze op volledig scherm (de periode van Door de jaren) zet de URL van die stap in de geschiedenis; bij sluiten
  // met de terugknop komt die URL mee terug, anders toont de grafiek iets anders dan de adresbalk (en de deellink)
  const nieuweUrl = useRef<string | null>(null);
  // Sluiten via de geschiedenis, zodat de terugknop van de telefoon ook sluit
  const zet = useCallback((open: boolean) => {
    if (open) {
      window.history.pushState({ zetelenVol: true }, "");
      setVol(true);
    } else if (window.history.state?.zetelenVol) window.history.back();
    else setVol(false);
  }, []);
  useEffect(() => {
    if (!vol) return;
    nieuweUrl.current = null;
    const url = () => { nieuweUrl.current = window.location.href; };
    const terug = () => {
      if (nieuweUrl.current) window.history.replaceState({}, "", nieuweUrl.current);
      setVol(false);
    };
    const toets = (e: KeyboardEvent) => { if (e.key === "Escape") zet(false); };
    const eerder = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("popstate", terug);
    window.addEventListener("keydown", toets);
    window.addEventListener(URL_GEWIJZIGD, url);
    return () => {
      document.body.style.overflow = eerder;
      window.removeEventListener("popstate", terug);
      window.removeEventListener("keydown", toets);
      window.removeEventListener(URL_GEWIJZIGD, url);
    };
  }, [vol, zet]);
  const klik = (e: MouseEvent) => {
    if (!vergroot || vol || window.getSelection()?.toString()) return;
    if ((e.target as Element).closest(NIET_VERGROTEN)) return;
    zet(true);
  };
  return (
    <KaderContext.Provider value={{ grafiek, zoek, titel, vergroot, vol, zet }}>
      {/* Het blok zelf is geen knop: de knop Vergroot rechtsboven is de toegankelijke weg, de klik is een extra */}
      <section id={id} style={style} onClick={klik} data-vol={vol || undefined} data-vergroot={(vergroot && !vol) || undefined}
        className={`${s.kader} ${className ?? ""}`} role={vol ? "dialog" : undefined} aria-modal={vol || undefined} aria-label={vol ? "Grafiek op volledig scherm" : undefined}>
        {children}
      </section>
    </KaderContext.Provider>
  );
}

// De kop van een grafiek met de knoppen ernaast; zonder kop alleen de knoppen, rechts uitgelijnd
export function GrafiekKop({ children }: { children?: ReactNode }) {
  return (
    <div className={s.kopRij}>
      {children && <div className={s.kopTekst}>{children}</div>}
      <GrafiekKnoppen />
    </div>
  );
}

export function GrafiekKnoppen() {
  const k = useContext(KaderContext);
  if (!k) return null;
  return (
    <div className={s.knoppen} data-knoppen>
      {k.vergroot && !k.vol && (
        <button type="button" className={s.knop} onClick={() => k.zet(true)} aria-label="Toon de grafiek op volledig scherm">⤢</button>
      )}
      <DeelKnop grafiek={k.grafiek} zoek={k.zoek} titel={k.titel} />
      {k.vol && <button type="button" className={s.knop} onClick={() => k.zet(false)} aria-label="Sluit volledig scherm">✕</button>}
    </div>
  );
}

"use client";
// Omhulsel van een grafiek (verzoek Niels, 29 oktober 2026): in de rechterbovenhoek van de grafiek zelf twee iconen,
// vergroten en delen (GrafiekVlak), en een volledig-schermweergave. Eerst stonden de knoppen naast de kop; op de
// telefoon werd dat een losse regel die nergens bij hoorde (Niels, 29 oktober 2026). Vergroten zet hetzelfde blok over de hele pagina, zodat keuzes in de grafiek (een
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
    const doel = e.target as Element;
    // Alleen een klik op de grafiek zelf, niet op de kop of de tekst eromheen
    if (doel.closest(NIET_VERGROTEN) || !doel.closest("[data-vlak], svg")) return;
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

// De grafiek zelf, met de iconen in de rechterbovenhoek; boven de grafiek blijft een smalle strook vrij, zodat de
// iconen niet over labels of waarden vallen
export function GrafiekVlak({ children }: { children: ReactNode }) {
  return (
    <div className={s.vlak} data-vlak>
      <GrafiekKnoppen />
      {children}
    </div>
  );
}

const Icoon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
export const VERGROOT = "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5";
const SLUIT = "M6 6l12 12M18 6L6 18";

// Ook los te gebruiken in een bestaande balk boven de grafiek (de verkenner: naast Zaal, Boog en Tabel)
export function GrafiekKnoppen({ inBalk = false }: { inBalk?: boolean }) {
  const k = useContext(KaderContext);
  if (!k) return null;
  return (
    <div className={inBalk ? `${s.knoppen} ${s.inBalk}` : s.knoppen} data-knoppen>
      {k.vergroot && !k.vol && (
        <button type="button" className={s.icoon} onClick={() => k.zet(true)} aria-label="Toon de grafiek op volledig scherm" title="Volledig scherm">
          <Icoon d={VERGROOT} />
        </button>
      )}
      <DeelKnop grafiek={k.grafiek} zoek={k.zoek} titel={k.titel} icoon />
      {k.vol && (
        <button type="button" className={s.icoon} onClick={() => k.zet(false)} aria-label="Sluit volledig scherm" title="Sluiten">
          <Icoon d={SLUIT} />
        </button>
      )}
    </div>
  );
}

"use client";
// Hoofdmenu; markeert de huidige pagina (aria-current). Op een smal scherm achter een menuknop
// (besluit Niels B8, 26 oktober 2026); het menu sluit vanzelf na het kiezen van een pagina.
// De kop blijft bovenaan staan (feedback Niels K1, 27 oktober 2026). Op een smal scherm verdwijnt hij bij omlaag
// scrollen en komt hij terug bij het kleinste stukje omhoog. De zichtbare hoogte staat in --kop-zicht, zodat
// andere vaste elementen (scroll graphics, de filterbalk van Onderwerpen) eronder schuiven.
// Sinds K11 (27 oktober 2026) in drie groepen met een regel uitleg per onderdeel (lib/menu.ts). Op een breed scherm
// klapt een groep open onder zijn knop; op een smal scherm staan alle groepen open onder de menuknop.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MENU, isHier } from "@/lib/menu";
import { Woordmerk } from "./Typografie";
import s from "./kader.module.css";

const SMAL = "(max-width: 760px)";
const DREMPEL = 6; // zoveel pixels scrollen voordat de kop verdwijnt of terugkomt

export function Navigatie() {
  const pad = usePathname();
  const [open, setOpen] = useState(false);
  const [groep, setGroep] = useState<string | null>(null);
  const [verborgen, setVerborgen] = useState(false);
  const kop = useRef<HTMLElement>(null);
  useEffect(() => {
    setOpen(false);
    setGroep(null);
  }, [pad]);

  // Een open groep sluit met Escape of met een klik buiten het menu
  useEffect(() => {
    if (!groep) return;
    const bijToets = (e: KeyboardEvent) => e.key === "Escape" && setGroep(null);
    const bijKlik = (e: MouseEvent) => !kop.current?.contains(e.target as Node) && setGroep(null);
    document.addEventListener("keydown", bijToets);
    document.addEventListener("mousedown", bijKlik);
    return () => {
      document.removeEventListener("keydown", bijToets);
      document.removeEventListener("mousedown", bijKlik);
    };
  }, [groep]);

  useEffect(() => {
    let vorige = window.scrollY;
    const bijScrollen = () => {
      const y = window.scrollY, h = kop.current?.offsetHeight ?? 0;
      if (!window.matchMedia(SMAL).matches || y < h) setVerborgen(false);
      else if (y - vorige > DREMPEL) setVerborgen(true);
      else if (vorige - y > DREMPEL) setVerborgen(false);
      if (Math.abs(y - vorige) > DREMPEL || y < h) vorige = y;
    };
    window.addEventListener("scroll", bijScrollen, { passive: true });
    return () => window.removeEventListener("scroll", bijScrollen);
  }, []);

  const zichtbaar = open || !verborgen;
  useEffect(() => {
    const zet = () => {
      const h = kop.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty("--kop-zicht", zichtbaar ? `${h}px` : "0px");
      // De volle hoogte, ook als de kop weg is: een scroll graphic op de telefoon houdt die ruimte vrij (Niels, 31 oktober 2026)
      document.documentElement.style.setProperty("--kop-hoogte", `${h}px`);
    };
    zet();
    const waarnemer = new ResizeObserver(zet);
    if (kop.current) waarnemer.observe(kop.current);
    return () => waarnemer.disconnect();
  }, [zichtbaar]);

  return (
    <header ref={kop} className={s.kop} data-verborgen={!zichtbaar || undefined}>
      <a href="#inhoud" className={s.overslaan}>
        Naar de inhoud
      </a>
      <nav className={s.nav} aria-label="Hoofdmenu">
        <Woordmerk />
        <button type="button" className={s.menuKnop} aria-expanded={open} aria-controls="hoofdmenu" onClick={() => setOpen((o) => !o)}>
          {open ? "Sluit" : "Menu"}
        </button>
        <ul className={s.links} id="hoofdmenu" data-open={open}>
          {MENU.map((g) => {
            const id = `menu-${g.naam.toLowerCase().replace(/\s+/g, "-")}`;
            const hier = g.items.some((m) => isHier(pad, m.href));
            return (
              <li key={g.naam} className={s.groep}>
                <button type="button" className={s.groepKnop} aria-expanded={groep === g.naam} aria-controls={id}
                  data-hier={hier || undefined} onClick={() => setGroep((x) => (x === g.naam ? null : g.naam))}>
                  {g.naam}
                </button>
                <span className={s.groepNaam}>{g.naam}</span>
                <ul className={s.paneel} id={id} data-open={groep === g.naam}>
                  {g.items.map((m) => (
                    <li key={m.href}>
                      <Link href={m.href} aria-current={isHier(pad, m.href) ? "page" : undefined}>
                        <span className={s.itemTekst}>{m.tekst}</span>
                        <span className={s.itemRegel}>{m.regel}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

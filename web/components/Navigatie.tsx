"use client";
// Hoofdmenu; markeert de huidige pagina (aria-current). Op een smal scherm achter een menuknop
// (besluit Niels B8, 26 oktober 2026); het menu sluit vanzelf na het kiezen van een pagina.
// De kop blijft bovenaan staan (feedback Niels K1, 27 oktober 2026). Op een smal scherm verdwijnt hij bij omlaag
// scrollen en komt hij terug bij het kleinste stukje omhoog. De zichtbare hoogte staat in --kop-zicht, zodat
// andere vaste elementen (scroll graphics, de filterbalk van Onderwerpen) eronder schuiven.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Woordmerk } from "./Typografie";
import s from "./kader.module.css";

// In de volgorde van het verhaal op de voorpagina (besluit Niels, 25 oktober 2026); Kamerleden erbij (feedback K5)
const MENU = [
  { href: "/verkenner", tekst: "Verkenner" },
  { href: "/onderwerpen", tekst: "Onderwerpen" },
  { href: "/coalitie", tekst: "Coalitie" },
  { href: "/oppositie", tekst: "Oppositie" },
  { href: "/kamerleden", tekst: "Kamerleden" },
  { href: "/stemgenoten", tekst: "Stemgenoten" }, // live sinds 27 oktober 2026 (besluit Niels)
  { href: "/fracties", tekst: "Fracties" },
  { href: "/methodiek", tekst: "Methodiek" },
  { href: "/over", tekst: "Over" },
];
const SMAL = "(max-width: 760px)";
const DREMPEL = 6; // zoveel pixels scrollen voordat de kop verdwijnt of terugkomt

export function Navigatie() {
  const pad = usePathname();
  const [open, setOpen] = useState(false);
  const [verborgen, setVerborgen] = useState(false);
  const kop = useRef<HTMLElement>(null);
  useEffect(() => setOpen(false), [pad]);

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
    const zet = () => document.documentElement.style.setProperty("--kop-zicht", zichtbaar ? `${kop.current?.offsetHeight ?? 0}px` : "0px");
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
          {MENU.map((m) => (
            <li key={m.href}>
              <Link href={m.href} aria-current={pad === m.href || pad.startsWith(`${m.href}/`) ? "page" : undefined}>
                {m.tekst}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

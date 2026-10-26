"use client";
// Hoofdmenu; markeert de huidige pagina (aria-current). Op een smal scherm achter een menuknop
// (besluit Niels B8, 26 oktober 2026); het menu sluit vanzelf na het kiezen van een pagina.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Woordmerk } from "./Typografie";
import s from "./kader.module.css";

// In de volgorde van het verhaal op de voorpagina (besluit Niels, 25 oktober 2026)
const MENU = [
  { href: "/verkenner", tekst: "Verkenner" },
  { href: "/onderwerpen", tekst: "Onderwerpen" },
  { href: "/coalitie", tekst: "Coalitie" },
  { href: "/oppositie", tekst: "Oppositie" },
  { href: "/fracties", tekst: "Fracties" },
  { href: "/methodiek", tekst: "Methodiek" },
  { href: "/over", tekst: "Over" },
];

export function Navigatie() {
  const pad = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pad]);
  return (
    <header>
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

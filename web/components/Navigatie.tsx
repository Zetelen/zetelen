"use client";
// Hoofdmenu; markeert de huidige pagina (aria-current)
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Woordmerk } from "./Typografie";
import s from "./kader.module.css";

// In de volgorde van het verhaal op de voorpagina (besluit Niels, 25 oktober 2026)
const MENU = [
  { href: "/verkenner", tekst: "Verkenner" },
  { href: "/onderwerpen", tekst: "Onderwerpen" },
  { href: "/coalitie", tekst: "Coalitie" },
  { href: "/fracties", tekst: "Fracties" },
  { href: "/methodiek", tekst: "Methodiek" },
  { href: "/over", tekst: "Over" },
];

export function Navigatie() {
  const pad = usePathname();
  return (
    <header>
      <a href="#inhoud" className={s.overslaan}>
        Naar de inhoud
      </a>
      <nav className={s.nav} aria-label="Hoofdmenu">
        <Woordmerk />
        <ul className={s.links}>
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

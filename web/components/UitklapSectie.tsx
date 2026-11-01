"use client";
// Uitklapsectie (verzoek Niels, 1 november 2026: de telefoon moet voelen als een app). Op de telefoon staat alleen de
// kop, die je openklapt; zo is een naslagpagina een inhoudsopgave in plaats van vijftien schermen tekst. Op een groter
// scherm altijd open. Een link naar het anker (/methodiek#zetelwerk) klapt de sectie open.
import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { Label, SectieKop } from "./Typografie";
import s from "./onderdelen.module.css";

const TELEFOON = "(max-width: 760px)";

export function UitklapSectie({ id, label, titel, children, style }: { id: string; label: string; titel: string; children: ReactNode; style?: CSSProperties }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const m = matchMedia(TELEFOON);
    const zet = () => { d.open = !m.matches || location.hash === `#${id}`; };
    const anker = () => { if (location.hash === `#${id}`) d.open = true; };
    zet();
    m.addEventListener("change", zet);
    addEventListener("hashchange", anker);
    return () => { m.removeEventListener("change", zet); removeEventListener("hashchange", anker); };
  }, [id]);
  return (
    <section id={id} style={{ scrollMarginTop: 80 }}>
      <details ref={ref} open className={s.uitklapSectie}>
        {/* Op een groot scherm klapt de kop niet in */}
        <summary onClick={(e) => { if (!matchMedia(TELEFOON).matches) e.preventDefault(); }}>
          <Label>{label}</Label>
          <SectieKop>{titel}</SectieKop>
        </summary>
        <div style={style}>{children}</div>
      </details>
    </section>
  );
}

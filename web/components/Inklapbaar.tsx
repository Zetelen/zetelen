"use client";
// Inklapbaar blok (feedback Niels, 25 oktober 2026): op een breed scherm open, op een telefoon dicht,
// zodat de leeswijzer de grafiek niet ver naar beneden duwt. De bezoeker kan hem altijd openen en sluiten.
import { type ReactNode, useEffect, useRef } from "react";
import s from "./onderdelen.module.css";

// Met dicht begint het blok ook op een breed scherm ingeklapt
export function Inklapbaar({ titel, children, className, dicht = false }: { titel: string; children: ReactNode; className?: string; dicht?: boolean }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (ref.current && matchMedia("(max-width: 640px)").matches) ref.current.open = false;
  }, []);
  return (
    <details ref={ref} open={!dicht} className={s.inklapbaar}>
      <summary>{titel}</summary>
      <div className={className}>{children}</div>
    </details>
  );
}

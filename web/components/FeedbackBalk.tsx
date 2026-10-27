// Feedbackronde: een smalle balk onder het menu met een link naar het eigen formulier op /feedback
// (besluit Niels B13, 26 oktober 2026). Alleen zichtbaar als FEEDBACK in lib/site.ts aan staat.
import Link from "next/link";
import { FEEDBACK } from "@/lib/site";
import s from "./kader.module.css";

export function FeedbackBalk() {
  if (!FEEDBACK) return null;
  return (
    <div className={s.feedbackBalk}>
      Zetelen is net online. Wat vind je ervan? <Link href="/feedback">Zeg het in 3 minuten</Link>
    </div>
  );
}

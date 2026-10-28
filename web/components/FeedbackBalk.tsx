// Feedbackronde: een smalle balk onder het menu met een link naar het eigen formulier op /feedback
// (besluit Niels B13, 26 oktober 2026). Alleen zichtbaar als FEEDBACK in lib/site.ts aan staat.
import Link from "next/link";
import { FEEDBACK } from "@/lib/site";
import s from "./kader.module.css";

export function FeedbackBalk() {
  if (!FEEDBACK) return null;
  return (
    <div className={s.feedbackBalk}>
      {/* Lagere drempel (28 oktober 2026): de snelle vraag staat onderaan elke pagina */}
      Zetelen is net online. Iets onduidelijk? <a href="#snelle-feedback">Zeg het in één tik</a> of <Link href="/feedback">vul het formulier in</Link>
    </div>
  );
}

// Feedbackronde (besluit Niels, 25 oktober 2026): een smalle balk onder het menu met een link naar de vaste
// vragenlijst. Alleen zichtbaar als FEEDBACK_URL in lib/site.ts gevuld is.
import { FEEDBACK_URL } from "@/lib/site";
import s from "./kader.module.css";

export function FeedbackBalk() {
  if (!FEEDBACK_URL) return null;
  return (
    <div className={s.feedbackBalk}>
      Dit is een testversie van Zetelen. Wat vind je ervan?{" "}
      <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer">Geef feedback in 3 minuten ↗</a>
    </div>
  );
}

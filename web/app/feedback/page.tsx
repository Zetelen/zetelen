// Feedbackronde (besluit Niels B13, 26 oktober 2026): eigen formulier, opslag in de eigen database (migratie 021).
import type { Metadata } from "next";
import Link from "next/link";
import { FeedbackFormulier } from "@/components/FeedbackFormulier";
import { Inhoud } from "@/components/Kader";
import { HeroKop, Label, Tekst } from "@/components/Typografie";

export const metadata: Metadata = {
  title: "Wat vind je ervan?",
  description: "Tien korte vragen over Zetelen. Alles is vrijwillig.",
  robots: { index: false, follow: false },
};

export default function Feedback() {
  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", maxWidth: 720 }}>
        <Label>Feedback</Label>
        <HeroKop>Wat vind je ervan?</HeroKop>
        <Tekst>
          Zetelen is nog een testversie. Tien korte vragen, alles is vrijwillig: sla over wat je niet wilt beantwoorden.
          Je naam is niet nodig. Hoe we met je antwoorden omgaan, staat bij <Link href="/privacy">privacy</Link>.
        </Tekst>
      </section>
      <FeedbackFormulier />
    </Inhoud>
  );
}

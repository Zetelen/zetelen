"use client";
// Foutpagina (E3-S9): geen technische details voor de bezoeker
import { FoutStaat, Inhoud, knopKlasse } from "@/components/Kader";

export default function Fout({ reset }: { error: Error; reset: () => void }) {
  return (
    <Inhoud>
      <FoutStaat
        titel="De cijfers laden nu niet"
        uitleg="De gegevens zijn waarschijnlijk even niet bereikbaar. Probeer het over een paar minuten nog eens."
        kinderen={
          <button type="button" className={knopKlasse} onClick={() => reset()}>
            Nog een keer
          </button>
        }
      />
    </Inhoud>
  );
}

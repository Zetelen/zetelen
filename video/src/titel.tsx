// Gedeelde opening (feedback Niels 26 oktober: "de motie groot in beeld"): soort en datum in een banner, de titel van
// de casus groot, en de vraag eronder. Voor alle video's met één casus; daarna volgt het verloop in een Sequence.
import type { ReactNode } from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { casus, datumTekst } from "./gegevens";
import { Banner, Geluid, Woorden } from "./flits";
import { Achtergrond, Merk, zacht } from "./onderdelen";
import { K, VEILIG } from "./stijl";

export const TITEL = 120;

function Titel({ slug }: { slug: string }) {
  const frame = useCurrentFrame();
  const c = casus(slug);
  const langste = Math.max(...c.titel.split(" ").map((w) => w.length));
  return (
    <AbsoluteFill style={{ opacity: interpolate(frame, [TITEL - 10, TITEL], [1, 0], zacht) }}>
      <Achtergrond binnenhof={0.35} />
      <Merk />
      <div style={{ position: "absolute", top: 560, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", gap: 34 }}>
        <div><Banner bij={4}>{c.soort} · {datumTekst(c.besluiten[0].datum)}</Banner></div>
        <Woorden tekst={c.titel} bij={12} grootte={Math.min(150, Math.floor(1700 / langste))} />
        <Woorden tekst={c.vraag} bij={44} grootte={58} kleur={K.koper} />
      </div>
      <Geluid bij={12} naam="dreun" volume={0.7} />
      <Geluid bij={44} naam="tik" volume={0.7} />
      <Geluid bij={TITEL - 10} naam="swoosh" volume={0.6} />
    </AbsoluteFill>
  );
}

// Titel, dan het verloop van de video (dat begint bij frame 0 van zijn eigen Sequence)
export function MetTitel({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950 }}>
      <Sequence durationInFrames={TITEL}><Titel slug={slug} /></Sequence>
      <Sequence from={TITEL}>{children}</Sequence>
    </AbsoluteFill>
  );
}

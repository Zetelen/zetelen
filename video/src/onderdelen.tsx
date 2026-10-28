// Gedeelde onderdelen van de video's: achtergrond met het Binnenhof, merk, teksten die in- en uitfaden,
// een oplopende teller en de eindkaart met de bron.
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FRAUNCES, Zaal150 } from "./merk";
import { K, LETTER, VEILIG } from "./stijl";

export const zacht = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Zichtbaarheid van een tekst tussen twee frames, met in- en uitfaden
export function zichtbaar(frame: number, van: number, tot: number, fade = 12): number {
  return interpolate(frame, [van, van + fade, tot - fade, tot], [0, 1, 1, 0], zacht);
}

export function Achtergrond({ binnenhof = 0.18 }: { binnenhof?: number }) {
  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse 70% 40% at 60% 62%, rgba(208,138,85,0.20), rgba(208,138,85,0) 70%),
        radial-gradient(ellipse 90% 40% at 50% 100%, rgba(62,124,177,0.16), rgba(62,124,177,0) 70%), ${K.nacht950}`,
    }}>
      {binnenhof > 0 && (
        <Img src={staticFile("binnenhof.svg")} style={{ position: "absolute", left: 0, right: 0, bottom: 180, width: "100%", height: 760, objectFit: "cover", objectPosition: "60% 50%", opacity: binnenhof }} />
      )}
    </AbsoluteFill>
  );
}

export function Merk() {
  return (
    // Merk van 28 oktober 2026: "zetelen" in Fraunces
    <div style={{ position: "absolute", top: VEILIG.boven - 90, left: VEILIG.zij, fontFamily: FRAUNCES, fontWeight: 600, fontSize: 46, letterSpacing: "-0.01em", color: K.tekst }}>
      zetelen
    </div>
  );
}

export function Label({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ fontFamily: LETTER.sans, fontWeight: 600, fontSize: 30, letterSpacing: "0.14em", textTransform: "uppercase", color: K.koper, ...style }}>
      {children}
    </div>
  );
}

export function Kop({ children, grootte = 92, style }: { children: ReactNode; grootte?: number; style?: CSSProperties }) {
  return <div style={{ fontFamily: LETTER.serif, fontSize: grootte, lineHeight: 1.06, color: K.tekst, ...style }}>{children}</div>;
}

export function Tekst({ children, grootte = 46, style }: { children: ReactNode; grootte?: number; style?: CSSProperties }) {
  return <div style={{ fontFamily: LETTER.sans, fontSize: grootte, lineHeight: 1.35, color: K.tekst, ...style }}>{children}</div>;
}

// Een tekstblok dat tussen twee frames in beeld is, licht omhoog schuivend
export function Blok({ van, tot, top = VEILIG.boven + 40, children }: { van: number; tot: number; top?: number; children: ReactNode }) {
  const frame = useCurrentFrame();
  const z = zichtbaar(frame, van, tot);
  return (
    <div style={{ position: "absolute", top, left: VEILIG.zij, right: VEILIG.zij, opacity: z, transform: `translateY(${(1 - z) * 24}px)`, display: "flex", flexDirection: "column", gap: 24 }}>
      {children}
    </div>
  );
}

// Teller die vanaf een frame oploopt naar een waarde
export function Teller({ waarde, van, duur = 30, style }: { waarde: number; van: number; duur?: number; style?: CSSProperties }) {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [van, van + duur], [0, waarde], zacht));
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{n}</span>;
}

// Veer van 0 naar 1 vanaf een frame
export function useVeer(van: number, demping = 16): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - van, fps, config: { damping: demping } });
}

// Eindkaart: kijk zelf, met de bron en de kleurafspraak
export function Eind({ van, bron }: { van: number; bron: string }) {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [van, van + 15], [0, 1], zacht);
  return (
    <AbsoluteFill style={{ opacity: z }}>
      <Achtergrond binnenhof={0} />
      {/* Eindkaart met het merk: de zaal met 150 zetels boven het adres */}
      <div style={{ position: "absolute", top: 380, left: 0, right: 0, display: "flex", justifyContent: "center" }}><Zaal150 breedte={820} /></div>
      <div style={{ position: "absolute", top: 720, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 30 }}>
        <div style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 130, letterSpacing: "-0.02em", lineHeight: 1, color: K.tekst, textShadow: `0 0 40px ${K.nacht950}` }}>zetelen.nl</div>
        <Tekst grootte={40} style={{ color: K.zacht }}>Elke stemming in de Tweede Kamer sinds 2010, geteld uit de open data.</Tekst>
      </div>
      <div style={{ position: "absolute", bottom: VEILIG.onder - 60, left: VEILIG.zij, right: VEILIG.zij, fontFamily: LETTER.mono, fontSize: 26, lineHeight: 1.5, color: K.zacht }}>
        Bron: Tweede Kamer, open data · {bron}
        <br />Kleuren zijn een eigen palet, geen partijkleuren.
      </div>
    </AbsoluteFill>
  );
}

// Stip met optionele rand, voor de zaal en de rasters
export function Stip({ x, y, r, kleur, rand, opacity = 1 }: { x: number; y: number; r: number; kleur: string; rand?: string; opacity?: number }) {
  return <circle cx={x} cy={y} r={r} fill={kleur} stroke={rand ?? K.nacht950} strokeWidth={rand ? 4 : 2} opacity={opacity} />;
}

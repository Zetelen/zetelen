// Bouwstenen voor de flitsende stijl (besluit Niels, 26 oktober 2026: "flitsend nieuwsformat"): woorden die
// binnenslaan, een stempel, een flits bij een harde overgang, een koperen balk die inschuift, een camera die
// inzoomt, en geluidseffecten (zelf gemaakt, scripts/geluid.py).
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/HankenGrotesk";
import { zacht } from "./onderdelen";
import { K, LETTER } from "./stijl";

export const ZWAAR = loadFont("normal", { weights: ["800"], subsets: ["latin"] }).fontFamily;

export type GeluidNaam = "tik" | "swoosh" | "dreun" | "toon" | "stijg" | "daal" | "plof";
// Geluidseffecten staan uit (besluit Niels, 28 oktober 2026); de aanroepen blijven staan, zodat ze met één regel terug
// kunnen. Muziek komt er straks apart onder.
export const MET_GELUID = false;
export function Geluid({ bij, naam, volume = 1 }: { bij: number; naam: GeluidNaam; volume?: number }) {
  if (!MET_GELUID) return null;
  return (
    <Sequence from={Math.max(0, Math.round(bij))} durationInFrames={60} layout="none">
      <Audio src={staticFile(`geluid/${naam}.wav`)} volume={volume} />
    </Sequence>
  );
}

// Korte flits over het hele beeld, bij een harde overgang
export function Flits({ bij, kleur = K.koper, sterkte = 0.55 }: { bij: number; kleur?: string; sterkte?: number }) {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [bij, bij + 1, bij + 7], [0, sterkte, 0], zacht);
  return o > 0 ? <AbsoluteFill style={{ backgroundColor: kleur, opacity: o, mixBlendMode: "screen" }} /> : null;
}

// Woorden die een voor een omhoog binnenslaan; met tot verdwijnen ze weer
export function Woorden({ tekst, bij, tot = Infinity, grootte = 96, kleur = K.tekst, zwaar = true, style }: {
  tekst: string; bij: number; tot?: number; grootte?: number; kleur?: string; zwaar?: boolean; style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uit = Number.isFinite(tot) ? interpolate(frame, [tot - 6, tot], [1, 0], zacht) : 1;
  // Lopende tekst schuift als geheel van links in; woord voor woord leest vervelend (feedback Niels 26 oktober)
  if (!zwaar) {
    const s = spring({ frame: frame - bij, fps, config: { damping: 20, stiffness: 120 } });
    return (
      <div style={{ fontFamily: LETTER.sans, fontWeight: 400, fontSize: grootte, lineHeight: 1.3, color: kleur,
        opacity: Math.min(1, s * 1.3) * uit, transform: `translateX(${(1 - s) * -80}px)`, ...style }}>
        {tekst}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: `0 ${grootte * 0.26}px`, fontFamily: zwaar ? ZWAAR : LETTER.sans, fontWeight: zwaar ? 800 : 400,
      fontSize: grootte, lineHeight: 1.02, letterSpacing: zwaar ? "-0.02em" : 0, color: kleur, opacity: uit, ...style }}>
      {tekst.split(" ").map((w, i) => {
        // Opkomen met een korte schuif binnen de eigen regel (review 26 oktober: geen masker, geen afgekapte woorden)
        const s = spring({ frame: frame - bij - i * 2, fps, config: { damping: 14, stiffness: 180 } });
        return <span key={i} style={{ display: "inline-block", opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 26}px)` }}>{w}</span>;
      })}
    </div>
  );
}

// Stempel: schuin kader dat met een klap neerkomt
export function Stempel({ bij, tekst, kleur = K.koper, grootte = 84, style }: { bij: number; tekst: string; kleur?: string; grootte?: number; style?: CSSProperties }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < bij) return null;
  const s = spring({ frame: frame - bij, fps, config: { damping: 11, stiffness: 220 } });
  return (
    <div style={{ display: "inline-block", padding: "10px 30px", border: `8px solid ${kleur}`, color: kleur, fontFamily: ZWAAR, fontWeight: 800,
      fontSize: grootte, letterSpacing: "0.04em", textTransform: "uppercase", transform: `rotate(-6deg) scale(${2.4 - 1.4 * s})`, opacity: Math.min(1, s * 1.6), ...style }}>
      {tekst}
    </div>
  );
}

// Koperen balk die van links inschuift, met tekst erin (zoals een nieuwsbanner)
export function Banner({ bij, tot = Infinity, children, grootte = 40 }: { bij: number; tot?: number; children: ReactNode; grootte?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - bij, fps, config: { damping: 18, stiffness: 200 } });
  const weg = Number.isFinite(tot) ? interpolate(frame, [tot - 6, tot], [1, 0], zacht) : 1;
  return (
    <div style={{ display: "inline-block", position: "relative", padding: "10px 22px", opacity: weg }}>
      <div style={{ position: "absolute", inset: 0, background: K.koper, transformOrigin: "left", transform: `scaleX(${s})` }} />
      <span style={{ position: "relative", fontFamily: ZWAAR, fontWeight: 800, fontSize: grootte, letterSpacing: "0.06em", textTransform: "uppercase",
        color: K.nacht950, opacity: interpolate(frame, [bij + 6, bij + 10], [0, 1], zacht) }}>{children}</span>
    </div>
  );
}

// Getal dat met een veer naar zijn waarde springt (met overshoot), vanaf een vorige waarde
export function Sprong({ van, naar, bij, style }: { van: number; naar: number; bij: number; style?: CSSProperties }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - bij, fps, config: { damping: 12, stiffness: 120 } });
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{Math.round(van + (naar - van) * s)}</span>;
}

// Camera: zoom en verschuiving tussen sleutelbeelden
export type Shot = { f: number; zoom: number; x: number; y: number };
export function Camera({ shots, children }: { shots: Shot[]; children: ReactNode }) {
  const frame = useCurrentFrame();
  const f = shots.map((s) => s.f);
  const opt = { ...zacht, easing: (t: number) => 0.5 - Math.cos(Math.PI * t) / 2 };
  const zoom = shots.length > 1 ? interpolate(frame, f, shots.map((s) => s.zoom), opt) : shots[0]?.zoom ?? 1;
  const x = shots.length > 1 ? interpolate(frame, f, shots.map((s) => s.x), opt) : shots[0]?.x ?? 540;
  const y = shots.length > 1 ? interpolate(frame, f, shots.map((s) => s.y), opt) : shots[0]?.y ?? 960;
  // Het punt (x, y) komt in het midden van het beeld, met deze zoom
  return (
    <AbsoluteFill style={{ transform: `translate(${540 - x * zoom}px, ${960 - y * zoom}px) scale(${zoom})`, transformOrigin: "0 0" }}>
      {children}
    </AbsoluteFill>
  );
}

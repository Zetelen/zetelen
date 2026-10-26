// Variant "Gelijke stand" (versie 2, flitsend; feedback Niels 26 oktober 2026: de mutaties als spanningsopbouw, met de
// anticlimax van weer gelijk). Eerst 72-72 en het stempel "gestaakt". Een week later stemt de Kamer opnieuw: elke
// verandering per fractie schuift binnen als kaart, het scorebord verspringt en een wijzer kantelt. De volgorde van
// de veranderingen is zo gekozen dat de leiding zo vaak mogelijk wisselt. Het slot: weer gelijk, niet aangenomen.
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MetTitel, TITEL } from "../titel";
import { casus, datumTekst, naam, perFractie, totalen, uitslagWoord } from "../gegevens";
import { Banner, Flits, Geluid, Sprong, Stempel, Woorden, ZWAAR } from "../flits";
import { Achtergrond, Eind, Merk, zacht } from "../onderdelen";
import { K, LETTER, VEILIG } from "../stijl";

type Mutatie = { fractie: string; dv: number; dt: number; dn: number };
type Stemmen = Parameters<typeof perFractie>[0];

// Verandering per fractie tussen de eerste en de tweede stemming
function mutaties(s1: Stemmen, s2: Stemmen): Mutatie[] {
  const p1 = new Map(perFractie(s1).map((f) => [f.fractie, f]));
  return perFractie(s2).map((f) => {
    const o = p1.get(f.fractie) ?? { voor: 0, tegen: 0, niet: 0 };
    return { fractie: f.fractie, dv: f.voor - o.voor, dt: f.tegen - o.tegen, dn: f.niet - o.niet };
  }).filter((w) => w.dv || w.dt || w.dn);
}

// Volgorde met de meeste spanning: wissels van de leiding, een zo groot mogelijke voorsprong, en het liefst "voor" aan
// kop vlak voor het slot (het voorstel lijkt het te halen), dan weer gelijk. Geen gelijke stand voor het slot.
function spannend(m: Mutatie[], start: { v: number; t: number }): Mutatie[] {
  const perms = (l: Mutatie[]): Mutatie[][] => (l.length <= 1 ? [l] : l.flatMap((x, i) => perms([...l.slice(0, i), ...l.slice(i + 1)]).map((r) => [x, ...r])));
  let beste = m, score = -Infinity;
  for (const p of m.length <= 7 ? perms(m) : [m]) {
    let v = start.v, t = start.t, vorige = 0, wissels = 0, vroegGelijk = 0, voorsprong = 0, voorBijSlot = 0;
    p.forEach((x, i) => {
      v += x.dv; t += x.dt;
      const leid = Math.sign(v - t);
      if (leid !== 0 && leid !== vorige) wissels++;
      if (leid === 0 && i < p.length - 1) vroegGelijk++;
      voorsprong = Math.max(voorsprong, Math.abs(v - t));
      if (i === p.length - 2 && v > t) voorBijSlot = 1;
      vorige = leid || vorige;
    });
    const s = wissels * 2 - vroegGelijk * 3 + voorsprong + voorBijSlot * 2;
    if (s > score) { score = s; beste = p; }
  }
  return beste;
}

const veranderingTekst = (x: Mutatie) => {
  const delen: string[] = [];
  if (x.dn < 0) delen.push(`${-x.dn} meer aanwezig`);
  if (x.dn > 0) delen.push(`${x.dn} minder aanwezig`);
  if (x.dv) delen.push(`${x.dv > 0 ? "+" : ""}${x.dv} voor`);
  if (x.dt) delen.push(`${x.dt > 0 ? "+" : ""}${x.dt} tegen`);
  return delen;
};

// Tempo (feedback Niels 26 oktober: iets minder snel); de opening met de motie groot in beeld zit in ../titel.tsx
const HAAK = 110, UITLEG = 160, WEEK = 90, PER = 108, SLOT = 220, EIND = 150;

export function duurGelijk(slug = "studievoorschot"): number {
  const c = casus(slug);
  return TITEL + HAAK + UITLEG + WEEK + mutaties(c.besluiten[0].stemmen, c.besluiten[1].stemmen).length * PER + SLOT + EIND;
}
export const DUUR_GELIJK = duurGelijk();

export function GelijkeStand({ slug }: { slug: string }) {
  return <MetTitel slug={slug}><Verloop slug={slug} /></MetTitel>;
}

function Verloop({ slug }: { slug: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = casus(slug);
  const [b1, b2] = c.besluiten;
  const t1 = totalen(b1), t2 = totalen(b2);
  const reeks = spannend(mutaties(b1.stemmen, b2.stemmen), { v: t1.voor, t: t1.tegen });
  const M0 = HAAK + UITLEG + WEEK;
  const SL = M0 + reeks.length * PER;

  // Stand na elke stap
  const standen = reeks.reduce<Array<{ v: number; t: number }>>((acc, x) => [...acc, { v: acc[acc.length - 1].v + x.dv, t: acc[acc.length - 1].t + x.dt }], [{ v: t1.voor, t: t1.tegen }]);
  const stap = Math.max(-1, Math.min(reeks.length - 1, Math.floor((frame - M0) / PER)));
  const vorigeStand = standen[Math.max(0, stap)], stand = standen[stap + 1] ?? standen[0];
  const stapStart = M0 + Math.max(0, stap) * PER;
  const wijzerS = spring({ frame: frame - stapStart - 14, fps, config: { damping: 9, stiffness: 120 } });
  const hoek = (v: number, t: number) => Math.max(-28, Math.min(28, (v - t) * 14));
  const wijzer = stap < 0 ? 0 : hoek(vorigeStand.v, vorigeStand.t) + (hoek(stand.v, stand.t) - hoek(vorigeStand.v, vorigeStand.t)) * wijzerS;
  const leid = stand.v > stand.t ? "VOOR LEIDT" : stand.t > stand.v ? "TEGEN LEIDT" : "GELIJK";
  const bordZicht = interpolate(frame, [M0 - 10, M0, SL + 40, SL + 52], [0, 1, 1, 0], zacht);

  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950 }}>
      <Achtergrond binnenhof={interpolate(frame, [0, HAAK], [0.25, 0.06], zacht)} />
      <Merk />

      {/* Haak: 72 · 72, gestaakt */}
      {frame < HAAK && (
        <AbsoluteFill style={{ opacity: interpolate(frame, [HAAK - 8, HAAK], [1, 0], zacht), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
          <div style={{ display: "flex", gap: 40 }}>
            <Woorden tekst={String(t1.voor)} bij={4} grootte={260} />
            <Woorden tekst="·" bij={14} grootte={260} kleur={K.zacht} />
            <Woorden tekst={String(t1.tegen)} bij={22} grootte={260} />
          </div>
          <Stempel bij={44} tekst="Gestaakt" grootte={96} />
        </AbsoluteFill>
      )}
      <Geluid bij={4} naam="dreun" volume={0.7} /><Geluid bij={22} naam="dreun" volume={0.7} /><Geluid bij={44} naam="dreun" />
      <Flits bij={44} sterkte={0.4} />

      {/* Uitleg */}
      {frame >= HAAK && frame < HAAK + UITLEG && (
        <div style={{ position: "absolute", top: VEILIG.boven + 80, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", gap: 28 }}>
          <div><Banner bij={HAAK + 2}>{datumTekst(b1.datum)}</Banner></div>
          <Woorden tekst="Precies gelijk." bij={HAAK + 6} tot={HAAK + UITLEG} grootte={110} />
          <Woorden tekst="Dan stemt de Kamer opnieuw, in een volgende vergadering." bij={HAAK + 26} tot={HAAK + UITLEG} grootte={56} zwaar={false} kleur={K.zacht} />
          <Woorden tekst={c.omschrijving} bij={HAAK + 46} tot={HAAK + UITLEG} grootte={46} zwaar={false} />
        </div>
      )}
      <Geluid bij={HAAK} naam="swoosh" volume={0.6} />

      {/* Een week later */}
      {frame >= HAAK + UITLEG && frame < M0 + 6 && (
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: `0 ${VEILIG.zij}px`, gap: 30 }}>
          <div><Banner bij={HAAK + UITLEG + 2} tot={M0 + 6}>{datumTekst(b2.datum)}</Banner></div>
          <Woorden tekst="Een week later." bij={HAAK + UITLEG + 8} tot={M0 + 6} grootte={130} />
        </AbsoluteFill>
      )}
      <Geluid bij={HAAK + UITLEG} naam="swoosh" volume={0.6} /><Geluid bij={HAAK + UITLEG + 30} naam="stijg" volume={0.45} />

      {/* Scorebord met wijzer */}
      <AbsoluteFill style={{ opacity: bordZicht }}>
        <div style={{ position: "absolute", top: VEILIG.boven, left: VEILIG.zij, right: VEILIG.zij, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {(["voor", "tegen"] as const).map((k) => (
            <div key={k} style={{ textAlign: k === "voor" ? "left" : "right" }}>
              <div style={{ fontFamily: ZWAAR, fontWeight: 800, fontSize: 210, lineHeight: 0.95, color: k === "voor" ? K.voor : K.tegen }}>
                <Sprong key={`${k}${stap}`} van={k === "voor" ? vorigeStand.v : vorigeStand.t} naar={k === "voor" ? stand.v : stand.t} bij={stapStart + 14} />
              </div>
              <div style={{ fontFamily: ZWAAR, fontWeight: 800, fontSize: 34, letterSpacing: "0.12em", color: K.zacht }}>{k.toUpperCase()}</div>
            </div>
          ))}
        </div>
        <svg width={1080} height={420} style={{ position: "absolute", top: 560, left: 0 }}>
          <path d="M 190 330 A 350 350 0 0 1 890 330" fill="none" stroke={K.lijn} strokeWidth={6} />
          <path d="M 190 330 A 350 350 0 0 1 540 -20" fill="none" stroke={K.voor} strokeWidth={6} opacity={0.5} />
          <path d="M 540 -20 A 350 350 0 0 1 890 330" fill="none" stroke={K.tegen} strokeWidth={6} opacity={0.5} />
          <line x1={540} y1={-34} x2={540} y2={-4} stroke={K.tekst} strokeWidth={5} />
          <g transform={`rotate(${-wijzer} 540 330)`}>
            <line x1={540} y1={330} x2={540} y2={30} stroke={K.tekst} strokeWidth={8} strokeLinecap="round" />
          </g>
          <circle cx={540} cy={330} r={18} fill={K.koper} />
          <text x={540} y={400} textAnchor="middle" fontFamily={ZWAAR} fontWeight={800} fontSize={40} letterSpacing="0.1em"
            fill={leid === "GELIJK" || stap < 0 ? K.tekst : leid === "VOOR LEIDT" ? K.voor : K.tegen}>{stap < 0 ? "GELIJK" : leid}</text>
        </svg>

        <div style={{ position: "absolute", top: 1420, left: VEILIG.zij, right: VEILIG.zij, fontFamily: LETTER.mono, fontSize: 28, lineHeight: 1.4, color: K.zacht }}>
          Het verschil zat in wie er was. De veranderingen gebeurden tegelijk; de volgorde hier is gekozen om ze een voor een te laten zien.
        </div>
        {/* Kaart per verandering */}
        {reeks.map((x, k) => {
          const s0 = M0 + k * PER;
          if (frame < s0 || frame >= s0 + PER) return null;
          const inS = spring({ frame: frame - s0, fps, config: { damping: 15, stiffness: 160 } });
          const uit = interpolate(frame, [s0 + PER - 10, s0 + PER], [0, 1], zacht);
          return (
            <div key={x.fractie} style={{ position: "absolute", top: 1080, left: VEILIG.zij, right: VEILIG.zij, padding: "34px 40px", background: K.nacht800,
              borderLeft: `10px solid ${x.dv > 0 ? K.voor : x.dt > 0 ? K.tegen : K.lijnLicht}`, transform: `translateX(${(1 - inS) * 900 - uit * 900}px)`, opacity: 1 - uit }}>
              <div style={{ fontFamily: ZWAAR, fontWeight: 800, fontSize: 34, letterSpacing: "0.08em", color: K.tekst, opacity: 0.8 }}>VERANDERING {k + 1} VAN {reeks.length}</div>
              <div style={{ fontFamily: ZWAAR, fontWeight: 800, fontSize: 88, color: K.tekst, lineHeight: 1.05 }}>{naam(x.fractie)}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 18 }}>
                {veranderingTekst(x).map((d) => (
                  <span key={d} style={{ padding: "8px 18px", borderRadius: 999, fontFamily: ZWAAR, fontWeight: 800, fontSize: 38,
                    background: d.includes("voor") ? K.voor : d.includes("tegen") ? K.tegen : K.lijn, color: d.includes("voor") || d.includes("tegen") ? K.nacht950 : K.tekst }}>{d}</span>
                ))}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
      {reeks.map((_, k) => <span key={k}><Geluid bij={M0 + k * PER} naam="swoosh" volume={0.5} /><Geluid bij={M0 + k * PER + 14} naam="tik" volume={0.8} /></span>)}

      {/* Slot: weer gelijk */}
      {frame >= SL + 44 && frame < SL + SLOT + 6 && (
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40, opacity: interpolate(frame, [SL + SLOT - 6, SL + SLOT], [1, 0], zacht) }}>
          <div style={{ display: "flex", gap: 40 }}>
            <Woorden tekst={String(t2.voor)} bij={SL + 50} grootte={260} />
            <Woorden tekst="·" bij={SL + 56} grootte={260} kleur={K.zacht} />
            <Woorden tekst={String(t2.tegen)} bij={SL + 62} grootte={260} />
          </div>
          <Stempel bij={SL + 82} tekst="Weer gelijk" grootte={96} />
          <div style={{ padding: `0 ${VEILIG.zij}px`, textAlign: "center" }}>
            <Woorden tekst={`Opnieuw staken: ${uitslagWoord(b2).toLowerCase()}.`} bij={SL + 110} grootte={54} zwaar={false} kleur={K.zacht} style={{ justifyContent: "center" }} />
          </div>
        </AbsoluteFill>
      )}
      <Geluid bij={SL + 50} naam="dreun" volume={0.6} /><Geluid bij={SL + 62} naam="dreun" volume={0.6} /><Geluid bij={SL + 82} naam="dreun" /><Flits bij={SL + 82} sterkte={0.4} />
      <Geluid bij={SL + 110} naam="daal" volume={0.7} />

      {frame >= SL + SLOT && <Eind van={SL + SLOT} bron={`zaak ${c.zaak}`} />}
      <Geluid bij={SL + SLOT} naam="swoosh" volume={0.5} />
    </AbsoluteFill>
  );
}

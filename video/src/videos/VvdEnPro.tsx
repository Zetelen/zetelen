// "Hoe vaak stemmen VVD en PRO hetzelfde?" (verzoek Niels, 28 oktober 2026), voor sociale media: 9:16, rond 45 seconden,
// zonder stem, in de flitsende stijl. Zelfde opbouw en cijfers als /uitgelicht/vvd-en-pro: de vraag, PRO tussen de andere
// fracties nu, de lijn sinds 2010 met Rutte II, de PVV als tweede voorbeeld, twee lezingen, de bron.
// Gegevens: src/gegevens/vvd-pro.json (scripts/vvd_pro.mjs). Geen partijkleuren, geen namen van personen.
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { vloeiendPad } from "../../../web/lib/vloeiend";
import data from "../gegevens/vvd-pro.json";
import { Banner, Flits, Geluid, Sprong, Woorden, ZWAAR } from "../flits";
import { Achtergrond, Eind, Label, Merk, Tekst, useVeer, zacht } from "../onderdelen";
import { K, LETTER, VEILIG } from "../stijl";

const PVDA = "#7fb7c9", GL = "#e57f93"; // zelfde tinten als de dunne lijnen op de site
const pct = (c: number | null | undefined) => (c == null ? "" : `${Math.round(c)}%`);

const A = 0, B = 100, C = 330, D = 720, E = 900, F = 1170;
export const DUUR_VVD_PRO = 1320;

function Vraag() {
  return (
    <AbsoluteFill>
      <Achtergrond binnenhof={0.35} />
      <Merk />
      <div style={{ position: "absolute", top: 560, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", gap: 34 }}>
        <div><Banner bij={4}>Tweede Kamer · 2010 tot nu</Banner></div>
        <Woorden tekst="Hoe vaak stemmen VVD en PRO hetzelfde?" bij={12} grootte={124} />
        <Woorden tekst="Wat de stemmingen laten zien" bij={46} grootte={56} kleur={K.koper} />
      </div>
      <Geluid bij={12} naam="dreun" volume={0.7} />
      <Geluid bij={46} naam="tik" volume={0.6} />
      <Geluid bij={B - A - 10} naam="swoosh" volume={0.6} />
    </AbsoluteFill>
  );
}

function Nu() {
  const frame = useCurrentFrame();
  const r = data.rangorde;
  const plek = r.findIndex((x) => x.naam === "PRO") + 1;
  const pro = r[plek - 1];
  return (
    <AbsoluteFill>
      <Achtergrond binnenhof={0} />
      <Merk />
      <div style={{ position: "absolute", top: VEILIG.boven + 40, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", gap: 18 }}>
        <Label>Onder kabinet-Jetten</Label>
        <div style={{ fontFamily: ZWAAR, fontWeight: 800, fontSize: 250, lineHeight: 1, color: K.goud }}>
          <Sprong van={0} naar={Math.round(pro.c)} bij={8} />%
        </div>
        <Tekst grootte={44} style={{ color: K.zacht }}>van de stemmingen kozen VVD en PRO dezelfde kant</Tekst>
      </div>
      {/* De rangorde: met welke fracties de VVD het vaakst hetzelfde stemde */}
      <div style={{ position: "absolute", top: 780, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", gap: 8 }}>
        {r.map((x, i) => {
          const s = interpolate(frame, [50 + i * 5, 62 + i * 5], [0, 1], zacht);
          const nadruk = x.naam === "PRO";
          return (
            <div key={x.naam} style={{ display: "grid", gridTemplateColumns: "300px 1fr 110px", alignItems: "center", gap: 20, opacity: s,
              fontFamily: LETTER.sans, fontSize: 31, color: nadruk ? K.tekst : K.zacht, fontWeight: nadruk ? 600 : 400 }}>
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.naam}</span>
              <span style={{ height: 18, borderRadius: 9, background: K.nacht800, overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: `${x.c * s}%`, background: nadruk ? K.goud : K.lijnLicht }} />
              </span>
              <span style={{ fontFamily: LETTER.mono, textAlign: "right" }}>{pct(x.c)}</span>
            </div>
          );
        })}
      </div>
      {/* Boven de onderrand van sociale media (VEILIG.onder) */}
      <div style={{ position: "absolute", top: 1440, left: VEILIG.zij, right: VEILIG.zij }}>
        <Woorden tekst={`Plek ${plek} van ${r.length}. Middenmoot.`} bij={150} grootte={64} kleur={K.koper} />
      </div>
      <Geluid bij={8} naam="toon" volume={0.6} />
      <Geluid bij={150} naam="tik" volume={0.6} />
    </AbsoluteFill>
  );
}

// De lijn sinds 2010: eerst VVD met PvdA en met GroenLinks, dan VVD met GroenLinks-PvdA en PRO
function Lijn() {
  const frame = useCurrentFrame();
  const jaren = data.lijnen.pvda.map((p) => p.h).concat(data.lijnen.pro.map((p) => p.h)).filter((h, i, a) => a.indexOf(h) === i).sort();
  const eerste = jaren[0], n = (Number(jaren[jaren.length - 1].slice(0, 4)) - Number(eerste.slice(0, 4))) * 2 + (jaren[jaren.length - 1].slice(5, 7) === "07" ? 1 : 0) + 1;
  const idx = (h: string) => (Number(h.slice(0, 4)) - Number(eerste.slice(0, 4))) * 2 + (h.slice(5, 7) === "07" ? 1 : 0);
  const W = 936, H = 760, L = 70, R = 20, T = 20, O = 60;
  const x = (i: number) => L + ((i + 0.5) / n) * (W - L - R);
  const y = (c: number) => T + ((100 - c) / 100) * (H - T - O);
  // Vloeiende lijnen die geleidelijk verschijnen (feedback Niels, 28 oktober 2026): het hele pad staat klaar en een
  // streep met pathLength 1 schuift erover. De oude lijnen van frame 20 tot 200, de lijn van PRO van 230 tot 300;
  // uitlopend met een zachte curve, zodat het tekenen niet schokt.
  const glad = { ...zacht, easing: (t: number) => 1 - (1 - t) ** 3 };
  const oud = interpolate(frame, [20, 200], [0, 1], glad), nieuw = interpolate(frame, [230, 300], [0, 1], glad);
  const pad = (punten: Array<{ h: string; c: number | null }>) =>
    vloeiendPad(punten.filter((q) => q.c != null).map((q) => [x(idx(q.h)), y(q.c!)]));
  const lijn = (d: string, deel: number, kleur: string, dikte: number) => (
    <path d={d} fill="none" stroke={kleur} strokeWidth={dikte} strokeLinecap="round" pathLength={1}
      strokeDasharray="1 1" strokeDashoffset={1 - deel} />
  );
  const maand = (iso: string) => (Number(iso.slice(0, 4)) - Number(eerste.slice(0, 4))) * 2 + (Number(iso.slice(5, 7)) - 1) / 6;
  const r2 = data.kabinetten.find((k) => k.naam === "Rutte II")!;
  const band = interpolate(frame, [90, 105], [0, 1], zacht);
  const laatste = data.lijnen.pro[data.lijnen.pro.length - 1];
  return (
    <AbsoluteFill>
      <Achtergrond binnenhof={0} />
      <Merk />
      <div style={{ position: "absolute", top: VEILIG.boven + 40, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", gap: 16 }}>
        <Label>Sinds 2010, per half jaar</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 30px", fontFamily: LETTER.sans, fontSize: 32, color: K.zacht }}>
          <span><span style={{ color: PVDA }}>━</span> VVD en PvdA</span>
          <span><span style={{ color: GL }}>━</span> VVD en GroenLinks</span>
          <span><span style={{ color: K.goud }}>━</span> VVD en PRO</span>
        </div>
      </div>
      <svg width={W} height={H} style={{ position: "absolute", top: 470, left: VEILIG.zij }}>
        {/* Rutte II: VVD en PvdA samen in het kabinet */}
        <rect x={x(maand(r2.begin)) - (W - L - R) / n / 2} y={T} width={(maand(r2.einde!) - maand(r2.begin)) * ((W - L - R) / n)} height={H - T - O}
          fill={K.nacht800} opacity={band} />
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={K.lijn} strokeWidth={2} />
            <text x={L - 12} y={y(v) + 10} textAnchor="end" fontFamily={LETTER.mono} fontSize={26} fill={K.zacht}>{v}%</text>
          </g>
        ))}
        {[2010, 2014, 2018, 2022, 2026].map((j) => (
          <text key={j} x={x((j - Number(eerste.slice(0, 4))) * 2)} y={H - 16} textAnchor="middle" fontFamily={LETTER.mono} fontSize={26} fill={K.zacht}>{j}</text>
        ))}
        {lijn(pad(data.lijnen.gl), oud, GL, 5)}
        {lijn(pad(data.lijnen.pvda), oud, PVDA, 5)}
        {lijn(pad(data.lijnen.pro), nieuw, K.goud, 8)}
        {laatste.c != null && <circle cx={x(idx(laatste.h))} cy={y(laatste.c)} r={14 * interpolate(frame, [295, 310], [0, 1], zacht)} fill={K.goud} />}
      </svg>
      <div style={{ position: "absolute", top: 1270, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", gap: 20 }}>
        <Woorden tekst={`Rutte II: VVD en PvdA samen in het kabinet. ${pct(data.pvdaPerKabinet["Rutte II"])} hetzelfde.`} bij={100} tot={225} grootte={58} kleur={K.koper} />
        <Woorden tekst={`Sinds juli 2026: VVD en PRO ${pct(laatste.c)}. Het hoogste sinds 2018.`} bij={300} grootte={58} kleur={K.goud} />
      </div>
      <Flits bij={100} />
      <Geluid bij={20} naam="stijg" volume={0.5} />
      <Geluid bij={100} naam="dreun" volume={0.7} />
      <Geluid bij={300} naam="toon" volume={0.6} />
    </AbsoluteFill>
  );
}

function Pvv() {
  const s1 = useVeer(10), s2 = useVeer(60);
  return (
    <AbsoluteFill>
      <Achtergrond binnenhof={0} />
      <Merk />
      <div style={{ position: "absolute", top: 520, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", gap: 50 }}>
        <Woorden tekst="Hetzelfde patroon bij de PVV" bij={0} grootte={84} />
        <div style={{ opacity: s1, display: "flex", flexDirection: "column", gap: 6 }}>
          <Label>Samen in kabinet-Schoof, 2024</Label>
          <div style={{ fontFamily: ZWAAR, fontWeight: 800, fontSize: 170, color: K.goud, lineHeight: 1 }}>{pct(data.pvv.samen)}</div>
        </div>
        <div style={{ opacity: s2, display: "flex", flexDirection: "column", gap: 6 }}>
          <Label>PVV in de oppositie, 2026</Label>
          <div style={{ fontFamily: ZWAAR, fontWeight: 800, fontSize: 170, color: K.lijnLicht, lineHeight: 1 }}>{pct(data.pvv.oppositie)}</div>
        </div>
        <Tekst grootte={38} style={{ color: K.zacht }}>Hoe vaak VVD en PVV hetzelfde stemden, per half jaar.</Tekst>
      </div>
      <Geluid bij={10} naam="tik" volume={0.6} />
      <Geluid bij={60} naam="daal" volume={0.6} />
    </AbsoluteFill>
  );
}

function Lezingen() {
  const s1 = useVeer(20), s2 = useVeer(90);
  const plek = data.rangorde.findIndex((x) => x.naam === "PRO") + 1;
  const kaart = (s: number, titel: string, tekst: string) => (
    <div style={{ opacity: s, transform: `translateY(${(1 - s) * 40}px)`, padding: "36px 40px", borderRadius: 16, background: K.nacht800,
      border: `2px solid ${K.lijn}`, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontFamily: LETTER.serif, fontSize: 64, lineHeight: 1.08, color: K.tekst }}>{titel}</div>
      <Tekst grootte={38} style={{ color: K.zacht }}>{tekst}</Tekst>
    </div>
  );
  return (
    <AbsoluteFill>
      <Achtergrond binnenhof={0} />
      <Merk />
      <div style={{ position: "absolute", top: VEILIG.boven + 60, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", gap: 34 }}>
        <Label>Twee lezingen</Label>
        {kaart(s1, "Ze kiezen vaak een andere kant", `Nu plek ${plek} van ${data.rangorde.length}. En na Rutte II zakte de PvdA bij de VVD weer naar ${pct(data.pvdaPerKabinet["Rutte III"])}.`)}
        {kaart(s2, "Samen regeren verkleint de afstand", `Onder Rutte II ${pct(data.pvdaPerKabinet["Rutte II"])}, onder Rutte I ${pct(data.pvdaPerKabinet["Rutte I"])}. Een regeerakkoord stemt mee.`)}
        <Woorden tekst="Of ze kunnen samenwerken, is een politieke keuze." bij={170} grootte={46} zwaar={false} style={{ color: K.koper }} />
      </div>
      <Geluid bij={20} naam="tik" volume={0.6} />
      <Geluid bij={90} naam="tik" volume={0.6} />
    </AbsoluteFill>
  );
}

export function VvdEnPro() {
  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950 }}>
      {/* Eigen muzikale onderlaag (scripts/muziek.py), zacht en neutraal; uit aan het eind */}
      <Audio src={staticFile("muziek/onderlaag.wav")} volume={(f) => 0.55 * interpolate(f, [0, 20, DUUR_VVD_PRO - 60, DUUR_VVD_PRO], [0, 1, 1, 0], zacht)} />
      <Sequence from={A} durationInFrames={B - A}><Vraag /></Sequence>
      <Sequence from={B} durationInFrames={C - B}><Nu /></Sequence>
      <Sequence from={C} durationInFrames={D - C}><Lijn /></Sequence>
      <Sequence from={D} durationInFrames={E - D}><Pvv /></Sequence>
      <Sequence from={E} durationInFrames={F - E}><Lezingen /></Sequence>
      <Sequence from={F}><Eind van={0} bron={`hoe vaak twee fracties dezelfde kant kozen, opgehaald ${data.opgehaald}`} /></Sequence>
    </AbsoluteFill>
  );
}

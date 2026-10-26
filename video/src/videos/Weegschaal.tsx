// Variant "Eén stem verschil" (versie 2, flitsend; feedback Niels 26 oktober: leuk, maar professioneler). Na de
// titel valt fractie na fractie in de schaal van voor of tegen, afwisselend en de grootste eerst; de balk kantelt mee
// en veert na. Strakke lijnen, schalen met diepte, fractieblokken met een glanslijn, namen buiten de schalen.
// Voor krappe uitslagen (gehandicaptenzorg 75-74, live-weddenschappen 74-72).
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { casus, naam, perFractie, tintenVan, totalen, uitslagWoord } from "../gegevens";
import { Flits, Geluid, Stempel, Woorden, ZWAAR } from "../flits";
import { Achtergrond, Eind, Merk, zacht } from "../onderdelen";
import { K, LETTER, VEILIG } from "../stijl";
import { MetTitel, TITEL } from "../titel";

const INTRO = 150, STAP = 34, NA = 200, EIND = 150;
type Blok = { fractie: string; n: number; kant: "voor" | "tegen" };

// Volgorde: afwisselend voor en tegen, grootste eerst, zodat het tot het eind spannend blijft
function reeksVan(slug: string): Blok[] {
  const b = casus(slug).besluiten.at(-1)!;
  const pf = perFractie(b.stemmen);
  const voor = pf.filter((f) => f.voor > 0).map((f) => ({ fractie: f.fractie, n: f.voor, kant: "voor" as const })).sort((a, x) => x.n - a.n);
  const tegen = pf.filter((f) => f.tegen > 0).map((f) => ({ fractie: f.fractie, n: f.tegen, kant: "tegen" as const })).sort((a, x) => x.n - a.n);
  const uit: Blok[] = [];
  for (let i = 0; i < Math.max(voor.length, tegen.length); i++) { if (voor[i]) uit.push(voor[i]); if (tegen[i]) uit.push(tegen[i]); }
  return uit;
}
// Kleine fracties als regel tekst; afsplitsingen met dezelfde naam tellen samen
function samengevoegd(l: Array<{ fractie: string; n: number }>): string[] {
  const m = new Map<string, number>();
  for (const r of l) m.set(naam(r.fractie), (m.get(naam(r.fractie)) ?? 0) + r.n);
  return [...m].map(([k, n]) => `${k}\u00a0${n}`);
}
// Begin van de eindkaart, gerekend vanaf het einde van de titel
const eindVan = (slug: string) => INTRO + reeksVan(slug).length * STAP + NA;
export const duurWeegschaal = (slug: string) => TITEL + eindVan(slug) + EIND;

export function Weegschaal({ slug }: { slug: string }) {
  return <MetTitel slug={slug}><Verloop slug={slug} /></MetTitel>;
}

function Verloop({ slug }: { slug: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = casus(slug);
  const b = c.besluiten.at(-1)!;
  const t = totalen(b);
  const tint = tintenVan(b.stemmen);
  const reeks = reeksVan(slug);
  const valt = (i: number) => INTRO + i * STAP;
  const klaar = valt(reeks.length - 1) + 30;
  const E = eindVan(slug);
  const binnen = reeks.map((r, i) => ({ ...r, i, z: spring({ frame: frame - valt(i), fps, config: { damping: 10, stiffness: 140 } }) }));
  const somVoor = binnen.filter((r) => r.kant === "voor").reduce((s, r) => s + r.n * Math.min(1, r.z), 0);
  const somTegen = binnen.filter((r) => r.kant === "tegen").reduce((s, r) => s + r.n * Math.min(1, r.z), 0);
  // Balk: de hoek volgt het verschil, met naveren na elke landing
  const doelHoek = Math.max(-12, Math.min(12, (somTegen - somVoor) * 0.8));
  const laatste = valt(Math.max(0, Math.min(reeks.length - 1, Math.floor((frame - INTRO) / STAP))));
  const naveer = frame >= INTRO ? Math.sin((frame - laatste) / 3) * Math.exp(-(frame - laatste) / 14) * 2.2 : 0;
  const hoek = doelHoek + naveer;
  const niet = perFractie(b.stemmen).filter((f) => f.niet > 0);
  const nietAantal = niet.reduce((s, f) => s + f.niet, 0);
  const verschil = Math.abs(t.voor - t.tegen);
  const zicht = interpolate(frame, [INTRO - 6, INTRO + 6, E - 10, E], [0, 1, 1, 0], zacht);

  // Weegschaal: draaipunt midden, balk 684 breed, schalen 300 breed hangen 300 onder de uiteinden
  const MX = 540, MY = 860, HALF = 330, HANG = 300, SB = 150, KLEIN = 26;
  const rad = (hoek * Math.PI) / 180;
  const uiteinde = (k: -1 | 1) => ({ x: MX + k * HALF * Math.cos(rad), y: MY + k * HALF * Math.sin(rad) });
  const L = uiteinde(-1), R = uiteinde(1);
  const stapel = (kant: "voor" | "tegen", p: { x: number; y: number }) => {
    let h0 = 0;
    const bodem = p.y + HANG;
    return binnen.filter((r) => r.kant === kant && frame >= valt(r.i)).map((r) => {
      const h = Math.max(6, r.n * 3.4);
      const y = bodem - h0 - h;
      h0 += h + 2;
      const val = (1 - Math.min(1, r.z)) * -420;
      return (
        <g key={r.fractie} transform={`translate(0 ${val})`}>
          <rect x={p.x - SB + 14} y={y} width={2 * SB - 28} height={h} rx={5} fill={tint.get(r.fractie) ?? K.lijnLicht} />
          <rect x={p.x - SB + 14} y={y} width={2 * SB - 28} height={Math.min(3, h / 3)} rx={2} fill="#ffffff" opacity={0.28} />
          {/* Naam in het blok zelf; kleine fracties staan in een regel onder de schaal */}
          {h >= KLEIN && (
            <text x={p.x} y={y + h / 2 + 9} textAnchor="middle" fontFamily={ZWAAR} fontWeight={800} fontSize={26} fill={K.nacht950}>{naam(r.fractie)} {r.n}</text>
          )}
        </g>
      );
    });
  };
  const schaal = (p: { x: number; y: number }) => (
    <g>
      <line x1={p.x} y1={p.y} x2={p.x - SB} y2={p.y + HANG} stroke={K.lijnLicht} strokeWidth={2} />
      <line x1={p.x} y1={p.y} x2={p.x + SB} y2={p.y + HANG} stroke={K.lijnLicht} strokeWidth={2} />
      <circle cx={p.x} cy={p.y} r={7} fill={K.goud} />
      <path d={`M${p.x - SB - 10} ${p.y + HANG} L${p.x + SB + 10} ${p.y + HANG} Q${p.x + SB - 10} ${p.y + HANG + 46} ${p.x} ${p.y + HANG + 46} Q${p.x - SB + 10} ${p.y + HANG + 46} ${p.x - SB - 10} ${p.y + HANG} Z`}
        fill="url(#schaalVerloop)" stroke={K.koper} strokeWidth={2.5} />
    </g>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950 }}>
      <Achtergrond binnenhof={0.05} />
      <Merk />
      {/* Intro: wat er op het spel stond */}
      {frame < INTRO + 10 && (
        <div style={{ position: "absolute", top: 560, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", gap: 40,
          opacity: interpolate(frame, [INTRO - 4, INTRO + 10], [1, 0], zacht) }}>
          <Woorden tekst={c.omschrijving} bij={4} grootte={56} zwaar={false} />
          <Woorden tekst="Fractie voor fractie op de weegschaal." bij={56} grootte={72} kleur={K.koper} />
        </div>
      )}
      <Geluid bij={56} naam="stijg" volume={0.4} />

      <AbsoluteFill style={{ opacity: zicht }}>
        {/* Stand */}
        <div style={{ position: "absolute", top: VEILIG.boven + 10, left: VEILIG.zij, right: VEILIG.zij, display: "flex", justifyContent: "space-between" }}>
          {(["voor", "tegen"] as const).map((k) => (
            <div key={k} style={{ textAlign: k === "voor" ? "left" : "right" }}>
              <div style={{ fontFamily: ZWAAR, fontWeight: 800, fontSize: 180, lineHeight: 0.95, color: k === "voor" ? K.voor : K.tegen }}>
                {Math.round(k === "voor" ? somVoor : somTegen)}
              </div>
              <div style={{ fontFamily: ZWAAR, fontWeight: 800, fontSize: 34, letterSpacing: "0.12em", color: K.zacht }}>{k.toUpperCase()}</div>
            </div>
          ))}
        </div>

        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="schaalVerloop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={K.nacht800} />
              <stop offset="1" stopColor={K.nacht950} />
            </linearGradient>
            <linearGradient id="balkVerloop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={K.goud} />
              <stop offset="1" stopColor={K.koper} />
            </linearGradient>
          </defs>
          {/* Voet */}
          <path d={`M${MX - 16} ${MY} L${MX - 46} ${MY + 540} L${MX + 46} ${MY + 540} L${MX + 16} ${MY} Z`} fill={K.nacht800} stroke={K.lijn} strokeWidth={2} />
          <rect x={MX - 130} y={MY + 536} width={260} height={14} rx={7} fill={K.nacht800} stroke={K.lijn} strokeWidth={2} />
          {schaal(L)}
          {schaal(R)}
          {stapel("voor", L)}
          {stapel("tegen", R)}
          {/* Balk */}
          <g transform={`rotate(${hoek} ${MX} ${MY})`}>
            <rect x={MX - HALF - 12} y={MY - 7} width={2 * HALF + 24} height={14} rx={7} fill="url(#balkVerloop)" />
          </g>
          <circle cx={MX} cy={MY} r={20} fill={K.nacht950} stroke={K.goud} strokeWidth={5} />
        </svg>

        {/* Kleine fracties, onder de schaal */}
        {([["voor", L], ["tegen", R]] as const).map(([kant, p]) => {
          const klein = binnen.filter((r) => r.kant === kant && r.n * 3.4 < KLEIN && r.z > 0.5);
          return klein.length > 0 && (
            <div key={kant} style={{ position: "absolute", top: p.y + HANG + 62, left: p.x - 190, width: 380, textAlign: "center",
              fontFamily: LETTER.sans, fontSize: 26, lineHeight: 1.3, color: K.zacht }}>
              {samengevoegd(klein).join(" · ")}
            </div>
          );
        })}

        {/* Slot */}
        {frame >= klaar && (
          <div style={{ position: "absolute", top: 1440, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", gap: 44, alignItems: "flex-start" }}>
            <Stempel bij={klaar + 4} tekst={verschil === 1 ? "1 stem verschil" : `${verschil} stemmen verschil`} grootte={64} />
            <Woorden tekst={`${uitslagWoord(b)}, ${t.voor} tegen ${t.tegen}.${nietAantal ? ` ${nietAantal === 1 ? "Eén Kamerlid" : `${nietAantal} Kamerleden`} stemde niet mee (${[...new Set(niet.map((f) => naam(f.fractie)))].join(", ")}).` : ""}`}
              bij={klaar + 30} grootte={44} zwaar={false} />
          </div>
        )}
      </AbsoluteFill>
      <Flits bij={klaar + 4} sterkte={0.35} />
      <Geluid bij={klaar + 4} naam="dreun" /><Geluid bij={klaar + 30} naam="toon" volume={0.5} />
      {reeks.map((_, i) => <Geluid key={i} bij={valt(i) + 6} naam="tik" volume={0.7} />)}

      {frame >= E && <Eind van={E} bron={`zaak ${c.zaak}`} />}
      <Geluid bij={E} naam="swoosh" volume={0.5} />
    </AbsoluteFill>
  );
}

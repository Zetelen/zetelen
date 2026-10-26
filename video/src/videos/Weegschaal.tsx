// Variant "Eén stem verschil" (32 s): een weegschaal. Fractie na fractie valt in de schaal van voor of tegen,
// afwisselend, de grootste eerst; de balk kantelt mee en een teller loopt op. De spanning zit in het einde.
// Voor krappe uitslagen (gehandicaptenzorg 75-74, live-weddenschappen 74-72).
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { casus, datumTekst, naam, perFractie, tintenVan, totalen, uitslagWoord } from "../gegevens";
import { Achtergrond, Blok, Eind, Kop, Label, Merk, Tekst, zacht } from "../onderdelen";
import { K, LETTER, VEILIG } from "../stijl";

export const DUUR_WEEGSCHAAL = 960;
const START = 180, STAP = 26;

export function Weegschaal({ slug }: { slug: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = casus(slug);
  const b = c.besluiten[c.besluiten.length - 1];
  const t = totalen(b);
  const tint = tintenVan(b.stemmen);
  const pf = perFractie(b.stemmen);
  // Volgorde: afwisselend voor en tegen, grootste eerst, zodat het tot het eind spannend blijft
  const voor = pf.filter((f) => f.voor > 0).map((f) => ({ fractie: f.fractie, n: f.voor, kant: "voor" as const })).sort((a, x) => x.n - a.n);
  const tegen = pf.filter((f) => f.tegen > 0).map((f) => ({ fractie: f.fractie, n: f.tegen, kant: "tegen" as const })).sort((a, x) => x.n - a.n);
  const reeks: Array<{ fractie: string; n: number; kant: "voor" | "tegen" }> = [];
  for (let i = 0; i < Math.max(voor.length, tegen.length); i++) { if (voor[i]) reeks.push(voor[i]); if (tegen[i]) reeks.push(tegen[i]); }
  const valt = (i: number) => START + i * STAP;
  const binnen = reeks.map((r, i) => ({ ...r, z: spring({ frame: frame - valt(i), fps, config: { damping: 14 } }) }));
  const somVoor = binnen.filter((r) => r.kant === "voor").reduce((s, r) => s + r.n * r.z, 0);
  const somTegen = binnen.filter((r) => r.kant === "tegen").reduce((s, r) => s + r.n * r.z, 0);
  const hoek = Math.max(-14, Math.min(14, (somTegen - somVoor) * 0.9));
  const klaar = valt(reeks.length - 1) + 40;
  const niet = pf.filter((f) => f.niet > 0);

  // Weegschaal: draaipunt midden, balk van 760 breed, schalen hangen aan de uiteinden
  const MX = 540, MY = 900, HALF = 380;
  const rad = (hoek * Math.PI) / 180;
  const eind = (kant: -1 | 1) => ({ x: MX + kant * HALF * Math.cos(rad), y: MY + kant * HALF * Math.sin(rad) });
  const links = eind(-1), rechts = eind(1);
  const SCHAAL_Y = 330; // touw
  const stapel = (kant: "voor" | "tegen", p: { x: number; y: number }) => {
    let hoogte = 0;
    return binnen.filter((r) => r.kant === kant && r.z > 0.01).map((r) => {
      const h = r.n * 3.6;
      const y = p.y + SCHAAL_Y - hoogte - h;
      hoogte += h + 2;
      const val = (1 - Math.min(1, r.z)) * -500;
      return (
        <g key={r.fractie} transform={`translate(0 ${val})`}>
          <rect x={p.x - 150} y={y} width={300} height={h} rx={4} fill={tint.get(r.fractie) ?? K.lijnLicht} opacity={0.92} />
          {h >= 30 && <text x={p.x} y={y + h / 2 + 10} textAnchor="middle" fontFamily={LETTER.sans} fontWeight={600} fontSize={26} fill={K.nacht950}>{naam(r.fractie)} {r.n}</text>}
        </g>
      );
    });
  };

  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950 }}>
      <Achtergrond binnenhof={interpolate(frame, [0, 140, 170], [0.45, 0.45, 0.06], zacht)} />
      <Merk />
      <Blok van={0} tot={175}>
        <Label>Eén stemming · {datumTekst(b.datum)}</Label>
        <Kop>{c.vraag}</Kop>
        <Tekst grootte={40} style={{ color: K.zacht, opacity: interpolate(frame, [50, 70], [0, 1], zacht) }}>{c.omschrijving}</Tekst>
      </Blok>

      <div style={{ position: "absolute", top: VEILIG.boven + 20, left: VEILIG.zij, right: VEILIG.zij, display: "flex", justifyContent: "space-between",
        fontFamily: LETTER.serif, fontSize: 132, color: K.tekst, opacity: interpolate(frame, [170, 190], [0, 1], zacht) }}>
        <div>{Math.round(somVoor)}<div style={{ fontFamily: LETTER.sans, fontSize: 34, color: K.zacht }}>voor</div></div>
        <div style={{ textAlign: "right" }}>{Math.round(somTegen)}<div style={{ fontFamily: LETTER.sans, fontSize: 34, color: K.zacht }}>tegen</div></div>
      </div>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: interpolate(frame, [170, 190, 820, 840], [0, 1, 1, 0], zacht) }}>
        <path d={`M${MX - 60} ${MY + 330} L${MX} ${MY} L${MX + 60} ${MY + 330} Z`} fill={K.nacht800} stroke={K.koper} strokeWidth={3} />
        <line x1={links.x} y1={links.y} x2={rechts.x} y2={rechts.y} stroke={K.koper} strokeWidth={8} strokeLinecap="round" />
        <circle cx={MX} cy={MY} r={14} fill={K.goud} />
        {[links, rechts].map((p, i) => (
          <g key={i}>
            <line x1={p.x} y1={p.y} x2={p.x - 150} y2={p.y + SCHAAL_Y} stroke={K.lijnLicht} strokeWidth={2} />
            <line x1={p.x} y1={p.y} x2={p.x + 150} y2={p.y + SCHAAL_Y} stroke={K.lijnLicht} strokeWidth={2} />
            <path d={`M${p.x - 170} ${p.y + SCHAAL_Y} Q${p.x} ${p.y + SCHAAL_Y + 60} ${p.x + 170} ${p.y + SCHAAL_Y}`} fill="none" stroke={K.koper} strokeWidth={4} />
          </g>
        ))}
        {stapel("voor", links)}
        {stapel("tegen", rechts)}
      </svg>

      <Blok van={klaar} tot={900} top={1480}>
        <Kop grootte={74} style={{ color: K.koper }}>{uitslagWoord(b)}: {t.voor} tegen {t.tegen}.</Kop>
        <Tekst grootte={40}>
          {Math.abs(t.voor - t.tegen) === 1 ? "Eén stem verschil." : `${Math.abs(t.voor - t.tegen)} stemmen verschil.`}{" "}
          {niet.length ? `${niet.reduce((s, f) => s + f.niet, 0) === 1 ? "Eén Kamerlid" : `${niet.reduce((s, f) => s + f.niet, 0)} Kamerleden`} stemde niet mee (${niet.map((f) => naam(f.fractie)).join(", ")}).` : ""}
        </Tekst>
      </Blok>

      {frame >= 840 && <Eind van={840} bron={`zaak ${c.zaak}`} />}
    </AbsoluteFill>
  );
}

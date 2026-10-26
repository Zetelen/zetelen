// "Van Rutte IV tot nu" (40 s): de zaal als timelapse. Bij elke stap kleuren de zetels om naar de nieuwe
// verhoudingen, de kabinetsfracties krijgen een gouden rand, en een scorebord telt de zetels van het kabinet tegen
// de grens van 76. Alleen gegevens uit Zetelen (src/gegevens/tijdlijn.json): de zetels bij de start van elk kabinet,
// aan het eind van het huidige, en de datum waarop een fractie uit het kabinet stapte.
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { KLEIN, tinten, zaal } from "../../../web/lib/verhaal";
import tijdlijn from "../gegevens/tijdlijn.json";
import { datumTekst, lijstTekst, naam } from "../gegevens";
import { Achtergrond, Blok, Eind, Kop, Label, Merk, Tekst, zacht } from "../onderdelen";
import { K, LETTER, VEILIG } from "../stijl";

type Kabinet = { kabinet: string; begin: string; einde: string | null; begin_zetels: Record<string, number>; eind_zetels: Record<string, number>; coalitie: Array<{ fractie: string; tot: string | null }> };
const KAB = tijdlijn.kabinetten as unknown as Kabinet[];
type Stap = { datum: string; kop: string; tekst: string; zetels: Record<string, number>; kabinet: string[] };

// De stappen: start van elk kabinet, elke fractie die eruit stapt, en de stand van nu
function stappen(): Stap[] {
  const uit: Stap[] = [];
  for (const k of KAB) {
    const leden = k.coalitie.map((c) => c.fractie);
    uit.push({ datum: k.begin, kop: `Kabinet-${k.kabinet}`, tekst: `${lijstTekst(leden.map(naam))} gaan samen regeren.`, zetels: k.begin_zetels, kabinet: leden });
    const vertrek = k.coalitie.filter((c) => c.tot).sort((a, b) => a.tot!.localeCompare(b.tot!));
    let over = [...leden];
    for (const v of vertrek) {
      over = over.filter((f) => f !== v.fractie);
      uit.push({ datum: v.tot!, kop: `${naam(v.fractie)} stapt uit het kabinet`, tekst: `Kabinet-${k.kabinet} gaat door met ${lijstTekst(over.map(naam))}.`, zetels: k.begin_zetels, kabinet: over });
    }
  }
  const nu = KAB[KAB.length - 1];
  uit.push({ datum: tijdlijn.opgehaald, kop: "En nu", tekst: "De Kamer van vandaag, na afsplitsingen en overstappers.", zetels: nu.eind_zetels, kabinet: nu.coalitie.filter((c) => !c.tot).map((c) => c.fractie) });
  return uit;
}

const STAPPEN = stappen();
const BEGIN = 150, PER = 135;
export const DUUR_TIJDLIJN = BEGIN + STAPPEN.length * PER + 150;

export function Tijdlijn() {
  const frame = useCurrentFrame();
  const tint = tinten(STAPPEN.map((s) => s.zetels));
  const zalen = STAPPEN.map((s) => zaal(s.zetels));
  const i = Math.max(0, Math.min(STAPPEN.length - 1, Math.floor((frame - BEGIN) / PER)));
  const start = BEGIN + i * PER;
  const over = interpolate(frame, [start, start + 30], [0, 1], zacht);
  const vorige = zalen[Math.max(0, i - 1)], hier = zalen[i];
  const stap = STAPPEN[i];
  const kabinetsZetels = (s: Stap) => s.kabinet.reduce((t, f) => t + (s.zetels[f] ?? 0), 0);
  const nuZetels = kabinetsZetels(stap), voorheen = kabinetsZetels(STAPPEN[Math.max(0, i - 1)]);
  const getoond = Math.round(voorheen + (nuZetels - voorheen) * over);
  const S = 1.12, MY = 1060;
  const zichtbaar = interpolate(frame, [BEGIN - 20, BEGIN, DUUR_TIJDLIJN - 170, DUUR_TIJDLIJN - 150], [0, 1, 1, 0], zacht);

  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950 }}>
      <Achtergrond binnenhof={interpolate(frame, [0, 120, 150], [0.5, 0.5, 0.08], zacht)} />
      <Merk />
      <Blok van={0} tot={BEGIN + 5}>
        <Label>Tijdlijn</Label>
        <Kop grootte={100}>Van Rutte IV tot nu</Kop>
        <Tekst style={{ color: K.zacht }}>Drie kabinetten, {STAPPEN.length - 1} momenten. Zo veranderde de Kamer.</Tekst>
      </Blok>

      <div style={{ position: "absolute", top: VEILIG.boven + 10, left: VEILIG.zij, right: VEILIG.zij, opacity: zichtbaar, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontFamily: LETTER.mono, fontSize: 34, color: K.koper }}>{datumTekst(stap.datum)}</div>
        <Kop grootte={74} style={{ opacity: over }}>{stap.kop}</Kop>
        <Tekst grootte={40} style={{ color: K.zacht, opacity: over }}>{stap.tekst}</Tekst>
      </div>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: zichtbaar }}>
        {hier.map((z, k) => {
          const v = vorige[k] ?? z;
          const kleurVan = tint.get(v.fractie) ?? KLEIN, kleurNaar = tint.get(z.fractie) ?? KLEIN;
          const kleur = interpolateColors(over, [0, 1], [kleurVan, kleurNaar]);
          const inKab = stap.kabinet.includes(z.fractie);
          return <circle key={k} cx={540 + (z.x - 500) * S} cy={MY + (z.y - 455) * S} r={10.5} fill={kleur} stroke={inKab ? K.goud : K.nacht950} strokeWidth={inKab ? 3.5 : 1.5} />;
        })}
        <text x={540} y={MY + 150} textAnchor="middle" fontFamily={LETTER.serif} fontSize={150} fill={nuZetels >= 76 ? K.goud : K.tekst}>{getoond}</text>
        <text x={540} y={MY + 200} textAnchor="middle" fontFamily={LETTER.mono} fontSize={30} fill={K.zacht}>
          zetels voor het kabinet · {nuZetels >= 76 ? "meerderheid" : `${76 - nuZetels} tekort`}
        </text>
      </svg>

      <div style={{ position: "absolute", top: 1440, left: VEILIG.zij, right: VEILIG.zij, opacity: zichtbaar, fontFamily: LETTER.sans, fontSize: 30, color: K.zacht, display: "flex", flexWrap: "wrap", gap: "10px 26px" }}>
        {Object.entries(stap.zetels).filter(([, n]) => n >= 5).sort((a, b) => b[1] - a[1]).map(([f, n]) => (
          <span key={f}><span style={{ color: tint.get(f) ?? KLEIN }}>●</span> {naam(f)} {n}</span>
        ))}
      </div>

      {frame >= DUUR_TIJDLIJN - 150 && <Eind van={DUUR_TIJDLIJN - 150} bron="kabinetten en zetels sinds 2022" />}
    </AbsoluteFill>
  );
}

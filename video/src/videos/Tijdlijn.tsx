// "Van Rutte IV tot nu" (versie 2, flitsend; feedback Niels 26 oktober 2026: te weinig beweging, verschil kabinet en
// rest niet duidelijk). Elke gebeurtenis heeft een eigen beeld: een kabinet begint (de zetels van het kabinet lichten
// goud op, de rest zakt naar 20%), een fractie stapt uit (haar zetels vallen weg uit het goud, de balk loopt leeg),
// verkiezingen (de zaal spat uiteen en valt opnieuw), en de stand van nu. Onderin een balk tegen de grens van 76.
// Alleen gegevens uit Zetelen (src/gegevens/tijdlijn.json). Geen namen van personen.
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KLEIN, VOORGANGER, type ZaalStip, sleutels, tinten, zaal } from "../../../web/lib/verhaal";
import tijdlijn from "../gegevens/tijdlijn.json";
import { datumTekst, lijstTekst, naam } from "../gegevens";
import { Banner, Camera, Flits, Geluid, type Shot, Sprong, Stempel, Woorden, ZWAAR } from "../flits";
import { Achtergrond, Eind, Merk, zacht } from "../onderdelen";
import { K, LETTER, VEILIG } from "../stijl";

type Kabinet = { kabinet: string; begin: string; begin_zetels: Record<string, number>; eind_zetels: Record<string, number>; coalitie: Array<{ fractie: string; tot: string | null }> };
type Verkiezing = { kamerperiode: string; verkiezingsdatum: string; zetels: Record<string, number> };
const KAB = tijdlijn.kabinetten as unknown as Kabinet[];
const VERK = (tijdlijn as unknown as { verkiezingen: Verkiezing[] }).verkiezingen;

type Soort = "kabinet" | "uit" | "verkiezing" | "nu";
type Moment = { soort: Soort; datum: string; kop: string; sub: string; zetels: Record<string, number>; kabinet: string[]; kabNaam: string; weg?: string; grootste?: string };

const som = (z: Record<string, number>, fr: string[]) => fr.reduce((t, f) => t + (z[f] ?? 0), 0);
const grootste = (z: Record<string, number>) => Object.entries(z).sort((a, b) => b[1] - a[1])[0];

// Veranderingen in de fracties tussen twee momenten: afsplitsing (de voorganger blijft) of nieuwe naam (de voorganger is weg)
function veranderingen(vorig: Record<string, number>, nu: Record<string, number>): string[] {
  return Object.keys(nu).filter((f) => !(f in vorig)).map((f) => {
    const v = (VOORGANGER[f] ?? []).find((p) => p in vorig);
    if (!v) return `${naam(f)} is nieuw.`;
    return v in nu ? `${naam(f)} splitste af van ${naam(v)}.` : `${naam(v)} heet nu ${naam(f)}.`;
  });
}

// Alle momenten op datum: kabinetten, uitstappers, verkiezingen en nu
function momenten(): Moment[] {
  const m: Moment[] = [];
  for (const k of KAB) {
    const leden = k.coalitie.map((c) => c.fractie);
    m.push({ soort: "kabinet", datum: k.begin, kop: `Kabinet-${k.kabinet}`, sub: `${lijstTekst(leden.map(naam))}: ${som(k.begin_zetels, leden)} zetels.`, zetels: k.begin_zetels, kabinet: leden, kabNaam: k.kabinet });
    let over = [...leden];
    for (const c of k.coalitie.filter((x) => x.tot).sort((a, b) => a.tot!.localeCompare(b.tot!))) {
      over = over.filter((f) => f !== c.fractie);
      m.push({ soort: "uit", datum: c.tot!, kop: `${naam(c.fractie)} stapt uit`, sub: `Kabinet-${k.kabinet} houdt ${som(k.begin_zetels, over)} zetels over.`, zetels: k.begin_zetels, kabinet: [...over], kabNaam: k.kabinet, weg: c.fractie });
    }
  }
  for (const v of VERK) {
    const [f, n] = grootste(v.zetels);
    m.push({ soort: "verkiezing", datum: v.verkiezingsdatum, kop: "Verkiezingen", sub: `${naam(f)} wordt de grootste, met ${n} zetels.`, zetels: v.zetels, kabinet: [], kabNaam: "", grootste: f });
  }
  m.sort((a, b) => a.datum.localeCompare(b.datum));
  // Bij verkiezingen blijft het zittende kabinet demissionair aan: neem de kabinetsfracties van het moment ervoor over
  for (let i = 1; i < m.length; i++) if (m[i].soort === "verkiezing") { m[i].kabinet = m[i - 1].kabinet; m[i].kabNaam = m[i - 1].kabNaam; }
  // Bij een nieuw kabinet: wat er sinds het vorige moment aan fracties veranderde (afsplitsingen, nieuwe namen)
  for (let i = 1; i < m.length; i++) if (m[i].soort === "kabinet") {
    const v = veranderingen(m[i - 1].zetels, m[i].zetels);
    if (v.length) m[i].sub = `${m[i].sub} ${v.join(" ")}`;
  }
  const nu = KAB[KAB.length - 1];
  const v = veranderingen(m[m.length - 1].zetels, nu.eind_zetels);
  const kabNu = nu.coalitie.filter((c) => !c.tot).map((c) => c.fractie);
  const zNu = som(nu.eind_zetels, kabNu);
  m.push({ soort: "nu", datum: tijdlijn.opgehaald, kop: "En nu", sub: `Kabinet-${nu.kabinet}: ${zNu} zetels, ${zNu >= 76 ? "een meerderheid" : "een minderheid"}.${v.length ? ` ${v.join(" ")}` : ""}`,
    zetels: nu.eind_zetels, kabinet: kabNu, kabNaam: nu.kabinet });
  return m;
}

const M = momenten();

// Duur in jaren, eerlijk afgerond: "Bijna 5 jaar." of "4 jaar."
function duurTekst(van: string, tot: string): string {
  const jaren = (new Date(tot).getTime() - new Date(van).getTime()) / (365.25 * 24 * 3600 * 1000);
  return jaren - Math.floor(jaren) >= 0.75 ? `Bijna ${Math.ceil(jaren)} jaar.` : `${Math.floor(jaren)} jaar.`;
}
const HAAK = 84, PER = 126, EIND = 150;
export const DUUR_TIJDLIJN = HAAK + M.length * PER + EIND;
const S = 1.06, MY = 1120; // zaal: schaal en hoogte van het midden

export function Tijdlijn() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tint = tinten(M.map((x) => x.zetels));
  const zalen: ZaalStip[][] = M.map((x) => zaal(x.zetels));
  const keys = sleutels(zalen);
  const i = Math.max(0, Math.min(M.length - 1, Math.floor((frame - HAAK) / PER)));
  const start = HAAK + i * PER;
  const lokaal = frame - start;
  const mo = M[i], vorig = M[Math.max(0, i - 1)];

  // Plek per stip, op sleutel; bij verkiezingen spat de zaal eerst uiteen
  const plek = (stap: number) => new Map(zalen[stap].map((z, k) => [keys[stap][k], { x: 540 + (z.x - 500) * S, y: MY + (z.y - 455) * S, fractie: z.fractie }]));
  const nu = plek(i), toen = plek(Math.max(0, i - 1));
  const alle = [...new Set([...nu.keys(), ...toen.keys()])];
  const verk = mo.soort === "verkiezing" && i > 0;
  const uiteen = verk ? interpolate(lokaal, [0, 14, 26], [0, 1, 1], zacht) : 0;
  const kabNu = mo.kabinet, kabToen = vorig.kabinet;
  const gloed = interpolate(lokaal, [8, 30], [0, 1], zacht);

  // Camera: lichte zoom per moment; bij een uitstapper even naar diens zetels
  const wegPunten = mo.weg ? [...nu.values()].filter((p) => p.fractie === mo.weg) : [];
  const wegMidden = wegPunten.length ? { x: wegPunten.reduce((t, p) => t + p.x, 0) / wegPunten.length, y: wegPunten.reduce((t, p) => t + p.y, 0) / wegPunten.length } : null;
  const shots: Shot[] = mo.weg && wegMidden
    ? [{ f: start, zoom: 1, x: 540, y: 960 }, { f: start + 30, zoom: 1.15, x: 540 + (wegMidden.x - 540) * 0.5, y: 960 + (wegMidden.y - 960) * 0.5 }, { f: start + 80, zoom: 1.15, x: 540 + (wegMidden.x - 540) * 0.5, y: 960 + (wegMidden.y - 960) * 0.5 }, { f: start + PER - 4, zoom: 1, x: 540, y: 960 }]
    : [{ f: start, zoom: verk ? 1.08 : 1.0, x: 540, y: 960 }, { f: start + PER, zoom: verk ? 1.0 : 1.05, x: 540, y: 980 }];

  const kabZetels = som(mo.zetels, kabNu), kabVorig = i === 0 ? 0 : som(vorig.zetels, kabToen);
  // Bij een uitstapper daalt het getal pas als de zetels wegvallen
  const balkBij = mo.soort === "uit" ? 50 : 10;
  const balkS = spring({ frame: lokaal - balkBij, fps, config: { damping: 14, stiffness: 90 } });
  const balk = kabVorig + (kabZetels - kabVorig) * balkS;
  const zichtbaar = interpolate(frame, [HAAK - 6, HAAK + 4, DUUR_TIJDLIJN - EIND - 8, DUUR_TIJDLIJN - EIND], [0, 1, 1, 0], zacht);
  const BX = VEILIG.zij, BB = 1080 - 2 * VEILIG.zij, BY = 1390;

  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950 }}>
      <Achtergrond binnenhof={0.05} />

      {/* Haak: vier klappen */}
      {frame < HAAK + 6 && (
        <AbsoluteFill style={{ padding: `${VEILIG.boven + 120}px ${VEILIG.zij}px`, display: "flex", flexDirection: "column", gap: 10, opacity: interpolate(frame, [HAAK - 6, HAAK], [1, 0], zacht) }}>
          {[duurTekst(KAB[0].begin, tijdlijn.opgehaald), `${KAB.length} kabinetten.`, `${VERK.length} verkiezingen.`, "1 Kamer."].map((t, k) => (
            <Woorden key={k} tekst={t} bij={k * 18} grootte={128} kleur={k === 3 ? K.koper : K.tekst} />
          ))}
        </AbsoluteFill>
      )}
      {[0, 18, 36, 54].map((f) => <Geluid key={`d${f}`} bij={f} naam="dreun" volume={0.7} />)}
      {[0, 18, 36, 54].map((f) => <Flits key={`f${f}`} bij={f} sterkte={0.25} />)}

      <AbsoluteFill style={{ opacity: zichtbaar }}>
        <Camera shots={shots}>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <defs>
              <filter id="gloed" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" /></filter>
            </defs>
            {alle.map((key, k) => {
              const a = toen.get(key) ?? nu.get(key)!, b = nu.get(key);
              const weg = !b; // stip bestaat niet meer: valt weg
              const doel = b ?? a;
              // Uiteenspatten: naar buiten in een willekeurige richting, dan naar de nieuwe plek
              const hoek = random(`h${key}`) * Math.PI * 2, afstand = 300 + random(`a${key}`) * 500;
              const van = verk ? { x: a.x + Math.cos(hoek) * afstand * uiteen, y: a.y + Math.sin(hoek) * afstand * uiteen } : a;
              const vertraag = verk ? random(`v${key}`) * 10 : (k % 40) * 0.4;
              const t = interpolate(lokaal, verk ? [26 + vertraag, 58 + vertraag] : [vertraag, 30 + vertraag], [0, 1], { ...zacht, easing: (x) => 1 - (1 - x) ** 3 });
              const x = van.x + (doel.x - van.x) * t, y = van.y + (doel.y - van.y) * t;
              const f = b?.fractie ?? a.fractie;
              const kleur = tint.get(f) ?? KLEIN;
              const inKab = kabNu.includes(f) && !weg;
              const wasKab = kabToen.includes(a.fractie) && i > 0;
              // Wie uit het kabinet stapt: eerst koperen nadruk terwijl de camera inzoomt, dan zakken de zetels weg
              const vertrekt = mo.weg === f;
              const val = vertrekt ? interpolate(lokaal, [46, 76], [0, 1], { ...zacht, easing: (q) => q * q }) : 0;
              const nadruk = vertrekt ? interpolate(lokaal, [10, 22, 46, 70], [0, 1, 1, 0], zacht) : 0;
              // Zichtbaarheid: kabinet vol, de rest 20%
              // Bij verkiezingen eerst de grootste fractie uitlichten als de zetels geland zijn (frame 62 tot 104), daarna het demissionaire kabinet
              const winnaar = mo.grootste === f ? interpolate(lokaal, [62, 70, 96, 104], [0, 1, 1, 0], zacht) : 0;
              const kabZicht = verk ? interpolate(lokaal, [102, 114], [0, 1], zacht) : 1;
              const op = weg ? 1 - t : winnaar > 0 ? 0.3 + 0.7 * winnaar : inKab ? (wasKab && !verk ? 1 : 0.3 + 0.7 * gloed * kabZicht) : vertrekt ? 1 - 0.7 * val : wasKab ? 1 - 0.7 * gloed : 0.3;
              const actief = inKab || vertrekt || winnaar > 0;
              const r = inKab ? 11.5 : vertrekt ? 11.5 - 2 * val : 9.5;
              const yy = y + val * 46;
              return (
                <g key={key}>
                  {inKab && <circle cx={x} cy={yy} r={r + 7} fill={K.goud} opacity={0.35 * (wasKab && !verk ? 1 : gloed * kabZicht)} filter="url(#gloed)" />}
                  {(vertrekt || winnaar > 0) && <circle cx={x} cy={yy} r={r + 9} fill={K.koper} opacity={0.6 * Math.max(nadruk, winnaar)} filter="url(#gloed)" />}
                  {/* Wie niet in beeld hoort: ontkleurd grijs (review: de tint maakte er een rommelige tweede laag van) */}
                  <circle cx={x} cy={yy} r={r} fill={actief ? kleur : "#4a5578"} opacity={op} stroke={inKab ? K.goud : vertrekt || winnaar > 0 ? K.koper : "none"}
                    strokeWidth={inKab ? 5 * (verk ? kabZicht : 1) : vertrekt ? 4 * (1 - val) : winnaar > 0 ? 4 : 0} />
                </g>
              );
            })}
          </svg>
        </Camera>

        {/* Kop van het moment */}
        <div style={{ position: "absolute", top: VEILIG.boven + 30, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", gap: 18 }}>
          <div><Banner key={`b${i}`} bij={start + 2} tot={start + PER}>{datumTekst(mo.datum)}</Banner></div>
          <Woorden key={`k${i}`} tekst={mo.kop} bij={start + 6} tot={start + PER} grootte={mo.soort === "verkiezing" ? 120 : 96} />
          <Woorden key={`s${i}`} tekst={mo.sub} bij={start + 20} tot={start + PER} grootte={42} zwaar={false} kleur={K.zacht} />
        </div>
        {mo.soort === "verkiezing" && (
          <div style={{ position: "absolute", top: 1040, left: 0, right: 0, textAlign: "center", opacity: interpolate(lokaal, [18, 24, 50, 60], [0, 1, 1, 0], zacht) }}>
            <Stempel bij={start + 18} tekst="Nieuwe Kamer" grootte={64} />
          </div>
        )}

        {/* Balk tegen 76 */}
        <div style={{ position: "absolute", top: BY - 150, left: BX, right: BX }}>
          <div style={{ fontFamily: ZWAAR, fontWeight: 800, fontSize: 130, color: kabZetels >= 76 ? K.goud : K.tekst, lineHeight: 1 }}>
            <Sprong key={`z${i}`} van={kabVorig} naar={kabZetels} bij={start + balkBij} />
            <span style={{ fontFamily: LETTER.sans, fontWeight: 400, fontSize: 34, color: K.zacht, marginLeft: 16 }}>zetels voor kabinet-{mo.kabNaam}{verk ? " (demissionair)" : ""}</span>
          </div>
        </div>
        <svg width={1080} height={200} style={{ position: "absolute", top: BY, left: 0 }}>
          <rect x={BX} y={10} width={BB} height={36} rx={6} fill={K.nacht800} stroke={K.lijn} />
          <rect x={BX} y={10} width={Math.max(0, (BB * balk) / 150)} height={36} rx={6} fill={balk >= 76 ? K.goud : K.koper} />
          <line x1={BX + (BB * 76) / 150} x2={BX + (BB * 76) / 150} y1={-6} y2={62} stroke={K.tekst} strokeWidth={3} />
          <text x={BX + (BB * 76) / 150} y={96} textAnchor="middle" fontFamily={LETTER.mono} fontSize={28} fill={K.tekst}>76</text>
          <text x={BX} y={96} textAnchor="start" fontFamily={ZWAAR} fontWeight={800} fontSize={30} fill={Math.round(balk) >= 76 ? K.goud : K.koper}>
            {Math.round(balk) >= 76 ? "MEERDERHEID" : `${76 - Math.round(balk)} TEKORT`}
          </text>
        </svg>
      </AbsoluteFill>

      {/* Geluid en flitsen per moment */}
      {M.map((x, k) => {
        const s = HAAK + k * PER;
        return (
          <span key={k}>
            <Geluid bij={s} naam="swoosh" volume={0.6} />
            {x.soort === "verkiezing" && <><Geluid bij={s - 26} naam="stijg" volume={0.5} /><Geluid bij={s} naam="plof" /><Flits bij={s} kleur={K.tekst} sterkte={0.35} /></>}
            {x.soort === "uit" && <><Geluid bij={s + 12} naam="tik" volume={0.7} /><Geluid bij={s + 48} naam="daal" volume={0.8} /></>}
            {x.soort === "kabinet" && <Geluid bij={s + 10} naam="dreun" volume={0.6} />}
            {x.soort === "nu" && <Geluid bij={s + 14} naam="toon" volume={0.6} />}
            <Geluid bij={s + 40} naam="tik" volume={0.6} />
          </span>
        );
      })}
      <Merk />
      {frame >= DUUR_TIJDLIJN - EIND && <Eind van={DUUR_TIJDLIJN - EIND} bron="kabinetten, verkiezingen en zetels sinds 2022" />}
      <Geluid bij={DUUR_TIJDLIJN - EIND} naam="swoosh" volume={0.5} />
    </AbsoluteFill>
  );
}

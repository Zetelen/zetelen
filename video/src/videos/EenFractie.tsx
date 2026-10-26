// Variant "Eén fractie van dichtbij" (versie 2, flitsend; feedback Niels 26 oktober: mooier, en de laatste tekst
// leesbaar). Eerst de hele zaal, dan zoomt de camera in op één fractie. Elke stip is een Kamerlid; wie anders stemt
// dan de rest, schuift met een klap naar de andere kant. Ook vergissingen (volgens de bron) en wie niet meedeed.
// De uitleg staat op een vast paneel. Voor stemmingen waarin een fractie verdeeld stemt (ritueel slachten, motie over
// het asielplan). Geen namen: alleen de fractie (besluit Niels, 26 oktober 2026).
import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { type Besluit, casus, naam, perFractie, tintenVan, totalen, uitslagWoord, vergissingen, verdeeld, zaalPunten } from "../gegevens";
import { Camera, Flits, Geluid, type Shot, Stempel, Woorden, ZWAAR } from "../flits";
import { Achtergrond, Eind, Merk, zacht } from "../onderdelen";
import { K, LETTER, VEILIG } from "../stijl";
import { MetTitel, TITEL } from "../titel";

// Momenten, gerekend vanaf het einde van de titel: zaal, per uitgelichte fractie een scène, uitslag, eindkaart
const ZAAL = 170, PER = 250, UITSLAG = 130, EIND = 150;
const LOS = 100; // binnen een scène: het moment dat wie anders stemt, wegschuift

// Welke fracties lichten we uit: eerst die met een vergissing, dan de verdeelde, de grootste eerst; hooguit twee
function uitgelicht(b: Besluit): string[] {
  const ver = vergissingen(b).map((v) => v.fractie);
  const vd = verdeeld(b.stemmen).sort((a, x) => x.voor + x.tegen - (a.voor + a.tegen)).map((f) => f.fractie);
  const pf = perFractie(b.stemmen).filter((f) => f.niet > 0 && !vd.includes(f.fractie)).sort((a, x) => x.niet - a.niet).map((f) => f.fractie);
  return [...new Set([...ver, ...vd, ...pf])].slice(0, 2);
}
const lijstVan = (slug: string) => uitgelicht(casus(slug).besluiten.at(-1)!);
const eindVan = (slug: string) => ZAAL + lijstVan(slug).length * PER + UITSLAG;
export const duurEenFractie = (slug: string) => TITEL + eindVan(slug) + EIND;

export function EenFractie({ slug }: { slug: string }) {
  return <MetTitel slug={slug}><Verloop slug={slug} /></MetTitel>;
}

// Leesbare tekst: op een vast, donker paneel met een rand in de kleur van de fractie
function Paneel({ van, tot, kleur, children }: { van: number; tot: number; kleur: string; children: ReactNode }) {
  const frame = useCurrentFrame();
  if (frame < van || frame >= tot) return null;
  const o = interpolate(frame, [van, van + 10, tot - 8, tot], [0, 1, 1, 0], zacht);
  return (
    <div style={{ position: "absolute", left: VEILIG.zij - 8, right: VEILIG.zij - 8, bottom: VEILIG.onder + 10, padding: "28px 32px", borderRadius: 18,
      background: K.nacht800, borderLeft: `10px solid ${kleur}`, boxShadow: "0 18px 50px rgba(0,0,0,0.55)", opacity: o,
      transform: `translateY(${(1 - o) * 30}px)` }}>
      {children}
    </div>
  );
}

function Verloop({ slug }: { slug: string }) {
  const frame = useCurrentFrame();
  const c = casus(slug);
  const b = c.besluiten.at(-1)!;
  const t = totalen(b);
  const tint = tintenVan(b.stemmen);
  const zaal = zaalPunten(b.stemmen, 1180, 1.0);
  const lijst = lijstVan(slug);
  const pf = new Map(perFractie(b.stemmen).map((f) => [f.fractie, f]));
  const ver = vergissingen(b);
  const E = eindVan(slug);
  const UIT = ZAAL + lijst.length * PER;

  const scene = Math.floor((frame - ZAAL) / PER);
  const fractie = frame >= ZAAL && scene < lijst.length ? lijst[scene] : null;
  const start = ZAAL + scene * PER;

  // Camera: per scène inzoomen op het midden van de fractie in de zaal, en weer terug (540, 960 is het beeld zonder zoom)
  const shots: Shot[] = [{ f: 0, zoom: 1, x: 540, y: 960 }, { f: ZAAL - 10, zoom: 1, x: 540, y: 960 }];
  lijst.forEach((fr, i) => {
    const pts = zaal.filter((p) => p.fractie === fr);
    const x = pts.reduce((s, p) => s + p.x, 0) / Math.max(1, pts.length), y = pts.reduce((s, p) => s + p.y, 0) / Math.max(1, pts.length);
    const s0 = ZAAL + i * PER;
    // De terugzoom van de vorige scène eindigt op s0; sleutelbeelden moeten oplopen
    if (i === 0) shots.push({ f: s0, zoom: 1, x: 540, y: 960 });
    shots.push({ f: s0 + 34, zoom: 2.6, x, y }, { f: s0 + PER - 12, zoom: 2.6, x, y }, { f: s0 + PER, zoom: 1, x: 540, y: 960 });
  });
  // Zaal zichtbaar, behalve terwijl het grote raster van een fractie in beeld is
  const zaalZicht = fractie ? interpolate(frame, [start + 30, start + 46, start + PER - 16, start + PER], [1, 0, 0, 1], zacht) : 1;

  // Groot raster van de gekozen fractie: meerderheid links, wie anders stemt schuift naar rechts
  const groot = (() => {
    if (!fractie) return null;
    const f = pf.get(fractie)!;
    const meer = f.voor >= f.tegen ? "Voor" : "Tegen";
    const min = meer === "Voor" ? "Tegen" : "Voor";
    const leden = [
      ...Array.from({ length: meer === "Voor" ? f.voor : f.tegen }, () => meer),
      ...Array.from({ length: meer === "Voor" ? f.tegen : f.voor }, () => min),
      ...Array.from({ length: f.niet }, () => "Niet deelgenomen"),
    ];
    const KOL = 6, STAP = 80, X0 = 110, Y0 = 700;
    const vergissing = ver.find((v) => v.fractie === fractie);
    const los = interpolate(frame, [start + LOS, start + LOS + 22], [0, 1], { ...zacht, easing: (x) => 1 - (1 - x) ** 3 });
    let iMin = 0, iNiet = 0;
    const stippen = leden.map((stem, i) => {
      const thuis = { x: X0 + (i % KOL) * STAP, y: Y0 + Math.floor(i / KOL) * STAP };
      let doel = thuis;
      if (stem === min) { doel = { x: 880 + (iMin % 2) * STAP, y: Y0 + Math.floor(iMin / 2) * STAP }; iMin++; }
      else if (stem === "Niet deelgenomen") { doel = { x: 880 + (iNiet % 2) * STAP, y: Y0 + 400 + Math.floor(iNiet / 2) * STAP }; iNiet++; }
      return { stem, x: thuis.x + (doel.x - thuis.x) * los, y: thuis.y + (doel.y - thuis.y) * los, beweegt: stem !== meer };
    });
    const zin = [
      `${f.voor} voor, ${f.tegen} tegen${f.niet ? `, ${f.niet} niet mee` : ""}.`,
      vergissing ? `De ${vergissing.aantal === 1 ? "stem" : `${vergissing.aantal} stemmen`} ${vergissing.stem.toLowerCase()} ${vergissing.aantal === 1 ? "was" : "waren"} volgens de bron een vergissing. Telt wel mee: een uitslag ligt vast.` : "",
      f.voor > 0 && f.tegen > 0 && !vergissing ? "Bij een hoofdelijke stemming zie je dat. Bij handopsteken telt de fractie als één stem." : "",
    ].filter(Boolean).join(" ");
    const stempel = vergissing ? "Vergissing" : f.voor > 0 && f.tegen > 0 ? "Verdeeld" : "Niet iedereen stemde";
    return { stippen, zin, stempel, kleur: tint.get(fractie) ?? K.lijnLicht, kop: `${f.voor + f.tegen + f.niet} Kamerleden van ${naam(fractie)}` };
  })();

  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950 }}>
      <Achtergrond binnenhof={0.05} />
      <Merk />

      {/* Zaal, met camera */}
      <AbsoluteFill style={{ opacity: interpolate(frame, [0, 12, UIT + UITSLAG - 10, UIT + UITSLAG], [0, 1, 1, 0], zacht) * zaalZicht }}>
        <Camera shots={shots}>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            {zaal.map((p, i) => {
              const sk = p.stem === "Voor" ? K.voor : p.stem === "Tegen" ? K.tegen : K.niet;
              const opvallend = lijst.includes(p.fractie) && frame > 110;
              const op = interpolate(frame, [4 + i * 0.25, 12 + i * 0.25], [0, 1], zacht);
              return <circle key={p.key} cx={p.x} cy={p.y} r={9} fill={frame > 60 ? sk : tint.get(p.fractie) ?? K.lijnLicht}
                stroke={opvallend ? K.goud : K.nacht950} strokeWidth={opvallend ? 3 : 1.5} opacity={op} />;
            })}
          </svg>
        </Camera>
      </AbsoluteFill>

      {/* Zaal: tekst bovenin */}
      {frame < ZAAL && (
        <div style={{ position: "absolute", top: VEILIG.boven + 40, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", gap: 26,
          opacity: interpolate(frame, [ZAAL - 10, ZAAL], [1, 0], zacht) }}>
          <Woorden tekst={`${t.voor} voor, ${t.tegen} tegen.`} bij={10} grootte={100} />
          <Woorden tekst="Fracties stemmen meestal als één blok." bij={60} grootte={50} zwaar={false} />
          <Woorden tekst="Maar niet allemaal." bij={100} grootte={72} kleur={K.koper} />
        </div>
      )}
      <Geluid bij={60} naam="swoosh" volume={0.5} />
      <Geluid bij={100} naam="tik" volume={0.8} />

      {/* Scène per fractie */}
      {groot && (
        <>
          <div style={{ position: "absolute", top: VEILIG.boven + 40, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", gap: 20,
            opacity: interpolate(frame, [start + PER - 12, start + PER], [1, 0], zacht) }}>
            <Woorden tekst={groot.kop} bij={start + 40} grootte={76} />
            <div style={{ fontFamily: LETTER.sans, fontSize: 32, color: K.zacht, opacity: interpolate(frame, [start + 56, start + 66], [0, 1], zacht) }}>
              <span style={{ color: K.voor }}>● voor</span>{"   "}<span style={{ color: K.tegen }}>● tegen</span>{"   "}<span>● niet mee</span>
            </div>
          </div>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            {groot.stippen.map((s, i) => (
              <circle key={`${fractie}-${i}`} cx={s.x} cy={s.y} r={31}
                fill={s.stem === "Voor" ? K.voor : s.stem === "Tegen" ? K.tegen : K.niet}
                stroke={s.beweegt && frame >= start + LOS ? K.goud : groot.kleur} strokeWidth={s.beweegt && frame >= start + LOS ? 6 : 4}
                opacity={interpolate(frame, [start + 36 + i * 0.6, start + 48 + i * 0.6, start + PER - 12, start + PER], [0, 1, 1, 0], zacht)} />
            ))}
          </svg>
          {frame >= start + LOS + 10 && frame < start + PER - 8 && (
            <div style={{ position: "absolute", top: 1110, left: VEILIG.zij }}>
              <Stempel bij={start + LOS + 10} tekst={groot.stempel} grootte={60} />
            </div>
          )}
          <Paneel van={start + LOS + 40} tot={start + PER} kleur={groot.kleur}>
            <div style={{ fontFamily: ZWAAR, fontWeight: 800, fontSize: 40, color: K.tekst, marginBottom: 10 }}>{naam(fractie!)}</div>
            <div style={{ fontFamily: LETTER.sans, fontSize: 38, lineHeight: 1.35, color: K.tekst }}>{groot.zin}</div>
          </Paneel>
        </>
      )}
      {lijst.map((_, i) => {
        const s0 = ZAAL + i * PER;
        return (
          <span key={i}>
            <Geluid bij={s0 + 4} naam="stijg" volume={0.5} />
            <Geluid bij={s0 + LOS} naam="plof" />
            <Geluid bij={s0 + LOS + 10} naam="dreun" volume={0.7} />
            <Flits bij={s0 + LOS + 10} sterkte={0.3} />
          </span>
        );
      })}

      {/* Uitslag */}
      {frame >= UIT && frame < E && (
        <div style={{ position: "absolute", top: VEILIG.boven + 40, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", gap: 20,
          opacity: interpolate(frame, [E - 10, E], [1, 0], zacht) }}>
          <Woorden tekst={`${uitslagWoord(b)}:`} bij={UIT + 6} grootte={110} kleur={K.koper} />
          <Woorden tekst={`${t.voor} tegen ${t.tegen}.`} bij={UIT + 16} grootte={110} />
        </div>
      )}
      <Geluid bij={UIT + 6} naam="toon" volume={0.6} />

      {frame >= E && <Eind van={E} bron={`zaak ${c.zaak}`} />}
      <Geluid bij={E} naam="swoosh" volume={0.5} />
    </AbsoluteFill>
  );
}

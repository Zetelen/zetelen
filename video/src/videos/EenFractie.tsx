// Variant "Eén fractie van dichtbij" (32 s): eerst de hele zaal, dan inzoomen op één fractie. Elke stip is een
// Kamerlid; wie anders stemt dan de rest, schuift naar de andere kant. Ook vergissingen (volgens de bron) en wie niet
// meedeed. Voor stemmingen waarin een fractie verdeeld stemt (ritueel slachten, motie over het asielplan).
// Geen namen: alleen de fractie (besluit Niels, 26 oktober 2026).
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { type Besluit, casus, datumTekst, naam, perFractie, tintenVan, totalen, uitslagWoord, vergissingen, verdeeld, zaalPunten } from "../gegevens";
import { Achtergrond, Blok, Eind, Kop, Label, Merk, Tekst, zacht } from "../onderdelen";
import { K } from "../stijl";

export const DUUR_EEN_FRACTIE = 1080;
const ZAAL = [150, 300], PER = 210; // per uitgelichte fractie 7 seconden

// Welke fracties lichten we uit: eerst die met een vergissing, dan de verdeelde, de grootste eerst; hooguit twee
function uitgelicht(b: Besluit): string[] {
  const ver = vergissingen(b).map((v) => v.fractie);
  const vd = verdeeld(b.stemmen).sort((a, x) => x.voor + x.tegen - (a.voor + a.tegen)).map((f) => f.fractie);
  const pf = perFractie(b.stemmen).filter((f) => f.niet > 0 && !vd.includes(f.fractie)).sort((a, x) => x.niet - a.niet).map((f) => f.fractie);
  return [...new Set([...ver, ...vd, ...pf])].slice(0, 2);
}

export function EenFractie({ slug }: { slug: string }) {
  const frame = useCurrentFrame();
  const c = casus(slug);
  const b = c.besluiten[c.besluiten.length - 1];
  const t = totalen(b);
  const tint = tintenVan(b.stemmen);
  const zaal = zaalPunten(b.stemmen, 1080, 1.0);
  const lijst = uitgelicht(b);
  const pf = new Map(perFractie(b.stemmen).map((f) => [f.fractie, f]));
  const ver = vergissingen(b);

  const scene = Math.floor((frame - ZAAL[1]) / PER);
  const fractie = frame >= ZAAL[1] && scene < lijst.length ? lijst[scene] : null;
  const sceneStart = ZAAL[1] + scene * PER;
  const zaalZicht = fractie ? interpolate(frame, [sceneStart, sceneStart + 20], [1, 0.12], zacht) : 1;

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
    const KOL = 6, STAP = 76, X0 = 110, Y0 = 820;
    const vergissing = ver.find((v) => v.fractie === fractie);
    const los = interpolate(frame, [sceneStart + 70, sceneStart + 110], [0, 1], { ...zacht, easing: (x) => 1 - (1 - x) ** 3 });
    let iMeer = 0, iMin = 0, iNiet = 0;
    const stippen = leden.map((stem, i) => {
      const thuis = { x: X0 + (i % KOL) * STAP, y: Y0 + Math.floor(i / KOL) * STAP };
      let doel = thuis;
      if (stem === min) { doel = { x: 880 + (iMin % 2) * STAP, y: Y0 + Math.floor(iMin / 2) * STAP }; iMin++; }
      else if (stem === "Niet deelgenomen") { doel = { x: 880 + (iNiet % 2) * STAP, y: Y0 + 420 + Math.floor(iNiet / 2) * STAP }; iNiet++; }
      else iMeer++;
      return { stem, x: thuis.x + (doel.x - thuis.x) * los, y: thuis.y + (doel.y - thuis.y) * los };
    });
    const zin = [
      `${naam(fractie)}: ${f.voor} voor, ${f.tegen} tegen${f.niet ? `, ${f.niet} niet mee` : ""}.`,
      vergissing ? `De ${vergissing.aantal === 1 ? "stem" : `${vergissing.aantal} stemmen`} ${vergissing.stem.toLowerCase()} ${vergissing.aantal === 1 ? "was" : "waren"} volgens de bron een vergissing. Telt wel mee: een uitslag ligt vast.` : "",
      f.voor > 0 && f.tegen > 0 && !vergissing ? "Bij een hoofdelijke stemming zie je dat. Bij handopsteken telt de fractie als één stem." : "",
    ].filter(Boolean).join(" ");
    return { stippen, meer, min, zin, kleur: tint.get(fractie) ?? K.lijnLicht, kop: `${f.voor + f.tegen + f.niet} Kamerleden van ${naam(fractie)}` };
  })();

  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950 }}>
      <Achtergrond binnenhof={interpolate(frame, [0, 140, 170], [0.45, 0.45, 0.06], zacht)} />
      <Merk />
      <Blok van={0} tot={ZAAL[0] + 10}>
        <Label>Eén stemming · {datumTekst(b.datum)}</Label>
        <Kop>{c.vraag}</Kop>
        <Tekst grootte={40} style={{ color: K.zacht, opacity: interpolate(frame, [50, 70], [0, 1], zacht) }}>{c.omschrijving}</Tekst>
      </Blok>
      <Blok van={ZAAL[0]} tot={ZAAL[1]}>
        <Kop grootte={70}>{t.voor} voor, {t.tegen} tegen.</Kop>
        <Tekst grootte={42}>Fracties stemmen meestal als één blok. Maar niet allemaal.</Tekst>
      </Blok>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: interpolate(frame, [ZAAL[0], ZAAL[0] + 20, 960, 980], [0, 1, 1, 0], zacht) }}>
        {zaal.map((p) => {
          const sk = p.stem === "Voor" ? K.voor : p.stem === "Tegen" ? K.tegen : K.niet;
          const opvallend = lijst.includes(p.fractie);
          return <circle key={p.key} cx={p.x} cy={p.y} r={9} fill={frame > ZAAL[0] + 60 ? sk : tint.get(p.fractie) ?? K.lijnLicht}
            stroke={opvallend && frame > ZAAL[0] + 90 ? K.tekst : K.nacht950} strokeWidth={opvallend && frame > ZAAL[0] + 90 ? 2.5 : 1.5} opacity={zaalZicht} />;
        })}
        {groot && groot.stippen.map((s, i) => (
          <circle key={`${fractie}-${i}`} cx={s.x} cy={s.y} r={30}
            fill={s.stem === "Voor" ? K.voor : s.stem === "Tegen" ? K.tegen : K.niet} stroke={groot.kleur} strokeWidth={4}
            opacity={interpolate(frame, [sceneStart + 15 + i * 0.8, sceneStart + 30 + i * 0.8], [0, 1], zacht)} />
        ))}
      </svg>

      {groot && (
        <>
          <Blok van={sceneStart} tot={sceneStart + PER}>
            <Label>Van dichtbij</Label>
            <Kop grootte={66}>{groot.kop}</Kop>
            <Tekst grootte={30} style={{ color: K.zacht }}><span style={{ color: K.voor }}>● voor</span>{"   "}<span style={{ color: K.tegen }}>● tegen</span>{"   "}<span style={{ color: K.zacht }}>● niet mee</span></Tekst>
          </Blok>
          <Blok van={sceneStart + 110} tot={sceneStart + PER} top={1470}>
            <Tekst grootte={38}>{groot.zin}</Tekst>
          </Blok>
        </>
      )}
      <Blok van={ZAAL[1] + lijst.length * PER} tot={980} top={760}>
        <Label>Uitslag</Label>
        <Kop grootte={110}>{uitslagWoord(b)}</Kop>
        <Kop grootte={80} style={{ color: K.koper }}>{t.voor} tegen {t.tegen}</Kop>
      </Blok>
      {frame >= 960 && <Eind van={960} bron={`zaak ${c.zaak}`} />}
    </AbsoluteFill>
  );
}

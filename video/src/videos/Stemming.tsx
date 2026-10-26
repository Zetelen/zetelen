// Vast format "De stemming" (versie 2, flitsend; akkoord Niels 26 oktober). Voor elke stemming te gebruiken, ook voor
// nieuwe uit de pipeline. Na de titel: de zaal van 150, de zaal valt uiteen in voor en tegen, wie stemde wat, het
// bijzondere moment, de uitslag en de eindkaart. Alles komt uit de gegevens; alleen de titel, de vraag en de
// omschrijving zijn met de hand.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { type Besluit, casus, kabinetOp, lijstTekst, naam, perFractie, tintenVan, totalen, uitslagWoord, vergissingen, verdeeld, zaalPunten } from "../gegevens";
import { Banner, Flits, Geluid, Woorden, ZWAAR } from "../flits";
import { Achtergrond, Eind, Merk, Teller, zacht } from "../onderdelen";
import { K, VEILIG } from "../stijl";
import { MetTitel, TITEL } from "../titel";

// Momenten, gerekend vanaf het einde van de titel
const SPLIT = 130, OPVAL = 340, UITSLAG = 530, EINDE = 650, EIND = 150;
export const DUUR_STEMMING = TITEL + EINDE + EIND;

// Plek in het raster: voor links, tegen rechts, per fractie bij elkaar (grootste eerst); niet deelgenomen eronder
function raster(b: Besluit) {
  const pf = perFractie(b.stemmen);
  const plek = new Map<string, { x: number; y: number }>();
  const KOLOM = 13, STAP = 34, BOVEN = 820;
  const vul = (stem: "Voor" | "Tegen", x0: number) => {
    let i = 0;
    for (const f of [...pf].sort((a, c) => (stem === "Voor" ? c.voor - a.voor : c.tegen - a.tegen))) {
      const n = stem === "Voor" ? f.voor : f.tegen;
      for (let k = 0; k < n; k++, i++) plek.set(`${stem}|${f.fractie}|${k}`, { x: x0 + (i % KOLOM) * STAP, y: BOVEN + Math.floor(i / KOLOM) * STAP });
    }
    return Math.ceil(i / KOLOM);
  };
  const rijen = Math.max(vul("Voor", VEILIG.zij + 14), vul("Tegen", 540 + 30));
  let j = 0;
  for (const f of pf) for (let k = 0; k < f.niet; k++, j++) plek.set(`Niet deelgenomen|${f.fractie}|${k}`, { x: VEILIG.zij + 14 + (j % 26) * STAP, y: BOVEN + (rijen + 1) * STAP + Math.floor(j / 26) * STAP });
  return plek;
}

// Het bijzondere moment, uit de gegevens: verdeelde fracties, vergissingen, krapte, een kabinet dat verliest
function bijzonder(b: Besluit): { tekst: string; nadruk: Set<string> } {
  const t = totalen(b);
  const delen: string[] = [];
  const nadruk = new Set<string>();
  const ver = vergissingen(b);
  for (const v of ver) { delen.push(`Eén ${naam(v.fractie)}-Kamerlid stemde ${v.stem.toLowerCase()}. Volgens de bron was dat een vergissing; de stem telt wel mee.`); nadruk.add(v.fractie); }
  const vd = verdeeld(b.stemmen).filter((f) => !ver.some((v) => v.fractie === f.fractie));
  if (vd.length) { delen.push(`Niet elke fractie stemt als één blok: ${lijstTekst(vd.map((f) => `${naam(f.fractie)} ${f.voor} voor en ${f.tegen} tegen`))}.`); vd.forEach((f) => nadruk.add(f.fractie)); }
  const verschil = Math.abs(t.voor - t.tegen);
  if (verschil <= 4) delen.push(verschil === 0 ? "Precies gelijk." : `${verschil} ${verschil === 1 ? "stem" : "stemmen"} verschil.`);
  // Het kabinet: stemmen de kabinetsfracties samen, en wint hun kant?
  const kab = kabinetOp(b.datum);
  if (kab) {
    const kant = perFractie(b.stemmen).filter((f) => kab.leden.includes(f.fractie));
    const allemaal = kant.length > 0 && kant.every((f) => f.kant === kant[0].kant);
    if (allemaal) {
      const wint = (kant[0].kant === "Voor") === t.voor > t.tegen;
      delen.push(`Kabinet-${kab.naam} (${lijstTekst(kant.map((f) => naam(f.fractie)))}) staat aan de kant van ${kant[0].kant.toLowerCase()}, en ${wint ? "wint" : "verliest"}.`);
      if (!nadruk.size) kant.forEach((f) => nadruk.add(f.fractie));
    }
  }
  return { tekst: delen.join(" ") || "Een gewone stemming: zo gaat het meestal.", nadruk };
}

export function Stemming({ slug }: { slug: string }) {
  return <MetTitel slug={slug}><Verloop slug={slug} /></MetTitel>;
}

function Verloop({ slug }: { slug: string }) {
  const frame = useCurrentFrame();
  const c = casus(slug);
  const b = c.besluiten.at(-1)!;
  const t = totalen(b);
  const tint = tintenVan(b.stemmen);
  const zaal = zaalPunten(b.stemmen, 1260);
  const plek = raster(b);
  const bijz = bijzonder(b);
  const pf = perFractie(b.stemmen);
  const top = (stem: "Voor" | "Tegen") => [...pf].filter((f) => (stem === "Voor" ? f.voor : f.tegen) > 0).sort((a, x) => (stem === "Voor" ? x.voor - a.voor : x.tegen - a.tegen));
  const kort = (l: typeof pf) => {
    const namen = [...new Set(l.map((f) => naam(f.fractie)))];
    return namen.length > 4 ? `${namen.slice(0, 3).join(", ")} en ${namen.length - 3} andere` : lijstTekst(namen);
  };

  // Volgnummer per fractie en stem, om elke zaalstip aan een rasterplek te koppelen
  const teller = new Map<string, number>();
  const stippen = zaal.map((p, i) => {
    const sl = `${p.stem}|${p.fractie}`;
    const k = teller.get(sl) ?? 0;
    teller.set(sl, k + 1);
    const doel = plek.get(`${sl}|${k}`) ?? { x: p.x, y: p.y };
    const verschijn = interpolate(frame, [30 + i * 0.4, 40 + i * 0.4], [0, 1], zacht);
    const beweeg = interpolate(frame, [SPLIT + (i % 30), SPLIT + 26 + (i % 30)], [0, 1], { ...zacht, easing: (x) => 1 - (1 - x) ** 3 });
    const nadruk = frame >= OPVAL && frame < UITSLAG ? (bijz.nadruk.size === 0 || bijz.nadruk.has(p.fractie) ? 1 : 0.2) : 1;
    return { ...p, cx: p.x + (doel.x - p.x) * beweeg, cy: p.y + (doel.y - p.y) * beweeg, op: verschijn * nadruk, kleur: tint.get(p.fractie) ?? K.lijnLicht,
      gloed: frame >= OPVAL && frame < UITSLAG && bijz.nadruk.has(p.fractie) };
  });
  const stand = interpolate(frame, [SPLIT, SPLIT + 10, UITSLAG - 10, UITSLAG], [0, 1, 1, 0], zacht);
  const uitslag = uitslagWoord(b);
  const tekstVlak = { position: "absolute" as const, top: 450, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column" as const, gap: 26, alignItems: "flex-start" as const };

  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950 }}>
      <Achtergrond binnenhof={0.06} />
      <Merk />

      {/* Opening: waar het over ging, en de zaal */}
      {frame < SPLIT && (
        <div style={{ ...tekstVlak, top: VEILIG.boven + 40, opacity: interpolate(frame, [SPLIT - 10, SPLIT], [1, 0], zacht) }}>
          <Woorden tekst={c.omschrijving} bij={4} grootte={44} zwaar={false} />
          <Woorden tekst="150 Kamerleden." bij={50} grootte={90} kleur={K.koper} />
        </div>
      )}
      <Geluid bij={50} naam="stijg" volume={0.4} />

      {/* Stand: voor en tegen, met de grootste fracties eronder */}
      <div style={{ position: "absolute", top: VEILIG.boven + 10, left: VEILIG.zij, right: VEILIG.zij, display: "flex", justifyContent: "space-between", opacity: stand }}>
        {(["voor", "tegen"] as const).map((k) => (
          <div key={k} style={{ textAlign: k === "voor" ? "left" : "right" }}>
            <div style={{ fontFamily: ZWAAR, fontWeight: 800, fontSize: 150, lineHeight: 0.95, color: k === "voor" ? K.voor : K.tegen }}>
              <Teller waarde={k === "voor" ? t.voor : t.tegen} van={SPLIT + 4} duur={36} />
            </div>
            <div style={{ fontFamily: ZWAAR, fontWeight: 800, fontSize: 32, letterSpacing: "0.12em", color: K.zacht }}>{k.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <Geluid bij={SPLIT} naam="swoosh" volume={0.7} />
      {frame >= SPLIT + 60 && frame < OPVAL && (
        <div style={{ ...tekstVlak, opacity: interpolate(frame, [OPVAL - 10, OPVAL], [1, 0], zacht) }}>
          <Woorden tekst={`Voor: ${kort(top("Voor"))}.`} bij={SPLIT + 60} grootte={42} zwaar={false} kleur={K.voor} />
          <Woorden tekst={`Tegen: ${kort(top("Tegen"))}.`} bij={SPLIT + 76} grootte={42} zwaar={false} kleur={K.tegen} />
        </div>
      )}

      {/* Wat valt op */}
      {frame >= OPVAL && frame < UITSLAG && (
        <div style={{ ...tekstVlak, opacity: interpolate(frame, [UITSLAG - 10, UITSLAG], [1, 0], zacht) }}>
          <Banner bij={OPVAL + 2}>Wat valt op</Banner>
          <Woorden tekst={bijz.tekst} bij={OPVAL + 16} grootte={46} zwaar={false} />
        </div>
      )}
      <Flits bij={OPVAL + 2} sterkte={0.3} />
      <Geluid bij={OPVAL + 2} naam="dreun" volume={0.8} />

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: interpolate(frame, [UITSLAG, UITSLAG + 14, EINDE - 10, EINDE], [1, 0.15, 0.15, 0], zacht) }}>
        {stippen.map((s) => (
          <circle key={s.key} cx={s.cx} cy={s.cy} r={9.5 + 4.5 * interpolate(frame, [SPLIT, SPLIT + 50], [0, 1], zacht)} fill={s.kleur}
            stroke={s.gloed ? K.goud : K.nacht950} strokeWidth={s.gloed ? 3.5 : 1.5} opacity={s.op} />
        ))}
      </svg>
      {Array.from({ length: 6 }, (_, k) => <Geluid key={k} bij={30 + k * 9} naam="tik" volume={0.4} />)}

      {/* Uitslag */}
      {frame >= UITSLAG && frame < EINDE && (
        <div style={{ ...tekstVlak, top: 700, opacity: interpolate(frame, [EINDE - 10, EINDE], [1, 0], zacht) }}>
          <Woorden tekst={uitslag} bij={UITSLAG + 6} grootte={140} />
          <Woorden tekst={`${t.voor} tegen ${t.tegen}`} bij={UITSLAG + 18} grootte={110} kleur={K.koper} />
        </div>
      )}
      <Geluid bij={UITSLAG + 6} naam="dreun" />
      <Geluid bij={UITSLAG + 18} naam="toon" volume={0.5} />

      {frame >= EINDE && <Eind van={EINDE} bron={`zaak ${c.zaak}`} />}
      <Geluid bij={EINDE} naam="swoosh" volume={0.5} />
    </AbsoluteFill>
  );
}

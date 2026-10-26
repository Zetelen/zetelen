// Vast format "De stemming" (34 s, 9:16): voor elke stemming te gebruiken, ook voor nieuwe uit de pipeline.
// Vraag als haak, de zaal van 150, de zaal valt uiteen in voor en tegen, wie stemde wat, het bijzondere moment,
// de uitslag en de eindkaart. Alles komt uit de gegevens; alleen de vraag en de omschrijving zijn met de hand.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { type Besluit, casus, datumTekst, kabinetOp, lijstTekst, naam, perFractie, tintenVan, totalen, uitslagWoord, vergissingen, verdeeld, zaalPunten } from "../gegevens";
import { Achtergrond, Blok, Eind, Kop, Label, Merk, Teller, Tekst, zacht, zichtbaar } from "../onderdelen";
import { K, LETTER, VEILIG } from "../stijl";

export const DUUR_STEMMING = 1020;

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
  const frame = useCurrentFrame();
  const c = casus(slug);
  const b = c.besluiten[c.besluiten.length - 1];
  const t = totalen(b);
  const tint = tintenVan(b.stemmen);
  const zaal = zaalPunten(b.stemmen);
  const plek = raster(b);
  const bijz = bijzonder(b);
  const pf = perFractie(b.stemmen);
  const top = (stem: "Voor" | "Tegen") => [...pf].filter((f) => (stem === "Voor" ? f.voor : f.tegen) > 0).sort((a, x) => (stem === "Voor" ? x.voor - a.voor : x.tegen - a.tegen));
  const kort = (l: typeof pf) => (l.length > 4 ? `${l.slice(0, 3).map((f) => naam(f.fractie)).join(", ")} en ${l.length - 3} andere` : lijstTekst(l.map((f) => naam(f.fractie))));

  // Volgnummer per fractie en stem, om elke zaalstip aan een rasterplek te koppelen
  const teller = new Map<string, number>();
  const stippen = zaal.map((p, i) => {
    const sl = `${p.stem}|${p.fractie}`;
    const k = teller.get(sl) ?? 0;
    teller.set(sl, k + 1);
    const doel = plek.get(`${sl}|${k}`) ?? { x: p.x, y: p.y };
    const verschijn = interpolate(frame, [150 + (i % 60), 165 + (i % 60)], [0, 1], zacht);
    const beweeg = interpolate(frame, [270 + (i % 40), 320 + (i % 40)], [0, 1], { ...zacht, easing: (x) => 1 - (1 - x) ** 3 });
    const nadruk = frame >= 600 && frame < 780 ? (bijz.nadruk.size === 0 || bijz.nadruk.has(p.fractie) ? 1 : 0.25) : 1;
    return { ...p, cx: p.x + (doel.x - p.x) * beweeg, cy: p.y + (doel.y - p.y) * beweeg, op: verschijn * nadruk, kleur: tint.get(p.fractie) ?? K.lijnLicht };
  });
  const tellerZicht = zichtbaar(frame, 300, 600);
  const uitslag = uitslagWoord(b);

  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950 }}>
      <Achtergrond binnenhof={interpolate(frame, [0, 120, 150], [0.45, 0.45, 0.08], zacht)} />
      <Merk />

      <Blok van={0} tot={150}>
        <Label>Eén stemming · {datumTekst(b.datum)}</Label>
        <Kop>{c.vraag}</Kop>
        <Tekst grootte={40} style={{ color: K.zacht, opacity: interpolate(frame, [50, 70], [0, 1], zacht) }}>{c.omschrijving}</Tekst>
      </Blok>

      <Blok van={150} tot={285}>
        <Kop grootte={76}>150 Kamerleden.</Kop>
        <Tekst>Bij deze stemming telt elk Kamerlid apart.</Tekst>
      </Blok>

      <Blok van={285} tot={600}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: LETTER.serif, fontSize: 120, color: K.tekst, opacity: tellerZicht }}>
          <div><Teller waarde={t.voor} van={290} /><div style={{ fontFamily: LETTER.sans, fontSize: 34, color: K.zacht }}>voor</div></div>
          <div style={{ textAlign: "right" }}><Teller waarde={t.tegen} van={290} /><div style={{ fontFamily: LETTER.sans, fontSize: 34, color: K.zacht }}>tegen</div></div>
        </div>
      </Blok>
      <Blok van={430} tot={600} top={1420}>
        <Tekst grootte={38}>Voor: {kort(top("Voor"))}.</Tekst>
        <Tekst grootte={38}>Tegen: {kort(top("Tegen"))}.</Tekst>
      </Blok>

      <Blok van={600} tot={780}>
        <Label>Wat valt op</Label>
        <Tekst grootte={50}>{bijz.tekst}</Tekst>
      </Blok>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: interpolate(frame, [780, 800], [1, 0.15], zacht) }}>
        {stippen.map((s) => <circle key={s.key} cx={s.cx} cy={s.cy} r={9.5 + 4.5 * interpolate(frame, [270, 330], [0, 1], zacht)} fill={s.kleur} stroke={K.nacht950} strokeWidth={1.5} opacity={s.op} />)}
      </svg>

      <Blok van={790} tot={915} top={700}>
        <Label>Uitslag</Label>
        <Kop grootte={140}>{uitslag}</Kop>
        <Kop grootte={96} style={{ color: K.koper }}>{t.voor} tegen {t.tegen}</Kop>
      </Blok>

      {frame >= 900 && <Eind van={900} bron={`zaak ${c.zaak}`} />}
    </AbsoluteFill>
  );
}

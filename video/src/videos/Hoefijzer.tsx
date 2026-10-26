// Variant "Hoefijzer" (32 s): de 150 stemmen op een rij, in de volgorde van de zaal op Zetelen (fracties die vaak
// hetzelfde stemmen staan naast elkaar; gemeten over 2023 tot 2025, geen eigen links-rechtsindeling). Eerst kleurt de
// rij naar fractie, dan naar stem. Dan buigt de rij dicht tot een hoefijzer: de uiteinden raken elkaar.
// Voor stemmingen waarin de uiteinden van de rij samen stemmen (Mercosur, het behandelvoorbehoud).
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { VOLGORDE } from "../../../web/lib/verhaal";
import { casus, datumTekst, naam, perFractie, tintenVan, totalen, uitslagWoord } from "../gegevens";
import { Achtergrond, Blok, Eind, Kop, Label, Merk, Tekst, zacht } from "../onderdelen";
import { K, LETTER } from "../stijl";

export const DUUR_HOEFIJZER = 960;

export function Hoefijzer({ slug }: { slug: string }) {
  const frame = useCurrentFrame();
  const c = casus(slug);
  const b = c.besluiten[c.besluiten.length - 1];
  const t = totalen(b);
  const tint = tintenVan(b.stemmen);
  const rang = (f: string) => { const i = VOLGORDE.indexOf(f); return i < 0 ? VOLGORDE.length : i; };
  const pf = perFractie(b.stemmen).sort((a, x) => rang(a.fractie) - rang(x.fractie));
  // Elke stem een stip: per fractie eerst voor, dan tegen, dan niet deelgenomen
  const stemmen = pf.flatMap((f) => [
    ...Array.from({ length: f.voor }, () => ({ fractie: f.fractie, stem: "Voor" })),
    ...Array.from({ length: f.tegen }, () => ({ fractie: f.fractie, stem: "Tegen" })),
    ...Array.from({ length: f.niet }, () => ({ fractie: f.fractie, stem: "Niet deelgenomen" })),
  ]);
  const n = stemmen.length;
  const buig = interpolate(frame, [480, 600], [0, 1], { ...zacht, easing: (x) => 0.5 - Math.cos(Math.PI * x) / 2 });
  const naarStem = interpolate(frame, [330, 380], [0, 1], zacht);
  // Een band van drie stippen breed: als rij over de breedte, als hoefijzer een boog van 300 graden
  const BAAN = 3, kolommen = Math.ceil(n / BAAN);
  const plek = (i: number) => {
    const u = Math.floor(i / BAAN) / Math.max(1, kolommen - 1), baan = (i % BAAN) - 1;
    const rij = { x: 90 + u * 900, y: 1000 + baan * 19 };
    const hoek = (-150 + u * 300) * (Math.PI / 180), r = 360 + baan * 19;
    const boog = { x: 540 + r * Math.sin(hoek), y: 1040 - r * Math.cos(hoek) };
    return { x: rij.x + (boog.x - rij.x) * buig, y: rij.y + (boog.y - rij.y) * buig };
  };
  const eerste = pf[0], laatste = pf[pf.length - 1];
  const zelfdeKant = eerste && laatste && eerste.kant === laatste.kant;
  const midden = pf.filter((f) => f.kant !== eerste?.kant && f.kant !== "Niet deelgenomen").map((f) => naam(f.fractie));

  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950 }}>
      <Achtergrond binnenhof={interpolate(frame, [0, 140, 170], [0.45, 0.45, 0.06], zacht)} />
      <Merk />
      <Blok van={0} tot={175}>
        <Label>Eén stemming · {datumTekst(b.datum)}</Label>
        <Kop>{c.vraag}</Kop>
        <Tekst grootte={40} style={{ color: K.zacht, opacity: interpolate(frame, [50, 70], [0, 1], zacht) }}>{c.omschrijving}</Tekst>
      </Blok>
      <Blok van={175} tot={330}>
        <Kop grootte={70}>150 stemmen op een rij.</Kop>
        <Tekst grootte={40}>In de volgorde van de zaal op Zetelen: fracties die vaak hetzelfde stemmen, staan naast elkaar. Aan de uiteinden staan fracties die het zelden eens zijn.</Tekst>
      </Blok>
      <Blok van={330} tot={480}>
        <Kop grootte={70}>Wie stemde wat?</Kop>
        <Tekst grootte={44}><span style={{ color: K.voor }}>● voor {t.voor}</span>{"   "}<span style={{ color: K.tegen }}>● tegen {t.tegen}</span></Tekst>
      </Blok>
      <Blok van={480} tot={760}>
        <Kop grootte={70}>Buig de rij.</Kop>
        <Tekst grootte={42}>
          {zelfdeKant
            ? `De uiteinden raken elkaar: ${naam(eerste.fractie)} en ${naam(laatste.fractie)} stemmen allebei ${eerste.kant.toLowerCase()}, net als hun buren. Het midden stemt anders: ${midden.slice(0, 4).join(", ")}${midden.length > 4 ? " en meer" : ""}.`
            : `De uiteinden stemmen hier verschillend: ${naam(eerste.fractie)} ${eerste.kant.toLowerCase()}, ${naam(laatste.fractie)} ${laatste.kant.toLowerCase()}.`}
        </Tekst>
      </Blok>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: interpolate(frame, [175, 200, 820, 840], [0, 1, 1, 0], zacht) }}>
        {stemmen.map((s, i) => {
          const p = plek(i);
          const fk = tint.get(s.fractie) ?? K.lijnLicht;
          const sk = s.stem === "Voor" ? K.voor : s.stem === "Tegen" ? K.tegen : K.niet;
          const verschijn = interpolate(frame, [180 + i * 0.6, 196 + i * 0.6], [0, 1], zacht);
          return <circle key={i} cx={p.x} cy={p.y} r={8} fill={naarStem > 0.5 ? sk : fk} stroke={K.nacht950} strokeWidth={1} opacity={verschijn} />;
        })}
        {[eerste, laatste].filter(Boolean).map((f, j) => {
          const i = j === 0 ? 0 : n - 1;
          const p = plek(i);
          return (
            <text key={f.fractie} x={p.x + (j === 0 ? -6 : 6)} y={p.y + 54} textAnchor={j === 0 ? "start" : "end"} fontFamily={LETTER.sans} fontWeight={600} fontSize={30}
              fill={K.tekst} opacity={interpolate(frame, [200, 220], [0, 1], zacht)}>{naam(f.fractie)}</text>
          );
        })}
      </svg>

      <Blok van={760} tot={840} top={1440}>
        <Kop grootte={80} style={{ color: K.koper }}>{uitslagWoord(b)}: {t.voor} tegen {t.tegen}.</Kop>
      </Blok>
      {frame >= 840 && <Eind van={840} bron={`zaak ${c.zaak}`} />}
    </AbsoluteFill>
  );
}

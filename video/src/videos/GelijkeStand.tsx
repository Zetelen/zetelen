// Variant "Gelijke stand" (32 s): twee keer dezelfde motie, een week uit elkaar. Twee scoreborden boven elkaar,
// en daartussen wat er veranderde: per fractie het verschil in voor, tegen en niet deelgenomen.
// Voor stemmingen met een herstemming (studievoorschot, 2018).
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { casus, datumTekst, naam, perFractie, totalen, uitslagWoord } from "../gegevens";
import { Achtergrond, Blok, Eind, Kop, Label, Merk, Teller, Tekst, zacht } from "../onderdelen";
import { K, LETTER, VEILIG } from "../stijl";

export const DUUR_GELIJK = 960;

function Bord({ datum, voor, tegen, woord, van, top }: { datum: string; voor: number; tegen: number; woord: string; van: number; top: number }) {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [van, van + 15], [0, 1], zacht);
  return (
    <div style={{ position: "absolute", top, left: VEILIG.zij, right: VEILIG.zij, opacity: z, padding: "28px 36px", borderTop: `3px solid ${K.koper}`, background: "rgba(11,18,38,0.85)" }}>
      <div style={{ fontFamily: LETTER.mono, fontSize: 30, color: K.zacht }}>{datum}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 30, fontFamily: LETTER.serif, fontSize: 150, color: K.tekst, lineHeight: 1.1 }}>
        <Teller waarde={voor} van={van + 5} /><span style={{ fontSize: 80, color: K.zacht }}>·</span><Teller waarde={tegen} van={van + 5} />
      </div>
      <div style={{ fontFamily: LETTER.sans, fontWeight: 600, fontSize: 44, color: K.koper, opacity: interpolate(frame, [van + 40, van + 50], [0, 1], zacht) }}>{woord}</div>
    </div>
  );
}

export function GelijkeStand({ slug }: { slug: string }) {
  const frame = useCurrentFrame();
  const c = casus(slug);
  const [b1, b2] = c.besluiten;
  const t1 = totalen(b1), t2 = totalen(b2);
  // Wat veranderde er per fractie tussen de twee stemmingen?
  const p1 = new Map(perFractie(b1.stemmen).map((f) => [f.fractie, f]));
  const wissels = perFractie(b2.stemmen).map((f) => {
    const o = p1.get(f.fractie) ?? { voor: 0, tegen: 0, niet: 0 };
    return { fractie: f.fractie, dv: f.voor - o.voor, dt: f.tegen - o.tegen, dn: f.niet - o.niet };
  }).filter((w) => w.dv || w.dt || w.dn);
  const zin = (w: (typeof wissels)[number]) => [
    w.dv ? `${w.dv > 0 ? "+" : ""}${w.dv} voor` : "", w.dt ? `${w.dt > 0 ? "+" : ""}${w.dt} tegen` : "", w.dn ? `${w.dn > 0 ? "+" : ""}${w.dn} niet mee` : "",
  ].filter(Boolean).join(", ");

  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950 }}>
      <Achtergrond binnenhof={interpolate(frame, [0, 140, 170], [0.45, 0.45, 0.1], zacht)} />
      <Merk />
      <Blok van={0} tot={175}>
        <Label>Twee stemmingen · {datumTekst(b1.datum)}</Label>
        <Kop>{c.vraag}</Kop>
        <Tekst grootte={40} style={{ color: K.zacht, opacity: interpolate(frame, [50, 70], [0, 1], zacht) }}>{c.omschrijving}</Tekst>
      </Blok>

      {frame >= 175 && frame < 840 && <Bord datum={datumTekst(b1.datum)} voor={t1.voor} tegen={t1.tegen} woord="De stemmen staken." van={180} top={VEILIG.boven + 20} />}
      <Blok van={260} tot={430} top={760}>
        <Tekst grootte={44}>Precies gelijk. Dan stemt de Kamer in een volgende vergadering opnieuw.</Tekst>
      </Blok>
      {frame >= 430 && frame < 840 && <Bord datum={datumTekst(b2.datum)} voor={t2.voor} tegen={t2.tegen} woord={`Weer gelijk: ${uitslagWoord(b2).toLowerCase()}.`} van={430} top={1120} />}
      <Blok van={520} tot={840} top={600}>
        <Label>Wat veranderde er in een week?</Label>
        {wissels.slice(0, 6).map((w) => (
          <Tekst key={w.fractie} grootte={38}><span style={{ color: K.koper }}>{naam(w.fractie)}</span>: {zin(w)}</Tekst>
        ))}
        <Tekst grootte={38} style={{ color: K.zacht }}>Staakt het opnieuw, dan is het voorstel niet aangenomen.</Tekst>
      </Blok>
      {frame >= 840 && <Eind van={840} bron={`zaak ${c.zaak}`} />}
    </AbsoluteFill>
  );
}

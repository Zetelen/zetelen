// Explainer bij het Actueel-stuk "kabinet-cu-50plus" (4 november 2026). Zelfde opzet en maat als Actueel.tsx: één
// boodschap per scène, eerst in grote woorden, dan de grafiek, dan stilstand om te lezen.
//   1. opening: hoe vaak stemmen kabinet, ChristenUnie, 50PLUS en Groep Markuszower hetzelfde;
//   2. het gemiddelde van de cohesie in drie stappen;
//   3. hoe vaak mee met het eensgezinde kabinet, met de PVV ter vergelijking;
//   4. wat de steun van de Groep Markuszower tot nu toe uitmaakte (kop uit het stuk);
//   5. de conclusie, de slotzin van het stuk in twee zinnen, en de eindkaart.
// Alle teksten en getallen komen uit web/lib/actueel.ts en de JSON, dezelfde als op de pagina. Neutraal: geen oordeel
// over hoe logisch een combinatie is. Geen partijkleuren, geen namen van personen. 44 seconden op de huismuziek.
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { type ActueelData, aantal, datumTekst, gemiddelde, mee, procent, stukVan } from "../../../web/lib/actueel";
import { Banner, Woorden } from "../flits";
import { K } from "../stijl";
import { zacht } from "../onderdelen";
import { Balk, Conclusie, Eind, Kop, Vlak, Voet, useMaat } from "./Actueel";

const A = 0, B = 120, C = 330, D = 690, E = 990, F = 1200;
export const DUUR_ACTUEEL_STEUN = 1320;

function Opening({ d }: { d: ActueelData }) {
  const m = useMaat();
  return (
    <Vlak binnenhof={0.35}>
      <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
        <div><Banner bij={4}>Actueel · kabinet-{d.kabinet}</Banner></div>
        <Woorden tekst="Hoe vaak stemmen deze partijen hetzelfde?" bij={12} grootte={m.lang ? 112 : 96} />
        <Woorden tekst="Eerst het kabinet met ChristenUnie en 50PLUS, dan de Groep Markuszower erbij" bij={50} grootte={m.lang ? 56 : 48} kleur={K.koper} />
      </div>
    </Vlak>
  );
}

// Scène 2: het gemiddelde van alle paren, in drie stappen
function Gemiddelde({ d }: { d: ActueelData }) {
  const m = useMaat();
  const [g3, g5, g6] = ["kabinet", "met-cu-50plus", "met-markuszower"].map((n) => gemiddelde(d, n));
  const HOOG = m.lang ? 56 : 40;
  return (
    <Vlak voet={<Voet bij={140}>Gemiddelde cohesie van alle paren, alleen verdeelde stemmingen.</Voet>}>
      <Kop label="Hoe vaak dezelfde kant" kop={`Het gemiddelde zakt van ${procent(g3.gemiddelde)} naar ${procent(g5.gemiddelde)} en ${procent(g6.gemiddelde)}`} />
      <div style={{ display: "flex", flexDirection: "column", gap: m.lang ? 28 : 16, marginTop: m.lang ? 20 : 6 }}>
        <Balk bij={45} pct={g3.gemiddelde} label="Kabinet" waarde={procent(g3.gemiddelde)} kleur={K.koper} hoog={HOOG} />
        <Balk bij={65} pct={g5.gemiddelde} label="Plus ChristenUnie en 50PLUS" waarde={procent(g5.gemiddelde)} kleur={K.koper} hoog={HOOG} />
        <Balk bij={85} pct={g6.gemiddelde} label="Plus Groep Markuszower" waarde={procent(g6.gemiddelde)} kleur={K.koper} hoog={HOOG} />
      </div>
    </Vlak>
  );
}

// Scène 3: hoe vaak mee met het eensgezinde kabinet; de PVV ter vergelijking
function Meegaan({ d, kop }: { d: ActueelData; kop: string }) {
  const m = useMaat();
  const HOOG = m.lang ? 48 : 36;
  const rijen = [mee(d, "ChristenUnie")!, mee(d, "50PLUS")!, mee(d, "Groep Markuszower")!];
  const pvv = mee(d, "PVV")!;
  return (
    <Vlak voet={<Voet bij={150}>{`Stemmingen waarop het kabinet eensgezind stemde: ${aantal(d.meegaan.basis)}. Eerst het blok met ChristenUnie en 50PLUS, dan de Groep Markuszower erbij; de PVV is ter vergelijking.`}</Voet>}>
      <Kop label="Als het kabinet eensgezind stemde" kop={kop} />
      <div style={{ display: "flex", flexDirection: "column", gap: m.lang ? 28 : 16, marginTop: m.lang ? 20 : 6 }}>
        {rijen.map((f, i) => <Balk key={f.afkorting} bij={45 + i * 15} pct={f.pct ?? 0} label={f.afkorting} waarde={procent(f.pct)} kleur={K.koper} hoog={HOOG} />)}
        <Balk bij={105} pct={pvv.pct ?? 0} label="PVV, ter vergelijking" waarde={procent(pvv.pct)} kleur={K.lijnLicht} hoog={HOOG} />
      </div>
    </Vlak>
  );
}

// Scène 4: wat de steun van de extra fractie tot nu toe uitmaakte; de kop komt uit het stuk
function Steun({ d, kop }: { d: ActueelData; kop: string }) {
  const m = useMaat();
  const x = d.doorslag!;
  const HOOG = m.lang ? 40 : 30;
  const rijen: Array<[string, number, number]> = [
    [`${x.extra} stemde mee met de vijf`, x.mee, x.gestemd],
    ["Uitslag ook zonder haar zetels dezelfde", x.mee - x.nodig, x.mee],
    ["Uitslag anders met haar zetels aan de kant van de vijf", x.kostte, x.tegen],
    [`Krappe uitslag (verschil kleiner dan ${2 * d.zetelsom.zetels[x.extra]} zetels)`, x.krap, x.gestemd],
  ];
  return (
    <Vlak voet={<Voet bij={200}>{`Stemmingen waarop de vijf partijen eensgezind waren en de Groep Markuszower stemde: ${aantal(x.gestemd)}. Zetels per fractie in de periode.`}</Voet>}>
      <Kop label="Veranderden haar zetels de uitslag?" kop={kop} />
      <div style={{ display: "flex", flexDirection: "column", gap: m.lang ? 26 : 14, marginTop: m.lang ? 20 : 6 }}>
        {rijen.map(([naam, deel, geheel], i) => (
          <Balk key={naam} bij={60 + i * 20} pct={geheel ? Math.max((100 * deel) / geheel, deel ? 1.5 : 0) : 0} label={naam} waarde={`${aantal(deel)} van ${aantal(geheel)}`} kleur={K.koper} hoog={HOOG} />
        ))}
      </div>
    </Vlak>
  );
}

export function ActueelSteun({ slug }: { slug: string }) {
  const x = stukVan(slug)!;
  const bron = `stemmingen onder kabinet-${x.data.kabinet} tot en met ${datumTekst(x.data.stand)}`;
  const marge = `Alleen de Tweede Kamer. ${aantal(x.data.verdeeld)} verdeelde stemmingen; de zes partijen staan op de pagina.`;
  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950 }}>
      <Audio src={staticFile("muziek/zetelen.wav")} volume={(f) => 0.7 * interpolate(f, [0, 6], [0, 1], zacht)} />
      <Sequence from={A} durationInFrames={B - A}><Opening d={x.data} /></Sequence>
      <Sequence from={B} durationInFrames={C - B}><Gemiddelde d={x.data} /></Sequence>
      <Sequence from={C} durationInFrames={D - C}><Meegaan d={x.data} kop={x.blokken[1].kop} /></Sequence>
      <Sequence from={D} durationInFrames={E - D}><Steun d={x.data} kop={x.blokken[3].kop} /></Sequence>
      <Sequence from={E} durationInFrames={F - E}><Conclusie slot={x.slot} /></Sequence>
      <Sequence from={F}><Eind slug={slug} bron={bron} marge={marge} /></Sequence>
    </AbsoluteFill>
  );
}

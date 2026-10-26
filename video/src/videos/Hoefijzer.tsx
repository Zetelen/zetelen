// Variant "Hoefijzer" (versie 2, flitsend). De 150 stemmen op een rij, in de volgorde van de zaal op Zetelen (fracties
// die vaak hetzelfde stemmen staan naast elkaar; gemeten over 2023 tot 2025, geen eigen links-rechtsindeling). Eerst
// kleurt de rij naar fractie, dan in een golf naar stem. Dan buigt de rij dicht tot een hoefijzer: de uiteinden raken
// elkaar. De namen van de uiteinden staan op dezelfde hoogte (feedback Niels 26 oktober).
// Voor stemmingen waarin de uiteinden van de rij samen stemmen (Mercosur, het behandelvoorbehoud).
import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { VOLGORDE } from "../../../web/lib/verhaal";
import { casus, naam, perFractie, tintenVan, totalen, uitslagWoord } from "../gegevens";
import { Flits, Geluid, Stempel, Woorden, ZWAAR } from "../flits";
import { Achtergrond, Eind, Merk, zacht } from "../onderdelen";
import { K, VEILIG } from "../stijl";
import { MetTitel, TITEL } from "../titel";

// Momenten, gerekend vanaf het einde van de titel
const RIJ = 120, STEM = 210, BUIG = 320, RAAK = 430, SLOT = 610, EINDE = 730, EIND = 150;
export const DUUR_HOEFIJZER = TITEL + EINDE + EIND;

export function Hoefijzer({ slug }: { slug: string }) {
  return <MetTitel slug={slug}><Verloop slug={slug} /></MetTitel>;
}

// Tekst in het tekstvlak bovenin, tussen twee momenten
function Vlak({ van, tot, children }: { van: number; tot: number; children: ReactNode }) {
  const frame = useCurrentFrame();
  if (frame < van || frame >= tot) return null;
  return (
    <div style={{ position: "absolute", top: 480, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", gap: 30, alignItems: "flex-start",
      opacity: interpolate(frame, [tot - 8, tot], [1, 0], zacht) }}>
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
  const rang = (f: string) => { const i = VOLGORDE.indexOf(f); return i < 0 ? VOLGORDE.length : i; };
  const pf = perFractie(b.stemmen).sort((a, x) => rang(a.fractie) - rang(x.fractie));
  // Elke stem een stip: per fractie eerst voor, dan tegen, dan niet deelgenomen
  const stemmen = pf.flatMap((f) => [
    ...Array.from({ length: f.voor }, () => ({ fractie: f.fractie, stem: "Voor" })),
    ...Array.from({ length: f.tegen }, () => ({ fractie: f.fractie, stem: "Tegen" })),
    ...Array.from({ length: f.niet }, () => ({ fractie: f.fractie, stem: "Niet deelgenomen" })),
  ]);
  const n = stemmen.length;
  const buig = interpolate(frame, [BUIG, RAAK], [0, 1], { ...zacht, easing: (x) => 0.5 - Math.cos(Math.PI * x) / 2 });
  // Een band van drie stippen breed: als rij over de breedte, als hoefijzer een boog van 300 graden
  const BAAN = 3, kolommen = Math.ceil(n / BAAN);
  const MY = 1130, R = 340;
  const opKolom = (u: number, baan: number) => {
    const rij = { x: 90 + u * 900, y: MY + baan * 19 };
    const hoek = (-150 + u * 300) * (Math.PI / 180), r = R + baan * 19;
    const boog = { x: 540 + r * Math.sin(hoek), y: MY - r * Math.cos(hoek) };
    return { x: rij.x + (boog.x - rij.x) * buig, y: rij.y + (boog.y - rij.y) * buig };
  };
  const kolomVan = (i: number) => Math.floor(i / BAAN) / Math.max(1, kolommen - 1);
  const plek = (i: number) => opKolom(kolomVan(i), (i % BAAN) - 1);

  const eerste = pf[0], laatste = pf[pf.length - 1];
  const zelfdeKant = eerste && laatste && eerste.kant === laatste.kant;
  const midden = [...new Set(pf.filter((f) => f.kant !== eerste?.kant && f.kant !== "Niet deelgenomen").map((f) => naam(f.fractie)))];
  // De namen van de uiteinden: gemeten op de middelste baan van de eerste en laatste kolom, op één hoogte
  const A = opKolom(0, 0), Z = opKolom(1, 0);
  const labelY = Math.max(A.y, Z.y) + 46;
  const zichtLabel = interpolate(frame, [RIJ + 40, RIJ + 56], [0, 1], zacht);
  const raak = interpolate(frame, [RAAK, RAAK + 6, RAAK + 40], [0, 1, 0.55], zacht);
  // Teller tijdens de stemgolf
  const golf = (u: number) => interpolate(frame, [STEM + u * 50, STEM + u * 50 + 10], [0, 1], zacht);
  const geteld = stemmen.reduce((s, x, i) => (golf(kolomVan(i)) > 0.5 ? (x.stem === "Voor" ? { ...s, voor: s.voor + 1 } : x.stem === "Tegen" ? { ...s, tegen: s.tegen + 1 } : s) : s), { voor: 0, tegen: 0 });
  const zicht = interpolate(frame, [RIJ - 4, RIJ + 8, EINDE - 10, EINDE], [0, 1, 1, 0], zacht);

  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950 }}>
      <Achtergrond binnenhof={0.05} />
      <Merk />

      <Vlak van={0} tot={RIJ}>
        <Woorden tekst={c.omschrijving} bij={4} grootte={50} zwaar={false} />
        <Woorden tekst="150 stemmen op een rij." bij={50} grootte={84} kleur={K.koper} />
      </Vlak>
      <Geluid bij={50} naam="stijg" volume={0.4} />
      <Vlak van={RIJ} tot={STEM}>
        <Woorden tekst="Fracties die vaak hetzelfde stemmen, staan naast elkaar." bij={RIJ + 6} grootte={64} />
      </Vlak>
      <Vlak van={BUIG} tot={RAAK}>
        <Woorden tekst="Buig de rij." bij={BUIG + 4} grootte={110} kleur={K.koper} />
      </Vlak>
      <Geluid bij={BUIG + 4} naam="stijg" volume={0.6} />
      <Vlak van={RAAK} tot={SLOT}>
        <Stempel bij={RAAK + 4} tekst={zelfdeKant ? "De uiteinden raken elkaar" : "De uiteinden verschillen"} grootte={52} />
        <Woorden bij={RAAK + 34} grootte={44} zwaar={false} tekst={zelfdeKant
          ? `${naam(eerste.fractie)} en ${naam(laatste.fractie)} stemmen allebei ${eerste.kant.toLowerCase()}, net als hun buren. Het midden stemt anders: ${midden.slice(0, 4).join(", ")}${midden.length > 4 ? " en meer" : ""}.`
          : `${naam(eerste.fractie)} stemt ${eerste.kant.toLowerCase()}, ${naam(laatste.fractie)} ${laatste.kant.toLowerCase()}.`} />
      </Vlak>
      <Vlak van={SLOT} tot={EINDE}>
        <Woorden tekst={`${uitslagWoord(b)}:`} bij={SLOT + 4} grootte={100} kleur={K.koper} />
        <Woorden tekst={`${t.voor} tegen ${t.tegen}.`} bij={SLOT + 14} grootte={100} />
      </Vlak>
      <Geluid bij={SLOT + 4} naam="dreun" volume={0.8} />

      <AbsoluteFill style={{ opacity: zicht }}>
        {/* Stand tijdens en na de stemgolf */}
        {frame >= STEM && (
          <div style={{ position: "absolute", top: VEILIG.boven + 10, left: VEILIG.zij, right: VEILIG.zij, display: "flex", justifyContent: "space-between",
            opacity: interpolate(frame, [STEM, STEM + 8], [0, 1], zacht) }}>
            {(["voor", "tegen"] as const).map((k) => (
              <div key={k} style={{ textAlign: k === "voor" ? "left" : "right" }}>
                <div style={{ fontFamily: ZWAAR, fontWeight: 800, fontSize: 150, lineHeight: 0.95, color: k === "voor" ? K.voor : K.tegen }}>{geteld[k]}</div>
                <div style={{ fontFamily: ZWAAR, fontWeight: 800, fontSize: 32, letterSpacing: "0.12em", color: K.zacht }}>{k.toUpperCase()}</div>
              </div>
            ))}
          </div>
        )}

        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {/* Gloed waar de uiteinden elkaar raken */}
          {zelfdeKant && raak > 0 && [A, Z].map((p, j) => (
            <circle key={j} cx={p.x} cy={p.y} r={44 + (1 - raak) * 30} fill="none" stroke={K.goud} strokeWidth={4} opacity={raak} />
          ))}
          {stemmen.map((s, i) => {
            const p = plek(i);
            const fk = tint.get(s.fractie) ?? K.lijnLicht;
            const sk = s.stem === "Voor" ? K.voor : s.stem === "Tegen" ? K.tegen : K.niet;
            const verschijn = interpolate(frame, [RIJ + i * 0.25, RIJ + 8 + i * 0.25], [0, 1], zacht);
            const g = golf(kolomVan(i));
            return <circle key={i} cx={p.x} cy={p.y - Math.sin(g * Math.PI) * 14} r={8} fill={interpolateColors(g, [0, 1], [fk, sk])} stroke={K.nacht950} strokeWidth={1} opacity={verschijn} />;
          })}
        </svg>

        {/* Namen van de uiteinden: links naar buiten uitgelijnd, rechts ook, op één hoogte */}
        {[eerste, laatste].filter(Boolean).map((f, j) => {
          const p = j === 0 ? A : Z;
          // Als rij staat de naam binnen het beeld; als hoefijzer naar buiten, weg van het andere uiteinde
          const schuif = j === 0 ? `translateX(${-100 * buig}%) translateX(${-6 * buig}px)` : `translateX(${-100 * (1 - buig)}%) translateX(${6 * buig}px)`;
          return (
            <div key={f.fractie} style={{ position: "absolute", left: p.x, top: labelY,
              transform: schuif, opacity: zichtLabel, padding: "6px 16px", borderRadius: 8, background: K.nacht800,
              border: `3px solid ${tint.get(f.fractie) ?? K.lijnLicht}`, fontFamily: ZWAAR, fontWeight: 800, fontSize: 32, color: K.tekst, whiteSpace: "nowrap" }}>
              {naam(f.fractie)}
            </div>
          );
        })}
      </AbsoluteFill>

      <Flits bij={RAAK + 4} sterkte={0.35} />
      <Geluid bij={RAAK + 4} naam="dreun" />
      <Geluid bij={STEM} naam="swoosh" volume={0.6} />
      {Array.from({ length: 6 }, (_, k) => <Geluid key={k} bij={RIJ + k * 7} naam="tik" volume={0.4} />)}

      {frame >= EINDE && <Eind van={EINDE} bron={`zaak ${c.zaak}`} />}
      <Geluid bij={EINDE} naam="swoosh" volume={0.5} />
    </AbsoluteFill>
  );
}

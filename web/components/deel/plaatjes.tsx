// Voorbeeldplaatjes per grafiek voor de deellinks (lib/deel.ts), 1200 bij 630 zoals WhatsApp, LinkedIn en X verwachten.
// Alleen cijfers uit de database, met dezelfde berekening als de grafiek op de site. Opmaak in de stijl van de andere
// deelplaatjes (app/coalitie/plaatje); kleuren uit styles/tokens.css, want next/og kent geen CSS-variabelen.
import type { ReactNode } from "react";
import { datumTekst, laatstBijgewerkt } from "@/lib/api";
import { cohesieIn, fractiesIn, keuzeUitUrl, perioden, procent } from "@/lib/cohesie";
import { BRON } from "@/lib/deel";
import { plaatjeInhoud } from "@/lib/deelplaatje";
import { schaalkleur } from "@/lib/kleur";
import { bredeSteunPerKabinet } from "@/lib/voorpagina";
import { KABINET_NU, gemiddeldTot2024, halfjarenVvd, laadVvdPro, rangorde, zetelsIn } from "@/lib/vvdPro";
import { TINT } from "@/lib/vvdProVerhaal";
import { periodeWerk } from "@/lib/zetelwerk";

export const KLEUR = { achter: "#070B18", vlak: "#0B1226", tekst: "#E8ECF5", zacht: "#A9B4CC", koper: "#D08A55", goud: "#E3B76A", lijn: "#2A3A63", amendement: "#7FB7C9" };

export const rond = (c: number | null) => (c == null ? "" : `${Math.round(c)}%`);

// Vaste opbouw: kop, titel, regel eronder, de grafiek, en onderaan de bron met de stand van de data
export function Kader({ kop, titel, regel, stand, children }: { kop: string; titel: string; regel: string; stand: Date | null; children: ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100%", background: KLEUR.achter, color: KLEUR.tekst, display: "flex", flexDirection: "column", padding: "52px 64px", gap: 14 }}>
      <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, color: KLEUR.koper }}>{`ZETELEN · ${kop.toUpperCase()}`}</div>
      <div style={{ display: "flex", fontSize: 48, lineHeight: 1.08 }}>{titel}</div>
      <div style={{ display: "flex", fontSize: 24, color: KLEUR.zacht }}>{regel}</div>
      <div style={{ display: "flex", flex: 1, minHeight: 0, marginTop: 10, overflow: "hidden" }}>{children}</div>
      <div style={{ display: "flex", fontSize: 20, color: KLEUR.zacht }}>
        {`${BRON}, op basis van open data van de Tweede Kamer · stand ${stand ? datumTekst(stand) : "onbekend"}`}
      </div>
    </div>
  );
}

export const Melding = ({ tekst }: { tekst: string }) => <div style={{ display: "flex", fontSize: 32, color: KLEUR.zacht }}>{tekst}</div>;

// Verkenner: met wie stemt de gekozen partij het vaakst mee (standaard de grootste, zoals de verkenner zelf)
export async function verkennerPlaatje(zoek: Record<string, string>) {
  const [lijst, stand] = await Promise.all([perioden(), laatstBijgewerkt()]);
  const { soort, periode, variant } = keuzeUitUrl(zoek, lijst);
  const [fracties, kaart] = periode ? await Promise.all([fractiesIn(soort, periode.naam), cohesieIn(soort, periode.naam, variant)]) : [null, null];
  const zaal = (fracties ?? []).filter((f) => f.inZaal);
  const gekozen = zaal.find((f) => f.afkorting === zoek.fractie) ?? [...zaal].sort((a, b) => b.zetels - a.zetels)[0];
  const inhoud = plaatjeInhoud(gekozen?.afkorting ?? "", fracties, kaart, 6);
  const wanneer = periode ? (soort === "kabinet" ? `Kabinet-${periode.naam}` : `Kamer ${periode.naam}`) : "";
  return (
    <Kader kop="Wie stemt met wie" titel={`Met wie stemt ${gekozen?.afkorting ?? "een partij"} het vaakst mee?`} stand={stand}
      regel={`${wanneer} · ${variant === "alle" ? "alle stemmingen" : "alleen verdeelde stemmingen"} · deel van de stemmingen met dezelfde keuze`}>
      {inhoud.teWeinig ? <Melding tekst="Te weinig stemmingen om iets te zeggen" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {inhoud.regels.map((r) => (
            <div key={r.afkorting} style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ display: "flex", width: 300, fontSize: 28 }}>{r.afkorting}</div>
              <div style={{ display: "flex", width: 600, height: 24, background: KLEUR.vlak, borderRadius: 6 }}>
                <div style={{ display: "flex", width: `${r.cohesie}%`, height: 24, background: schaalkleur(r.cohesie!), borderRadius: 6 }} />
              </div>
              <div style={{ display: "flex", fontSize: 28 }}>{procent(r.cohesie)}</div>
            </div>
          ))}
        </div>
      )}
    </Kader>
  );
}

// VVD en PRO: de ranglijst onder het huidige kabinet als bullet chart, met het streepje voor 2010 tot en met 2023
export async function vvdProPlaatje() {
  const [d, stand] = await Promise.all([laadVvdPro(), laatstBijgewerkt()]);
  if (!d) return <Kader kop="Uitgelicht" titel="Hoe vaak stemmen VVD en PRO hetzelfde?" regel="" stand={stand}><Melding tekst="De cijfers laden nu niet" /></Kader>;
  const lijnNaam = new Map(d.lijnPro.ids.map((i) => [i, "PRO"]));
  const lijst = rangorde(d.rijen, KABINET_NU, zetelsIn(d.fracties, KABINET_NU, lijnNaam), lijnNaam);
  const gemiddeld = gemiddeldTot2024(await halfjarenVvd(d.vvd));
  // De rijen verdelen de ruimte die er is; bij veel fracties worden ze lager
  const rij = Math.min(30, Math.floor(300 / Math.max(1, lijst.length)));
  const BALK = 640;
  return (
    <Kader kop="Uitgelicht" titel="Hoe vaak stemmen VVD en PRO hetzelfde?" stand={stand}
      regel={`De VVD onder kabinet-${KABINET_NU} · streepje: gemiddeld 2010 tot en met 2023`}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
        {lijst.map((x) => {
          const pro = x.naam === "PRO";
          const strepen = pro ? [{ c: gemiddeld.PvdA, tint: TINT.pvda }, { c: gemiddeld.GL, tint: TINT.gl }] : [{ c: gemiddeld[x.naam], tint: KLEUR.tekst }];
          return (
            <div key={x.naam} style={{ display: "flex", alignItems: "center", gap: 20, flex: 1, minHeight: 0 }}>
              <div style={{ display: "flex", width: 260, fontSize: Math.min(22, rij - 5), lineHeight: 1, color: pro ? KLEUR.goud : KLEUR.tekst }}>{x.naam}</div>
              <div style={{ display: "flex", position: "relative", width: BALK, height: Math.max(8, rij - 10), background: KLEUR.vlak, borderRadius: 3 }}>
                <div style={{ display: "flex", width: `${x.cohesie}%`, height: Math.max(8, rij - 10), background: pro ? KLEUR.goud : TINT.rest, borderRadius: 3 }} />
                {strepen.filter((st) => st.c != null).map((st, i) => (
                  <div key={i} style={{ display: "flex", position: "absolute", left: (BALK * st.c!) / 100 - 2, top: -3, width: 4, height: Math.max(8, rij - 10) + 6, background: st.tint }} />
                ))}
              </div>
              <div style={{ display: "flex", fontSize: Math.min(22, rij - 5), lineHeight: 1, color: pro ? KLEUR.goud : KLEUR.tekst }}>{rond(x.cohesie)}</div>
            </div>
          );
        })}
      </div>
    </Kader>
  );
}

// Voorpagina: per kabinet het deel van de moties en amendementen dat het haalde met stemmen van kabinet én oppositie
export async function bredeSteunPlaatje() {
  const [werk, stand] = await Promise.all([periodeWerk("kabinet"), laatstBijgewerkt()]);
  const rijen = werk ? bredeSteunPerKabinet(werk) : [];
  const HOOG = 220, max = 60;
  const staaf = (p: number | null, tint: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", width: 52, height: HOOG + 34 }}>
      <div style={{ display: "flex", fontSize: 20, marginBottom: 4 }}>{rond(p)}</div>
      <div style={{ display: "flex", width: 52, height: p == null ? 0 : (HOOG * Math.min(p, max)) / max, background: tint, borderRadius: "4px 4px 0 0" }} />
    </div>
  );
  return (
    <Kader kop="Kabinet en oppositie" titel="Met stemmen van kabinet én oppositie" stand={stand}
      regel="Deel van alle ingediende moties en amendementen per kabinet dat zo werd aangenomen">
      {!rijen.length ? <Melding tekst="De cijfers laden nu niet" /> : (
        <div style={{ display: "flex", width: "100%", alignItems: "flex-end", gap: 18 }}>
          <div style={{ display: "flex", flex: 1, alignItems: "flex-end", justifyContent: "space-between", borderBottom: `2px solid ${KLEUR.lijn}` }}>
            {rijen.map((r) => (
              <div key={r.kabinet} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>{staaf(r.moties, KLEUR.koper)}{staaf(r.amendementen, KLEUR.amendement)}</div>
                <div style={{ display: "flex", fontSize: 22 }}>{r.kabinet}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 220, fontSize: 22, paddingBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ display: "flex", width: 18, height: 18, background: KLEUR.koper }} />moties</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ display: "flex", width: 18, height: 18, background: KLEUR.amendement }} />amendementen</div>
          </div>
        </div>
      )}
    </Kader>
  );
}

// Deelplaatjes (1200 x 630, next/og) voor het Actueel-stuk "demissionair": dezelfde twee grafieken als op de pagina
// (DemissionairBlokken.tsx). Herzien op 18 november 2026, net als de pagina: balken met de periode in woorden in plaats
// van vormen met een legenda, en een stippenstrook per kabinet. Alleen flex-opmaak: next/og kent geen tabellen.
// Een kleine periode staat er doorschijnend bij, met het woord "klein".
import { KLEUR } from "@/components/deel/plaatjes";
import { type DemPeriode, type DemPeriodeNaam, type DemissionairData, DEM_PERIODES, eensPct, kortNaam, procent, puntKort } from "@/lib/actueel";

// Korte woorden voor het plaatje: "oude Kamer" is de Kamer die tot de installatie van de nieuwe doorstemt
const LABEL: Record<DemPeriodeNaam, string> = {
  missionair: "missionair", demVoor: "demissionair, oude Kamer", demNa: "demissionair, nieuwe Kamer",
};
const TINT: Record<DemPeriodeNaam, string> = { missionair: "#F2D38B", demVoor: "#7FB7C9", demNa: "#3E7CB1" };

function val(d: DemissionairData) {
  // Drie kolommen met de periode bovenaan, één rij per kabinet: geen legenda nodig
  const KOLOM = 250, BALK = 170;
  const rijen: Array<{ naam: string; periodes: Partial<Record<DemPeriodeNaam, DemPeriode | null>> }> = [
    ...d.kabinetten.map((k) => ({ naam: k.kabinet, periodes: k.periodes })),
    { naam: `${d.jetten.kabinet} (nu)`, periodes: { missionair: d.jetten.missionair } },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, justifyContent: "flex-start" }}>
      <div style={{ display: "flex", gap: 16, marginTop: 8, height: 22 }}>
        <div style={{ display: "flex", width: 170 }} />
        {DEM_PERIODES.map((p) => <div key={p} style={{ display: "flex", width: KOLOM, fontSize: 16, color: KLEUR.zacht }}>{LABEL[p]}</div>)}
      </div>
      {rijen.map((r) => (
        <div key={r.naam} style={{ display: "flex", alignItems: "center", gap: 16, height: 22 }}>
          <div style={{ display: "flex", width: 170, fontSize: 18, color: KLEUR.tekst }}>{r.naam}</div>
          {DEM_PERIODES.map((p) => {
            const x = r.periodes[p] ?? null, pct = x ? eensPct(x) : null;
            if (!(p in r.periodes)) return <div key={p} style={{ display: "flex", width: KOLOM }} />;
            return (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, width: KOLOM }}>
                <div style={{ display: "flex", width: BALK, height: 14, background: "#111B36", borderRadius: 2 }}>
                  {pct != null && <div style={{ display: "flex", width: (BALK * pct) / 100, height: 14, background: TINT[p], borderRadius: 2, opacity: x!.klein ? 0.45 : 1 }} />}
                </div>
                <div style={{ display: "flex", fontSize: 15, color: x?.klein ? KLEUR.zacht : KLEUR.tekst }}>
                  {pct == null ? "geen" : `${procent(pct)}${x!.klein ? " klein" : ""}`}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div style={{ display: "flex", fontSize: 14, color: KLEUR.zacht, marginTop: 2 }}>
        {"Alle blijvende kabinetspartijen dezelfde kant, van de verdeelde stemmingen (0 tot 100%) · klein: te weinig stemmingen"}
      </div>
    </div>
  );
}

// Per kabinet een stippenstrook: elke stip een kabinetspartij met een oppositiepartij, de nullijn en de mediaan van
// alle paren; de twee uitersten met naam
function oppositie(d: DemissionairData) {
  const kab = d.kabinetten.filter((k) => k.campagne);
  const max = Math.max(15, Math.ceil(Math.max(...kab.flatMap((k) => k.campagne!.kabOpp.map((v) => Math.abs(v.verschil)))) / 5) * 5);
  const BREED = 560, x = (v: number) => BREED / 2 + (BREED / 2) * (v / max);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, justifyContent: "center" }}>
      {d.kabinetten.map((k) => {
        const c = k.campagne, klein = !!k.periodes.missionair?.klein || !!k.periodes.demVoor?.klein;
        if (!c) return (
          <div key={k.kabinet} style={{ display: "flex", alignItems: "center", gap: 14, height: 26 }}>
            <div style={{ display: "flex", width: 160, fontSize: 18, color: KLEUR.tekst }}>{k.kabinet}</div>
            <div style={{ display: "flex", fontSize: 16, color: KLEUR.zacht }}>geen stemmingen vóór de nieuwe Kamer</div>
          </div>
        );
        const paren = [...c.kabOpp].sort((p, q) => p.verschil - q.verschil);
        const laag = paren[0], hoog = paren[paren.length - 1];
        return (
          <div key={k.kabinet} style={{ display: "flex", alignItems: "center", gap: 14, height: 44, opacity: klein ? 0.5 : 1 }}>
            <div style={{ display: "flex", width: 160, fontSize: 18, color: KLEUR.tekst }}>{`${k.kabinet}${klein ? " (klein)" : ""}`}</div>
            <div style={{ display: "flex", position: "relative", width: BREED, height: 24, borderBottom: `1px solid ${KLEUR.lijn}` }}>
              <div style={{ display: "flex", position: "absolute", left: BREED / 2 - 1, top: 0, width: 2, height: 24, background: KLEUR.zacht }} />
              {c.mediaan != null && <div style={{ display: "flex", position: "absolute", left: x(c.mediaan) - 1, top: 0, width: 3, height: 24, background: KLEUR.goud }} />}
              {paren.map((v) => (
                <div key={`${v.kabinetspartij}-${v.oppositie}`} style={{ display: "flex", position: "absolute", left: x(v.verschil) - 6, top: 7, width: 11, height: 11, borderRadius: 6, background: "#7FB7C9", opacity: 0.75 }} />
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 15, color: KLEUR.tekst }}>
              <div style={{ display: "flex" }}>{`${kortNaam(hoog.kabinetspartij)} en ${kortNaam(hoog.oppositie)} ${puntKort(hoog.verschil)}`}</div>
              <div style={{ display: "flex" }}>{`${kortNaam(laag.kabinetspartij)} en ${kortNaam(laag.oppositie)} ${puntKort(laag.verschil)}`}</div>
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", fontSize: 14, color: KLEUR.zacht, marginTop: 2 }}>
        {`Procentpunt, -${max} links (minder vaak dezelfde kant) tot +${max} rechts (vaker) · grijs: 0 · goud: mediaan van alle paren`}
      </div>
    </div>
  );
}

export const DEMISSIONAIR_PLAATJE: Record<string, (d: DemissionairData) => React.ReactElement> = { val, oppositie };

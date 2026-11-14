// Deelplaatjes (1200 x 630, next/og) voor het Actueel-stuk "demissionair": dezelfde twee grafieken als op de pagina
// (DemissionairBlokken.tsx), in de stijl van verdeeldPlaatje.tsx. Alleen flex-opmaak: next/og kent geen tabellen.
// Een kleine periode staat er doorschijnend en met een sterretje bij.
import { KLEUR } from "@/components/deel/plaatjes";
import { type DemPeriode, type DemPeriodeNaam, type DemissionairData, DEM_PERIODES, kortNaam, periodeGetal, puntKort, verschuivingen } from "@/lib/actueel";

const KORT: Record<DemPeriodeNaam, string> = { missionair: "mis.", demVoor: "vóór", demNa: "na" };

function teken(p: DemPeriodeNaam, x: number, klein: boolean) {
  const basis = { display: "flex", position: "absolute" as const, left: x - 9, top: 2, width: 18, height: 18, opacity: klein ? 0.45 : 1 };
  if (p === "missionair") return <div key={p} style={{ ...basis, borderRadius: 9, border: `3px solid ${KLEUR.tekst}`, background: KLEUR.achter }} />;
  if (p === "demVoor") return <div key={p} style={{ ...basis, background: KLEUR.zacht }} />;
  return <div key={p} style={{ ...basis, borderRadius: 9, background: KLEUR.koper }} />;
}

function val(d: DemissionairData) {
  const BREED = 560;
  const rijen: Array<{ naam: string; periodes: Partial<Record<DemPeriodeNaam, DemPeriode | null>> }> = [
    ...d.kabinetten.map((k) => ({ naam: k.kabinet, periodes: k.periodes })),
    { naam: `${d.jetten.kabinet} (nu)`, periodes: { missionair: d.jetten.missionair } },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, justifyContent: "center" }}>
      {rijen.map((r) => {
        const er = DEM_PERIODES.filter((p) => r.periodes[p]);
        return (
          <div key={r.naam} style={{ display: "flex", alignItems: "center", gap: 16, height: 25 }}>
            <div style={{ display: "flex", width: 210, fontSize: 19, color: KLEUR.tekst }}>{r.naam}</div>
            <div style={{ display: "flex", position: "relative", width: BREED, height: 24, borderBottom: `2px solid ${KLEUR.lijn}` }}>
              {er.map((p) => teken(p, (BREED * r.periodes[p]!.eensgezind.pct!) / 100, r.periodes[p]!.klein))}
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 17, color: KLEUR.tekst }}>
              {DEM_PERIODES.filter((p) => p in r.periodes).map((p) => {
                const x = r.periodes[p];
                return <div key={p} style={{ display: "flex", color: x?.klein ? KLEUR.zacht : KLEUR.tekst }}>{`${KORT[p]} ${periodeGetal(x ?? null, x ? x.eensgezind.pct : null)}`}</div>;
              })}
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", fontSize: 15, color: KLEUR.zacht, marginTop: 2 }}>
        {`Eensgezind (0 tot 100%) · open: missionair · vierkant: vóór de nieuwe Kamer · koper: erna · * klein`}
      </div>
    </div>
  );
}

// Per kabinet één rij: de sterkste stijger naar rechts, de sterkste daler naar links, de mediaan van alle paren als streep
function campagne(d: DemissionairData) {
  const kab = d.kabinetten.filter((k) => k.campagne);
  const max = Math.ceil(Math.max(...kab.flatMap((k) => verschuivingen(k).map((v) => Math.abs(v.verschil)))) / 5) * 5;
  const BREED = 420, x = (v: number) => BREED / 2 + (BREED / 2) * (v / max);
  const paar = (v: { kabinetspartij: string; oppositie: string; verschil: number }) => `${kortNaam(v.kabinetspartij)} en ${kortNaam(v.oppositie)} ${puntKort(v.verschil)}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, justifyContent: "center" }}>
      {d.kabinetten.map((k) => {
        const c = k.campagne, klein = !!k.periodes.missionair?.klein || !!k.periodes.demVoor?.klein;
        const l = c ? verschuivingen(k) : [];
        const hoog = l.length ? l.reduce((a, b) => (b.verschil > a.verschil ? b : a)) : null;
        const laag = l.length ? l.reduce((a, b) => (b.verschil < a.verschil ? b : a)) : null;
        const tonen = [hoog && hoog.verschil > 0 ? hoog : null, laag && laag.verschil < 0 ? laag : null].filter((v) => v !== null);
        return (
          <div key={k.kabinet} style={{ display: "flex", alignItems: "center", gap: 14, height: 22, opacity: klein ? 0.5 : 1 }}>
            <div style={{ display: "flex", width: 150, fontSize: 18, color: KLEUR.tekst }}>{`${k.kabinet}${klein ? "*" : ""}`}</div>
            <div style={{ display: "flex", position: "relative", width: BREED, height: 20 }}>
              <div style={{ display: "flex", position: "absolute", left: BREED / 2, top: -2, width: 1, height: 24, background: KLEUR.lijn }} />
              {tonen.map((v) => (
                <div key={paar(v!)} style={{ display: "flex", position: "absolute", left: Math.min(BREED / 2, x(v!.verschil)), top: 4, width: Math.abs(x(v!.verschil) - BREED / 2), height: 12,
                  background: v!.verschil > 0 ? KLEUR.koper : KLEUR.zacht }} />
              ))}
              {c && <div style={{ display: "flex", position: "absolute", left: x(c.mediaan!), top: -2, width: 3, height: 24, background: KLEUR.goud }} />}
            </div>
            <div style={{ display: "flex", fontSize: 16, color: c ? KLEUR.tekst : KLEUR.zacht }}>
              {c ? tonen.map((v) => paar(v!)).join(" · ") : "geen stemmingen vóór de nieuwe Kamer"}
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", fontSize: 14, color: KLEUR.zacht, marginTop: 0 }}>
        {`Sterkste stijger en daler, procentpunt (-${max} tot +${max}) · goud: mediaan van alle paren · * klein`}
      </div>
    </div>
  );
}

export const DEMISSIONAIR_PLAATJE: Record<string, (d: DemissionairData) => React.ReactElement> = { val, campagne };

// Deelplaatjes (1200 x 630, next/og) voor het Actueel-stuk "coalitie-verdeeld": dezelfde twee grafieken als op de
// pagina (VerdeeldBlokken.tsx), in de stijl van akkoordPlaatje.tsx. Alleen flex-opmaak: next/og kent geen tabellen.
import { KLEUR, rond } from "@/components/deel/plaatjes";
import { type GroepNaam, type VerdeeldData, anderen, groepNaam, maandKort, maandPct, schaalMaanden } from "@/lib/actueel";

const LICHT = "#566AA6"; // met de VVD, ter vergelijking, zoals het kabinet in akkoordPlaatje.tsx

function maanden(d: VerdeeldData) {
  const max = schaalMaanden(d), BREED = 700, H = Math.min(20, Math.floor(180 / d.maanden.length));
  const [ander, derde] = anderen(d);
  const x = (p: number | null) => (BREED * (p ?? 0)) / max;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
      {d.maanden.map((m) => {
        const leeg = m.verdeeld === 0;
        return (
          <div key={m.maand} style={{ display: "flex", alignItems: "center", gap: 16, height: H }}>
            <div style={{ display: "flex", width: 90, fontSize: 18, color: KLEUR.zacht }}>{maandKort(m.maand)}</div>
            <div style={{ display: "flex", position: "relative", width: BREED, height: 18, borderBottom: `2px solid ${KLEUR.lijn}` }}>
              {leeg ? <div style={{ display: "flex", fontSize: 16, color: KLEUR.zacht }}>geen stemmingen</div> : <>
                <div style={{ display: "flex", position: "absolute", left: x(maandPct(m, derde)) - 6, top: 3, width: 12, height: 12, background: KLEUR.zacht }} />
                <div style={{ display: "flex", position: "absolute", left: x(maandPct(m, ander)) - 8, top: 1, width: 16, height: 16, borderRadius: 8, border: `3px solid ${KLEUR.tekst}`, background: KLEUR.achter }} />
                <div style={{ display: "flex", position: "absolute", left: x(maandPct(m, d.buiten)) - 8, top: 1, width: 16, height: 16, borderRadius: 8, background: KLEUR.koper }} />
              </>}
            </div>
            <div style={{ display: "flex", fontSize: 18, color: KLEUR.koper }}>{leeg ? "" : rond(maandPct(m, d.buiten))}</div>
          </div>
        );
      })}
      <div style={{ display: "flex", fontSize: 17, color: KLEUR.zacht, marginTop: 4 }}>
        {`Alleen tegenover de twee andere, aandeel verdeelde stemmingen (0 tot ${max}%) · koper: ${d.buiten} · open: ${ander} · vierkant: ${derde}`}
      </div>
    </div>
  );
}

const VOLGORDE: GroepNaam[] = ["kabinet", "zonder", "zonderAkkoord", "zonderSteun", "zonderBeide"];

function zonder(d: VerdeeldData) {
  const z = d.zonder, BREED = 360;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 16, color: KLEUR.zacht }}>
        <div style={{ display: "flex", width: 470 }} />
        <div style={{ display: "flex", width: 278 }}>{`zetels Tweede Kamer (streep: ${z.tk.meerderheid})`}</div>
        <div style={{ display: "flex" }}>hoe vaak eensgezind</div>
      </div>
      {VOLGORDE.map((n) => {
        const g = z.groepen[n], met = n === "kabinet", kleur = met ? LICHT : KLEUR.koper;
        return (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", width: 470, fontSize: 16, whiteSpace: "nowrap", color: met ? KLEUR.zacht : KLEUR.tekst }}>{groepNaam(d, n)}</div>
            <div style={{ display: "flex", position: "relative", width: 200, height: 22, background: KLEUR.vlak, borderRadius: 4 }}>
              <div style={{ display: "flex", width: (200 * g.tk) / 150, background: kleur, borderRadius: 4 }} />
              <div style={{ display: "flex", position: "absolute", left: (200 * z.tk.meerderheid) / 150, top: -4, width: 3, height: 32, background: KLEUR.goud }} />
            </div>
            <div style={{ display: "flex", width: 44, fontSize: 19 }}>{String(g.tk)}</div>
            <div style={{ display: "flex", width: BREED / 2, height: 22, background: KLEUR.vlak, borderRadius: 4 }}>
              <div style={{ display: "flex", width: ((BREED / 2) * (g.pct ?? 0)) / 100, background: kleur, borderRadius: 4 }} />
            </div>
            <div style={{ display: "flex", fontSize: 19 }}>{rond(g.pct)}</div>
          </div>
        );
      })}
      <div style={{ display: "flex", fontSize: 16, color: KLEUR.zacht }}>{`Eensgezind: op verdeelde stemmingen waarop alle fracties stemden · blauw: met de ${d.buiten}`}</div>
    </div>
  );
}

export const VERDEELD_PLAATJE: Record<string, (d: VerdeeldData) => React.ReactElement> = { maanden, zonder };

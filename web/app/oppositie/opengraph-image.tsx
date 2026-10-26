// Deelplaatje voor Oppositiewerk (E3-S5): de groei van het aantal moties en het aandeel dat de oppositie binnenhaalt,
// met bron en stand. Alleen cijfers uit de database.
import { ImageResponse } from "next/og";
import { datumTekst, laatstBijgewerkt } from "@/lib/api";
import { jaarWerk } from "@/lib/zetelwerk";

export const alt = "Wat kun je als je niet regeert? Zestien jaar moties van de oppositie.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Deelplaatje() {
  const [rijen, ververst] = await Promise.all([jaarWerk(), laatstBijgewerkt()]);
  const moties = (rijen ?? []).filter((r) => r.soort === "Motie");
  const jaren = [...new Set(moties.map((r) => r.jaar))].sort();
  const vol = jaren.filter((j) => j < new Date().getFullYear());
  const totaal = (j: number) => moties.filter((r) => r.jaar === j).reduce((t, r) => t + r.ingediend, 0);
  const opp = (j: number) => moties.find((r) => r.jaar === j && r.indiener_rol === "oppositie") ?? { ingediend: 0, aangenomen: 0 };
  const max = Math.max(1, ...jaren.map(totaal));
  const eerste = jaren[0], laatste = vol[vol.length - 1] ?? jaren[jaren.length - 1];
  const aandeel = (j: number) => (opp(j).ingediend ? Math.round((100 * opp(j).aangenomen) / opp(j).ingediend) : 0);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#070B18", color: "#E8ECF5", display: "flex", flexDirection: "column", padding: 72, gap: 22 }}>
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 8, color: "#D08A55" }}>ZETELEN · OPPOSITIEWERK</div>
        <div style={{ display: "flex", fontSize: 58, lineHeight: 1.08 }}>Wat kun je als je niet regeert?</div>
        {eerste && (
          <div style={{ display: "flex", fontSize: 30, color: "#A9B4CC" }}>
            {`Moties per jaar: ${totaal(eerste).toLocaleString("nl-NL")} in ${eerste}, ${totaal(laatste).toLocaleString("nl-NL")} in ${laatste}. Aangenomen van de oppositie: ${aandeel(eerste)}% en ${aandeel(laatste)}%.`}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 170 }}>
          {jaren.map((j) => (
            <div key={j} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", width: 46, height: Math.round((170 * totaal(j)) / max), background: "#d2bb5a", borderRadius: 4 }}>
              <div style={{ display: "flex", height: Math.round((170 * opp(j).ingediend) / max), background: "#7fb7c9", borderRadius: 4 }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: "auto", fontSize: 21, color: "#A9B4CC" }}>
          {`Blauw: moties van de oppositie · Bron: Tweede Kamer open data, eigen berekening · Stand: ${ververst ? datumTekst(ververst) : "onbekend"}`}
        </div>
      </div>
    ),
    size,
  );
}

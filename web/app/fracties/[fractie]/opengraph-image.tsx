// Deelplaatje per fractie (E3-S5): de drie fracties waarmee deze fractie onder het nieuwste kabinet
// het vaakst hetzelfde stemde, met periode, bron en datum. Alleen cijfers uit de database.
import { ImageResponse } from "next/og";
import { datumTekst, laatstBijgewerkt } from "@/lib/api";
import { alleFracties, cohesieIn, fractiesIn, perioden, procent, slug } from "@/lib/cohesie";
import { plaatjeInhoud } from "@/lib/deelplaatje";
import { schaalkleur } from "@/lib/kleur";

export const alt = "Met wie stemt deze fractie het vaakst hetzelfde?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Deelplaatje({ params }: { params: Promise<{ fractie: string }> }) {
  const s = (await params).fractie;
  const [alle, lijst, ververst] = await Promise.all([alleFracties(), perioden(), laatstBijgewerkt()]);
  const f = alle?.find((x) => slug(x.afkorting) === s);
  // Het nieuwste kabinet waarin deze fractie stemde
  const periode = lijst.find((p) => p.soort === "kabinet" && f?.perioden.some((q) => q.soort === "kabinet" && q.periode === p.naam));
  const [fracties, kaart] = f && periode ? await Promise.all([fractiesIn("kabinet", periode.naam), cohesieIn("kabinet", periode.naam, "alle")]) : [null, null];
  const inhoud = plaatjeInhoud(f?.afkorting ?? "deze fractie", fracties, kaart);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#070B18", color: "#E8ECF5", display: "flex", flexDirection: "column", padding: 72, gap: 28 }}>
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 8, color: "#D08A55" }}>ZETELEN</div>
        <div style={{ display: "flex", fontSize: 58, lineHeight: 1.08 }}>{inhoud.titel}</div>
        {inhoud.teWeinig ? (
          <div style={{ display: "flex", fontSize: 34, color: "#A9B4CC" }}>Te weinig stemmingen om iets te zeggen</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {inhoud.regels.map((r) => (
              <div key={r.afkorting} style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div style={{ display: "flex", width: 300, fontSize: 32 }}>{r.afkorting}</div>
                <div style={{ display: "flex", width: 560, height: 26, background: "#0B1226", borderRadius: 6 }}>
                  <div style={{ display: "flex", width: `${r.cohesie}%`, height: 26, background: schaalkleur(r.cohesie!), borderRadius: 6 }} />
                </div>
                <div style={{ display: "flex", fontSize: 32 }}>{procent(r.cohesie, 1)}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", marginTop: "auto", fontSize: 22, color: "#A9B4CC" }}>
          {`Kabinet-${periode?.naam ?? "?"} · alle stemmingen · Bron: Tweede Kamer open data, eigen berekening · Stand: ${ververst ? datumTekst(ververst) : "onbekend"}`}
        </div>
      </div>
    ),
    size,
  );
}

// Deelplaatje per combinatie (component coalitie-pagina, E3-S5): de gekozen groep, haar zetels en de drie
// partners die het vaakst beslissend waren, met periode, variant, bron en datum. Alleen cijfers uit de database.
import { ImageResponse } from "next/og";
import { datumTekst, laatstBijgewerkt, leesApi } from "@/lib/api";
import { DREMPEL, type Stemmatrix, bereken } from "@/lib/coalitie";
import { fractiesIn, getal, keuzeUitUrl, perioden, procent } from "@/lib/cohesie";
import { schaalkleur } from "@/lib/kleur";

const BREED = 1200, HOOG = 630;

export async function GET(verzoek: Request) {
  const zoek = Object.fromEntries(new URL(verzoek.url).searchParams);
  const [lijst, ververst] = await Promise.all([perioden(), laatstBijgewerkt()]);
  const { soort, periode } = keuzeUitUrl(zoek, lijst);
  const alleenVerdeeld = zoek.variant !== "alle";
  const fracties = periode ? await fractiesIn(soort, periode.naam) : null;
  const zaal = (fracties ?? []).filter((f) => f.inZaal);
  const groep = (zoek.groep ?? "").split(",").map((a) => zaal.find((f) => f.afkorting === a)).filter((f): f is NonNullable<typeof f> => !!f);
  const zetels = groep.reduce((t, f) => t + f.zetels, 0);
  const rij = periode && groep.length
    ? (await leesApi<Stemmatrix[]>(`stemmatrix?select=fracties,stemmen,zetels&periodesoort=eq.${soort}&periode=eq.${encodeURIComponent(periode.naam)}`))?.[0]
    : undefined;
  const uitkomst = rij ? bereken(rij, groep.map((f) => f.id), undefined, alleenVerdeeld) : null;
  const genoeg = !!uitkomst && uitkomst.eensgezind >= DREMPEL;
  const titel = groep.length ? `${groep.map((f) => f.afkorting).join(" + ")}: ${zetels} zetels` : "Welke partijen halen samen een meerderheid?";
  const regel = groep.length ? (zetels >= 76 ? "Een meerderheid in de Kamer" : `${76 - zetels} zetels tekort voor een meerderheid`) : "Stel zelf een groep fracties samen";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#070B18", color: "#E8ECF5", display: "flex", flexDirection: "column", padding: 72, gap: 24 }}>
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 8, color: "#D08A55" }}>ZETELEN · COALITIEBOUWER</div>
        <div style={{ display: "flex", fontSize: 56, lineHeight: 1.08 }}>{titel}</div>
        <div style={{ display: "flex", fontSize: 30, color: "#A9B4CC" }}>{regel}</div>
        {uitkomst && genoeg && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
            {uitkomst.partners.slice(0, 3).map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div style={{ display: "flex", width: 260, fontSize: 30 }}>{p.afkorting}</div>
                <div style={{ display: "flex", width: 420, height: 22, background: "#0B1226", borderRadius: 6 }}>
                  <div style={{ display: "flex", width: `${p.aandeel}%`, height: 22, background: schaalkleur(p.aandeel), borderRadius: 6 }} />
                </div>
                <div style={{ display: "flex", fontSize: 26 }}>{`${getal(p.beslissend)}× beslissend · ${procent(p.aandeel)} mee`}</div>
              </div>
            ))}
          </div>
        )}
        {uitkomst && !genoeg && <div style={{ display: "flex", fontSize: 30, color: "#A9B4CC" }}>Te weinig eensgezinde stemmingen om iets te zeggen</div>}
        <div style={{ display: "flex", marginTop: "auto", fontSize: 21, color: "#A9B4CC" }}>
          {`${periode ? (soort === "kabinet" ? `Kabinet-${periode.naam}` : periode.naam) : ""} · ${alleenVerdeeld ? "verdeelde stemmingen" : "alle stemmingen"} · Terugkijken, geen voorspelling · Bron: Tweede Kamer open data · Stand: ${ververst ? datumTekst(ververst) : "onbekend"}`}
        </div>
      </div>
    ),
    { width: BREED, height: HOOG, headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}

// Deelplaatje per blok van een Actueel-stuk (1200 x 630, next/og). Zelfde vier grafieken als op de pagina, in de
// stijl van de andere deelplaatjes (components/deel/plaatjes.tsx). Alleen flex-opmaak: next/og kent geen tabellen.
import { Kader, KLEUR, Melding, rond } from "@/components/deel/plaatjes";
import { type ActueelData, datumTekst, paar, stukVan, vierkantjes } from "@/lib/actueel";
import { schaalkleur, tekstOp } from "@/lib/kleur";

const Rij = ({ children, hoogte }: { children: React.ReactNode; hoogte?: number }) =>
  <div style={{ display: "flex", alignItems: "center", gap: 16, ...(hoogte ? { height: hoogte } : {}) }}>{children}</div>;

function hechtheid(d: ActueelData) {
  const alle = [...d.groep, ...d.tegen];
  const cel = (c: number | undefined) => (
    <div style={{ display: "flex", width: 120, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 6, fontSize: 24,
      background: c == null ? KLEUR.achter : schaalkleur(c), color: c == null ? KLEUR.zacht : tekstOp(schaalkleur(c)) }}>{c == null ? "" : rond(c)}</div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Rij><div style={{ display: "flex", width: 80 }} />{alle.slice(1).map((b) => <div key={b} style={{ display: "flex", width: 120, justifyContent: "center", fontSize: 20, color: KLEUR.zacht }}>{b}</div>)}</Rij>
      {alle.slice(0, -1).map((a, i) => (
        <Rij key={a}>
          <div style={{ display: "flex", width: 80, fontSize: 20, color: KLEUR.zacht }}>{a}</div>
          {alle.slice(1).map((b, j) => <div key={b} style={{ display: "flex" }}>{cel(j >= i ? paar(d, a, b)?.cohesie : undefined)}</div>)}
        </Rij>
      ))}
    </div>
  );
}

function meegaan(d: ActueelData) {
  const rijen = [...d.meegaan.fracties].sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
  const BREED = 760;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, justifyContent: "center" }}>
      {rijen.map((f) => {
        const groep = d.groep.includes(f.afkorting);
        return (
          <Rij key={f.afkorting} hoogte={36}>
            <div style={{ display: "flex", width: 90, fontSize: 24, color: groep ? KLEUR.koper : KLEUR.tekst }}>{f.afkorting}</div>
            <div style={{ display: "flex", position: "relative", width: BREED, height: 24, borderBottom: `2px solid ${KLEUR.lijn}` }}>
              <div style={{ display: "flex", position: "absolute", left: (BREED * (f.pct ?? 0)) / 100 - 12, top: 0, width: 24, height: 24, borderRadius: 12, background: groep ? KLEUR.koper : KLEUR.zacht }} />
            </div>
            <div style={{ display: "flex", fontSize: 24, color: groep ? KLEUR.koper : KLEUR.tekst }}>{rond(f.pct)}</div>
          </Rij>
        );
      })}
    </div>
  );
}

function botspunten(d: ActueelData) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, flex: 1, justifyContent: "center" }}>
      {d.botspunten.themas.map((t) => (
        <Rij key={t.thema}>
          <div style={{ display: "flex", width: 330, fontSize: 24 }}>{t.thema}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, width: 560 }}>
            {vierkantjes(t).map((x) => (
              <div key={x.besluit} style={{ display: "flex", width: 22, height: 22, borderRadius: 4,
                background: x.stand === "tegen" ? KLEUR.koper : KLEUR.achter, border: `2px solid ${x.stand === "tegen" ? KLEUR.koper : "#566AA6"}` }} />
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 24 }}>{`${t.tegenover} van ${t.beide}`}</div>
        </Rij>
      ))}
      <div style={{ display: "flex", fontSize: 20, color: KLEUR.zacht }}>Koper: tegenover elkaar · open: zelfde kant</div>
    </div>
  );
}

function zetelsom(d: ActueelData) {
  const z = d.zetelsom, BREED = 1060;
  const groep = [...d.groep].sort((a, b) => z.zetels[b] - z.zetels[a]);
  const vast = groep.filter((a) => z.kleinsteMeerderheid.every((c) => c.includes(a)));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1, justifyContent: "center" }}>
      <div style={{ display: "flex", position: "relative", width: BREED, height: 70, background: KLEUR.vlak, borderRadius: 6 }}>
        <div style={{ display: "flex", alignItems: "center", paddingLeft: 14, width: (BREED * z.ref) / 150, background: "#566AA6", color: KLEUR.achter, fontSize: 24 }}>{`Kabinet ${z.ref}`}</div>
        {groep.map((a) => (
          <div key={a} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: (BREED * z.zetels[a]) / 150, borderLeft: `3px solid ${KLEUR.achter}`,
            background: vast.includes(a) ? KLEUR.koper : "#8A5E3F", color: KLEUR.achter, fontSize: 18, whiteSpace: "nowrap" }}>{z.zetels[a] >= 6 ? `${a} ${z.zetels[a]}` : ""}</div>
        ))}
        <div style={{ display: "flex", position: "absolute", left: (BREED * z.meerderheid) / 150, top: -10, width: 3, height: 90, background: KLEUR.tekst }} />
      </div>
      <div style={{ display: "flex", fontSize: 22, color: KLEUR.zacht }}>
        {`${groep.filter((a) => z.zetels[a] < 6).map((a) => `${a} ${z.zetels[a]}`).join(" · ")} · streep: ${z.meerderheid} zetels`}
      </div>
    </div>
  );
}

const GRAFIEK: Record<string, (d: ActueelData) => React.ReactElement> = { hecht: hechtheid, mee: meegaan, wringt: botspunten, telt: zetelsom };

export async function actueelPlaatje(zoek: Record<string, string>) {
  const x = stukVan(zoek.stuk ?? "");
  if (!x) return <Kader kop="Actueel" titel="Het nieuws, naast de stemmingen" regel="" stand={null}><Melding tekst="Dit stuk bestaat niet" /></Kader>;
  const b = x.blokken.find((y) => y.id === zoek.blok);
  const stand = datumTekst(x.data.stand);
  if (!b) return <Kader kop="Actueel" titel={x.kop} regel={x.label.replace("Actueel · ", "")} stand={stand}>{botspunten(x.data)}</Kader>;
  return <Kader kop="Actueel" titel={b.kop} regel={`${b.vraag} · kabinet-${x.data.kabinet}`} stand={stand}>{GRAFIEK[b.id](x.data)}</Kader>;
}

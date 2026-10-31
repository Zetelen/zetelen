// Deelplaatje per blok van een Actueel-stuk (1200 x 630, next/og). Dezelfde vier grafieken als op de pagina, in de
// stijl van de andere deelplaatjes (components/deel/plaatjes.tsx). Alleen flex-opmaak: next/og kent geen tabellen.
import { Kader, KLEUR, Melding, rond } from "@/components/deel/plaatjes";
import { type ActueelData, datumTekst, opDrieThemas, perThema as themaVan, stukVan } from "@/lib/actueel";

const Rij = ({ children, hoogte }: { children: React.ReactNode; hoogte?: number }) =>
  <div style={{ display: "flex", alignItems: "center", gap: 16, ...(hoogte ? { height: hoogte } : {}) }}>{children}</div>;

const KORT: Record<string, string> = { "Asielopvang en spreidingswet": "Asiel", "Abortus, embryo, draagmoeder": "Abortus" };

function perThema(d: ActueelData) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, justifyContent: "center" }}>
      <Rij><div style={{ display: "flex", width: 90 }} />{d.perThema.map((t) => <div key={t.thema} style={{ display: "flex", width: 220, justifyContent: "center", fontSize: 22, color: KLEUR.zacht }}>{KORT[t.thema] ?? t.thema}</div>)}</Rij>
      {d.groep.map((a) => (
        <Rij key={a}>
          <div style={{ display: "flex", width: 90, fontSize: 24, color: KLEUR.koper }}>{a}</div>
          {d.perThema.map((t) => {
            const f = t.fracties.find((x) => x.afkorting === a)!;
            return (
              <div key={t.thema} style={{ display: "flex", position: "relative", width: 220, height: 60, borderRadius: 6, background: KLEUR.vlak, alignItems: "center", justifyContent: "center" }}>
                <div style={{ display: "flex", position: "absolute", left: 0, top: 0, bottom: 0, width: (220 * (f.pct ?? 0)) / 100, background: "#8A5E3F", borderRadius: 6 }} />
                <div style={{ display: "flex", position: "relative", fontSize: 26 }}>{t.thema === "Alles" ? rond(f.pct) : `${f.mee} van ${f.gestemd}`}</div>
              </div>
            );
          })}
        </Rij>
      ))}
      <div style={{ display: "flex", fontSize: 20, color: KLEUR.zacht }}>Hoe vaak mee met het eensgezinde kabinet</div>
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
  // Eerst de omkering, zoals op de pagina en in de video: per partij mee op de drie thema's, goud: over alles
  const alles = themaVan(d, "Alles")!;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26, flex: 1, justifyContent: "center" }}>
      {opDrieThemas(d).map((f) => (
        <Rij key={f.afkorting}>
          <div style={{ display: "flex", width: 330, fontSize: 28, color: KLEUR.koper }}>{f.afkorting}</div>
          <div style={{ display: "flex", position: "relative", width: 560, height: 44, background: KLEUR.vlak, borderRadius: 6 }}>
            <div style={{ display: "flex", width: (560 * (f.pct ?? 0)) / 100, background: KLEUR.koper, borderRadius: 6 }} />
            <div style={{ display: "flex", position: "absolute", left: (560 * (alles.fracties.find((x) => x.afkorting === f.afkorting)!.pct ?? 0)) / 100, top: -6, width: 4, height: 56, background: KLEUR.goud }} />
          </div>
          <div style={{ display: "flex", fontSize: 28 }}>{rond(f.pct)}</div>
        </Rij>
      ))}
      <div style={{ display: "flex", fontSize: 20, color: KLEUR.zacht }}>Balk: mee met het eensgezinde kabinet op de drie thema's · goud: over alle onderwerpen</div>
    </div>
  );
}

function zetelsom(d: ActueelData) {
  const z = d.zetelsom, BREED = 1060;
  const groep = [...d.groep].sort((a, b) => z.zetels[b] - z.zetels[a]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1, justifyContent: "center" }}>
      <div style={{ display: "flex", position: "relative", width: BREED, height: 70, background: KLEUR.vlak, borderRadius: 6 }}>
        <div style={{ display: "flex", alignItems: "center", paddingLeft: 14, width: (BREED * z.ref) / 150, background: "#566AA6", color: KLEUR.achter, fontSize: 24 }}>{`Kabinet ${z.ref}`}</div>
        {groep.map((a) => (
          <div key={a} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: (BREED * z.zetels[a]) / 150, borderLeft: `3px solid ${KLEUR.achter}`,
            background: KLEUR.koper, color: KLEUR.achter, fontSize: 18, whiteSpace: "nowrap" }}>{z.zetels[a] >= 6 ? `${a} ${z.zetels[a]}` : ""}</div>
        ))}
        <div style={{ display: "flex", position: "absolute", left: (BREED * z.meerderheid) / 150, top: -10, width: 3, height: 90, background: KLEUR.tekst }} />
      </div>
      <div style={{ display: "flex", fontSize: 22, color: KLEUR.zacht }}>
        {`${groep.filter((a) => z.zetels[a] < 6).map((a) => `${a} ${z.zetels[a]}`).join(" · ")} · samen ${z.samen} · streep: ${z.meerderheid} zetels · Eerste Kamer niet meegeteld`}
      </div>
    </div>
  );
}

const GRAFIEK: Record<string, (d: ActueelData) => React.ReactElement> = { mee: meegaan, wringt: botspunten, abortus: perThema, telt: zetelsom };

export async function actueelPlaatje(zoek: Record<string, string>) {
  const x = stukVan(zoek.stuk ?? "");
  if (!x) return <Kader kop="Actueel" titel="Het nieuws, naast de stemmingen" regel="" stand={null}><Melding tekst="Dit stuk bestaat niet" /></Kader>;
  const b = x.blokken.find((y) => y.id === zoek.blok);
  const stand = datumTekst(x.data.stand);
  if (!b) return <Kader kop="Actueel" titel={x.kop} regel={x.label.replace("Actueel · ", "")} stand={stand}>{botspunten(x.data)}</Kader>;
  return <Kader kop="Actueel" titel={b.kop} regel={`${b.vraag} · kabinet-${x.data.kabinet}`} stand={stand}>{GRAFIEK[b.id](x.data)}</Kader>;
}

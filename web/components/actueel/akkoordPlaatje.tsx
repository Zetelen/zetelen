// Deelplaatjes (1200 x 630, next/og) voor het Actueel-stuk "akkoord-belastingplan": dezelfde vijf grafieken als op de
// pagina (AkkoordBlokken.tsx), in de stijl van plaatje.tsx. Alleen flex-opmaak: next/og kent geen tabellen.
import { KLEUR, rond } from "@/components/deel/plaatjes";
import { type AkkoordData, type UitslagStemming, buitenVan, plannenVan, stemmingVan } from "@/lib/actueel";

const Rij = ({ children, hoogte }: { children: React.ReactNode; hoogte?: number }) =>
  <div style={{ display: "flex", alignItems: "center", gap: 16, ...(hoogte ? { height: hoogte } : {}) }}>{children}</div>;
const LICHT = "#566AA6"; // kabinet buiten de vier, zoals de zetelbalk in plaatje.tsx

const kleurVan = (d: AkkoordData, afk: string) => (d.kamers.vier.includes(afk) ? KLEUR.koper : d.tegen.includes(afk) ? LICHT : KLEUR.vlak);

function Kamer({ d, label, fracties, totaal, meerderheid, breed = 860, hoogte = 48 }: { d: AkkoordData; label: string; fracties: Array<{ afkorting: string; zetels: number }>; totaal: number; meerderheid: number; breed?: number; hoogte?: number }) {
  return (
    <Rij hoogte={hoogte + 8}>
      <div style={{ display: "flex", width: 200, fontSize: 24, color: KLEUR.zacht }}>{label}</div>
      <div style={{ display: "flex", position: "relative", width: breed, height: hoogte, background: KLEUR.achter, border: `1px solid ${KLEUR.lijn}`, borderRadius: 6 }}>
        {fracties.map((f) => (
          <div key={f.afkorting} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: (breed * f.zetels) / totaal, borderRight: `2px solid ${KLEUR.achter}`,
            background: kleurVan(d, f.afkorting), color: d.kamers.vier.includes(f.afkorting) || d.tegen.includes(f.afkorting) ? KLEUR.achter : KLEUR.zacht, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden" }}>
            {(breed * f.zetels) / totaal >= 44 ? f.afkorting : ""}
          </div>
        ))}
        <div style={{ display: "flex", position: "absolute", left: (breed * meerderheid) / totaal, top: -6, width: 3, height: hoogte + 12, background: KLEUR.goud }} />
      </div>
    </Rij>
  );
}

function uitslag(d: AkkoordData) {
  const st = [stemmingVan(d, "amendement"), stemmingVan(d, "wet")].filter((x): x is UitslagStemming => !!x);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, justifyContent: "center" }}>
      {st.map((x) => (
        <div key={x.rol} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{ display: "flex", fontSize: 20, color: KLEUR.koper }}>{`${x.rol === "amendement" ? "Amendement" : "Belastingplan 2027"} · ${x.aangenomen ? "aangenomen" : "verworpen"}`}</div>
          {(["Voor", "Tegen"] as const).map((k) => (
            <Kamer key={k} d={d} label={`${k} ${k === "Voor" ? x.voor : x.tegen}`} fracties={x.fracties.filter((f) => f.stem === k)} totaal={150} meerderheid={d.kamers.tk.meerderheid} hoogte={30} />
          ))}
        </div>
      ))}
    </div>
  );
}

// Blok "plannen": negentien smalle balken van 150 zetels, het plan van dit stuk in koper
function plannen(d: AkkoordData) {
  const p = plannenVan(d);
  if (!p) return <div style={{ display: "flex" }} />;
  const BREED = 760, H = Math.min(16, Math.floor(330 / p.lijst.length) - 4);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, justifyContent: "center" }}>
      {p.lijst.map((x) => {
        const nu = x === p.nu;
        return (
          <Rij key={x.plan} hoogte={H + 4}>
            <div style={{ display: "flex", width: 80, fontSize: 18, color: nu ? KLEUR.koper : KLEUR.zacht }}>{x.plan}</div>
            <div style={{ display: "flex", position: "relative", width: BREED, height: H, background: KLEUR.achter, border: `1px solid ${KLEUR.lijn}`, borderRadius: 3 }}>
              <div style={{ display: "flex", width: (BREED * x.voor) / 150, background: nu ? KLEUR.koper : LICHT, borderRadius: 3 }} />
              <div style={{ display: "flex", position: "absolute", left: (BREED * 76) / 150, top: -3, width: 2, height: H + 6, background: KLEUR.goud }} />
            </div>
            <div style={{ display: "flex", fontSize: 18, color: nu ? KLEUR.koper : KLEUR.tekst }}>{`${x.voor}-${x.tegen}`}</div>
          </Rij>
        );
      })}
      <div style={{ display: "flex", fontSize: 18, color: KLEUR.zacht, marginTop: 6 }}>{`Zetels voor, eindstemming per Belastingplan · streep: meerderheid (76) · bron: open data van de Tweede Kamer`}</div>
    </div>
  );
}

function balken(rijen: Array<{ naam: string; pct: number; licht?: boolean }>, schaal = 100, naamBreed = 330) {
  const BREED = 560;
  return rijen.map((r) => (
    <Rij key={r.naam}>
      <div style={{ display: "flex", width: naamBreed, fontSize: 24, color: r.licht ? KLEUR.zacht : KLEUR.koper }}>{r.naam}</div>
      <div style={{ display: "flex", width: BREED, height: 30, background: KLEUR.vlak, borderRadius: 6 }}>
        <div style={{ display: "flex", width: (BREED * r.pct) / schaal, background: r.licht ? LICHT : KLEUR.koper, borderRadius: 6 }} />
      </div>
      <div style={{ display: "flex", fontSize: 24 }}>{rond(r.pct)}</div>
    </Rij>
  ));
}

function partners(d: AkkoordData) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, justifyContent: "center" }}>
      {balken(d.partners.paren.map((p) => ({ naam: `${p.kabinetspartij} en ${p.partner}`, pct: p.cohesie })))}
      {balken([{ naam: `${d.partners.binnen[0].a} en ${d.partners.binnen[0].b} (kabinet)`, pct: d.partners.binnen[0].cohesie, licht: true }])}
      <div style={{ display: "flex", fontSize: 20, color: KLEUR.zacht }}>Dezelfde kant op verdeelde stemmingen · blauw: het laagste paar binnen het kabinet</div>
    </div>
  );
}

function buiten(d: AkkoordData) {
  const max = Math.ceil(Math.max(...d.buiten.kabinetten.map((k) => k.pct)) / 10) * 10;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, justifyContent: "center" }}>
      {balken(d.buiten.kabinetten.map((k) => ({ naam: k.gedoog ? `${k.kabinet} (met gedoogpartner)` : k.kabinet, pct: k.pct, licht: k.kabinet !== d.kabinet })), max, 380)}
      <div style={{ display: "flex", fontSize: 20, color: KLEUR.zacht }}>
        {`Aandeel verdeelde stemmingen · ${d.kabinet} per partij: ${buitenVan(d, d.kabinet).partijen.map((p) => `${p.afkorting} ${rond(p.pct)}`).join(", ")}`}
      </div>
    </div>
  );
}

function kamers(d: AkkoordData) {
  const k = d.kamers, met = [...k.vier, k.buiten];
  const rij = (z: Record<string, number>) => met.map((x) => ({ afkorting: x, zetels: z[x] ?? 0 })).filter((f) => f.zetels > 0);
  const zonder = k.routes.find((r) => r.zonder === k.buiten)!;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, justifyContent: "center" }}>
      <Kamer d={d} label="Tweede Kamer" fracties={rij(k.tk.zetels)} totaal={150} meerderheid={k.tk.meerderheid} />
      <Kamer d={d} label="Eerste Kamer" fracties={rij(k.ek.zetels)} totaal={k.ek.totaal} meerderheid={k.ek.meerderheid} />
      <div style={{ display: "flex", fontSize: 22, color: KLEUR.zacht }}>
        {`Koper: ${k.vier.join(", ")} · blauw: ${k.buiten} · streep: meerderheid · Eerste Kamer: ${k.ek.bron}`}
      </div>
      <div style={{ display: "flex", fontSize: 22, color: KLEUR.zacht }}>
        {`Hechtste meerderheid zonder de ${k.buiten} in de Tweede Kamer: ${rond(zonder.pct)} eensgezind, kabinet ${rond(k.kabinet.pct)}`}
      </div>
    </div>
  );
}

function toen(d: AkkoordData) {
  const t13 = d.toen["2013"], t12 = d.toen["2012"], BREED = 600;
  const p = (v: { fracties: Array<{ afkorting: string; pct: number | null }> }, x: string) => v.fracties.find((f) => f.afkorting === x)!.pct ?? 0;
  // Op het plaatje alleen de partijen van het akkoord en de gedoogpartner van 2012; de andere oppositie als regel eronder
  const rijen = [
    ...t13.partners.map((x) => ({ naam: `${x} (${t13.akkoord.slice(0, 4)})`, voor: p(t13.voor, x), na: p(t13.na, x), groep: true })),
    { naam: `${t12.partij} (${t12.akkoord.slice(0, 4)})`, voor: p(t12.voor, t12.partij), na: p(t12.na, t12.partij), groep: false },
  ];
  const ander = Math.max(...t13.anderen.map((x) => Math.abs(p(t13.na, x) - p(t13.voor, x))));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, justifyContent: "center" }}>
      {rijen.map((r) => (
        <Rij key={r.naam} hoogte={36}>
          <div style={{ display: "flex", width: 260, fontSize: 22, color: r.groep ? KLEUR.koper : KLEUR.tekst }}>{r.naam}</div>
          <div style={{ display: "flex", position: "relative", width: BREED, height: 22, borderBottom: `2px solid ${KLEUR.lijn}` }}>
            <div style={{ display: "flex", position: "absolute", left: (BREED * Math.min(r.voor, r.na)) / 100, top: 9, width: (BREED * Math.abs(r.na - r.voor)) / 100, height: 3, background: KLEUR.koper }} />
            <div style={{ display: "flex", position: "absolute", left: (BREED * r.voor) / 100 - 10, top: 1, width: 20, height: 20, borderRadius: 10, border: `3px solid ${KLEUR.zacht}`, background: KLEUR.achter }} />
            <div style={{ display: "flex", position: "absolute", left: (BREED * r.na) / 100 - 10, top: 1, width: 20, height: 20, borderRadius: 10, background: KLEUR.koper }} />
          </div>
          <div style={{ display: "flex", fontSize: 22 }}>{`${Math.round(r.voor)} → ${rond(r.na)}`}</div>
        </Rij>
      ))}
      <div style={{ display: "flex", fontSize: 20, color: KLEUR.zacht, marginTop: 6 }}>{`Mee met het eensgezinde kabinet · open: voor het akkoord · vol: erna · andere oppositie ${t13.akkoord.slice(0, 4)}: hooguit ${Math.round(ander)} procentpunt`}</div>
    </div>
  );
}

export const AKKOORD_PLAATJE: Record<string, (d: AkkoordData) => React.ReactElement> = { uitslag, plannen, partners, buiten, kamers, toen };

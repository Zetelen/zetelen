// Lezingen (proef, niet in het menu): de vier lezingen die Claude aanraadt (docs/plan/lezingen-kandidaten.md),
// elk met een visualisatie op echte data en de twee lezingen naast elkaar. Bedoeld om te kiezen welke vast in
// het verhaal komen; daarna verhuizen ze naar de voorpagina en de tools.
import type { Metadata } from "next";
import Link from "next/link";
import { Bronregel } from "@/components/cohesie/Bronregel";
import { Inhoud } from "@/components/Kader";
import { Halter, LijnKabinetten, type Reeks } from "@/components/lezingen/Grafieken";
import { Lezingen } from "@/components/Onderdelen";
import { Data, Label, SectieKop, Tekst } from "@/components/Typografie";
import { leesApi } from "@/lib/api";
import type { Stemmatrix } from "@/lib/coalitie";
import { cohesieIn, fractiesIn } from "@/lib/cohesie";
import { meestemmen } from "@/lib/lezingen";
import { cohesiePerTerrein } from "@/lib/onderwerpen";
import { sleutel } from "@/lib/zaal";
import s from "@/components/lezingen/lezingen.module.css";

export const metadata: Metadata = { title: "Lezingen (proef)", robots: { index: false, follow: false } };

const KABINETTEN = ["Rutte I", "Rutte II", "Rutte III", "Rutte IV", "Schoof", "Jetten"];
const PAREN: Array<[string, string, string]> = [
  ["VVD", "D66", "#7fb7c9"], ["VVD", "PvdA", "#e57f93"], ["CDA", "ChristenUnie", "#a08fe0"], ["VVD", "PVV", "#d2bb5a"],
];
const KABINET_NU = "Jetten";

export default async function LezingenProef() {
  const [coalitie, matrix, fracties, kaart] = await Promise.all([
    leesApi<Array<{ kabinet: string; afkorting: string; rol: string }>>("coalitie?select=kabinet,afkorting,rol"),
    leesApi<Stemmatrix[]>(`stemmatrix?select=*&periodesoort=eq.kabinet&periode=eq.${KABINET_NU}`),
    fractiesIn("kabinet", KABINET_NU),
    cohesieIn("kabinet", KABINET_NU, "alle"),
  ]);
  const reeksen: Reeks[] = await Promise.all(PAREN.map(async ([a, b, tint]) => {
    const rijen = await leesApi<Array<{ periode: string; cohesie: number | null }>>(
      `cohesie?select=periode,cohesie&periodesoort=eq.kabinet&variant=eq.alle&fractie_afkorting=eq.${encodeURIComponent(a)}&andere_fractie_afkorting=eq.${encodeURIComponent(b)}`,
    );
    const inKabinet = (k: string, f: string) => (coalitie ?? []).some((c) => c.kabinet === k && c.afkorting === f && c.rol === "kabinet");
    return {
      naam: `${a} en ${b}`, tint,
      punten: KABINETTEN.map((k) => ({ kabinet: k, waarde: rijen?.find((r) => r.periode === k)?.cohesie ?? null, samen: inKabinet(k, a) && inKabinet(k, b) })),
    };
  }));
  const vvdD66 = reeksen[0].punten;
  const waarde = (k: string) => Math.round(vvdD66.find((p) => p.kabinet === k)?.waarde ?? 0);

  // Lezing 1 en 2: de grootste kabinetsfracties onder Jetten
  const groep = (coalitie ?? []).filter((c) => c.kabinet === KABINET_NU && c.rol === "kabinet").map((c) => c.afkorting);
  const m = matrix?.[0] ? meestemmen(matrix[0], groep) : null;
  const oppositie = m ? m.fracties.filter((f) => !groep.includes(f.afkorting) && (fracties ?? []).some((x) => x.afkorting === f.afkorting && x.inZaal)).slice(0, 12) : [];

  // Lezing 6: asiel tegenover alle stemmingen, per paar fracties onder Jetten
  const zaal = (fracties ?? []).filter((f) => f.inZaal);
  const asiel = await Promise.all(zaal.map(async (f) => ({ f, t: await cohesiePerTerrein("kabinet", KABINET_NU, "alle", f.id) })));
  const paren: Array<{ naam: string; a: number; b: number; verschil: number }> = [];
  for (const { f, t } of asiel) {
    for (const g of zaal) {
      if (f.afkorting >= g.afkorting) continue;
      const p = t?.get("Asiel en migratie")?.get(g.id);
      const alg = kaart?.get(sleutel(f.id, g.id));
      if (!p || p.teWeinig || p.cohesie == null || p.gezamenlijk < 50 || alg?.cohesie == null) continue;
      paren.push({ naam: `${f.afkorting} en ${g.afkorting}`, a: alg.cohesie, b: p.cohesie, verschil: p.cohesie - alg.cohesie });
    }
  }
  paren.sort((x, y) => x.verschil - y.verschil);
  const asielRijen = [...paren.slice(0, 5), ...paren.slice(-5)];

  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", maxWidth: 860 }}>
        <Label>Lezingen · proef</Label>
        <SectieKop>Hetzelfde cijfer, twee verhalen</SectieKop>
        <Tekst>
          Bij elk cijfer op Zetelen horen twee lezingen: allebei te verdedigen, en jij kiest. Op deze proefpagina staan de vier
          sterkste kandidaten, met de cijfers erbij. Welke komen vast in het verhaal?
        </Tekst>
        <Data>Niet in het menu. Achtergrond en de andere vier kandidaten: docs/plan/lezingen-kandidaten.md.</Data>
      </section>

      <section className={s.lezing}>
        <Label>Lezing 3 · samen regeren</Label>
        <SectieKop>Eens, of gewoon samen in het kabinet?</SectieKop>
        <Tekst>
          VVD en D66 stemden onder Rutte II {waarde("Rutte II")}% hetzelfde, onder Rutte III, toen ze samen regeerden, {waarde("Rutte III")}%,
          onder Schoof weer {waarde("Schoof")}%, en onder Jetten {waarde("Jetten")}%. Een gouden stip: samen in het kabinet.
        </Tekst>
        <LijnKabinetten kabinetten={KABINETTEN} reeksen={reeksen} label="Hoe vaak paren fracties hetzelfde stemden, per kabinet" />
        <Lezingen
          links={{ titel: "Ze liggen dicht bij elkaar", tekst: "Partijen die vaak hetzelfde stemmen, delen veel standpunten. Daarom gingen ze ook samen regeren." }}
          rechts={{ titel: "Het regeerakkoord stemt mee", tekst: "Zodra partijen samen regeren, stijgt hun overeenstemming met twintig punten; zodra ze uit elkaar gaan, daalt die weer. Het akkoord verklaart meer dan de standpunten." }}
        />
        <Data><Link href="/verkenner?fractie=VVD">Kijk zelf in de verkenner</Link></Data>
      </section>

      {m && (
        <section className={s.lezing}>
          <Label>Lezing 1 en 2 · steun voor een minderheidskabinet</Label>
          <SectieKop>Stemt de oppositie mee, als het erop aankomt?</SectieKop>
          <Tekst>
            {groep.join(", ").replace(/, ([^,]*)$/, " en $1")} stemden onder kabinet-{KABINET_NU} {m.eensgezind.toLocaleString("nl-NL")} keer eensgezind op een
            verdeelde stemming en wonnen er {Math.round((100 * m.gewonnen) / m.eensgezind)}% van. Maar op de {m.krappe} krappe stemmingen (een verschil van
            hooguit 10 zetels) stemde de oppositie veel minder vaak mee.
          </Tekst>
          <Halter rijen={oppositie.map((f) => ({ naam: f.afkorting, a: f.alle, b: f.krap }))}
            a={{ naam: "meegestemd, alle verdeelde stemmingen", tint: "#7fb7c9" }} b={{ naam: "meegestemd, krappe stemmingen", tint: "#e0915a" }}
            label="Hoe vaak oppositiefracties met het kabinet meestemden, alle tegenover krappe stemmingen" />
          <Lezingen
            links={{ titel: "Een minderheidskabinet vindt steun", tekst: `Het kabinet wint ${Math.round((100 * m.gewonnen) / m.eensgezind)}% van zijn eensgezinde stemmingen. Een groot deel van de oppositie stemt vaak mee.` }}
            rechts={{ titel: "Maar niet als het spannend wordt", tekst: `Op de krappe stemmingen hangt het kabinet aan een paar fracties: dan stemt vooral ${oppositie.slice().sort((x, y) => y.krap - x.krap).slice(0, 2).map((f) => f.afkorting).join(" en ")} nog mee. De steun is minder breed dan het lijkt.` }}
          />
          <Data>
            Let op: een stemming is krap juist doordat weinig fracties meestemmen. Dat de oppositie daar minder vaak meestemt, volgt dus
            deels uit de definitie. Wat het laat zien, is wíe er dan nog meestemt.
          </Data>
          <Data><Link href={`/coalitie?soort=kabinet&periode=${KABINET_NU}&groep=${groep.join(",")}`}>Kijk zelf in de coalitiebouwer</Link></Data>
        </section>
      )}

      {asielRijen.length > 0 && (
        <section className={s.lezing}>
          <Label>Lezing 6 · asiel</Label>
          <SectieKop>Splijt asiel de Kamer, of sluit het de flanken aaneen?</SectieKop>
          <Tekst>
            Per paar fracties onder kabinet-{KABINET_NU}: hoe vaak ze hetzelfde stemden over alles, en over asiel en migratie. Bovenaan de paren die
            bij asiel het verst uit elkaar gaan, onderaan de paren die juist dichter bij elkaar komen.
          </Tekst>
          <Halter rijen={asielRijen.map((p) => ({ naam: p.naam, a: p.a, b: p.b }))}
            a={{ naam: "alle stemmingen", tint: "#b9bfcc" }} b={{ naam: "asiel en migratie", tint: "#e57f93" }}
            label="Hoe vaak paren fracties hetzelfde stemden, over alles en over asiel" />
          <Lezingen
            links={{ titel: "Asiel splijt", tekst: "Fracties die het op andere terreinen redelijk eens zijn, staan bij asiel lijnrecht tegenover elkaar." }}
            rechts={{ titel: "Asiel sluit de flanken aaneen", tekst: "Aan beide kanten zoeken fracties elkaar juist op: wie het over asiel eens is, stemt daar nog vaker samen dan gemiddeld." }}
          />
          <Data><Link href="/onderwerpen">Kijk zelf per onderwerp</Link></Data>
        </section>
      )}
      <Bronregel toelichting="Zelfde berekeningen als de verkenner, Onderwerpen en de coalitiebouwer; alle stemmingen, tenzij anders vermeld." />
    </Inhoud>
  );
}

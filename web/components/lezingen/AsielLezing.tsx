// Lezing 6 bij Onderwerpen (besluit Niels B4, 26 oktober 2026): klap je Asiel en migratie open, dan zie je voor het
// gekozen paar hoe vaak ze hetzelfde stemden over alles en over asiel, en voor de hele Kamer de paren die bij asiel
// het verst uit elkaar gaan en het dichtst naar elkaar toe komen. Twee lezingen: asiel splijt, of sluit de flanken aaneen.
import { Lezingen } from "@/components/Onderdelen";
import { Data, Label, Tekst } from "@/components/Typografie";
import { type Periodesoort, type Variant, cohesieIn, fractiesIn } from "@/lib/cohesie";
import { cohesiePerTerrein } from "@/lib/onderwerpen";
import { sleutel } from "@/lib/zaal";
import { Halter } from "./Grafieken";
import s from "./lezingen.module.css";

export const ASIEL = "Asiel en migratie";

type Fractie = { id: string; afkorting: string };

export async function AsielLezing({ soort, periode, variant, a, b }: { soort: Periodesoort; periode: string; variant: Variant; a: Fractie; b: Fractie }) {
  const [fracties, kaart] = await Promise.all([fractiesIn(soort, periode), cohesieIn(soort, periode, variant)]);
  if (!fracties || !kaart) return null;
  const zaal = fracties.filter((f) => f.inZaal);
  const perFractie = await Promise.all(zaal.map(async (f) => ({ f, t: await cohesiePerTerrein(soort, periode, variant, f.id) })));
  // Alle paren met genoeg stemmingen over asiel (50 of meer samen) en een cohesie over alles
  const paren: Array<{ naam: string; a: number; b: number; verschil: number }> = [];
  for (const { f, t } of perFractie) {
    for (const g of zaal) {
      if (f.afkorting >= g.afkorting) continue;
      const p = t?.get(ASIEL)?.get(g.id);
      const alg = kaart.get(sleutel(f.id, g.id));
      if (!p || p.teWeinig || p.cohesie == null || p.gezamenlijk < 50 || alg?.cohesie == null) continue;
      paren.push({ naam: `${f.afkorting} en ${g.afkorting}`, a: alg.cohesie, b: p.cohesie, verschil: p.cohesie - alg.cohesie });
    }
  }
  if (paren.length < 6) return null;
  paren.sort((x, y) => x.verschil - y.verschil);
  const rijen = [...paren.slice(0, 5), ...paren.slice(-5)];
  const ditPaar = paren.find((p) => p.naam === `${a.afkorting} en ${b.afkorting}` || p.naam === `${b.afkorting} en ${a.afkorting}`);
  return (
    <section className={s.lezing} aria-label="Twee lezingen over asiel">
      <Label>Twee lezingen · asiel</Label>
      {ditPaar && (
        <Tekst>
          {a.afkorting} en {b.afkorting} stemden {soort === "kabinet" ? `onder kabinet-${periode}` : `in de Kamerperiode ${periode}`} over alles{" "}
          {Math.round(ditPaar.a)}% hetzelfde, over asiel en migratie{" "}
          {Math.round(ditPaar.b)}%.
        </Tekst>
      )}
      <Data>Voor de hele Kamer: bovenaan de paren die bij asiel het verst uit elkaar gaan, onderaan de paren die juist dichter bij elkaar komen. Alleen paren met minstens 50 asielstemmingen samen.</Data>
      <Halter rijen={rijen.map((p) => ({ naam: p.naam, a: p.a, b: p.b }))}
        a={{ naam: "alle stemmingen", tint: "#b9bfcc" }} b={{ naam: "asiel en migratie", tint: "#e57f93" }}
        label="Hoe vaak paren fracties hetzelfde stemden, over alles en over asiel" />
      <Lezingen
        links={{ titel: "Asiel splijt", tekst: "Fracties die het op andere terreinen redelijk eens zijn, staan bij asiel lijnrecht tegenover elkaar." }}
        rechts={{ titel: "Asiel sluit de flanken aaneen", tekst: "Aan beide kanten zoeken fracties elkaar juist op: wie het over asiel eens is, stemt daar nog vaker samen dan gemiddeld." }}
      />
    </section>
  );
}

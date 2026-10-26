// Rijen voor de bullet chart op /fracties: zetels bij het begin van de periode, met de
// overstappers als apart deel van de balk, en de fracties die tijdens de periode ontstonden.
import type { FractieInPeriode, Overstap } from "./cohesie";

export type Deel = { naar: string; leden: number };
export type BalkRij = { fractie: FractieInPeriode; zetels: number; gebleven: number; delen: Deel[] };
export type Nieuw = { fractie: FractieInPeriode; uit: Array<{ van: string; leden: number }> };

export function balken(fracties: FractieInPeriode[], overstappen: Overstap[]): { rijen: BalkRij[]; nieuw: Nieuw[] } {
  const rijen = fracties
    .filter((f) => f.bijBegin && f.zetelsBegin > 0)
    .map((f) => {
      // Optellen per afkorting: de bron heeft soms twee fracties met dezelfde afkorting (bijvoorbeeld na een herstart)
      const perNaar = new Map<string, number>();
      for (const o of overstappen) if (o.van === f.afkorting) perNaar.set(o.naar, (perNaar.get(o.naar) ?? 0) + o.leden);
      const delen = [...perNaar].map(([naar, leden]) => ({ naar, leden })).sort((a, b) => b.leden - a.leden);
      // Meer overstappers dan zetels kan bij vervanging binnen de periode; begrens op de zetels
      const weg = Math.min(delen.reduce((t, d) => t + d.leden, 0), f.zetelsBegin);
      return { fractie: f, zetels: f.zetelsBegin, gebleven: f.zetelsBegin - weg, delen };
    })
    .sort((a, b) => b.zetels - a.zetels || a.fractie.afkorting.localeCompare(b.fractie.afkorting));
  const nieuw = fracties
    .filter((f) => !f.bijBegin && f.zetels > 0)
    .map((f) => ({
      fractie: f,
      uit: overstappen.filter((o) => o.naar === f.afkorting).map((o) => ({ van: o.van, leden: o.leden })),
    }))
    .sort((a, b) => b.fractie.zetels - a.fractie.zetels);
  return { rijen, nieuw };
}

// Alle video's van Zetelen. Per casus het vaste format ("Stemming-..."), plus een variant met een eigen invalshoek
// waar die past, en de tijdlijn. 9:16, 30 beelden per seconde.
import { Composition } from "remotion";
import { CASUS_LIJST } from "./gegevens";
import { BREED, FPS, HOOG } from "./stijl";
import { EenFractie, duurEenFractie } from "./videos/EenFractie";
import { DUUR_GELIJK, GelijkeStand } from "./videos/GelijkeStand";
import { DUUR_HOEFIJZER, Hoefijzer } from "./videos/Hoefijzer";
import { DUUR_STEMMING, Stemming } from "./videos/Stemming";
import { DUUR_TIJDLIJN, Tijdlijn } from "./videos/Tijdlijn";
import { Weegschaal, duurWeegschaal } from "./videos/Weegschaal";
import { DUUR_VVD_PRO, VvdEnPro } from "./videos/VvdEnPro";

// Welke variant bij welke casus past
export const VARIANTEN: Array<{ id: string; slug: string; soort: "Weegschaal" | "Hoefijzer" | "GelijkeStand" | "EenFractie" }> = [
  { id: "Weegschaal-gehandicaptenzorg", slug: "gehandicaptenzorg", soort: "Weegschaal" },
  { id: "Weegschaal-live-weddenschappen", slug: "live-weddenschappen", soort: "Weegschaal" },
  { id: "Hoefijzer-mercosur", slug: "mercosur", soort: "Hoefijzer" },
  { id: "GelijkeStand-studievoorschot", slug: "studievoorschot", soort: "GelijkeStand" },
  { id: "EenFractie-ritueel-slachten", slug: "ritueel-slachten", soort: "EenFractie" },
  { id: "EenFractie-motie-eerdmans", slug: "motie-eerdmans", soort: "EenFractie" },
];

// Duur per casus: bij de weegschaal hangt die af van het aantal fracties
const DUUR: Record<string, (slug: string) => number> = {
  Weegschaal: duurWeegschaal, Hoefijzer: () => DUUR_HOEFIJZER, GelijkeStand: () => DUUR_GELIJK, EenFractie: duurEenFractie,
};
const COMPONENT = { Weegschaal, Hoefijzer, GelijkeStand, EenFractie };

export function Root() {
  return (
    <>
      {VARIANTEN.map((v) => (
        <Composition key={v.id} id={v.id} component={COMPONENT[v.soort]} defaultProps={{ slug: v.slug }}
          durationInFrames={DUUR[v.soort](v.slug)} fps={FPS} width={BREED} height={HOOG} />
      ))}
      {CASUS_LIJST.map((c) => (
        <Composition key={c.slug} id={`Stemming-${c.slug}`} component={Stemming} defaultProps={{ slug: c.slug }}
          durationInFrames={DUUR_STEMMING} fps={FPS} width={BREED} height={HOOG} />
      ))}
      <Composition id="Tijdlijn" component={Tijdlijn} durationInFrames={DUUR_TIJDLIJN} fps={FPS} width={BREED} height={HOOG} />
      {/* Uitgelicht: hoe vaak stemmen VVD en PRO hetzelfde? (28 oktober 2026) */}
      <Composition id="VvdEnPro" component={VvdEnPro} durationInFrames={DUUR_VVD_PRO} fps={FPS} width={BREED} height={HOOG} />
    </>
  );
}

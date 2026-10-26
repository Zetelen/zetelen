import type { MetadataRoute } from "next";
import { alleFracties, slug } from "@/lib/cohesie";
import { PAGINAS, siteUrl } from "@/lib/site";
import { UITGELICHT } from "@/lib/uitgelichtLijst";

// Vaste pagina's plus de detailpagina's per fractie en per uitgelichte stemming (SEO-audit 26 oktober).
// Zonder database (zoals in CI) blijven alleen de fractiepagina's weg.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (pad: string) => new URL(pad, siteUrl()).toString();
  // alleFracties geeft een rij per fractie; de Set is een vangnet tegen dubbele slugs
  const fracties = [...new Set(((await alleFracties()) ?? []).map((f) => slug(f.afkorting)))];
  return [
    ...PAGINAS.map((pad) => ({ url: url(pad) })),
    ...fracties.map((s) => ({ url: url(`/fracties/${s}`) })),
    ...UITGELICHT.map((u) => ({ url: url(`/uitgelicht/${u.slug}`) })),
    { url: url("/uitgelicht/hoe-lang-duurt-een-wet") },
  ];
}

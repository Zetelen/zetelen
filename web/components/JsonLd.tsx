// Structured data (schema.org als JSON-LD) voor zoekmachines (SEO-audit 26 oktober). Het teken < wordt
// geëscaped, zodat tekst uit de gegevens het script-blok niet kan sluiten.
import { DOMEIN, SITE } from "@/lib/site";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

// De maker, zoals op /over
export const MAKER = { "@type": "Person", name: SITE.maker, url: `${DOMEIN}/over` };

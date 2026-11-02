// Ontvangt een melding van de klikteller (lib/klik.ts) en geeft die door aan api.stuur_klik (migratie 029), op de
// server. Het apparaat wordt hier uit de user agent afgeleid en alleen als mobiel, tablet of desktop doorgegeven; het
// land komt van Vercel (x-vercel-ip-country). Geen IP-adres, geen user agent, geen cookie.
import { apparaatVan, schoneVia } from "@/lib/klik";

export async function POST(verzoek: Request) {
  let invoer: Record<string, unknown>;
  try {
    invoer = await verzoek.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const soort = invoer?.soort === "klik" || invoer?.soort === "blijft" ? invoer.soort : null;
  const via = schoneVia(invoer?.via);
  const grafiek = typeof invoer?.grafiek === "string" && /^[a-z][a-z-]{0,39}$/.test(invoer.grafiek) ? invoer.grafiek : null;
  if (!soort || !via) return new Response(null, { status: 400 });
  const land = verzoek.headers.get("x-vercel-ip-country");

  const basis = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
  const sleutel = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!basis || !sleutel) return new Response(null, { status: 503 });
  try {
    const antwoord = await fetch(`${basis}/rest/v1/rpc/stuur_klik`, {
      method: "POST",
      headers: { apikey: sleutel, "Content-Profile": "api", "Content-Type": "application/json" },
      body: JSON.stringify({
        soort, via, grafiek,
        apparaat: apparaatVan(verzoek.headers.get("user-agent")),
        land: land && /^[A-Z]{2}$/.test(land) ? land : null,
      }),
      cache: "no-store",
    });
    return new Response(null, { status: antwoord.ok ? 204 : 400 });
  } catch {
    return new Response(null, { status: 503 });
  }
}

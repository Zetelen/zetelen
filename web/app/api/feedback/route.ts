// Ontvangt het feedbackformulier en geeft het door aan api.stuur_feedback (migratie 021), op de server, zodat de
// publieke sleutel niet in de browser hoeft. Slaat geen IP-adres of browsergegevens op. Het veld "website" is een
// valkuil voor spambots: mensen zien het niet; is het gevuld, dan doen we alsof het gelukt is en slaan niets op.
import { schoonAntwoorden, schoonSnel } from "@/lib/feedback";

export async function POST(verzoek: Request) {
  let invoer: Record<string, unknown>;
  try {
    invoer = await verzoek.json();
  } catch {
    return Response.json({ fout: "ongeldig" }, { status: 400 });
  }
  if (typeof invoer?.website === "string" && invoer.website.trim()) return Response.json({ ok: true });
  // Het volledige formulier, of de snelle vraag onderaan een pagina (soort "snel", met het adres van de pagina)
  const snel = invoer?.soort === "snel" ? schoonSnel(invoer?.antwoorden, invoer?.pad) : null;
  const antwoorden = snel ? snel.antwoorden : invoer?.soort === "snel" ? null : schoonAntwoorden(invoer?.antwoorden);
  if (!antwoorden) return Response.json({ fout: "leeg" }, { status: 400 });

  const basis = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
  const sleutel = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!basis || !sleutel) return Response.json({ fout: "niet bereikbaar" }, { status: 503 });
  try {
    const antwoord = await fetch(`${basis}/rest/v1/rpc/stuur_feedback`, {
      method: "POST",
      headers: { apikey: sleutel, "Content-Profile": "api", "Content-Type": "application/json" },
      body: JSON.stringify({ pagina: snel ? snel.pagina : "formulier", antwoorden }),
      cache: "no-store",
    });
    if (antwoord.ok) return Response.json({ ok: true });
    const tekst = await antwoord.text();
    if (tekst.includes("54000")) return Response.json({ fout: "druk" }, { status: 429 });
    return Response.json({ fout: "geweigerd" }, { status: 400 });
  } catch {
    return Response.json({ fout: "niet bereikbaar" }, { status: 503 });
  }
}

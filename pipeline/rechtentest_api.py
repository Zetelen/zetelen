#!/usr/bin/env python3
"""Rechtentest van buitenaf: doet wat een bezoeker kan, via de Data API van Supabase (component rechten).

Gebruikt de publieke anon-sleutel, net als straks de website. Alleen lezen uit schema api mag
lukken, plus de ene functie van het feedbackformulier; schrijven, wijzigen, verwijderen, andere schema's
lezen en andere functies aanroepen moet falen.

Gebruik:
  SUPABASE_URL=https://<project>.supabase.co SUPABASE_ANON_KEY=... python3 pipeline/rechtentest_api.py
"""
import json
import os
import sys
import urllib.error
import urllib.request


def verzoek(basis, sleutel, methode, pad, profiel, body=None):
    """Geeft de HTTP-status en de body terug, ook bij een fout."""
    headers = {"apikey": sleutel, "Accept": "application/json"}
    if sleutel.startswith("eyJ"):
        # Oude anon-sleutel (JWT) gaat ook als Authorization mee; een publishable key niet
        headers["Authorization"] = f"Bearer {sleutel}"
    headers["Accept-Profile" if methode == "GET" else "Content-Profile"] = profiel
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(f"{basis}/rest/v1/{pad}", data=data, headers=headers, method=methode)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


# (omschrijving, methode, pad, schema, body, moet lukken)
# Wijzigen en verwijderen met een filter dat niets raakt: lukt het toch (HTTP 2xx), dan is dat een lek,
# maar er verandert geen data.
PROEVEN = [
    ("Kabinetten lezen uit api", "GET", "kabinet?select=naam", "api", None, True),
    ("Fracties lezen uit api", "GET", "fractie?select=afkorting&limit=1", "api", None, True),
    ("Laatst bijgewerkt lezen uit api", "GET", "laatst_bijgewerkt", "api", None, True),
    ("Cohesie lezen uit api", "GET", "cohesie?select=cohesie&limit=1", "api", None, True),
    ("Eensgezindheid lezen uit api", "GET", "eensgezindheid?select=hoofdelijk&limit=1", "api", None, True),
    ("Fracties per periode lezen uit api", "GET", "fractie_periode?select=afkorting&limit=1", "api", None, True),
    ("Kabinet per fractie lezen uit api", "GET", "coalitie?select=afkorting&limit=1", "api", None, True),
    ("Overstappers lezen uit api", "GET", "overstap?select=van&limit=1", "api", None, True),
    ("Cohesie per beleidsterrein lezen uit api", "GET", "cohesie_terrein?select=beleidsterrein&limit=1", "api", None, True),
    ("Stemmingen per beleidsterrein lezen uit api", "GET", "beleidsterrein_periode?select=beleidsterrein&limit=1", "api", None, True),
    ("Stemmingen per dossier lezen uit api", "GET", "stemming_dossier?select=dossier&limit=1", "api", None, True),
    ("Zetelwerk per fractie lezen uit api", "GET", "zetelwerk_fractie?select=afkorting&limit=1", "api", None, True),
    ("Zetelwerk per Kamerlid lezen uit api", "GET", "zetelwerk_persoon?select=naam&limit=1", "api", None, True),
    ("Stemmatrix lezen uit api", "GET", "stemmatrix?select=periode&limit=1", "api", None, True),
    ("Tussenstap analyses lezen", "GET", "fractie_besluit_stem?limit=1", "analyses", None, False),
    ("Kabinet toevoegen", "POST", "kabinet", "api", {"naam": "x", "begin": "2030-01-01"}, False),
    ("Kabinet wijzigen", "PATCH", "kabinet?naam=eq.bestaat-niet", "api", {"naam": "x"}, False),
    ("Kabinet verwijderen", "DELETE", "kabinet?naam=eq.bestaat-niet", "api", None, False),
    ("Raw lezen", "GET", "stemming?limit=1", "raw", None, False),
    ("Core rechtstreeks lezen", "GET", "kabinet?limit=1", "core", None, False),
    ("Beheer lezen", "GET", "verversing?limit=1", "beheer", None, False),
    ("Herbouw aanroepen", "POST", "rpc/herbouw", "core", {}, False),
    # Feedbackformulier (migratie 021): de proef controleert zonder een rij toe te voegen
    ("Feedback controleren (proef, geen rij)", "POST", "rpc/stuur_feedback", "api",
     {"pagina": "rechtentest", "antwoorden": {"indruk": "proef"}, "proef": True}, True),
    ("Feedback met ongeldige invoer", "POST", "rpc/stuur_feedback", "api",
     {"pagina": "rechtentest", "antwoorden": "geen object", "proef": True}, False),
    ("Feedback lezen", "GET", "feedback?limit=1", "beheer", None, False),
]


def main():
    basis = os.environ.get("SUPABASE_URL", "").strip().rstrip("/")
    sleutel = os.environ.get("SUPABASE_ANON_KEY", "").strip()
    if not basis or not sleutel:
        sys.exit("SUPABASE_URL of SUPABASE_ANON_KEY ontbreekt (GitHub-variabelen).")
    fout = False
    for naam, methode, pad, profiel, body, moet_lukken in PROEVEN:
        status, inhoud = verzoek(basis, sleutel, methode, pad, profiel, body)
        gelukt = 200 <= status < 300
        goed = gelukt if moet_lukken else not gelukt
        # Kabinetten lezen moet ook echt rijen opleveren: een lege lijst wijst op een te streng leesbeleid
        if moet_lukken and pad.startswith("kabinet") and inhoud.strip() == b"[]":
            goed = False
        print(f"{'GOED' if goed else 'FOUT'}  {naam}: HTTP {status} (verwacht: {'lukt' if moet_lukken else 'geweigerd'})")
        fout = fout or not goed
    if fout:
        sys.exit("Rechtentest via de API mislukt.")
    print("Rechtentest via de API geslaagd.")


if __name__ == "__main__":
    main()

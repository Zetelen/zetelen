#!/usr/bin/env python3
"""Eerste laad van de raw-laag (component ingest, stap C).

Laadt per entiteit alle pagina's uit de Tweede Kamer OData API in schema raw,
met een upsert op Id. Na elke pagina wordt het skiptoken in raw.laadstatus
bewaard, in dezelfde transactie als de rijen: een onderbroken laad gaat verder
waar hij was en levert geen dubbele rijen op.

Stopt netjes bij de tijdslimiet (opnieuw starten gaat verder) of bij de
groottegrens (dan beslist Niels over Supabase Pro). De log bevat alleen
aantallen, duur en grootte, nooit waarden uit records.

Gebruik:
  DATABASE_URL=... python3 pipeline/laad.py --entiteiten klein
  DATABASE_URL=... python3 pipeline/laad.py --entiteiten Stemming --max-minuten 330 --max-mb 450
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import psycopg

from api_check import BASE, lees_metadata
from raw_schema import ENTITEITEN, METADATA, kolommen, tabelnaam

VANAF = "2010-01-01T00:00:00Z"

# Datumfilter per entiteit (pad naar een datumveld); None = volledig laden.
# Zaak en ZaakActor zonder filter: een zaak van voor 2010 kan na 2010 gestemd zijn.
FILTERPAD = {
    "Stemming": "Besluit/Agendapunt/Activiteit/Datum",
    "Besluit": "Agendapunt/Activiteit/Datum",
    "Agendapunt": "Activiteit/Datum",
    "Activiteit": "Datum",
    "ActiviteitActor": "Activiteit/Datum",
    "Vergadering": "Datum",
    "Document": "Datum",
    "Zaak": None,
    "ZaakActor": None,
    "Persoon": None,
    "Fractie": None,
    "FractieZetel": None,
    "FractieZetelPersoon": None,
    "Commissie": None,
}

KLEIN = ["Fractie", "Commissie", "Persoon", "FractieZetel", "FractieZetelPersoon"]
# Volgorde voor "alle": klein eerst, dan de grote entiteiten
VOLGORDE = KLEIN + [
    "Vergadering", "Activiteit", "Agendapunt", "Besluit", "Stemming",
    "ActiviteitActor", "Zaak", "ZaakActor", "Document",
]

PAUZE = 0.1                    # seconden tussen pagina's
HERHAAL_NA = [5, 30, 120]      # seconden wachten bij een netwerk- of serverfout
GROOTTE_ELKE = 10              # databasegrootte controleren na elk zoveelste pagina
VOORTGANG_ELKE = 200           # voortgang loggen na elk zoveelste pagina


def http_json(url):
    """Haalt JSON op, met herhalen bij netwerkfouten en 5xx/429."""
    req = urllib.request.Request(
        url, headers={"Accept": "application/json", "User-Agent": "zetelen-ingest/1.0"}
    )
    for poging, wacht in enumerate([0] + HERHAAL_NA):
        time.sleep(wacht)
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code < 500 and e.code != 429:
                raise RuntimeError(f"HTTP {e.code} van de API") from None
            fout = f"HTTP {e.code}"
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            fout = type(e).__name__
        print(f"  API-fout ({fout}), poging {poging + 1} van {len(HERHAAL_NA) + 1}", flush=True)
    raise RuntimeError(f"API bleef falen na {len(HERHAAL_NA) + 1} pogingen")


def mb(n):
    return f"{n / 1_000_000:,.1f}".replace(",", "_").replace(".", ",").replace("_", ".")


def getal(n):
    return f"{n:,}".replace(",", ".")


def filtertekst(entiteit, ook_verwijderd=False):
    """Datumfilter van een entiteit. Met ook_verwijderd komen verwijderde records ook buiten het filter mee:
    bij een verwijdering maakt de bron soms de koppeling leeg (bijvoorbeeld Activiteit_Id), en dan valt het
    record buiten het datumpad en zou de verwijdering nooit binnenkomen (gevonden 26 oktober 2026)."""
    pad = FILTERPAD[entiteit]
    if not pad:
        return None
    return f"({pad} ge {VANAF} or Verwijderd eq true)" if ook_verwijderd else f"{pad} ge {VANAF}"


def basis_url(entiteit, cols, base=BASE, extra_filter=None, ook_verwijderd=False):
    """URL van de eerste pagina. Geen $top: alleen zonder $top geeft de API een volgende-link.
    extra_filter wordt met 'and' aan het datumfilter toegevoegd (gebruikt door de verversing)."""
    params = {"$select": ",".join(c for c, _ in cols)}
    flt = " and ".join(f for f in (filtertekst(entiteit, ook_verwijderd), extra_filter) if f)
    if flt:
        params["$filter"] = flt
    if entiteit == "Besluit":
        params["$expand"] = "Zaak($select=Id)"
    return f"{base}/{entiteit}?" + urllib.parse.urlencode(params, quote_via=urllib.parse.quote)


def telling_url(entiteit, base=BASE):
    params = {"$top": "0", "$count": "true"}
    flt = filtertekst(entiteit)
    if flt:
        params["$filter"] = flt
    return f"{base}/{entiteit}?" + urllib.parse.urlencode(params, quote_via=urllib.parse.quote)


def skiptoken_uit(next_link):
    return urllib.parse.parse_qs(urllib.parse.urlsplit(next_link).query)["$skiptoken"][0]


def upsert_sql(entiteit, cols):
    namen = [c for c, _ in cols]
    kolomlijst = ", ".join(f'"{n}"' for n in namen)
    plekken = ", ".join(["%s"] * len(namen))
    bijwerken = ", ".join(f'"{n}" = excluded."{n}"' for n in namen if n != "Id")
    return (
        f"insert into {tabelnaam(entiteit)} ({kolomlijst}) values ({plekken}) "
        f'on conflict ("Id") do update set {bijwerken}, _geladen_op = now()'
    )


def schrijf_pagina(conn, entiteit, cols, records, skiptoken, voortgang=True):
    """Rijen, koppelingen en (bij de eerste laad) de voortgang in een transactie."""
    namen = [c for c, _ in cols]
    with conn.transaction():
        with conn.cursor() as cur:
            cur.executemany(upsert_sql(entiteit, cols), [[r.get(n) for n in namen] for r in records])
            if entiteit == "Besluit":
                ids = [r["Id"] for r in records]
                cur.execute('delete from raw.besluit_zaak where "Besluit_Id" = any(%s::uuid[])', (ids,))
                links = [(r["Id"], z["Id"]) for r in records for z in r.get("Zaak") or []]
                if links:
                    cur.executemany(
                        'insert into raw.besluit_zaak ("Besluit_Id", "Zaak_Id") values (%s, %s) '
                        "on conflict do nothing",
                        links,
                    )
            if voortgang:
                cur.execute(
                    "update raw.laadstatus set skiptoken = %s, bijgewerkt_op = now() where entiteit = %s",
                    (skiptoken, entiteit),
                )


def database_grootte(conn):
    return conn.execute("select pg_database_size(current_database())").fetchone()[0]


def laad_entiteit(conn, entiteit, cols, haal=http_json, base=BASE,
                  moet_stoppen=lambda: False, max_bytes=None, grootte_elke=GROOTTE_ELKE, pauze=PAUZE):
    """Laadt een entiteit. Geeft 'al klaar', 'klaar', 'tijd' of 'grootte' terug."""
    rij = conn.execute(
        "select skiptoken, eerste_laad_klaar_op from raw.laadstatus where entiteit = %s", (entiteit,)
    ).fetchone()
    if rij and rij[1] is not None:
        print(f"{entiteit}: eerste laad al klaar, overgeslagen")
        return "al klaar"
    if rij is None:
        # Startpunt voor de dagelijkse verversing: alles wat vanaf nu wijzigt, haalt stap D op
        conn.execute(
            "insert into raw.laadstatus (entiteit, laatste_api_gewijzigd_op) values (%s, now())",
            (entiteit,),
        )
        skiptoken = None
    else:
        skiptoken = rij[0]

    url = basis_url(entiteit, cols, base)
    if skiptoken:
        url += "&$skiptoken=" + urllib.parse.quote(skiptoken, safe="")
        print(f"{entiteit}: hervat na eerdere onderbreking")
    start = time.monotonic()
    paginas = rijen = 0
    while True:
        if moet_stoppen():
            print(f"{entiteit}: tijdslimiet bereikt na {getal(paginas)} pagina's; start opnieuw om verder te gaan")
            return "tijd"
        if max_bytes is not None and paginas % grootte_elke == 0 and database_grootte(conn) > max_bytes:
            print(f"{entiteit}: groottegrens van {mb(max_bytes)} MB bereikt; gestopt")
            return "grootte"
        data = haal(url)
        records = data.get("value", [])
        volgende = data.get("@odata.nextLink")
        skiptoken = skiptoken_uit(volgende) if volgende else None
        if records:
            schrijf_pagina(conn, entiteit, cols, records, skiptoken)
        paginas += 1
        rijen += len(records)
        if paginas % VOORTGANG_ELKE == 0:
            print(f"  {entiteit}: {getal(rijen)} rijen, {getal(paginas)} pagina's, "
                  f"{(time.monotonic() - start) / 60:.0f} min", flush=True)
        if not volgende:
            break
        time.sleep(pauze)
        url = basis_url(entiteit, cols, base) + "&$skiptoken=" + urllib.parse.quote(skiptoken, safe="")

    conn.execute(
        "update raw.laadstatus set skiptoken = null, eerste_laad_klaar_op = now(), bijgewerkt_op = now() "
        "where entiteit = %s",
        (entiteit,),
    )
    minuten = (time.monotonic() - start) / 60
    tabel = conn.execute("select pg_total_relation_size(%s)", (tabelnaam(entiteit),)).fetchone()[0]
    print(f"{entiteit}: klaar, {getal(rijen)} rijen in {getal(paginas)} pagina's, "
          f"{minuten:.0f} min, tabel {mb(tabel)} MB, database {mb(database_grootte(conn))} MB")
    return "klaar"


def controleer_aantal(conn, entiteit, haal=http_json, base=BASE):
    """Vergelijkt het aantal rijen in de tabel met de telling in de API (zelfde filter)."""
    api = haal(telling_url(entiteit, base))["@odata.count"]
    db = conn.execute(f"select count(*) from {tabelnaam(entiteit)}").fetchone()[0]
    oordeel = "gelijk" if api == db else f"AFWIJKING van {getal(db - api)}"
    print(f"{entiteit}: database {getal(db)}, API {getal(api)}: {oordeel}")
    return api == db


def kies_entiteiten(tekst):
    if tekst == "klein":
        return KLEIN
    if tekst == "alle":
        return VOLGORDE
    gekozen = [e.strip() for e in tekst.split(",") if e.strip()]
    onbekend = [e for e in gekozen if e not in ENTITEITEN]
    if onbekend:
        sys.exit(f"Onbekende entiteit: {', '.join(onbekend)}. Kies uit: {', '.join(ENTITEITEN)}")
    return gekozen


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--entiteiten", default="klein", help="'klein', 'alle' of een lijst met komma's")
    parser.add_argument("--max-minuten", type=float, default=330)
    parser.add_argument("--max-mb", type=float, default=450)
    args = parser.parse_args()

    url = os.environ.get("DATABASE_URL")
    if not url:
        sys.exit("DATABASE_URL ontbreekt.")
    meta = lees_metadata(Path(METADATA).read_bytes())
    entiteiten = kies_entiteiten(args.entiteiten)
    deadline = time.monotonic() + args.max_minuten * 60
    max_bytes = args.max_mb * 1_000_000

    afwijking = False
    with psycopg.connect(url, autocommit=True) as conn:
        for entiteit in entiteiten:
            status = laad_entiteit(
                conn, entiteit, kolommen(meta, entiteit),
                moet_stoppen=lambda: time.monotonic() > deadline, max_bytes=max_bytes,
            )
            if status == "tijd":
                # Niet meteen stoppen: een afwijking bij een eerder klare entiteit moet nog gemeld worden
                break
            if status == "grootte":
                sys.exit("Gestopt op de groottegrens. Beslis over Supabase Pro voordat je verder laadt.")
            if status == "klaar" and not controleer_aantal(conn, entiteit):
                afwijking = True
        print(f"Databasegrootte na deze run: {mb(database_grootte(conn))} MB")
    if afwijking:
        sys.exit("Aantallen wijken af van de API; zie de regels hierboven.")


if __name__ == "__main__":
    main()

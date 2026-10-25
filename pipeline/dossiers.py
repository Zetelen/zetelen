#!/usr/bin/env python3
"""Kamerstukdossiers en de koppeling zaak en dossier (component onderwerpen).

Laadt alle Kamerstukdossiers (ongeveer 8.000, elke run volledig) in raw.kamerstukdossier, en per zaak
de dossiers waar die zaak bij hoort in raw.zaak_kamerstukdossier. Niet voor alle zaken: alleen
  1. zaken waarover gestemd is (de stemmingen krijgen zo een dossier), en
  2. zaken met een echte vaste commissie als voortouwcommissie (niet 'TK'), waaruit per dossier
     de commissie en dus het beleidsterrein volgt (core.herbouw_dossiers()).
De eerste keer volledig (een paar honderd pagina's), daarna alleen zaken die in de API gewijzigd zijn
sinds de vorige run, met een uur marge. De voortgang staat in raw.laadstatus onder 'ZaakKamerstukdossier'.
De log bevat alleen aantallen.

Gebruik (los; normaal draait het mee in pipeline/ververs.py):
  DATABASE_URL=... python3 pipeline/dossiers.py
"""
import datetime as dt
import os
import sys
import time
import urllib.parse
from pathlib import Path

import psycopg

from api_check import BASE, lees_metadata
from laad import PAUZE, getal, http_json, skiptoken_uit
from raw_schema import METADATA, kolommen

KOPPELING = "ZaakKamerstukdossier"  # naam in raw.laadstatus
MARGE = dt.timedelta(hours=1)
FILTERS = [
    "Besluit/any(b: b/Stemming/any())",
    "ZaakActor/any(a: a/Relatie eq 'Voortouwcommissie' and a/ActorNaam ne 'TK') and Kamerstukdossier/any()",
]


def pagineer(url, haal, pauze):
    """Alle pagina's van een OData-verzoek; levert per pagina de records."""
    while True:
        data = haal(url)
        yield data.get("value", [])
        volgende = data.get("@odata.nextLink")
        if not volgende:
            return
        time.sleep(pauze)
        url = url.split("&$skiptoken=")[0] + "&$skiptoken=" + urllib.parse.quote(skiptoken_uit(volgende), safe="")


def laad_dossiers(conn, cols, haal=http_json, base=BASE, pauze=PAUZE):
    """Alle Kamerstukdossiers, met een upsert op Id. Geeft het aantal records terug."""
    namen = [c for c, _ in cols]
    sql = (
        f"insert into raw.kamerstukdossier ({', '.join(chr(34) + n + chr(34) for n in namen)}) "
        f"values ({', '.join(['%s'] * len(namen))}) "
        f'on conflict ("Id") do update set '
        + ", ".join(f'"{n}" = excluded."{n}"' for n in namen if n != "Id")
        + ", _geladen_op = now()"
    )
    url = f"{base}/Kamerstukdossier?" + urllib.parse.urlencode({"$select": ",".join(namen)}, quote_via=urllib.parse.quote)
    rijen = 0
    for records in pagineer(url, haal, pauze):
        if records:
            with conn.transaction(), conn.cursor() as cur:
                cur.executemany(sql, [[r.get(n) for n in namen] for r in records])
            rijen += len(records)
    print(f"Kamerstukdossier: {getal(rijen)} dossiers")
    return rijen


def koppel_url(base, flt, sinds=None):
    if sinds:
        flt = f"({flt}) and ApiGewijzigdOp ge {sinds}"
    params = {"$select": "Id", "$filter": flt, "$expand": "Kamerstukdossier($select=Id)"}
    return f"{base}/Zaak?" + urllib.parse.urlencode(params, quote_via=urllib.parse.quote)


def schrijf_koppelingen(conn, records):
    """Vervangt per zaak de koppelingen door die uit de API."""
    ids = [r["Id"] for r in records]
    links = [(r["Id"], k["Id"]) for r in records for k in r.get("Kamerstukdossier") or []]
    with conn.transaction(), conn.cursor() as cur:
        cur.execute('delete from raw.zaak_kamerstukdossier where "Zaak_Id" = any(%s::uuid[])', (ids,))
        if links:
            cur.executemany(
                'insert into raw.zaak_kamerstukdossier ("Zaak_Id", "Kamerstukdossier_Id") values (%s, %s) '
                "on conflict do nothing",
                links,
            )
    return len(links)


def laad_koppelingen(conn, haal=http_json, base=BASE, pauze=PAUZE):
    """Koppelingen zaak en dossier: de eerste keer alles, daarna alleen gewijzigde zaken."""
    run_start = dt.datetime.now(dt.timezone.utc)
    rij = conn.execute(
        "select laatste_api_gewijzigd_op from raw.laadstatus where entiteit = %s and eerste_laad_klaar_op is not null",
        (KOPPELING,),
    ).fetchone()
    sinds = (rij[0] - MARGE).astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ") if rij else None
    zaken = links = 0
    for flt in FILTERS:
        for records in pagineer(koppel_url(base, flt, sinds), haal, pauze):
            if records:
                links += schrijf_koppelingen(conn, records)
                zaken += len(records)
    # Pas na een volledige run het startpunt verschuiven: bij een fout haalt de volgende run meer op
    conn.execute(
        "insert into raw.laadstatus (entiteit, laatste_api_gewijzigd_op, eerste_laad_klaar_op, bijgewerkt_op) "
        "values (%s, %s, now(), now()) on conflict (entiteit) do update "
        "set laatste_api_gewijzigd_op = excluded.laatste_api_gewijzigd_op, "
        "eerste_laad_klaar_op = coalesce(raw.laadstatus.eerste_laad_klaar_op, now()), bijgewerkt_op = now()",
        (KOPPELING, run_start),
    )
    soort = f"gewijzigd sinds {sinds}" if sinds else "volledig"
    print(f"Zaak en dossier ({soort}): {getal(zaken)} zaken, {getal(links)} koppelingen")
    return zaken


def ververs_dossiers(conn, meta, haal=http_json, base=BASE, pauze=PAUZE):
    """Dossiers en koppelingen; geeft het aantal opgehaalde records terug."""
    return (laad_dossiers(conn, kolommen(meta, "Kamerstukdossier"), haal=haal, base=base, pauze=pauze)
            + laad_koppelingen(conn, haal=haal, base=base, pauze=pauze))


def main():
    url = os.environ.get("DATABASE_URL")
    if not url:
        sys.exit("DATABASE_URL ontbreekt.")
    meta = lees_metadata(Path(METADATA).read_bytes())
    with psycopg.connect(url, autocommit=True) as conn:
        ververs_dossiers(conn, meta)


if __name__ == "__main__":
    main()

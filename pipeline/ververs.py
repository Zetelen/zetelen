#!/usr/bin/env python3
"""Dagelijkse incrementele verversing van de raw-laag (component ingest, stap D).

Haalt per entiteit alleen de records op waarvan ApiGewijzigdOp na de vorige
verversing ligt (met een uur marge), binnen hetzelfde datumfilter als de eerste
laad, en schrijft ze met dezelfde upsert weg. Verwijderingen komen zo ook mee:
de API zet dan de vlag Verwijderd en werkt ApiGewijzigdOp bij.

Entiteiten waarvan de eerste laad nog niet klaar is, worden overgeslagen.
De log bevat alleen aantallen en duur.

Daarna de Kamerstukdossiers en de koppeling zaak en dossier (pipeline/dossiers.py, component onderwerpen).
Na de raw-laag worden de core-laag (core.herbouw() en core.herbouw_dossiers()) en de
analyse-laag (analyses.herbouw() en analyses.herbouw_terrein()) opnieuw opgebouwd,
zodat de analyses altijd op de verse data draaien. Daarna volgen de
datakwaliteitscontroles (component datakwaliteit); een harde fout laat de run falen.

Bewaking (component bewaking): elke run krijgt een rij in beheer.verversing, en
het script stuurt signalen naar healthchecks.io (HEALTHCHECK_URL): /start bij
de start, de kale URL bij succes en /fail bij een fout. Blijft het
succes-signaal uit, dan mailt healthchecks. Zonder HEALTHCHECK_URL geen signalen.

Gebruik:
  DATABASE_URL=... python3 pipeline/ververs.py
"""
import datetime as dt
import os
import sys
import time
import traceback
import urllib.parse
import urllib.request
from pathlib import Path

import psycopg

from api_check import BASE, lees_metadata
from dossiers import ververs_dossiers
from laad import PAUZE, VOLGORDE, getal, http_json, basis_url, mb, database_grootte, schrijf_pagina, skiptoken_uit
from raw_schema import METADATA, kolommen
from verbindingstest import uitleg

MARGE = dt.timedelta(hours=1)  # overlap met de vorige run; de upsert maakt dubbel ophalen onschadelijk


def odata_tijd(t):
    return t.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def ververs_entiteit(conn, entiteit, cols, haal=http_json, base=BASE, pauze=PAUZE):
    """Geeft het aantal opgehaalde records terug, of None als de eerste laad nog niet klaar is."""
    rij = conn.execute(
        "select laatste_api_gewijzigd_op, eerste_laad_klaar_op from raw.laadstatus where entiteit = %s",
        (entiteit,),
    ).fetchone()
    if rij is None or rij[1] is None:
        print(f"{entiteit}: eerste laad nog niet klaar, overgeslagen")
        return None
    run_start = conn.execute("select now()").fetchone()[0]
    sinds = odata_tijd(rij[0] - MARGE)
    eerste = basis_url(entiteit, cols, base, extra_filter=f"ApiGewijzigdOp ge {sinds}")
    url = eerste
    rijen = 0
    while True:
        data = haal(url)
        records = data.get("value", [])
        if records:
            schrijf_pagina(conn, entiteit, cols, records, None, voortgang=False)
        rijen += len(records)
        volgende = data.get("@odata.nextLink")
        if not volgende:
            break
        time.sleep(pauze)
        url = eerste + "&$skiptoken=" + urllib.parse.quote(skiptoken_uit(volgende), safe="")
    # Pas na een volledige entiteit het startpunt verschuiven: bij een fout haalt de volgende run meer op, maar mist niets
    conn.execute(
        "update raw.laadstatus set laatste_api_gewijzigd_op = %s, bijgewerkt_op = now() where entiteit = %s",
        (run_start, entiteit),
    )
    print(f"{entiteit}: {getal(rijen)} gewijzigde records sinds {sinds}")
    return rijen


def ping(pad=""):
    """Signaal naar healthchecks.io. Een mislukt signaal laat de verversing niet falen.
    De URL komt nooit in de log: wie hem kent, kan valse signalen sturen."""
    # strip: een geplakt geheim eindigt vaak op een regeleinde of spatie
    url = (os.environ.get("HEALTHCHECK_URL") or "").strip()
    if not url:
        return
    try:
        urllib.request.urlopen(url.rstrip("/") + pad, timeout=10).close()
    except Exception as e:
        # Alleen veilige details: schema en host, nooit het pad (dat is het geheime deel)
        delen = urllib.parse.urlsplit(url)
        reden = getattr(e, "code", None) or getattr(e, "reason", None) or ""
        if not isinstance(reden, (int, str)):
            reden = type(reden).__name__
        print(f"Healthcheck-signaal{pad} niet verstuurd ({type(e).__name__} {reden}; "
              f"schema '{delen.scheme}', host '{delen.hostname}')")


def start_log(conn):
    return conn.execute("insert into beheer.verversing default values returning id").fetchone()[0]


def eind_log(conn, run_id, status, records=None, fout=None):
    conn.execute(
        "update beheer.verversing set klaar_op = now(), status = %s, records = %s, fout = %s where id = %s",
        (status, records, fout, run_id),
    )


def herbouw(conn, schema, functie="herbouw"):
    """Bouwt een afgeleide laag (core of analyses), of een deel daarvan, opnieuw op en logt het aantal rijen per tabel."""
    start = time.monotonic()
    # Supabase stopt standaard lange queries; de herbouw over ruim een miljoen stemmen heeft meer tijd nodig
    oud = conn.execute("show statement_timeout").fetchone()[0]
    conn.execute("set statement_timeout = '20min'")
    try:
        aantallen = conn.execute(f"select tabel, rijen from {schema}.{functie}()").fetchall()
    finally:
        conn.execute("select set_config('statement_timeout', %s, false)", (oud,))
    seconden = f"{time.monotonic() - start:.0f}"
    print(f"{schema}.{functie} klaar in {seconden} s: " + ", ".join(f"{t} {getal(n)}" for t, n in aantallen))


def herbouw_stemmatrix(conn):
    """Stemmatrix per periode voor de coalitiebouwer (component coalitie-analyse)."""
    start = time.monotonic()
    oud = conn.execute("show statement_timeout").fetchone()[0]
    conn.execute("set statement_timeout = '20min'")
    try:
        n = conn.execute("select analyses.herbouw_stemmatrix()").fetchone()[0]
    finally:
        conn.execute("select set_config('statement_timeout', %s, false)", (oud,))
    print(f"stemmatrix herbouwd in {time.monotonic() - start:.0f} s: {getal(n)} perioden")


class DatakwaliteitFout(Exception):
    pass


def controleer_datakwaliteit(conn):
    """Draait de datakwaliteitscontroles (component datakwaliteit) en logt ze.
    Een oordeel 'fout' laat de verversing falen, zodat er een melding komt; 'signaal' niet."""
    uitkomst = conn.execute(
        "select controle, waarde, oordeel, toelichting from beheer.controleer_datakwaliteit()"
    ).fetchall()
    for controle, waarde, oordeel, _ in uitkomst:
        print(f"Datakwaliteit {oordeel.upper():8} {controle}: {getal(waarde)}")
    fouten = [c for c, _, oordeel, _ in uitkomst if oordeel == "fout"]
    if fouten:
        raise DatakwaliteitFout("; ".join(fouten))


def ververs_alles(conn, meta, haal=http_json, base=BASE, pauze=PAUZE):
    """Ververst alle entiteiten en logt de run in beheer.verversing. Geeft het totaal terug."""
    run_id = start_log(conn)
    try:
        totaal = 0
        for entiteit in VOLGORDE:
            totaal += ververs_entiteit(conn, entiteit, kolommen(meta, entiteit),
                                       haal=haal, base=base, pauze=pauze) or 0
        # Dossiers en beleidsterreinen (component onderwerpen). Telt niet mee in het totaal van gewijzigde
        # records: de dossiers worden elke run volledig opgehaald
        ververs_dossiers(conn, meta, haal=haal, base=base, pauze=pauze)
        herbouw(conn, "core")
        herbouw(conn, "core", "herbouw_dossiers")
        herbouw(conn, "analyses")
        herbouw(conn, "analyses", "herbouw_terrein")
        herbouw_stemmatrix(conn)
        controleer_datakwaliteit(conn)
    except Exception as e:
        try:
            eind_log(conn, run_id, "mislukt", fout=type(e).__name__)
        except psycopg.Error:
            pass  # de database zelf is het probleem; het signaal /fail meldt het alsnog
        raise
    eind_log(conn, run_id, "geslaagd", records=totaal)
    return totaal


def main():
    url = os.environ.get("DATABASE_URL")
    if not url:
        ping("/fail")
        sys.exit("DATABASE_URL ontbreekt.")
    meta = lees_metadata(Path(METADATA).read_bytes())
    start = time.monotonic()
    ping("/start")
    try:
        with psycopg.connect(url, autocommit=True, connect_timeout=30) as conn:
            totaal = ververs_alles(conn, meta)
            grootte = database_grootte(conn)
    except Exception as e:
        ping("/fail")
        if isinstance(e, psycopg.Error):
            # Geen traceback: de tekst van een databasefout kan host of gebruiker bevatten
            sys.exit(f"Verversing mislukt. {uitleg(e)}")
        traceback.print_exc()
        sys.exit("Verversing mislukt.")
    ping()
    minuten = f"{(time.monotonic() - start) / 60:.1f}".replace(".", ",")
    print(f"Verversing klaar: {getal(totaal)} records in {minuten} min, "
          f"database {mb(grootte)} MB")


if __name__ == "__main__":
    main()

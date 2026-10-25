"""Tests voor pipeline/dossiers.py en de herbouw per beleidsterrein (component onderwerpen).
Integratietests alleen met TEST_DATABASE_URL (nooit Supabase)."""
import os
import sys
import urllib.parse
import uuid
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import dossiers  # noqa: E402
import raw_schema  # noqa: E402
from api_check import lees_metadata  # noqa: E402
from test_laad import BASE, NepApi  # noqa: E402

META = lees_metadata(raw_schema.METADATA.read_bytes())
COLS = raw_schema.kolommen(META, "Kamerstukdossier")


def test_koppel_url_met_filter_expand_en_wijziging():
    url = dossiers.koppel_url(BASE, "Besluit/any(b: b/Stemming/any())", "2026-10-24T00:00:00Z")
    params = dict(urllib.parse.parse_qsl(urllib.parse.urlsplit(url).query))
    assert params["$expand"] == "Kamerstukdossier($select=Id)"
    assert params["$filter"] == "(Besluit/any(b: b/Stemming/any())) and ApiGewijzigdOp ge 2026-10-24T00:00:00Z"


def test_kolommen_van_kamerstukdossier_uit_de_metadata():
    namen = [c for c, _ in COLS]
    assert {"Id", "Nummer", "Toevoeging", "Titel", "Verwijderd"} <= set(namen)


URL = os.environ.get("TEST_DATABASE_URL")
db = pytest.mark.skipif(not URL, reason="TEST_DATABASE_URL niet gezet")


@pytest.fixture
def conn():
    import migreer
    import psycopg

    with psycopg.connect(URL, autocommit=True) as c:
        c.execute("drop schema if exists api cascade; drop schema if exists analyses cascade; drop schema if exists core cascade; "
                  "drop schema if exists raw cascade; drop schema if exists beheer cascade;")
        migreer.migreer(c)
        yield c


def nieuw():
    return str(uuid.uuid4())


@db
def test_dossiers_en_koppelingen_laden(conn):
    d1, d2 = nieuw(), nieuw()
    api_dossiers = NepApi([{"Id": d1, "Nummer": 33576, "Titel": "Natuurbeleid", "Verwijderd": False},
                           {"Id": d2, "Nummer": 21501, "Toevoeging": "20", "Titel": "Europese Raad", "Verwijderd": False}])
    assert dossiers.laad_dossiers(conn, COLS, haal=api_dossiers, base=BASE, pauze=0) == 2
    z1 = nieuw()
    api_zaken = NepApi([{"Id": z1, "Kamerstukdossier": [{"Id": d1}, {"Id": d2}]}])
    dossiers.laad_koppelingen(conn, haal=api_zaken, base=BASE, pauze=0)
    assert conn.execute("select count(*) from raw.zaak_kamerstukdossier").fetchone()[0] == 2
    # Eerste keer volledig (geen wijzigingsfilter), daarna alleen gewijzigde zaken
    assert all("ApiGewijzigdOp" not in urllib.parse.unquote(u) for u in api_zaken.urls)
    api_zaken2 = NepApi([{"Id": z1, "Kamerstukdossier": [{"Id": d1}]}])
    dossiers.laad_koppelingen(conn, haal=api_zaken2, base=BASE, pauze=0)
    assert all("ApiGewijzigdOp ge" in urllib.parse.unquote(u) for u in api_zaken2.urls)
    assert conn.execute("select count(*) from raw.zaak_kamerstukdossier").fetchone()[0] == 1


def vul_dossierdata(conn):
    """Twee dossiers: een met de commissie Financiën (2 tegen 1 zaken van Defensie), een zonder commissie."""
    fin, dfs, tk = nieuw(), nieuw(), nieuw()
    for cid, naam in [(fin, "Vaste commissie voor Financiën"), (dfs, "Vaste commissie voor Defensie"), (tk, "TK")]:
        conn.execute('insert into raw.commissie ("Id", "NaamNL") values (%s, %s)', (cid, naam))
    d1, d2 = nieuw(), nieuw()
    conn.execute('insert into raw.kamerstukdossier ("Id", "Nummer", "Titel") values (%s, 1, %s), (%s, 2, %s)',
                 (d1, "Belastingplan", d2, "Kabinetscrisis"))
    zaken = [nieuw() for _ in range(4)]
    for z, cid, naam in [(zaken[0], fin, "vaste commissie voor Financiën"), (zaken[1], fin, "vaste commissie voor Financiën"),
                         (zaken[2], dfs, "vaste commissie voor Defensie"), (zaken[3], tk, "TK")]:
        conn.execute('insert into raw.zaakactor ("Id", "Zaak_Id", "Relatie", "ActorNaam", "Commissie_Id") '
                     "values (%s, %s, 'Voortouwcommissie', %s, %s)", (nieuw(), z, naam, cid))
    for z in zaken[:3]:
        conn.execute('insert into raw.zaak_kamerstukdossier values (%s, %s)', (z, d1))
    conn.execute('insert into raw.zaak_kamerstukdossier values (%s, %s)', (zaken[3], d2))
    return d1, d2, zaken


@db
def test_dossier_krijgt_meest_voorkomende_commissie_en_terrein(conn):
    d1, d2, zaken = vul_dossierdata(conn)
    conn.execute("insert into core.zaak (id, nummer) values (%s, 'Z1'), (%s, 'Z4')", (zaken[0], zaken[3]))
    uit = dict(conn.execute("select tabel, rijen from core.herbouw_dossiers()").fetchall())
    assert uit == {"dossier": 2, "zaak_dossier": 2}
    rijen = dict(conn.execute("select id::text, beleidsterrein from core.dossier").fetchall())
    assert rijen[d1] == "Financiën"
    assert rijen[d2] == "Overig"  # alleen 'TK' als voortouw


@db
def test_cohesie_per_terrein_telt_elk_terrein(conn):
    d1, d2, zaken = vul_dossierdata(conn)
    # Een zaak (zonder eigen voortouwcommissie) bij beide dossiers: telt bij Financiën en bij Overig
    z = nieuw()
    conn.execute('insert into raw.zaak_kamerstukdossier values (%s, %s), (%s, %s)', (z, d1, z, d2))
    conn.execute("insert into core.zaak (id, nummer) values (%s, 'Z5')", (z,))
    conn.execute("select * from core.herbouw_dossiers()")
    fa, fb = nieuw(), nieuw()
    for i in range(30):
        b = nieuw()
        conn.execute("insert into core.besluit (id, datum, kabinet) values (%s, '2023-02-01', 'Rutte IV')", (b,))
        conn.execute("insert into core.besluit_zaak values (%s, %s)", (b, z))
        conn.execute("insert into analyses.fractie_besluit_stem values (%s, %s, 'Voor', false), (%s, %s, %s, false)",
                     (b, fa, b, fb, "Voor" if i < 24 else "Tegen"))
    uit = dict(conn.execute("select tabel, rijen from analyses.herbouw_terrein()").fetchall())
    assert uit["besluit_terrein"] == 60
    rij = conn.execute("select cohesie, gezamenlijk from analyses.cohesie_terrein "
                       "where beleidsterrein = 'Financiën' and variant = 'alle' and periodesoort = 'kabinet'").fetchone()
    assert (float(rij[0]), rij[1]) == (80.0, 30)
    aantallen = dict(conn.execute("select beleidsterrein, stemmingen from api.beleidsterrein_periode "
                                  "where periodesoort = 'kabinet'").fetchall())
    assert aantallen == {"Financiën": 30, "Overig": 30}


@db
def test_trefwoord_in_de_titel_gaat_voor_de_commissie(conn):
    # Een dossier over vreemdelingen bij de commissie Justitie: toch Asiel en migratie
    jv, d, z = nieuw(), nieuw(), nieuw()
    conn.execute('insert into raw.commissie ("Id", "NaamNL") values (%s, %s)', (jv, "Vaste commissie voor Justitie en Veiligheid"))
    conn.execute('insert into raw.kamerstukdossier ("Id", "Nummer", "Titel") values (%s, 19637, %s)', (d, "Vreemdelingenbeleid"))
    conn.execute('insert into raw.zaakactor ("Id", "Zaak_Id", "Relatie", "ActorNaam", "Commissie_Id") '
                 "values (%s, %s, 'Voortouwcommissie', 'vaste commissie voor Justitie en Veiligheid', %s)", (nieuw(), z, jv))
    conn.execute('insert into raw.zaak_kamerstukdossier values (%s, %s)', (z, d))
    conn.execute("select * from core.herbouw_dossiers()")
    rij = conn.execute("select commissie, beleidsterrein from core.dossier where id = %s", (d,)).fetchone()
    assert rij == ("vaste commissie voor justitie en veiligheid", "Asiel en migratie")


@db
def test_verdieping_per_stemming_en_dossier(conn):
    # Een stemming bij twee dossiers staat er twee keer in, met het andere dossier erbij en de stem per fractie
    d1, d2, zaken = vul_dossierdata(conn)
    z = nieuw()
    conn.execute('insert into raw.zaak_kamerstukdossier values (%s, %s), (%s, %s)', (z, d1, z, d2))
    conn.execute("insert into core.zaak (id, nummer, soort, titel, onderwerp) values (%s, 'Z9', 'Motie', 'Belastingplan', 'Motie over iets')", (z,))
    conn.execute("select * from core.herbouw_dossiers()")
    fa, fb, b = nieuw(), nieuw(), nieuw()
    conn.execute("insert into core.besluit (id, datum, kabinet, besluittekst) values (%s, '2023-02-01', 'Rutte IV', 'Verworpen.')", (b,))
    conn.execute("insert into core.besluit_zaak values (%s, %s)", (b, z))
    conn.execute("insert into analyses.fractie_besluit_stem values (%s, %s, 'Voor', false), (%s, %s, 'Tegen', false)", (b, fa, b, fb))
    uit = dict(conn.execute("select tabel, rijen from analyses.herbouw_terrein()").fetchall())
    assert uit["stemming_dossier"] == 2
    rij = conn.execute("select onderwerp, uitslag, andere_dossiers, verdeeld, stemmen ->> %s, stemmen ->> %s "
                       "from api.stemming_dossier where dossier = %s", (fa, fb, d1)).fetchone()
    assert rij == ("Motie over iets", "Verworpen.", ["Kabinetscrisis"], True, "Voor", "Tegen")

"""Tests voor de analyse-laag (db/migrations/006_analyse_cohesie.sql, functie analyses.herbouw).

Een klein scenario met bekende uitkomst, volgens docs/plan/definitie-cohesie.md. Draaien alleen
met TEST_DATABASE_URL (in CI: een Postgres-container); nooit tegen Supabase.
"""
import sys
from decimal import Decimal
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_core import URL, Bron, conn, herbouw, nieuw  # noqa: E402,F401

pytestmark = pytest.mark.skipif(not URL, reason="TEST_DATABASE_URL niet gezet")

DATUM = "2025-03-04T15:00:00+01:00"  # kabinet Schoof, Kamerperiode 2023-2025


def fractie(conn, afkorting):
    f = nieuw()
    conn.execute('insert into raw.fractie ("Id", "Afkorting", "Verwijderd") values (%s, %s, false)', (f, afkorting))
    return f


def lid(conn):
    p = nieuw()
    conn.execute('insert into raw.persoon ("Id", "Achternaam", "Verwijderd") values (%s, %s, false)', (p, "Lid"))
    return p


@pytest.fixture
def scenario(conn):
    bron = Bron(conn)
    a, b = bron.fractie_a, bron.fractie_b
    c = fractie(conn, "C")
    # 30 gewone stemmingen: A en B altijd gelijk, C altijd tegengesteld
    for _ in range(30):
        bes = bron.besluit(DATUM)
        bron.stem(bes, a, "Voor")
        bron.stem(bes, b, "Voor")
        bron.stem(bes, c, "Tegen")
    # Unaniem: telt alleen in variant 'alle'
    bes = bron.besluit(DATUM)
    for f in (a, b, c):
        bron.stem(bes, f, "Voor")
    # B nam niet deel: A-B telt niet, A-C wel
    bes = bron.besluit(DATUM)
    bron.stem(bes, a, "Voor")
    bron.stem(bes, b, "Niet deelgenomen")
    bron.stem(bes, c, "Tegen")
    # Vergissing bij A: telt niet voor A
    bes = bron.besluit(DATUM)
    bron.stem(bes, a, "Voor", vergissing=True)
    bron.stem(bes, b, "Voor")
    bron.stem(bes, c, "Tegen")
    # Hoofdelijk: A 2 voor 1 tegen (afgeleid Voor, niet eensgezind), B 1-1 (gelijke stand: geen stem), C 2 tegen
    bes = bron.besluit(DATUM, soort="Hoofdelijk")
    for f, stemmen in ((a, ["Voor", "Voor", "Tegen"]), (b, ["Voor", "Tegen"]), (c, ["Tegen", "Tegen"])):
        for s in stemmen:
            bron.stem(bes, f, s, persoon=lid(conn))
    # Handopsteken met een afwijker in A; alleen A stemt, dus geen fractieparen
    bes = bron.besluit(DATUM)
    bron.stem(bes, a, "Tegen")
    bron.stem(bes, a, "Voor", persoon=lid(conn))
    # Fractie D deelt maar 3 stemmingen met A: te weinig data
    d = fractie(conn, "D")
    for _ in range(3):
        bes = bron.besluit(DATUM)
        bron.stem(bes, a, "Voor")
        bron.stem(bes, d, "Voor")
    herbouw(conn)
    conn.execute("select * from analyses.herbouw()")
    return {"A": a, "B": b, "C": c, "D": d}


def cohesie(conn, f1, f2, variant="alle", periodesoort="kabinet", periode="Schoof"):
    return conn.execute(
        "select gezamenlijk, gelijk, cohesie, te_weinig_data from api.cohesie "
        "where periodesoort = %s and periode = %s and variant = %s and fractie = %s and andere_fractie = %s",
        (periodesoort, periode, variant, f1, f2),
    ).fetchone()


def test_altijd_gelijk_is_100_procent(conn, scenario):
    # 30 gewoon + unaniem; niet deelgenomen, vergissing en de gelijke stand bij B tellen niet
    assert cohesie(conn, scenario["A"], scenario["B"]) == (31, 31, Decimal("100.0"), False)


def test_altijd_tegengesteld_is_0_procent_op_het_unanieme_besluit_na(conn, scenario):
    # 30 gewoon + niet-deelgenomen-besluit + hoofdelijk (allemaal verschillend), unaniem gelijk
    assert cohesie(conn, scenario["A"], scenario["C"]) == (33, 1, Decimal("3.0"), False)


def test_variant_verdeeld_laat_unanieme_besluiten_weg(conn, scenario):
    assert cohesie(conn, scenario["A"], scenario["B"], "verdeeld") == (30, 30, Decimal("100.0"), False)
    assert cohesie(conn, scenario["A"], scenario["C"], "verdeeld") == (32, 0, Decimal("0.0"), False)


def test_beide_richtingen_en_beide_periodesoorten(conn, scenario):
    assert cohesie(conn, scenario["C"], scenario["A"]) == cohesie(conn, scenario["A"], scenario["C"])
    assert cohesie(conn, scenario["A"], scenario["B"], periodesoort="kamerperiode", periode="2023-2025") == \
        (31, 31, Decimal("100.0"), False)


def test_te_weinig_data_onder_25(conn, scenario):
    assert cohesie(conn, scenario["A"], scenario["D"]) == (3, 3, None, True)


def test_afgeleide_fractiestem_bij_hoofdelijk(conn, scenario):
    rijen = dict(conn.execute(
        "select fractie_id::text, stem from analyses.fractie_besluit_stem where afgeleid"
    ).fetchall())
    assert rijen == {scenario["A"]: "Voor", scenario["C"]: "Tegen"}  # B: gelijke stand, geen stem


def test_eensgezindheid(conn, scenario):
    rijen = {r[0]: r[1:] for r in conn.execute(
        "select fractie::text, hoofdelijk, hoofdelijk_verdeeld, afwijkers_handopsteken from api.eensgezindheid "
        "where periodesoort = 'kabinet' and periode = 'Schoof'"
    ).fetchall()}
    assert rijen[scenario["A"]] == (1, 1, 1)
    assert rijen[scenario["B"]] == (1, 1, 0)
    assert rijen[scenario["C"]] == (1, 0, 0)


def test_anon_leest_cohesie_maar_niet_de_tussenstap(conn, scenario):
    import psycopg

    conn.execute("set role anon")
    try:
        assert conn.execute("select count(*) from api.cohesie").fetchone()[0] > 0
        assert conn.execute("select count(*) from api.eensgezindheid").fetchone()[0] > 0
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            conn.execute("select * from analyses.fractie_besluit_stem")
    finally:
        conn.execute("reset role")


def test_fractie_periode_zetels_en_zaal(conn, scenario):
    # Fractie E stemde alleen ruim voor het einde van de periode: wel in de periode, niet in de zaal
    from test_core import Bron  # noqa: F401
    e = fractie(conn, "E")
    bes = nieuw()
    act, ap = nieuw(), nieuw()
    conn.execute('insert into raw.activiteit ("Id", "Datum", "Verwijderd") values (%s, %s, false)', (act, "2024-12-01T12:00:00+01:00"))
    conn.execute('insert into raw.agendapunt ("Id", "Activiteit_Id", "Verwijderd") values (%s, %s, false)', (ap, act))
    conn.execute('insert into raw.besluit ("Id", "Agendapunt_Id", "StemmingsSoort", "Verwijderd") values (%s, %s, %s, false)',
                 (bes, ap, "Met handopsteken"))
    conn.execute('insert into raw.stemming ("Id", "Besluit_Id", "Fractie_Id", "Soort", "FractieGrootte", "Vergissing", "Verwijderd") '
                 "values (%s, %s, %s, 'Voor', 4, false, false)", (nieuw(), bes, e))
    herbouw(conn)
    conn.execute("select * from analyses.herbouw()")
    rijen = {r[0]: r[1:] for r in conn.execute(
        "select afkorting, zetels, in_zaal from api.fractie_periode where periodesoort = 'kabinet' and periode = 'Schoof'"
    ).fetchall()}
    assert rijen["A"] == (10, True)
    assert rijen["E"] == (4, False)


def test_stemmatrix_per_periode(conn, scenario):
    assert conn.execute("select analyses.herbouw_stemmatrix()").fetchone()[0] == 2  # Schoof en 2023-2025
    fracties, stemmen, zetels = conn.execute(
        "select fracties, stemmen, zetels from api.stemmatrix where periodesoort = 'kabinet' and periode = 'Schoof'"
    ).fetchone()
    namen = [f["afkorting"] for f in fracties]
    assert namen == sorted(namen)
    a, c = namen.index("A"), namen.index("C")
    # Elk besluit een regel met per fractie een teken; A voor en C tegen in de eerste 30 besluiten
    assert all(len(r) == len(namen) for r in stemmen)
    assert sum(1 for r in stemmen if r[a] == "V" and r[c] == "T") >= 30
    # A heeft 10 zetels bij handopsteken; bij de hoofdelijke stemming telt het aantal leden (3)
    assert {10, 3} <= {z for _, z in zetels[a]}


def test_stemmatrix_met_besluiten_in_dezelfde_volgorde(conn, scenario):
    # Per regel in stemmen het besluit, zodat de site bij een partner de stemmingen kan tonen (migratie 017)
    conn.execute("select analyses.herbouw_stemmatrix()")
    stemmen, besluiten = conn.execute(
        "select stemmen, besluiten from api.stemmatrix where periodesoort = 'kabinet' and periode = 'Schoof'"
    ).fetchone()
    assert len(besluiten) == len(stemmen) == len(set(besluiten))
    datums = [conn.execute("select datum from core.besluit where id = %s", (b,)).fetchone()[0] for b in besluiten]
    assert datums == sorted(datums)


def test_zaal_van_kabinet_eindigt_bij_de_verkiezingen(conn, scenario):
    # Kabinet-Schoof loopt over de Kamerperiodes 2023-2025 en 2025- heen (nieuwe Kamer vanaf 12 november 2025).
    # N stemt mee tot vlak voor de verkiezingen en komt niet terug; M stemt alleen in de nieuwe Kamer.
    # Besluit Niels, 28 oktober 2026: de zaal van het kabinet is die van voor de verkiezingen.
    n, m = fractie(conn, "N"), fractie(conn, "M")

    def stem(datum, fracties):
        bes, act, ap = nieuw(), nieuw(), nieuw()
        conn.execute('insert into raw.activiteit ("Id", "Datum", "Verwijderd") values (%s, %s, false)', (act, datum))
        conn.execute('insert into raw.agendapunt ("Id", "Activiteit_Id", "Verwijderd") values (%s, %s, false)', (ap, act))
        conn.execute('insert into raw.besluit ("Id", "Agendapunt_Id", "StemmingsSoort", "Verwijderd") values (%s, %s, %s, false)',
                     (bes, ap, "Met handopsteken"))
        for f, grootte in fracties:
            conn.execute('insert into raw.stemming ("Id", "Besluit_Id", "Fractie_Id", "Soort", "FractieGrootte", "Vergissing", "Verwijderd") '
                         "values (%s, %s, %s, 'Voor', %s, false, false)", (nieuw(), bes, f, grootte))

    stem("2025-10-16T12:00:00+02:00", [(n, 19)])  # voor de verkiezingen van 29 oktober (migratie 028)
    stem("2026-01-20T12:00:00+01:00", [(m, 9)])
    herbouw(conn)
    conn.execute("select * from analyses.herbouw()")
    rijen = {r[0]: r[1:] for r in conn.execute(
        "select afkorting, zetels, in_zaal from api.fractie_periode where periodesoort = 'kabinet' and periode = 'Schoof'"
    ).fetchall()}
    assert rijen["N"] == (19, True)
    assert rijen["M"] == (9, False)
    # Per Kamerperiode blijft het einde van de periode de zaal
    kp = {r[0]: r[1] for r in conn.execute(
        "select afkorting, in_zaal from api.fractie_periode where periodesoort = 'kamerperiode' and periode = '2025-'"
    ).fetchall()}
    assert kp["M"] is True


def test_zaal_eindigt_voor_de_verkiezingsdatum(conn, scenario):
    # Na de verkiezingen van 22 november 2023 stemde de oude Kamer nog op 2 december (Kamerperiode 2021-2023, kabinet
    # Rutte IV). Die stemming hoort niet bij de zaal: P (stemde in oktober) zit erin, Q (alleen op 2 december) niet.
    p, q = fractie(conn, "P"), fractie(conn, "Q")

    def stem(datum, f, grootte):
        bes, act, ap = nieuw(), nieuw(), nieuw()
        conn.execute('insert into raw.activiteit ("Id", "Datum", "Verwijderd") values (%s, %s, false)', (act, datum))
        conn.execute('insert into raw.agendapunt ("Id", "Activiteit_Id", "Verwijderd") values (%s, %s, false)', (ap, act))
        conn.execute('insert into raw.besluit ("Id", "Agendapunt_Id", "StemmingsSoort", "Verwijderd") values (%s, %s, %s, false)',
                     (bes, ap, "Met handopsteken"))
        conn.execute('insert into raw.stemming ("Id", "Besluit_Id", "Fractie_Id", "Soort", "FractieGrootte", "Vergissing", "Verwijderd") '
                     "values (%s, %s, %s, 'Voor', %s, false, false)", (nieuw(), bes, f, grootte))

    stem("2023-10-26T12:00:00+02:00", p, 34)
    stem("2023-12-02T12:00:00+01:00", q, 1)
    herbouw(conn)
    conn.execute("select * from analyses.herbouw()")
    rijen = {r[0]: r[1:] for r in conn.execute(
        "select afkorting, zetels, in_zaal from api.fractie_periode where periodesoort = 'kabinet' and periode = 'Rutte IV'"
    ).fetchall()}
    assert rijen["P"] == (34, True)
    assert rijen["Q"] == (1, False)

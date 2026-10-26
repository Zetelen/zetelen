"""Tests voor de analyse zetelwerk (migratie 018). Alleen met TEST_DATABASE_URL (nooit Supabase)."""
import os
import sys
import uuid
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

URL = os.environ.get("TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(not URL, reason="TEST_DATABASE_URL niet gezet")


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


def fractie(conn, afkorting):
    f = nieuw()
    conn.execute("insert into core.fractie (id, afkorting, naam) values (%s, %s, %s)", (f, afkorting, afkorting))
    return f


def persoon(conn, naam):
    p = nieuw()
    conn.execute("insert into core.persoon (id, naam) values (%s, %s)", (p, naam))
    return p


def stuk(conn, soort, datum, stemmen, indieners, nummer="Z"):
    """stemmen: {fractie_id: (soort, zetels)}; indieners: [(persoon, fractie, relatie)]"""
    z, b = nieuw(), nieuw()
    conn.execute("insert into core.zaak (id, nummer, soort, onderwerp) values (%s, %s, %s, 'Iets')", (z, nummer, soort))
    conn.execute("insert into core.besluit (id, datum, kabinet, stemmingssoort) values (%s, %s, 'Jetten', 'Met handopsteken')", (b, datum))
    conn.execute("insert into core.besluit_zaak values (%s, %s)", (b, z))
    for f, (s, n) in stemmen.items():
        conn.execute("insert into core.fractiestem values (%s, %s, %s, %s, false)", (b, f, s, n))
        conn.execute("insert into analyses.fractie_besluit_stem values (%s, %s, %s, false)", (b, f, s))
    for p, f, rel in indieners:
        conn.execute('insert into raw.zaakactor ("Id", "Zaak_Id", "Relatie", "Persoon_Id", "Fractie_Id") values (%s, %s, %s, %s, %s)',
                     (nieuw(), z, rel, p, f))
    return z


def test_uitslag_rol_en_brede_steun(conn):
    # Jetten: D66, VVD en CDA in het kabinet (core.coalitie, migratie 011); PVV en SP in de oppositie
    d66, vvd, pvv, sp = (fractie(conn, a) for a in ["D66", "VVD", "PVV", "SP"])
    a, b = persoon(conn, "Lid A"), persoon(conn, "Lid B")
    # Motie van de SP met steun van VVD (kabinet) en PVV (oppositie): aangenomen, brede steun
    z1 = stuk(conn, "Motie", "2026-04-01", {sp: ("Voor", 5), vvd: ("Voor", 30), pvv: ("Voor", 40), d66: ("Tegen", 75)}, [(a, sp, "Indiener"), (b, pvv, "Medeindiener")])
    # Amendement van de SP met alleen D66 voor: verworpen
    z2 = stuk(conn, "Amendement", "2026-04-02", {sp: ("Voor", 5), d66: ("Voor", 20), vvd: ("Tegen", 30), pvv: ("Tegen", 40)}, [(a, sp, "Indiener")])
    uit = dict(conn.execute("select tabel, rijen from analyses.herbouw_zetelwerk()").fetchall())
    assert uit["zaak_uitslag"] == 2
    r1 = conn.execute("select zetels_voor, zetels_tegen, aangenomen, brede_steun, indiener_rol from analyses.zaak_uitslag where zaak_id = %s", (z1,)).fetchone()
    assert r1 == (75, 75, False, False, "oppositie")  # 75 tegen 75 is geen meerderheid
    r2 = conn.execute("select aangenomen from analyses.zaak_uitslag where zaak_id = %s", (z2,)).fetchone()
    assert r2 == (False,)
    rol = conn.execute("select rol from analyses.indiening where persoon_id = %s and zaak_id = %s", (a, z1)).fetchone()[0]
    assert rol == "oppositie"


def test_brede_steun_en_tellingen(conn):
    d66, vvd, pvv, sp, volt = (fractie(conn, a) for a in ["D66", "VVD", "PVV", "SP", "Volt"])
    a, b = persoon(conn, "Lid A"), persoon(conn, "Lid B")
    # Brede steun: VVD (kabinet) en Volt (oppositie) stemmen voor; de PVV telt niet, die is medeindiener
    stuk(conn, "Motie", "2026-04-01", {sp: ("Voor", 5), vvd: ("Voor", 30), pvv: ("Voor", 40), volt: ("Voor", 2), d66: ("Tegen", 20)}, [(a, sp, "Indiener"), (b, pvv, "Medeindiener")], "M1")
    stuk(conn, "Motie", "2026-05-01", {sp: ("Voor", 5), d66: ("Tegen", 20), vvd: ("Tegen", 30), pvv: ("Tegen", 40)}, [(a, sp, "Indiener")], "M2")
    conn.execute("select * from analyses.herbouw_zetelwerk()")
    assert conn.execute("select brede_steun from analyses.zaak_uitslag where nummer = 'M1'").fetchone() == (True,)
    f = conn.execute("select ingediend, mede, aangenomen, brede_steun, rol from api.zetelwerk_fractie "
                     "where periodesoort = 'kabinet' and afkorting = 'SP' and soort = 'Motie'").fetchone()
    assert f == (2, 0, 1, 1, "oppositie")
    pvv_mede = conn.execute("select ingediend, mede from api.zetelwerk_fractie where periodesoort = 'kabinet' and afkorting = 'PVV'").fetchone()
    assert pvv_mede == (0, 1)
    p = conn.execute("select naam, fractie_afkorting, ingediend, aangenomen from api.zetelwerk_persoon "
                     "where periodesoort = 'kabinet' and persoon = %s", (a,)).fetchone()
    assert p == ("Lid A", "SP", 2, 1)
    net = conn.execute("select fractie_a, fractie_b, stukken from api.indiening_netwerk where periodesoort = 'kabinet'").fetchall()
    assert net == [("PVV", "SP", 1)]
    jaar = conn.execute("select ingediend, aangenomen from api.zetelwerk_jaar where jaar = 2026 and soort = 'Motie' and indiener_rol = 'oppositie'").fetchone()
    assert jaar == (2, 1)
    # Tegenstemmen: de SP stemde nooit tegen, de PVV een van de twee keer
    tegen = dict(conn.execute("select afkorting, tegen_aandeel from analyses.zetelwerk_fractie where periodesoort = 'kabinet' and soort = 'Motie'").fetchall())
    assert float(tegen["SP"]) == 0.0 and float(tegen["PVV"]) == 50.0


def test_initiatiefwet_telt_mee_als_wetsvoorstel(conn):
    # Migratie 022: een initiatiefwet van een Kamerlid telt als Wetsvoorstel; een regeringswet (Wetgeving) niet,
    # en een indiener zonder fractie (een minister) ook niet
    d66, vvd, sp = (fractie(conn, a) for a in ["D66", "VVD", "SP"])
    a, m = persoon(conn, "Lid A"), persoon(conn, "Minister")
    w1 = stuk(conn, "Initiatiefwetgeving", "2026-05-01", {sp: ("Voor", 5), d66: ("Voor", 75), vvd: ("Tegen", 30)}, [(a, sp, "Indiener")], "W1")
    stuk(conn, "Wetgeving", "2026-05-02", {d66: ("Voor", 75), vvd: ("Voor", 30)}, [(m, None, "Indiener")], "W2")
    stuk(conn, "Initiatiefwetgeving", "2026-05-03", {d66: ("Voor", 75)}, [(m, None, "Indiener")], "W3")
    conn.execute("select * from analyses.herbouw_zetelwerk()")
    rijen = conn.execute("select zaak_id::text, soort, aangenomen, indiener_rol from analyses.zaak_uitslag").fetchall()
    assert rijen == [(w1, "Wetsvoorstel", True, "oppositie")]
    assert conn.execute("select count(*) from analyses.indiening where zaak_id = %s", (w1,)).fetchone()[0] == 1
    assert conn.execute("select ingediend, aangenomen from analyses.zetelwerk_fractie where afkorting = 'SP' and soort = 'Wetsvoorstel' and periodesoort = 'kabinet'").fetchone() == (1, 1)

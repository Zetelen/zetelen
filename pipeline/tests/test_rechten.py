"""Tests voor de rechten (db/migrations/005_api_rechten.sql en pipeline/controleer_rechten.py).

Draaien alleen met TEST_DATABASE_URL (in CI: een Postgres-container). Gooien de schema's
leeg, dus nooit tegen Supabase draaien.
"""
import os
import sys
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
        c.execute("reset role")


def overtredingen(conn):
    import controleer_rechten

    return {naam: o for naam, o in controleer_rechten.controleer(conn) if o}


def als_anon(conn, sql):
    import psycopg

    conn.execute("set role anon")
    try:
        return conn.execute(sql).fetchall()
    except psycopg.Error as e:
        return type(e).__name__
    finally:
        conn.execute("reset role")


def test_na_de_migraties_geen_overtredingen(conn):
    assert overtredingen(conn) == {}


def test_tabel_zonder_rls_wordt_gevonden(conn):
    conn.execute("create table core.testtabel (x int)")
    gevonden = overtredingen(conn)
    assert any("core.testtabel" in o for lijst in gevonden.values() for o in lijst)


def test_schrijfrecht_voor_anon_wordt_gevonden(conn):
    conn.execute("grant insert on core.kabinet to anon")
    assert any("INSERT op core.kabinet" in o for lijst in overtredingen(conn).values() for o in lijst)


def test_view_zonder_security_invoker_wordt_gevonden(conn):
    conn.execute("create view api.lek as select naam from core.kabinet")
    assert any("api.lek" in o for lijst in overtredingen(conn).values() for o in lijst)


def test_anon_leest_api(conn):
    assert len(als_anon(conn, "select * from api.kabinet")) == 7
    assert als_anon(conn, "select * from api.fractie") == []


def test_anon_kan_niet_schrijven(conn):
    assert als_anon(conn, "insert into api.kabinet (naam, begin) values ('x', '2030-01-01')") == "InsufficientPrivilege"
    assert als_anon(conn, "update api.kabinet set naam = 'x'") == "InsufficientPrivilege"
    assert als_anon(conn, "delete from api.kabinet") == "InsufficientPrivilege"
    assert als_anon(conn, "delete from core.kabinet") == "InsufficientPrivilege"


def test_anon_kan_raw_en_beheer_niet_lezen(conn):
    assert als_anon(conn, "select * from raw.stemming") == "InsufficientPrivilege"
    assert als_anon(conn, "select * from beheer.migraties") == "InsufficientPrivilege"
    assert als_anon(conn, "select fout from beheer.verversing") == "InsufficientPrivilege"
    assert als_anon(conn, "select * from core.herbouw()") == "InsufficientPrivilege"


def test_laatst_bijgewerkt_alleen_geslaagde_runs(conn):
    conn.execute("insert into beheer.verversing (klaar_op, status) values "
                 "('2026-10-20 05:00+00', 'geslaagd'), ('2026-10-21 05:00+00', 'mislukt')")
    tijd = als_anon(conn, "select laatst_bijgewerkt from api.laatst_bijgewerkt")[0][0]
    assert tijd.isoformat().startswith("2026-10-20")


# Feedbackformulier (migratie 021)

def test_anon_kan_feedback_sturen_maar_niet_lezen(conn):
    assert als_anon(conn, "select api.stuur_feedback('test', '{\"indruk\": \"goed\"}'::jsonb)") == [("ontvangen",)]
    assert als_anon(conn, "select * from beheer.feedback") == "InsufficientPrivilege"
    assert als_anon(conn, "insert into beheer.feedback (antwoorden) values ('{}')") == "InsufficientPrivilege"
    assert conn.execute("select pagina, antwoorden->>'indruk' from beheer.feedback").fetchall() == [("test", "goed")]


def test_proef_voegt_niets_toe_en_ongeldige_invoer_wordt_geweigerd(conn):
    assert als_anon(conn, "select api.stuur_feedback('test', '{\"indruk\": \"x\"}'::jsonb, true)") == [("proef",)]
    assert conn.execute("select count(*) from beheer.feedback").fetchone()[0] == 0
    for fout in ["'\"tekst\"'::jsonb", "'{}'::jsonb", "jsonb_build_object('lang', repeat('x', 4000))", "jsonb_build_object('lijst', jsonb_build_array(1))"]:
        assert als_anon(conn, f"select api.stuur_feedback('test', {fout})") == "InvalidParameterValue"


def test_rem_op_misbruik(conn):
    conn.execute("insert into beheer.feedback (antwoorden) select '{\"a\": \"b\"}' from generate_series(1, 30)")
    assert als_anon(conn, "select api.stuur_feedback('test', '{\"indruk\": \"x\"}'::jsonb)") == "ProgramLimitExceeded"


def test_bewaartermijn(conn):
    conn.execute("insert into beheer.feedback (ontvangen_op, antwoorden) values (now() - interval '13 months', '{\"a\": \"oud\"}'), (now(), '{\"a\": \"nieuw\"}')")
    assert conn.execute("select beheer.ruim_feedback_op()").fetchone()[0] == 1
    assert conn.execute("select antwoorden->>'a' from beheer.feedback").fetchall() == [("nieuw",)]
    assert als_anon(conn, "select beheer.ruim_feedback_op()") == "InsufficientPrivilege"


def test_andere_functie_voor_anon_wordt_gevonden(conn):
    conn.execute("create function api.test_lek() returns int language sql as 'select 1'")
    gevonden = overtredingen(conn)
    assert any("api.test_lek" in o for lijst in gevonden.values() for o in lijst)


def test_toegestane_functie_zonder_security_definer_wordt_gevonden(conn):
    conn.execute("alter function api.stuur_feedback(text, jsonb, boolean) security invoker")
    gevonden = overtredingen(conn)
    assert any("api.stuur_feedback" in o for lijst in gevonden.values() for o in lijst)

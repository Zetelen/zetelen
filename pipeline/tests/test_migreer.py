"""Integratietest voor pipeline/migreer.py tegen een echte Postgres.

Draait alleen als TEST_DATABASE_URL gezet is (in CI: een Postgres-container).
Gooit de schema's raw, core en beheer leeg, dus nooit tegen Supabase draaien.
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
    import psycopg

    with psycopg.connect(URL, autocommit=True) as c:
        c.execute("drop schema if exists api cascade; drop schema if exists analyses cascade; drop schema if exists core cascade; drop schema if exists raw cascade; "
                  "drop schema if exists beheer cascade;")
        yield c


def test_eerste_run_voert_alles_uit_tweede_niets(conn):
    import migreer

    alle = [b.name for b in migreer.bestanden()]
    assert migreer.migreer(conn, droog=True) == alle
    # Een droge run maakt het schema beheer niet aan
    assert conn.execute("select to_regclass('beheer.migraties')").fetchone()[0] is None
    assert migreer.migreer(conn) == alle
    assert migreer.migreer(conn) == []
    assert conn.execute("select count(*) from beheer.migraties").fetchone()[0] == len(alle)


def test_tabellen_en_kolommen(conn):
    import migreer
    import raw_schema

    migreer.migreer(conn)
    tabellen = {r[0] for r in conn.execute(
        "select table_name from information_schema.tables where table_schema = 'raw'"
    )}
    # Plus de koppeltabel van besluiten, de laadstatus en de dossiers (014_onderwerpen.sql)
    verwacht = {e.lower() for e in raw_schema.ENTITEITEN} | {"besluit_zaak", "laadstatus", "kamerstukdossier", "zaak_kamerstukdossier"}
    assert tabellen == verwacht
    persoon = {r[0] for r in conn.execute(
        "select column_name from information_schema.columns "
        "where table_schema = 'raw' and table_name = 'persoon'"
    )}
    assert "Achternaam" in persoon and "Geboortedatum" not in persoon


def test_mislukte_migratie_wordt_teruggedraaid(conn, tmp_path):
    import migreer

    (tmp_path / "001_goed.sql").write_text("create schema raw; create table raw.a (x int);")
    (tmp_path / "002_fout.sql").write_text("create table raw.b (x int); select * from bestaat_niet;")
    with pytest.raises(Exception):
        migreer.migreer(conn, map_=tmp_path)
    assert conn.execute("select to_regclass('raw.a')").fetchone()[0] is not None
    # 002 is volledig teruggedraaid en niet als uitgevoerd genoteerd
    assert conn.execute("select to_regclass('raw.b')").fetchone()[0] is None
    assert {r[0] for r in conn.execute("select bestand from beheer.migraties")} == {"001_goed.sql"}

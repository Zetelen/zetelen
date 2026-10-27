"""Tests voor de cohesie per half jaar (migratie 026). Alleen met TEST_DATABASE_URL (nooit Supabase)."""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_zetelwerk import URL, conn, fractie, nieuw  # noqa: E402,F401

pytestmark = pytest.mark.skipif(not URL, reason="TEST_DATABASE_URL niet gezet")


def besluit(conn, datum, stemmen):
    """stemmen: {fractie_id: 'Voor' | 'Tegen'}"""
    b = nieuw()
    conn.execute("insert into core.besluit (id, datum, stemmingssoort) values (%s, %s, 'Met handopsteken')", (b, datum))
    for f, s in stemmen.items():
        conn.execute("insert into analyses.fractie_besluit_stem values (%s, %s, %s, false)", (b, f, s))


def rij(conn, halfjaar, variant, a, b):
    return conn.execute(
        "select gezamenlijk, gelijk from api.cohesie_halfjaar where halfjaar = %s and variant = %s and fractie = %s and andere_fractie = %s",
        (halfjaar, variant, a, b)).fetchone()


def test_telt_per_half_jaar_en_variant(conn):
    a, b, c = (fractie(conn, x) for x in "ABC")
    # Eerste helft 2024: 2 keer A en B gelijk tegenover C, 1 keer alle drie voor (unaniem)
    besluit(conn, "2024-01-10", {a: "Voor", b: "Voor", c: "Tegen"})
    besluit(conn, "2024-06-30", {a: "Tegen", b: "Tegen", c: "Voor"})
    besluit(conn, "2024-03-01", {a: "Voor", b: "Voor", c: "Voor"})
    # Tweede helft 2024: A en B verschillen
    besluit(conn, "2024-07-01", {a: "Voor", b: "Tegen"})
    uit = dict(conn.execute("select tabel, rijen from analyses.herbouw_halfjaar()").fetchall())
    assert uit["cohesie_halfjaar"] > 0
    assert rij(conn, "2024-01-01", "alle", a, b) == (3, 3)
    assert rij(conn, "2024-01-01", "verdeeld", a, b) == (2, 2)
    assert rij(conn, "2024-01-01", "alle", a, c) == (3, 1)
    assert rij(conn, "2024-07-01", "alle", a, b) == (1, 0)
    # In beide richtingen leesbaar
    assert rij(conn, "2024-07-01", "alle", b, a) == (1, 0)


def test_herbouw_begint_opnieuw(conn):
    a, b = fractie(conn, "A"), fractie(conn, "B")
    besluit(conn, "2025-02-01", {a: "Voor", b: "Voor"})
    conn.execute("select * from analyses.herbouw_halfjaar()")
    conn.execute("select * from analyses.herbouw_halfjaar()")
    assert rij(conn, "2025-01-01", "alle", a, b) == (1, 1)

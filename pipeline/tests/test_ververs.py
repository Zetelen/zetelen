"""Tests voor pipeline/ververs.py. Integratietests alleen met TEST_DATABASE_URL (nooit Supabase)."""
import datetime as dt
import os
import sys
import urllib.parse
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import laad  # noqa: E402
import raw_schema  # noqa: E402
import ververs  # noqa: E402
from api_check import lees_metadata  # noqa: E402
from test_laad import BASE, NepApi, fracties  # noqa: E402

META = lees_metadata(raw_schema.METADATA.read_bytes())
COLS = raw_schema.kolommen(META, "Fractie")


def test_odata_tijd_in_utc():
    t = dt.datetime(2026, 10, 23, 6, 30, tzinfo=dt.timezone(dt.timedelta(hours=2)))
    assert ververs.odata_tijd(t) == "2026-10-23T04:30:00Z"


def test_filter_combineert_datum_en_wijziging():
    url = laad.basis_url("Stemming", raw_schema.kolommen(META, "Stemming"), BASE,
                         extra_filter="ApiGewijzigdOp ge 2026-10-22T00:00:00Z")
    flt = dict(urllib.parse.parse_qsl(urllib.parse.urlsplit(url).query))["$filter"]
    assert flt == ("Besluit/Agendapunt/Activiteit/Datum ge 2010-01-01T00:00:00Z "
                   "and ApiGewijzigdOp ge 2026-10-22T00:00:00Z")


def test_verwijderd_komt_ook_buiten_het_datumfilter_mee():
    url = laad.basis_url("Agendapunt", raw_schema.kolommen(META, "Agendapunt"), BASE,
                         extra_filter="ApiGewijzigdOp ge 2026-10-22T00:00:00Z", ook_verwijderd=True)
    flt = dict(urllib.parse.parse_qsl(urllib.parse.urlsplit(url).query))["$filter"]
    assert flt == ("(Activiteit/Datum ge 2010-01-01T00:00:00Z or Verwijderd eq true) "
                   "and ApiGewijzigdOp ge 2026-10-22T00:00:00Z")


def test_entiteit_zonder_datumfilter_blijft_zonder():
    url = laad.basis_url("Fractie", COLS, BASE, extra_filter="ApiGewijzigdOp ge 2026-10-22T00:00:00Z", ook_verwijderd=True)
    flt = dict(urllib.parse.parse_qsl(urllib.parse.urlsplit(url).query))["$filter"]
    assert flt == "ApiGewijzigdOp ge 2026-10-22T00:00:00Z"


URL = os.environ.get("TEST_DATABASE_URL")
db = pytest.mark.skipif(not URL, reason="TEST_DATABASE_URL niet gezet")


@pytest.fixture
def conn():
    import migreer
    import psycopg

    with psycopg.connect(URL, autocommit=True) as c:
        c.execute("drop schema if exists api cascade; drop schema if exists analyses cascade; drop schema if exists core cascade; drop schema if exists raw cascade; "
                  "drop schema if exists beheer cascade;")
        migreer.migreer(c)
        yield c


@db
def test_zonder_eerste_laad_overgeslagen(conn):
    assert ververs.ververs_entiteit(conn, "Fractie", COLS, haal=NepApi([]), base=BASE, pauze=0) is None


@db
def test_wijziging_en_verwijdering_komen_mee(conn):
    rec = fracties(300)
    laad.laad_entiteit(conn, "Fractie", COLS, haal=NepApi(rec), base=BASE, pauze=0)
    voor = conn.execute("select laatste_api_gewijzigd_op from raw.laadstatus").fetchone()[0]

    gewijzigd = [dict(rec[0], Afkorting="NIEUW"), dict(rec[1], Verwijderd=True)]
    api = NepApi(gewijzigd)
    assert ververs.ververs_entiteit(conn, "Fractie", COLS, haal=api, base=BASE, pauze=0) == 2
    assert "ApiGewijzigdOp ge" in urllib.parse.unquote(api.urls[0])

    assert conn.execute("select count(*) from raw.fractie").fetchone()[0] == 300
    assert conn.execute('select "Afkorting" from raw.fractie where "Id" = %s', (rec[0]["Id"],)).fetchone()[0] == "NIEUW"
    assert conn.execute('select "Verwijderd" from raw.fractie where "Id" = %s', (rec[1]["Id"],)).fetchone()[0] is True
    na = conn.execute("select laatste_api_gewijzigd_op from raw.laadstatus").fetchone()[0]
    assert na > voor


@db
def test_terug_tot_kijkt_eenmalig_verder_terug(conn):
    laad.laad_entiteit(conn, "Fractie", COLS, haal=NepApi(fracties(3)), base=BASE, pauze=0)
    api = NepApi([])
    ververs.ververs_entiteit(conn, "Fractie", COLS, haal=api, base=BASE, pauze=0,
                             terug_tot=dt.datetime(2026, 10, 23, tzinfo=dt.timezone.utc))
    assert "ApiGewijzigdOp ge 2026-10-23T00:00:00Z" in urllib.parse.unquote(api.urls[0])


# Bewaking: signalen naar healthchecks en het logboek beheer.verversing

def test_ping_zonder_url_doet_niets(monkeypatch):
    aanroepen = []
    monkeypatch.delenv("HEALTHCHECK_URL", raising=False)
    monkeypatch.setattr(ververs.urllib.request, "urlopen", lambda *a, **k: aanroepen.append(a))
    ververs.ping("/start")
    assert aanroepen == []


def test_ping_met_url_en_achtervoegsel(monkeypatch):
    class Antwoord:
        def close(self):
            pass

    aanroepen = []
    monkeypatch.setenv("HEALTHCHECK_URL", " https://hc.nep/abc/\n")
    monkeypatch.setattr(ververs.urllib.request, "urlopen", lambda url, timeout: aanroepen.append(url) or Antwoord())
    ververs.ping("/fail")
    ververs.ping()
    assert aanroepen == ["https://hc.nep/abc/fail", "https://hc.nep/abc"]


def test_mislukt_signaal_laat_de_verversing_niet_falen(monkeypatch, capsys):
    def kapot(*a, **k):
        raise OSError("netwerk weg")

    monkeypatch.setenv("HEALTHCHECK_URL", "https://hc.nep/geheim-adres")
    monkeypatch.setattr(ververs.urllib.request, "urlopen", kapot)
    ververs.ping()
    uit = capsys.readouterr().out
    assert "niet verstuurd" in uit and "geheim-adres" not in uit


@db
def test_logboek_bij_geslaagde_run(conn):
    laad.laad_entiteit(conn, "Fractie", COLS, haal=NepApi(fracties(3)), base=BASE, pauze=0)
    totaal = ververs.ververs_alles(conn, META, haal=NepApi(fracties(2)), base=BASE, pauze=0)
    assert totaal == 2
    # De core-laag is na de verversing opnieuw opgebouwd: 3 geladen plus 2 nieuwe fracties
    assert conn.execute("select count(*) from core.fractie").fetchone()[0] == 5
    rij = conn.execute("select status, records, klaar_op is not null, fout from beheer.verversing").fetchone()
    assert rij == ("geslaagd", 2, True, None)


@db
def test_logboek_bij_mislukte_run(conn):
    laad.laad_entiteit(conn, "Fractie", COLS, haal=NepApi(fracties(3)), base=BASE, pauze=0)

    def kapotte_api(url):
        raise RuntimeError("API bleef falen")

    with pytest.raises(RuntimeError):
        ververs.ververs_alles(conn, META, haal=kapotte_api, base=BASE, pauze=0)
    assert conn.execute("select status, fout from beheer.verversing").fetchone() == ("mislukt", "RuntimeError")


@db
def test_herbouw_negeert_een_korte_standaard_timeout(conn):
    # Supabase heeft een standaard statement_timeout; de herbouw zet voor zichzelf een ruimere
    laad.laad_entiteit(conn, "Fractie", COLS, haal=NepApi(fracties(3)), base=BASE, pauze=0)
    conn.execute("set statement_timeout = '1ms'")
    ververs.herbouw(conn, "core")
    ververs.herbouw(conn, "analyses")
    assert conn.execute("show statement_timeout").fetchone()[0] == "1ms"
    conn.execute("reset statement_timeout")

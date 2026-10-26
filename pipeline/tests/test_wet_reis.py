"""Tests voor pipeline/wet_reis.py (Hoe lang duurt een wet?). Zonder netwerk: de haler is nagemaakt."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import wet_reis  # noqa: E402


def besluit(datum, soort):
    return {"BesluitSoort": soort, "Agendapunt": {"Activiteit": {"Datum": f"{datum}T10:00:00+02:00"}}}


def test_halte_uit_documentsoort():
    assert wet_reis.halte("Voorstel van wet (initiatiefvoorstel)") == "ingediend"
    assert wet_reis.halte("Advies Afdeling advisering Raad van State en Reactie van de initiatiefnemer(s)") == "advies"
    assert wet_reis.halte("Verslag (initiatief)wetsvoorstel (nader)") == "vragen"
    assert wet_reis.halte("Nota n.a.v. het (nader/tweede nader/enz.) verslag") == "antwoord"
    assert wet_reis.halte("Nota van wijziging") == "aangepast"
    assert wet_reis.halte("Geleidende brief") is None


def test_stemming_neemt_de_laatste_met_datum():
    datum, uitslag = wet_reis.stemming([besluit("2016-02-16", "Stemmen - gestaakt"), besluit("2016-09-13", "Stemmen - aangenomen"),
                                        {"BesluitSoort": "Stemmen - verworpen", "Agendapunt": None}])
    assert (datum, uitslag) == ("2016-09-13", "aangenomen")
    assert wet_reis.stemming([]) == (None, None)
    assert wet_reis.stemming([besluit("2019-06-04", "Stemmen - zonder stemming aannemen")]) == ("2019-06-04", "hamerstuk")


def test_reis_eerste_van_elke_halte_behalve_aanpassingen():
    zaak = {"Nummer": "2012Z1", "Soort": "Initiatiefwetgeving", "GestartOp": "2012-12-18T00:00:00",
            "Document": [{"Soort": "Voorstel van wet (initiatiefvoorstel)", "Datum": "2012-12-18T00:00:00"},
                         {"Soort": "Voorstel van wet (initiatiefvoorstel)", "Datum": "2013-12-19T00:00:00"},
                         {"Soort": "Nota van wijziging", "Datum": "2016-02-10T00:00:00"},
                         {"Soort": "Nota van wijziging", "Datum": "2016-09-02T00:00:00"}],
            "Besluit": [besluit("2016-09-13", "Stemmen - aangenomen")],
            "ZaakActor": [{"ActorFractie": "D66", "Functie": "Tweede Kamerlid"}]}
    r = wet_reis.reis("2012Z1", haler=lambda u: {"value": [zaak]})
    assert [h["halte"] for h in r["haltes"]] == ["ingediend", "aangepast", "aangepast", "gestemd"]
    assert r["indiener"] == ["D66"] and r["uitslag"] == "aangenomen"

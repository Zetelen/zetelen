"""Tests voor pipeline/stemgenoten_selectie.py, zonder netwerk."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import stemgenoten_selectie as sg  # noqa: E402


def test_namen_uit_onderwerp():
    assert sg.zonder_namen("Amendement van het lid Jansen c.s. over middelen voor het openbaar vervoer") == "Amendement over middelen voor het openbaar vervoer"
    assert sg.zonder_namen("Amendement van de leden De Vries en Bakker ter vervanging van nr. 3 over iets") == "Amendement ter vervanging van nr. 3 over iets"
    assert sg.zonder_namen("Voorstel van wet van het lid Dijkstra tot wijziging van de Embryowet") == "Voorstel van wet tot wijziging van de Embryowet"


def test_technische_amendementen_herkend():
    assert sg.TECHNISCH.search("Amendement over een evaluatie na drie jaar")
    assert sg.TECHNISCH.search("Amendement over een voorhang bij artikel 27a")
    assert not sg.TECHNISCH.search("Amendement over middelen voor het openbaar vervoer")


def test_overeenkomst():
    s = [{"stemmen": {"A": "Voor", "B": "Voor"}}, {"stemmen": {"A": "Voor", "B": "Tegen"}}, {"stemmen": {"A": "Voor", "B": "Niet deelgenomen"}}]
    assert sg.overeenkomst(s, "A", "B") == 50


def test_kamerstuk():
    assert sg.kamerstuk(36800, "XVI") == "36800-XVI"
    assert sg.kamerstuk(36881, None) == "36881"
    assert sg.kamerstuk(None, None) is None


def test_uitslag_van_de_kamer_gaat_voor():
    assert sg.uitslag("Aangenomen.", 60, 90) == "aangenomen"
    assert sg.uitslag("Verworpen.", 90, 60) == "verworpen"
    assert sg.uitslag(None, 90, 60) == "aangenomen"
    assert sg.uitslag("", 60, 90) == "verworpen"

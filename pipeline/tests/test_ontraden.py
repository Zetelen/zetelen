"""Tests voor pipeline/ontraden.py, zonder netwerk."""
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import ontraden  # noqa: E402


def besluit(datum, soort):
    return {"BesluitSoort": soort, "Agendapunt": {"Activiteit": {"Datum": f"{datum}T10:00:00+02:00"}}}


def test_oordeel_verkort():
    assert ontraden.oordeel("Ontraden") == "O"
    assert ontraden.oordeel("Ontraden, tenzij gewijzigd") == "O"
    assert ontraden.oordeel("Oordeel Kamer") == "K"
    assert ontraden.oordeel("Overgenomen") == "V"
    assert ontraden.oordeel("Ontijdig") == "A"
    assert ontraden.oordeel(None) == "A"


def test_uitslag_laatste_stemming():
    assert ontraden.uitslag([besluit("2024-01-10", "Stemmen - verworpen"), besluit("2024-02-10", "Stemmen - aangenomen")]) == 1
    assert ontraden.uitslag([besluit("2024-01-10", "Stemmen - aangenomen"), besluit("2024-02-10", "Stemmen - niet aangenomen")]) == 0
    assert ontraden.uitslag([besluit("2024-01-10", "Aanhouden")]) is None
    assert ontraden.uitslag([]) is None


def test_maanden():
    assert list(ontraden.maanden(date(2019, 11, 5), date(2020, 2, 1))) == [(2019, 11), (2019, 12), (2020, 1), (2020, 2)]

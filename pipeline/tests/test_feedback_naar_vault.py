# Tests voor pipeline/feedback_naar_vault.py: geen e-mailadressen in de notitie, en laatste_id uit de frontmatter
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from feedback_naar_vault import blok, laatste_id, vragen  # noqa: E402


def test_vragen_uit_het_formulier():
    v = vragen()
    assert v["indruk"] == "Wat is in één zin je eerste indruk?"
    assert "stellingen" in v and "mail" in v


def test_geen_mailadres_in_blok():
    f = {"id": 7, "ontvangen_op": "2026-10-27T10:00:00+00:00", "antwoorden": {"mail": "iemand@voorbeeld.nl", "fout": "zie iemand@voorbeeld.nl"}}
    tekst = blok(f, vragen())
    assert "@" not in tekst
    assert "opvragen bij nr. 7" in tekst
    assert "27 oktober 2026, 11:00" in tekst


def test_laatste_id(tmp_path):
    n = tmp_path / "f.md"
    assert laatste_id(n) == 0
    n.write_text("---\nlaatste_id: 12\n---\n", encoding="utf-8")
    assert laatste_id(n) == 12


def test_snelle_vraag():
    f = {"id": 9, "ontvangen_op": "2026-10-28T10:00:00+00:00", "pagina": "snel /verkenner",
         "antwoorden": {"duidelijk": "nee", "onduidelijk": "Wat betekent cohesie? mail me op a@b.nl"}}
    tekst = blok(f, vragen())
    assert "Snelle vraag op /verkenner:** duidelijk? nee" in tekst
    assert "@" not in tekst

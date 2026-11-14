"""Tests voor pipeline/demissionair.py (Actueel-stuk demissionair). Zonder netwerk."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import demissionair as dm  # noqa: E402


def b(stemmen, datum, soort="Motie", verdeeld=True, besluit="x"):
    return {"besluit": besluit, "datum": datum, "zaak_nummer": "2026Z00001", "zaak_soort": soort, "onderwerp": "iets",
            "uitslag": "Aangenomen.", "verdeeld": verdeeld, "stemmen": stemmen, "titels": []}


IDS = {"A": ["a"], "B": ["b"], "C": ["c"], "X": ["x"], "Y": ["y"]}
K = {"demissionair": "2021-01-15", "verkiezing": "2021-03-17", "kamer": "2021-03-31"}


def test_periode_knipt_op_ontslag_en_installatie():
    assert dm.periode_van("2021-01-14", K) == "missionair"
    assert dm.periode_van("2021-01-15", K) == "demVoor"
    # De oude Kamer stemt door tot de installatie: na de verkiezingen, voor de installatie is nog demVoor
    assert dm.periode_van("2021-03-24", K) == "demVoor"
    assert dm.periode_van("2021-03-31", K) == "demNa"


def test_datums_van_alle_kabinetten_staan_op_volgorde_en_hebben_een_bron():
    for naam, k in dm.KABINETTEN.items():
        assert k["demissionair"] <= k["verkiezing"] < k["kamer"], naam
        for veld in ("demissionair", "verkiezing", "kamer"):
            assert k["bron"][veld].startswith("https://"), (naam, veld)
            assert any(d in k["bron"][veld] for d in ("parlement.com", "rijksoverheid.nl", "tweedekamer.nl")), (naam, veld)
    dm.controleer_datums(K, "2022-01-10")


def test_rutte_ii_werd_demissionair_voor_de_verkiezingen():
    """Het ontslag werd een dag voor de verkiezingen aangeboden (tweedekamer.nl), niet erna."""
    r2 = dm.KABINETTEN["Rutte II"]
    assert r2["demissionair"] == "2017-03-14" and r2["verkiezing"] == "2017-03-15" and r2["kamer"] == "2017-03-23"


def test_periode_cijfers_eensgezind_paren_en_alleen_staan():
    besluiten = [
        b({"a": "Voor", "b": "Voor", "c": "Tegen"}, "2021-01-20", besluit="1"),   # C alleen
        b({"a": "Voor", "b": "Voor", "c": "Voor"}, "2021-01-21", besluit="2"),    # eensgezind
        b({"a": "Tegen", "b": "Voor"}, "2021-01-22", besluit="3"),                # C stemde niet
        b({"a": "Voor", "b": "Voor", "c": "Voor"}, "2021-01-23", verdeeld=False, besluit="4"),  # telt niet
    ]
    r = dm.periode_cijfers(besluiten, IDS, ["A", "B", "C"], ["A", "B", "C"], lambda d: ["A", "B", "C"])
    assert r["verdeeld"] == 3 and r["van"] == "2021-01-20" and r["tot"] == "2021-01-22"
    assert r["eensgezind"] == {"gestemd": 2, "eensgezind": 1, "pct": 50.0}
    ab = next(p for p in r["paren"] if (p["a"], p["b"]) == ("A", "B"))
    assert ab["gezamenlijk"] == 3 and ab["gelijk"] == 2
    assert r["alleen"]["verdeeld"] == 3
    assert r["alleen"]["partijen"][0] == {"afkorting": "C", "basis": 3, "keer": 1, "won": 1, "pct": 33.3}  # de rest stemde voor en won
    assert r["klein"] is True  # minder dan KLEIN verdeelde stemmingen
    assert dm.periode_cijfers([], IDS, ["A"], ["A"], lambda d: ["A"]) is None


def test_alleen_staan_telt_niet_bij_twee_partijen():
    besluiten = [b({"a": "Voor", "b": "Tegen"}, "2021-01-20")]
    r = dm.periode_cijfers(besluiten, IDS, ["A", "B"], ["A", "B"], lambda d: ["A", "B"])
    assert r["alleen"]["verdeeld"] == 0 and r["alleen"]["partijen"] == []


def test_verschuivingen_tegen_de_mediaan_van_alle_paren(monkeypatch):
    monkeypatch.setattr(dm, "MIN_PAAR", 2)
    # Missionair: A en X altijd tegenover elkaar; daarna altijd samen. B en Y veranderen niet.
    voor = [b({"a": "Voor", "b": "Voor", "x": "Tegen", "y": "Tegen"}, "2021-01-01", besluit=str(i)) for i in range(4)]
    na = [b({"a": "Voor", "b": "Voor", "x": "Voor", "y": "Tegen"}, "2021-02-01", besluit=str(i)) for i in range(4)]
    v = dm.verschuivingen(voor, na, IDS, ["A", "B", "X", "Y"], ["A", "B"], ["X", "Y"])
    assert v["paren"] == 6
    ax = next(x for x in v["kabOpp"] if (x["kabinetspartij"], x["oppositie"]) == ("A", "X"))
    assert (ax["voor"], ax["na"], ax["verschil"], ax["motie"]) == (0.0, 100.0, 100.0, 100.0)
    # Paren die veranderden: A-X en B-X (plus 100), X-Y (min 100); de rest 0. Mediaan van zes: 0
    assert v["mediaan"] == 0.0
    a = next(p for p in v["perPartij"] if p["kabinetspartij"] == "A")
    assert a["stijger"]["oppositie"] == "X" and a["daler"] is None
    # Paren binnen het kabinet tellen niet als kabinet en oppositie
    assert all(x["oppositie"] in ("X", "Y") for x in v["kabOpp"])


def test_verschuivingen_laat_kleine_paren_weg(monkeypatch):
    monkeypatch.setattr(dm, "MIN_PAAR", 5)
    voor = [b({"a": "Voor", "x": "Tegen"}, "2021-01-01")]
    na = [b({"a": "Voor", "x": "Voor"}, "2021-02-01")]
    v = dm.verschuivingen(voor, na, IDS, ["A", "X"], ["A"], ["X"])
    assert v["paren"] == 0 and v["kabOpp"] == [] and v["mediaan"] is None


def test_alleen_partijen_tellen_mee():
    ids = {"VVD": ["1"], "D66": ["2"], "Groep Iemand": ["3"]}
    mee, weg = dm.partijen_van([], ids)
    assert mee == ["VVD", "D66"] and weg == 1

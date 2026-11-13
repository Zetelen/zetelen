"""Tests voor pipeline/coalitie_verdeeld.py (Actueel-stuk coalitie-verdeeld). Zonder netwerk."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import coalitie_verdeeld as cv  # noqa: E402
import akkoord_belastingplan as ak  # noqa: E402


def b(stemmen, datum, verdeeld=True, besluit="x"):
    return {"besluit": besluit, "datum": datum, "zaak_nummer": "2026Z00001", "zaak_soort": "Motie", "onderwerp": "iets",
            "uitslag": "Aangenomen.", "verdeeld": verdeeld, "stemmen": stemmen, "titels": []}


IDS = {"A": ["a"], "B": ["b"], "C": ["c"], "X": ["x"], "Y": ["y"]}


def test_maanden_tussen_loopt_over_de_jaargrens():
    assert cv.maanden_tussen("2026-02-23", "2026-05-01") == ["2026-02", "2026-03", "2026-04", "2026-05"]
    assert cv.maanden_tussen("2026-11-30", "2027-01-02") == ["2026-11", "2026-12", "2027-01"]


def test_per_maand_telt_alleen_staan_eensgezind_en_de_noemer():
    besluiten = [
        b({"a": "Voor", "b": "Voor", "c": "Tegen"}, "2026-02-26", besluit="1"),   # C alleen
        b({"a": "Voor", "b": "Voor", "c": "Voor"}, "2026-02-27", besluit="2"),    # eensgezind
        b({"a": "Voor", "b": "Voor"}, "2026-03-02", besluit="3"),                 # C stemde niet: geen van beide
        b({"a": "Tegen", "b": "Voor", "c": "Voor"}, "2026-03-03", besluit="4"),   # A alleen
        b({"a": "Voor", "b": "Voor", "c": "Tegen"}, "2026-03-04", verdeeld=False, besluit="5"),  # niet verdeeld
    ]
    m = cv.per_maand(besluiten, IDS, ["A", "B", "C"], "2026-02-23", "2026-04-10")
    assert [x["maand"] for x in m] == ["2026-02", "2026-03", "2026-04"]
    assert m[0] == {"maand": "2026-02", "van": "2026-02-26", "tot": "2026-02-27", "verdeeld": 2,
                    "alleen": {"A": 0, "B": 0, "C": 1}, "eensgezind": 1}
    assert m[1]["verdeeld"] == 2 and m[1]["alleen"] == {"A": 1, "B": 0, "C": 0} and m[1]["eensgezind"] == 0
    # Een maand zonder stemmingen (reces): nullen en geen datums
    assert m[2] == {"maand": "2026-04", "van": None, "tot": None, "verdeeld": 0, "alleen": {"A": 0, "B": 0, "C": 0}, "eensgezind": 0}


def test_som_over_de_maanden_is_buiten_de_boot_over_de_hele_periode():
    """De definitie is dezelfde als blok "buiten" van akkoord-belastingplan: de maanden tellen op tot dat getal."""
    besluiten = [b({"a": s1, "b": s2, "c": s3}, d, besluit=str(i)) for i, (s1, s2, s3, d) in enumerate([
        ("Voor", "Voor", "Tegen", "2026-03-01"), ("Tegen", "Voor", "Voor", "2026-03-15"), ("Voor", "Tegen", "Voor", "2026-05-01"),
        ("Voor", "Voor", "Tegen", "2026-06-30"), ("Voor", "Voor", "Voor", "2026-06-30"),
    ])]
    leden = ["A", "B", "C"]
    m = cv.per_maand(besluiten, IDS, leden, "2026-02-23", "2026-06-30")
    heel = ak.buiten_de_boot(besluiten, IDS, lambda d: leden)
    for a in leden:
        assert sum(x["alleen"][a] for x in m) == heel["per"][a]["keer"]
    assert sum(x["verdeeld"] for x in m) == heel["verdeeld"]


def test_groep_maat_geeft_zetels_eensgezind_en_het_laagste_paar():
    besluiten = [
        b({"a": "Voor", "b": "Voor", "x": "Voor"}, "2026-03-01", besluit="1"),
        b({"a": "Voor", "b": "Voor", "x": "Tegen"}, "2026-03-02", besluit="2"),
        b({"a": "Tegen", "b": "Tegen", "x": "Tegen"}, "2026-03-03", besluit="3"),
        b({"a": "Tegen", "b": "Tegen"}, "2026-03-04", besluit="4"),  # X stemde niet: telt niet voor de groep
    ]
    g = cv.groep_maat(besluiten, IDS, {"A": 40, "B": 30, "X": 10}, ["A", "B", "X"])
    assert g["tk"] == 80
    assert (g["gestemd"], g["eensgezind"]) == (3, 2)
    assert {g["laagstePaar"]["a"], g["laagstePaar"]["b"]} in ({"A", "X"}, {"B", "X"})
    assert g["laagstePaar"]["cohesie"] == round(100 * 2 / 3, 1)

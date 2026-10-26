"""Tests voor pipeline/stemming_casus.py (casussen voor /uitgelicht). Zonder netwerk: de API is nagebootst."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import stemming_casus as sc  # noqa: E402

NAAM = "Jansen-Testpersoon"


def stem(soort, fractie, vergissing=False, verwijderd=False, persoon=True):
    return {"Soort": soort, "ActorFractie": fractie, "Vergissing": vergissing, "Verwijderd": verwijderd,
            "Persoon_Id": "p" if persoon else None, "Fractie": {"Afkorting": fractie}}


def test_lees_uitslag_in_alle_vormen_uit_de_bron():
    assert sc.lees_uitslag("Aangenomen (116-30)") == {"voor": 116, "tegen": 30}
    assert sc.lees_uitslag("Aangenomen. (74-72) (Hoofdelijk)") == {"voor": 74, "tegen": 72}
    assert sc.lees_uitslag("Gestaakt. (Hoofdelijk 72-72)") == {"voor": 72, "tegen": 72}
    assert sc.lees_uitslag("Niet aangenomen (na Hoofdelijk 73-73)") == {"voor": 73, "tegen": 73}
    assert sc.lees_uitslag("Aangehouden.") is None
    assert sc.lees_uitslag(None) is None


def test_vergissing_telt_mee_en_wordt_apart_vastgelegd():
    rijen = [stem("Voor", "VVD")] * 3 + [stem("Tegen", "VVD", vergissing=True), stem("Tegen", "PVV")]
    t = sc.tel_stemmen(rijen)
    assert t["stemmen"]["Tegen"] == {"PVV": 1, "VVD": 1}
    assert t["telling"] == {"Voor": 3, "Tegen": 2, "Niet deelgenomen": 0}
    assert t["vergissingen"] == {"Tegen": {"VVD": 1}}


def test_verwijderd_en_stemmen_zonder_persoon_tellen_niet():
    rijen = [stem("Voor", "SP"), stem("Voor", "SP", verwijderd=True), stem("Tegen", "SP", persoon=False)]
    t = sc.tel_stemmen(rijen)
    assert t["telling"]["Voor"] == 1 and t["telling"]["Tegen"] == 0
    assert t["verwijderd"] == 1 and t["zonderPersoon"] == 1


def test_verschil_met_de_bron_wordt_benoemd():
    b = sc.maak_besluit({"BesluitTekst": "Aangenomen (3-1)", "Agendapunt": {"Activiteit": {"Datum": "2026-03-10T15:20:00+01:00"}}},
                        [stem("Voor", "SP")] * 2 + [stem("Tegen", "VVD")])
    assert b["datum"] == "2026-03-10"
    assert b["verschillen"] == ["voor: bron 3, geteld 2"]
    gelijk = sc.maak_besluit({"BesluitTekst": "Aangenomen (2-1)"}, [stem("Voor", "SP")] * 2 + [stem("Tegen", "VVD")])
    assert gelijk["verschillen"] == []


def test_indieners_indiener_eerst_zonder_dubbelen_en_zonder_commissie():
    actoren = [
        {"Relatie": "Medeindiener", "Fractie": {"Afkorting": "SP"}},
        {"Relatie": "Voortouwcommissie", "Fractie": None, "ActorFractie": None},
        {"Relatie": "Indiener", "Fractie": {"Afkorting": "CDA"}},
        {"Relatie": "Medeindiener", "Fractie": {"Afkorting": "SP"}},
        {"Relatie": "Medeindiener", "Fractie": {"Afkorting": "VVD"}, "Verwijderd": True},
    ]
    assert sc.indieners(actoren) == ["CDA", "SP"]


class NepApi:
    """Bootst de API na: een zaak met twee hoofdelijke besluiten, stemmen over twee pagina's."""

    def __init__(self):
        self.urls = []

    def __call__(self, u):
        self.urls.append(u)
        if "/Zaak?" in u:
            return {"value": [{
                "Nummer": "2018Z00001", "Soort": "Motie", "Onderwerp": f"Motie van het lid {NAAM}",
                "ZaakActor": [{"Relatie": "Indiener", "ActorFractie": "CDA", "Fractie": {"Afkorting": "CDA"}}],
                "Besluit": [
                    {"Id": "b2", "StemmingsSoort": "Hoofdelijk", "BesluitSoort": "Stemmen - niet aangenomen", "BesluitTekst": "Niet aangenomen (na Hoofdelijk 1-1)",
                     "Agendapunt": {"Activiteit": {"Datum": "2018-11-13T15:00:00+01:00"}}},
                    {"Id": "b1", "StemmingsSoort": "Hoofdelijk", "BesluitSoort": "Stemmen - gestaakt", "BesluitTekst": "Gestaakt. (Hoofdelijk 1-1)",
                     "Agendapunt": {"Activiteit": {"Datum": "2018-11-06T15:00:00+01:00"}}},
                    {"Id": "b0", "StemmingsSoort": "Met handopsteken", "BesluitTekst": "Aangehouden."},
                ],
            }]}
        if "pagina2" in u:
            return {"value": [{**stem("Tegen", "VVD"), "ActorNaam": NAAM}]}
        return {"value": [{**stem("Voor", "CDA"), "ActorNaam": NAAM}], "@odata.nextLink": u + "&pagina2"}


def test_main_schrijft_json_en_print_alleen_aantallen(tmp_path, capsys):
    api = NepApi()
    assert sc.main(["2018Z00001", "--uitvoer", str(tmp_path)], haler=api) == 0
    uit = capsys.readouterr().out
    assert NAAM not in uit and "Motie van" not in uit
    assert "2018Z00001 besluit 1 (2018-11-06): voor 1, tegen 1" in uit
    casus = json.loads((tmp_path / "2018Z00001.json").read_text(encoding="utf-8"))
    assert [b["besluitSoort"] for b in casus["besluiten"]] == ["Stemmen - gestaakt", "Stemmen - niet aangenomen"]
    assert casus["indieners"] == ["CDA"]
    assert casus["besluiten"][0]["stemmen"] == {"Voor": {"CDA": 1}, "Tegen": {"VVD": 1}, "Niet deelgenomen": {}}
    # Geen namen van personen in de stemmen in het bestand
    assert NAAM not in json.dumps(casus["besluiten"])


def test_main_geeft_fout_bij_verschil_met_de_bron(tmp_path):
    class Afwijkend(NepApi):
        def __call__(self, u):
            d = super().__call__(u)
            if "/Zaak?" in u:
                d["value"][0]["Besluit"][1]["BesluitTekst"] = "Gestaakt. (Hoofdelijk 2-2)"
            return d
    assert sc.main(["2018Z00001", "--uitvoer", str(tmp_path)], haler=Afwijkend()) == 1


def test_de_casussen_in_de_site_kloppen_met_de_bron():
    # De bestanden in web/content/uitgelicht zijn gemaakt met dit script: telling gelijk aan BesluitTekst
    map_ = sc.UITVOER
    bestanden = sorted(map_.glob("*.json"))
    assert len(bestanden) >= 6
    for f in bestanden:
        casus = json.loads(f.read_text(encoding="utf-8"))
        for b in casus["besluiten"]:
            assert b["verschillen"] == [], f.name
            assert b["bron"] == {"voor": b["telling"]["Voor"], "tegen": b["telling"]["Tegen"]}, f.name
            assert sum(b["telling"].values()) == 150, f.name

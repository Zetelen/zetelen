#!/usr/bin/env python3
"""Ontsleutelt de feedback uit de workflow Feedback ophalen en zet nieuwe formulieren in een notitie.

Draait op de Mac van Niels: de geheime sleutel staat daar buiten de repo. E-mailadressen gaan niet mee
naar de notitie; er staat alleen dat er een adres is achtergelaten, met het nummer van het formulier.
De notitie houdt in de frontmatter het hoogste nummer bij (laatste_id), zodat niets dubbel komt.

Gebruik:
  python3 pipeline/feedback_naar_vault.py <feedback.p7m> <geheime-sleutel.pem> <notitie.md>
  python3 pipeline/feedback_naar_vault.py --laatste <notitie.md>   (print laatste_id, voor de workflow)
"""
import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

VRAGEN_BRON = Path(__file__).resolve().parents[1] / "web" / "lib" / "feedback.ts"
MAIL = re.compile(r"[^\s@]+@[^\s@]+\.[^\s@]+")
MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"]


def vragen() -> dict[str, str]:
    """De vraagteksten per id, uit het formulier zelf."""
    return dict(re.findall(r'id: "(\w+)", vraag: "([^"]+)"', VRAGEN_BRON.read_text(encoding="utf-8")))


def laatste_id(notitie: Path) -> int:
    if not notitie.exists():
        return 0
    m = re.search(r"^laatste_id: (\d+)$", notitie.read_text(encoding="utf-8"), re.M)
    return int(m.group(1)) if m else 0


def ontsleutel(bestand: Path, sleutel: Path) -> list[dict]:
    uit = subprocess.run(["openssl", "smime", "-decrypt", "-binary", "-inform", "DER", "-in", str(bestand), "-inkey", str(sleutel)],
                         capture_output=True, check=True)
    return json.loads(uit.stdout.decode("utf-8"))


def blok(f: dict, teksten: dict[str, str]) -> str:
    t = datetime.fromisoformat(f["ontvangen_op"]).astimezone(ZoneInfo("Europe/Amsterdam"))
    regels = [f"## Nr. {f['id']} · {t.day} {MAANDEN[t.month - 1]} {t.year}, {t:%H:%M}", ""]
    for sleutel, antwoord in f["antwoorden"].items():
        if sleutel == "mail":
            regels.append(f"- **E-mail:** adres achtergelaten (opvragen bij nr. {f['id']})")
            continue
        tekst = MAIL.sub("[e-mailadres]", str(antwoord)).replace("\n", " ")
        regels.append(f"- **{teksten.get(sleutel, sleutel)}** {tekst}")
    return "\n".join(regels) + "\n"


def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--laatste":
        print(laatste_id(Path(sys.argv[2])))
        return
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    bestand, sleutel, notitie = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    vorige = laatste_id(notitie)
    nieuw = [f for f in ontsleutel(bestand, sleutel) if f["id"] > vorige]
    nu = datetime.now(ZoneInfo("Europe/Amsterdam"))
    hoogste = max([vorige] + [f["id"] for f in nieuw])
    kop = (f"---\ntype: feedback\nproject: \"[[Zetelen]]\"\nlaatste_id: {hoogste}\nbijgewerkt: {nu:%Y-%m-%d}\n---\n"
           "# Zetelen: feedback van bezoekers\n\n"
           "Uit het formulier op zetelen.nl/feedback, nieuwste bovenaan. E-mailadressen staan hier niet in.\n\n")
    oud = notitie.read_text(encoding="utf-8").split("\n\n", 2)[2] if notitie.exists() and vorige else ""
    teksten = vragen()
    notitie.write_text(kop + "".join(blok(f, teksten) + "\n" for f in reversed(nieuw)) + oud, encoding="utf-8")
    print(f"{len(nieuw)} nieuwe formulieren; laatste nummer {hoogste}.")


if __name__ == "__main__":
    main()

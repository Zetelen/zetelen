#!/usr/bin/env python3
"""Haalt ingevulde feedbackformulieren op uit beheer.feedback en schrijft ze als JSON naar een bestand.

Draait in de workflow Feedback ophalen. Print nooit de antwoorden zelf: de log van GitHub Actions is
publiek en een antwoord kan een e-mailadres bevatten. De workflow versleutelt het bestand daarna met de
publieke sleutel in pipeline/feedback-ontvanger.pem; alleen de Mac van Niels kan het openen.

Gebruik:
  DATABASE_URL=... python3 pipeline/feedback_ophalen.py <vanaf-id> <uitvoer.json>
"""
import json
import os
import sys

import psycopg

from verbindingstest import uitleg


def main():
    if len(sys.argv) != 3:
        sys.exit("Gebruik: feedback_ophalen.py <vanaf-id> <uitvoer.json>")
    vanaf, uitvoer = int(sys.argv[1]), sys.argv[2]
    url = os.environ.get("DATABASE_URL")
    if not url:
        sys.exit("DATABASE_URL ontbreekt.")
    try:
        with psycopg.connect(url) as conn:
            conn.execute("set transaction read only")
            rijen = conn.execute(
                "select id, ontvangen_op, pagina, antwoorden from beheer.feedback where id > %s order by id", (vanaf,)
            ).fetchall()
            conn.rollback()
    except psycopg.Error as fout:
        sys.exit(f"Query mislukt. {uitleg(fout)}")
    with open(uitvoer, "w", encoding="utf-8") as f:
        json.dump([{"id": r[0], "ontvangen_op": r[1].isoformat(), "pagina": r[2], "antwoorden": r[3]} for r in rijen], f, ensure_ascii=False)
    print(f"{len(rijen)} formulieren opgehaald (vanaf id {vanaf}).")


if __name__ == "__main__":
    main()

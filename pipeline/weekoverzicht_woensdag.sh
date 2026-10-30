#!/bin/bash
# Weekoverzicht op woensdagochtend (besluit Niels, 30 oktober 2026): zet de stemmingen van de afgelopen week met
# pipeline/weekoverzicht.py in een notitie. Draait op de Mac van Niels via launchd, zoals feedback_dagelijks.sh. De map
# in de vault komt als argument, zodat dat pad niet in deze publieke repo staat. De publishable key komt uit
# web/.env.local (niet in de repo). Uitvoer: alleen aantallen.
# Gebruik: pipeline/weekoverzicht_woensdag.sh <map>
set -euo pipefail

MAP="${1:?Gebruik: weekoverzicht_woensdag.sh <map>}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"
set -a
. web/.env.local
set +a

echo "$(date '+%Y-%m-%d %H:%M') start"
python3 pipeline/weekoverzicht.py "$MAP"
echo "$(date '+%Y-%m-%d %H:%M') klaar"

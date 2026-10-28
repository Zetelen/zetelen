#!/bin/bash
# Dagelijkse feedbackcheck (verzoek Niels, 28 oktober 2026): start de workflow Feedback ophalen vanaf het laatste nummer in
# de notitie, wacht tot hij klaar is, haalt het versleutelde bestand op en zet nieuwe formulieren met
# pipeline/feedback_naar_vault.py in de notitie. Draait op de Mac van Niels via launchd; de sleutel staat in ~/.zetelen,
# buiten de repo. De notitie (het pad naar de vault) komt als argument, zodat dat pad niet in deze publieke repo staat.
# Uitvoer: alleen aantallen, geen inhoud van formulieren.
# Gebruik: pipeline/feedback_dagelijks.sh <notitie.md>
set -euo pipefail

NOTITIE="${1:?Gebruik: feedback_dagelijks.sh <notitie.md>}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
SLEUTEL="$HOME/.zetelen/feedback-sleutel.pem"
TIJDELIJK="$(mktemp -d)"
trap 'rm -rf "$TIJDELIJK"' EXIT
cd "$REPO"

echo "$(date '+%Y-%m-%d %H:%M') start"
VANAF="$(python3 pipeline/feedback_naar_vault.py --laatste "$NOTITIE")"
START="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
gh workflow run feedback.yml -f vanaf="$VANAF" >/dev/null

# De run verschijnt pas na een paar seconden in de lijst: wacht op een run die na de start begon (hooguit 2 minuten)
RUN=""
for _ in $(seq 1 24); do
  sleep 5
  RUN="$(gh run list --workflow feedback.yml -L 5 --json databaseId,createdAt \
    -q "[.[] | select(.createdAt >= \"$START\")][0].databaseId // empty")"
  [ -n "$RUN" ] && break
done
[ -n "$RUN" ] || { echo "geen run gevonden"; exit 1; }

gh run watch "$RUN" --exit-status >/dev/null
gh run download "$RUN" -n feedback -D "$TIJDELIJK"
python3 pipeline/feedback_naar_vault.py "$TIJDELIJK/feedback.p7m" "$SLEUTEL" "$NOTITIE"
echo "$(date '+%Y-%m-%d %H:%M') klaar"

#!/usr/bin/env python3
"""Maakt de geluidseffecten van de video's zelf (synthese, geen downloads, dus geen licentievragen).

Schrijft WAV-bestanden (44,1 kHz, mono) naar video/public/geluid/:
  tik      kort klikje, bij een stem of een cijfer
  swoosh   ruisvlaag, bij een overgang
  dreun    lage klap, bij een stempel of een grote kop
  toon     heldere klank, bij een uitslag
  stijg    oplopende spanning, voor een onthulling
  daal     dalende toon, als een meerderheid wegvalt
  plof     doffe uitbarsting, als de zaal uiteenvalt
Gebruik: python3 scripts/geluid.py
"""
import math
import random
import struct
import wave
from pathlib import Path

RATE = 44100
MAP = Path(__file__).resolve().parents[1] / "public" / "geluid"
random.seed(26)


def schrijf(naam, monsters, volume=0.8):
    piek = max(1e-9, max(abs(x) for x in monsters))
    data = b"".join(struct.pack("<h", int(max(-1, min(1, x / piek * volume)) * 32767)) for x in monsters)
    with wave.open(str(MAP / f"{naam}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(data)


def ruis(n):
    return [random.uniform(-1, 1) for _ in range(n)]


def laagdoorlaat(x, alfa):
    """Eenpolig filter; alfa per monster (lijst) of vast getal."""
    uit, y = [], 0.0
    for i, s in enumerate(x):
        a = alfa[i] if isinstance(alfa, list) else alfa
        y += a * (s - y)
        uit.append(y)
    return uit


def tik():
    n = int(0.035 * RATE)
    return [math.sin(2 * math.pi * 2200 * i / RATE) * math.exp(-i / (0.004 * RATE)) + 0.3 * random.uniform(-1, 1) * math.exp(-i / (0.001 * RATE)) for i in range(n)]


def swoosh():
    n = int(0.42 * RATE)
    alfa = [0.02 + 0.25 * math.sin(math.pi * i / n) ** 2 for i in range(n)]
    x = laagdoorlaat(ruis(n), alfa)
    return [s * math.sin(math.pi * i / n) ** 1.5 for i, s in enumerate(x)]


def dreun():
    n = int(0.55 * RATE)
    uit, fase = [], 0.0
    for i in range(n):
        f = 45 + 90 * math.exp(-i / (0.05 * RATE))
        fase += 2 * math.pi * f / RATE
        uit.append(math.sin(fase) * math.exp(-i / (0.16 * RATE)))
    klik = laagdoorlaat(ruis(n), 0.15)
    return [u + 0.5 * k * math.exp(-i / (0.012 * RATE)) for i, (u, k) in enumerate(zip(uit, klik))]


def toon():
    n = int(1.1 * RATE)
    return [sum(a * math.sin(2 * math.pi * f * i / RATE) for f, a in [(784, 1.0), (1176, 0.5), (1568, 0.25)]) * math.exp(-i / (0.35 * RATE)) * min(1, i / 200) for i in range(n)]


def stijg():
    n = int(1.3 * RATE)
    uit, fase = [], 0.0
    x = laagdoorlaat(ruis(n), [0.01 + 0.3 * (i / n) ** 2 for i in range(n)])
    for i in range(n):
        f = 180 + 900 * (i / n) ** 2
        fase += 2 * math.pi * f / RATE
        uit.append((0.35 * math.sin(fase) + 0.65 * x[i]) * (i / n) ** 1.5)
    return uit


def daal():
    n = int(0.7 * RATE)
    uit, fase = [], 0.0
    for i in range(n):
        f = 620 * (1 - 0.65 * i / n)
        fase += 2 * math.pi * f / RATE
        uit.append(math.sin(fase) * math.exp(-i / (0.3 * RATE)) * min(1, i / 300))
    return uit


def plof():
    n = int(0.8 * RATE)
    x = laagdoorlaat(ruis(n), [0.25 * math.exp(-i / (0.15 * RATE)) + 0.01 for i in range(n)])
    return [s * math.exp(-i / (0.22 * RATE)) for i, s in enumerate(x)]


if __name__ == "__main__":
    MAP.mkdir(parents=True, exist_ok=True)
    for naam, f, v in [("tik", tik, 0.5), ("swoosh", swoosh, 0.55), ("dreun", dreun, 0.9), ("toon", toon, 0.55),
                       ("stijg", stijg, 0.5), ("daal", daal, 0.55), ("plof", plof, 0.8)]:
        schrijf(naam, f(), v)
    print(f"Geluiden geschreven naar {MAP.relative_to(MAP.parents[2])}")

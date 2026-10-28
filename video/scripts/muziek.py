#!/usr/bin/env python3
"""Maakt een rustige muzikale onderlaag voor de video's (verzoek Niels, 28 oktober 2026). Zelf gemaakt met synthese, dus
alle rechten bij Zetelen en geen claims op Instagram, TikTok of YouTube.

Neutraal bedoeld: geen spanning, geen drama, geen bekende melodie. Een zachte pad in vier akkoorden (Am7, Fmaj7, Cmaj9,
G6), een licht getokkeld arpeggio in achtsten en een lage grondtoon, op 96 slagen per minuut, met galm. Infaden en
uitfaden, zodat hij onder elke video past.

Schrijft video/public/muziek/onderlaag.wav (44,1 kHz, stereo).
Gebruik: python3 scripts/muziek.py [seconden]   (standaard 46)
"""
import sys
import wave
from pathlib import Path

import numpy as np
from scipy.signal import fftconvolve, lfilter

RATE = 44100
BPM = 96
UIT = Path(__file__).resolve().parents[1] / "public" / "muziek" / "onderlaag.wav"
rng = np.random.default_rng(28)

# Akkoorden als MIDI-noten; elk akkoord twee maten
AKKOORDEN = [
    [57, 60, 64, 67],  # Am7
    [53, 57, 60, 64],  # Fmaj7
    [48, 55, 59, 62],  # Cmaj9 (zonder grondtoon in de pad)
    [55, 59, 62, 64],  # G6
]


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def laagdoorlaat(x, kantel):
    # Eenvoudig eerste-ordefilter: haalt de scherpte uit de zaagtanden
    a = np.exp(-2 * np.pi * kantel / RATE)
    return lfilter([1 - a], [1, -a], x)


def pad(noten, duur):
    t = np.arange(int(duur * RATE)) / RATE
    uit = np.zeros((len(t), 2))
    for n in noten:
        for kant, ontstem in ((0, -0.06), (1, 0.06)):  # licht ontstemd per kant: breed en zacht
            f = hz(n) * 2 ** (ontstem / 12)
            zaag = 2 * ((t * f) % 1) - 1
            uit[:, kant] += laagdoorlaat(zaag, 900)
    # Langzaam aanzwellen en wegzakken per akkoord
    omhul = np.minimum(1, t / 1.2) * np.minimum(1, (duur - t) / 1.0)
    return uit * omhul[:, None]


def tokkel(noot, duur=0.6):
    t = np.arange(int(duur * RATE)) / RATE
    f = hz(noot)
    toon = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)
    return toon * np.exp(-t * 7) * np.minimum(1, t / 0.005)


def voeg(mix, start, x, kanaal=None):
    # Tel x op bij de mix vanaf start, afgekapt aan het eind
    lengte = max(0, min(len(x), len(mix) - start))
    if kanaal is None:
        mix[start:start + lengte] += x[:lengte]
    else:
        mix[start:start + lengte, kanaal] += x[:lengte]


def maak(seconden):
    n = int(seconden * RATE)
    mix = np.zeros((n + RATE * 3, 2))
    maat = 4 * 60 / BPM
    achtste = 60 / BPM / 2
    t0, i = 0.0, 0
    while t0 < seconden:
        akkoord = AKKOORDEN[i % len(AKKOORDEN)]
        duur = 2 * maat
        s = int(t0 * RATE)
        p = pad(akkoord, duur + 1.0)
        voeg(mix, s, 0.12 * p)
        # Lage grondtoon
        tb = np.arange(int(duur * RATE)) / RATE
        bas = np.sin(2 * np.pi * hz(akkoord[0] - 12) * tb) * np.minimum(1, tb / 0.3) * np.minimum(1, (duur - tb) / 0.5)
        voeg(mix, s, 0.18 * bas[:, None])
        # Arpeggio in achtsten, een octaaf hoger, met een kleine variatie in volgorde en sterkte
        volgorde = [0, 2, 1, 3, 2, 1, 3, 2]
        for k in range(16):
            noot = akkoord[volgorde[k % 8]] + 12
            st = int((t0 + k * achtste) * RATE)
            tk = tokkel(noot) * (0.05 + 0.015 * rng.random())
            links = 0.5 + 0.3 * np.sin(k)  # zacht heen en weer in het stereobeeld
            voeg(mix, st, tk * links, 0)
            voeg(mix, st, tk * (1 - links), 1)
        t0 += duur
        i += 1
    mix = mix[:n]
    # Galm: een korte, uitstervende ruisstaart als impulsrespons
    lengte = int(1.8 * RATE)
    ir = rng.standard_normal((lengte, 2)) * np.exp(-np.arange(lengte) / RATE * 3.2)[:, None]
    ir /= np.abs(ir).sum(axis=0)
    nat = np.stack([fftconvolve(mix[:, k], ir[:, k])[:n] for k in range(2)], axis=1)
    mix = 0.75 * mix + 0.6 * nat * 40
    # In- en uitfaden, en normaliseren op een rustige piek
    t = np.arange(n) / RATE
    mix *= (np.minimum(1, t / 1.5) * np.minimum(1, (seconden - t) / 3.0))[:, None]
    mix *= 0.5 / np.abs(mix).max()
    return mix


def main():
    seconden = float(sys.argv[1]) if len(sys.argv) > 1 else 46
    mix = maak(seconden)
    UIT.parent.mkdir(parents=True, exist_ok=True)
    data = (mix * 32767).astype("<i2").tobytes()
    with wave.open(str(UIT), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(data)
    print(f"Geschreven: {UIT.name}, {seconden:.0f} seconden")


if __name__ == "__main__":
    main()

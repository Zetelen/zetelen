# Component: onderwerpen

Status: voorstel (25 oktober 2026), nog niet goedgekeurd. Lees eerst `_conventies.md`.

## Doel

Elke stemming een onderwerp geven, op twee niveaus, zodat de site kan laten zien op welke onderwerpen fracties het wel of niet eens zijn, en zodat een vergelijking van twee fracties binnen hetzelfde onderwerp kan (feedback van Niels, 24 oktober 2026). Grondstof voor graphic 3 op de voorpagina (`docs/ontwerp/scroll-graphics.md`), een drilldown en een sankey.

## Laag

Backend (ingest, core, analyses) en een handmatige koppeltabel.

## Bron (uitgezocht op 25 oktober 2026)

- Bij de motie zelf staat geen bruikbaar onderwerp: de `ZaakActor` met `Relatie` = 'Voortouwcommissie' is bij moties altijd 'TK' (250 van 250 in een steekproef uit 2025).
- Elke motie hoort bij een Kamerstukdossier (relatie `Kamerstukdossier` van `Zaak`; velden `Nummer`, `Titel`, `Toevoeging`).
- Per dossier is de vaste commissie te vinden: de meest voorkomende `ZaakActor.ActorNaam` met `Relatie` = 'Voortouwcommissie', zonder 'TK', over alle zaken in dat dossier.
- Steekproef van 750 moties uit maart 2022, 2024 en 2026: alle 750 kregen zo een vaste commissie, verdeeld over 116 dossiers en 23 commissienamen.

## Voorstel

Twee niveaus:

1. **Beleidsterrein**: de vaste commissie van het dossier, samengevoegd tot ongeveer 15 vaste terreinen. Commissies krijgen bij elk kabinet een nieuwe naam (bijvoorbeeld "Economische Zaken en Klimaat (2017-2024)" en "Klimaat en Groene Groei"); een handmatige tabel `core.beleidsterrein_commissie` koppelt elke commissienaam aan een terrein. Niels kijkt die tabel na, net als `core.kabinet` en `core.coalitie`.
2. **Dossier**: de titel van het Kamerstukdossier, bijvoorbeeld "Natuurbeleid" of "Europese Raad".

Wat er moet gebeuren:

- `ingest`: `Kamerstukdossier` laden, de koppeling zaak en dossier (zoals `besluit_zaak`), en `ZaakActor` met relatie 'Voortouwcommissie' (staat al in `raw.zaakactor`; nakijken of die gevuld is in Supabase).
- `core`: tabel `dossier` (nummer, toevoeging, titel, commissie) en `zaak_dossier`.
- Handmatig: `core.beleidsterrein_commissie` (commissienaam, beleidsterrein).
- `analyses`: cohesie per beleidsterrein en periode (zelfde definitie als nu, met een filter); eensgezindheid per beleidsterrein.
- `api`: views voor de site.

## Aandachtspunten

- Brede dossiers: begrotingen (onderscheid via `Toevoeging`, het hoofdstuk), "Kabinetscrisis" en "Kabinetsformatie" krijgen een commissie (vaak Binnenlandse Zaken) die weinig over de inhoud zegt. Voorstel: die als apart terrein "Kabinet en formatie" in de koppeltabel.
- Een motie kan bij meer dan één dossier horen: dan telt de motie bij elk terrein mee, of kiezen we het eerste. Te besluiten.
- Te weinig stemmingen per terrein en periode: dezelfde drempel van 25 als bij cohesie.
- Steekproef nog niet herhaald voor 2010 tot 2021.

## Testen

- pytest op de koppeling met een kleine set dossiers.
- Steekproef: 20 moties met de hand naast het toegekende terrein leggen (Niels).
- Dekking per jaar in `beheer.datakwaliteit`: aandeel moties zonder terrein.

## Schatting

8 tot 14 uur, waarvan de koppeltabel 1 tot 2 uur nakijken voor Niels.

## Vragen aan Niels

1. Akkoord met beleidsterrein via het dossier, en dossier als fijner niveau?
2. Motie bij meer dossiers: overal meetellen of het eerste?
3. In R1 of erna?

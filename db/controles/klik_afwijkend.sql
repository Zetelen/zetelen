-- De besluiten waarvan de uitslag in de bron niet past bij de stemmen (beheer.afwijkende_uitslag, C4 in
-- docs/plan/controles-stappenplan.md). Met het aantal stemmen dat als vergissing is gemarkeerd. Geen namen.
select a.datum::text, a.besluit_id::text, a.stemmingssoort, a.besluitsoort, a.zetels_voor, a.zetels_tegen, a.zaaknummers,
       (select count(*) from core.persoonsstem ps where ps.besluit_id = a.besluit_id and ps.vergissing) as vergissingen_lid,
       (select count(*) from core.fractiestem fs where fs.besluit_id = a.besluit_id and fs.vergissing) as vergissingen_fractie
from beheer.afwijkende_uitslag a
order by a.datum;

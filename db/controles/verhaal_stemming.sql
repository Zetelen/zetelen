-- Controle voor web/content/verhaal-stemming.json (graphic 2 op /verhaal): de stemmen per fractie
-- bij de hoofdelijke stemming over zaak 2025Z11623, geteld uit core.persoonsstem. Alleen aantallen.
-- Moet gelijk zijn aan "stemmen" in het JSON-bestand.
select ps.soort, f.afkorting, count(*) as leden
from core.zaak z
join core.besluit_zaak bz on bz.zaak_id = z.id
join core.besluit b on b.id = bz.besluit_id and b.stemmingssoort = 'Hoofdelijk'
join core.persoonsstem ps on ps.besluit_id = b.id
join core.fractie f on f.id = ps.fractie_id
where z.nummer = '2025Z11623'
group by ps.soort, f.afkorting
order by ps.soort, leden desc;

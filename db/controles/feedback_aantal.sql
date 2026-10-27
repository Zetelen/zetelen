-- Aantal ingevulde feedbackformulieren per dag. Alleen aantallen: de log van GitHub Actions is publiek,
-- dus nooit de antwoorden zelf (die kunnen een e-mailadres bevatten).
select (ontvangen_op at time zone 'Europe/Amsterdam')::date as dag, count(*) as aantal
from beheer.feedback
group by 1
order by 1;

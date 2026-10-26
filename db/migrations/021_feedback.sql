-- Feedback via een eigen formulier op de site (besluit Niels B13, 26 oktober 2026): geen externe dienst.
-- Bezoekers kunnen niets lezen of rechtstreeks schrijven. Ze kunnen alleen api.stuur_feedback() aanroepen: een
-- smalle functie die de invoer controleert en een rij toevoegt. Dit is de enige uitzondering op de regel dat
-- bezoekers geen functies uitvoeren; pipeline/controleer_rechten.py noemt haar bij naam.
-- Geen IP-adres of browsergegevens. Bewaartermijn 12 maanden: beheer.ruim_feedback_op() draait na elke verversing.

create table beheer.feedback (
    id bigint generated always as identity primary key,
    ontvangen_op timestamptz not null default now(),
    pagina text,
    antwoorden jsonb not null
);
alter table beheer.feedback enable row level security;

-- Controleert de invoer en voegt een rij toe. Met proef = true alleen de controle, zonder rij: zo kan de
-- rechtentest na elke migratie nagaan dat de functie werkt, zonder testrijen in de tabel.
create function api.stuur_feedback(pagina text, antwoorden jsonb, proef boolean default false) returns text
    language plpgsql
    security definer
    set search_path = pg_catalog, pg_temp
as $$
declare
    sleutel text;
    waarde jsonb;
begin
    if antwoorden is null or jsonb_typeof(antwoorden) <> 'object' then
        raise exception 'antwoorden moet een object zijn' using errcode = '22023';
    end if;
    if (select count(*) from jsonb_object_keys(antwoorden)) not between 1 and 20 then
        raise exception 'tussen 1 en 20 antwoorden' using errcode = '22023';
    end if;
    if length(antwoorden::text) > 12000 or length(coalesce(pagina, '')) > 200 then
        raise exception 'te lang' using errcode = '22023';
    end if;
    for sleutel, waarde in select * from jsonb_each(antwoorden) loop
        if length(sleutel) > 40 or jsonb_typeof(waarde) not in ('string', 'number') or length(waarde #>> '{}') > 3000 then
            raise exception 'ongeldig antwoord' using errcode = '22023';
        end if;
    end loop;
    if proef then
        return 'proef';
    end if;
    -- Rem op misbruik: hooguit 30 inzendingen per 10 minuten, voor iedereen samen
    if (select count(*) from beheer.feedback where ontvangen_op > now() - interval '10 minutes') >= 30 then
        raise exception 'even te druk, probeer het later nog eens' using errcode = '54000';
    end if;
    insert into beheer.feedback (pagina, antwoorden) values (stuur_feedback.pagina, stuur_feedback.antwoorden);
    return 'ontvangen';
end;
$$;

revoke execute on function api.stuur_feedback(text, jsonb, boolean) from public;
grant execute on function api.stuur_feedback(text, jsonb, boolean) to anon, authenticated;

-- Bewaartermijn: alleen de eigenaar (de verversing) voert dit uit
create function beheer.ruim_feedback_op() returns bigint
    language sql
as $$
    with weg as (delete from beheer.feedback where ontvangen_op < now() - interval '12 months' returning 1)
    select count(*) from weg;
$$;
revoke execute on function beheer.ruim_feedback_op() from public;

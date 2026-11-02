-- Klikteller voor social (besluit Niels, 2 november 2026, K17): welke post brengt bezoekers, en blijven ze.
-- Een link in een post draagt ?via=<kanaal>-<issuenummer> (bijvoorbeeld bs-12). De deellink meldt de klik, de
-- pagina waar de bezoeker landt meldt een keer of die verder kijkt. Geen IP-adres, geen user agent, geen cookie:
-- alleen tijd, soort, via-code, grafiek, apparaat (mobiel, tablet of desktop) en landcode.
-- Net als het feedbackformulier (migratie 021) kunnen bezoekers alleen api.stuur_klik() aanroepen; lezen kan niet.
-- Bewaartermijn 12 maanden: beheer.ruim_klik_op() draait na elke verversing.

create table beheer.klik (
    id bigint generated always as identity primary key,
    op timestamptz not null default now(),
    soort text not null check (soort in ('klik', 'blijft')),
    via text not null,
    grafiek text,
    apparaat text check (apparaat in ('mobiel', 'tablet', 'desktop')),
    land text
);
alter table beheer.klik enable row level security;
create index klik_via on beheer.klik (via);

-- Controleert de invoer en voegt een rij toe. Met proef = true alleen de controle, zonder rij (voor de rechtentest).
create function api.stuur_klik(soort text, via text, grafiek text default null, apparaat text default null,
                               land text default null, proef boolean default false) returns text
    language plpgsql
    security definer
    set search_path = pg_catalog, pg_temp
as $$
begin
    if soort is null or soort not in ('klik', 'blijft') then
        raise exception 'onbekende soort' using errcode = '22023';
    end if;
    if via is null or via !~ '^(bs|li|ma)-[0-9]{1,6}$' then
        raise exception 'ongeldige via' using errcode = '22023';
    end if;
    if grafiek is not null and grafiek !~ '^[a-z][a-z-]{0,39}$' then
        raise exception 'ongeldige grafiek' using errcode = '22023';
    end if;
    if apparaat is not null and apparaat not in ('mobiel', 'tablet', 'desktop') then
        raise exception 'ongeldig apparaat' using errcode = '22023';
    end if;
    if land is not null and land !~ '^[A-Z]{2}$' then
        raise exception 'ongeldig land' using errcode = '22023';
    end if;
    if proef then
        return 'proef';
    end if;
    -- Rem op misbruik: hooguit 600 meldingen per 10 minuten, voor iedereen samen
    if (select count(*) from beheer.klik where op > now() - interval '10 minutes') >= 600 then
        raise exception 'even te druk' using errcode = '54000';
    end if;
    insert into beheer.klik (soort, via, grafiek, apparaat, land)
    values (stuur_klik.soort, stuur_klik.via, stuur_klik.grafiek, stuur_klik.apparaat, stuur_klik.land);
    return 'ontvangen';
end;
$$;

revoke execute on function api.stuur_klik(text, text, text, text, text, boolean) from public;
grant execute on function api.stuur_klik(text, text, text, text, text, boolean) to anon, authenticated;

-- Bewaartermijn: alleen de eigenaar (de verversing) voert dit uit
create function beheer.ruim_klik_op() returns bigint
    language sql
as $$
    with weg as (delete from beheer.klik where op < now() - interval '12 months' returning 1)
    select count(*) from weg;
$$;
revoke execute on function beheer.ruim_klik_op() from public;

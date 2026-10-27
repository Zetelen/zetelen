-- Cohesie per half jaar (verzoek Niels, 27 oktober 2026): een trendlijn in de verkenner, met een schuif om zelf een
-- periode te kiezen. Zelfde definitie als analyses.cohesie (docs/plan/definitie-cohesie.md), maar per half jaar in
-- plaats van per kabinet of Kamerperiode. De tabel bewaart de tellingen, niet het percentage: de site telt de halve
-- jaren van de gekozen periode op (gelijk / gezamenlijk) en past zelf de drempel van 25 toe, per punt en voor het geheel.
-- Afgeleid en unlogged; opnieuw opgebouwd door analyses.herbouw_halfjaar() na analyses.herbouw().

create unlogged table analyses.cohesie_halfjaar (
    halfjaar date not null check (extract(day from halfjaar) = 1 and extract(month from halfjaar) in (1, 7)),
    variant text not null check (variant in ('alle', 'verdeeld')),
    fractie_a uuid not null,
    fractie_b uuid not null,
    gezamenlijk integer not null,
    gelijk integer not null,
    primary key (halfjaar, variant, fractie_a, fractie_b),
    check (fractie_a < fractie_b)
);

alter table analyses.cohesie_halfjaar enable row level security;
create policy lezen on analyses.cohesie_halfjaar for select to anon, authenticated using (true);
grant select on analyses.cohesie_halfjaar to anon, authenticated;

create function analyses.herbouw_halfjaar()
returns table (tabel text, rijen bigint)
language plpgsql
as $$
begin
    truncate analyses.cohesie_halfjaar;

    insert into analyses.cohesie_halfjaar (halfjaar, variant, fractie_a, fractie_b, gezamenlijk, gelijk)
    with verdeeld as (
        select besluit_id, bool_or(stem = 'Voor') and bool_or(stem = 'Tegen') as verdeeld
        from analyses.fractie_besluit_stem
        group by besluit_id
    ),
    besluit_halfjaar as (
        -- 1 januari voor januari tot en met juni, 1 juli voor juli tot en met december
        select b.id as besluit_id,
               make_date(extract(year from b.datum)::int, case when extract(month from b.datum) <= 6 then 1 else 7 end, 1) as halfjaar,
               v.verdeeld
        from core.besluit b
        join verdeeld v on v.besluit_id = b.id
    ),
    varianten as (
        select bh.halfjaar, v.variant, a.fractie_id as fractie_a, b.fractie_id as fractie_b, (a.stem = b.stem) as gelijk
        from besluit_halfjaar bh
        join analyses.fractie_besluit_stem a on a.besluit_id = bh.besluit_id
        join analyses.fractie_besluit_stem b on b.besluit_id = bh.besluit_id and a.fractie_id < b.fractie_id
        cross join lateral (values ('alle', true), ('verdeeld', bh.verdeeld)) v(variant, telt_mee)
        where v.telt_mee
    )
    select halfjaar, variant, fractie_a, fractie_b, count(*), count(*) filter (where gelijk)
    from varianten
    group by halfjaar, variant, fractie_a, fractie_b;

    return query select 'cohesie_halfjaar', count(*) from analyses.cohesie_halfjaar;
end;
$$;

revoke execute on function analyses.herbouw_halfjaar() from public;

-- API: in beide richtingen (zoals api.cohesie), met de afkortingen, zodat de site op een paar kan filteren
create view api.cohesie_halfjaar with (security_invoker = true) as
    select c.halfjaar, c.variant, c.fractie_a as fractie, fa.afkorting as fractie_afkorting,
           c.fractie_b as andere_fractie, fb.afkorting as andere_fractie_afkorting, c.gezamenlijk, c.gelijk
    from analyses.cohesie_halfjaar c
    join core.fractie fa on fa.id = c.fractie_a
    join core.fractie fb on fb.id = c.fractie_b
    union all
    select c.halfjaar, c.variant, c.fractie_b, fb.afkorting, c.fractie_a, fa.afkorting, c.gezamenlijk, c.gelijk
    from analyses.cohesie_halfjaar c
    join core.fractie fa on fa.id = c.fractie_a
    join core.fractie fb on fb.id = c.fractie_b;

grant select on api.cohesie_halfjaar to anon, authenticated;

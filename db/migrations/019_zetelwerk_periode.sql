-- Zetelwerk per periode en rol van de indieners (pagina Oppositiewerk, hoofdstukken 2, 3 en 6).
-- Een view over analyses.zaak_uitslag: elk stuk telt een keer, ook als er indieners uit meer fracties zijn.

create view api.zetelwerk_periode with (security_invoker = true) as
    select p.periodesoort, p.periode, u.soort, coalesce(u.indiener_rol, 'onbekend') as indiener_rol,
           count(*) as ingediend, count(*) filter (where u.aangenomen) as aangenomen,
           count(*) filter (where u.brede_steun) as brede_steun
    from analyses.zaak_uitslag u
    cross join lateral (values ('kabinet', u.kabinet), ('kamerperiode', u.kamerperiode)) p(periodesoort, periode)
    where p.periode is not null
    group by 1, 2, 3, 4;

grant select on api.zetelwerk_periode to anon, authenticated;

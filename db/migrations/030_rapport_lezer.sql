-- Leesgebruiker voor het wekelijkse klikrapport (besluit Niels, 2 november 2026, K17). Het rapport draait als Action in
-- de private repo Zetelen/zetelen-social en mag alleen beheer.klik lezen: geen andere tabel, niets schrijven.
-- De rol kan hier nog niet inloggen: een wachtwoord hoort niet in een publieke repo. Niels zet het zelf in Supabase
-- (alter role rapport with login password '...') en het verbindingsadres als secret in zetelen-social.

do $$
begin
    if not exists (select 1 from pg_roles where rolname = 'rapport') then
        create role rapport nologin;
    end if;
end;
$$;

grant usage on schema beheer to rapport;
grant select on beheer.klik to rapport;
create policy rapport_leest on beheer.klik for select to rapport using (true);

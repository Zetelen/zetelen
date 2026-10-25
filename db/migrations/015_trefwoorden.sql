-- Trefwoorden in de titel van een dossier gaan voor de commissie (besluit Niels, 25 oktober 2026).
-- Reden: indelen op commissie volgt de verdeling van de ministeries, niet het onderwerp. Asiel viel tot
-- 2024 onder de commissie Justitie en Veiligheid en wonen onder Binnenlandse Zaken, waardoor Asiel en
-- migratie onder Rutte III en IV vrijwel leeg was. Een trefwoord zet een dossier op het juiste terrein,
-- ongeacht de commissie. Nieuw terrein: Digitalisering (ook de commissie Digitale Zaken).
-- Patroon: Postgres-regex op de titel in kleine letters; \m is het begin van een woord, \M het eind.
-- Opgesteld door Claude; Niels kijkt na (gecontroleerd_op). Proef op 7.810 dossiertitels: asiel en migratie
-- 121, wonen en ruimte 193, digitalisering 35 dossiers.

create table core.beleidsterrein_trefwoord (
    patroon text primary key,
    beleidsterrein text not null,
    volgorde integer not null,       -- bij meer treffers wint de laagste
    gecontroleerd_op date
);

insert into core.beleidsterrein_trefwoord (patroon, beleidsterrein, volgorde) values
    ('\masiel', 'Asiel en migratie', 1),
    ('\mvreemdeling', 'Asiel en migratie', 1),
    ('migratie', 'Asiel en migratie', 1),
    ('\minburgering', 'Asiel en migratie', 1),
    ('\mnaturalisatie', 'Asiel en migratie', 1),
    ('\mnationaliteit', 'Asiel en migratie', 1),
    ('\mwonen\M', 'Wonen en ruimte', 2),
    ('\mwoning', 'Wonen en ruimte', 2),
    ('\mhuur', 'Wonen en ruimte', 2),
    ('volkshuisvesting', 'Wonen en ruimte', 2),
    ('ruimtelijke ordening', 'Wonen en ruimte', 2),
    ('\mbouwbesluit', 'Wonen en ruimte', 2),
    ('\mhuisvestingswet', 'Wonen en ruimte', 2),
    ('\mdigitale (zaken|overheid|weerbaarheid|identiteit|strategie|diensten|markten|agenda|economie)', 'Digitalisering', 3),
    ('kunstmatige intelligentie', 'Digitalisering', 3),
    ('\mcyber', 'Digitalisering', 3),
    ('\malgoritm', 'Digitalisering', 3),
    ('\minternet', 'Digitalisering', 3),
    ('\mprivacy', 'Digitalisering', 3),
    ('\mict-', 'Digitalisering', 3);

alter table core.beleidsterrein_trefwoord enable row level security;

update core.beleidsterrein_commissie set beleidsterrein = 'Digitalisering'
where commissie = 'vaste commissie voor digitale zaken';

create or replace function core.herbouw_dossiers()
returns table (tabel text, rijen bigint)
language plpgsql
as $$
begin
    truncate core.dossier, core.zaak_dossier;

    insert into core.dossier (id, nummer, toevoeging, titel, commissie, beleidsterrein)
    with voortouw as (
        -- Per dossier en vaste commissie: van hoeveel zaken die commissie voortouwcommissie is ('TK' telt niet)
        select zk."Kamerstukdossier_Id" as dossier_id, lower(trim(c."NaamNL")) as commissie, count(*) as zaken
        from raw.zaakactor za
        join raw.zaak_kamerstukdossier zk on zk."Zaak_Id" = za."Zaak_Id"
        join raw.commissie c on c."Id" = za."Commissie_Id"
        where za."Relatie" = 'Voortouwcommissie' and not coalesce(za."Verwijderd", false)
          and za."ActorNaam" <> 'TK'
        group by 1, 2
    ),
    meeste as (
        select distinct on (dossier_id) dossier_id, commissie
        from voortouw
        order by dossier_id, zaken desc, commissie
    )
    select k."Id", k."Nummer", k."Toevoeging", k."Titel", m.commissie,
           -- Eerst een trefwoord in de titel (laagste volgorde wint), dan de commissie, anders Overig
           coalesce(
               (select t.beleidsterrein from core.beleidsterrein_trefwoord t
                where lower(k."Titel") ~ t.patroon order by t.volgorde, t.patroon limit 1),
               bc.beleidsterrein, 'Overig')
    from raw.kamerstukdossier k
    left join meeste m on m.dossier_id = k."Id"
    left join core.beleidsterrein_commissie bc on bc.commissie = m.commissie
    where not coalesce(k."Verwijderd", false);

    -- Alleen zaken waarover gestemd is (core.zaak)
    insert into core.zaak_dossier (zaak_id, dossier_id)
    select zk."Zaak_Id", zk."Kamerstukdossier_Id"
    from raw.zaak_kamerstukdossier zk
    join core.zaak z on z.id = zk."Zaak_Id"
    join core.dossier d on d.id = zk."Kamerstukdossier_Id";

    return query
        select 'dossier', count(*) from core.dossier
        union all select 'zaak_dossier', count(*) from core.zaak_dossier;
end;
$$;

revoke execute on function core.herbouw_dossiers() from public;

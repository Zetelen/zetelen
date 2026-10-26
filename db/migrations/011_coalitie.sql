-- Kabinet of oppositie per fractie (vervroegd op verzoek van Niels, 24 oktober 2026; was "Later").
-- Handmatige tabel, net als core.kabinet: Niels kijkt elke rij na (gecontroleerd_op).
-- Een fractie hoort bij het kabinet van van tot (niet tot en met) tot; tot leeg = tot het einde van het kabinet.
-- rol: 'kabinet' (levert bewindspersonen) of 'gedoogsteun' (steunt het kabinet zonder bewindspersonen).
-- Bron: voor Schoof en Jetten de partij van de bewindspersonen in Wikidata (opgehaald 24 oktober 2026);
-- de rest uit de kennis van Claude. Datums van uittreden uit de kennis van Claude. Alles nog na te kijken.

create table core.coalitie (
    kabinet text not null references core.kabinet (naam),
    fractie_afkorting text not null,
    rol text not null check (rol in ('kabinet', 'gedoogsteun')),
    van date,
    tot date,
    bron text not null,
    gecontroleerd_op date,
    primary key (kabinet, fractie_afkorting)
);

insert into core.coalitie (kabinet, fractie_afkorting, rol, van, tot, bron) values
    ('Balkenende IV', 'CDA', 'kabinet', null, null, 'Claude, na te kijken'),
    ('Balkenende IV', 'PvdA', 'kabinet', null, '2010-02-23', 'Claude, na te kijken (PvdA stapte op 23 februari 2010 uit het kabinet)'),
    ('Balkenende IV', 'ChristenUnie', 'kabinet', null, null, 'Claude, na te kijken'),
    ('Rutte I', 'VVD', 'kabinet', null, null, 'Claude, na te kijken'),
    ('Rutte I', 'CDA', 'kabinet', null, null, 'Claude, na te kijken'),
    ('Rutte I', 'PVV', 'gedoogsteun', null, '2012-04-21', 'Claude, na te kijken (gedoogsteun eindigde na het Catshuisoverleg, april 2012)'),
    ('Rutte II', 'VVD', 'kabinet', null, null, 'Claude, na te kijken'),
    ('Rutte II', 'PvdA', 'kabinet', null, null, 'Claude, na te kijken'),
    ('Rutte III', 'VVD', 'kabinet', null, null, 'Claude, na te kijken'),
    ('Rutte III', 'CDA', 'kabinet', null, null, 'Claude, na te kijken'),
    ('Rutte III', 'D66', 'kabinet', null, null, 'Claude, na te kijken'),
    ('Rutte III', 'ChristenUnie', 'kabinet', null, null, 'Claude, na te kijken'),
    ('Rutte IV', 'VVD', 'kabinet', null, null, 'Claude, na te kijken'),
    ('Rutte IV', 'D66', 'kabinet', null, null, 'Claude, na te kijken'),
    ('Rutte IV', 'CDA', 'kabinet', null, null, 'Claude, na te kijken'),
    ('Rutte IV', 'ChristenUnie', 'kabinet', null, null, 'Claude, na te kijken'),
    ('Schoof', 'PVV', 'kabinet', null, '2025-06-03', 'Wikidata (bewindspersonen); datum uittreden Claude, na te kijken'),
    ('Schoof', 'VVD', 'kabinet', null, null, 'Wikidata (bewindspersonen), na te kijken'),
    ('Schoof', 'Nieuw Sociaal Contract', 'kabinet', null, '2025-08-22', 'Wikidata (bewindspersonen); datum uittreden Claude, na te kijken'),
    ('Schoof', 'BBB', 'kabinet', null, null, 'Wikidata (bewindspersonen), na te kijken'),
    ('Jetten', 'D66', 'kabinet', null, null, 'Wikidata (bewindspersonen, 24 oktober 2026), na te kijken'),
    ('Jetten', 'VVD', 'kabinet', null, null, 'Wikidata (bewindspersonen, 24 oktober 2026), na te kijken'),
    ('Jetten', 'CDA', 'kabinet', null, null, 'Wikidata (bewindspersonen, 24 oktober 2026), na te kijken');

alter table core.coalitie enable row level security;
create policy lezen on core.coalitie for select to anon, authenticated using (true);
grant select on core.coalitie to anon, authenticated;

create view api.coalitie with (security_invoker = true) as
    select kabinet, fractie_afkorting as afkorting, rol, van, tot from core.coalitie;
grant select on api.coalitie to anon, authenticated;

-- Controle C5 van de handmatige tabellen (27 oktober 2026). Kabinetten en coalities nagelopen tegen Wikipedia
-- (Balkenende IV, Rutte I, Schoof, Jetten): alle datums kloppen, geen wijziging. Besluiten Niels: commissie
-- Integratiebeleid blijft bij Asiel en migratie, de brede trefwoorden "migratie" en "internet" blijven, drie
-- trefwoorden erbij. Partijkoppeling bijgewerkt (wordt op de site niet gebruikt).

-- 1. Coalities: bron bijgewerkt na de controle
update core.coalitie
set bron = 'Wikipedia (kabinet-Balkenende IV, Rutte I, Schoof, Jetten), nagekeken door Claude op 27 oktober 2026'
where bron like '%na te kijken%';

-- 2. Trefwoorden erbij (een dossier krijgt het terrein bij de volgende verversing)
insert into core.beleidsterrein_trefwoord (patroon, beleidsterrein, volgorde) values
    ('\mvluchteling', 'Asiel en migratie', 1),
    ('\mstatushouder', 'Asiel en migratie', 1),
    ('\momgevingswet', 'Wonen en ruimte', 2);

-- 3. Partijkoppeling: PRO is de fractie GroenLinks-PvdA onder een nieuwe naam (Progressief Nederland, vanaf
--    10 juni 2026); de Groep Markuszower kreeg geen nieuwe naam (verzoek afgewezen op 9 juni 2026)
update core.fractie_partij
set partij = 'Progressief Nederland',
    opmerking = 'Fractie GroenLinks-PvdA onder een nieuwe naam, vanaf 10 juni 2026 (Tweede Kamer, 9 juni 2026)'
where afkorting = 'PRO';

update core.fractie_partij
set opmerking = 'Verzoek om de naam De Nieuwe Alliantie te voeren is op 9 juni 2026 afgewezen; fractienaam ongewijzigd'
where afkorting = 'Groep Markuszower';

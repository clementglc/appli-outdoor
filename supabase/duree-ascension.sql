-- Durée de l'ascension (en minutes), saisie manuellement en regardant
-- l'activité liée (Strava affiche le temps du segment du col, pas
-- l'appli — voir CLAUDE.md pour pourquoi la déduction automatique n'est
-- pas fiable : plusieurs segments communautaires se chevauchent souvent
-- sur un même col, avec des points de départ/arrivée légèrement
-- différents). À exécuter une fois dans Supabase → SQL Editor.

alter table ascensions add column if not exists duree_minutes integer;

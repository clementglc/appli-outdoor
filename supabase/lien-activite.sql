-- Remplace l'upload de trace GPX/FIT (illisible dans l'app, aucun moyen
-- de la visualiser) par un simple lien vers l'activité correspondante
-- (Strava, Garmin Connect, etc.) — le viewer de la plateforme d'origine
-- fait le travail bien mieux qu'un visualiseur maison. À exécuter une
-- fois dans Supabase → SQL Editor.

alter table ascensions add column if not exists lien_activite text;
alter table ascensions drop column if exists trace_path;
alter table ascensions drop column if exists trace_nom_original;

-- Le bucket Storage "traces" (créé par supabase/storage.sql) n'est plus
-- utilisé par l'app — laissé en place (rien à migrer, un seul fichier de
-- test y avait été déposé), supprimable manuellement depuis Supabase →
-- Storage si besoin.

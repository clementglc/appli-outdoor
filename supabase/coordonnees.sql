-- Coordonnées GPS du sommet de chaque col, pour la carte interactive.
-- À exécuter une fois dans Supabase → SQL Editor.

alter table cols add column if not exists latitude double precision;
alter table cols add column if not exists longitude double precision;

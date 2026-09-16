-- Ajoute le profil kilomètre par kilomètre d'un versant (pente moyenne de
-- chaque km, du pied au sommet). Tableau de nombres (%), nullable tant
-- que le profil n'a pas été renseigné. À exécuter une fois dans
-- Supabase → SQL Editor.

alter table versants add column if not exists profil_km jsonb;

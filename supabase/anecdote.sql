-- Champ "anecdote" par col : volontairement limité à une seule info
-- factuelle et vérifiable (l'année du dernier passage du Tour de France
-- par ce col), pas un texte narratif libre — sur demande explicite de
-- l'utilisateur. À exécuter une fois dans Supabase → SQL Editor.

alter table cols add column if not exists anecdote text;

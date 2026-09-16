-- Bucket de stockage pour les traces GPX/FIT jointes à une ascension.
-- À exécuter une fois dans Supabase → SQL Editor (après schema.sql).
-- Bucket privé : chaque fichier est accessible uniquement à son
-- propriétaire, via une policy RLS basée sur le premier segment du
-- chemin (convention : "<user_id>/<uuid>-<nom_original>").

insert into storage.buckets (id, name, public)
values ('traces', 'traces', false)
on conflict (id) do nothing;

create policy "traces: lecture par proprietaire"
on storage.objects for select to authenticated
using (bucket_id = 'traces' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "traces: depot par proprietaire"
on storage.objects for insert to authenticated
with check (bucket_id = 'traces' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "traces: suppression par proprietaire"
on storage.objects for delete to authenticated
using (bucket_id = 'traces' and (storage.foldername(name))[1] = auth.uid()::text);

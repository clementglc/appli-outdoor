-- Schéma initial : cols, versants (données de référence, partagées entre
-- utilisateurs authentifiés) + ascensions (données personnelles, RLS par
-- utilisateur). À exécuter une fois dans Supabase → SQL Editor.

create extension if not exists "pgcrypto";

create table cols (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  altitude_m integer,
  departement text,
  created_at timestamptz not null default now()
);

create table versants (
  id uuid primary key default gen_random_uuid(),
  col_id uuid not null references cols(id) on delete cascade,
  nom text not null,
  ville_depart text,
  altitude_depart_m integer,
  distance_km numeric,
  denivele_m integer,
  pente_moyenne numeric,
  pente_max numeric,
  created_at timestamptz not null default now()
);

create table ascensions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  versant_id uuid not null references versants(id) on delete cascade,
  date_ascension date not null,
  commentaire text,
  trace_path text,
  trace_nom_original text,
  created_at timestamptz not null default now()
);

alter table cols enable row level security;
alter table versants enable row level security;
alter table ascensions enable row level security;

-- cols / versants : liste de référence partagée — tout utilisateur
-- authentifié peut lire et enrichir (app mono-utilisateur pour l'instant,
-- pas besoin d'un rôle admin séparé).
create policy "cols: lecture" on cols for select to authenticated using (true);
create policy "cols: ecriture" on cols for insert to authenticated with check (true);
create policy "cols: modification" on cols for update to authenticated using (true);
create policy "cols: suppression" on cols for delete to authenticated using (true);

create policy "versants: lecture" on versants for select to authenticated using (true);
create policy "versants: ecriture" on versants for insert to authenticated with check (true);
create policy "versants: modification" on versants for update to authenticated using (true);
create policy "versants: suppression" on versants for delete to authenticated using (true);

-- ascensions : strictement personnelles.
create policy "ascensions: lecture" on ascensions for select to authenticated using (auth.uid() = user_id);
create policy "ascensions: ecriture" on ascensions for insert to authenticated with check (auth.uid() = user_id);
create policy "ascensions: modification" on ascensions for update to authenticated using (auth.uid() = user_id);
create policy "ascensions: suppression" on ascensions for delete to authenticated using (auth.uid() = user_id);

create index ascensions_user_id_idx on ascensions(user_id);
create index versants_col_id_idx on versants(col_id);

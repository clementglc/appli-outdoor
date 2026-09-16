@AGENTS.md

# Cols Pyrénées — checklist des cols pyrénéens gravis à vélo (PWA)

Application personnelle pour Clément (compte : clem.gallice@gmail.com) : recenser tous les cols des Pyrénées françaises, avec leurs différents versants, et cocher ceux déjà gravis. Objectif ultime (quasi impossible) : tous les cols, tous versants confondus. Développée avec Claude Code, sur le même modèle que le projet "Finance WebApp" (voir `../Finance-WebApp/CLAUDE.md` pour les patterns d'origine — auth, structure, pièges connus).

## Stack

- **Next.js (App Router, TypeScript)** + Tailwind CSS v4
- **Supabase** : Postgres + Auth (email/mot de passe) + RLS
- Testé en local via `npm run dev` (ou `npm.cmd run dev` si PowerShell bloque les scripts, cf. Finance WebApp).
- Pas encore de dépôt GitHub ni de déploiement Vercel à ce stade — projet local uniquement.

## Décisions prises au lancement (2026-09-16)

- **Pas d'intégration Garmin** : leur "Connect Developer Program" nécessite une validation manuelle par Garmin, orientée partenaires commerciaux — pas adapté à un projet perso. Abandonné d'emblée.
- **Saisie manuelle en priorité, Strava reporté** : l'utilisateur a explicitement préféré saisir ses ascensions à la main (valeur de se remémorer la sortie) plutôt que tout automatiser. Une intégration Strava (OAuth self-service via strava.com/settings/api, aucune validation requise pour un usage personnel) reste possible plus tard si l'envie vient — non bloquant, à reprendre si demandé.
- **Liste de cols de référence construite manuellement**, enrichie au fil de l'eau plutôt que scrapée — voir `scripts/seed-cols.mjs`.
- Un col est considéré **"gravi" dès qu'au moins un de ses versants l'a été** (convention usuelle) — le détail par versant reste affiché pour qui vise aussi tous les versants. Logique dans `src/lib/cols.ts` (`colsAvecStatut`).

## Schéma Supabase (à créer via `supabase/schema.sql` puis `supabase/storage.sql`, dans le SQL Editor du projet Supabase)

- `cols` : id, nom, altitude_m (nullable), departement (texte libre, nullable), created_at — **données de référence partagées**, pas de user_id (RLS : lecture/écriture pour tout utilisateur authentifié, pas de notion d'admin séparée tant que l'app reste mono-utilisateur)
- `versants` : id, col_id, nom, ville_depart, altitude_depart_m, distance_km, denivele_m, pente_moyenne (%), pente_max (%), created_at — même politique RLS que `cols`
- `ascensions` : id, user_id, versant_id, date_ascension, commentaire (nullable), trace_path (nullable, chemin dans le bucket Storage "traces"), trace_nom_original (nullable), created_at — **RLS stricte par user_id** (données personnelles)
- Bucket Storage `traces` (privé) : traces GPX/FIT jointes à une ascension, chemin `<user_id>/<uuid>.<ext>` — policies RLS sur `storage.objects` scopées par premier segment de chemin = `auth.uid()`

## Fonctionnalités livrées

**Auth** (`/login`) : inscription/connexion email+mdp + "Mot de passe oublié ?" — copié tel quel du pattern Finance WebApp (`forgotPassword`/`updatePassword`, page `/reset-password`, route `/auth/confirm`). **Pas encore de SMTP personnalisé configuré** — utilise l'envoi email par défaut de Supabase (limité en volume mais suffisant pour un usage perso/test ; à passer sur Gmail SMTP comme Finance WebApp si le volume ou la personnalisation des templates devient un problème).

**Checklist** (`/checklist`) : vue principale, lecture seule. Barre de progression "X / Y cols gravis" + "X / Y versants gravis" en tête. Cols groupés par département, triés (non gravis d'abord), chaque col affichant la liste de ses versants avec puce verte/grise + stats (distance, dénivelé, pente) + date de la dernière ascension si gravi.

**Mes ascensions** (`/ascensions`) : vue d'écriture.
- Formulaire "Enregistrer une ascension" (`AscensionForm.tsx`) : sélection Col → Versant (liste dépendante, cascading select côté client), date, commentaire facultatif, upload facultatif d'une trace GPX/FIT (stockée dans le bucket `traces`, jamais public — URL signée générée à la demande, expire après 1h).
- "+ Ajouter un col ou un versant" (`GererColsVersants.tsx`, repliable) : deux petits formulaires pour enrichir la liste de référence au fil de l'eau.
- Liste des ascensions déjà enregistrées (col, versant, date, commentaire, lien de téléchargement de la trace si présente) avec suppression (confirmation, supprime aussi le fichier du Storage).

## Scripts ponctuels (dossier `scripts/`, Node ESM, lisent `.env.local` via `--env-file`, demandent email+mdp dans le terminal — jamais stockés)

- `seed-cols.mjs` : insère un premier jeu d'une vingtaine de cols pyrénéens connus (grands cols du Tour de France + quelques classiques régionales) avec leurs versants principaux. Statistiques (distance/dénivelé/pente) approximatives pour les cols les plus documentés, laissées vides pour les autres — **liste volontairement non exhaustive au démarrage**, à corriger/compléter depuis l'app.

## Non fait / en attente

- **Déploiement Vercel** : pas encore fait (contrairement à Finance WebApp). À faire quand l'app sera jugée assez aboutie pour un usage réel depuis le téléphone.
- **PWA** (manifest, service worker, icônes) : pas encore mise en place — à reprendre du pattern Finance WebApp si besoin d'installation sur écran d'accueil.
- **Intégration Strava** : reportée sciemment (voir "Décisions prises au lancement"). Faisable via OAuth self-service Strava le moment venu.
- **Intégration Garmin** : abandonnée (validation manuelle Garmin, non adaptée à un projet perso).
- **Édition d'un col/versant existant** : seuls l'ajout et la suppression (via suppression d'ascension) sont possibles pour l'instant, pas de modification a posteriori des stats d'un versant déjà créé.
- **SMTP personnalisé** : pas encore configuré, cf. section Auth ci-dessus.

## Fichiers clés

- `src/lib/cols.ts` : logique de statut (col/versant gravi ou non) + calcul de progression
- `src/lib/types.ts`, `src/lib/format.ts`, `src/lib/constants.ts`
- `src/app/(app)/checklist/page.tsx`, `src/app/(app)/ascensions/{page.tsx,actions.ts}`
- `src/components/AscensionForm.tsx`, `GererColsVersants.tsx`, `BoutonConfirmation.tsx`, `NavPrincipale.tsx`
- `supabase/schema.sql` : tables + RLS — **à exécuter une fois dans Supabase → SQL Editor**
- `supabase/storage.sql` : bucket `traces` + policies — **à exécuter une fois, après schema.sql**

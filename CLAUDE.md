@AGENTS.md

# Cols Pyrénées — checklist des cols pyrénéens gravis à vélo (PWA)

Application personnelle pour Clément (compte : clem.gallice@gmail.com) : recenser tous les cols des Pyrénées françaises, avec leurs différents versants, et cocher ceux déjà gravis. Objectif ultime (quasi impossible) : tous les cols, tous versants confondus. Développée avec Claude Code, sur le même modèle que le projet "Finance WebApp" (voir `../Finance-WebApp/CLAUDE.md` pour les patterns d'origine — auth, structure, pièges connus).

## Stack

- **Next.js (App Router, TypeScript)** + Tailwind CSS v4
- **Supabase** : Postgres + Auth (email/mot de passe) + RLS
- Testé en local via `npm run dev -- -p 3010` (port dédié pour ne pas rentrer en conflit avec le serveur de dev de Finance WebApp sur 3000 ; `SITE_URL` dans `.env.local` pointe vers `http://localhost:3010`).
- Dépôt GitHub : `https://github.com/clementglc/appli-outdoor.git`, branche `main`. Pas encore de déploiement Vercel à ce stade — projet local uniquement.

## Décisions prises au lancement (2026-09-16)

- **Pas d'intégration Garmin** : leur "Connect Developer Program" nécessite une validation manuelle par Garmin, orientée partenaires commerciaux — pas adapté à un projet perso. Abandonné d'emblée.
- **Saisie manuelle en priorité, Strava reporté** : l'utilisateur a explicitement préféré saisir ses ascensions à la main (valeur de se remémorer la sortie) plutôt que tout automatiser. Une intégration Strava (OAuth self-service via strava.com/settings/api, aucune validation requise pour un usage personnel) reste possible plus tard si l'envie vient — non bloquant, à reprendre si demandé.
- **Liste de cols de référence construite manuellement**, enrichie au fil de l'eau plutôt que scrapée — voir `scripts/seed-cols.mjs`.
- Un col est considéré **"gravi" dès qu'au moins un de ses versants l'a été** (convention usuelle) — le détail par versant reste affiché pour qui vise aussi tous les versants. Logique dans `src/lib/cols.ts` (`colsAvecStatut`).

## Schéma Supabase (à créer via `supabase/schema.sql` puis `supabase/storage.sql`, dans le SQL Editor du projet Supabase)

- `cols` : id, nom, altitude_m (nullable), departement (texte libre, nullable), created_at — **données de référence partagées**, pas de user_id (RLS : lecture/écriture pour tout utilisateur authentifié, pas de notion d'admin séparée tant que l'app reste mono-utilisateur)
- `versants` : id, col_id, nom, ville_depart, altitude_depart_m, distance_km, denivele_m, pente_moyenne (%), pente_max (%), profil_km (jsonb nullable, tableau de pentes moyennes par km — voir `supabase/profil-km.sql`), created_at — même politique RLS que `cols`
- `ascensions` : id, user_id, versant_id, date_ascension, commentaire (nullable), trace_path (nullable, chemin dans le bucket Storage "traces"), trace_nom_original (nullable), created_at — **RLS stricte par user_id** (données personnelles)
- Bucket Storage `traces` (privé) : traces GPX/FIT jointes à une ascension, chemin `<user_id>/<uuid>.<ext>` — policies RLS sur `storage.objects` scopées par premier segment de chemin = `auth.uid()`

## Fonctionnalités livrées

**Auth** (`/login`) : inscription/connexion email+mdp + "Mot de passe oublié ?" — copié tel quel du pattern Finance WebApp (`forgotPassword`/`updatePassword`, page `/reset-password`, route `/auth/confirm`). **Pas encore de SMTP personnalisé configuré** — utilise l'envoi email par défaut de Supabase (limité en volume mais suffisant pour un usage perso/test ; à passer sur Gmail SMTP comme Finance WebApp si le volume ou la personnalisation des templates devient un problème).

**Checklist** (`/checklist`) : vue principale, lecture seule. Barre de progression "X / Y cols gravis" + "X / Y versants gravis" en tête. Cols groupés par département, triés (non gravis d'abord), chaque col affichant la liste de ses versants avec puce verte/grise + stats (distance, dénivelé, pente) + date de la dernière ascension si gravi. Chaque versant est cliquable → page détail.

**Détail d'un versant** (`/checklist/[versantId]`) : stats complètes (distance, D+, pente moyenne/max, altitude départ/sommet), profil kilomètre par kilomètre (`ProfilVersant.tsx`, graphique en barres SVG maison coloré par tranche de pente — vert/jaune/orange/rouge), formulaire pour renseigner/corriger ce profil (`ProfilVersantForm.tsx` + action `modifierProfilVersant`, pentes séparées par virgules), historique des ascensions personnelles de ce versant.

**Mes ascensions** (`/ascensions`) : vue d'écriture.
- Formulaire "Enregistrer une ascension" (`AscensionForm.tsx`) : sélection Col → Versant (liste dépendante, cascading select côté client), date, commentaire facultatif, upload facultatif d'une trace GPX/FIT (stockée dans le bucket `traces`, jamais public — URL signée générée à la demande, expire après 1h).
- "+ Ajouter un col ou un versant" (`GererColsVersants.tsx`, repliable) : deux petits formulaires pour enrichir la liste de référence au fil de l'eau.
- Liste des ascensions déjà enregistrées (col, versant, date, commentaire, lien de téléchargement de la trace si présente) avec suppression (confirmation, supprime aussi le fichier du Storage).

## Scripts ponctuels (dossier `scripts/`, Node ESM, lisent `.env.local` via `--env-file`, demandent email+mdp dans le terminal — jamais stockés)

- `seed-cols.mjs` : insère un premier jeu d'une vingtaine de cols pyrénéens connus (grands cols du Tour de France + quelques classiques régionales) avec leurs versants principaux. Statistiques (distance/dénivelé/pente) approximatives pour les cols les plus documentés, laissées vides pour les autres — **liste volontairement non exhaustive au démarrage**, à corriger/compléter depuis l'app.
- `appliquer-profils-km.mjs` (2026-09-16) : renseigne `profil_km` pour 18 versants, données lues sur cyclingcols.com (seule source utilisée, choisie pour sa rigueur GPS — voir "Décisions"). ⚠️ **Fiabilité limitée** : cyclingcols ne publie ses profils que sous forme de graphique d'altitude (image), pas de tableau chiffré — les valeurs ont donc été estimées par lecture visuelle du graphique + interpolation, pas extraites telles quelles. La moyenne recalculée colle à la moyenne officielle cyclingcols à ±0.3 point (bon signal global), mais chaque valeur km par km individuelle reste une estimation, pas une donnée "officielle" exacte. 2 versants aux stats trop éloignées de la base existante ont été délibérément exclus du script (Marie-Blanque Ouest, Port de Lers Est) plutôt que d'insérer une donnée probablement fausse ; 7 autres versants n'ont pas été trouvés du tout sur cyclingcols (voir historique de conversation pour le détail : Peyresourde Ouest, Balès Ouest, Menté Sud, Portet-d'Aspet Est, Somport Nord, Jau). Reste à lancer par l'utilisateur (`node --env-file=.env.local scripts/appliquer-profils-km.mjs`), jamais exécuté par Claude (demande les identifiants).

## Non fait / en attente

- **Déploiement Vercel** : pas encore fait (contrairement à Finance WebApp). À faire quand l'app sera jugée assez aboutie pour un usage réel depuis le téléphone.
- **PWA** (manifest, service worker, icônes) : pas encore mise en place — à reprendre du pattern Finance WebApp si besoin d'installation sur écran d'accueil.
- **Intégration Strava** : reportée sciemment (voir "Décisions prises au lancement"). Faisable via OAuth self-service Strava le moment venu.
- **Intégration Garmin** : abandonnée (validation manuelle Garmin, non adaptée à un projet perso).
- **Édition d'un col/versant existant** : seul le profil km par km est modifiable a posteriori (page détail). Les autres champs (distance, D+, pente...) ne sont éditables qu'à la création, pas de formulaire de modification pour l'instant.
- **Profils km par km manquants ou douteux** : 7 versants sans profil du tout + 2 volontairement exclus (voir `appliquer-profils-km.mjs` ci-dessus) — à corriger manuellement depuis la page détail si besoin, ou à retenter avec une autre approche de recherche.
- **SMTP personnalisé** : pas encore configuré, cf. section Auth ci-dessus.

## Fichiers clés

- `src/lib/cols.ts` : logique de statut (col/versant gravi ou non) + calcul de progression
- `src/lib/types.ts`, `src/lib/format.ts`, `src/lib/constants.ts`
- `src/app/(app)/checklist/{page.tsx,[versantId]/{page.tsx,actions.ts}}`, `src/app/(app)/ascensions/{page.tsx,actions.ts}`
- `src/components/AscensionForm.tsx`, `GererColsVersants.tsx`, `ProfilVersantForm.tsx`, `BoutonConfirmation.tsx`, `NavPrincipale.tsx`, `charts/ProfilVersant.tsx`
- `supabase/schema.sql` : tables + RLS — **à exécuter une fois dans Supabase → SQL Editor**
- `supabase/storage.sql` : bucket `traces` + policies — **à exécuter une fois, après schema.sql**
- `supabase/profil-km.sql` : colonne `versants.profil_km` — **à exécuter une fois**

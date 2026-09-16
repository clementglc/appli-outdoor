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
- **Inspiration Been (app de pays visités), 2026-09-16** : sur demande explicite, priorité donnée à la refonte visuelle "collection" (grille de cartes colorées quand gravi / grisées sinon, anneau de progression façon %, filtre par département) plutôt qu'à une carte interactive des Pyrénées — celle-ci nécessiterait des coordonnées GPS par col (absentes du schéma actuel) et une librairie de carte (Leaflet envisagé, gratuit, pas de clé API) ; reportée, à reprendre si demandé.

## Schéma Supabase (à créer via `supabase/schema.sql` puis `supabase/storage.sql`, dans le SQL Editor du projet Supabase)

- `cols` : id, nom, altitude_m (nullable), departement (texte libre, nullable), created_at — **données de référence partagées**, pas de user_id (RLS : lecture/écriture pour tout utilisateur authentifié, pas de notion d'admin séparée tant que l'app reste mono-utilisateur)
- `versants` : id, col_id, nom, ville_depart, altitude_depart_m, distance_km, denivele_m, pente_moyenne (%), pente_max (%), profil_km (jsonb nullable, tableau de pentes moyennes par km — voir `supabase/profil-km.sql`), created_at — même politique RLS que `cols`
- `ascensions` : id, user_id, versant_id, date_ascension, commentaire (nullable), trace_path (nullable, chemin dans le bucket Storage "traces"), trace_nom_original (nullable), created_at — **RLS stricte par user_id** (données personnelles)
- Bucket Storage `traces` (privé) : traces GPX/FIT jointes à une ascension, chemin `<user_id>/<uuid>.<ext>` — policies RLS sur `storage.objects` scopées par premier segment de chemin = `auth.uid()`

## Fonctionnalités livrées

**Auth** (`/login`) : inscription/connexion email+mdp + "Mot de passe oublié ?" — copié tel quel du pattern Finance WebApp (`forgotPassword`/`updatePassword`, page `/reset-password`, route `/auth/confirm`). **Pas encore de SMTP personnalisé configuré** — utilise l'envoi email par défaut de Supabase (limité en volume mais suffisant pour un usage perso/test ; à passer sur Gmail SMTP comme Finance WebApp si le volume ou la personnalisation des templates devient un problème).

**Checklist** (`/checklist`) : vue principale, lecture seule, style "collection" (inspiré de Been). En tête, anneau de progression SVG (`ProgressionRing.tsx`) avec le % de cols gravis + "X/Y cols" + "X/Y versants". En dessous, `ChecklistGrille.tsx` (client) : chips de filtre par département (+ "Tous"), puis grille responsive de `ColCard.tsx` — icône montagne et texte en couleur (orange) pour un col gravi, grisés sinon, badge ✓ vert si gravi ; chaque carte liste ses versants (puce verte/grise, stats distance/dénivelé/pente, date de dernière ascension) avec lien vers la page détail. Cols non gravis triés en premier au sein de chaque filtre.

**Détail d'un versant** (`/checklist/[versantId]`) : stats complètes (distance, D+, pente moyenne/max, altitude départ/sommet), profil altimétrique en silhouette continue (`ProfilVersant.tsx`, SVG maison — un trapèze par km dont le sommet va de l'altitude cumulée précédente à la suivante, pour un enchaînement sans cassure entre les km ; couleur = sévérité de la pente, altitude au-dessus de chaque point, % à l'intérieur, légende des tranches), historique des ascensions personnelles de ce versant. **Pas de modification du profil depuis l'app** (retiré le 2026-09-16 sur demande explicite) — `cols`/`versants` sont des données de référence partagées entre tous les comptes, pas question qu'un utilisateur quelconque les modifie à sa guise depuis l'UI ; toute correction passe par un script ponctuel ou le SQL Editor (cf. section Audit ci-dessus), jamais par une action serveur exposée dans l'app.

**Mes ascensions** (`/ascensions`) : vue d'écriture.
- Formulaire "Enregistrer une ascension" (`AscensionForm.tsx`) : sélection Col → Versant (liste dépendante, cascading select côté client), date, commentaire facultatif, upload facultatif d'une trace GPX/FIT (stockée dans le bucket `traces`, jamais public — URL signée générée à la demande, expire après 1h).
- "+ Ajouter un col ou un versant" (`GererColsVersants.tsx`, repliable) : deux petits formulaires pour enrichir la liste de référence au fil de l'eau.
- Liste des ascensions déjà enregistrées (col, versant, date, commentaire, lien de téléchargement de la trace si présente) avec suppression (confirmation, supprime aussi le fichier du Storage).

## Scripts ponctuels (dossier `scripts/`, Node ESM, lisent `.env.local` via `--env-file`, demandent email+mdp dans le terminal — jamais stockés)

- `seed-cols.mjs` : insère un premier jeu d'une vingtaine de cols pyrénéens connus (grands cols du Tour de France + quelques classiques régionales) avec leurs versants principaux. Statistiques (distance/dénivelé/pente) approximatives pour les cols les plus documentés, laissées vides pour les autres — **liste volontairement non exhaustive au démarrage**, à corriger/compléter depuis l'app.
- `appliquer-profils-km.mjs` (2026-09-16) : renseigne `profil_km` pour 20 versants sur 30 — 18 depuis cyclingcols.com (première recherche), 2 depuis cols-cyclisme.com (Port de Lers, Col de Jau — recherche complémentaire pour les cas manquants/exclus de la première passe). ⚠️ **Fiabilité variable** : aucun des deux sites ne publie de tableau chiffré exploitable directement pour la plupart des versants — cyclingcols n'a que des graphiques image (valeurs estimées par lecture visuelle + interpolation) ; cols-cyclisme a un vrai SVG texte pour Port de Lers (extraction programmatique, plus fiable) mais une image pour Col de Jau (même limite que cyclingcols, et sans stats de référence pour vérifier la correspondance — confiance la plus faible du lot). Pour les cols avec stats connues à l'avance, la moyenne recalculée colle à la moyenne officielle à quelques % près (bon signal), mais chaque valeur km par km individuelle reste une estimation, pas une donnée "officielle" exacte. 2 versants aux stats trop éloignées de la base existante ont été délibérément exclus (Marie-Blanque Ouest, Port de Lers Est version cyclingcols — remplacé par la version cols-cyclisme, meilleure) ; **7 versants restent introuvables sur les deux sites** (Peyresourde Ouest, Balès Ouest, Menté Sud, Portet-d'Aspet Est, Marie-Blanque Est, Somport Nord — voir commentaires dans le script pour le détail de chaque tentative). Le Col de Jau a aussi récupéré ses stats de base (distance/D+/pente moyenne, jusque-là vides) depuis cols-cyclisme.com. Reste à lancer par l'utilisateur (`node --env-file=.env.local scripts/appliquer-profils-km.mjs`), jamais exécuté par Claude (demande les identifiants).

## Audit des stats (2026-09-16)

Suite à la découverte d'une inversion Est/Ouest sur Marie-Blanque (stats saisies de mémoire au départ), audit complet des 18 cols / 27 versants contre cyclingcols.com (priorité) et cols-cyclisme.com (recours) — voir `supabase/corrections-versants.sql` (18 corrections, commentées : source, ancien/nouveau, confiance). Résultat : 17 versants confirmés/corrigés avec confiance haute (surtout des `pente_max` manquantes ou sous-estimées), 4 corrigés avec confiance seulement moyenne car aucune source ne mesure exactement le point de départ voulu (Peyresourde Ouest via Avajan, Portet-d'Aspet Ouest via Pont de l'Oule, Puymorens, Somport via Accous — proxys au village le plus proche sur la même route), **3 versants restent non vérifiables** et gardent leurs valeurs d'origine, non confirmées (Port de Balès Ouest, Col de Menté Sud, Col de Portet-d'Aspet Est — pour ce dernier, une page "Aspet" existe mais décrit une montée totalement différente, probablement pas le même tracé que le "mur" connu du Tour de France, donc rejetée plutôt que forcée). Profils km/km ajoutés pour Marie-Blanque Est et Ouest (mêmes limites de fiabilité que les autres profils cyclingcols — image, pas tableau chiffré).

## Non fait / en attente

- **Déploiement Vercel** : pas encore fait (contrairement à Finance WebApp). À faire quand l'app sera jugée assez aboutie pour un usage réel depuis le téléphone.
- **PWA** (manifest, service worker, icônes) : pas encore mise en place — à reprendre du pattern Finance WebApp si besoin d'installation sur écran d'accueil.
- **Intégration Strava** : reportée sciemment (voir "Décisions prises au lancement"). Faisable via OAuth self-service Strava le moment venu.
- **Intégration Garmin** : abandonnée (validation manuelle Garmin, non adaptée à un projet perso).
- **Édition d'un col/versant existant** : aucune, volontairement — voir la note sur `cols`/`versants` en données de référence partagées ci-dessus (section "Détail d'un versant"). Toute correction passe par un script ponctuel ou le SQL Editor.
- **Profils km par km manquants ou douteux** : 7 versants sans profil du tout + 2 volontairement exclus (voir `appliquer-profils-km.mjs` ci-dessus) — à corriger manuellement depuis la page détail si besoin, ou à retenter avec une autre approche de recherche.
- **SMTP personnalisé** : pas encore configuré, cf. section Auth ci-dessus.

## Fichiers clés

- `src/lib/cols.ts` : logique de statut (col/versant gravi ou non) + calcul de progression
- `src/lib/types.ts`, `src/lib/format.ts`, `src/lib/constants.ts`
- `src/app/(app)/checklist/{page.tsx,[versantId]/{page.tsx,actions.ts}}`, `src/app/(app)/ascensions/{page.tsx,actions.ts}`
- `src/components/AscensionForm.tsx`, `GererColsVersants.tsx`, `BoutonConfirmation.tsx`, `NavPrincipale.tsx`, `ProgressionRing.tsx`, `ChecklistGrille.tsx`, `ColCard.tsx`, `charts/ProfilVersant.tsx`
- `supabase/schema.sql` : tables + RLS — **à exécuter une fois dans Supabase → SQL Editor**
- `supabase/storage.sql` : bucket `traces` + policies — **à exécuter une fois, après schema.sql**
- `supabase/profil-km.sql` : colonne `versants.profil_km` — **à exécuter une fois**

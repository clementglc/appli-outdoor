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
- **Upload de trace GPX/FIT abandonné au profit d'un simple lien d'activité (2026-09-16)** : le fichier une fois uploadé n'était pas visualisable dans l'app (pas de viewer GPX maison) — inutile en l'état. Remplacé par un champ texte `lien_activite` (URL vers Strava, Garmin Connect...) : moins de friction, et le viewer de la plateforme d'origine (carte, profil d'élévation) fait bien mieux qu'un visualiseur maison. Voir `supabase/lien-activite.sql` (ajoute `lien_activite`, supprime `trace_path`/`trace_nom_original`) — le bucket Storage `traces` n'est plus utilisé (laissé en place, supprimable manuellement).
- **Liste de cols de référence construite manuellement**, enrichie au fil de l'eau plutôt que scrapée — voir `scripts/seed-cols.mjs`.
- Un col est considéré **"gravi" dès qu'au moins un de ses versants l'a été** (convention usuelle) — le détail par versant reste affiché pour qui vise aussi tous les versants. Logique dans `src/lib/cols.ts` (`colsAvecStatut`).
- **Inspiration Been (app de pays visités), 2026-09-16** : sur demande explicite, priorité donnée à la refonte visuelle "collection" (grille de cartes colorées quand gravi / grisées sinon, anneau de progression façon %, filtre par département) plutôt qu'à une carte interactive des Pyrénées — celle-ci nécessiterait des coordonnées GPS par col (absentes du schéma actuel) et une librairie de carte (Leaflet envisagé, gratuit, pas de clé API) ; reportée, à reprendre si demandé.

## Schéma Supabase (à créer via `supabase/schema.sql` puis `supabase/storage.sql`, dans le SQL Editor du projet Supabase)

- `cols` : id, nom, altitude_m (nullable), departement (texte libre, nullable), created_at — **données de référence partagées**, pas de user_id (RLS : lecture/écriture pour tout utilisateur authentifié, pas de notion d'admin séparée tant que l'app reste mono-utilisateur)
- `versants` : id, col_id, nom, ville_depart, altitude_depart_m, distance_km, denivele_m, pente_moyenne (%), pente_max (%), profil_km (jsonb nullable, tableau de pentes moyennes par km — voir `supabase/profil-km.sql`), created_at — même politique RLS que `cols`
- `ascensions` : id, user_id, versant_id, date_ascension, commentaire (nullable), lien_activite (nullable, URL vers Strava/Garmin Connect/etc.), created_at — **RLS stricte par user_id** (données personnelles)
- Bucket Storage `traces` (privé, créé par `supabase/storage.sql`) : **plus utilisé depuis le 2026-09-16** (upload de trace GPX remplacé par un lien d'activité, voir "Décisions" ci-dessus) — laissé en place, supprimable manuellement depuis Supabase → Storage si besoin.

## Fonctionnalités livrées

**Auth** (`/login`) : inscription/connexion email+mdp + "Mot de passe oublié ?" — copié tel quel du pattern Finance WebApp (`forgotPassword`/`updatePassword`, page `/reset-password`, route `/auth/confirm`). **Pas encore de SMTP personnalisé configuré** — utilise l'envoi email par défaut de Supabase (limité en volume mais suffisant pour un usage perso/test ; à passer sur Gmail SMTP comme Finance WebApp si le volume ou la personnalisation des templates devient un problème).

**Checklist** (`/checklist`) : vue principale, lecture seule, style "collection" (inspiré de Been). En tête, anneau de progression SVG (`ProgressionRing.tsx`) avec le % de cols gravis + "X/Y cols" + "X/Y versants". En dessous, `ChecklistGrille.tsx` (client) : chips de filtre par département (+ "Tous"), puis grille responsive de `ColCard.tsx` — icône montagne et texte en couleur (orange) pour un col gravi, grisés sinon, badge ✓ vert si gravi ; chaque carte liste ses versants (puce verte/grise, stats distance/dénivelé/pente, date de dernière ascension) avec lien vers la page détail. Cols non gravis triés en premier au sein de chaque filtre.

**Détail d'un versant** (`/checklist/[versantId]`) : stats complètes (distance, D+, pente moyenne/max, altitude départ/sommet), profil altimétrique en silhouette continue (`ProfilVersant.tsx`, SVG maison — un trapèze par km dont le sommet va de l'altitude cumulée précédente à la suivante, pour un enchaînement sans cassure entre les km ; couleur = sévérité de la pente, altitude au-dessus de chaque point, % à l'intérieur, légende des tranches), historique des ascensions personnelles de ce versant (date, durée si renseignée, commentaire, lien "Voir l'activité ↗" cliquable si présent). **Pas de modification du profil depuis l'app** (retiré le 2026-09-16 sur demande explicite) — `cols`/`versants` sont des données de référence partagées entre tous les comptes, pas question qu'un utilisateur quelconque les modifie à sa guise depuis l'UI ; toute correction passe par un script ponctuel ou le SQL Editor (cf. section Audit ci-dessus), jamais par une action serveur exposée dans l'app.

**Mes ascensions** (`/ascensions`) : vue d'écriture.
- Formulaire "Enregistrer une ascension" (`AscensionForm.tsx`) : sélection Col → Versant (liste dépendante, cascading select côté client), date, commentaire facultatif, durée facultative en minutes, lien facultatif vers l'activité (Strava, Garmin Connect...) — validé côté serveur (doit commencer par `http://`/`https://`). **Pas de déduction automatique de la durée depuis le lien** : Strava a souvent plusieurs segments communautaires qui se chevauchent pour un même col (constaté sur Marie-Blanque via le connecteur Strava MCP de cette session : au moins 6 segments différents nommés "Marie Blanque"/variantes, avec des bornes de départ/arrivée légèrement différentes et des temps allant de ~39 à ~42 min) — saisie manuelle après avoir regardé son activité, plus fiable qu'un matching automatique fragile.
- "+ Ajouter un col ou un versant" (`GererColsVersants.tsx`, repliable) : deux petits formulaires pour enrichir la liste de référence au fil de l'eau.
- Liste des ascensions déjà enregistrées (col, versant, date, commentaire, lien "Voir l'activité ↗" si présent) avec suppression (confirmation).

## Scripts ponctuels (dossier `scripts/`, Node ESM, lisent `.env.local` via `--env-file`, demandent email+mdp dans le terminal — jamais stockés)

- `seed-cols.mjs` : insère un premier jeu d'une vingtaine de cols pyrénéens connus (grands cols du Tour de France + quelques classiques régionales) avec leurs versants principaux. Statistiques (distance/dénivelé/pente) approximatives pour les cols les plus documentés, laissées vides pour les autres — **liste volontairement non exhaustive au démarrage**, à corriger/compléter depuis l'app.
- `appliquer-profils-km.mjs` (2026-09-16) : renseigne `profil_km` pour 20 versants sur 30 — 18 depuis cyclingcols.com (première recherche), 2 depuis cols-cyclisme.com (Port de Lers, Col de Jau — recherche complémentaire pour les cas manquants/exclus de la première passe). ⚠️ **Fiabilité variable** : aucun des deux sites ne publie de tableau chiffré exploitable directement pour la plupart des versants — cyclingcols n'a que des graphiques image (valeurs estimées par lecture visuelle + interpolation) ; cols-cyclisme a un vrai SVG texte pour Port de Lers (extraction programmatique, plus fiable) mais une image pour Col de Jau (même limite que cyclingcols, et sans stats de référence pour vérifier la correspondance — confiance la plus faible du lot). Pour les cols avec stats connues à l'avance, la moyenne recalculée colle à la moyenne officielle à quelques % près (bon signal), mais chaque valeur km par km individuelle reste une estimation, pas une donnée "officielle" exacte. 2 versants aux stats trop éloignées de la base existante ont été délibérément exclus (Marie-Blanque Ouest, Port de Lers Est version cyclingcols — remplacé par la version cols-cyclisme, meilleure) ; **7 versants restent introuvables sur les deux sites** (Peyresourde Ouest, Balès Ouest, Menté Sud, Portet-d'Aspet Est, Marie-Blanque Est, Somport Nord — voir commentaires dans le script pour le détail de chaque tentative). Le Col de Jau a aussi récupéré ses stats de base (distance/D+/pente moyenne, jusque-là vides) depuis cols-cyclisme.com. Reste à lancer par l'utilisateur (`node --env-file=.env.local scripts/appliquer-profils-km.mjs`), jamais exécuté par Claude (demande les identifiants).

## Audit des stats (2026-09-16)

Suite à la découverte d'une inversion Est/Ouest sur Marie-Blanque (stats saisies de mémoire au départ), audit complet des 18 cols / 27 versants contre cyclingcols.com (priorité) et cols-cyclisme.com (recours) — voir `supabase/corrections-versants.sql` (18 corrections, commentées : source, ancien/nouveau, confiance). Résultat : 17 versants confirmés/corrigés avec confiance haute (surtout des `pente_max` manquantes ou sous-estimées), 4 corrigés avec confiance seulement moyenne car aucune source ne mesure exactement le point de départ voulu (Peyresourde Ouest via Avajan, Portet-d'Aspet Ouest via Pont de l'Oule, Puymorens, Somport via Accous — proxys au village le plus proche sur la même route), **3 versants restent non vérifiables** et gardent leurs valeurs d'origine, non confirmées (Port de Balès Ouest, Col de Menté Sud, Col de Portet-d'Aspet Est). Profils km/km ajoutés pour Marie-Blanque Est et Ouest (mêmes limites de fiabilité que les autres profils cyclingcols — image, pas tableau chiffré).

**Triangulation avec une 3e source, mycols.app (2026-09-16)** : voir `supabase/corrections-mycols.sql`. Une seule vraie correction de valeurs : **Col de Portet-d'Aspet Est**, jusque-là non vérifiable et bien trop doux en base (7.6%) — MyCols a une fiche cohérente en interne pour un tracé "La Henne-Morte" (9.6% moyen / 11.7% max sur 4.5 km, `altitude_depart_m` mis à jour à 636 m en cohérence), bien plus crédible pour le "mur" du Tour de France où Fabio Casartelli est mort en 1995. Confiance renforcée (sans changement de valeurs) sur Peyresourde Ouest et Puymorens Nord, déjà corrigés via cyclingcols/cols-cyclisme et maintenant recoupés indépendamment par MyCols. **Piège relevé** : ne pas faire confiance aveuglément à MyCols non plus — la fiche Marie-Blanque Est fournie par l'utilisateur (11 km / 598 m / 6.6 %) est incohérente en interne (11 × 6.6 % ≈ 726 m, pas 598 m), donc écartée ; cyclingcols reste la source retenue pour ce versant. Aucune fiche MyCols consultée n'a de profil km/km exploitable (image uniquement, comme les 2 autres sites). Restent non vérifiables sur les 3 sources croisées : Port de Balès Ouest, Col de Menté Sud, Col de Portet-d'Aspet Ouest, Col du Somport, Col de Jau, Val Louron-Azet Ouest (ce dernier absent de mycols.app).

## Non fait / en attente

- **Déploiement Vercel** : pas encore fait (contrairement à Finance WebApp). À faire quand l'app sera jugée assez aboutie pour un usage réel depuis le téléphone.
- **PWA** (manifest, service worker, icônes) : pas encore mise en place — à reprendre du pattern Finance WebApp si besoin d'installation sur écran d'accueil.
- **Intégration Strava** : reportée sciemment (voir "Décisions prises au lancement"). Faisable via OAuth self-service Strava le moment venu.
- **Intégration Garmin** : abandonnée (validation manuelle Garmin, non adaptée à un projet perso).
- **Édition d'un col/versant existant** : aucune, volontairement — voir la note sur `cols`/`versants` en données de référence partagées ci-dessus (section "Détail d'un versant"). Toute correction passe par un script ponctuel ou le SQL Editor.
- **Profils km par km manquants ou douteux** : 7 versants sans profil du tout + 2 volontairement exclus (voir `appliquer-profils-km.mjs` ci-dessus) — pas d'édition possible depuis l'app (voir "Détail d'un versant" ci-dessus), à corriger via script ponctuel ou SQL Editor, ou à retenter avec une autre approche de recherche.
- **SMTP personnalisé** : pas encore configuré, cf. section Auth ci-dessus.

## Pièges connus

- **"Failed to fetch" en soumettant le formulaire d'ascension avec une trace GPX** (rencontré le 2026-09-16) : fausse piste initiale (cache Turbopack désynchronisé après plusieurs allers-retours sur une route de test) — la vraie cause était la limite par défaut de 1 Mo sur le corps d'une Server Action Next.js, trop petite pour une vraie trace GPS. Corrigé dans `next.config.ts` (`experimental.serverActions.bodySizeLimit: "15mb"`). ⚠️ Un changement de `next.config.ts` n'est jamais pris en compte à chaud — il faut redémarrer le serveur de dev (Ctrl+C puis `npm.cmd run dev -- -p 3010`) après toute modification de ce fichier.

## Fichiers clés

- `src/lib/cols.ts` : logique de statut (col/versant gravi ou non) + calcul de progression
- `src/lib/types.ts`, `src/lib/format.ts`, `src/lib/constants.ts`
- `src/app/(app)/checklist/{page.tsx,[versantId]/page.tsx}`, `src/app/(app)/ascensions/{page.tsx,actions.ts}`
- `src/components/AscensionForm.tsx`, `GererColsVersants.tsx`, `BoutonConfirmation.tsx`, `NavPrincipale.tsx`, `ProgressionRing.tsx`, `ChecklistGrille.tsx`, `ColCard.tsx`, `charts/ProfilVersant.tsx`
- `supabase/schema.sql` : tables + RLS — **à exécuter une fois dans Supabase → SQL Editor**
- `supabase/storage.sql` : bucket `traces` + policies — **à exécuter une fois, après schema.sql**
- `supabase/profil-km.sql` : colonne `versants.profil_km` — **à exécuter une fois**
- `supabase/lien-activite.sql` : `ascensions.lien_activite` (remplace `trace_path`/`trace_nom_original`) — **à exécuter une fois**
- `supabase/duree-ascension.sql` : `ascensions.duree_minutes` — **à exécuter une fois**

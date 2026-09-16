-- Croisement des 27 versants (18 cols) avec une 3e source, mycols.app
-- ("MyCols"), le 2026-09-16, en complément de l'audit cyclingcols.com /
-- cols-cyclisme.com déjà fait (voir supabase/corrections-versants.sql).
--
-- Méthode : URL mycols.app/en/climb/<col>-<ville> (ou recherche web
-- "site:mycols.app <col>" quand le pattern direct échoue), puis vérification
-- de la cohérence interne de chaque fiche (distance x pente% ~= dénivelé,
-- et sommet - départ ~= dénivelé) avant d'envisager une correction. Constat
-- récurrent : MyCols sous-estime quasi systématiquement la pente_max par
-- rapport à cyclingcols (souvent -15 à -30%), probablement une résolution
-- de mesure différente (lissage sur des segments plus longs) — ce n'est
-- donc PAS utilisé seul comme motif de correction de pente_max quand une
-- valeur cyclingcols déjà "confiance haute" existe. Aucune fiche MyCols
-- consultée n'expose de détail kilomètre par kilomètre exploitable (texte/
-- tableau) : uniquement un graphique de profil, comme cyclingcols.
--
-- Seuil retenu, identique à l'audit précédent : écart < 10% = confirmé,
-- pas de correction. Ne contient que les UPDATE pour les champs qui
-- changent réellement — tout le reste (confirmé, introuvable, incohérent)
-- documenté en commentaire, sans toucher aux valeurs déjà en base.

-- =====================================================================
-- 1. Col du Tourmalet
-- =====================================================================

-- Versant Est (Sainte-Marie-de-Campan) : CONFIRMÉ.
-- Source : mycols.app/en/climb/col-du-tourmalet-campan — 16.9 km / 1242 m /
-- 7.4% / 9.5% (interne cohérent : 16.9 x 7.4% ~= 1251 m). vs base 17.1 km /
-- 1267 m / 7.4% / 11.0% — écarts <2% sauf pente_max (-14%, cf. remarque
-- générale ci-dessus). Aucun changement.

-- Versant Ouest (Luz-Saint-Sauveur / Barèges) : CONFIRMÉ.
-- Source : mycols.app/en/climb/col-du-tourmalet-luz-saint-sauveur — 18.8 km
-- / 1357 m / 7.2% / 9.6% (interne cohérent). vs base 19 km / 1404 m / 7.4%
-- / 12.0% — écarts <4% sauf pente_max (-20%). Aucun changement.


-- =====================================================================
-- 2. Col d'Aubisque
-- =====================================================================

-- Versant Est (Laruns / Eaux-Bonnes) : CONFIRMÉ.
-- Source : mycols.app/en/climb/col-daubisque-laruns — 16.4 km / 1164 m /
-- 6.9% / 8.8% (interne cohérent : sommet 1712 m - départ 548 m = 1164 m).
-- vs base 16.6 km / 1190 m / 7.1% / 13.0% — écarts <3% sauf pente_max
-- (-32%). Aucun changement.

-- Versant Ouest (via Col du Soulor) : MyCols INTROUVABLE pour ce parcours
-- précis. MyCols n'a que le Soulor seul depuis Argelès-Gazost (18.9 km,
-- voir point 3 ci-dessous) et des montées partielles depuis Arbéost/
-- Arrens-Marsous (déjà en altitude, ne partent pas d'Argelès-Gazost) ;
-- aucune fiche ne couvre l'enchaînement complet Argelès-Gazost -> Soulor
-- -> Aubisque (~30 km) que représente ce versant. Aucun changement.


-- =====================================================================
-- 3. Col du Soulor
-- =====================================================================

-- Versant Est (Argelès-Gazost) : CONFIRMÉ.
-- Source : mycols.app/en/climb/col-du-soulor-argeles-gazost — 18.9 km /
-- 970 m / 5.4% / 8.9% (interne : 18.9 x 5.4% ~= 1021 m, écart 5% avec le
-- dénivelé annoncé, dans la marge). vs base 20 km / 1000 m / 5% / 10.0% —
-- tous les écarts <11%. Aucun changement.


-- =====================================================================
-- 4. Col de Peyresourde
-- =====================================================================

-- Versant Est (Bagnères-de-Luchon) : CONFIRMÉ.
-- Source : mycols.app/en/climb/col-de-peyresourde-bagneres-de-luchon —
-- 14.3 km / 891 m / 6.3% / 9.2% (interne cohérent). vs base 15.3 km / 939 m
-- / 6.1% / 12.0% — écarts <7% sauf pente_max (-23%). Aucun changement.

-- Versant Ouest (Arreau, proxy Avajan) : CONFIRMATION FORTE du proxy déjà
-- retenu (confiance "moyenne" dans l'audit précédent) — MyCols a une fiche
-- dédiée "Avajan" avec la distance EXACTEMENT identique à celle déjà en
-- base (9.5 km), ce qui recoupe indépendamment le choix cols-cyclisme.
-- Source : mycols.app/en/climb/col-de-peyresourde-avajan — 9.5 km / 641 m /
-- 6.8% / 8.5% (interne très cohérent : 927 m -> 1569 m = 642 m ~= 641 m).
-- vs base (9.5 km / 659 m / 6.94% / 11.0%) — distance identique, dénivelé
-- et % moyen à <3% d'écart, seul pente_max diverge (-23%, cf. remarque
-- générale). Pas de changement de valeurs (déjà très proches), mais la
-- confiance sur le choix "Avajan" comme meilleure approximation d'Arreau
-- passe de "moyenne" à "moyenne-haute" grâce à cette triangulation.


-- =====================================================================
-- 5. Col d'Aspin
-- =====================================================================

-- Versant Est (Arreau) : CONFIRMÉ.
-- Source : mycols.app/en/climb/col-daspin-arreau — 11.6 km / 749 m / 6.5%
-- / 8.8% (interne cohérent). vs base 12 km / 793 m / 6.6% / 9.5% — tous
-- les écarts <8%. (Note : une 2e fiche MyCols existe, "col-daspin-aspin-
-- aure", 10.7 km / 778 m / 7.3% / 10.3%, un hameau limitrophe d'Arreau sur
-- la même route — écarts un peu plus grands mais toujours <11%, cohérent
-- avec le même versant mesuré à un point de départ légèrement différent.)
-- Aucun changement.

-- Versant Ouest (Sainte-Marie-de-Campan) : CONFIRMÉ.
-- Source : mycols.app/en/climb/col-daspin-campan — 12.6 km / 641 m / 5.2%
-- / 8.5% (interne cohérent). vs base 12.8 km / 632 m / 4.9% / 10.0% —
-- écarts <7% sauf pente_max (-15%). Aucun changement.


-- =====================================================================
-- 6. Col du Portet
-- =====================================================================

-- Versant unique (Saint-Lary-Soulan) : CONFIRMÉ.
-- Source : mycols.app/en/climb/col-de-portet (Vignec, France — hameau du
-- versant Saint-Lary-Soulan) — 16.2 km / 1373 m / 8.5% / 10.3% (interne
-- cohérent). vs base 16 km / 1421 m / 8.7% / 12% — écarts <4% sauf
-- pente_max (-14%). Aucun changement.


-- =====================================================================
-- 7. Port de Balès
-- =====================================================================

-- Versant Est (Mayrègne) : CONFIRMÉ.
-- Source : mycols.app/en/climb/port-de-bales-mauleon-barousse — 19.4 km /
-- 1156 m / 6.1% / 11% (interne cohérent). vs base 19.6 km / 1215 m / 6.2%
-- / 13.0% — écarts <5% sauf pente_max (-15%). Aucun changement.

-- Versant Ouest (Bagnères-de-Luchon via Bourg-d'Oueil) : toujours NON
-- VÉRIFIABLE (point B, priorité). MyCols ne propose, côté Luchon, que la
-- montée longue standard "port-de-bales-bagneres-de-luchon" (18.8 km /
-- 1068 m / 5.7% / 10%) — comme les deux autres sites déjà consultés, elle
-- ne mesure pas la variante courte via Bourg-d'Oueil (12.1 km / 1120 m /
-- 8.3% en base). Aucun changement.


-- =====================================================================
-- 8. Col de Menté
-- =====================================================================

-- Versant Nord (Saint-Béat) : CONFIRMÉ.
-- Source : mycols.app/en/climb/col-de-mente-saint-beat — 9.3 km / 828 m /
-- 8.9% / 9.9% (interne cohérent : 521 m -> 1349 m = 828 m). vs base 9.7 km
-- / 844 m / 8.7% / 11.0% — tous les écarts <=10%. Aucun changement.

-- Versant Sud (Le Mourtis) : toujours NON VÉRIFIABLE (point B, priorité).
-- MyCols a bien une fiche "Le Mourtis" (mycols.app/en/climb/le-mourtis-
-- boutx), mais c'est une montée courte et distincte (1.6 km / 107 m / 6.7%
-- / 9.4%) qui NE rejoint PAS le Col de Menté — la fiche elle-même indique
-- que le Col de Menté est "a nearby climb ~900m away" mais un sommet
-- différent. Ne confirme ni n'infirme donc notre versant (route vers le
-- Col de Menté en passant par Le Mourtis). Aucun changement.


-- =====================================================================
-- 9. Col de Portet-d'Aspet
-- =====================================================================

-- Versant Est (Aspet) : NON VÉRIFIABLE -> CORRIGÉ (point B, priorité).
-- Source : mycols.app/en/climb/col-de-portet-daspet-la-henne-morte — La
-- Henne-Morte est le hameau situé juste avant le sommet sur le versant Est
-- (D618 depuis Aspet, cf. tourdes100cols.over-blog.com "Col du Portet
-- d'Aspet depuis Henne-Morte") ; la page ne mentionne pas "Aspet" comme
-- ville de référence (d'où confiance "moyenne" et pas "haute"), mais :
--   - distance EXACTEMENT identique à la valeur déjà en base (4.5 km) ;
--   - fiche interne très cohérente (4.5 km x 9.6% ~= 432 m ~= 433 m
--     annoncé ; départ 636 m -> sommet 1069 m = 433 m, cohérent) ;
--   - l'altitude sommet (1069 m) correspond exactement à celle déjà
--     enregistrée pour ce col dans notre base (cols.altitude_m = 1069) ;
--   - le profil (9.6% moyen / 11.7% max sur seulement 4.5 km) correspond
--     nettement mieux à la réputation du "mur" bien connu du Tour de
--     France (où Fabio Casartelli est décédé en 1995) que l'ancienne
--     valeur en base (7.6% moyen, trop douce pour ce col) — et surtout
--     mieux que la fiche "Aspet" à 14.3 km / 4.15% déjà rejetée dans
--     l'audit précédent (route manifestement différente, beaucoup plus
--     longue et plus plate).
-- altitude_depart_m mis à jour en cohérence (636 m, pour que
-- sommet - départ = dénivelé dans notre propre base). Confiance : moyenne
-- (nom de ville différent d'"Aspet", mais tout le reste concorde bien).
update versants set
  denivele_m = 433,
  pente_moyenne = 9.6,
  pente_max = 11.7,
  altitude_depart_m = 636
where nom = 'Versant Est (Aspet)'
  and col_id = (select id from cols where nom = 'Col de Portet-d''Aspet');

-- Versant Ouest (Les-Bordes-sur-Lez) : MyCols INTROUVABLE. Aucune fiche
-- mycols.app ne correspond ("Col de la Core • Les Bordes-sur-Lez" trouvé
-- par recherche est un col totalement différent). Le proxy Pont de l'Oule
-- (confiance moyenne, cyclingcols) reste la meilleure source disponible.
-- Aucun changement.


-- =====================================================================
-- 10. Col de Val Louron-Azet
-- =====================================================================

-- Versant Est (Loudenvielle, via Génos) : CONFIRMÉ.
-- Source : mycols.app/en/climb/col-dval-louron-azet — 7.1 km / 592 m /
-- 8.3% / 10.1% (interne cohérent : 988 m -> 1580 m = 592 m). vs base
-- 7.4 km / 654 m / 8.3% / 10.7% — écarts <10% (dénivelé à 9.5%, tout juste
-- sous le seuil). Aucun changement.

-- Versant Ouest (Saint-Lary-Soulan) : MyCols INTROUVABLE. Aucune fiche
-- distincte pour le côté Saint-Lary-Soulan trouvée (seul le côté Génos/
-- Loudenvielle existe dans la base MyCols). Aucun changement.


-- =====================================================================
-- 11. Col de Marie-Blanque
-- =====================================================================

-- Versant Est (Bielle) : MyCols INCOHÉRENT EN INTERNE, non utilisé.
-- Source (fournie par l'utilisateur) : mycols.app/fr/col/col-de-marie-
-- blanque-bielle — 11 km / 598 m / 6.6% / 10.6%, départ 453 m, sommet
-- 1035 m. Incohérences internes multiples : 11 km x 6.6% ~= 726 m, pas
-- 598 m annoncé (écart 21%) ; et sommet - départ = 1035 - 453 = 582 m, pas
-- 598 m non plus (écart 3%, plus proche mais toujours pas exact) — les
-- trois nombres distance/pente/dénivelé ne se recoupent pas entre eux.
-- vs base 11.3 km / 597 m / 5.2% / 11.0% (déjà confirmée exactement par
-- cyclingcols dans l'audit précédent) : le dénivelé MyCols (598 m) est
-- quasi identique au nôtre (597 m, +0.2%), mais la pente moyenne MyCols
-- (6.6%) diverge fortement de la nôtre (5.2%, +27%) et n'est pas fiable
-- vu l'incohérence interne ci-dessus. Aucun changement — cyclingcols reste
-- la source la plus fiable pour ce versant.

-- Versant Ouest (Escot / Bares) : CONFIRMÉ.
-- Source : mycols.app/fr/col/col-de-marie-blanque-escot — 8.7 km / 697 m /
-- 8.3% / 14.2%, départ 337 m, sommet 1035 m (interne cohérent : 337 -> 1035
-- = 698 m ~= 697 m annoncé). vs base 9.2 km / 707 m / 7.7% / 13.0% — tous
-- les écarts <10%. Aucun changement.


-- =====================================================================
-- 12. Col de Pailhères
-- =====================================================================

-- Versant Est (Ax-les-Thermes) : CONFIRMÉ avec réserve (dénivelé identique,
-- distance différente).
-- Source : mycols.app/en/climb/port-de-pailheres-ax-les-thermes — 18.5 km
-- / 1251 m / 6.8% / 9.7% (interne cohérent : 749 m -> 2001 m = 1252 m).
-- vs base 15.4 km / 1266 m / 8.2% / 14.0% (déjà corrigée via cyclingcols
-- "Usson-les-Bains", 15.3 km) : le dénivelé concorde presque exactement
-- (1251 m vs 1266 m, -1.2%) ce qui confirme le même sommet, mais distance
-- (-20%) et pente moyenne (-17%) divergent nettement — MyCols mesure
-- probablement depuis un point plus en amont dans Ax-les-Thermes même,
-- alors qu'Usson-les-Bains (hameau à la sortie de Ax) est plus proche du
-- pied de la vraie montée. Confiance haute existante (cyclingcols)
-- maintenue ; aucun changement.


-- =====================================================================
-- 13. Plateau de Beille
-- =====================================================================

-- Versant unique (les Cabannes) : CONFIRMÉ.
-- Source : mycols.app/en/climb/plateau-de-beille — 15.5 km / 1208 m / 7.7%
-- / 9.5% (interne cohérent : 572 -> 1780 m = 1208 m). vs base 15.9 km /
-- 1268 m / 7.9% / 11% — écarts <5% sauf pente_max (-14%). Aucun changement.


-- =====================================================================
-- 14. Col de Puymorens
-- =====================================================================

-- Versant Nord (Ax-les-Thermes) : CONFIRMÉ, confiance renforcée (point B).
-- Source : mycols.app/en/climb/col-de-puymorens-ax-les-thermes — 27.3 km /
-- 1188 m / 4.4% / 6.4% (interne cohérent : 727 -> 1917 m = 1190 m). vs base
-- 27.4 km / 1202 m / 4.4% / 9.4% (déjà corrigée via cyclingcols) : distance
-- et pente moyenne quasi identiques (écart <1.2%), dénivelé à 1.2% —
-- MyCols confirme indépendamment que ~27.4 km est bien la bonne mesure
-- depuis Ax-les-Thermes (et pas une route trop longue comme on le
-- craignait). Seul pente_max diverge (cf. remarque générale). Confiance
-- effectivement relevée de "moyenne" à "haute" grâce à cette 2e source
-- indépendante qui recoupe cyclingcols. Aucun changement de valeurs
-- (déjà très proches).


-- =====================================================================
-- 15. Col du Somport
-- =====================================================================

-- Versant Nord (Bedous) : MyCols INTROUVABLE (point B, priorité). Aucune
-- fiche mycols.app ne part de Bedous ni d'Accous — seules des fiches
-- "Urdos" (14.6 km, tout début de la montée côté frontière, un tout autre
-- tronçon) et côté espagnol (Candanchú/Canfranc) existent. Le proxy Accous
-- (confiance moyenne, cols-cyclisme) reste la meilleure source disponible.
-- Aucun changement.


-- =====================================================================
-- 16. Col d'Agnès
-- =====================================================================

-- Versant Est (Aulus-les-Bains) : CONFIRMÉ.
-- Source : mycols.app/en/climb/col-dagnes-aulus-les-bains — 10.1 km /
-- 812 m / 7.8% / 10.6% (interne cohérent : 743 -> 1555 m = 812 m). vs base
-- 10 km / 807 m / 8% / 13.0% — écarts <3% sauf pente_max (-18%). Aucun
-- changement.


-- =====================================================================
-- 17. Port de Lers
-- =====================================================================

-- Versant Est (Vicdessos) : CONFIRMÉ.
-- Source : mycols.app/en/climb/port-de-lers-vicdessos — 11.4 km / 769 m /
-- 6.7% / 9.7% (interne cohérent : 748 -> 1522 m = 774 m ~= 769 m annoncé).
-- vs base 11.6 km / 838 m / 7.2% / 10.9% — tous les écarts <=11%. Aucun
-- changement.


-- =====================================================================
-- 18. Col de Jau
-- =====================================================================

-- Versant unique (Mosset) : MyCols INTROUVABLE (point B, priorité). Les
-- seules fiches mycols.app pour ce col sont "Axat" (17.9 km, versant Sud/
-- Est opposé) et "Molitg-les-Bains" (21.8 km, plus long et sur une route
-- différente) — aucune ne correspond à Mosset. La source cols-cyclisme
-- (confiance moyenne, faute de source indépendante) reste la meilleure
-- disponible. Aucun changement.

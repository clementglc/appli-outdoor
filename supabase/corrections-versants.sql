-- Audit complet des 18 cols / 27 versants de la base, suite à la découverte
-- de l'inversion Est/Ouest sur le Col de Marie-Blanque (le 7.7% bien connu
-- appartient au versant Escot, pas Bielle). Vérification systématique de
-- chaque versant sur cyclingcols.com (priorité) puis cols-cyclisme.com
-- (recours), le 2026-09-16.
--
-- Seuil retenu : écart < 10% entre la base et le site = "confirmé", pas de
-- correction. Au-delà, on corrige avec la valeur du site (on lui fait
-- confiance plutôt qu'à des valeurs saisies de mémoire au départ), sauf
-- quand aucune des deux sources ne documente une route correspondant
-- clairement à notre versant (ville de départ trop différente / route trop
-- différente) : dans ce cas "non vérifiable", aucune ligne SQL ci-dessous.
--
-- Ne contient que des UPDATE pour les champs qui changent réellement —
-- les versants/champs déjà confirmés corrects ne sont pas touchés.

-- =====================================================================
-- 1. Col du Tourmalet
-- =====================================================================

-- Versant Est (Sainte-Marie-de-Campan / La Mongie) : CONFIRMÉ, aucun changement.
-- Source : cyclingcols.com/col/tourmalet — 17.1 km / 1267 m / 7.4% / 11.0%
-- vs base 17.1 km / 1268 m / 7.4% / 10.2% (écart max 7.3%, sous le seuil).

-- Versant Ouest (Luz-Saint-Sauveur / Barèges) : pente_max à corriger.
-- Source : cyclingcols.com/col/tourmalet — 18.9 km / 1404 m / 7.4% / 12.0%
-- vs base 19 km / 1404 m / 7.4% / 10.7% (distance/D+/moyenne confirmés,
-- écart max 10.8%). Confiance : haute.
update versants set pente_max = 12.0
where nom = 'Versant Ouest (Luz-Saint-Sauveur / Barèges)'
  and col_id = (select id from cols where nom = 'Col du Tourmalet');


-- =====================================================================
-- 2. Col d'Aubisque
-- =====================================================================

-- Versant Est (Laruns / Eaux-Bonnes) : pente_max à corriger.
-- Source : cyclingcols.com/col/aubisque, "West, from Laruns" — 17.1 km /
-- 1205 m / 7.0% / 13.0% vs base 16.6 km / 1190 m / 7.1% / 10% (distance/D+/
-- moyenne confirmés, écart max 30%). Confiance : haute.
update versants set pente_max = 13.0
where nom = 'Versant Est (Laruns / Eaux-Bonnes)'
  and col_id = (select id from cols where nom = 'Col d''Aubisque');

-- Versant Ouest (via Col du Soulor) : CONFIRMÉ, aucun changement.
-- Source : cyclingcols.com/col/aubisque, "East, from Argelès-Gazost" —
-- 29.9 km / 1434 m / 4.3% / 10.0% vs base 30 km / 1400 m / 4.7% / 10%
-- (écart max 8.5%, sous le seuil).


-- =====================================================================
-- 3. Col du Soulor
-- =====================================================================

-- Versant Est (Argelès-Gazost) : pente_max inconnue, renseignée.
-- Source : cyclingcols.com/col/soulor, "East, from Argelès-Gazost" —
-- 20.2 km / 1082 m / 5.2% / 10.0% vs base 20 km / 1000 m / 5% (distance/
-- moyenne confirmés, D+ à 8.2% d'écart, sous le seuil). Confiance : haute.
update versants set pente_max = 10.0
where nom = 'Versant Est (Argelès-Gazost)'
  and col_id = (select id from cols where nom = 'Col du Soulor');


-- =====================================================================
-- 4. Col de Peyresourde
-- =====================================================================

-- Versant Est (Bagnères-de-Luchon) : pente_max à corriger, reste confirmé.
-- Source : cyclingcols.com/col/peyresourde, "North-East, from Bagnères-de-
-- Luchon, via Portet-de-Luchon" — 15.1 km / 955 m / 6.3% / 12.0% vs base
-- 15.3 km / 939 m / 6.1% / 9.9% (distance/D+/moyenne confirmés, écart max
-- 21%). Confiance : haute.
update versants set pente_max = 12.0
where nom = 'Versant Est (Bagnères-de-Luchon)'
  and col_id = (select id from cols where nom = 'Col de Peyresourde');

-- Versant Ouest (Arreau) : réexaminé (point B). Ni cyclingcols.com ni
-- cols-cyclisme.com ne documentent de montée "depuis Arreau" à proprement
-- parler. cyclingcols ne propose que "West, from Arreau" à 18.3 km / 887 m /
-- 4.8% (route bien plus longue, rejetée : plus du double de la distance,
-- caractère de montée totalement différent). cols-cyclisme propose deux
-- montées voisines dans la même vallée (Louron), en amont d'Arreau :
-- "depuis Armenteule" (8.30 km / 629 m / 7.58% / 11.3%) et "depuis Avajan"
-- (9.50 km / 659 m / 6.94% / 11.0%). Avajan est la plus proche de la
-- distance de référence (9.7 km, écart 2%) ; retenue comme la meilleure
-- approximation disponible de la montée "depuis Arreau", même si D+ (-13%)
-- et % moyen (-11%) dépassent légèrement le seuil de confirmation.
-- Source : cols-cyclisme.com/pyrenees-centrales/france/col-de-peyresourde-depuis-avajan-c67.htm
-- Confiance : moyenne (aucune source ne mesure depuis Arreau même ;
-- Avajan est à ~2 km en amont sur la même route D618).
update versants set
  distance_km = 9.5,
  denivele_m = 659,
  pente_moyenne = 6.94,
  pente_max = 11.0
where nom = 'Versant Ouest (Arreau)'
  and col_id = (select id from cols where nom = 'Col de Peyresourde');


-- =====================================================================
-- 5. Col d'Aspin
-- =====================================================================

-- Versant Est (Arreau) : CONFIRMÉ, aucun changement.
-- Source : cyclingcols.com/col/aspin, "East, from Arreau" — 12.0 km /
-- 792 m / 6.6% / 10.0% vs base 12 km / 793 m / 6.6% / 9.5% (écart max
-- 5.3%, sous le seuil).

-- Versant Ouest (Sainte-Marie-de-Campan) : pente_max à corriger.
-- Source : cyclingcols.com/col/aspin, "West, from Sainte-Marie-de-Campan" —
-- 12.9 km / 649 m / 4.9% / 10.0% vs base 12.8 km / 632 m / 4.9% / 8%
-- (distance/D+/moyenne confirmés, écart max 25%). Confiance : haute.
update versants set pente_max = 10.0
where nom = 'Versant Ouest (Sainte-Marie-de-Campan)'
  and col_id = (select id from cols where nom = 'Col d''Aspin');


-- =====================================================================
-- 6. Col du Portet
-- =====================================================================

-- Versant unique (Saint-Lary-Soulan) : CONFIRMÉ, aucun changement.
-- Source : cyclingcols.com/col/portet — 17.0 km / 1419 m / 8.3% / 12.5%
-- vs base 16 km / 1421 m / 8.7% / 12% (tous les écarts sous le seuil).


-- =====================================================================
-- 7. Port de Balès
-- =====================================================================

-- Versant Est (Mayrègne) : pente_max à corriger.
-- Source : cyclingcols.com/col/bales, "North, from Mauléon-Barousse" —
-- 19.1 km / 1186 m / 6.2% / 13.0% vs base 19.6 km / 1215 m / 6.2% / 11%
-- (Mauléon-Barousse est un hameau juste avant Mayrègne sur la même route ;
-- distance/D+/moyenne confirmés, écart max 18%). Confiance : haute.
update versants set pente_max = 13.0
where nom = 'Versant Est (Mayrègne)'
  and col_id = (select id from cols where nom = 'Port de Balès');

-- Versant Ouest (Bagnères-de-Luchon via Bourg-d'Oueil) : NON VÉRIFIABLE
-- (point B). Les deux sites ne documentent, côté Luchon, que la montée
-- longue standard D618/D125 : cyclingcols "South, from Bagnères-de-Luchon -
-- D618/D125" (19.4 km / 1147 m / 5.8% / 13.3%) et cols-cyclisme "depuis
-- Bagneres de Luchon" (19.70 km / 1125 m / 5.71% / 11.2%, cols-cyclisme.com/
-- pyrenees-centrales/france/port-de-bales-depuis-bagneres-de-luchon-c575.htm)
-- — les deux se recoupent entre eux (~19.5 km) mais ni l'un ni l'autre ne
-- mesure la variante courte via Bourg-d'Oueil (12.1 km / 1120 m / 8.3% en
-- base). Aucune correction appliquée, aucune des deux sources ne permettant
-- de confirmer ni corriger ce versant précis.


-- =====================================================================
-- 8. Col de Menté
-- =====================================================================

-- Versant Nord (Saint-Béat) : D+, % moyen et % max à corriger.
-- Source : cyclingcols.com/col/mente, "West, from Saint-Béat" — 9.7 km /
-- 844 m / 8.7% / 11.0% vs base 9.4 km / 971 m / 9.3% (distance confirmée,
-- mais D+ base (971 m) incohérent avec sa propre distance/pente déclarées
-- (9.4 km x 9.3% ≈ 874 m, pas 971 m) alors que le site est cohérent en
-- interne (9.7 x 8.7% ≈ 844 m) — corrigé en bloc D+/% moyen/% max.
-- Confiance : haute.
update versants set
  denivele_m = 844,
  pente_moyenne = 8.7,
  pente_max = 11.0
where nom = 'Versant Nord (Saint-Béat)'
  and col_id = (select id from cols where nom = 'Col de Menté');

-- Versant Sud (Le Mourtis) : NON VÉRIFIABLE (point B). Ni cyclingcols.com
-- (qui ne propose que "West, from Saint-Béat" et "East, from Pont de
-- l'Oule" pour le Col de Menté) ni cols-cyclisme.com (mêmes deux versants
-- exacts : Saint Béat et Pont de l'Oule ; recherche "Mourtis" sans aucun
-- résultat) ne documentent de montée depuis Bagnères-de-Luchon / Le Mourtis
-- sous le nom "Col de Menté". Aucune correction appliquée.


-- =====================================================================
-- 9. Col de Portet-d'Aspet
-- =====================================================================

-- Versant Est (Aspet) : NON VÉRIFIABLE (point B), réexaminé avec l'œil
-- neuf de la leçon Marie-Blanque mais match écarté volontairement. La
-- seule page cols-cyclisme avec ville de départ "Aspet" existe bien
-- (cols-cyclisme.com/pyrenees-centrales/france/col-de-portet-d-aspet-depuis-aspet-c234.htm,
-- altitude sommet 1069 m identique) mais donne 14.30 km / 594 m / 4.15% /
-- 13.0% — plus de 3x la distance de référence (4.5 km) et un profil
-- totalement différent (montée longue et régulière vs "mur" court et
-- raide bien connu du Tour de France, où Fabio Casartelli est décédé en
-- 1995). Écart jugé trop important pour être une simple variation du point
-- de mesure ; correspondance rejetée plutôt que forcée. cyclingcols.com ne
-- propose aucune montée "from Aspet" (seulement "West, from Pont de
-- l'Oule" et "East, from D618/D4", aucune ne correspondant). Aucune
-- correction appliquée.

-- Versant Ouest (Les-Bordes-sur-Lez) : à corriger avec réserve.
-- Source : cyclingcols.com/col/portet-d-aspet, "West, from Pont de l'Oule"
-- — 9.7 km / 594 m / 5.6% / 15.0% vs base 8.3 km / 501 m / 6% (Pont de
-- l'Oule est un lieu-dit entre Les-Bordes-sur-Lez et le col, sur la même
-- route ; c'est la seule route Ouest disponible sur les deux sites — la
-- variante cols-cyclisme "depuis Audressein", 18.10 km / 557 m / 3.08%,
-- écartée car bien plus longue et bien moins pentue, correspondance encore
-- plus douteuse). Écarts distance/D+ ~17-18%, au-dessus du seuil, mais
-- meilleure option disponible. Confiance : moyenne.
update versants set
  distance_km = 9.7,
  denivele_m = 594,
  pente_moyenne = 5.6,
  pente_max = 15.0
where nom = 'Versant Ouest (Les-Bordes-sur-Lez)'
  and col_id = (select id from cols where nom = 'Col de Portet-d''Aspet');


-- =====================================================================
-- 10. Col de Val Louron-Azet
-- =====================================================================

-- Versant Est (Loudenvielle) : CONFIRMÉ, aucun changement.
-- Source : cyclingcols.com/col/azet, "East, from Génos" — 7.4 km / 616 m /
-- 8.3% / 11.8% vs base 7.4 km / 654 m / 8.3% / 10.7% (Génos est le village
-- voisin immédiat de Loudenvielle, même station Génos-Loudenvielle ; tous
-- les écarts sous ou au seuil, y compris le % max à 9.3%).

-- Versant Ouest (Saint-Lary-Soulan) : pente_max inconnue, renseignée.
-- Source : cyclingcols.com/col/azet, "West, from D929/D116" — 10.7 km /
-- 786 m / 7.3% / 11.5% vs base 10.7 km / 786 m / 7.4% (distance et D+
-- identiques, % moyen quasi identique). Confiance : haute.
update versants set pente_max = 11.5
where nom = 'Versant Ouest (Saint-Lary-Soulan)'
  and col_id = (select id from cols where nom = 'Col de Val Louron-Azet');


-- =====================================================================
-- 11. Col de Marie-Blanque (déjà corrigé le 2026-09-16, revérifié)
-- =====================================================================

-- Versant Est (Bielle) et Versant Ouest (Escot / Bares) : CONFIRMÉS, les
-- valeurs déjà en base correspondent exactement à cyclingcols.com/col/
-- marie-blanque ("East, from Bielle" 11.3 km / 597 m / 5.2% / 11.0% ;
-- "West, from Escot" 9.2 km / 707 m / 7.7% / 13.0%). Aucun changement de
-- stats — profils km/km ajoutés ci-dessous (point C).

-- Profil km/km Versant Ouest (Escot), 9.2 km, altitude départ 328 m,
-- sommet 1035 m. Source : image cyclingcols.com/profiles/MarieBlanqueW.gif
-- (graphique d'altitude, pas de tableau chiffré) — extraction par analyse
-- de pixels (couleur du remplissage = altitude du profil), calibrée sur
-- les deux points connus (328 m au pied, 1035 m au sommet), lissée pour
-- exclure quelques artefacts (grille, encart texte du sommet). Fiabilité
-- modérée surtout sur le 1er km (portion plate en tout début de route à
-- Escot suivie d'une rampe, comme observé sur d'autres profils de ce
-- fournisseur, ex. Peyresourde Est) et sur le dernier km (zone d'étiquette
-- de sommet). Somme cohérente avec le % moyen officiel (7.7%).
update versants set profil_km = '[14.3, 4.2, 4.2, 3.7, 5.8, 9.0, 9.3, 9.3, 9.1]'::jsonb
where nom = 'Versant Ouest (Escot / Bares)'
  and col_id = (select id from cols where nom = 'Col de Marie-Blanque');

-- Profil km/km Versant Est (Bielle), 11.3 km, altitude départ 438 m,
-- sommet 1035 m. Source : image cyclingcols.com/profiles/MarieBlanqueE.gif
-- — même méthode. Cette image comporte deux zones (~5.8-7.3 km et
-- ~8.2-9.8 km) où le remplissage était trop fin/interrompu pour une
-- lecture pixel directe (probablement des paliers peu pentus) ; comblées
-- par interpolation + lissage. Fiabilité plus faible que le versant Ouest,
-- en particulier sur ces deux zones. Somme cohérente avec le % moyen
-- officiel (5.2%, recalculé 5.27%).
update versants set profil_km = '[5.6, 8.6, 9.3, 7.7, 8.5, 4.7, 1.5, 5.1, 6.5, 0.8, 1.0]'::jsonb
where nom = 'Versant Est (Bielle)'
  and col_id = (select id from cols where nom = 'Col de Marie-Blanque');


-- =====================================================================
-- 12. Col de Pailhères
-- =====================================================================

-- Versant Est (Ax-les-Thermes) : pente_max à corriger.
-- Source : cyclingcols.com/col/pailheres, "East, from Usson-les-Bains" —
-- 15.3 km / 1219 m / 7.9% / 14.0% vs base 15.4 km / 1266 m / 8.2% / 12%
-- (Usson-les-Bains est un hameau juste à la sortie d'Ax-les-Thermes sur la
-- D613 ; distance/D+/moyenne confirmés, écart max 17%). Confiance : haute.
update versants set pente_max = 14.0
where nom = 'Versant Est (Ax-les-Thermes)'
  and col_id = (select id from cols where nom = 'Col de Pailhères');


-- =====================================================================
-- 13. Plateau de Beille
-- =====================================================================

-- Versant unique (les Cabannes) : CONFIRMÉ, aucun changement.
-- Source : cyclingcols.com/col/beille — 15.9 km / 1252 m / 7.9% / 12.0%
-- vs base 15.9 km / 1268 m / 7.9% / 11% (tous les écarts sous le seuil).


-- =====================================================================
-- 14. Col de Puymorens
-- =====================================================================

-- Versant Nord (Ax-les-Thermes) : à corriger avec réserve.
-- Source : cyclingcols.com/col/puymorens, "West, from Ax-les-Thermes" —
-- 27.4 km / 1202 m / 4.4% / 9.4% vs base 24 km / 1180 m / 4.9% (même ville
-- de départ, D+ très proche (+1.8%) suggérant le même point de départ mais
-- une route/mesure plus longue ; distance et % moyen au-delà du seuil de
-- 10%). Confiance : moyenne.
update versants set
  distance_km = 27.4,
  denivele_m = 1202,
  pente_moyenne = 4.4,
  pente_max = 9.4
where nom = 'Versant Nord (Ax-les-Thermes)'
  and col_id = (select id from cols where nom = 'Col de Puymorens');


-- =====================================================================
-- 15. Col du Somport
-- =====================================================================

-- Versant Nord (Bedous) : réexaminé (point B), corrigé avec réserve.
-- cyclingcols.com/col/somport ne propose que "North, from N134/D238"
-- (39.4 km / 1388 m / 3.3% / 9.4%, encore plus long) et "South, from Jaca"
-- (Espagne, non pertinent). cols-cyclisme.com propose "Col du Somport
-- depuis Accous" (28.00 km / 1202 m / 4.29% / 9.5%,
-- cols-cyclisme.com/pyrenees-ouest/france/col-du-somport-depuis-accous-c250.htm)
-- — Accous est le village immédiatement après Bedous sur la N134, sur la
-- même route ; les deux sources s'accordent pour dire que la montée est
-- nettement plus longue que les 24.5 km en base (le Somport est connu pour
-- être l'un des cols pyrénéens les plus longs et les plus réguliers).
-- Retenue comme meilleure approximation disponible. Confiance : moyenne
-- (ville de départ légèrement différente : Accous, pas Bedous).
update versants set
  distance_km = 28.0,
  denivele_m = 1202,
  pente_moyenne = 4.29,
  pente_max = 9.5
where nom = 'Versant Nord (Bedous)'
  and col_id = (select id from cols where nom = 'Col du Somport');


-- =====================================================================
-- 16. Col d'Agnès
-- =====================================================================

-- Versant Est (Aulus-les-Bains) : pente_max inconnue, renseignée.
-- Source : cyclingcols.com/col/agnes, "South, from Aulus-les-Bains" —
-- 10.2 km / 828 m / 8.1% / 13.0% vs base 10 km / 807 m / 8% (distance/D+/
-- moyenne confirmés). Confiance : haute.
update versants set pente_max = 13.0
where nom = 'Versant Est (Aulus-les-Bains)'
  and col_id = (select id from cols where nom = 'Col d''Agnès');


-- =====================================================================
-- 17. Port de Lers
-- =====================================================================

-- Versant Est (Vicdessos) : CONFIRMÉ (déjà vérifié précédemment via
-- cols-cyclisme.com), pente_max inconnue jusqu'ici, renseignée.
-- Source : cols-cyclisme.com/pyrenees-centrales/france/port-de-lers-depuis-vicdessos-c540.htm
-- — 11.50 km / 807 m / 7.02% / 10.9% vs base 11.6 km / 838 m / 7.2%
-- (écarts <4%, cyclingcols.com ne propose pas de montée "depuis
-- Vicdessos" pour ce col — seulement Tarascon-sur-Ariège et Massat, plus
-- longues). Confiance : haute.
update versants set pente_max = 10.9
where nom = 'Versant Est (Vicdessos)'
  and col_id = (select id from cols where nom = 'Port de Lers');


-- =====================================================================
-- 18. Col de Jau
-- =====================================================================

-- Versant unique (Mosset) : CONFIRMÉ (déjà mis à jour le 2026-09-16 via
-- cols-cyclisme.com, revérifié à l'identique), pente_max inconnue jusqu'ici,
-- renseignée.
-- Source : cols-cyclisme.com/pyrenees-est/france/col-de-jau-depuis-mosset-c239.htm
-- — 13.60 km / 806 m / 5.93% / 8.3%, valeurs identiques à la base pour
-- distance/D+/% moyen. cyclingcols.com/col/jau existe mais ne propose que
-- "North, from D117/D118" et "South, from Catlar", aucune ne correspondant
-- à Mosset. Confiance : haute pour le % max (nouveau) ; confiance modérée
-- inchangée pour le reste (pas de source de référence indépendante pour
-- confirmer Mosset au départ, comme déjà noté lors du premier import).
update versants set pente_max = 8.3
where nom = 'Versant unique (Mosset)'
  and col_id = (select id from cols where nom = 'Col de Jau');

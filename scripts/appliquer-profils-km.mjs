// Script ponctuel : renseigne le profil kilomètre par kilomètre (pente moyenne de
// chaque km, du pied au sommet) des versants déjà en base. 18 versants depuis
// cyclingcols.com (première recherche), 2 versants supplémentaires depuis
// cols-cyclisme.com (Port de Lers et Col de Jau — les 7 autres restent
// introuvables/trop divergents sur les deux sources). N'écrit que les versants
// pour lesquels une correspondance jugée fiable a été trouvée ; commentaire par
// entrée = source exacte, méthode d'extraction et écarts constatés.
//
// ⚠️ Col de Jau : aucune stat de référence n'existait pour vérifier la
// correspondance (col sans données connues à l'avance) — profil à valider
// visuellement une fois affiché dans l'app, confiance plus faible que les
// autres entrées.
//
// Usage (Node 20+, lit les clés dans .env.local) :
//   node --env-file=.env.local scripts/appliquer-profils-km.mjs

import { createClient } from "@supabase/supabase-js";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants — lance avec : node --env-file=.env.local scripts/appliquer-profils-km.mjs"
  );
  process.exit(1);
}

// Pentes moyennes par km (%), du pied au sommet. Lues sur les graphiques
// d'altitude cyclingcols.com (points tous les ~500 m), reconstituées par
// interpolation linéaire puis moyennées par km entier — cf. rapport pour le
// détail (URL exacte, nombre de valeurs, écarts éventuels avec les stats déjà
// en base). Valeurs négatives = portion en légère descente (redescente avant
// une deuxième bosse, ex. Aubisque via Soulor).
const PROFILS = [
  {
    colNom: "Col du Tourmalet",
    versantNom: "Versant Est (Sainte-Marie-de-Campan / La Mongie)",
    profilKm: [2.6, 4.3, 2.4, 4.3, 5.5, 8.2, 7.9, 8.7, 8.6, 8.7, 9.1, 9.8, 9.7, 8.9, 8.9, 8.7, 9.1],
  },
  {
    colNom: "Col du Tourmalet",
    versantNom: "Versant Ouest (Luz-Saint-Sauveur / Barèges)",
    profilKm: [4.1, 6.7, 6.7, 8.1, 7.1, 7.2, 8.0, 7.3, 8.9, 5.7, 5.7, 7.6, 8.1, 8.5, 6.5, 8.6, 6.8, 8.4],
  },
  {
    colNom: "Col d'Aubisque",
    versantNom: "Versant Est (Laruns / Eaux-Bonnes)",
    profilKm: [6.3, 4.8, 4.9, 5.4, 5.7, 5.6, 6.2, 7.6, 8.7, 6.7, 8.3, 8.4, 7.8, 8.1, 8.3, 8.3, 8.1],
  },
  {
    // Climb combiné : monte au Col du Soulor (sommet ~1474 m vers le km 20) puis
    // redescend légèrement (~km 21-22, valeurs négatives) avant de remonter au
    // Col d'Aubisque. Page cyclingcols "AubisqueE" (départ Argelès-Gazost).
    colNom: "Col d'Aubisque",
    versantNom: "Versant Ouest (via Col du Soulor)",
    profilKm: [3.9, 6.7, 7.3, 7.0, 5.2, 2.6, 2.5, 4.1, 2.6, 1.3, 0.5, 0.9, 3.2, 10.8, 7.7, 6.5, 7.4, 7.6, 8.1, 7.6, -5.8, -3.8, 1.2, 2.4, 3.1, 3.3, 5.8, 7.4, 5.7],
  },
  {
    colNom: "Col du Soulor",
    versantNom: "Versant Est (Argelès-Gazost)",
    profilKm: [3.4, 7.2, 7.8, 8.1, 4.2, 3.3, 3.3, 4.3, 0.0, 2.1, -0.4, 0.9, 1.9, 7.2, 8.0, 8.2, 7.7, 8.4, 8.9, 9.0],
  },
  {
    // cyclingcols "PeyresourdeNE" (Bagnères-de-Luchon via Portet-de-Luchon) —
    // meilleure correspondance stats (15.1 km / 955 m / 6.3%) que "PeyresourdeE"
    // (13.8 km / 949 m / 6.9%), plus proche des 15.3 km / 939 m / 6.1% en base.
    colNom: "Col de Peyresourde",
    versantNom: "Versant Est (Bagnères-de-Luchon)",
    profilKm: [0.8, 6.3, 6.2, 3.6, 6.2, 7.3, 8.3, 6.2, 6.2, 7.4, 7.7, 7.3, 5.5, 7.5, 7.6],
  },
  {
    colNom: "Col d'Aspin",
    versantNom: "Versant Est (Arreau)",
    profilKm: [4.8, 3.0, 8.0, 5.1, 5.8, 6.1, 7.1, 8.7, 7.9, 7.7, 7.8, 7.2],
  },
  {
    colNom: "Col d'Aspin",
    versantNom: "Versant Ouest (Sainte-Marie-de-Campan)",
    profilKm: [2.1, 2.3, 4.4, 2.9, 3.5, 6.0, 2.2, 2.3, 8.2, 8.3, 8.5, 7.1],
  },
  {
    colNom: "Col du Portet",
    versantNom: "Versant unique (Saint-Lary-Soulan)",
    profilKm: [1.7, 8.4, 10.6, 10.5, 9.6, 9.2, 7.6, 10.0, 5.5, 8.8, 8.6, 8.7, 8.4, 9.8, 6.8, 8.1, 9.1],
  },
  {
    // cyclingcols "BalesN", départ Mauléon-Barousse (19.1 km / 1186 m / 6.2%) —
    // très proche des 19.6 km / 1215 m / 6.2% en base pour "Mayrègne" (Mauléon-
    // Barousse est une ville juste avant Mayrègne sur la même route).
    colNom: "Port de Balès",
    versantNom: "Versant Est (Mayrègne)",
    profilKm: [4.3, 5.4, 1.5, 4.0, 4.1, 3.4, 3.3, 7.0, 7.4, 8.5, 5.3, 9.5, 5.5, 5.8, 8.8, 9.8, 8.6, 7.6, 7.9],
  },
  {
    colNom: "Col de Menté",
    versantNom: "Versant Nord (Saint-Béat)",
    profilKm: [3.9, 10.4, 8.4, 9.7, 9.5, 9.8, 9.4, 8.6, 8.2],
  },
  {
    // cyclingcols "PortetDAspetW", départ "Pont de l'Oule" (9.7 km / 594 m /
    // 5.6%) — un peu plus long que les 8.3 km / 501 m / 6% en base pour
    // "Les-Bordes-sur-Lez", mais c'est la seule route Ouest disponible.
    colNom: "Col de Portet-d'Aspet",
    versantNom: "Versant Ouest (Les-Bordes-sur-Lez)",
    profilKm: [-2.9, 4.7, 1.5, 4.2, 6.3, 9.2, 6.4, 8.5, 8.7],
  },
  {
    colNom: "Col de Val Louron-Azet",
    versantNom: "Versant Est (Loudenvielle)",
    profilKm: [7.9, 9.2, 10.2, 8.6, 7.3, 7.9, 7.4],
  },
  {
    colNom: "Col de Val Louron-Azet",
    versantNom: "Versant Ouest (Saint-Lary-Soulan)",
    profilKm: [1.7, 5.7, 7.1, 7.8, 9.3, 8.1, 8.0, 8.5, 7.9, 8.9],
  },
  {
    // cyclingcols "PailheresE", départ Usson-les-Bains (15.3 km / 1219 m / 7.9%)
    // — hameau juste à la sortie d'Ax-les-Thermes sur la même route (D613) ;
    // stats très proches des 15.4 km / 1266 m / 8.2% en base.
    colNom: "Col de Pailhères",
    versantNom: "Versant Est (Ax-les-Thermes)",
    profilKm: [6.3, 9.8, 5.3, 8.1, 6.7, 7.7, 9.6, 9.1, 8.6, 8.3, 6.3, 9.1, 9.3, 8.8, 7.0],
  },
  {
    colNom: "Plateau de Beille",
    versantNom: "Versant unique (les Cabannes)",
    profilKm: [5.9, 8.3, 8.9, 9.1, 8.9, 8.2, 7.2, 8.4, 8.2, 9.5, 9.2, 7.2, 7.1, 7.3, 7.2],
  },
  {
    // cyclingcols "PuymorensW", départ Ax-les-Thermes mais mesuré sur 27.4 km
    // (vs 24 km en base) — 27 valeurs au lieu de 24, dénivelé très proche
    // (1200 m vs 1180 m) donc probablement le même point de départ, juste une
    // route/mesure légèrement plus longue.
    colNom: "Col de Puymorens",
    versantNom: "Versant Nord (Ax-les-Thermes)",
    profilKm: [1.9, 5.2, 4.5, 3.1, 3.0, 2.0, 4.0, 4.2, 3.9, 3.0, 2.9, 3.4, 3.9, 4.6, 3.6, 4.2, 5.1, 5.4, 5.2, 7.7, 5.8, 5.6, 5.2, 5.0, 5.0, 5.3, 5.3],
  },
  {
    colNom: "Col d'Agnès",
    versantNom: "Versant Est (Aulus-les-Bains)",
    profilKm: [3.0, 9.2, 9.7, 8.2, 7.7, 7.8, 12.3, 8.3, 8.7, 7.0],
  },
  {
    // Source : cols-cyclisme.com/pyrenees-centrales/france/port-de-lers-depuis-vicdessos-c540.htm
    // Stats site 11.50 km / 807 m D+ / 7.02% vs référence 11.6 km / 838 m / 7.2%
    // (écarts <4%) — quasi certainement le bon versant. Extrait
    // programmatiquement du SVG du site (segments chiffrés, pas une lecture
    // visuelle) — plus fiable que la tentative précédente via cyclingcols.com
    // (sous-segment deviné, abandonnée).
    colNom: "Port de Lers",
    versantNom: "Versant Est (Vicdessos)",
    profilKm: [6.0, 10.2, 7.0, 3.9, 6.0, 7.0, 6.5, 7.8, 8.9, 7.8, 7.0, 5.1],
  },
  {
    // Source : cols-cyclisme.com/pyrenees-est/france/col-de-jau-depuis-mosset-c239.htm
    // Seule page correspondant à ce versant, mais AUCUNE stat de référence
    // n'existait pour vérifier la correspondance (col sans données connues à
    // l'avance) et le graphique du site est une image (lecture visuelle +
    // interpolation, pas un tableau chiffré) — confiance plus faible que les
    // autres entrées de ce fichier, à valider une fois affiché dans l'app.
    // Stats de base (distance/D+/pente moyenne) inconnues jusqu'ici (seed-cols.mjs
    // les avait laissées vides) — on en profite pour les renseigner avec les
    // chiffres officiels du site.
    colNom: "Col de Jau",
    versantNom: "Versant unique (Mosset)",
    profilKm: [2.0, 3.0, 3.8, 6.0, 6.8, 7.2, 6.7, 6.5, 6.0, 5.7, 8.7, 7.1, 6.0, 8.5],
    distanceKm: 13.6,
    deniveleM: 806,
    penteMoyenne: 5.93,
  },
];

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const rl = createInterface({ input: stdin, output: stdout });
  console.log(`Va mettre à jour le profil km par km de ${PROFILS.length} versants.\n`);
  const email = await rl.question("Email du compte : ");
  const motDePasse = await rl.question("Mot de passe (visible, terminal local uniquement) : ");
  rl.close();

  const { error: erreurAuth } = await supabase.auth.signInWithPassword({
    email,
    password: motDePasse,
  });
  if (erreurAuth) {
    console.error("Échec de connexion :", erreurAuth.message);
    process.exit(1);
  }

  // Récupère les cols concernés une seule fois (par nom -> id).
  const nomsCols = [...new Set(PROFILS.map((p) => p.colNom))];
  const { data: cols, error: erreurCols } = await supabase
    .from("cols")
    .select("id, nom")
    .in("nom", nomsCols);

  if (erreurCols) {
    console.error("Échec récupération des cols :", erreurCols.message);
    process.exit(1);
  }

  const idParNomCol = new Map(cols.map((c) => [c.nom, c.id]));
  const colsIntrouvables = nomsCols.filter((nom) => !idParNomCol.has(nom));
  if (colsIntrouvables.length > 0) {
    console.error("Cols introuvables en base (vérifier l'orthographe exacte) :", colsIntrouvables.join(", "));
  }

  let nbMisAJour = 0;
  let nbEchecs = 0;

  for (const { colNom, versantNom, profilKm, distanceKm, deniveleM, penteMoyenne } of PROFILS) {
    const colId = idParNomCol.get(colNom);
    if (!colId) {
      console.error(`✗ ${colNom} — ${versantNom} : col introuvable, ignoré`);
      nbEchecs += 1;
      continue;
    }

    const misAJour = { profil_km: profilKm };
    if (distanceKm != null) misAJour.distance_km = distanceKm;
    if (deniveleM != null) misAJour.denivele_m = deniveleM;
    if (penteMoyenne != null) misAJour.pente_moyenne = penteMoyenne;

    const { data, error } = await supabase
      .from("versants")
      .update(misAJour)
      .eq("col_id", colId)
      .eq("nom", versantNom)
      .select("id");

    if (error) {
      console.error(`✗ ${colNom} — ${versantNom} :`, error.message);
      nbEchecs += 1;
      continue;
    }
    if (!data || data.length === 0) {
      console.error(`✗ ${colNom} — ${versantNom} : aucun versant correspondant (nom exact ?)`);
      nbEchecs += 1;
      continue;
    }
    nbMisAJour += 1;
    console.log(`✓ ${colNom} — ${versantNom} (${profilKm.length} valeurs)`);
  }

  console.log(`\nTerminé : ${nbMisAJour} versants mis à jour, ${nbEchecs} échec(s)/ignoré(s).`);
}

main();

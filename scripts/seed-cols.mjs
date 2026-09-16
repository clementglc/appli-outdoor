// Script ponctuel : peuple la table `cols`/`versants` avec une première
// liste de cols pyrénéens connus (grands cols du Tour de France + quelques
// classiques régionales). Statistiques (distance/dénivelé/pente)
// approximatives issues de sources cyclistes habituelles pour les cols les
// plus documentés — à corriger/compléter à la main depuis l'appli
// (onglet "Mes ascensions" → "Ajouter un col ou un versant") pour les
// autres. Liste volontairement non exhaustive au démarrage : à enrichir
// au fil de l'eau.
//
// Usage (Node 20+, lit les clés dans .env.local) :
//   node --env-file=.env.local scripts/seed-cols.mjs

import { createClient } from "@supabase/supabase-js";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants — lance avec : node --env-file=.env.local scripts/seed-cols.mjs"
  );
  process.exit(1);
}

const COLS = [
  {
    nom: "Col du Tourmalet",
    altitude_m: 2115,
    departement: "Hautes-Pyrénées",
    versants: [
      { nom: "Versant Est (Sainte-Marie-de-Campan / La Mongie)", ville_depart: "Sainte-Marie-de-Campan", distance_km: 17.1, denivele_m: 1268, pente_moyenne: 7.4, pente_max: 10.2, altitude_depart_m: 857 },
      { nom: "Versant Ouest (Luz-Saint-Sauveur / Barèges)", ville_depart: "Luz-Saint-Sauveur", distance_km: 19, denivele_m: 1404, pente_moyenne: 7.4, pente_max: 10.7, altitude_depart_m: 711 },
    ],
  },
  {
    nom: "Col d'Aubisque",
    altitude_m: 1709,
    departement: "Pyrénées-Atlantiques",
    versants: [
      { nom: "Versant Est (Laruns / Eaux-Bonnes)", ville_depart: "Laruns", distance_km: 16.6, denivele_m: 1190, pente_moyenne: 7.1, pente_max: 10, altitude_depart_m: 523 },
      { nom: "Versant Ouest (via Col du Soulor)", ville_depart: "Argelès-Gazost", distance_km: 30, denivele_m: 1400, pente_moyenne: 4.7, pente_max: 10, altitude_depart_m: 462 },
    ],
  },
  {
    nom: "Col du Soulor",
    altitude_m: 1474,
    departement: "Hautes-Pyrénées",
    versants: [
      { nom: "Versant Est (Argelès-Gazost)", ville_depart: "Argelès-Gazost", distance_km: 20, denivele_m: 1000, pente_moyenne: 5, pente_max: null, altitude_depart_m: 462 },
    ],
  },
  {
    nom: "Col de Peyresourde",
    altitude_m: 1569,
    departement: "Haute-Garonne",
    versants: [
      { nom: "Versant Est (Bagnères-de-Luchon)", ville_depart: "Bagnères-de-Luchon", distance_km: 15.3, denivele_m: 939, pente_moyenne: 6.1, pente_max: 9.9, altitude_depart_m: 630 },
      { nom: "Versant Ouest (Arreau)", ville_depart: "Arreau", distance_km: 9.7, denivele_m: 761, pente_moyenne: 7.8, pente_max: 9.9, altitude_depart_m: 808 },
    ],
  },
  {
    nom: "Col d'Aspin",
    altitude_m: 1489,
    departement: "Hautes-Pyrénées",
    versants: [
      { nom: "Versant Est (Arreau)", ville_depart: "Arreau", distance_km: 12, denivele_m: 793, pente_moyenne: 6.6, pente_max: 9.5, altitude_depart_m: 696 },
      { nom: "Versant Ouest (Sainte-Marie-de-Campan)", ville_depart: "Sainte-Marie-de-Campan", distance_km: 12.8, denivele_m: 632, pente_moyenne: 4.9, pente_max: 8, altitude_depart_m: 857 },
    ],
  },
  {
    nom: "Col du Portet",
    altitude_m: 2215,
    departement: "Hautes-Pyrénées",
    versants: [
      { nom: "Versant unique (Saint-Lary-Soulan)", ville_depart: "Saint-Lary-Soulan", distance_km: 16, denivele_m: 1421, pente_moyenne: 8.7, pente_max: 12, altitude_depart_m: 794 },
    ],
  },
  {
    nom: "Port de Balès",
    altitude_m: 1755,
    departement: "Haute-Garonne",
    versants: [
      { nom: "Versant Est (Mayrègne)", ville_depart: "Mayrègne", distance_km: 19.6, denivele_m: 1215, pente_moyenne: 6.2, pente_max: 11, altitude_depart_m: 540 },
      { nom: "Versant Ouest (Bagnères-de-Luchon via Bourg-d'Oueil)", ville_depart: "Bagnères-de-Luchon", distance_km: 12.1, denivele_m: 1120, pente_moyenne: 8.3, pente_max: null, altitude_depart_m: 630 },
    ],
  },
  {
    nom: "Col de Menté",
    altitude_m: 1349,
    departement: "Haute-Garonne",
    versants: [
      { nom: "Versant Nord (Saint-Béat)", ville_depart: "Saint-Béat", distance_km: 9.4, denivele_m: 971, pente_moyenne: 9.3, pente_max: null, altitude_depart_m: 378 },
      { nom: "Versant Sud (Le Mourtis)", ville_depart: "Bagnères-de-Luchon", distance_km: 6.9, denivele_m: 502, pente_moyenne: 7.3, pente_max: null, altitude_depart_m: 847 },
    ],
  },
  {
    nom: "Col de Portet-d'Aspet",
    altitude_m: 1069,
    departement: "Haute-Garonne",
    versants: [
      { nom: "Versant Est (Aspet)", ville_depart: "Aspet", distance_km: 4.5, denivele_m: 343, pente_moyenne: 7.6, pente_max: 12, altitude_depart_m: 726 },
      { nom: "Versant Ouest (Les-Bordes-sur-Lez)", ville_depart: "Les-Bordes-sur-Lez", distance_km: 8.3, denivele_m: 501, pente_moyenne: 6, pente_max: null, altitude_depart_m: 568 },
    ],
  },
  {
    nom: "Col de Val Louron-Azet",
    altitude_m: 1580,
    departement: "Hautes-Pyrénées",
    versants: [
      { nom: "Versant Est (Loudenvielle)", ville_depart: "Loudenvielle", distance_km: 7.4, denivele_m: 654, pente_moyenne: 8.3, pente_max: 10.7, altitude_depart_m: 950 },
      { nom: "Versant Ouest (Saint-Lary-Soulan)", ville_depart: "Saint-Lary-Soulan", distance_km: 10.7, denivele_m: 786, pente_moyenne: 7.4, pente_max: null, altitude_depart_m: 794 },
    ],
  },
  {
    nom: "Col de Marie-Blanque",
    altitude_m: 1035,
    departement: "Pyrénées-Atlantiques",
    versants: [
      // Stats vérifiées sur cyclingcols.com le 2026-09-16 (les valeurs
      // précédentes avaient les deux versants inversés : le 7.7% bien connu
      // du Tour de France appartient au côté Escot, pas Bielle).
      { nom: "Versant Est (Bielle)", ville_depart: "Bielle", distance_km: 11.3, denivele_m: 597, pente_moyenne: 5.2, pente_max: 11, altitude_depart_m: 438 },
      { nom: "Versant Ouest (Escot / Bares)", ville_depart: "Escot", distance_km: 9.2, denivele_m: 707, pente_moyenne: 7.7, pente_max: 13, altitude_depart_m: 328 },
    ],
  },
  {
    nom: "Col de Pailhères",
    altitude_m: 2001,
    departement: "Ariège",
    versants: [
      { nom: "Versant Est (Ax-les-Thermes)", ville_depart: "Ax-les-Thermes", distance_km: 15.4, denivele_m: 1266, pente_moyenne: 8.2, pente_max: 12, altitude_depart_m: 735 },
    ],
  },
  {
    nom: "Plateau de Beille",
    altitude_m: 1782,
    departement: "Ariège",
    versants: [
      { nom: "Versant unique (les Cabannes)", ville_depart: "Les Cabannes", distance_km: 15.9, denivele_m: 1268, pente_moyenne: 7.9, pente_max: 11, altitude_depart_m: 514 },
    ],
  },
  {
    nom: "Col de Puymorens",
    altitude_m: 1915,
    departement: "Ariège",
    versants: [
      { nom: "Versant Nord (Ax-les-Thermes)", ville_depart: "Ax-les-Thermes", distance_km: 24, denivele_m: 1180, pente_moyenne: 4.9, pente_max: null, altitude_depart_m: 735 },
    ],
  },
  {
    nom: "Col du Somport",
    altitude_m: 1631,
    departement: "Pyrénées-Atlantiques",
    versants: [
      { nom: "Versant Nord (Bedous)", ville_depart: "Bedous", distance_km: 24.5, denivele_m: 1031, pente_moyenne: 3.4, pente_max: null, altitude_depart_m: 600 },
    ],
  },
  {
    nom: "Col d'Agnès",
    altitude_m: 1570,
    departement: "Ariège",
    versants: [
      { nom: "Versant Est (Aulus-les-Bains)", ville_depart: "Aulus-les-Bains", distance_km: 10, denivele_m: 807, pente_moyenne: 8, pente_max: null, altitude_depart_m: 763 },
    ],
  },
  {
    nom: "Port de Lers",
    altitude_m: 1517,
    departement: "Ariège",
    versants: [
      { nom: "Versant Est (Vicdessos)", ville_depart: "Vicdessos", distance_km: 11.6, denivele_m: 838, pente_moyenne: 7.2, pente_max: null, altitude_depart_m: 679 },
    ],
  },
  {
    nom: "Col de Jau",
    altitude_m: 1506,
    departement: "Pyrénées-Orientales",
    versants: [
      { nom: "Versant unique (Mosset)", ville_depart: "Mosset", distance_km: null, denivele_m: null, pente_moyenne: null, pente_max: null, altitude_depart_m: null },
    ],
  },
];

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const rl = createInterface({ input: stdin, output: stdout });
  console.log(`Va insérer ${COLS.length} cols avec leurs versants.\n`);
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

  let nbCols = 0;
  let nbVersants = 0;

  for (const col of COLS) {
    const { versants, ...colSansVersants } = col;
    const { data: colCree, error: erreurCol } = await supabase
      .from("cols")
      .insert(colSansVersants)
      .select("id")
      .single();

    if (erreurCol) {
      console.error(`Échec insertion col "${col.nom}" :`, erreurCol.message);
      continue;
    }
    nbCols += 1;

    const versantsAInserer = versants.map((v) => ({ ...v, col_id: colCree.id }));
    const { error: erreurVersants } = await supabase.from("versants").insert(versantsAInserer);
    if (erreurVersants) {
      console.error(`Échec insertion versants de "${col.nom}" :`, erreurVersants.message);
      continue;
    }
    nbVersants += versants.length;
    console.log(`✓ ${col.nom} (${versants.length} versant${versants.length > 1 ? "s" : ""})`);
  }

  console.log(`\nTerminé : ${nbCols} cols et ${nbVersants} versants insérés.`);
}

main();

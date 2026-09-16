import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Autorise l'accès au serveur de dev depuis d'autres appareils du réseau
   * local (téléphone, tablette) via l'IP locale, sans quoi Next.js bloque
   * le chargement des scripts par sécurité (protection anti DNS-rebinding).
   * À mettre à jour si l'IP change (nouveau réseau, redémarrage du routeur).
   */
  allowedDevOrigins: ["192.168.1.34"],
  /*
   * Les Server Actions limitent le corps de la requête à 1 Mo par défaut —
   * trop peu pour une vraie trace GPX (plusieurs Mo sur une sortie longue).
   * Sans ça, le formulaire d'ajout d'ascension échoue silencieusement côté
   * client ("Failed to fetch") dès qu'on joint un fichier un peu gros.
   */
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Autorise l'accès au serveur de dev depuis d'autres appareils du réseau
   * local (téléphone, tablette) via l'IP locale, sans quoi Next.js bloque
   * le chargement des scripts par sécurité (protection anti DNS-rebinding).
   * À mettre à jour si l'IP change (nouveau réseau, redémarrage du routeur).
   */
  allowedDevOrigins: ["192.168.1.34"],
};

export default nextConfig;

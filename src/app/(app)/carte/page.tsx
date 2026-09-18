import { createClient } from "@/lib/supabase/server";
import { colsAvecStatut } from "@/lib/cols";
import CarteInteractive from "@/components/CarteInteractive";
import type { Ascension, ColAvecVersants } from "@/lib/types";

export default async function CartePage() {
  const supabase = await createClient();

  const [{ data: colsData }, { data: ascensionsData }] = await Promise.all([
    supabase.from("cols").select("*, versants(*)").order("nom", { ascending: true }),
    supabase.from("ascensions").select("*"),
  ]);

  const cols = (colsData ?? []) as ColAvecVersants[];
  const ascensions = (ascensionsData ?? []) as Ascension[];

  const colsStatut = colsAvecStatut(cols, ascensions);
  const colsAvecCoordonnees = colsStatut.filter(
    (c): c is typeof c & { latitude: number; longitude: number } =>
      c.latitude != null && c.longitude != null
  );
  const nbSansCoordonnees = colsStatut.length - colsAvecCoordonnees.length;

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Carte des cols</h1>
      {colsAvecCoordonnees.length > 0 ? (
        <CarteInteractive cols={colsAvecCoordonnees} />
      ) : (
        <p className="rounded-2xl bg-white p-5 text-sm text-stone-500 shadow-sm">
          Aucun col n&apos;a encore de coordonnées GPS renseignées.
        </p>
      )}
      {nbSansCoordonnees > 0 && (
        <p className="text-xs text-stone-400">
          {nbSansCoordonnees} col{nbSansCoordonnees > 1 ? "s" : ""} sans coordonnées GPS pas encore
          affiché{nbSansCoordonnees > 1 ? "s" : ""} sur la carte.
        </p>
      )}
    </div>
  );
}

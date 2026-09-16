import { createClient } from "@/lib/supabase/server";
import { colsAvecStatut, progression } from "@/lib/cols";
import ProgressionRing from "@/components/ProgressionRing";
import ChecklistGrille from "@/components/ChecklistGrille";
import type { Ascension, ColAvecVersants } from "@/lib/types";

export default async function ChecklistPage() {
  const supabase = await createClient();

  const [{ data: colsData }, { data: ascensionsData }] = await Promise.all([
    supabase
      .from("cols")
      .select("*, versants(*)")
      .order("nom", { ascending: true }),
    supabase.from("ascensions").select("*"),
  ]);

  const cols = (colsData ?? []) as ColAvecVersants[];
  const ascensions = (ascensionsData ?? []) as Ascension[];

  const colsStatut = colsAvecStatut(cols, ascensions).sort((a, b) => {
    if (a.gravi !== b.gravi) return a.gravi ? 1 : -1;
    return a.nom.localeCompare(b.nom);
  });
  const stats = progression(colsStatut);

  return (
    <div className="space-y-6">
      <h1 className="sr-only">Checklist des cols</h1>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <ProgressionRing
          pourcentage={stats.colsTotal ? (stats.colsGravis / stats.colsTotal) * 100 : 0}
          label={`${stats.colsGravis} / ${stats.colsTotal} cols gravis`}
          sousLabel={`${stats.versantsGravis} / ${stats.versantsTotal} versants gravis`}
        />
      </div>

      {cols.length === 0 ? (
        <p className="rounded-2xl bg-white p-5 text-sm text-stone-500 shadow-sm">
          Aucun col enregistré pour le moment. Ajoute-en depuis l&apos;onglet
          « Mes ascensions ».
        </p>
      ) : (
        <ChecklistGrille cols={colsStatut} />
      )}
    </div>
  );
}

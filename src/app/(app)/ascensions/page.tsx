import { createClient } from "@/lib/supabase/server";
import { supprimerAscension } from "./actions";
import AscensionForm from "@/components/AscensionForm";
import GererColsVersants from "@/components/GererColsVersants";
import BoutonConfirmation from "@/components/BoutonConfirmation";
import { formatDateLongue, formatDuree } from "@/lib/format";
import type { Ascension, ColAvecVersants } from "@/lib/types";

export default async function AscensionsPage() {
  const supabase = await createClient();

  const [{ data: colsData }, { data: ascensionsData }] = await Promise.all([
    supabase
      .from("cols")
      .select("*, versants(*)")
      .order("nom", { ascending: true }),
    supabase
      .from("ascensions")
      .select("*")
      .order("date_ascension", { ascending: false }),
  ]);

  const cols = (colsData ?? []) as ColAvecVersants[];
  const ascensions = (ascensionsData ?? []) as Ascension[];

  const versantParId = new Map(
    cols.flatMap((c) => c.versants.map((v) => [v.id, { ...v, colNom: c.nom }]))
  );

  return (
    <div className="space-y-6">
      <h1 className="sr-only">Mes ascensions</h1>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-stone-900">
          Enregistrer une ascension
        </h2>
        <AscensionForm cols={cols} />
      </div>

      <GererColsVersants cols={cols} />

      <div className="space-y-3">
        {ascensions.length === 0 && (
          <p className="rounded-2xl bg-white p-5 text-sm text-stone-500 shadow-sm">
            Aucune ascension enregistrée pour le moment.
          </p>
        )}
        {ascensions.map((ascension) => {
          const versant = versantParId.get(ascension.versant_id);
          return (
            <div
              key={ascension.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-medium text-stone-900">
                  {versant?.colNom ?? "Col supprimé"}
                  {versant?.nom ? ` — ${versant.nom}` : ""}
                </p>
                <p className="text-sm text-stone-500">
                  {formatDateLongue(ascension.date_ascension)}
                  {ascension.duree_minutes ? ` · ${formatDuree(ascension.duree_minutes)}` : ""}
                  {ascension.commentaire ? ` · ${ascension.commentaire}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {ascension.lien_activite && (
                  <a
                    href={ascension.lien_activite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-orange-700 hover:text-orange-800"
                  >
                    Voir l&apos;activité ↗
                  </a>
                )}
                <form action={supprimerAscension}>
                  <input type="hidden" name="id" value={ascension.id} />
                  <BoutonConfirmation
                    message="Supprimer cette ascension ?"
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Supprimer
                  </BoutonConfirmation>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

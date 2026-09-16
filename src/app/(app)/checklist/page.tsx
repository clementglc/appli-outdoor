import { createClient } from "@/lib/supabase/server";
import { colsAvecStatut, progression } from "@/lib/cols";
import { formatDateLongue, formatDenivele, formatDistance, formatPente } from "@/lib/format";
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

  const groupes = new Map<string, typeof colsStatut>();
  for (const col of colsStatut) {
    const cle = col.departement ?? "Sans département";
    const liste = groupes.get(cle) ?? [];
    liste.push(col);
    groupes.set(cle, liste);
  }

  return (
    <div className="space-y-6">
      <h1 className="sr-only">Checklist des cols</h1>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-2xl font-semibold text-gray-900">
            {stats.colsGravis} / {stats.colsTotal}
          </span>
          <span className="text-sm text-gray-500">cols gravis</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{
              width: `${stats.colsTotal ? (stats.colsGravis / stats.colsTotal) * 100 : 0}%`,
            }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          {stats.versantsGravis} / {stats.versantsTotal} versants gravis
        </p>
      </div>

      {cols.length === 0 && (
        <p className="rounded-2xl bg-white p-5 text-sm text-gray-500 shadow-sm">
          Aucun col enregistré pour le moment. Ajoute-en depuis l&apos;onglet
          « Mes ascensions ».
        </p>
      )}

      {Array.from(groupes.entries()).map(([departement, colsDuGroupe]) => (
        <div key={departement}>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {departement}
          </h2>
          <div className="space-y-3">
            {colsDuGroupe.map((col) => (
              <div
                key={col.id}
                className={`rounded-2xl bg-white p-4 shadow-sm ${
                  col.gravi ? "" : "opacity-90"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                        col.gravi
                          ? "bg-emerald-500 text-white"
                          : "border border-gray-300 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span className="font-medium text-gray-900">{col.nom}</span>
                  </div>
                  {col.altitude_m != null && (
                    <span className="text-sm text-gray-400">{col.altitude_m} m</span>
                  )}
                </div>

                {col.versantsStatut.length > 0 && (
                  <ul className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
                    {col.versants.map((versant) => {
                      const statut = col.versantsStatut.find(
                        (v) => v.versantId === versant.id
                      );
                      return (
                        <li
                          key={versant.id}
                          className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-sm"
                        >
                          <span className="flex items-center gap-1.5">
                            <span
                              className={`inline-block h-1.5 w-1.5 rounded-full ${
                                statut?.gravi ? "bg-emerald-500" : "bg-gray-300"
                              }`}
                            />
                            <span className={statut?.gravi ? "text-gray-900" : "text-gray-500"}>
                              {versant.nom}
                            </span>
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDistance(versant.distance_km)} ·{" "}
                            {formatDenivele(versant.denivele_m)} ·{" "}
                            {formatPente(versant.pente_moyenne)}
                            {statut?.gravi && statut.derniereAscension && (
                              <> · gravi le {formatDateLongue(statut.derniereAscension.date_ascension)}</>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

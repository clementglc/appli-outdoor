"use client";

import { useMemo, useState } from "react";
import ColCard from "./ColCard";
import { defisDepartements, type ColAvecStatut } from "@/lib/cols";

/** Filtre par département façon Been (filtre par continent) + grille de
 * cartes façon collection, plutôt que la liste empilée précédente. Un
 * département dont tous les cols sont gravis affiche un badge "complet"
 * sur son chip (défi "département complet"). */
export default function ChecklistGrille({ cols }: { cols: ColAvecStatut[] }) {
  const [filtre, setFiltre] = useState<string | null>(null);

  const departements = useMemo(() => defisDepartements(cols), [cols]);

  const colsAffiches = filtre
    ? cols.filter((c) => (c.departement ?? "Sans département") === filtre)
    : cols;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFiltre(null)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            filtre === null
              ? "bg-orange-600 text-white"
              : "bg-white text-stone-600 shadow-sm hover:bg-stone-100"
          }`}
        >
          Tous ({cols.length})
        </button>
        {departements.map((defi) => (
          <button
            key={defi.departement}
            type="button"
            onClick={() => setFiltre(defi.departement)}
            title={defi.complet ? "Défi complet : tous les cols du département sont gravis" : undefined}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filtre === defi.departement
                ? "bg-orange-600 text-white"
                : "bg-white text-stone-600 shadow-sm hover:bg-stone-100"
            }`}
          >
            {defi.complet && (
              <svg
                width={12}
                height={12}
                viewBox="0 0 24 24"
                fill={filtre === defi.departement ? "#ffffff" : "#d97706"}
                aria-hidden="true"
              >
                <path d="M12 2l2.9 6.3 6.9.9-5 4.9 1.2 6.9L12 17.6l-6 3.4 1.2-6.9-5-4.9 6.9-.9L12 2z" />
              </svg>
            )}
            {defi.departement} ({defi.colsGravis}/{defi.colsTotal})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {colsAffiches.map((col) => (
          <ColCard key={col.id} col={col} />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import ColCard from "./ColCard";
import type { ColAvecStatut } from "@/lib/cols";

/** Filtre par département façon Been (filtre par continent) + grille de
 * cartes façon collection, plutôt que la liste empilée précédente. */
export default function ChecklistGrille({ cols }: { cols: ColAvecStatut[] }) {
  const [filtre, setFiltre] = useState<string | null>(null);

  const departements = useMemo(() => {
    const compte = new Map<string, number>();
    for (const col of cols) {
      const cle = col.departement ?? "Sans département";
      compte.set(cle, (compte.get(cle) ?? 0) + 1);
    }
    return Array.from(compte.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [cols]);

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
        {departements.map(([departement, count]) => (
          <button
            key={departement}
            type="button"
            onClick={() => setFiltre(departement)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filtre === departement
                ? "bg-orange-600 text-white"
                : "bg-white text-stone-600 shadow-sm hover:bg-stone-100"
            }`}
          >
            {departement} ({count})
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

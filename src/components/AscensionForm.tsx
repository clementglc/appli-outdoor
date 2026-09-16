"use client";

import { useActionState, useMemo, useState } from "react";
import { ajouterAscension, type FormState } from "@/app/(app)/ascensions/actions";
import type { ColAvecVersants } from "@/lib/types";

const initialState: FormState = {};

export default function AscensionForm({ cols }: { cols: ColAvecVersants[] }) {
  const [state, formAction, pending] = useActionState(ajouterAscension, initialState);
  const [colId, setColId] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [dernierState, setDernierState] = useState(state);

  // Un envoi réussi (pas d'erreur) vide le formulaire pour la saisie
  // suivante ; en cas d'erreur, on garde ce que l'utilisateur a tapé.
  // Ajustement pendant le rendu plutôt qu'un effet, pour éviter un
  // rendu supplémentaire (cf. https://react.dev/learn/you-might-not-need-an-effect).
  if (state !== dernierState) {
    setDernierState(state);
    if (state !== initialState && !state?.error) {
      setColId("");
      setResetKey((k) => k + 1);
    }
  }

  const versantsDuCol = useMemo(
    () => cols.find((c) => c.id === colId)?.versants ?? [],
    [cols, colId]
  );

  const colsAvecVersants = cols.filter((c) => c.versants.length > 0);

  return (
    <form action={formAction} key={resetKey} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Col</label>
          <select
            value={colId}
            onChange={(e) => setColId(e.target.value)}
            required
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600"
          >
            <option value="">Sélectionner…</option>
            {colsAvecVersants.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Versant</label>
          <select
            name="versant_id"
            required
            disabled={!colId}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600 disabled:bg-stone-50 disabled:text-stone-400"
          >
            <option value="">Sélectionner…</option>
            {versantsDuCol.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Date</label>
        <input
          type="date"
          name="date_ascension"
          required
          max={new Date().toISOString().slice(0, 10)}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Commentaire (facultatif)
        </label>
        <input
          type="text"
          name="commentaire"
          placeholder="ex : sortie avec le club, canicule..."
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Trace GPX/FIT (facultatif)
        </label>
        <input
          type="file"
          name="trace"
          accept=".gpx,.fit"
          className="w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border file:border-stone-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-stone-700 hover:file:bg-stone-100"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-orange-600 py-2 text-sm font-medium text-white transition hover:bg-orange-700 disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer l'ascension"}
      </button>
    </form>
  );
}

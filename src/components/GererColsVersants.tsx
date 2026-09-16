"use client";

import { useActionState, useState } from "react";
import { ajouterCol, ajouterVersant, type FormState } from "@/app/(app)/ascensions/actions";
import type { Col } from "@/lib/types";

const initialState: FormState = {};

export default function GererColsVersants({ cols }: { cols: Col[] }) {
  const [ouvert, setOuvert] = useState(false);
  const [colState, colAction, colPending] = useActionState(ajouterCol, initialState);
  const [versantState, versantAction, versantPending] = useActionState(
    ajouterVersant,
    initialState
  );

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        + Ajouter un col ou un versant
      </button>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Gérer les cols/versants</h3>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          Masquer
        </button>
      </div>

      <form action={colAction} className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Nouveau col
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            name="nom"
            placeholder="Nom du col"
            required
            className="col-span-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <input
            type="number"
            name="altitude_m"
            placeholder="Altitude (m)"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <input
            type="text"
            name="departement"
            placeholder="Département"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>
        {colState?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{colState.error}</p>
        )}
        <button
          type="submit"
          disabled={colPending}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
        >
          {colPending ? "Ajout..." : "Ajouter le col"}
        </button>
      </form>

      <form action={versantAction} className="space-y-2 border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Nouveau versant
        </p>
        <select
          name="col_id"
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          <option value="">Col concerné…</option>
          {cols.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="nom"
          placeholder="Nom du versant (ex : depuis Luz-Saint-Sauveur)"
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
        <input
          type="text"
          name="ville_depart"
          placeholder="Ville de départ"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            step="0.1"
            name="distance_km"
            placeholder="Distance (km)"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <input
            type="number"
            name="denivele_m"
            placeholder="Dénivelé (m D+)"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <input
            type="number"
            step="0.1"
            name="pente_moyenne"
            placeholder="Pente moyenne (%)"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <input
            type="number"
            step="0.1"
            name="pente_max"
            placeholder="Pente max (%)"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <input
            type="number"
            name="altitude_depart_m"
            placeholder="Altitude départ (m)"
            className="col-span-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>
        {versantState?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {versantState.error}
          </p>
        )}
        <button
          type="submit"
          disabled={versantPending}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
        >
          {versantPending ? "Ajout..." : "Ajouter le versant"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { modifierProfilVersant, type FormState } from "@/app/(app)/checklist/[versantId]/actions";

const initialState: FormState = {};

export default function ProfilVersantForm({
  versantId,
  profilActuel,
}: {
  versantId: string;
  profilActuel: number[] | null;
}) {
  const [state, formAction, pending] = useActionState(modifierProfilVersant, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="versant_id" value={versantId} />
      <label className="block text-sm font-medium text-gray-700">
        Profil km par km (pentes en %, séparées par des virgules, un chiffre par km depuis le
        pied jusqu&apos;au sommet)
      </label>
      <textarea
        name="profil_km"
        rows={3}
        defaultValue={profilActuel?.join(", ") ?? ""}
        placeholder="ex : 6.5, 7.2, 8.9, 6.1, 9.4, ..."
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
      />
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : profilActuel ? "Mettre à jour le profil" : "Enregistrer le profil"}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { updatePassword, type AuthFormState } from "@/app/login/actions";

const initialState: AuthFormState = {};

export default function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-stone-700">
          Nouveau mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600"
        />
      </div>

      <div>
        <label htmlFor="confirmation" className="mb-1 block text-sm font-medium text-stone-700">
          Confirmer le mot de passe
        </label>
        <input
          id="confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600"
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
        {pending ? "Veuillez patienter..." : "Enregistrer le nouveau mot de passe"}
      </button>
    </form>
  );
}

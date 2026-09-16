"use client";

import { useActionState, useState } from "react";
import { login, signup, forgotPassword, type AuthFormState } from "./actions";

const initialState: AuthFormState = {};

export default function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [loginState, loginAction, loginPending] = useActionState(
    login,
    initialState
  );
  const [signupState, signupAction, signupPending] = useActionState(
    signup,
    initialState
  );
  const [forgotState, forgotAction, forgotPending] = useActionState(
    forgotPassword,
    initialState
  );

  if (mode === "forgot") {
    return (
      <div>
        <h2 className="mb-1 text-center text-lg font-semibold text-gray-900">
          Mot de passe oublié
        </h2>
        <p className="mb-6 text-center text-sm text-gray-500">
          Renseigne ton email, on t&apos;envoie un lien de réinitialisation.
        </p>

        <form action={forgotAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          {forgotState?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {forgotState.error}
            </p>
          )}

          <button
            type="submit"
            disabled={forgotPending}
            className="w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {forgotPending ? "Veuillez patienter..." : "Envoyer le lien de réinitialisation"}
          </button>

          <button
            type="button"
            onClick={() => setMode("login")}
            className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Retour à la connexion
          </button>
        </form>
      </div>
    );
  }

  const isLogin = mode === "login";
  const state = isLogin ? loginState : signupState;
  const pending = isLogin ? loginPending : signupPending;

  return (
    <div>
      <div className="mb-6 flex rounded-lg bg-gray-100 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-md py-1.5 transition ${
            isLogin ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          Connexion
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-md py-1.5 transition ${
            !isLogin ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          Inscription
        </button>
      </div>

      <form action={isLogin ? loginAction : signupAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            {isLogin && (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-xs font-medium text-gray-500 hover:text-gray-900"
              >
                Mot de passe oublié ?
              </button>
            )}
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={6}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>

        {!isLogin && (
          <div>
            <label
              htmlFor="confirmation"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Confirmer le mot de passe
            </label>
            <input
              id="confirmation"
              name="confirmation"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
        )}

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
        >
          {pending
            ? "Veuillez patienter..."
            : isLogin
              ? "Se connecter"
              : "Créer mon compte"}
        </button>
      </form>
    </div>
  );
}

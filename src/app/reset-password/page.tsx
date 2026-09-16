import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResetPasswordForm from "./reset-password-form";

/**
 * Atteinte uniquement via le lien de réinitialisation reçu par email
 * (redirectTo de forgotPassword, via /auth/confirm qui établit la
 * session avant de rediriger ici). Sans session valide, pas de sens à
 * afficher ce formulaire.
 */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/login?message=" +
        encodeURIComponent("Lien de réinitialisation invalide ou expiré.")
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold text-gray-900">
          Nouveau mot de passe
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Choisis un nouveau mot de passe pour ton compte.
        </p>
        <ResetPasswordForm />
      </div>
    </main>
  );
}

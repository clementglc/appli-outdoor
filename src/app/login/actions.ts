"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
};

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Veuillez renseigner votre email et votre mot de passe." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: traduireErreur(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/checklist");
}

export async function signup(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (!email || !password) {
    return { error: "Veuillez renseigner votre email et votre mot de passe." };
  }

  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }

  if (password !== confirmation) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Lu côté serveur uniquement (cette action est "use server") : pas
      // besoin du préfixe NEXT_PUBLIC_, qui exposerait inutilement
      // l'URL du site au bundle client.
      emailRedirectTo: `${process.env.SITE_URL ?? ""}/auth/confirm`,
    },
  });

  if (error) {
    return { error: traduireErreur(error.message) };
  }

  redirect("/login?message=Vérifiez vos emails pour confirmer votre inscription.");
}

export async function forgotPassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Veuillez renseigner votre email." };
  }

  const supabase = await createClient();
  // Supabase ne signale pas si l'email existe ou non (par souci de
  // confidentialité) — on affiche donc toujours le même message de
  // succès, qu'un compte existe ou pas, plutôt que de se fier à error.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.SITE_URL ?? ""}/auth/confirm?next=/reset-password`,
  });

  redirect(
    "/login?message=" +
      encodeURIComponent(
        "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé."
      )
  );
}

export async function updatePassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }

  if (password !== confirmation) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: traduireErreur(error.message) };
  }

  redirect("/checklist");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

function traduireErreur(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "Email ou mot de passe incorrect.",
    "User already registered": "Un compte existe déjà avec cet email.",
    "Email not confirmed": "Veuillez confirmer votre email avant de vous connecter.",
    "Auth session missing!":
      "Session expirée — redemande un lien de réinitialisation depuis la page de connexion.",
    "New password should be different from the old password.":
      "Le nouveau mot de passe doit être différent de l'ancien.",
  };
  return map[message] ?? message;
}

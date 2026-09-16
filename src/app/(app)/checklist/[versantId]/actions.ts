"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string };

export async function modifierProfilVersant(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const versantId = String(formData.get("versant_id") ?? "");
  const brut = String(formData.get("profil_km") ?? "").trim();

  if (!versantId) {
    return { error: "Versant introuvable." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let profilKm: number[] | null = null;
  if (brut) {
    const valeurs = brut
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map(Number);

    if (valeurs.some((v) => Number.isNaN(v))) {
      return {
        error:
          "Le profil doit être une liste de pentes séparées par des virgules (ex : 6.5, 7.2, 8.9).",
      };
    }
    profilKm = valeurs;
  }

  const { error } = await supabase
    .from("versants")
    .update({ profil_km: profilKm })
    .eq("id", versantId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/checklist/${versantId}`);
  revalidatePath("/checklist");
  return {};
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string };

export async function ajouterCol(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const nom = String(formData.get("nom") ?? "").trim();
  const altitudeRaw = String(formData.get("altitude_m") ?? "").trim();
  const departement = String(formData.get("departement") ?? "").trim();

  if (!nom) {
    return { error: "Le nom du col est obligatoire." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("cols").insert({
    nom,
    altitude_m: altitudeRaw ? Number(altitudeRaw) : null,
    departement: departement || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/checklist");
  revalidatePath("/ascensions");
  return {};
}

export async function ajouterVersant(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const colId = String(formData.get("col_id") ?? "");
  const nom = String(formData.get("nom") ?? "").trim();
  const villeDepart = String(formData.get("ville_depart") ?? "").trim();
  const distance = String(formData.get("distance_km") ?? "").trim();
  const denivele = String(formData.get("denivele_m") ?? "").trim();
  const penteMoyenne = String(formData.get("pente_moyenne") ?? "").trim();
  const penteMax = String(formData.get("pente_max") ?? "").trim();
  const altitudeDepart = String(formData.get("altitude_depart_m") ?? "").trim();

  if (!colId || !nom) {
    return { error: "Le col et le nom du versant sont obligatoires." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("versants").insert({
    col_id: colId,
    nom,
    ville_depart: villeDepart || null,
    altitude_depart_m: altitudeDepart ? Number(altitudeDepart) : null,
    distance_km: distance ? Number(distance) : null,
    denivele_m: denivele ? Number(denivele) : null,
    pente_moyenne: penteMoyenne ? Number(penteMoyenne) : null,
    pente_max: penteMax ? Number(penteMax) : null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/checklist");
  revalidatePath("/ascensions");
  return {};
}

export async function ajouterAscension(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const versantId = String(formData.get("versant_id") ?? "");
  const date = String(formData.get("date_ascension") ?? "");
  const commentaire = String(formData.get("commentaire") ?? "").trim();
  const lienActivite = String(formData.get("lien_activite") ?? "").trim();

  if (!versantId || !date) {
    return { error: "Le versant et la date sont obligatoires." };
  }

  if (lienActivite && !/^https?:\/\//i.test(lienActivite)) {
    return { error: "Le lien de l'activité doit commencer par http:// ou https://." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("ascensions").insert({
    user_id: user.id,
    versant_id: versantId,
    date_ascension: date,
    commentaire: commentaire || null,
    lien_activite: lienActivite || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/checklist");
  revalidatePath("/ascensions");
  return {};
}

export async function supprimerAscension(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("ascensions").delete().eq("id", id);

  revalidatePath("/checklist");
  revalidatePath("/ascensions");
}

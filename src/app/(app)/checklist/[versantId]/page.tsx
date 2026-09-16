import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDateLongue, formatDenivele, formatDistance, formatDuree, formatPente } from "@/lib/format";
import ProfilVersant from "@/components/charts/ProfilVersant";
import type { Ascension, Col, Versant } from "@/lib/types";

export default async function VersantPage({
  params,
}: {
  params: Promise<{ versantId: string }>;
}) {
  const { versantId } = await params;
  const supabase = await createClient();

  const { data: versant } = await supabase
    .from("versants")
    .select("*")
    .eq("id", versantId)
    .maybeSingle();

  if (!versant) {
    notFound();
  }

  const [{ data: col }, { data: ascensions }] = await Promise.all([
    supabase.from("cols").select("*").eq("id", versant.col_id).maybeSingle(),
    supabase
      .from("ascensions")
      .select("*")
      .eq("versant_id", versantId)
      .order("date_ascension", { ascending: false }),
  ]);

  const typedVersant = versant as Versant;
  const typedCol = col as Col | null;
  const typedAscensions = (ascensions ?? []) as Ascension[];

  const altitudeSommet =
    typedVersant.altitude_depart_m != null && typedVersant.denivele_m != null
      ? typedVersant.altitude_depart_m + typedVersant.denivele_m
      : (typedCol?.altitude_m ?? null);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/checklist" className="text-sm font-medium text-stone-500 hover:text-orange-700">
          ← Retour à la checklist
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-stone-900">{typedCol?.nom ?? "Col"}</h1>
        <p className="text-orange-700">{typedVersant.nom}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCarte label="Distance" valeur={formatDistance(typedVersant.distance_km)} />
        <StatCarte label="Dénivelé" valeur={formatDenivele(typedVersant.denivele_m)} />
        <StatCarte label="Pente moyenne" valeur={formatPente(typedVersant.pente_moyenne)} />
        <StatCarte label="Pente max" valeur={formatPente(typedVersant.pente_max)} />
        {typedVersant.ville_depart && (
          <StatCarte label="Départ" valeur={typedVersant.ville_depart} />
        )}
        {typedVersant.altitude_depart_m != null && (
          <StatCarte label="Altitude départ" valeur={`${typedVersant.altitude_depart_m} m`} />
        )}
        {altitudeSommet != null && (
          <StatCarte label="Altitude sommet" valeur={`${altitudeSommet} m`} />
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-stone-900">Profil kilomètre par kilomètre</h2>
        {typedVersant.profil_km && typedVersant.profil_km.length > 0 ? (
          <ProfilVersant
            profilKm={typedVersant.profil_km}
            altitudeDepart={typedVersant.altitude_depart_m}
            distanceKm={typedVersant.distance_km}
          />
        ) : (
          <p className="text-sm text-stone-500">
            Profil détaillé non renseigné pour l&apos;instant.
          </p>
        )}
      </div>

      {typedAscensions.length > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-stone-900">Tes ascensions de ce versant</h2>
          <ul className="space-y-1.5 text-sm text-stone-700">
            {typedAscensions.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                <span>
                  {formatDateLongue(a.date_ascension)}
                  {a.duree_minutes ? ` · ${formatDuree(a.duree_minutes)}` : ""}
                  {a.commentaire ? ` · ${a.commentaire}` : ""}
                </span>
                {a.lien_activite && (
                  <a
                    href={a.lien_activite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-orange-700 hover:text-orange-800"
                  >
                    Voir l&apos;activité ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCarte({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <p className="text-xs text-stone-400">{label}</p>
      <p className="text-sm font-medium text-stone-900">{valeur}</p>
    </div>
  );
}

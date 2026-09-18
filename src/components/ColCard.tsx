import Link from "next/link";
import { formatDateLongue, formatDenivele, formatDistance, formatPente } from "@/lib/format";
import { SEUIL_BADGE_HABITUE, type ColAvecStatut } from "@/lib/cols";

/** Carte "collection" façon Been : icône et texte en couleur pour un col
 * déjà gravi, grisés/atténués sinon — pour donner cet effet de collection
 * qui se remplit au fil des ascensions. */
export default function ColCard({ col }: { col: ColAvecStatut }) {
  return (
    <div className={`rounded-2xl p-4 shadow-sm ${col.gravi ? "bg-white" : "bg-stone-100"}`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            col.gravi ? "bg-orange-100" : "bg-stone-200"
          }`}
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M2 19L8.5 7l3.2 4.6L14.5 8 22 19H2Z"
              fill={col.gravi ? "#ea580c" : "#a8a29e"}
            />
          </svg>
        </span>
        <div className="flex items-center gap-1">
          {col.nbAscensions >= SEUIL_BADGE_HABITUE && (
            <span
              className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800"
              title={`Gravi ${col.nbAscensions} fois — badge habitué`}
            >
              <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l2.9 6.3 6.9.9-5 4.9 1.2 6.9L12 17.6l-6 3.4 1.2-6.9-5-4.9 6.9-.9L12 2z" />
              </svg>
              {col.nbAscensions}
            </span>
          )}
          {col.gravi && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
              ✓
            </span>
          )}
        </div>
      </div>

      <p className={`font-medium ${col.gravi ? "text-stone-900" : "text-stone-500"}`}>{col.nom}</p>
      {col.altitude_m != null && (
        <p className="text-xs text-stone-400">{col.altitude_m} m</p>
      )}

      {col.versantsStatut.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t border-stone-100 pt-3">
          {col.versants.map((versant) => {
            const statut = col.versantsStatut.find((v) => v.versantId === versant.id);
            return (
              <li key={versant.id}>
                <Link
                  href={`/checklist/${versant.id}`}
                  className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 rounded-lg py-1 text-sm hover:bg-orange-50"
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        statut?.gravi ? "bg-emerald-500" : "bg-stone-300"
                      }`}
                    />
                    <span className={statut?.gravi ? "text-stone-900" : "text-stone-500"}>
                      {versant.nom}
                    </span>
                  </span>
                  <span className="text-xs text-stone-400">
                    {formatDistance(versant.distance_km)} · {formatDenivele(versant.denivele_m)} ·{" "}
                    {formatPente(versant.pente_moyenne)}
                    {statut?.gravi && statut.derniereAscension && (
                      <> · gravi le {formatDateLongue(statut.derniereAscension.date_ascension)}</>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

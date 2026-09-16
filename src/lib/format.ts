export function formatDateLongue(dateIso: string): string {
  return new Date(`${dateIso}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDenivele(m: number | null): string {
  return m == null ? "—" : `${m.toLocaleString("fr-FR")} m D+`;
}

export function formatDistance(km: number | null): string {
  return km == null ? "—" : `${km.toLocaleString("fr-FR")} km`;
}

export function formatPente(pourcent: number | null): string {
  return pourcent == null ? "—" : `${pourcent.toLocaleString("fr-FR")} %`;
}

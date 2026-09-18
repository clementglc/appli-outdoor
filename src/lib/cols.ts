import type { Ascension, ColAvecVersants } from "./types";

export type VersantAvecStatut = {
  versantId: string;
  gravi: boolean;
  nbAscensions: number;
  derniereAscension: Ascension | null;
};

export type ColAvecStatut = ColAvecVersants & {
  gravi: boolean;
  nbAscensions: number;
  versantsStatut: VersantAvecStatut[];
};

/** Nombre d'ascensions d'un même col (tous versants confondus) à partir
 * duquel un badge "habitué" est débloqué sur ce col. */
export const SEUIL_BADGE_HABITUE = 5;

/**
 * Un col est considéré "gravi" dès qu'au moins un de ses versants l'a été
 * (convention usuelle : peu importe le côté emprunté). Le détail par
 * versant reste affiché pour qui vise aussi tous les versants.
 */
export function colsAvecStatut(
  cols: ColAvecVersants[],
  ascensions: Ascension[]
): ColAvecStatut[] {
  const parVersant = new Map<string, Ascension[]>();
  for (const ascension of ascensions) {
    const liste = parVersant.get(ascension.versant_id) ?? [];
    liste.push(ascension);
    parVersant.set(ascension.versant_id, liste);
  }

  return cols.map((col) => {
    const versantsStatut: VersantAvecStatut[] = col.versants.map((versant) => {
      const liste = (parVersant.get(versant.id) ?? []).slice().sort((a, b) =>
        b.date_ascension.localeCompare(a.date_ascension)
      );
      return {
        versantId: versant.id,
        gravi: liste.length > 0,
        nbAscensions: liste.length,
        derniereAscension: liste[0] ?? null,
      };
    });

    return {
      ...col,
      gravi: versantsStatut.some((v) => v.gravi),
      nbAscensions: versantsStatut.reduce((somme, v) => somme + v.nbAscensions, 0),
      versantsStatut,
    };
  });
}

export function progression(cols: ColAvecStatut[]): {
  colsGravis: number;
  colsTotal: number;
  versantsGravis: number;
  versantsTotal: number;
} {
  let versantsGravis = 0;
  let versantsTotal = 0;
  for (const col of cols) {
    versantsTotal += col.versantsStatut.length;
    versantsGravis += col.versantsStatut.filter((v) => v.gravi).length;
  }
  return {
    colsGravis: cols.filter((c) => c.gravi).length,
    colsTotal: cols.length,
    versantsGravis,
    versantsTotal,
  };
}

export type DefiDepartement = {
  departement: string;
  colsGravis: number;
  colsTotal: number;
  complet: boolean;
};

/** Défi "département complet" : débloqué quand tous les cols d'un même
 * département ont été gravis (au moins un versant chacun). */
export function defisDepartements(cols: ColAvecStatut[]): DefiDepartement[] {
  const groupes = new Map<string, ColAvecStatut[]>();
  for (const col of cols) {
    const cle = col.departement ?? "Sans département";
    const liste = groupes.get(cle) ?? [];
    liste.push(col);
    groupes.set(cle, liste);
  }

  return Array.from(groupes.entries())
    .map(([departement, colsDuGroupe]) => {
      const colsGravis = colsDuGroupe.filter((c) => c.gravi).length;
      return {
        departement,
        colsGravis,
        colsTotal: colsDuGroupe.length,
        complet: colsGravis === colsDuGroupe.length,
      };
    })
    .sort((a, b) => a.departement.localeCompare(b.departement));
}

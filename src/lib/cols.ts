import type { Ascension, ColAvecVersants } from "./types";

export type VersantAvecStatut = {
  versantId: string;
  gravi: boolean;
  derniereAscension: Ascension | null;
};

export type ColAvecStatut = ColAvecVersants & {
  gravi: boolean;
  versantsStatut: VersantAvecStatut[];
};

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
        derniereAscension: liste[0] ?? null,
      };
    });

    return {
      ...col,
      gravi: versantsStatut.some((v) => v.gravi),
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

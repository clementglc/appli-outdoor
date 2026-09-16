export type Versant = {
  id: string;
  col_id: string;
  nom: string;
  ville_depart: string | null;
  altitude_depart_m: number | null;
  distance_km: number | null;
  denivele_m: number | null;
  pente_moyenne: number | null;
  pente_max: number | null;
  created_at: string;
};

export type Col = {
  id: string;
  nom: string;
  altitude_m: number | null;
  departement: string | null;
  created_at: string;
};

export type ColAvecVersants = Col & {
  versants: Versant[];
};

export type Ascension = {
  id: string;
  user_id: string;
  versant_id: string;
  date_ascension: string;
  commentaire: string | null;
  trace_path: string | null;
  trace_nom_original: string | null;
  created_at: string;
};

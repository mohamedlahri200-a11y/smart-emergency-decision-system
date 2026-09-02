// src/types/examen.types.ts

/** Statistiques communes aux dashboards Radiologue et Biologiste. */
export interface ExamenDashboardStats {
    enAttente: number;
    enCours: number;
    terminesAujourdHui: number;
    casPrioritaires: number;
    tempsMoyenTraitementMinutes: number | null;
}
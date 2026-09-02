// src/types/medecin.types.ts
export interface MedecinDashboardStats {
    enAttenteConsultation: number;
    prisEnCharge: number;
    casCritiques: number;
    necessitantHospitalisation: number;
    sortiesAujourdHui: number;
    tempsAttenteMoyenMinutes: number | null;
}

export interface PatientAConsulter {
    id: number;
    numeroDossier: string;
    nomComplet: string;
    age: number;
    sexe: string;
    heureArrivee: string;
    decisionId: number;
    classePredite: string;
    scorePrediction: number;
    recommandationService: string | null;
    dateDecision: string;
}
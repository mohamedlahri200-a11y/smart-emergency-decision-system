// src/services/decisionIAService.ts
import apiClient from "./apiClient";
import { CouleurTriage, NiveauUrgence, type OrientationIAResult } from "../types/infirmier.types";

/** Contribution d'une variable clinique à la décision (Explainable AI / SHAP). */
export interface FeatureContributionDTO {
    feature: string;
    value: string;
    impact: number;
    direction: "positive" | "negative" | string;
}

/** Explication détaillée de la décision IA (méthode XAI + facteurs influents). */
export interface AIExplanationDTO {
    method: string;
    summary: string;
    top_features: FeatureContributionDTO[];
}

export interface DecisionIAResponseDTO {
    id: number;
    patientId: number;
    patientNomComplet: string;
    triageId: number;
    medecinValidateurId: number | null;
    medecinValidateurNomComplet: string | null;
    scorePrediction: number;
    classePredite: string;
    recommandationService: string | null;
    explication: string;
    statutValidation: "EN_ATTENTE" | "VALIDEE" | "REJETEE" | "MODIFIEE";
    commentaireMedecin: string | null;
    dateDecision: string;
    dateValidation: string | null;
    alertesActives: string[] | null;

    examensRecommandes: string[] | null;
    analysesRecommandees: string[] | null;
    risqueClinique: string | null;
    risqueDeterioration: "Faible" | "Modere" | "Eleve" | "Critique" | string | null;
    dureeSejourEstimeeHeures: number | null;
    tempsAttenteEstimeMinutes: number | null;
    facteursRisqueIdentifies: string[] | null;
    protocolesRecommandes: string[] | null;
    recommandationsPatient: string[] | null;
    explicationDetaillee: AIExplanationDTO | null;
    versionModele: string | null;
    scoreConfiance: number | null;
}

export function mapClasseToCouleur(classePredite: string): CouleurTriage {
    switch (classePredite) {
        case "Rouge": return CouleurTriage.ROUGE;
        case "Orange": return CouleurTriage.ORANGE;
        case "Jaune": return CouleurTriage.JAUNE;
        case "Vert": return CouleurTriage.VERT;
        case "Bleu":
        default: return CouleurTriage.BLEU;
    }
}

export function mapClasseToNiveau(classePredite: string): NiveauUrgence {
    switch (classePredite) {
        case "Rouge": return NiveauUrgence.NIVEAU_I;
        case "Orange":
        case "Jaune": return NiveauUrgence.NIVEAU_II;
        default: return NiveauUrgence.NIVEAU_III;
    }
}

export interface AnalyseComplementairePayload {
    crp?: number;
    procalcitonine?: number;
    leucocytes?: number;
    hemoglobine?: number;
    creatinine?: number;
    troponine?: number;
    lactate?: number;
    glycemieLabo?: number;
    imagerieAnomalie?: boolean;
    imagerieDetails?: string;
}

export const decisionIAService = {
    analyser: async (triageId: number): Promise<OrientationIAResult> => {
        const { data } = await apiClient.post<DecisionIAResponseDTO>("/decisions-ia", { triageId });
        return {
            scorePrediction: Math.round(data.scorePrediction),
            niveauUrgence: mapClasseToNiveau(data.classePredite),
            couleurTriage: mapClasseToCouleur(data.classePredite),
            explication: data.explication,
            alertesActives: data.alertesActives ?? [],
        };
    },

    analyserComplementaire: async (
        triageId: number,
        payload: AnalyseComplementairePayload
    ): Promise<DecisionIAResponseDTO> => {
        const { data } = await apiClient.post<DecisionIAResponseDTO>(
            `/decisions-ia/triage/${triageId}/analyse-complementaire`,
            payload
        );
        return data;
    },

    getAll: async (): Promise<DecisionIAResponseDTO[]> => {
        const { data } = await apiClient.get<DecisionIAResponseDTO[]>("/decisions-ia");
        return data;
    },

    getHistoriqueByPatient: async (patientId: number): Promise<DecisionIAResponseDTO[]> => {
        const { data } = await apiClient.get<DecisionIAResponseDTO[]>(`/decisions-ia/patient/${patientId}/historique`);
        return data;
    },

    valider: async (
        decisionId: number,
        medecinValidateurId: number,
        statutValidation: "VALIDEE" | "REJETEE" | "MODIFIEE",
        commentaireMedecin?: string
    ): Promise<DecisionIAResponseDTO> => {
        const { data } = await apiClient.put<DecisionIAResponseDTO>(`/decisions-ia/${decisionId}/validation`, {
            medecinValidateurId,
            statutValidation,
            commentaireMedecin,
        });
        return data;
    },
};
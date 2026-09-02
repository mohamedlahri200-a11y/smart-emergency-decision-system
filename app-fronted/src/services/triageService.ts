// src/services/triageService.ts
import apiClient from "./apiClient";
import type {
    ArriveeData,
    EvaluationGeneraleData,
    SignesVitauxData,
} from "../types/infirmier.types";

// DTO strictement aligné sur TriageRequestDTO.java existant (non modifié).
export interface TriageRequestPayload {
    patientId: number;
    infirmierId: number;
    poids: number;
    taille: number;
    frequenceRespiratoire: number;
    saturationOxygene: number;
    oxygenoDependant: boolean;
    temperature: number;
    pressionArterielleSystolique: number;
    pressionArterielleDiastolique: number;
    frequenceCardiaque: number;
    glycemie?: number;
    niveauConscience: "ALERTE" | "REACTION_VOIX" | "REACTION_DOULEUR" | "INCONSCIENT";
    symptomes?: string;
    douleurIntensite?: number;
}

export interface TriageResponseDTO {
    id: number;
    patientId: number;
    patientNomComplet: string;
    infirmierId: number;
    infirmierNomComplet: string;
    frequenceRespiratoire: number;
    saturationOxygene: number;
    oxygenoDependant: boolean;
    temperature: number;
    pressionArterielleSystolique: number;
    frequenceCardiaque: number;
    niveauConscience: string;
    symptomes: string | null;
    douleurIntensite: number | null;
    scoreNews2: number;
    niveauRisqueNews2: string;
    niveauEsi: number;
    priorite: string;
    dateTriage: string;
}

/**
 * Encode dans le champ libre "symptomes" les informations de la fiche
 * (mode d'arrivée, accompagnement, mise en condition, détresse vitale,
 * GCS, ECG) qui n'ont pas encore de colonne dédiée côté backend, afin de
 * ne rien perdre en base tout en gardant le schéma actuel intact.
 */
function encodeTriageExtra(
    arrivee: ArriveeData,
    evaluation: EvaluationGeneraleData,
    vitaux: SignesVitauxData
): string {
    const details = Object.entries(arrivee.miseEnConditionDetails)
        .filter(([key, val]) => key !== "autre" && val === true)
        .map(([key]) => key)
        .concat(arrivee.miseEnConditionDetails.autre ? [arrivee.miseEnConditionDetails.autre] : []);

    const meta = [
        arrivee.modeArrivee ? `ModeArrivee: ${arrivee.modeArrivee}` : null,
        arrivee.accompagnementPro ? `Accompagnement: ${arrivee.accompagnementPro}` : null,
        arrivee.miseEnCondition ? `MiseEnCondition: ${details.join(", ") || "oui"}` : null,
        evaluation.detresseVitale ? "DETRESSE_VITALE: OUI" : null,
        vitaux.glasgow !== null ? `GCS: ${vitaux.glasgow}` : null,
        vitaux.ecg ? `ECG: ${vitaux.ecg}` : null,
    ].filter(Boolean);

    return `[${meta.join(" | ")}] Motif: ${arrivee.motifConsultation} — ${arrivee.descriptionEtat}`;
}

export function toTriagePayload(
    patientId: number,
    infirmierId: number,
    arrivee: ArriveeData,
    evaluation: EvaluationGeneraleData,
    vitaux: SignesVitauxData
): TriageRequestPayload {
    const niveauConscience =
        evaluation.conscienceNormale === true ? "ALERTE" : "REACTION_VOIX";

    return {
        patientId,
        infirmierId,
        poids: vitaux.poids ?? 0,
        taille: vitaux.taille ?? 0,
        frequenceRespiratoire: vitaux.frequenceRespiratoire ?? 0,
        saturationOxygene: vitaux.saturationO2 ?? 0,
        oxygenoDependant: arrivee.miseEnConditionDetails.oxygenotherapie,
        temperature: vitaux.temperature ?? 0,
        pressionArterielleSystolique: vitaux.taSystolique ?? 0,
        pressionArterielleDiastolique: vitaux.taDiastolique ?? 0,
        frequenceCardiaque: vitaux.frequenceCardiaque ?? 0,
        glycemie: vitaux.dextro ?? undefined,
        niveauConscience,
        symptomes: encodeTriageExtra(arrivee, evaluation, vitaux),
        douleurIntensite: vitaux.eva ?? undefined,
    };
}

export const triageService = {
    create: async (payload: TriageRequestPayload): Promise<TriageResponseDTO> => {
        const { data } = await apiClient.post<TriageResponseDTO>("/triages", payload);
        return data;
    },

    getAll: async (): Promise<TriageResponseDTO[]> => {
        const { data } = await apiClient.get<TriageResponseDTO[]>("/triages");
        return data;
    },

    getHistoriqueByPatient: async (patientId: number): Promise<TriageResponseDTO[]> => {
        const { data } = await apiClient.get<TriageResponseDTO[]>(`/triages/patient/${patientId}/historique`);
        return data;
    },
};
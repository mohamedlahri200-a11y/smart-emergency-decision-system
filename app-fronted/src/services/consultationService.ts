// src/services/consultationService.ts
import apiClient from "./apiClient";
import type { ExamenResponseDTO } from "./examenService";

export interface ConsultationRequestPayload {
    patientId: number;
    medecinId: number;
    motif: string;
    diagnostic?: string;
    observationsCliniques?: string;
}

export interface ConsultationResponseDTO {
    id: number;
    patientId: number;
    patientNomComplet: string;
    medecinId: number;
    medecinNomComplet: string;
    motif: string;
    diagnostic: string | null;
    observationsCliniques: string | null;
    examens: ExamenResponseDTO[];
    dateConsultation: string;
}

export const consultationService = {
    create: async (payload: ConsultationRequestPayload): Promise<ConsultationResponseDTO> => {
        const { data } = await apiClient.post<ConsultationResponseDTO>("/consultations", payload);
        return data;
    },

    getHistoriqueByPatient: async (patientId: number): Promise<ConsultationResponseDTO[]> => {
        const { data } = await apiClient.get<ConsultationResponseDTO[]>(`/consultations/patient/${patientId}/historique`);
        return data;
    },
};
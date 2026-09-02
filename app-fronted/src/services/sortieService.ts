// src/services/sortieService.ts
import apiClient from "./apiClient";

export interface SortieResponseDTO {
    id: number;
    patientId: number;
    patientNomComplet: string;
    consultationId: number;
    medecinId: number;
    medecinNomComplet: string;
    typeSortie: string;
    evolutionPatient: string;
    observationsSortie: string | null;
    dateSortie: string;
}

export const sortieService = {
    getAll: async (): Promise<SortieResponseDTO[]> => {
        const { data } = await apiClient.get<SortieResponseDTO[]>("/sorties");
        return data;
    },

    getHistoriqueByPatient: async (patientId: number): Promise<SortieResponseDTO[]> => {
        const { data } = await apiClient.get<SortieResponseDTO[]>(`/sorties/patient/${patientId}/historique`);
        return data;
    },
};
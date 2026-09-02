// src/services/examenService.ts
import apiClient from "./apiClient";

export interface ExamenResponseDTO {
    id: number;
    consultationId: number;
    patientId: number;
    patientNomComplet: string;
    medecinPrescripteurId: number;
    medecinPrescripteurNomComplet: string;
    typeExamen: string;
    categorieExamen: "BIOLOGIE" | "IMAGERIE";
    description: string | null;
    statutExamen: "PRESCRIT" | "EN_COURS" | "TERMINE" | "ANNULE";
    resultat: string | null;
    cheminImage: string | null;
    compteRenduCritique: boolean;
    motsClesCritiquesDetectes: string[];
    datePrescription: string;
    dateResultat: string | null;
}

export interface ExamenRequestPayload {
    consultationId: number;
    typeExamen: string;
    categorieExamen: "BIOLOGIE" | "IMAGERIE";
    description?: string;
}

export interface ImagingAnalysisResponseDTO {
    modeleDisponible: boolean;
    classePredite: string | null;
    confiance: number | null;
    probabilites: Record<string, number>;
    disclaimer: string;
}

export const examenService = {
    prescrire: async (payload: ExamenRequestPayload): Promise<ExamenResponseDTO> => {
        const { data } = await apiClient.post<ExamenResponseDTO>("/examens", payload);
        return data;
    },

    analyserImageAvecCNN: async (id: number): Promise<ImagingAnalysisResponseDTO> => {
        const { data } = await apiClient.post<ImagingAnalysisResponseDTO>(`/examens/${id}/analyser-image`, {});
        return data;
    },

    getAll: async (categorie?: "BIOLOGIE" | "IMAGERIE"): Promise<ExamenResponseDTO[]> => {
        const { data } = await apiClient.get<ExamenResponseDTO[]>("/examens", {
            params: categorie ? { categorie } : undefined,
        });
        return data;
    },

    getById: async (id: number): Promise<ExamenResponseDTO> => {
        const { data } = await apiClient.get<ExamenResponseDTO>(`/examens/${id}`);
        return data;
    },

    getByConsultation: async (consultationId: number): Promise<ExamenResponseDTO[]> => {
        const { data } = await apiClient.get<ExamenResponseDTO[]>(`/examens/consultation/${consultationId}`);
        return data;
    },

    getByPatient: async (patientId: number): Promise<ExamenResponseDTO[]> => {
        const { data } = await apiClient.get<ExamenResponseDTO[]>(`/examens/patient/${patientId}`);
        return data;
    },

    demarrer: async (id: number): Promise<ExamenResponseDTO> => {
        const { data } = await apiClient.put<ExamenResponseDTO>(`/examens/${id}/demarrer`, {});
        return data;
    },

    uploaderImage: async (id: number, fichier: File): Promise<ExamenResponseDTO> => {
        const formData = new FormData();
        formData.append("fichier", fichier);
        const { data } = await apiClient.post<ExamenResponseDTO>(`/examens/${id}/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },

    enregistrerResultat: async (id: number, resultat: string): Promise<ExamenResponseDTO> => {
        const { data } = await apiClient.put<ExamenResponseDTO>(`/examens/${id}/resultat`, { resultat });
        return data;
    },
};
// src/services/patientService.ts
import apiClient from "./apiClient";
import type { AdministratifData } from "../types/infirmier.types";

export interface PatientRequestPayload {
    nom: string;
    prenom: string;
    cin?: string;
    dateNaissance: string;
    sexe: "HOMME" | "FEMME";
    telephone: string;
    adresse?: string;
    groupeSanguin?: string;
    antecedents?: string;
    allergies?: string;
    personneAContacter: string;
    telephoneContact: string;
}

export interface PatientResponseDTO {
    id: number;
    numeroDossier: string;
    nom: string;
    prenom: string;
    dateNaissance: string;
    age: number;
    sexe: string;
    telephone: string;
    adresse?: string;
    dateEnregistrement: string;
}

/**
 * Le backend n'a pas encore de colonnes dédiées pour ip / origine /
 * couvertureMedicale. En attendant une éventuelle évolution du schéma,
 * ces informations sont conservées lisibles en base en les encodant
 * dans le champ libre "adresse" (non utilisé autrement par la fiche CHU).
 */
function encodeAdministratifExtra(data: AdministratifData): string {
    const parts = [
        data.ip ? `IP: ${data.ip}` : null,
        data.origine ? `Origine: ${data.origine}` : null,
        data.couvertureMedicale ? `Couverture: ${data.couvertureMedicale}` : null,
    ].filter(Boolean);
    return parts.join(" | ");
}

export function toPatientPayload(data: AdministratifData): PatientRequestPayload {
    return {
        nom: data.nom,
        prenom: data.prenom,
        dateNaissance: data.dateNaissance,
        sexe: data.sexe as "HOMME" | "FEMME",
        telephone: data.telephone,
        adresse: encodeAdministratifExtra(data),
        personneAContacter: data.personneAContacter,
        telephoneContact: data.telephoneContact,
    };
}

export const patientService = {
    create: async (payload: PatientRequestPayload): Promise<PatientResponseDTO> => {
        const { data } = await apiClient.post<PatientResponseDTO>("/patients", payload);
        return data;
    },

    getAll: async (): Promise<PatientResponseDTO[]> => {
        const { data } = await apiClient.get<PatientResponseDTO[]>("/patients");
        return data;
    },

    getById: async (id: number): Promise<PatientResponseDTO> => {
        const { data } = await apiClient.get<PatientResponseDTO>(`/patients/${id}`);
        return data;
    },
};

export function calculerAge(dateNaissance: string): number {
    const dob = new Date(dateNaissance);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}
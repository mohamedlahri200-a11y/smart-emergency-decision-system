// src/types/chefService.types.ts

export interface ChefServiceStats {
    totalPatients: number;
    admissionsAujourdHui: number;
    enAttenteConsultation: number;
    hospitalises: number;
    sortiesAujourdHui: number;
    casCritiques: number;
}

export interface RepartitionPriorite {
    priorite: string;
    label: string;
    total: number;
    couleur: string;
}
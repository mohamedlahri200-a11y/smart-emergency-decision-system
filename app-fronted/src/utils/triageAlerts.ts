// src/utils/triageAlerts.ts
import type { SignesVitauxData } from "../types/infirmier.types";

export interface VitalAlert {
    champ: string;
    message: string;
}

export function calculerIMC(poids: number | null, taille: number | null): number | null {
    if (!poids || !taille) return null;
    const tailleM = taille / 100;
    return Math.round((poids / (tailleM * tailleM)) * 10) / 10;
}

export function detecterAlertes(vitaux: SignesVitauxData): VitalAlert[] {
    const alertes: VitalAlert[] = [];

    if (vitaux.temperature !== null && vitaux.temperature >= 39) {
        alertes.push({ champ: "temperature", message: "Température anormalement élevée (≥ 39°C)" });
    }
    if (vitaux.saturationO2 !== null && vitaux.saturationO2 < 92) {
        alertes.push({ champ: "saturationO2", message: "Saturation en oxygène très faible (< 92%)" });
    }
    if (vitaux.taSystolique !== null && vitaux.taSystolique < 90) {
        alertes.push({ champ: "taSystolique", message: "Hypotension sévère (TA systolique < 90 mmHg)" });
    }
    if (vitaux.glasgow !== null && vitaux.glasgow < 8) {
        alertes.push({ champ: "glasgow", message: "Score de Glasgow inférieur à 8 — conscience altérée" });
    }
    if (vitaux.frequenceCardiaque !== null && (vitaux.frequenceCardiaque > 130 || vitaux.frequenceCardiaque < 40)) {
        alertes.push({ champ: "frequenceCardiaque", message: "Fréquence cardiaque très anormale" });
    }

    return alertes;
}
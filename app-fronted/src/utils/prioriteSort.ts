// src/utils/prioriteSort.ts
import type { PatientListItem } from "../types/infirmier.types";

/**
 * Ordre de gravité clinique, du plus urgent au moins urgent.
 * Un patient "non trié" (couleur inconnue) est classé juste après Orange :
 * tant qu'il n'a pas été évalué, son risque est incertain et doit être
 * traité en priorité par l'infirmier, sans pour autant dépasser un cas
 * Rouge/Orange déjà confirmé par l'IA.
 */
export const prioriteOrder: Record<string, number> = {
    ROUGE: 0,
    ORANGE: 1,
    NON_TRIE: 2,
    JAUNE: 3,
    VERT: 4,
    BLEU: 5,
};

/** Trie une liste de patients par priorité clinique (le plus urgent en premier). */
export function trierParPriorite(patients: PatientListItem[]): PatientListItem[] {
    return [...patients].sort((a, b) => {
        const rangA = prioriteOrder[a.couleurTriage ?? "NON_TRIE"] ?? 99;
        const rangB = prioriteOrder[b.couleurTriage ?? "NON_TRIE"] ?? 99;
        if (rangA !== rangB) return rangA - rangB;
        return a.heureArrivee.localeCompare(b.heureArrivee);
    });
}
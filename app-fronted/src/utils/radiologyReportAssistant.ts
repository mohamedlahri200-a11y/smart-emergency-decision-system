// src/utils/radiologyReportAssistant.ts

const MOTS_CLES_CRITIQUES = [
    "pneumothorax", "hemorragie", "hemorragique", "hematome", "avc",
    "accident vasculaire cerebral", "ischemie", "infarctus", "embolie",
    "fracture deplacee", "fracture ouverte", "epanchement massif",
    "dissection aortique", "rupture", "perforation", "occlusion",
    "engagement cerebral", "oedeme cerebral", "tamponnade",
    "hyperkaliemie", "hypoglycemie severe", "acidose severe",
    "insuffisance renale aigue", "leucocytose majeure",
    "trouble de la coagulation", "cid", "choc septique",
    "troponine elevee", "lactate eleve", "anemie severe",
];

function normaliser(texte: string): string {
    return texte
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

/** Détecte en direct les mots-clés critiques présents dans un texte (retour visuel immédiat). */
export function detecterMotsClesCritiques(texte: string): string[] {
    if (!texte) return [];
    const texteNormalise = normaliser(texte);
    return MOTS_CLES_CRITIQUES.filter((motCle) => texteNormalise.includes(normaliser(motCle)));
}

/**
 * Structure des observations brutes en compte-rendu standardisé
 * (Technique / Résultats / Conclusion). Purement du formatage — n'invente
 * aucune information médicale non fournie par le radiologue/biologiste.
 */
export function structurerCompteRendu(observationsBrutes: string, typeExamen: string): string {
    const observations = observationsBrutes.trim();
    if (!observations) return "";

    const motsCles = detecterMotsClesCritiques(observations);
    const conclusion = motsCles.length > 0
        ? `Signe(s) devant faire l'objet d'une prise en charge rapide : ${motsCles.join(", ")}. Corrélation clinique recommandée.`
        : "Aucun signe de gravité identifié dans les termes saisis. Corrélation clinique recommandée si évolution.";

    return [
        `TECHNIQUE`,
        `${typeExamen}.`,
        ``,
        `RÉSULTATS`,
        observations,
        ``,
        `CONCLUSION`,
        conclusion,
    ].join("\n");
}
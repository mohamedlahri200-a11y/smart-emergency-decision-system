package com.chu.appbackend.ai;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Détecteur déterministe de mots-clés cliniques critiques dans le texte
 * libre d'un compte-rendu d'examen (imagerie ou biologie).
 *
 * Il ne s'agit PAS d'un modèle d'apprentissage automatique : c'est une
 * recherche de termes médicaux prédéfinis, insensible à la casse et aux
 * accents, dont le rôle est d'alerter automatiquement le médecin
 * urgentiste lorsqu'un radiologue ou un biologiste rédige un compte-rendu
 * mentionnant un signe de gravité, sans attendre qu'il consulte
 * manuellement le dossier.
 */
public final class ClinicalKeywordDetector {

    private ClinicalKeywordDetector() {
    }

    private static final List<String> MOTS_CLES_CRITIQUES = List.of(
            // Urgences vitales / imagerie
            "pneumothorax", "hemorragie", "hemorragique", "hematome", "avc",
            "accident vasculaire cerebral", "ischemie", "infarctus", "embolie",
            "fracture deplacee", "fracture ouverte", "epanchement massif",
            "dissection aortique", "rupture", "perforation", "occlusion",
            "engagement cerebral", "oedeme cerebral", "tamponnade",

            // Urgences vitales / biologie
            "hyperkaliemie", "hypoglycemie severe", "acidose severe",
            "insuffisance renale aigue", "leucocytose majeure",
            "trouble de la coagulation", "cid", "choc septique",
            "troponine elevee", "lactate eleve", "anemie severe"
    );

    /** Normalise le texte (minuscules, sans accents) pour une comparaison fiable. */
    private static String normaliser(String texte) {
        String sansAccents = Normalizer.normalize(texte, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return sansAccents.toLowerCase(Locale.FRENCH);
    }

    /**
     * Analyse un compte-rendu et renvoie la liste des mots-clés critiques
     * détectés (liste vide si aucun signe de gravité identifié).
     */
    public static List<String> detecter(String compteRendu) {
        List<String> detectes = new ArrayList<>();
        if (compteRendu == null || compteRendu.isBlank()) {
            return detectes;
        }
        String texteNormalise = normaliser(compteRendu);
        for (String motCle : MOTS_CLES_CRITIQUES) {
            if (texteNormalise.contains(normaliser(motCle))) {
                detectes.add(motCle);
            }
        }
        return detectes;
    }
}
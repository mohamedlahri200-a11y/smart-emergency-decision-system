package com.chu.appbackend.util;

import java.time.LocalDate;
import java.time.Period;

/**
 * Utilitaire de calcul de l'âge d'un patient à partir de sa date de
 * naissance, requis car l'entité Patient stocke dateNaissance et non
 * un champ age directement (l'âge exact est nécessaire pour le
 * microservice IA).
 */
public final class AgeCalculator {

    private AgeCalculator() {
    }

    /**
     * Calcule l'âge en années révolues à partir d'une date de naissance.
     *
     * @param dateNaissance date de naissance du patient
     * @return âge en années
     */
    public static int calculateAge(LocalDate dateNaissance) {
        if (dateNaissance == null) {
            throw new IllegalArgumentException("La date de naissance du patient est requise pour l'évaluation IA.");
        }
        return Period.between(dateNaissance, LocalDate.now()).getYears();
    }
}
package com.chu.appbackend.entity;

/**
 * Niveau de priorité attribué à l'issue du triage, déterminant l'ordre
 * de prise en charge médicale du patient.
 */
public enum PrioriteTriage {

    /** Urgence vitale immédiate (ESI 1 / NEWS2 critique). */
    P1_VITALE,

    /** Urgence majeure, prise en charge rapide requise. */
    P2_MAJEURE,

    /** Urgence relative, prise en charge dans un délai raisonnable. */
    P3_MODEREE,

    /** Urgence mineure, peut attendre. */
    P4_MINEURE,

    /** Non urgent, orientable vers consultation classique. */
    P5_NON_URGENTE
}
package com.chu.appbackend.entity;

/**
 * Évolution clinique observée du patient au moment de sa sortie,
 * par rapport à son état à l'admission.
 */
public enum EvolutionPatient {
    AMELIORE,
    STABLE,
    AGGRAVE,
    DECEDE
}
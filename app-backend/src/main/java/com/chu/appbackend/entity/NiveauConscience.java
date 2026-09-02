package com.chu.appbackend.entity;

/**
 * Échelle AVPU (Alert, Voice, Pain, Unresponsive) utilisée dans le calcul du score NEWS2
 * pour évaluer le niveau de conscience du patient.
 */
public enum NiveauConscience {
    ALERTE,
    REACTION_VOIX,
    REACTION_DOULEUR,
    INCONSCIENT
}

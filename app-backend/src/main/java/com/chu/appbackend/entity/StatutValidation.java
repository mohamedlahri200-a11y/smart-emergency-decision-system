package com.chu.appbackend.entity;

/**
 * Statut du cycle de validation médicale d'une décision proposée par l'IA.
 * Une prédiction IA ne devient jamais une décision médicale opposable
 * tant qu'elle n'a pas été validée ou rejetée par un médecin habilité.
 */
public enum StatutValidation {
    EN_ATTENTE,
    VALIDEE,
    REJETEE,
    MODIFIEE
}
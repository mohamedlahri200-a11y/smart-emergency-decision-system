package com.chu.appbackend.dto;

/**
 * DTO regroupant les statistiques agrégées du module de décision par IA,
 * notamment le taux d'adhésion des médecins aux recommandations de l'IA.
 */
public record StatistiquesDecisionsIADTO(
        Long totalDecisions,
        Long decisionsValidees,
        Long decisionsRejetees,
        Long decisionsModifiees,
        Long decisionsEnAttente,
        Double tauxAdhesionMedicale
) {}
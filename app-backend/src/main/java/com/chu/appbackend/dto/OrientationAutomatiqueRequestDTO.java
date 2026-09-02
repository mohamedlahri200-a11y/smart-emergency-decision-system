package com.chu.appbackend.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO de requête pour déclencher une orientation automatique à partir
 * de la recommandation issue d'une décision IA existante.
 */
public record OrientationAutomatiqueRequestDTO(

        @NotNull(message = "L'identifiant de la décision IA est obligatoire")
        Long decisionIAId,

        @NotNull(message = "L'identifiant du responsable est obligatoire")
        Long responsableId
) {}
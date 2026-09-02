package com.chu.appbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO de requête pour une orientation manuelle décidée par un médecin.
 */
public record OrientationRequestDTO(

        @NotNull(message = "L'identifiant du patient est obligatoire")
        Long patientId,

        Long decisionIAId,

        @NotNull(message = "L'identifiant du service hospitalier est obligatoire")
        Long serviceHospitalierId,

        @NotNull(message = "L'identifiant du responsable est obligatoire")
        Long responsableId,

        @NotBlank(message = "Le motif d'orientation est obligatoire")
        String motif
) {}
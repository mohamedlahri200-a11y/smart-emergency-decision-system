package com.chu.appbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO de requête pour l'enregistrement d'une consultation médicale.
 */
public record ConsultationRequestDTO(

        @NotNull(message = "L'identifiant du patient est obligatoire")
        Long patientId,

        @NotNull(message = "L'identifiant du médecin est obligatoire")
        Long medecinId,

        @NotBlank(message = "Le motif de consultation est obligatoire")
        String motif,

        String diagnostic,

        String observationsCliniques
) {}
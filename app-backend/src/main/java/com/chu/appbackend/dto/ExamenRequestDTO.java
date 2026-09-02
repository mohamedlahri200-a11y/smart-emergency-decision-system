


































package com.chu.appbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO de requête pour la prescription d'un examen complémentaire.
 */
public record ExamenRequestDTO(

        @NotNull(message = "L'identifiant de la consultation est obligatoire")
        Long consultationId,

        @NotBlank(message = "Le type d'examen est obligatoire")
        String typeExamen,

        @NotNull(message = "La catégorie d'examen est obligatoire (BIOLOGIE ou IMAGERIE)")
        String categorieExamen,

        String description
) {}
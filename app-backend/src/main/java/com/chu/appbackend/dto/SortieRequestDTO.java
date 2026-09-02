package com.chu.appbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO de requête pour l'enregistrement de la sortie d'un patient.
 */
public record SortieRequestDTO(

        @NotNull(message = "L'identifiant de la consultation est obligatoire")
        Long consultationId,

        @NotNull(message = "L'identifiant du médecin est obligatoire")
        Long medecinId,

        @NotBlank(message = "Le type de sortie est obligatoire")
        String typeSortie,

        @NotBlank(message = "L'évolution du patient est obligatoire")
        String evolutionPatient,

        String observationsSortie
) {}
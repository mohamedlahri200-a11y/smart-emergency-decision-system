package com.chu.appbackend.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO de requête pour l'enregistrement du résultat d'un examen.
 */
public record ExamenResultatDTO(

        @NotBlank(message = "Le résultat est obligatoire")
        String resultat
) {}
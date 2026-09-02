package com.chu.appbackend.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO représentant une ligne de prescription au sein d'une ordonnance.
 */
public record OrdonnanceLigneDTO(

        @NotBlank(message = "Le nom du médicament est obligatoire")
        String medicament,

        @NotBlank(message = "La posologie est obligatoire")
        String posologie,

        Integer dureeJours,

        String instructions
) {}
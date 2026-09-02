package com.chu.appbackend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO de requête pour la création ou la mise à jour d'un service hospitalier.
 */
public record ServiceHospitalierRequestDTO(

        @NotBlank(message = "Le nom du service est obligatoire")
        String nom,

        String description,

        @NotNull(message = "La capacité totale est obligatoire")
        @Min(value = 1, message = "La capacité totale doit être supérieure à 0")
        Integer capaciteTotale
) {}

package com.chu.appbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * DTO de requête pour l'enregistrement d'un traitement suivi par un patient.
 */
public record TraitementRequestDTO(

        @NotNull(message = "L'identifiant du patient est obligatoire")
        Long patientId,

        Long ordonnanceLigneId,

        @NotBlank(message = "Le nom du médicament est obligatoire")
        String medicament,

        @NotBlank(message = "La posologie est obligatoire")
        String posologie,

        @NotNull(message = "La date de début est obligatoire")
        LocalDate dateDebut,

        LocalDate dateFin,

        String observations
) {}
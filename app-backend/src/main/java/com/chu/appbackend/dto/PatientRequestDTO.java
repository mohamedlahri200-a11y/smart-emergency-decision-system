package com.chu.appbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

import java.time.LocalDate;

/**
 * DTO de requête pour la création ou la mise à jour d'un patient.
 */
public record PatientRequestDTO(

        @NotBlank(message = "Le nom est obligatoire")
        String nom,

        @NotBlank(message = "Le prénom est obligatoire")
        String prenom,

        String cin,

        @NotNull(message = "La date de naissance est obligatoire")
        @Past(message = "La date de naissance doit être dans le passé")
        LocalDate dateNaissance,

        @NotBlank(message = "Le sexe est obligatoire")
        String sexe,

        String telephone,

        String adresse,

        String groupeSanguin,

        String antecedents,

        String allergies,

        String personneAContacter,

        String telephoneContact
) {}
package com.chu.appbackend.dto;

import jakarta.validation.constraints.*;

/**
 * DTO de requête pour la saisie d'une fiche de triage.
 * Contient les constantes vitales brutes relevées par l'infirmier.
 */
public record TriageRequestDTO(

        @NotNull(message = "L'identifiant du patient est obligatoire")
        Long patientId,

        @NotNull(message = "L'identifiant de l'infirmier est obligatoire")
        Long infirmierId,

        @NotNull(message = "Le poids est obligatoire")
        @DecimalMin(value = "1.0", message = "Valeur de poids invalide")
        @DecimalMax(value = "400.0", message = "Valeur de poids invalide")
        Double poids,

        @NotNull(message = "La taille est obligatoire")
        @DecimalMin(value = "20.0", message = "Valeur de taille invalide")
        @DecimalMax(value = "250.0", message = "Valeur de taille invalide")
        Double taille,

        @NotNull(message = "La fréquence respiratoire est obligatoire")
        @Min(value = 0, message = "Valeur de fréquence respiratoire invalide")
        @Max(value = 60, message = "Valeur de fréquence respiratoire invalide")
        Integer frequenceRespiratoire,

        @NotNull(message = "La saturation en oxygène est obligatoire")
        @Min(value = 0, message = "Valeur de saturation invalide")
        @Max(value = 100, message = "Valeur de saturation invalide")
        Integer saturationOxygene,

        @NotNull(message = "L'indication oxygéno-dépendant est obligatoire")
        Boolean oxygenoDependant,

        @NotNull(message = "La température est obligatoire")
        @DecimalMin(value = "25.0", message = "Valeur de température invalide")
        @DecimalMax(value = "45.0", message = "Valeur de température invalide")
        Double temperature,

        @NotNull(message = "La pression artérielle systolique est obligatoire")
        @Min(value = 40, message = "Valeur de pression artérielle invalide")
        @Max(value = 300, message = "Valeur de pression artérielle invalide")
        Integer pressionArterielleSystolique,

        @NotNull(message = "La pression artérielle diastolique est obligatoire")
        @Min(value = 20, message = "Valeur de pression artérielle invalide")
        @Max(value = 200, message = "Valeur de pression artérielle invalide")
        Integer pressionArterielleDiastolique,

        @NotNull(message = "La fréquence cardiaque est obligatoire")
        @Min(value = 20, message = "Valeur de fréquence cardiaque invalide")
        @Max(value = 250, message = "Valeur de fréquence cardiaque invalide")
        Integer frequenceCardiaque,

        @DecimalMin(value = "0.1", message = "Valeur de glycémie invalide")
        @DecimalMax(value = "10.0", message = "Valeur de glycémie invalide")
        Double glycemie,

        @NotBlank(message = "Le niveau de conscience est obligatoire")
        String niveauConscience,

        String symptomes,

        @Min(value = 0, message = "L'intensité de la douleur doit être comprise entre 0 et 10")
        @Max(value = 10, message = "L'intensité de la douleur doit être comprise entre 0 et 10")
        Integer douleurIntensite
) {}
package com.chu.appbackend.ai;

import jakarta.validation.constraints.*;
import java.util.List;

/**
 * DTO envoyé au microservice IA (endpoint POST /predict). Construit
 * à partir des entités Patient + Triage par PatientAIMapper.
 */
public record PatientAIRequestDTO(
        String patientId,
        @NotNull @Min(0) @Max(120) Integer age,
        @NotBlank String sexe,
        @NotNull @Positive Double poids,
        @NotNull @Positive Double taille,
        @NotNull Double temperature,
        @NotNull Integer frequenceCardiaque,
        @NotNull Integer pressionArterielleSystolique,
        @NotNull Integer pressionArterielleDiastolique,
        @NotNull Integer frequenceRespiratoire,
        @NotNull Double saturationO2,
        @NotNull Double glycemie,
        @NotNull @Min(0) @Max(10) Integer douleurEva,
        Integer scoreGcs,
        List<String> antecedents,
        List<String> allergies,
        @NotEmpty(message = "Au moins un symptôme est requis pour l'évaluation IA") List<String> symptomes,
        String modeArrivee
) {}
package com.chu.appbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO de requête pour la validation, la modification ou le rejet
 * d'une décision IA par un médecin habilité.
 */
public record ValidationDecisionDTO(

        @NotNull(message = "L'identifiant du médecin validateur est obligatoire")
        Long medecinValidateurId,

        @NotBlank(message = "Le statut de validation est obligatoire")
        String statutValidation,

        String commentaireMedecin
) {}

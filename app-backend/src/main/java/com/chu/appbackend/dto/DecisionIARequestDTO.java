package com.chu.appbackend.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO de requête déclenchant le processus de décision assistée par IA
 * pour un triage donné.
 */
public record DecisionIARequestDTO(

        @NotNull(message = "L'identifiant du triage est obligatoire")
        Long triageId
) {}
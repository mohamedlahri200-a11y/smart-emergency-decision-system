package com.chu.appbackend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * DTO de requête pour la rédaction d'une ordonnance médicale.
 */
public record OrdonnanceRequestDTO(

        @NotNull(message = "L'identifiant de la consultation est obligatoire")
        Long consultationId,

        @NotNull(message = "L'identifiant du médecin est obligatoire")
        Long medecinId,

        @NotEmpty(message = "L'ordonnance doit contenir au moins une ligne de prescription")
        @Valid
        List<OrdonnanceLigneDTO> lignes
) {}
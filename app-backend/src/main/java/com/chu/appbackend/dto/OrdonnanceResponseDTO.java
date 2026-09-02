package com.chu.appbackend.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de réponse exposant le détail complet d'une ordonnance.
 */
public record OrdonnanceResponseDTO(
        Long id,
        Long consultationId,
        Long medecinId,
        String medecinNomComplet,
        List<OrdonnanceLigneDTO> lignes,
        LocalDateTime dateEmission
) {}
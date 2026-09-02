package com.chu.appbackend.dto;

import java.time.LocalDateTime;

/**
 * DTO de réponse exposant le détail de la sortie d'un patient.
 */
public record SortieResponseDTO(
        Long id,
        Long patientId,
        String patientNomComplet,
        Long consultationId,
        Long medecinId,
        String medecinNomComplet,
        String typeSortie,
        String evolutionPatient,
        String observationsSortie,
        LocalDateTime dateSortie
) {}
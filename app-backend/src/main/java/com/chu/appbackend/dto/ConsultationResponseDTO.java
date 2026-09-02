package com.chu.appbackend.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de réponse exposant le détail complet d'une consultation, incluant ses examens.
 */
public record ConsultationResponseDTO(
        Long id,
        Long patientId,
        String patientNomComplet,
        Long medecinId,
        String medecinNomComplet,
        String motif,
        String diagnostic,
        String observationsCliniques,
        List<ExamenResponseDTO> examens,
        LocalDateTime dateConsultation
) {}
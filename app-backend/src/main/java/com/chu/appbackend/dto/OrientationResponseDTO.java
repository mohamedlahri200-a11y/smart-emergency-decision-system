package com.chu.appbackend.dto;

import java.time.LocalDateTime;

/**
 * DTO de réponse exposant le résultat complet d'une orientation de patient.
 */
public record OrientationResponseDTO(
        Long id,
        Long patientId,
        String patientNomComplet,
        Long decisionIAId,
        Long serviceHospitalierId,
        String serviceHospitalierNom,
        Long responsableId,
        String responsableNomComplet,
        String typeOrientation,
        String motif,
        String statutOrientation,
        LocalDateTime dateOrientation,
        LocalDateTime dateConfirmation
) {}
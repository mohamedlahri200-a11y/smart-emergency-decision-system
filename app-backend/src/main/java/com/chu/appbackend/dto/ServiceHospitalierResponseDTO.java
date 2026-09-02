package com.chu.appbackend.dto;

/**
 * DTO de réponse exposant l'état d'un service hospitalier, incluant sa disponibilité.
 */
public record ServiceHospitalierResponseDTO(
        Long id,
        String nom,
        String description,
        Integer capaciteTotale,
        Integer capaciteDisponible,
        Boolean actif
) {}
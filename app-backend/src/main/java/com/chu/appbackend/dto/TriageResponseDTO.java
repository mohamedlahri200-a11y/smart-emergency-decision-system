package com.chu.appbackend.dto;

import java.time.LocalDateTime;

/**
 * DTO de réponse exposant le résultat complet d'un triage,
 * incluant les scores cliniques calculés et la priorité déterminée.
 */
public record TriageResponseDTO(
        Long id,
        Long patientId,
        String patientNomComplet,
        Long infirmierId,
        String infirmierNomComplet,
        Integer frequenceRespiratoire,
        Integer saturationOxygene,
        Boolean oxygenoDependant,
        Double temperature,
        Integer pressionArterielleSystolique,
        Integer frequenceCardiaque,
        String niveauConscience,
        String symptomes,
        Integer douleurIntensite,
        Integer scoreNews2,
        String niveauRisqueNews2,
        Integer niveauEsi,
        String priorite,
        LocalDateTime dateTriage
) {}
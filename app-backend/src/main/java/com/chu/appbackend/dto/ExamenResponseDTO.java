





package com.chu.appbackend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ExamenResponseDTO(
        Long id,
        Long consultationId,
        Long patientId,
        String patientNomComplet,
        Long medecinPrescripteurId,
        String medecinPrescripteurNomComplet,
        String typeExamen,
        String categorieExamen,
        String description,
        String statutExamen,
        String resultat,
        String cheminImage,
        Boolean compteRenduCritique,
        List<String> motsClesCritiquesDetectes,
        LocalDateTime datePrescription,
        LocalDateTime dateResultat
) {}
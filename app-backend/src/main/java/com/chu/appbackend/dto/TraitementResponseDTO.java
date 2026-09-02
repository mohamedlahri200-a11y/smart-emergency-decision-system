package com.chu.appbackend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO de réponse exposant le suivi complet d'un traitement.
 */
public record TraitementResponseDTO(
        Long id,
        Long patientId,
        String patientNomComplet,
        Long ordonnanceLigneId,
        String medicament,
        String posologie,
        LocalDate dateDebut,
        LocalDate dateFin,
        String statut,
        String observations,
        LocalDateTime dateEnregistrement
) {}
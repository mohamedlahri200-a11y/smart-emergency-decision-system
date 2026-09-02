package com.chu.appbackend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO de réponse exposant les informations complètes d'un patient.
 */
public record PatientResponseDTO(
        Long id,
        String numeroDossier,
        String nom,
        String prenom,
        String cin,
        LocalDate dateNaissance,
        Integer age,
        String sexe,
        String telephone,
        String adresse,
        String groupeSanguin,
        String antecedents,
        String allergies,
        String personneAContacter,
        String telephoneContact,
        LocalDateTime dateEnregistrement
) {}
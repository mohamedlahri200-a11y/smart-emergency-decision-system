package com.chu.appbackend.dto;

import java.time.LocalDateTime;

/**
 * DTO de réponse exposant les informations publiques d'un utilisateur.
 * N'expose jamais le mot de passe.
 */
public record UserResponseDTO(
        Long id,
        String nom,
        String prenom,
        String email,
        String matricule,
        String telephone,
        String role,
        Boolean actif,
        LocalDateTime dateCreation
) {}
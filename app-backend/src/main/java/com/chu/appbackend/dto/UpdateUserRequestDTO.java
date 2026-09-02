package com.chu.appbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO de requête pour la mise à jour d'un utilisateur existant.
 */
public record UpdateUserRequestDTO(

        @NotBlank(message = "Le nom est obligatoire")
        String nom,

        @NotBlank(message = "Le prénom est obligatoire")
        String prenom,

        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Format d'email invalide")
        String email,

        String telephone,

        @NotBlank(message = "Le rôle est obligatoire")
        String role,

        Boolean actif
) {}
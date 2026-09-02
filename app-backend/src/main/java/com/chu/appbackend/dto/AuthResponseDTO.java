package com.chu.appbackend.dto;

/**
 * DTO de réponse renvoyé après une authentification réussie.
 */
public record AuthResponseDTO(
        String token,
        String type,
        Long id,
        String nom,
        String prenom,
        String email,
        String role
) {
    public static AuthResponseDTO of(String token, Long id, String nom, String prenom, String email, String role) {
        return new AuthResponseDTO(token, "Bearer", id, nom, prenom, email, role);
    }
}
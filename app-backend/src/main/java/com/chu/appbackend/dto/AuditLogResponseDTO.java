package com.chu.appbackend.dto;

import java.time.LocalDateTime;

/**
 * DTO de réponse exposant le détail d'une entrée du journal d'audit.
 */
public record AuditLogResponseDTO(
        Long id,
        Long utilisateurId,
        String utilisateurNomComplet,
        String typeAction,
        String entiteConcernee,
        Long entiteId,
        String description,
        String adresseIp,
        LocalDateTime dateAction
) {}
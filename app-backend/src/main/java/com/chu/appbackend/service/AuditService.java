package com.chu.appbackend.service;

import com.chu.appbackend.dto.AuditLogResponseDTO;
import com.chu.appbackend.entity.TypeAction;

import java.util.List;

/**
 * Contrat de service pour la journalisation et la consultation des actions d'audit.
 * La méthode enregistrerAction est destinée à être appelée par les autres services
 * du système lors d'opérations sensibles (création, validation, suppression...).
 */
public interface AuditService {

    void enregistrerAction(Long utilisateurId, TypeAction typeAction, String entiteConcernee,
                           Long entiteId, String description);

    List<AuditLogResponseDTO> getAllAuditLogs();

    List<AuditLogResponseDTO> getAuditLogsByUtilisateur(Long utilisateurId);

    List<AuditLogResponseDTO> getAuditLogsByEntite(String entiteConcernee);
}
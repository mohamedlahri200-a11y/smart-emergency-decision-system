package com.chu.appbackend.service.impl;

import com.chu.appbackend.dto.AuditLogResponseDTO;
import com.chu.appbackend.entity.AuditLog;
import com.chu.appbackend.entity.TypeAction;
import com.chu.appbackend.entity.User;
import com.chu.appbackend.exception.ResourceNotFoundException;
import com.chu.appbackend.repository.AuditLogRepository;
import com.chu.appbackend.repository.UserRepository;
import com.chu.appbackend.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implémentation du service d'audit.
 * Journalise les actions sensibles du système dans une transaction indépendante
 * (REQUIRES_NEW) afin qu'un échec d'enregistrement d'audit ne compromette jamais
 * l'opération métier principale qui l'a déclenché.
 */
@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void enregistrerAction(Long utilisateurId, TypeAction typeAction, String entiteConcernee,
                                  Long entiteId, String description) {
        User utilisateur = userRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'id : " + utilisateurId));

        AuditLog log = AuditLog.builder()
                .utilisateur(utilisateur)
                .typeAction(typeAction)
                .entiteConcernee(entiteConcernee)
                .entiteId(entiteId)
                .description(description)
                .build();

        auditLogRepository.save(log);
    }

    @Override
    public List<AuditLogResponseDTO> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByDateActionDesc().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public List<AuditLogResponseDTO> getAuditLogsByUtilisateur(Long utilisateurId) {
        if (!userRepository.existsById(utilisateurId)) {
            throw new ResourceNotFoundException("Utilisateur introuvable avec l'id : " + utilisateurId);
        }
        return auditLogRepository.findByUtilisateurIdOrderByDateActionDesc(utilisateurId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public List<AuditLogResponseDTO> getAuditLogsByEntite(String entiteConcernee) {
        return auditLogRepository.findByEntiteConcerneeOrderByDateActionDesc(entiteConcernee).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    private AuditLogResponseDTO toResponseDTO(AuditLog log) {
        return new AuditLogResponseDTO(
                log.getId(),
                log.getUtilisateur().getId(),
                log.getUtilisateur().getNom() + " " + log.getUtilisateur().getPrenom(),
                log.getTypeAction().name(),
                log.getEntiteConcernee(),
                log.getEntiteId(),
                log.getDescription(),
                log.getAdresseIp(),
                log.getDateAction()
        );
    }
}
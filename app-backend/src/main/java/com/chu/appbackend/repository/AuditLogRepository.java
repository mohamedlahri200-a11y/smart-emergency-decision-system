package com.chu.appbackend.repository;

import com.chu.appbackend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository JPA pour l'entité AuditLog.
 * Fournit les opérations de lecture du journal d'audit (aucune modification/suppression
 * n'est exposée : un journal d'audit doit rester immuable).
 */
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findAllByOrderByDateActionDesc();

    List<AuditLog> findByUtilisateurIdOrderByDateActionDesc(Long utilisateurId);

    List<AuditLog> findByEntiteConcerneeOrderByDateActionDesc(String entiteConcernee);
}
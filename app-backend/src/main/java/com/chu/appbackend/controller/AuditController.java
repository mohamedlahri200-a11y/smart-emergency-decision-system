package com.chu.appbackend.controller;

import com.chu.appbackend.dto.AuditLogResponseDTO;
import com.chu.appbackend.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST exposant la consultation du journal d'audit.
 * Réservé aux administrateurs (voir SecurityConfig). Le journal est en lecture
 * seule : aucune opération de modification ou de suppression n'est exposée.
 */
@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@Tag(name = "Audit", description = "Consultation du journal des actions système")
public class AuditController {

    private final AuditService auditService;

    @Operation(summary = "Lister l'intégralité du journal d'audit")
    @GetMapping
    public ResponseEntity<List<AuditLogResponseDTO>> getAllAuditLogs() {
        return ResponseEntity.ok(auditService.getAllAuditLogs());
    }

    @Operation(summary = "Consulter le journal d'audit d'un utilisateur")
    @GetMapping("/utilisateur/{utilisateurId}")
    public ResponseEntity<List<AuditLogResponseDTO>> getAuditLogsByUtilisateur(@PathVariable Long utilisateurId) {
        return ResponseEntity.ok(auditService.getAuditLogsByUtilisateur(utilisateurId));
    }

    @Operation(summary = "Consulter le journal d'audit relatif à un type d'entité (ex. Patient, Triage)")
    @GetMapping("/entite/{entiteConcernee}")
    public ResponseEntity<List<AuditLogResponseDTO>> getAuditLogsByEntite(@PathVariable String entiteConcernee) {
        return ResponseEntity.ok(auditService.getAuditLogsByEntite(entiteConcernee));
    }
}
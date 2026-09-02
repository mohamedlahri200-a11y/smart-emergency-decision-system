package com.chu.appbackend.controller;

import com.chu.appbackend.dto.ConsultationRequestDTO;
import com.chu.appbackend.dto.ConsultationResponseDTO;
import com.chu.appbackend.service.ConsultationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST exposant les opérations de gestion des consultations médicales.
 */
@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
@Tag(name = "Consultations", description = "Suivi médical : consultations")
public class ConsultationController {

    private final ConsultationService consultationService;

    @Operation(summary = "Créer une consultation")
    @PostMapping
    public ResponseEntity<ConsultationResponseDTO> createConsultation(@Valid @RequestBody ConsultationRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(consultationService.createConsultation(request));
    }

    @Operation(summary = "Récupérer une consultation par son identifiant")
    @GetMapping("/{id}")
    public ResponseEntity<ConsultationResponseDTO> getConsultationById(@PathVariable Long id) {
        return ResponseEntity.ok(consultationService.getConsultationById(id));
    }

    @Operation(summary = "Lister toutes les consultations")
    @GetMapping
    public ResponseEntity<List<ConsultationResponseDTO>> getAllConsultations() {
        return ResponseEntity.ok(consultationService.getAllConsultations());
    }

    @Operation(summary = "Consulter l'historique des consultations d'un patient")
    @GetMapping("/patient/{patientId}/historique")
    public ResponseEntity<List<ConsultationResponseDTO>> getHistoriqueByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(consultationService.getHistoriqueByPatient(patientId));
    }

    @Operation(summary = "Mettre à jour le diagnostic d'une consultation")
    @PutMapping("/{id}/diagnostic")
    public ResponseEntity<ConsultationResponseDTO> updateDiagnostic(@PathVariable Long id,
                                                                    @RequestParam String diagnostic,
                                                                    @RequestParam(required = false) String observationsCliniques) {
        return ResponseEntity.ok(consultationService.updateDiagnostic(id, diagnostic, observationsCliniques));
    }
}
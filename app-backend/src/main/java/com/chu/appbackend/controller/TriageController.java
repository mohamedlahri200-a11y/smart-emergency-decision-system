package com.chu.appbackend.controller;

import com.chu.appbackend.dto.TriageRequestDTO;
import com.chu.appbackend.dto.TriageResponseDTO;
import com.chu.appbackend.service.TriageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST exposant les opérations du module de triage intelligent.
 */
@RestController
@RequestMapping("/api/triages")
@RequiredArgsConstructor
@Tag(name = "Triage", description = "Saisie des constantes vitales et calcul des scores NEWS2 / ESI")
public class TriageController {

    private final TriageService triageService;

    @Operation(summary = "Enregistrer une nouvelle fiche de triage")
    @PostMapping
    public ResponseEntity<TriageResponseDTO> createTriage(@Valid @RequestBody TriageRequestDTO request) {
        TriageResponseDTO response = triageService.createTriage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Récupérer une fiche de triage par son identifiant")
    @GetMapping("/{id}")
    public ResponseEntity<TriageResponseDTO> getTriageById(@PathVariable Long id) {
        return ResponseEntity.ok(triageService.getTriageById(id));
    }

    @Operation(summary = "Lister toutes les fiches de triage")
    @GetMapping
    public ResponseEntity<List<TriageResponseDTO>> getAllTriages() {
        return ResponseEntity.ok(triageService.getAllTriages());
    }

    @Operation(summary = "Consulter l'historique des triages d'un patient")
    @GetMapping("/patient/{patientId}/historique")
    public ResponseEntity<List<TriageResponseDTO>> getHistoriqueByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(triageService.getHistoriqueByPatient(patientId));
    }
}
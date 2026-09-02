package com.chu.appbackend.controller;

import com.chu.appbackend.dto.TraitementRequestDTO;
import com.chu.appbackend.dto.TraitementResponseDTO;
import com.chu.appbackend.service.TraitementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST exposant les opérations de suivi des traitements médicamenteux.
 */
@RestController
@RequestMapping("/api/traitements")
@RequiredArgsConstructor
@Tag(name = "Traitements", description = "Suivi médical : traitements médicamenteux")
public class TraitementController {

    private final TraitementService traitementService;

    @Operation(summary = "Enregistrer un traitement")
    @PostMapping
    public ResponseEntity<TraitementResponseDTO> createTraitement(@Valid @RequestBody TraitementRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(traitementService.createTraitement(request));
    }

    @Operation(summary = "Récupérer un traitement par son identifiant")
    @GetMapping("/{id}")
    public ResponseEntity<TraitementResponseDTO> getTraitementById(@PathVariable Long id) {
        return ResponseEntity.ok(traitementService.getTraitementById(id));
    }

    @Operation(summary = "Consulter l'historique des traitements d'un patient")
    @GetMapping("/patient/{patientId}/historique")
    public ResponseEntity<List<TraitementResponseDTO>> getHistoriqueByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(traitementService.getHistoriqueByPatient(patientId));
    }

    @Operation(summary = "Arrêter un traitement en cours")
    @PutMapping("/{id}/arreter")
    public ResponseEntity<TraitementResponseDTO> arreterTraitement(@PathVariable Long id,
                                                                   @RequestParam(required = false) String observations) {
        return ResponseEntity.ok(traitementService.arreterTraitement(id, observations));
    }

    @Operation(summary = "Marquer un traitement comme terminé")
    @PutMapping("/{id}/terminer")
    public ResponseEntity<TraitementResponseDTO> terminerTraitement(@PathVariable Long id) {
        return ResponseEntity.ok(traitementService.terminerTraitement(id));
    }
}
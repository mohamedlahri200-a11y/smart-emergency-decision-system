package com.chu.appbackend.controller;

import com.chu.appbackend.dto.OrientationAutomatiqueRequestDTO;
import com.chu.appbackend.dto.OrientationRequestDTO;
import com.chu.appbackend.dto.OrientationResponseDTO;
import com.chu.appbackend.service.OrientationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST exposant les opérations du module d'orientation des patients.
 */
@RestController
@RequestMapping("/api/orientations")
@RequiredArgsConstructor
@Tag(name = "Orientation", description = "Orientation automatique ou manuelle des patients vers les services hospitaliers")
public class OrientationController {

    private final OrientationService orientationService;

    @Operation(summary = "Orienter manuellement un patient")
    @PostMapping("/manuelle")
    public ResponseEntity<OrientationResponseDTO> orienterManuellement(@Valid @RequestBody OrientationRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orientationService.orienterManuellement(request));
    }

    @Operation(summary = "Orienter automatiquement un patient à partir d'une décision IA validée")
    @PostMapping("/automatique")
    public ResponseEntity<OrientationResponseDTO> orienterAutomatiquement(@Valid @RequestBody OrientationAutomatiqueRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orientationService.orienterAutomatiquement(request));
    }

    @Operation(summary = "Récupérer une orientation par son identifiant")
    @GetMapping("/{id}")
    public ResponseEntity<OrientationResponseDTO> getOrientationById(@PathVariable Long id) {
        return ResponseEntity.ok(orientationService.getOrientationById(id));
    }

    @Operation(summary = "Lister toutes les orientations")
    @GetMapping
    public ResponseEntity<List<OrientationResponseDTO>> getAllOrientations() {
        return ResponseEntity.ok(orientationService.getAllOrientations());
    }

    @Operation(summary = "Consulter l'historique des orientations d'un patient")
    @GetMapping("/patient/{patientId}/historique")
    public ResponseEntity<List<OrientationResponseDTO>> getHistoriqueByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(orientationService.getHistoriqueByPatient(patientId));
    }

    @Operation(summary = "Confirmer une orientation en attente")
    @PutMapping("/{id}/confirmer")
    public ResponseEntity<OrientationResponseDTO> confirmerOrientation(@PathVariable Long id) {
        return ResponseEntity.ok(orientationService.confirmerOrientation(id));
    }

    @Operation(summary = "Annuler une orientation")
    @PutMapping("/{id}/annuler")
    public ResponseEntity<OrientationResponseDTO> annulerOrientation(@PathVariable Long id) {
        return ResponseEntity.ok(orientationService.annulerOrientation(id));
    }
}
package com.chu.appbackend.controller;

import com.chu.appbackend.dto.OrdonnanceRequestDTO;
import com.chu.appbackend.dto.OrdonnanceResponseDTO;
import com.chu.appbackend.service.OrdonnanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST exposant les opérations de gestion des ordonnances médicales.
 */
@RestController
@RequestMapping("/api/ordonnances")
@RequiredArgsConstructor
@Tag(name = "Ordonnances", description = "Suivi médical : ordonnances")
public class OrdonnanceController {

    private final OrdonnanceService ordonnanceService;

    @Operation(summary = "Créer une ordonnance")
    @PostMapping
    public ResponseEntity<OrdonnanceResponseDTO> creerOrdonnance(@Valid @RequestBody OrdonnanceRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ordonnanceService.creerOrdonnance(request));
    }

    @Operation(summary = "Récupérer une ordonnance par son identifiant")
    @GetMapping("/{id}")
    public ResponseEntity<OrdonnanceResponseDTO> getOrdonnanceById(@PathVariable Long id) {
        return ResponseEntity.ok(ordonnanceService.getOrdonnanceById(id));
    }

    @Operation(summary = "Récupérer l'ordonnance associée à une consultation")
    @GetMapping("/consultation/{consultationId}")
    public ResponseEntity<OrdonnanceResponseDTO> getOrdonnanceByConsultation(@PathVariable Long consultationId) {
        return ResponseEntity.ok(ordonnanceService.getOrdonnanceByConsultation(consultationId));
    }
}
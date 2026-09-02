package com.chu.appbackend.controller;

import com.chu.appbackend.dto.SortieRequestDTO;
import com.chu.appbackend.dto.SortieResponseDTO;
import com.chu.appbackend.service.SortieService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST exposant les opérations d'enregistrement de la sortie des patients.
 */
@RestController
@RequestMapping("/api/sorties")
@RequiredArgsConstructor
@Tag(name = "Sorties", description = "Suivi médical : sortie du patient")
public class SortieController {

    private final SortieService sortieService;

    @Operation(summary = "Enregistrer la sortie d'un patient")
    @PostMapping
    public ResponseEntity<SortieResponseDTO> enregistrerSortie(@Valid @RequestBody SortieRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sortieService.enregistrerSortie(request));
    }

    @Operation(summary = "Récupérer une sortie par son identifiant")
    @GetMapping("/{id}")
    public ResponseEntity<SortieResponseDTO> getSortieById(@PathVariable Long id) {
        return ResponseEntity.ok(sortieService.getSortieById(id));
    }

    @Operation(summary = "Consulter l'historique des sorties d'un patient")
    @GetMapping("/patient/{patientId}/historique")
    public ResponseEntity<List<SortieResponseDTO>> getHistoriqueByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(sortieService.getHistoriqueByPatient(patientId));
    }
}
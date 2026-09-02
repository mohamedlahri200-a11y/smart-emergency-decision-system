package com.chu.appbackend.controller;

import com.chu.appbackend.dto.ExamenRequestDTO;
import com.chu.appbackend.dto.ExamenResponseDTO;
import com.chu.appbackend.dto.ExamenResultatDTO;
import com.chu.appbackend.service.ExamenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
        import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Contrôleur REST exposant les opérations de gestion des examens complémentaires.
 */
@RestController
@RequestMapping("/api/examens")
@RequiredArgsConstructor
@Tag(name = "Examens", description = "Suivi médical : examens complémentaires")
public class ExamenController {

    private final ExamenService examenService;

    @Operation(summary = "Prescrire un examen complémentaire")
    @PostMapping
    public ResponseEntity<ExamenResponseDTO> prescrireExamen(@Valid @RequestBody ExamenRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examenService.prescrireExamen(request));
    }

    @Operation(summary = "Prendre en charge un examen (passage au statut EN_COURS)")
    @PutMapping("/{id}/demarrer")
    public ResponseEntity<ExamenResponseDTO> demarrerExamen(@PathVariable Long id) {
        return ResponseEntity.ok(examenService.demarrerExamen(id));
    }

    @Operation(summary = "Enregistrer le résultat d'un examen")
    @PutMapping("/{id}/resultat")
    public ResponseEntity<ExamenResponseDTO> enregistrerResultat(@PathVariable Long id,
                                                                 @Valid @RequestBody ExamenResultatDTO request) {
        return ResponseEntity.ok(examenService.enregistrerResultat(id, request));
    }

    @Operation(summary = "Téléverser l'image (radio/scanner) associée à un examen d'imagerie")
    @PostMapping(value = "/{id}/image", consumes = "multipart/form-data")
    public ResponseEntity<ExamenResponseDTO> uploaderImage(@PathVariable Long id,
                                                           @RequestParam("fichier") MultipartFile fichier) {
        return ResponseEntity.ok(examenService.uploaderImage(id, fichier));
    }

    @Operation(summary = "Analyser l'image jointe à un examen avec le CNN de démonstration (données synthétiques)")
    @PostMapping("/{id}/analyser-image")
    public ResponseEntity<com.chu.appbackend.ai.ImagingAnalysisResponseDTO> analyserImageAvecCNN(@PathVariable Long id) {
        return ResponseEntity.ok(examenService.analyserImageAvecCNN(id));
    }

    @Operation(summary = "Récupérer un examen par son identifiant")
    @GetMapping("/{id}")
    public ResponseEntity<ExamenResponseDTO> getExamenById(@PathVariable Long id) {
        return ResponseEntity.ok(examenService.getExamenById(id));
    }

    @Operation(summary = "Lister tous les examens, avec filtre optionnel par catégorie (BIOLOGIE ou IMAGERIE)")
    @GetMapping
    public ResponseEntity<List<ExamenResponseDTO>> getAllExamens(
            @RequestParam(required = false) String categorie) {
        return ResponseEntity.ok(examenService.getAllExamens(categorie));
    }

    @Operation(summary = "Lister les examens d'une consultation")
    @GetMapping("/consultation/{consultationId}")
    public ResponseEntity<List<ExamenResponseDTO>> getExamensByConsultation(@PathVariable Long consultationId) {
        return ResponseEntity.ok(examenService.getExamensByConsultation(consultationId));
    }

    @Operation(summary = "Lister tous les examens (bio + imagerie) d'un patient")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ExamenResponseDTO>> getExamensByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(examenService.getExamensByPatient(patientId));
    }
}
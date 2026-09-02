package com.chu.appbackend.controller;

import com.chu.appbackend.dto.AnalyseComplementaireRequestDTO;
import com.chu.appbackend.dto.DecisionIARequestDTO;
import com.chu.appbackend.dto.DecisionIAResponseDTO;
import com.chu.appbackend.dto.ValidationDecisionDTO;
import com.chu.appbackend.service.DecisionIAService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

        import java.util.List;

/**
 * Contrôleur REST exposant les opérations du module d'aide à la décision par IA.
 * Ce contrôleur ne fait que déclencher l'orchestration ; le calcul prédictif
 * est intégralement délégué au microservice FastAPI.
 */
@RestController
@RequestMapping("/api/decisions-ia")
@RequiredArgsConstructor
@Tag(name = "Décision IA", description = "Aide à la décision médicale via le microservice FastAPI")
public class DecisionIAController {

    private final DecisionIAService decisionIAService;

    @Operation(summary = "Générer une décision IA à partir d'un triage")
    @PostMapping
    public ResponseEntity<DecisionIAResponseDTO> genererDecision(@Valid @RequestBody DecisionIARequestDTO request) {
        DecisionIAResponseDTO response = decisionIAService.genererDecision(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Analyse complémentaire (2ème analyse IA) à partir des résultats d'examens reçus")
    @PostMapping("/triage/{triageId}/analyse-complementaire")
    public ResponseEntity<DecisionIAResponseDTO> genererAnalyseComplementaire(
            @PathVariable Long triageId,
            @RequestBody AnalyseComplementaireRequestDTO request) {
        return ResponseEntity.ok(decisionIAService.genererAnalyseComplementaire(triageId, request));
    }

    @Operation(summary = "Récupérer une décision IA par son identifiant")
    @GetMapping("/{id}")
    public ResponseEntity<DecisionIAResponseDTO> getDecisionById(@PathVariable Long id) {
        return ResponseEntity.ok(decisionIAService.getDecisionById(id));
    }

    @Operation(summary = "Lister toutes les décisions IA")
    @GetMapping
    public ResponseEntity<List<DecisionIAResponseDTO>> getAllDecisions() {
        return ResponseEntity.ok(decisionIAService.getAllDecisions());
    }

    @Operation(summary = "Consulter l'historique des décisions IA d'un patient")
    @GetMapping("/patient/{patientId}/historique")
    public ResponseEntity<List<DecisionIAResponseDTO>> getHistoriqueByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(decisionIAService.getHistoriqueByPatient(patientId));
    }

    @Operation(summary = "Valider, modifier ou rejeter une décision IA")
    @PutMapping("/{id}/validation")
    public ResponseEntity<DecisionIAResponseDTO> validerDecision(@PathVariable Long id,
                                                                 @Valid @RequestBody ValidationDecisionDTO request) {
        return ResponseEntity.ok(decisionIAService.validerDecision(id, request));
    }
}
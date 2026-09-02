



package com.chu.appbackend.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Contrôleur de test/monitoring de la liaison avec le microservice IA.
 * Ne contient aucune logique métier — sert uniquement à vérifier que
 * le tuyau HTTP entre Spring Boot et FastAPI fonctionne.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class EmergencyAIController {

    private final AIService aiService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkAIHealth() {
        return ResponseEntity.ok(aiService.health());
    }

    /**
     * Endpoint temporaire de test manuel de la prédiction IA.
     * Permet de valider le contrat JSON complet (patient -> prédiction)
     * sans dépendre de données en base (Patient/Triage).
     * À supprimer une fois l'intégration finale validée via
     * DecisionIAServiceImpl.
     */
    @PostMapping("/predict-test")
    public ResponseEntity<PredictResponseDTO> predictTest(@RequestBody PredictRequestDTO request) {
        return ResponseEntity.ok(aiService.predict(request));
    }
}





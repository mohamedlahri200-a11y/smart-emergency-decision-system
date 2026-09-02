package com.chu.appbackend.service;

import com.chu.appbackend.dto.AnalyseComplementaireRequestDTO;
import com.chu.appbackend.dto.DecisionIARequestDTO;
import com.chu.appbackend.dto.DecisionIAResponseDTO;
import com.chu.appbackend.dto.ValidationDecisionDTO;

import java.util.List;

/**
 * Contrat de service pour le module d'aide à la décision par IA.
 * Orchestre la préparation des données, l'appel au microservice FastAPI,
 * le stockage de la prédiction et son cycle de validation médicale.
 */
public interface DecisionIAService {

    DecisionIAResponseDTO genererDecision(DecisionIARequestDTO request);

    /**
     * Analyse complémentaire (2ème analyse IA) : à appeler par le médecin
     * urgentiste une fois les résultats du radiologue et du biologiste
     * reçus, pour affiner la recommandation initiale (service, protocoles
     * thérapeutiques, durée de séjour, conseils patient) à partir des
     * résultats structurés saisis.
     */
    DecisionIAResponseDTO genererAnalyseComplementaire(Long triageId, AnalyseComplementaireRequestDTO labo);

    DecisionIAResponseDTO getDecisionById(Long id);

    List<DecisionIAResponseDTO> getAllDecisions();

    List<DecisionIAResponseDTO> getHistoriqueByPatient(Long patientId);

    DecisionIAResponseDTO validerDecision(Long id, ValidationDecisionDTO request);
}
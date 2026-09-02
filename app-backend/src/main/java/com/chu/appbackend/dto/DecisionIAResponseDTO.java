













package com.chu.appbackend.dto;

import com.chu.appbackend.ai.AIExplanationDTO;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de réponse exposant le résultat complet d'une décision IA,
 * incluant son statut de validation médicale et l'intégralité des
 * recommandations calculées par le microservice IA (examens, analyses
 * biologiques, durée de séjour estimée, risques cliniques, alertes,
 * protocoles thérapeutiques, recommandations personnalisées et
 * explication XAI détaillée).
 */
public record DecisionIAResponseDTO(
        Long id,
        Long patientId,
        String patientNomComplet,
        Long triageId,
        Long medecinValidateurId,
        String medecinValidateurNomComplet,
        Double scorePrediction,
        String classePredite,
        String recommandationService,
        String explication,
        String statutValidation,
        String commentaireMedecin,
        LocalDateTime dateDecision,
        LocalDateTime dateValidation,

        // ---- Champs enrichis provenant du microservice IA (PredictResponseDTO) ----
        List<String> examensRecommandes,
        List<String> analysesRecommandees,
        String risqueClinique,
        String risqueDeterioration,
        Double dureeSejourEstimeeHeures,
        Double tempsAttenteEstimeMinutes,
        List<String> facteursRisqueIdentifies,
        List<String> alertesActives,
        List<String> protocolesRecommandes,
        List<String> recommandationsPatient,
        AIExplanationDTO explicationDetaillee,
        String versionModele,
        Double scoreConfiance
) {}
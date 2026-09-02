package com.chu.appbackend.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO représentant exactement la réponse du microservice IA FastAPI.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record PredictResponseDTO(

        @JsonProperty("prediction_id")
        String predictionId,

        @JsonProperty("priority")
        String priority,

        @JsonProperty("priority_score")
        Double priorityScore,

        @JsonProperty("recommended_service")
        String recommendedService,

        @JsonProperty("recommended_exams")
        List<String> recommendedExams,

        @JsonProperty("recommended_lab_tests")
        List<String> recommendedLabTests,

        @JsonProperty("clinical_risk")
        String clinicalRisk,

        @JsonProperty("deterioration_risk")
        String deteriorationRisk,

        @JsonProperty("estimated_length_of_stay")
        Double estimatedLengthOfStay,

        @JsonProperty("estimated_waiting_time")
        Double estimatedWaitingTime,

        @JsonProperty("identified_risk_factors")
        List<String> identifiedRiskFactors,

        @JsonProperty("active_alerts")
        List<String> activeAlerts,

        @JsonProperty("recommended_protocols")
        List<String> recommendedProtocols,

        @JsonProperty("patient_recommendations")
        List<String> patientRecommendations,

        @JsonProperty("ai_explanation")
        AIExplanationDTO aiExplanation,

        @JsonProperty("model_version")
        String modelVersion,

        @JsonProperty("prediction_time")
        LocalDateTime predictionTime,

        @JsonProperty("confidence_score")
        Double confidenceScore

) {
}
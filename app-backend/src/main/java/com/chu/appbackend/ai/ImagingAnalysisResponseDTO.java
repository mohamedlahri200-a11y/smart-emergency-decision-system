package com.chu.appbackend.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

/**
 * DTO représentant la réponse du microservice IA pour l'analyse d'image
 * par le CNN de démonstration (POST /predict-imaging). Le modèle sous-jacent
 * est entraîné sur des données synthétiques — cf. disclaimer inclus dans
 * chaque réponse, à afficher systématiquement côté frontend.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ImagingAnalysisResponseDTO(

        @JsonProperty("modele_disponible")
        boolean modeleDisponible,

        @JsonProperty("classe_predite")
        String classePredite,

        Double confiance,

        Map<String, Double> probabilites,

        String disclaimer

) {}
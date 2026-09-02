package com.chu.appbackend.dto;

/**
 * DTO de requête pour l'analyse complémentaire (2ème analyse IA),
 * réalisée par le médecin urgentiste une fois les résultats du
 * radiologue et du biologiste reçus.
 */
public record AnalyseComplementaireRequestDTO(
        Double crp,
        Double procalcitonine,
        Double leucocytes,
        Double hemoglobine,
        Double creatinine,
        Double troponine,
        Double lactate,
        Double glycemieLabo,
        Boolean imagerieAnomalie,
        String imagerieDetails
) {}
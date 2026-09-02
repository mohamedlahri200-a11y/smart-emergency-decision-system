package com.chu.appbackend.dto;

import java.util.Map;

/**
 * DTO regroupant les statistiques agrégées du module de triage,
 * notamment la répartition des patients par niveau de priorité.
 */
public record StatistiquesTriagesDTO(
        Long totalTriages,
        Map<String, Long> repartitionParPriorite,
        Double moyenneScoreNews2
) {}
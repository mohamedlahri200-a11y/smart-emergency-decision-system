package com.chu.appbackend.dto;

import java.util.Map;

/**
 * DTO agrégeant l'ensemble des indicateurs clés affichés sur le tableau de bord
 * administrateur : volumétrie patients, occupation des services, triage et IA.
 */
public record DashboardStatsDTO(
        Long totalPatients,
        Long totalUtilisateursActifs,
        Long totalServicesHospitaliers,
        Long totalPlacesDisponibles,
        Long totalPlacesOccupees,
        Long patientsEnAttenteOrientation,
        Long sortiesAujourdHui,
        Map<String, Long> repartitionUtilisateursParRole,
        StatistiquesTriagesDTO statistiquesTriages,
        StatistiquesDecisionsIADTO statistiquesDecisionsIA
) {}
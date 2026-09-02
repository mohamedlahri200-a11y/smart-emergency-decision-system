package com.chu.appbackend.service;

import com.chu.appbackend.dto.DashboardStatsDTO;

/**
 * Contrat de service pour l'agrégation des indicateurs du tableau de bord administrateur.
 */
public interface DashboardService {

    DashboardStatsDTO getDashboardStats();
}
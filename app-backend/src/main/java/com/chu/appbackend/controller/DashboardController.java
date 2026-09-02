package com.chu.appbackend.controller;

import com.chu.appbackend.dto.DashboardStatsDTO;
import com.chu.appbackend.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Contrôleur REST exposant les indicateurs agrégés du tableau de bord administrateur.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Tableau de bord", description = "Indicateurs statistiques globaux de la plateforme")
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Récupérer les statistiques globales du tableau de bord")
    @GetMapping
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }
}
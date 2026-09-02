package com.chu.appbackend.service.impl;

import com.chu.appbackend.dto.DashboardStatsDTO;
import com.chu.appbackend.dto.StatistiquesDecisionsIADTO;
import com.chu.appbackend.dto.StatistiquesTriagesDTO;
import com.chu.appbackend.entity.*;
import com.chu.appbackend.repository.*;
import com.chu.appbackend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implémentation du service de tableau de bord.
 * Agrège en lecture seule les données de l'ensemble des modules métier
 * afin de fournir une vue synthétique à l'administrateur, sans dupliquer
 * la moindre donnée (calcul à la volée sur chaque appel).
 */
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final ServiceHospitalierRepository serviceHospitalierRepository;
    private final OrientationRepository orientationRepository;
    private final SortieRepository sortieRepository;
    private final TriageRepository triageRepository;
    private final DecisionIARepository decisionIARepository;

    @Override
    public DashboardStatsDTO getDashboardStats() {
        long totalPatients = patientRepository.count();
        long totalUtilisateursActifs = userRepository.findByActifTrue().size();

        List<ServiceHospitalier> services = serviceHospitalierRepository.findAll();
        long totalServices = services.size();
        long totalPlacesDisponibles = services.stream().mapToLong(ServiceHospitalier::getCapaciteDisponible).sum();
        long totalPlacesOccupees = services.stream()
                .mapToLong(s -> s.getCapaciteTotale() - s.getCapaciteDisponible())
                .sum();

        long patientsEnAttenteOrientation = orientationRepository.findAllByOrderByDateOrientationDesc().stream()
                .filter(o -> o.getStatutOrientation() == StatutOrientation.EN_ATTENTE)
                .count();

        LocalDateTime debutJournee = LocalDate.now().atStartOfDay();
        LocalDateTime finJournee = LocalDate.now().plusDays(1).atStartOfDay();
        long sortiesAujourdHui = sortieRepository.findAll().stream()
                .filter(s -> !s.getDateSortie().isBefore(debutJournee) && s.getDateSortie().isBefore(finJournee))
                .count();

        Map<String, Long> repartitionRoles = userRepository.findAll().stream()
                .collect(Collectors.groupingBy(u -> u.getRole().name(), Collectors.counting()));

        return new DashboardStatsDTO(
                totalPatients,
                totalUtilisateursActifs,
                totalServices,
                totalPlacesDisponibles,
                totalPlacesOccupees,
                patientsEnAttenteOrientation,
                sortiesAujourdHui,
                repartitionRoles,
                buildStatistiquesTriages(),
                buildStatistiquesDecisionsIA()
        );
    }

    /**
     * Construit les statistiques agrégées du module de triage :
     * répartition des patients par niveau de priorité et score NEWS2 moyen.
     */
    private StatistiquesTriagesDTO buildStatistiquesTriages() {
        List<Triage> triages = triageRepository.findAll();

        Map<String, Long> repartitionPriorite = triages.stream()
                .collect(Collectors.groupingBy(t -> t.getPriorite().name(), Collectors.counting()));

        double moyenneNews2 = triages.stream()
                .mapToInt(Triage::getScoreNews2)
                .average()
                .orElse(0.0);

        return new StatistiquesTriagesDTO(
                (long) triages.size(),
                repartitionPriorite,
                Math.round(moyenneNews2 * 100.0) / 100.0
        );
    }

    /**
     * Construit les statistiques agrégées du module de décision IA,
     * notamment le taux d'adhésion médicale (proportion de décisions validées
     * ou modifiées par rapport au total traité, hors décisions en attente).
     */
    private StatistiquesDecisionsIADTO buildStatistiquesDecisionsIA() {
        List<DecisionIA> decisions = decisionIARepository.findAll();

        long total = decisions.size();
        long validees = decisions.stream().filter(d -> d.getStatutValidation() == StatutValidation.VALIDEE).count();
        long rejetees = decisions.stream().filter(d -> d.getStatutValidation() == StatutValidation.REJETEE).count();
        long modifiees = decisions.stream().filter(d -> d.getStatutValidation() == StatutValidation.MODIFIEE).count();
        long enAttente = decisions.stream().filter(d -> d.getStatutValidation() == StatutValidation.EN_ATTENTE).count();

        long traitees = validees + rejetees + modifiees;
        double tauxAdhesion = traitees == 0 ? 0.0 : ((double) (validees + modifiees) / traitees) * 100.0;

        return new StatistiquesDecisionsIADTO(
                total,
                validees,
                rejetees,
                modifiees,
                enAttente,
                Math.round(tauxAdhesion * 100.0) / 100.0
        );
    }
}
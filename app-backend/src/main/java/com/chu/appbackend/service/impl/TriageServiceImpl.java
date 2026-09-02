package com.chu.appbackend.service.impl;

import com.chu.appbackend.dto.TriageRequestDTO;
import com.chu.appbackend.dto.TriageResponseDTO;
import com.chu.appbackend.entity.*;
import com.chu.appbackend.exception.BadRequestException;
import com.chu.appbackend.exception.ResourceNotFoundException;
import com.chu.appbackend.repository.PatientRepository;
import com.chu.appbackend.repository.TriageRepository;
import com.chu.appbackend.repository.UserRepository;
import com.chu.appbackend.service.TriageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

/**
 * Implémentation du service de triage intelligent.
 * Contient la logique métier de calcul des scores NEWS2 et ESI ainsi que
 * la détermination de la priorité de prise en charge du patient.
 */
@Service
@RequiredArgsConstructor
public class TriageServiceImpl implements TriageService {

    private final TriageRepository triageRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public TriageResponseDTO createTriage(TriageRequestDTO request) {
        Patient patient = patientRepository.findById(request.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable avec l'id : " + request.patientId()));

        User infirmier = userRepository.findById(request.infirmierId())
                .orElseThrow(() -> new ResourceNotFoundException("Infirmier introuvable avec l'id : " + request.infirmierId()));

        if (infirmier.getRole() != RoleType.INFIRMIER) {
            throw new BadRequestException("L'utilisateur désigné n'a pas le rôle INFIRMIER");
        }

        NiveauConscience niveauConscience = parseNiveauConscience(request.niveauConscience());

        int scoreNews2 = calculerScoreNews2(request, niveauConscience);
        String niveauRisqueNews2 = determinerNiveauRisqueNews2(scoreNews2);

        int age = Period.between(patient.getDateNaissance(), LocalDate.now()).getYears();
        int niveauEsi = calculerNiveauEsi(request, niveauConscience, age);

        PrioriteTriage priorite = determinerPriorite(scoreNews2, niveauEsi);

        Triage triage = Triage.builder()
                .patient(patient)
                .infirmier(infirmier)
                .poids(request.poids())
                .taille(request.taille())
                .frequenceRespiratoire(request.frequenceRespiratoire())
                .saturationOxygene(request.saturationOxygene())
                .oxygenoDependant(request.oxygenoDependant())
                .temperature(request.temperature())
                .pressionArterielleSystolique(request.pressionArterielleSystolique())
                .pressionArterielleDiastolique(request.pressionArterielleDiastolique())
                .frequenceCardiaque(request.frequenceCardiaque())
                .glycemie(request.glycemie())
                .niveauConscience(niveauConscience)
                .symptomes(request.symptomes())
                .douleurIntensite(request.douleurIntensite())
                .scoreNews2(scoreNews2)
                .niveauRisqueNews2(niveauRisqueNews2)
                .niveauEsi(niveauEsi)
                .priorite(priorite)
                .build();

        Triage saved = triageRepository.save(triage);
        return toResponseDTO(saved);
    }

    @Override
    public TriageResponseDTO getTriageById(Long id) {
        Triage triage = triageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Triage introuvable avec l'id : " + id));
        return toResponseDTO(triage);
    }

    @Override
    public List<TriageResponseDTO> getAllTriages() {
        return triageRepository.findAllByOrderByDateTriageDesc().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public List<TriageResponseDTO> getHistoriqueByPatient(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient introuvable avec l'id : " + patientId);
        }
        return triageRepository.findByPatientIdOrderByDateTriageDesc(patientId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    private int calculerScoreNews2(TriageRequestDTO r, NiveauConscience conscience) {
        int score = 0;

        int fr = r.frequenceRespiratoire();
        if (fr <= 8) score += 3;
        else if (fr <= 11) score += 1;
        else if (fr <= 20) score += 0;
        else if (fr <= 24) score += 2;
        else score += 3;

        int spo2 = r.saturationOxygene();
        if (spo2 <= 91) score += 3;
        else if (spo2 <= 93) score += 2;
        else if (spo2 <= 95) score += 1;
        else score += 0;

        if (Boolean.TRUE.equals(r.oxygenoDependant())) {
            score += 2;
        }

        double temp = r.temperature();
        if (temp <= 35.0) score += 3;
        else if (temp <= 36.0) score += 1;
        else if (temp <= 38.0) score += 0;
        else if (temp <= 39.0) score += 1;
        else score += 2;

        int pas = r.pressionArterielleSystolique();
        if (pas <= 90) score += 3;
        else if (pas <= 100) score += 2;
        else if (pas <= 110) score += 1;
        else if (pas <= 219) score += 0;
        else score += 3;

        int fc = r.frequenceCardiaque();
        if (fc <= 40) score += 3;
        else if (fc <= 50) score += 1;
        else if (fc <= 90) score += 0;
        else if (fc <= 110) score += 1;
        else if (fc <= 130) score += 2;
        else score += 3;

        if (conscience != NiveauConscience.ALERTE) {
            score += 3;
        }

        return score;
    }

    private String determinerNiveauRisqueNews2(int score) {
        if (score >= 7) return "RISQUE_ELEVE";
        if (score >= 5) return "RISQUE_MOYEN";
        if (score >= 1) return "RISQUE_FAIBLE";
        return "RISQUE_MINIME";
    }

    private int calculerNiveauEsi(TriageRequestDTO r, NiveauConscience conscience, int age) {
        boolean detresseVitale = conscience == NiveauConscience.INCONSCIENT
                || r.saturationOxygene() < 85
                || r.frequenceRespiratoire() < 8
                || r.pressionArterielleSystolique() < 70
                || r.frequenceCardiaque() < 30 || r.frequenceCardiaque() > 180;

        if (detresseVitale) {
            return 1;
        }

        boolean hautRisque = conscience == NiveauConscience.REACTION_DOULEUR
                || r.saturationOxygene() < 90
                || r.frequenceRespiratoire() > 30
                || r.pressionArterielleSystolique() < 90
                || (r.douleurIntensite() != null && r.douleurIntensite() >= 8)
                || age >= 75;

        if (hautRisque) {
            return 2;
        }

        boolean ressourcesMultiples = r.oxygenoDependant()
                || (r.douleurIntensite() != null && r.douleurIntensite() >= 5)
                || r.frequenceCardiaque() > 120
                || r.temperature() >= 39.0;

        if (ressourcesMultiples) {
            return 3;
        }

        boolean uneRessource = (r.douleurIntensite() != null && r.douleurIntensite() >= 2)
                || r.temperature() > 37.5;

        if (uneRessource) {
            return 4;
        }

        return 5;
    }

    private PrioriteTriage determinerPriorite(int scoreNews2, int niveauEsi) {
        if (niveauEsi == 1 || scoreNews2 >= 7) {
            return PrioriteTriage.P1_VITALE;
        }
        if (niveauEsi == 2 || scoreNews2 >= 5) {
            return PrioriteTriage.P2_MAJEURE;
        }
        if (niveauEsi == 3 || scoreNews2 >= 3) {
            return PrioriteTriage.P3_MODEREE;
        }
        if (niveauEsi == 4 || scoreNews2 >= 1) {
            return PrioriteTriage.P4_MINEURE;
        }
        return PrioriteTriage.P5_NON_URGENTE;
    }

    private NiveauConscience parseNiveauConscience(String value) {
        try {
            return NiveauConscience.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Niveau de conscience invalide : " + value);
        }
    }

    private TriageResponseDTO toResponseDTO(Triage t) {
        return new TriageResponseDTO(
                t.getId(),
                t.getPatient().getId(),
                t.getPatient().getNom() + " " + t.getPatient().getPrenom(),
                t.getInfirmier().getId(),
                t.getInfirmier().getNom() + " " + t.getInfirmier().getPrenom(),
                t.getFrequenceRespiratoire(),
                t.getSaturationOxygene(),
                t.getOxygenoDependant(),
                t.getTemperature(),
                t.getPressionArterielleSystolique(),
                t.getFrequenceCardiaque(),
                t.getNiveauConscience().name(),
                t.getSymptomes(),
                t.getDouleurIntensite(),
                t.getScoreNews2(),
                t.getNiveauRisqueNews2(),
                t.getNiveauEsi(),
                t.getPriorite().name(),
                t.getDateTriage()
        );
    }
}
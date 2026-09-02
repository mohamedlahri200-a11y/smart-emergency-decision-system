package com.chu.appbackend.service.impl;

import com.chu.appbackend.dto.SortieRequestDTO;
import com.chu.appbackend.dto.SortieResponseDTO;
import com.chu.appbackend.entity.Consultation;
import com.chu.appbackend.entity.EvolutionPatient;
import com.chu.appbackend.entity.RoleType;
import com.chu.appbackend.entity.Sortie;
import com.chu.appbackend.entity.TypeSortie;
import com.chu.appbackend.entity.User;
import com.chu.appbackend.exception.BadRequestException;
import com.chu.appbackend.exception.DuplicateResourceException;
import com.chu.appbackend.exception.ResourceNotFoundException;
import com.chu.appbackend.repository.ConsultationRepository;
import com.chu.appbackend.repository.PatientRepository;
import com.chu.appbackend.repository.SortieRepository;
import com.chu.appbackend.repository.UserRepository;
import com.chu.appbackend.service.SortieService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implémentation du service de gestion de la sortie des patients.
 * Clôture le parcours de soins en enregistrant le type de sortie
 * et l'évolution clinique observée.
 */
@Service
@RequiredArgsConstructor
public class SortieServiceImpl implements SortieService {

    private final SortieRepository sortieRepository;
    private final ConsultationRepository consultationRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    @Override
    @Transactional
    public SortieResponseDTO enregistrerSortie(SortieRequestDTO request) {
        Consultation consultation = consultationRepository.findById(request.consultationId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation introuvable avec l'id : " + request.consultationId()));

        if (sortieRepository.findByConsultationId(consultation.getId()).isPresent()) {
            throw new DuplicateResourceException("Une sortie est déjà enregistrée pour cette consultation");
        }

        User medecin = userRepository.findById(request.medecinId())
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable avec l'id : " + request.medecinId()));

        if (medecin.getRole() != RoleType.MEDECIN) {
            throw new BadRequestException("Seul un utilisateur avec le rôle MEDECIN peut valider une sortie");
        }

        Sortie sortie = Sortie.builder()
                .patient(consultation.getPatient())
                .consultation(consultation)
                .medecin(medecin)
                .typeSortie(parseTypeSortie(request.typeSortie()))
                .evolutionPatient(parseEvolution(request.evolutionPatient()))
                .observationsSortie(request.observationsSortie())
                .build();

        return toResponseDTO(sortieRepository.save(sortie));
    }

    @Override
    public SortieResponseDTO getSortieById(Long id) {
        return toResponseDTO(findSortieOrThrow(id));
    }

    @Override
    public List<SortieResponseDTO> getHistoriqueByPatient(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient introuvable avec l'id : " + patientId);
        }
        return sortieRepository.findByPatientIdOrderByDateSortieDesc(patientId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    private Sortie findSortieOrThrow(Long id) {
        return sortieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sortie introuvable avec l'id : " + id));
    }

    private TypeSortie parseTypeSortie(String value) {
        try {
            return TypeSortie.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Type de sortie invalide : " + value);
        }
    }

    private EvolutionPatient parseEvolution(String value) {
        try {
            return EvolutionPatient.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Évolution patient invalide : " + value);
        }
    }

    private SortieResponseDTO toResponseDTO(Sortie s) {
        return new SortieResponseDTO(
                s.getId(),
                s.getPatient().getId(),
                s.getPatient().getNom() + " " + s.getPatient().getPrenom(),
                s.getConsultation().getId(),
                s.getMedecin().getId(),
                s.getMedecin().getNom() + " " + s.getMedecin().getPrenom(),
                s.getTypeSortie().name(),
                s.getEvolutionPatient().name(),
                s.getObservationsSortie(),
                s.getDateSortie()
        );
    }
}
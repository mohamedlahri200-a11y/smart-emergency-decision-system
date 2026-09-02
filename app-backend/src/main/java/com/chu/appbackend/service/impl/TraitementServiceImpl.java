package com.chu.appbackend.service.impl;

import com.chu.appbackend.dto.TraitementRequestDTO;
import com.chu.appbackend.dto.TraitementResponseDTO;
import com.chu.appbackend.entity.Patient;
import com.chu.appbackend.entity.StatutTraitement;
import com.chu.appbackend.entity.Traitement;
import com.chu.appbackend.exception.BadRequestException;
import com.chu.appbackend.exception.ResourceNotFoundException;
import com.chu.appbackend.repository.PatientRepository;
import com.chu.appbackend.repository.TraitementRepository;
import com.chu.appbackend.service.TraitementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Implementation du service de suivi des traitements medicamenteux.
 */
@Service
@RequiredArgsConstructor
public class TraitementServiceImpl implements TraitementService {

    private final TraitementRepository traitementRepository;
    private final PatientRepository patientRepository;

    @Override
    @Transactional
    public TraitementResponseDTO createTraitement(TraitementRequestDTO request) {
        Patient patient = patientRepository.findById(request.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable avec l'id : " + request.patientId()));

        if (request.dateFin() != null && request.dateFin().isBefore(request.dateDebut())) {
            throw new BadRequestException("La date de fin ne peut pas etre anterieure a la date de debut");
        }

        Traitement traitement = Traitement.builder()
                .patient(patient)
                .medicament(request.medicament())
                .posologie(request.posologie())
                .dateDebut(request.dateDebut())
                .dateFin(request.dateFin())
                .statut(StatutTraitement.EN_COURS)
                .observations(request.observations())
                .build();

        return toResponseDTO(traitementRepository.save(traitement));
    }

    @Override
    public TraitementResponseDTO getTraitementById(Long id) {
        return toResponseDTO(findTraitementOrThrow(id));
    }

    @Override
    public List<TraitementResponseDTO> getHistoriqueByPatient(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient introuvable avec l'id : " + patientId);
        }
        return traitementRepository.findByPatientIdOrderByDateDebutDesc(patientId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public TraitementResponseDTO arreterTraitement(Long id, String observations) {
        Traitement traitement = findTraitementOrThrow(id);
        traitement.setStatut(StatutTraitement.ARRETE);
        traitement.setDateFin(LocalDate.now());
        traitement.setObservations(observations);
        return toResponseDTO(traitementRepository.save(traitement));
    }

    @Override
    @Transactional
    public TraitementResponseDTO terminerTraitement(Long id) {
        Traitement traitement = findTraitementOrThrow(id);
        traitement.setStatut(StatutTraitement.TERMINE);
        if (traitement.getDateFin() == null) {
            traitement.setDateFin(LocalDate.now());
        }
        return toResponseDTO(traitementRepository.save(traitement));
    }

    private Traitement findTraitementOrThrow(Long id) {
        return traitementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Traitement introuvable avec l'id : " + id));
    }

    private TraitementResponseDTO toResponseDTO(Traitement t) {
        return new TraitementResponseDTO(
                t.getId(),
                t.getPatient().getId(),
                t.getPatient().getNom() + " " + t.getPatient().getPrenom(),
                t.getOrdonnanceLigne() != null ? t.getOrdonnanceLigne().getId() : null,
                t.getMedicament(),
                t.getPosologie(),
                t.getDateDebut(),
                t.getDateFin(),
                t.getStatut().name(),
                t.getObservations(),
                t.getDateEnregistrement()
        );
    }
}
package com.chu.appbackend.service.impl;

import com.chu.appbackend.dto.ConsultationRequestDTO;
import com.chu.appbackend.dto.ConsultationResponseDTO;
import com.chu.appbackend.dto.ExamenResponseDTO;
import com.chu.appbackend.entity.Consultation;
import com.chu.appbackend.entity.Examen;
import com.chu.appbackend.entity.Patient;
import com.chu.appbackend.entity.RoleType;
import com.chu.appbackend.entity.User;
import com.chu.appbackend.exception.BadRequestException;
import com.chu.appbackend.exception.ResourceNotFoundException;
import com.chu.appbackend.repository.ConsultationRepository;
import com.chu.appbackend.repository.PatientRepository;
import com.chu.appbackend.repository.UserRepository;
import com.chu.appbackend.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

/**
 * Implementation du service de gestion des consultations medicales.
 */
@Service
@RequiredArgsConstructor
public class ConsultationServiceImpl implements ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ConsultationResponseDTO createConsultation(ConsultationRequestDTO request) {
        Patient patient = patientRepository.findById(request.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable avec l'id : " + request.patientId()));

        User medecin = userRepository.findById(request.medecinId())
                .orElseThrow(() -> new ResourceNotFoundException("Medecin introuvable avec l'id : " + request.medecinId()));

        if (medecin.getRole() != RoleType.MEDECIN) {
            throw new BadRequestException("Seul un utilisateur avec le role MEDECIN peut realiser une consultation");
        }

        Consultation consultation = Consultation.builder()
                .patient(patient)
                .medecin(medecin)
                .motif(request.motif())
                .diagnostic(request.diagnostic())
                .observationsCliniques(request.observationsCliniques())
                .build();

        return toResponseDTO(consultationRepository.save(consultation));
    }

    @Override
    public ConsultationResponseDTO getConsultationById(Long id) {
        return toResponseDTO(findConsultationOrThrow(id));
    }

    @Override
    public List<ConsultationResponseDTO> getAllConsultations() {
        return consultationRepository.findAllByOrderByDateConsultationDesc().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public List<ConsultationResponseDTO> getHistoriqueByPatient(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient introuvable avec l'id : " + patientId);
        }
        return consultationRepository.findByPatientIdOrderByDateConsultationDesc(patientId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public ConsultationResponseDTO updateDiagnostic(Long id, String diagnostic, String observationsCliniques) {
        Consultation consultation = findConsultationOrThrow(id);
        consultation.setDiagnostic(diagnostic);
        consultation.setObservationsCliniques(observationsCliniques);
        return toResponseDTO(consultationRepository.save(consultation));
    }

    private Consultation findConsultationOrThrow(Long id) {
        return consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation introuvable avec l'id : " + id));
    }

    private ConsultationResponseDTO toResponseDTO(Consultation c) {
        List<ExamenResponseDTO> examens = c.getExamens().stream()
                .map(this::toExamenResponseDTO)
                .toList();

        return new ConsultationResponseDTO(
                c.getId(),
                c.getPatient().getId(),
                c.getPatient().getNom() + " " + c.getPatient().getPrenom(),
                c.getMedecin().getId(),
                c.getMedecin().getNom() + " " + c.getMedecin().getPrenom(),
                c.getMotif(),
                c.getDiagnostic(),
                c.getObservationsCliniques(),
                examens,
                c.getDateConsultation()
        );
    }

    private ExamenResponseDTO toExamenResponseDTO(Examen e) {
        Consultation c = e.getConsultation();

        List<String> motsCles = (e.getMotsClesCritiquesDetectes() == null || e.getMotsClesCritiquesDetectes().isBlank())
                ? List.of()
                : Arrays.stream(e.getMotsClesCritiquesDetectes().split(",\\s*")).toList();

        return new ExamenResponseDTO(
                e.getId(),
                c.getId(),
                c.getPatient().getId(),
                c.getPatient().getNom() + " " + c.getPatient().getPrenom(),
                c.getMedecin().getId(),
                c.getMedecin().getNom() + " " + c.getMedecin().getPrenom(),
                e.getTypeExamen(),
                e.getCategorieExamen().name(),
                e.getDescription(),
                e.getStatutExamen().name(),
                e.getResultat(),
                e.getCheminImage(),
                e.getCompteRenduCritique(),
                motsCles,
                e.getDatePrescription(),
                e.getDateResultat()
        );
    }
}
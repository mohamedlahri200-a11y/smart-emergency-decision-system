package com.chu.appbackend.service.impl;

import com.chu.appbackend.dto.PatientRequestDTO;
import com.chu.appbackend.dto.PatientResponseDTO;
import com.chu.appbackend.dto.PatientSearchCriteriaDTO;
import com.chu.appbackend.entity.Patient;
import com.chu.appbackend.entity.Sexe;
import com.chu.appbackend.exception.BadRequestException;
import com.chu.appbackend.exception.DuplicateResourceException;
import com.chu.appbackend.exception.ResourceNotFoundException;
import com.chu.appbackend.repository.PatientRepository;
import com.chu.appbackend.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.time.Year;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Implémentation du service de gestion des patients.
 * Gère la génération du numéro de dossier, le CRUD et la recherche multicritère.
 */
@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    @Override
    @Transactional
    public PatientResponseDTO createPatient(PatientRequestDTO request) {
        if (request.cin() != null && !request.cin().isBlank() && patientRepository.existsByCin(request.cin())) {
            throw new DuplicateResourceException("Un patient existe déjà avec le CIN : " + request.cin());
        }

        Patient patient = Patient.builder()
                .numeroDossier(generateNumeroDossier())
                .nom(request.nom())
                .prenom(request.prenom())
                .cin(request.cin())
                .dateNaissance(request.dateNaissance())
                .sexe(parseSexe(request.sexe()))
                .telephone(request.telephone())
                .adresse(request.adresse())
                .groupeSanguin(request.groupeSanguin())
                .antecedents(request.antecedents())
                .allergies(request.allergies())
                .personneAContacter(request.personneAContacter())
                .telephoneContact(request.telephoneContact())
                .build();

        Patient saved = patientRepository.save(patient);
        return toResponseDTO(saved);
    }

    @Override
    public PatientResponseDTO getPatientById(Long id) {
        return toResponseDTO(findPatientOrThrow(id));
    }

    @Override
    public List<PatientResponseDTO> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public PatientResponseDTO updatePatient(Long id, PatientRequestDTO request) {
        Patient patient = findPatientOrThrow(id);

        if (request.cin() != null && !request.cin().isBlank()
                && !request.cin().equals(patient.getCin())
                && patientRepository.existsByCin(request.cin())) {
            throw new DuplicateResourceException("Un patient existe déjà avec le CIN : " + request.cin());
        }

        patient.setNom(request.nom());
        patient.setPrenom(request.prenom());
        patient.setCin(request.cin());
        patient.setDateNaissance(request.dateNaissance());
        patient.setSexe(parseSexe(request.sexe()));
        patient.setTelephone(request.telephone());
        patient.setAdresse(request.adresse());
        patient.setGroupeSanguin(request.groupeSanguin());
        patient.setAntecedents(request.antecedents());
        patient.setAllergies(request.allergies());
        patient.setPersonneAContacter(request.personneAContacter());
        patient.setTelephoneContact(request.telephoneContact());

        return toResponseDTO(patientRepository.save(patient));
    }

    @Override
    @Transactional
    public void deletePatient(Long id) {
        Patient patient = findPatientOrThrow(id);
        patientRepository.delete(patient);
    }

    @Override
    public List<PatientResponseDTO> searchPatients(PatientSearchCriteriaDTO criteria) {
        List<Patient> results = patientRepository.searchByCriteria(
                blankToNull(criteria.nom()),
                blankToNull(criteria.prenom()),
                blankToNull(criteria.cin()),
                blankToNull(criteria.numeroDossier()),
                blankToNull(criteria.telephone())
        );
        return results.stream().map(this::toResponseDTO).toList();
    }

    private Patient findPatientOrThrow(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable avec l'id : " + id));
    }

    private Sexe parseSexe(String sexe) {
        try {
            return Sexe.valueOf(sexe.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Sexe invalide : " + sexe);
        }
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }

    /**
     * Génère un numéro de dossier unique au format URG-{année}-{séquence}.
     * La séquence repose sur le nombre total de patients déjà enregistrés,
     * incrémenté de manière thread-safe pour cette instance de service.
     */
    private final AtomicLong sequenceGenerator = new AtomicLong(-1);

    private synchronized String generateNumeroDossier() {
        if (sequenceGenerator.get() == -1) {
            sequenceGenerator.set(patientRepository.count());
        }
        long next = sequenceGenerator.incrementAndGet();
        return "URG-" + Year.now().getValue() + "-" + String.format("%06d", next);
    }

    private Integer calculateAge(LocalDate dateNaissance) {
        return Period.between(dateNaissance, LocalDate.now()).getYears();
    }

    private PatientResponseDTO toResponseDTO(Patient patient) {
        return new PatientResponseDTO(
                patient.getId(),
                patient.getNumeroDossier(),
                patient.getNom(),
                patient.getPrenom(),
                patient.getCin(),
                patient.getDateNaissance(),
                calculateAge(patient.getDateNaissance()),
                patient.getSexe().name(),
                patient.getTelephone(),
                patient.getAdresse(),
                patient.getGroupeSanguin(),
                patient.getAntecedents(),
                patient.getAllergies(),
                patient.getPersonneAContacter(),
                patient.getTelephoneContact(),
                patient.getDateEnregistrement()
        );
    }
}
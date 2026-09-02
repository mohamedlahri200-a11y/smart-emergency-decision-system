package com.chu.appbackend.service;

import com.chu.appbackend.dto.PatientRequestDTO;
import com.chu.appbackend.dto.PatientResponseDTO;
import com.chu.appbackend.dto.PatientSearchCriteriaDTO;

import java.util.List;

/**
 * Contrat de service pour la gestion des patients.
 */
public interface PatientService {

    PatientResponseDTO createPatient(PatientRequestDTO request);

    PatientResponseDTO getPatientById(Long id);

    List<PatientResponseDTO> getAllPatients();

    PatientResponseDTO updatePatient(Long id, PatientRequestDTO request);

    void deletePatient(Long id);

    List<PatientResponseDTO> searchPatients(PatientSearchCriteriaDTO criteria);
}
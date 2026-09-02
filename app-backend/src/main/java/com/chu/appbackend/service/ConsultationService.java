package com.chu.appbackend.service;

import com.chu.appbackend.dto.ConsultationRequestDTO;
import com.chu.appbackend.dto.ConsultationResponseDTO;

import java.util.List;

/**
 * Contrat de service pour la gestion des consultations médicales.
 */
public interface ConsultationService {

    ConsultationResponseDTO createConsultation(ConsultationRequestDTO request);

    ConsultationResponseDTO getConsultationById(Long id);

    List<ConsultationResponseDTO> getAllConsultations();

    List<ConsultationResponseDTO> getHistoriqueByPatient(Long patientId);

    ConsultationResponseDTO updateDiagnostic(Long id, String diagnostic, String observationsCliniques);
}
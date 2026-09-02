package com.chu.appbackend.service;

import com.chu.appbackend.dto.TriageRequestDTO;
import com.chu.appbackend.dto.TriageResponseDTO;

import java.util.List;

/**
 * Contrat de service pour la gestion du triage intelligent.
 * Assure la saisie des constantes vitales et le calcul des scores cliniques
 * (NEWS2, ESI) permettant de déterminer la priorité de prise en charge.
 */
public interface TriageService {

    TriageResponseDTO createTriage(TriageRequestDTO request);

    TriageResponseDTO getTriageById(Long id);

    List<TriageResponseDTO> getAllTriages();

    List<TriageResponseDTO> getHistoriqueByPatient(Long patientId);
}
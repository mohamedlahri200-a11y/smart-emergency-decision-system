package com.chu.appbackend.service;

import com.chu.appbackend.dto.SortieRequestDTO;
import com.chu.appbackend.dto.SortieResponseDTO;

import java.util.List;

/**
 * Contrat de service pour l'enregistrement de la sortie des patients.
 */
public interface SortieService {

    SortieResponseDTO enregistrerSortie(SortieRequestDTO request);

    SortieResponseDTO getSortieById(Long id);

    List<SortieResponseDTO> getHistoriqueByPatient(Long patientId);
}
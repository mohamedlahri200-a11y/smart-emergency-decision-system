package com.chu.appbackend.service;

import com.chu.appbackend.dto.TraitementRequestDTO;
import com.chu.appbackend.dto.TraitementResponseDTO;

import java.util.List;

/**
 * Contrat de service pour le suivi des traitements medicamenteux des patients.
 */
public interface TraitementService {

    TraitementResponseDTO createTraitement(TraitementRequestDTO request);

    TraitementResponseDTO getTraitementById(Long id);

    List<TraitementResponseDTO> getHistoriqueByPatient(Long patientId);

    TraitementResponseDTO arreterTraitement(Long id, String observations);

    TraitementResponseDTO terminerTraitement(Long id);
}


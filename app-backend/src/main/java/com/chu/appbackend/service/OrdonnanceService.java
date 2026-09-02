package com.chu.appbackend.service;

import com.chu.appbackend.dto.OrdonnanceRequestDTO;
import com.chu.appbackend.dto.OrdonnanceResponseDTO;

/**
 * Contrat de service pour la gestion des ordonnances médicales.
 */
public interface OrdonnanceService {

    OrdonnanceResponseDTO creerOrdonnance(OrdonnanceRequestDTO request);

    OrdonnanceResponseDTO getOrdonnanceById(Long id);

    OrdonnanceResponseDTO getOrdonnanceByConsultation(Long consultationId);
}
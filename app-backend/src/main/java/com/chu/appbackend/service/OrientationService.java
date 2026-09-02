
package com.chu.appbackend.service;

import com.chu.appbackend.dto.OrientationAutomatiqueRequestDTO;
import com.chu.appbackend.dto.OrientationRequestDTO;
import com.chu.appbackend.dto.OrientationResponseDTO;

import java.util.List;

/**
 * Contrat de service pour le module d'orientation des patients.
 */
public interface OrientationService {

    OrientationResponseDTO orienterManuellement(OrientationRequestDTO request);

    OrientationResponseDTO orienterAutomatiquement(OrientationAutomatiqueRequestDTO request);

    OrientationResponseDTO getOrientationById(Long id);

    List<OrientationResponseDTO> getAllOrientations();

    List<OrientationResponseDTO> getHistoriqueByPatient(Long patientId);

    OrientationResponseDTO confirmerOrientation(Long id);

    OrientationResponseDTO annulerOrientation(Long id);
}





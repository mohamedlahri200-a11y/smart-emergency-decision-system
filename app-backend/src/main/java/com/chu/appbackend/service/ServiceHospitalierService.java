





























package com.chu.appbackend.service;

import com.chu.appbackend.dto.ServiceHospitalierRequestDTO;
import com.chu.appbackend.dto.ServiceHospitalierResponseDTO;

import java.util.List;

/**
 * Contrat de service pour la gestion du référentiel des services hospitaliers.
 */
public interface ServiceHospitalierService {

    ServiceHospitalierResponseDTO createService(ServiceHospitalierRequestDTO request);

    ServiceHospitalierResponseDTO getServiceById(Long id);

    List<ServiceHospitalierResponseDTO> getAllServices();

    List<ServiceHospitalierResponseDTO> getServicesDisponibles();

    ServiceHospitalierResponseDTO updateService(Long id, ServiceHospitalierRequestDTO request);

    void deleteService(Long id);

    void deactivateService(Long id);

    void activateService(Long id);
}
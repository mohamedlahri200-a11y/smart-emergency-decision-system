package com.chu.appbackend.service.impl;

import com.chu.appbackend.dto.ServiceHospitalierRequestDTO;
import com.chu.appbackend.dto.ServiceHospitalierResponseDTO;
import com.chu.appbackend.entity.ServiceHospitalier;
import com.chu.appbackend.exception.BadRequestException;
import com.chu.appbackend.exception.DuplicateResourceException;
import com.chu.appbackend.exception.ResourceNotFoundException;
import com.chu.appbackend.repository.ServiceHospitalierRepository;
import com.chu.appbackend.service.ServiceHospitalierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implémentation du service de gestion du référentiel des services hospitaliers.
 */
@Service
@RequiredArgsConstructor
public class ServiceHospitalierServiceImpl implements ServiceHospitalierService {

    private final ServiceHospitalierRepository serviceHospitalierRepository;

    @Override
    @Transactional
    public ServiceHospitalierResponseDTO createService(ServiceHospitalierRequestDTO request) {
        if (serviceHospitalierRepository.existsByNom(request.nom())) {
            throw new DuplicateResourceException("Un service existe deja avec le nom : " + request.nom());
        }

        ServiceHospitalier service = ServiceHospitalier.builder()
                .nom(request.nom())
                .description(request.description())
                .capaciteTotale(request.capaciteTotale())
                .capaciteDisponible(request.capaciteTotale())
                .actif(true)
                .build();

        return toResponseDTO(serviceHospitalierRepository.save(service));
    }

    @Override
    public ServiceHospitalierResponseDTO getServiceById(Long id) {
        return toResponseDTO(findServiceOrThrow(id));
    }

    @Override
    public List<ServiceHospitalierResponseDTO> getAllServices() {
        return serviceHospitalierRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public List<ServiceHospitalierResponseDTO> getServicesDisponibles() {
        return serviceHospitalierRepository.findByActifTrueAndCapaciteDisponibleGreaterThan(0).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public ServiceHospitalierResponseDTO updateService(Long id, ServiceHospitalierRequestDTO request) {
        ServiceHospitalier service = findServiceOrThrow(id);

        if (!service.getNom().equalsIgnoreCase(request.nom())
                && serviceHospitalierRepository.existsByNom(request.nom())) {
            throw new DuplicateResourceException("Un service existe deja avec le nom : " + request.nom());
        }

        int placesOccupees = service.getCapaciteTotale() - service.getCapaciteDisponible();

        if (request.capaciteTotale() < placesOccupees) {
            throw new BadRequestException("La nouvelle capacite totale est inferieure au nombre de places deja occupees");
        }

        service.setNom(request.nom());
        service.setDescription(request.description());
        service.setCapaciteTotale(request.capaciteTotale());
        service.setCapaciteDisponible(request.capaciteTotale() - placesOccupees);

        return toResponseDTO(serviceHospitalierRepository.save(service));
    }

    @Override
    @Transactional
    public void deleteService(Long id) {
        ServiceHospitalier service = findServiceOrThrow(id);
        serviceHospitalierRepository.delete(service);
    }

    @Override
    @Transactional
    public void deactivateService(Long id) {
        ServiceHospitalier service = findServiceOrThrow(id);
        service.setActif(false);
        serviceHospitalierRepository.save(service);
    }

    @Override
    @Transactional
    public void activateService(Long id) {
        ServiceHospitalier service = findServiceOrThrow(id);
        service.setActif(true);
        serviceHospitalierRepository.save(service);
    }

    private ServiceHospitalier findServiceOrThrow(Long id) {
        return serviceHospitalierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service hospitalier introuvable avec l'id : " + id));
    }

    private ServiceHospitalierResponseDTO toResponseDTO(ServiceHospitalier s) {
        return new ServiceHospitalierResponseDTO(
                s.getId(),
                s.getNom(),
                s.getDescription(),
                s.getCapaciteTotale(),
                s.getCapaciteDisponible(),
                s.getActif()
        );
    }
}
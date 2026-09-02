package com.chu.appbackend.service.impl;

import com.chu.appbackend.dto.OrientationAutomatiqueRequestDTO;
import com.chu.appbackend.dto.OrientationRequestDTO;
import com.chu.appbackend.dto.OrientationResponseDTO;
import com.chu.appbackend.entity.DecisionIA;
import com.chu.appbackend.entity.Orientation;
import com.chu.appbackend.entity.Patient;
import com.chu.appbackend.entity.ServiceHospitalier;
import com.chu.appbackend.entity.StatutOrientation;
import com.chu.appbackend.entity.StatutValidation;
import com.chu.appbackend.entity.TypeOrientation;
import com.chu.appbackend.entity.User;
import com.chu.appbackend.exception.BadRequestException;
import com.chu.appbackend.exception.ResourceNotFoundException;
import com.chu.appbackend.repository.DecisionIARepository;
import com.chu.appbackend.repository.OrientationRepository;
import com.chu.appbackend.repository.PatientRepository;
import com.chu.appbackend.repository.ServiceHospitalierRepository;
import com.chu.appbackend.repository.UserRepository;
import com.chu.appbackend.service.OrientationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Implementation du service d'orientation des patients.
 */
@Service
@RequiredArgsConstructor
public class OrientationServiceImpl implements OrientationService {

    private final OrientationRepository orientationRepository;
    private final PatientRepository patientRepository;
    private final ServiceHospitalierRepository serviceHospitalierRepository;
    private final UserRepository userRepository;
    private final DecisionIARepository decisionIARepository;

    @Override
    @Transactional
    public OrientationResponseDTO orienterManuellement(OrientationRequestDTO request) {
        Patient patient = patientRepository.findById(request.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable avec l'id : " + request.patientId()));

        ServiceHospitalier service = reserverPlace(request.serviceHospitalierId());

        User responsable = userRepository.findById(request.responsableId())
                .orElseThrow(() -> new ResourceNotFoundException("Responsable introuvable avec l'id : " + request.responsableId()));

        DecisionIA decisionIA = null;
        if (request.decisionIAId() != null) {
            decisionIA = decisionIARepository.findById(request.decisionIAId())
                    .orElseThrow(() -> new ResourceNotFoundException("Decision IA introuvable avec l'id : " + request.decisionIAId()));
        }

        Orientation orientation = Orientation.builder()
                .patient(patient)
                .decisionIA(decisionIA)
                .serviceHospitalier(service)
                .responsable(responsable)
                .typeOrientation(TypeOrientation.MANUELLE)
                .motif(request.motif())
                .statutOrientation(StatutOrientation.EN_ATTENTE)
                .build();

        return toResponseDTO(orientationRepository.save(orientation));
    }

    @Override
    @Transactional
    public OrientationResponseDTO orienterAutomatiquement(OrientationAutomatiqueRequestDTO request) {
        DecisionIA decisionIA = decisionIARepository.findById(request.decisionIAId())
                .orElseThrow(() -> new ResourceNotFoundException("Decision IA introuvable avec l'id : " + request.decisionIAId()));

        if (decisionIA.getStatutValidation() != StatutValidation.VALIDEE
                && decisionIA.getStatutValidation() != StatutValidation.MODIFIEE) {
            throw new BadRequestException("L'orientation automatique requiert une decision IA validee ou modifiee par un medecin");
        }

        if (orientationRepository.findByDecisionIAId(decisionIA.getId()).isPresent()) {
            throw new BadRequestException("Une orientation existe deja pour cette decision IA");
        }

        if (decisionIA.getRecommandationService() == null || decisionIA.getRecommandationService().isBlank()) {
            throw new BadRequestException("La decision IA ne contient aucune recommandation de service exploitable");
        }

        ServiceHospitalier serviceCible = serviceHospitalierRepository.findByNom(decisionIA.getRecommandationService())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun service hospitalier ne correspond a la recommandation : " + decisionIA.getRecommandationService()));

        ServiceHospitalier service = reserverPlace(serviceCible.getId());

        User responsable = userRepository.findById(request.responsableId())
                .orElseThrow(() -> new ResourceNotFoundException("Responsable introuvable avec l'id : " + request.responsableId()));

        Orientation orientation = Orientation.builder()
                .patient(decisionIA.getPatient())
                .decisionIA(decisionIA)
                .serviceHospitalier(service)
                .responsable(responsable)
                .typeOrientation(TypeOrientation.AUTOMATIQUE)
                .motif("Orientation automatique basee sur la recommandation IA : " + decisionIA.getClassePredite())
                .statutOrientation(StatutOrientation.EN_ATTENTE)
                .build();

        return toResponseDTO(orientationRepository.save(orientation));
    }

    @Override
    public OrientationResponseDTO getOrientationById(Long id) {
        return toResponseDTO(findOrientationOrThrow(id));
    }

    @Override
    public List<OrientationResponseDTO> getAllOrientations() {
        return orientationRepository.findAllByOrderByDateOrientationDesc().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public List<OrientationResponseDTO> getHistoriqueByPatient(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient introuvable avec l'id : " + patientId);
        }
        return orientationRepository.findByPatientIdOrderByDateOrientationDesc(patientId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public OrientationResponseDTO confirmerOrientation(Long id) {
        Orientation orientation = findOrientationOrThrow(id);

        if (orientation.getStatutOrientation() != StatutOrientation.EN_ATTENTE) {
            throw new BadRequestException("Seule une orientation en attente peut etre confirmee");
        }

        orientation.setStatutOrientation(StatutOrientation.CONFIRMEE);
        orientation.setDateConfirmation(LocalDateTime.now());

        return toResponseDTO(orientationRepository.save(orientation));
    }

    @Override
    @Transactional
    public OrientationResponseDTO annulerOrientation(Long id) {
        Orientation orientation = findOrientationOrThrow(id);

        if (orientation.getStatutOrientation() == StatutOrientation.ANNULEE) {
            throw new BadRequestException("Cette orientation est deja annulee");
        }

        libererPlace(orientation.getServiceHospitalier().getId());

        orientation.setStatutOrientation(StatutOrientation.ANNULEE);

        return toResponseDTO(orientationRepository.save(orientation));
    }

    /**
     * Reserve une place dans le service hospitalier cible en decrementant
     * sa capacite disponible. Leve une exception si le service est plein ou inactif.
     */
    private ServiceHospitalier reserverPlace(Long serviceId) {
        ServiceHospitalier service = serviceHospitalierRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service hospitalier introuvable avec l'id : " + serviceId));

        if (!Boolean.TRUE.equals(service.getActif())) {
            throw new BadRequestException("Le service hospitalier cible est actuellement inactif");
        }

        if (service.getCapaciteDisponible() <= 0) {
            throw new BadRequestException("Le service hospitalier cible ne dispose d'aucune place disponible");
        }

        service.setCapaciteDisponible(service.getCapaciteDisponible() - 1);
        return serviceHospitalierRepository.save(service);
    }

    /**
     * Libere une place precedemment reservee dans un service hospitalier,
     * sans depasser sa capacite totale.
     */
    private void libererPlace(Long serviceId) {
        ServiceHospitalier service = serviceHospitalierRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service hospitalier introuvable avec l'id : " + serviceId));

        if (service.getCapaciteDisponible() < service.getCapaciteTotale()) {
            service.setCapaciteDisponible(service.getCapaciteDisponible() + 1);
            serviceHospitalierRepository.save(service);
        }
    }

    private Orientation findOrientationOrThrow(Long id) {
        return orientationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orientation introuvable avec l'id : " + id));
    }

    private OrientationResponseDTO toResponseDTO(Orientation o) {
        return new OrientationResponseDTO(
                o.getId(),
                o.getPatient().getId(),
                o.getPatient().getNom() + " " + o.getPatient().getPrenom(),
                o.getDecisionIA() != null ? o.getDecisionIA().getId() : null,
                o.getServiceHospitalier().getId(),
                o.getServiceHospitalier().getNom(),
                o.getResponsable().getId(),
                o.getResponsable().getNom() + " " + o.getResponsable().getPrenom(),
                o.getTypeOrientation().name(),
                o.getMotif(),
                o.getStatutOrientation().name(),
                o.getDateOrientation(),
                o.getDateConfirmation()
        );
    }
}
package com.chu.appbackend.service.impl;

import com.chu.appbackend.dto.OrdonnanceLigneDTO;
import com.chu.appbackend.dto.OrdonnanceRequestDTO;
import com.chu.appbackend.dto.OrdonnanceResponseDTO;
import com.chu.appbackend.entity.Consultation;
import com.chu.appbackend.entity.Ordonnance;
import com.chu.appbackend.entity.OrdonnanceLigne;
import com.chu.appbackend.entity.RoleType;
import com.chu.appbackend.entity.User;
import com.chu.appbackend.exception.BadRequestException;
import com.chu.appbackend.exception.DuplicateResourceException;
import com.chu.appbackend.exception.ResourceNotFoundException;
import com.chu.appbackend.repository.ConsultationRepository;
import com.chu.appbackend.repository.OrdonnanceRepository;
import com.chu.appbackend.repository.UserRepository;
import com.chu.appbackend.service.OrdonnanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implémentation du service de gestion des ordonnances médicales.
 */
@Service
@RequiredArgsConstructor
public class OrdonnanceServiceImpl implements OrdonnanceService {

    private final OrdonnanceRepository ordonnanceRepository;
    private final ConsultationRepository consultationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OrdonnanceResponseDTO creerOrdonnance(OrdonnanceRequestDTO request) {
        Consultation consultation = consultationRepository.findById(request.consultationId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation introuvable avec l'id : " + request.consultationId()));

        if (ordonnanceRepository.findByConsultationId(consultation.getId()).isPresent()) {
            throw new DuplicateResourceException("Une ordonnance existe déjà pour cette consultation");
        }

        User medecin = userRepository.findById(request.medecinId())
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable avec l'id : " + request.medecinId()));

        if (medecin.getRole() != RoleType.MEDECIN) {
            throw new BadRequestException("Seul un utilisateur avec le rôle MEDECIN peut rédiger une ordonnance");
        }

        Ordonnance ordonnance = Ordonnance.builder()
                .consultation(consultation)
                .medecin(medecin)
                .build();

        request.lignes().forEach(ligneDTO -> ordonnance.getLignes().add(
                OrdonnanceLigne.builder()
                        .ordonnance(ordonnance)
                        .medicament(ligneDTO.medicament())
                        .posologie(ligneDTO.posologie())
                        .dureeJours(ligneDTO.dureeJours())
                        .instructions(ligneDTO.instructions())
                        .build()
        ));

        return toResponseDTO(ordonnanceRepository.save(ordonnance));
    }

    @Override
    public OrdonnanceResponseDTO getOrdonnanceById(Long id) {
        Ordonnance ordonnance = ordonnanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordonnance introuvable avec l'id : " + id));
        return toResponseDTO(ordonnance);
    }

    @Override
    public OrdonnanceResponseDTO getOrdonnanceByConsultation(Long consultationId) {
        Ordonnance ordonnance = ordonnanceRepository.findByConsultationId(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucune ordonnance trouvée pour la consultation id : " + consultationId));
        return toResponseDTO(ordonnance);
    }

    private OrdonnanceResponseDTO toResponseDTO(Ordonnance o) {
        return new OrdonnanceResponseDTO(
                o.getId(),
                o.getConsultation().getId(),
                o.getMedecin().getId(),
                o.getMedecin().getNom() + " " + o.getMedecin().getPrenom(),
                o.getLignes().stream()
                        .map(l -> new OrdonnanceLigneDTO(l.getMedicament(), l.getPosologie(), l.getDureeJours(), l.getInstructions()))
                        .toList(),
                o.getDateEmission()
        );
    }
}
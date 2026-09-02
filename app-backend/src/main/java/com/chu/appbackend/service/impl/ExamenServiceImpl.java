package com.chu.appbackend.service.impl;

import com.chu.appbackend.ai.ClinicalKeywordDetector;
import com.chu.appbackend.ai.AIService;
import com.chu.appbackend.ai.ImagingAnalysisResponseDTO;
import com.chu.appbackend.dto.ExamenRequestDTO;
import com.chu.appbackend.dto.ExamenResponseDTO;
import com.chu.appbackend.dto.ExamenResultatDTO;
import com.chu.appbackend.entity.CategorieExamen;
import com.chu.appbackend.entity.Consultation;
import com.chu.appbackend.entity.Examen;
import com.chu.appbackend.entity.StatutExamen;
import com.chu.appbackend.exception.BadRequestException;
import com.chu.appbackend.exception.ResourceNotFoundException;
import com.chu.appbackend.repository.ConsultationRepository;
import com.chu.appbackend.repository.ExamenRepository;
import com.chu.appbackend.service.ExamenService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Implémentation du service de gestion des examens complémentaires.
 * Intègre la détection déterministe de mots-clés cliniques critiques
 * dans les comptes rendus, ainsi que le stockage de l'image jointe
 * (radio/scanner) à des fins d'archivage et de traçabilité.
 */
@Service
@RequiredArgsConstructor
public class ExamenServiceImpl implements ExamenService {

    private static final Logger log = LoggerFactory.getLogger(ExamenServiceImpl.class);

    private final ExamenRepository examenRepository;
    private final ConsultationRepository consultationRepository;
    private final AIService aiService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    @Transactional
    public ExamenResponseDTO prescrireExamen(ExamenRequestDTO request) {
        Consultation consultation = consultationRepository.findById(request.consultationId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation introuvable avec l'id : " + request.consultationId()));

        Examen examen = Examen.builder()
                .consultation(consultation)
                .typeExamen(request.typeExamen())
                .categorieExamen(parseCategorie(request.categorieExamen()))
                .description(request.description())
                .statutExamen(StatutExamen.PRESCRIT)
                .build();

        return toResponseDTO(examenRepository.save(examen));
    }

    @Override
    @Transactional
    public ExamenResponseDTO demarrerExamen(Long id) {
        Examen examen = findExamenOrThrow(id);

        if (examen.getStatutExamen() != StatutExamen.PRESCRIT) {
            throw new BadRequestException("Seul un examen au statut PRESCRIT peut être pris en charge");
        }

        examen.setStatutExamen(StatutExamen.EN_COURS);
        return toResponseDTO(examenRepository.save(examen));
    }

    @Override
    @Transactional
    public ExamenResponseDTO enregistrerResultat(Long id, ExamenResultatDTO request) {
        Examen examen = findExamenOrThrow(id);

        if (examen.getStatutExamen() == StatutExamen.ANNULE) {
            throw new BadRequestException("Impossible d'enregistrer un résultat pour un examen annulé");
        }

        List<String> motsClesDetectes = ClinicalKeywordDetector.detecter(request.resultat());

        examen.setResultat(request.resultat());
        examen.setStatutExamen(StatutExamen.TERMINE);
        examen.setDateResultat(LocalDateTime.now());
        examen.setCompteRenduCritique(!motsClesDetectes.isEmpty());
        examen.setMotsClesCritiquesDetectes(motsClesDetectes.isEmpty() ? null : String.join(", ", motsClesDetectes));

        return toResponseDTO(examenRepository.save(examen));
    }

    @Override
    @Transactional
    public ExamenResponseDTO uploaderImage(Long id, MultipartFile fichier) {
        Examen examen = findExamenOrThrow(id);

        if (fichier == null || fichier.isEmpty()) {
            throw new BadRequestException("Le fichier image est obligatoire");
        }

        String extension = "";
        String nomOriginal = fichier.getOriginalFilename();
        if (nomOriginal != null && nomOriginal.contains(".")) {
            extension = nomOriginal.substring(nomOriginal.lastIndexOf('.'));
        }
        String nomFichier = "examen-" + id + "-" + UUID.randomUUID() + extension;

        try {
            Path dossierCible = Path.of(uploadDir, "examens");
            Files.createDirectories(dossierCible);
            Path cheminComplet = dossierCible.resolve(nomFichier);
            Files.copy(fichier.getInputStream(), cheminComplet);
        } catch (IOException e) {
            log.error("Erreur lors de l'enregistrement de l'image de l'examen {}", id, e);
            throw new BadRequestException("Impossible d'enregistrer l'image envoyée");
        }

        examen.setCheminImage("/files/examens/" + nomFichier);
        return toResponseDTO(examenRepository.save(examen));
    }

    @Override
    public ImagingAnalysisResponseDTO analyserImageAvecCNN(Long id) {
        Examen examen = findExamenOrThrow(id);

        if (examen.getCheminImage() == null || examen.getCheminImage().isBlank()) {
            throw new BadRequestException("Aucune image n'a été téléversée pour cet examen.");
        }

        String nomFichier = examen.getCheminImage().substring(examen.getCheminImage().lastIndexOf('/') + 1);
        Path cheminFichier = Path.of(uploadDir, "examens", nomFichier);

        try {
            byte[] imageBytes = Files.readAllBytes(cheminFichier);
            return aiService.analyserImage(imageBytes, nomFichier);
        } catch (IOException e) {
            log.error("Impossible de lire le fichier image {} pour l'examen {}", cheminFichier, id, e);
            throw new BadRequestException("Impossible de lire le fichier image sur le serveur.");
        }
    }

    @Override
    public ExamenResponseDTO getExamenById(Long id) {
        return toResponseDTO(findExamenOrThrow(id));
    }

    @Override
    public List<ExamenResponseDTO> getExamensByConsultation(Long consultationId) {
        if (!consultationRepository.existsById(consultationId)) {
            throw new ResourceNotFoundException("Consultation introuvable avec l'id : " + consultationId);
        }
        return examenRepository.findByConsultationIdOrderByDatePrescriptionDesc(consultationId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public List<ExamenResponseDTO> getExamensByPatient(Long patientId) {
        return examenRepository.findByConsultation_Patient_IdOrderByDatePrescriptionDesc(patientId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public List<ExamenResponseDTO> getAllExamens(String categorieExamen) {
        List<Examen> examens = (categorieExamen == null || categorieExamen.isBlank())
                ? examenRepository.findAll()
                : examenRepository.findByCategorieExamenOrderByDatePrescriptionDesc(parseCategorie(categorieExamen));

        return examens.stream()
                .map(this::toResponseDTO)
                .sorted((a, b) -> b.datePrescription().compareTo(a.datePrescription()))
                .toList();
    }

    private Examen findExamenOrThrow(Long id) {
        return examenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Examen introuvable avec l'id : " + id));
    }

    private CategorieExamen parseCategorie(String value) {
        try {
            return CategorieExamen.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Catégorie d'examen invalide : " + value + " (attendu BIOLOGIE ou IMAGERIE)");
        }
    }

    private ExamenResponseDTO toResponseDTO(Examen e) {
        Consultation c = e.getConsultation();

        List<String> motsCles = (e.getMotsClesCritiquesDetectes() == null || e.getMotsClesCritiquesDetectes().isBlank())
                ? List.of()
                : Arrays.stream(e.getMotsClesCritiquesDetectes().split(",\\s*")).toList();

        return new ExamenResponseDTO(
                e.getId(),
                c.getId(),
                c.getPatient().getId(),
                c.getPatient().getNom() + " " + c.getPatient().getPrenom(),
                c.getMedecin().getId(),
                c.getMedecin().getNom() + " " + c.getMedecin().getPrenom(),
                e.getTypeExamen(),
                e.getCategorieExamen().name(),
                e.getDescription(),
                e.getStatutExamen().name(),
                e.getResultat(),
                e.getCheminImage(),
                e.getCompteRenduCritique(),
                motsCles,
                e.getDatePrescription(),
                e.getDateResultat()
        );
    }
}
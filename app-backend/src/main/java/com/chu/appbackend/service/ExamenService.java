



package com.chu.appbackend.service;

import com.chu.appbackend.dto.ExamenRequestDTO;
import com.chu.appbackend.dto.ExamenResponseDTO;
import com.chu.appbackend.dto.ExamenResultatDTO;

import java.util.List;

/**
 * Contrat de service pour la gestion des examens complémentaires.
 */
public interface ExamenService {

    ExamenResponseDTO prescrireExamen(ExamenRequestDTO request);

    ExamenResponseDTO demarrerExamen(Long id);

    ExamenResponseDTO enregistrerResultat(Long id, ExamenResultatDTO request);

    ExamenResponseDTO uploaderImage(Long id, org.springframework.web.multipart.MultipartFile fichier);

    /** Envoie l'image déjà jointe à l'examen au CNN de démonstration du microservice IA. */
    com.chu.appbackend.ai.ImagingAnalysisResponseDTO analyserImageAvecCNN(Long id);

    ExamenResponseDTO getExamenById(Long id);

    List<ExamenResponseDTO> getExamensByConsultation(Long consultationId);

    /** Liste tous les examens (bio + imagerie) d'un patient, tous statuts confondus. */
    List<ExamenResponseDTO> getExamensByPatient(Long patientId);

    /** Liste tous les examens, avec filtre optionnel par catégorie (BIOLOGIE/IMAGERIE). */
    List<ExamenResponseDTO> getAllExamens(String categorieExamen);
}
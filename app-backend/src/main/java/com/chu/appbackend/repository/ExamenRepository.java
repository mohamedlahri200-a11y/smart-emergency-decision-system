package com.chu.appbackend.repository;

import com.chu.appbackend.entity.CategorieExamen;
import com.chu.appbackend.entity.Examen;
import com.chu.appbackend.entity.StatutExamen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository JPA pour l'entité Examen.
 */
public interface ExamenRepository extends JpaRepository<Examen, Long> {

    List<Examen> findByConsultationIdOrderByDatePrescriptionDesc(Long consultationId);

    List<Examen> findByConsultation_Patient_IdOrderByDatePrescriptionDesc(Long patientId);

    List<Examen> findByCategorieExamenOrderByDatePrescriptionDesc(CategorieExamen categorieExamen);

    List<Examen> findByCategorieExamenAndStatutExamenOrderByDatePrescriptionDesc(
            CategorieExamen categorieExamen, StatutExamen statutExamen);
}
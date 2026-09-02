package com.chu.appbackend.repository;

import com.chu.appbackend.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository JPA pour l'entité Consultation.
 */
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    List<Consultation> findByPatientIdOrderByDateConsultationDesc(Long patientId);

    List<Consultation> findAllByOrderByDateConsultationDesc();
}
package com.chu.appbackend.repository;

import com.chu.appbackend.entity.Triage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository JPA pour l'entité Triage.
 * Fournit les opérations CRUD ainsi que la récupération de l'historique par patient.
 */
public interface TriageRepository extends JpaRepository<Triage, Long> {

    List<Triage> findByPatientIdOrderByDateTriageDesc(Long patientId);

    List<Triage> findByInfirmierIdOrderByDateTriageDesc(Long infirmierId);

    List<Triage> findAllByOrderByDateTriageDesc();
}
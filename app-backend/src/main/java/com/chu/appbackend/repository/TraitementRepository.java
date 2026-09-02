package com.chu.appbackend.repository;

import com.chu.appbackend.entity.Traitement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository JPA pour l'entité Traitement.
 */
public interface TraitementRepository extends JpaRepository<Traitement, Long> {

    List<Traitement> findByPatientIdOrderByDateDebutDesc(Long patientId);
}
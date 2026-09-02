package com.chu.appbackend.repository;

import com.chu.appbackend.entity.Sortie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository JPA pour l'entité Sortie.
 */
public interface SortieRepository extends JpaRepository<Sortie, Long> {

    Optional<Sortie> findByConsultationId(Long consultationId);

    List<Sortie> findByPatientIdOrderByDateSortieDesc(Long patientId);
}
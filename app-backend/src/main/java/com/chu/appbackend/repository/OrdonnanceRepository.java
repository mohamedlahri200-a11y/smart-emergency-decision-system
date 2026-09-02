package com.chu.appbackend.repository;

import com.chu.appbackend.entity.Ordonnance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository JPA pour l'entité Ordonnance.
 */
public interface OrdonnanceRepository extends JpaRepository<Ordonnance, Long> {

    Optional<Ordonnance> findByConsultationId(Long consultationId);
}
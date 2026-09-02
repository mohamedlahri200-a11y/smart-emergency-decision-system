package com.chu.appbackend.repository;

import com.chu.appbackend.entity.ServiceHospitalier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository JPA pour l'entité ServiceHospitalier.
 */
public interface ServiceHospitalierRepository extends JpaRepository<ServiceHospitalier, Long> {

    Optional<ServiceHospitalier> findByNom(String nom);

    boolean existsByNom(String nom);

    List<ServiceHospitalier> findByActifTrue();

    List<ServiceHospitalier> findByActifTrueAndCapaciteDisponibleGreaterThan(Integer capacite);
}
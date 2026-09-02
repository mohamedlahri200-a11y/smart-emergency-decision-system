package com.chu.appbackend.repository;

import com.chu.appbackend.entity.Orientation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository JPA pour l'entité Orientation.
 */
public interface OrientationRepository extends JpaRepository<Orientation, Long> {

    List<Orientation> findByPatientIdOrderByDateOrientationDesc(Long patientId);

    Optional<Orientation> findByDecisionIAId(Long decisionIAId);

    List<Orientation> findAllByOrderByDateOrientationDesc();

    List<Orientation> findByServiceHospitalierIdAndStatutOrientation(
            Long serviceHospitalierId, com.chu.appbackend.entity.StatutOrientation statut);
}
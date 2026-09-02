package com.chu.appbackend.repository;

import com.chu.appbackend.entity.DecisionIA;
import com.chu.appbackend.entity.StatutValidation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DecisionIARepository extends JpaRepository<DecisionIA, Long> {

    Optional<DecisionIA> findByTriageId(Long triageId);

    List<DecisionIA> findByPatientIdOrderByDateDecisionDesc(Long patientId);

    List<DecisionIA> findAllByOrderByDateDecisionDesc();

    List<DecisionIA> findByStatutValidationOrderByDateDecisionDesc(
            StatutValidation statutValidation);

    List<DecisionIA> findByClassePredite(String classePredite);

}
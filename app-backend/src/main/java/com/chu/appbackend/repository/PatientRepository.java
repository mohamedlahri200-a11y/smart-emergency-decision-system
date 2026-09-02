package com.chu.appbackend.repository;

import com.chu.appbackend.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository JPA pour l'entité Patient.
 * Fournit les opérations CRUD ainsi qu'une recherche multicritère dynamique.
 */
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByCin(String cin);

    Optional<Patient> findByNumeroDossier(String numeroDossier);

    boolean existsByCin(String cin);

    boolean existsByNumeroDossier(String numeroDossier);

    List<Patient> findByNomContainingIgnoreCaseAndPrenomContainingIgnoreCase(String nom, String prenom);

    @Query("""
            SELECT p FROM Patient p
            WHERE (:nom IS NULL OR LOWER(p.nom) LIKE LOWER(CONCAT('%', :nom, '%')))
            AND (:prenom IS NULL OR LOWER(p.prenom) LIKE LOWER(CONCAT('%', :prenom, '%')))
            AND (:cin IS NULL OR p.cin = :cin)
            AND (:numeroDossier IS NULL OR p.numeroDossier = :numeroDossier)
            AND (:telephone IS NULL OR p.telephone = :telephone)
            """)
    List<Patient> searchByCriteria(
            @Param("nom") String nom,
            @Param("prenom") String prenom,
            @Param("cin") String cin,
            @Param("numeroDossier") String numeroDossier,
            @Param("telephone") String telephone
    );
}

package com.chu.appbackend.repository;

import com.chu.appbackend.entity.OrdonnanceLigne;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository JPA pour l'entité OrdonnanceLigne.
 * Utilisé principalement pour établir le lien optionnel avec un Traitement.
 */
public interface OrdonnanceLigneRepository extends JpaRepository<OrdonnanceLigne, Long> {
}
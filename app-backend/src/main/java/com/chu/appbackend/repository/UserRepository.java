package com.chu.appbackend.repository;

import com.chu.appbackend.entity.RoleType;
import com.chu.appbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository JPA pour l'entité User.
 * Fournit les opérations CRUD ainsi que des requêtes de recherche spécifiques.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByMatricule(String matricule);

    boolean existsByEmail(String email);

    boolean existsByMatricule(String matricule);

    List<User> findByRole(RoleType role);

    List<User> findByActifTrue();
}
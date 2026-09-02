package com.chu.appbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entité représentant un service hospitalier du CHU (ex. Réanimation, Chirurgie,
 * Cardiologie, Médecine interne) pouvant recevoir des patients orientés
 * depuis les urgences. Suit sa capacité d'accueil en temps réel.
 */
@Entity
@Table(name = "services_hospitaliers", uniqueConstraints = {
        @UniqueConstraint(columnNames = "nom")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceHospitalier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "nom", nullable = false, unique = true, length = 100)
    private String nom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "capacite_totale", nullable = false)
    private Integer capaciteTotale;

    @Column(name = "capacite_disponible", nullable = false)
    private Integer capaciteDisponible;

    @Column(name = "actif", nullable = false)
    @Builder.Default
    private Boolean actif = true;
}

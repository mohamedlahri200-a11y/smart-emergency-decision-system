package com.chu.appbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entité représentant la sortie d'un patient, clôturant son parcours
 * de prise en charge au sein de la plateforme.
 */
@Entity
@Table(name = "sorties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sortie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "consultation_id", nullable = false, unique = true)
    private Consultation consultation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medecin_id", nullable = false)
    private User medecin;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_sortie", nullable = false, length = 30)
    private TypeSortie typeSortie;

    @Enumerated(EnumType.STRING)
    @Column(name = "evolution_patient", nullable = false, length = 20)
    private EvolutionPatient evolutionPatient;

    @Column(name = "observations_sortie", columnDefinition = "TEXT")
    private String observationsSortie;

    @Column(name = "date_sortie", nullable = false, updatable = false)
    private LocalDateTime dateSortie;

    @PrePersist
    protected void onCreate() {
        this.dateSortie = LocalDateTime.now();
    }
}
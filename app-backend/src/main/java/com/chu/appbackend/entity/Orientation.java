package com.chu.appbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entité représentant l'orientation d'un patient vers un service hospitalier,
 * décidée automatiquement à partir de la recommandation de l'IA ou manuellement
 * par un médecin.
 */
@Entity
@Table(name = "orientations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Orientation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decision_ia_id")
    private DecisionIA decisionIA;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_hospitalier_id", nullable = false)
    private ServiceHospitalier serviceHospitalier;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "responsable_id", nullable = false)
    private User responsable;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_orientation", nullable = false, length = 20)
    private TypeOrientation typeOrientation;

    @Column(name = "motif", columnDefinition = "TEXT")
    private String motif;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_orientation", nullable = false, length = 20)
    private StatutOrientation statutOrientation;

    @Column(name = "date_orientation", nullable = false, updatable = false)
    private LocalDateTime dateOrientation;

    @Column(name = "date_confirmation")
    private LocalDateTime dateConfirmation;

    @PrePersist
    protected void onCreate() {
        this.dateOrientation = LocalDateTime.now();
        if (this.statutOrientation == null) {
            this.statutOrientation = StatutOrientation.EN_ATTENTE;
        }
    }
}

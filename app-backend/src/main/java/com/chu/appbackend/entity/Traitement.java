package com.chu.appbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entité représentant un traitement médicamenteux suivi pour un patient,
 * pouvant découler d'une ligne d'ordonnance ou être saisi directement
 * dans le cadre du suivi hospitalier.
 */
@Entity
@Table(name = "traitements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Traitement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordonnance_ligne_id")
    private OrdonnanceLigne ordonnanceLigne;

    @Column(name = "medicament", nullable = false, length = 150)
    private String medicament;

    @Column(name = "posologie", nullable = false, length = 255)
    private String posologie;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    private StatutTraitement statut;

    @Column(name = "observations", columnDefinition = "TEXT")
    private String observations;

    @Column(name = "date_enregistrement", nullable = false, updatable = false)
    private LocalDateTime dateEnregistrement;

    @PrePersist
    protected void onCreate() {
        this.dateEnregistrement = LocalDateTime.now();
        if (this.statut == null) {
            this.statut = StatutTraitement.EN_COURS;
        }
    }
}
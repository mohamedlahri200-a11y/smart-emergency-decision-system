package com.chu.appbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entité représentant une fiche de triage infirmier réalisée pour un patient.
 * Contient les constantes vitales saisies ainsi que les scores cliniques calculés
 * (NEWS2, ESI) et la priorité de prise en charge en résultant.
 */
@Entity
@Table(name = "triages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Triage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "infirmier_id", nullable = false)
    private User infirmier;

    // --- Constantes vitales ---

    @Column(name = "frequence_respiratoire", nullable = false)
    private Integer frequenceRespiratoire;

    @Column(name = "saturation_oxygene", nullable = false)
    private Integer saturationOxygene;

    @Column(name = "oxygeno_dependant", nullable = false)
    private Boolean oxygenoDependant;

    @Column(name = "temperature", nullable = false)
    private Double temperature;

    @Column(name = "pression_arterielle_systolique", nullable = false)
    private Integer pressionArterielleSystolique;

    @Column(name = "frequence_cardiaque", nullable = false)
    private Integer frequenceCardiaque;
    @Column(name = "poids", nullable = false)
    private Double poids;

    @Column(name = "taille", nullable = false)
    private Double taille;

    @Column(name = "pression_arterielle_diastolique", nullable = false)
    private Integer pressionArterielleDiastolique;

    @Column(name = "glycemie")
    private Double glycemie;


    @Enumerated(EnumType.STRING)
    @Column(name = "niveau_conscience", nullable = false, length = 30)
    private NiveauConscience niveauConscience;

    @Column(name = "symptomes", columnDefinition = "TEXT")
    private String symptomes;

    @Column(name = "douleur_intensite")
    private Integer douleurIntensite;

    // --- Résultats calculés ---

    @Column(name = "score_news2", nullable = false)
    private Integer scoreNews2;

    @Column(name = "niveau_risque_news2", length = 30)
    private String niveauRisqueNews2;

    @Column(name = "niveau_esi", nullable = false)
    private Integer niveauEsi;

    @Enumerated(EnumType.STRING)
    @Column(name = "priorite", nullable = false, length = 20)
    private PrioriteTriage priorite;

    @Column(name = "date_triage", nullable = false, updatable = false)
    private LocalDateTime dateTriage;

    @PrePersist
    protected void onCreate() {
        this.dateTriage = LocalDateTime.now();
    }
}

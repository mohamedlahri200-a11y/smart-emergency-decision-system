package com.chu.appbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entité représentant une décision d'aide au diagnostic générée par le microservice
 * d'intelligence artificielle (FastAPI/Scikit-Learn) et son cycle de validation médicale.
 * Spring Boot ne fait que stocker le résultat retourné par l'IA ; aucun calcul
 * prédictif n'est effectué côté backend Java.
 */
@Entity
@Table(name = "decisions_ia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DecisionIA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "triage_id", nullable = false, unique = true)
    private Triage triage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_validateur_id")
    private User medecinValidateur;

    @Lob
    @Column(name = "donnees_envoyees", columnDefinition = "TEXT", nullable = false)
    private String donneesEnvoyees;

    @Column(name = "score_prediction", nullable = false)
    private Double scorePrediction;

    @Column(name = "classe_predite", nullable = false, length = 100)
    private String classePredite;

    @Column(name = "recommandation_service", length = 100)
    private String recommandationService;

    @Lob
    @Column(name = "explication", columnDefinition = "TEXT")
    private String explication;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_validation", nullable = false, length = 20)
    private StatutValidation statutValidation;

    @Lob
    @Column(name = "commentaire_medecin", columnDefinition = "TEXT")
    private String commentaireMedecin;

    @Column(name = "date_decision", nullable = false, updatable = false)
    private LocalDateTime dateDecision;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    @Lob
    @Column(name = "reponse_complete", columnDefinition = "TEXT")
    private String reponseComplete;

    @PrePersist
    protected void onCreate() {
        this.dateDecision = LocalDateTime.now();
        if (this.statutValidation == null) {
            this.statutValidation = StatutValidation.EN_ATTENTE;
        }
    }
}

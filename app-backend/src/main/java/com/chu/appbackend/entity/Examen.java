package com.chu.appbackend.entity;

import jakarta.persistence.*;
        import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "examens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Examen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "consultation_id", nullable = false)
    private Consultation consultation;

    @Column(name = "type_examen", nullable = false, length = 100)
    private String typeExamen;

    @Enumerated(EnumType.STRING)
    @Column(name = "categorie_examen", nullable = false, length = 20)
    private CategorieExamen categorieExamen;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_examen", nullable = false, length = 20)
    private StatutExamen statutExamen;

    @Column(name = "resultat", columnDefinition = "TEXT")
    private String resultat;

    @Column(name = "chemin_image", length = 500)
    private String cheminImage;

    @Column(name = "compte_rendu_critique", nullable = false)
    @Builder.Default
    private Boolean compteRenduCritique = false;

    @Column(name = "mots_cles_critiques_detectes", columnDefinition = "TEXT")
    private String motsClesCritiquesDetectes;

    @Column(name = "date_prescription", nullable = false, updatable = false)
    private LocalDateTime datePrescription;

    @Column(name = "date_resultat")
    private LocalDateTime dateResultat;

    @PrePersist
    protected void onCreate() {
        this.datePrescription = LocalDateTime.now();
        if (this.statutExamen == null) {
            this.statutExamen = StatutExamen.PRESCRIT;
        }
    }
}

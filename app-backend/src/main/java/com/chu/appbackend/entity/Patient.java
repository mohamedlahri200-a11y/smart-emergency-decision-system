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
 * Entité représentant un patient pris en charge par le service des urgences.
 * Constitue le pivot central autour duquel s'articulent le triage,
 * la décision IA, l'orientation et le suivi médical.
 */
@Entity
@Table(name = "patients", uniqueConstraints = {
        @UniqueConstraint(columnNames = "cin"),
        @UniqueConstraint(columnNames = "numero_dossier")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "numero_dossier", nullable = false, unique = true, length = 30)
    private String numeroDossier;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @Column(name = "prenom", nullable = false, length = 100)
    private String prenom;

    @Column(name = "cin", length = 20, unique = true)
    private String cin;

    @Column(name = "date_naissance", nullable = false)
    private LocalDate dateNaissance;

    @Enumerated(EnumType.STRING)
    @Column(name = "sexe", nullable = false, length = 10)
    private Sexe sexe;

    @Column(name = "telephone", length = 20)
    private String telephone;

    @Column(name = "adresse", length = 255)
    private String adresse;

    @Column(name = "groupe_sanguin", length = 5)
    private String groupeSanguin;

    @Column(name = "antecedents", columnDefinition = "TEXT")
    private String antecedents;

    @Column(name = "allergies", columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "personne_a_contacter", length = 150)
    private String personneAContacter;

    @Column(name = "telephone_contact", length = 20)
    private String telephoneContact;

    @Column(name = "date_enregistrement", nullable = false, updatable = false)
    private LocalDateTime dateEnregistrement;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @PrePersist
    protected void onCreate() {
        this.dateEnregistrement = LocalDateTime.now();
        this.dateModification = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}

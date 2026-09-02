package com.chu.appbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entité représentant une ligne de prescription au sein d'une ordonnance
 * (un médicament, sa posologie et sa durée de traitement).
 */
@Entity
@Table(name = "ordonnance_lignes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdonnanceLigne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ordonnance_id", nullable = false)
    private Ordonnance ordonnance;

    @Column(name = "medicament", nullable = false, length = 150)
    private String medicament;

    @Column(name = "posologie", nullable = false, length = 255)
    private String posologie;

    @Column(name = "duree_jours")
    private Integer dureeJours;

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;
}

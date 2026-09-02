package com.chu.appbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entité représentant une entrée du journal d'audit du système.
 * Trace les actions sensibles réalisées par les utilisateurs (création,
 * modification, suppression, validation médicale, connexion...) à des fins
 * de traçabilité et de conformité, essentielle en contexte hospitalier.
 */
@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private User utilisateur;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_action", nullable = false, length = 30)
    private TypeAction typeAction;

    @Column(name = "entite_concernee", nullable = false, length = 100)
    private String entiteConcernee;

    @Column(name = "entite_id")
    private Long entiteId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "adresse_ip", length = 50)
    private String adresseIp;

    @Column(name = "date_action", nullable = false, updatable = false)
    private LocalDateTime dateAction;

    @PrePersist
    protected void onCreate() {
        this.dateAction = LocalDateTime.now();
    }
}
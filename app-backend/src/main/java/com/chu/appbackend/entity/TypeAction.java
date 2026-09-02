package com.chu.appbackend.entity;

/**
 * Nature de l'action tracée dans le journal d'audit.
 */
public enum TypeAction {
    CREATION,
    MODIFICATION,
    SUPPRESSION,
    CONNEXION,
    VALIDATION,
    ANNULATION,
    ACTIVATION,
    DESACTIVATION
}
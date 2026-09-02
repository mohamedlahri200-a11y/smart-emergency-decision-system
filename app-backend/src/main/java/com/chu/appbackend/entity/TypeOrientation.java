package com.chu.appbackend.entity;

/**
 * Mode selon lequel une orientation de patient a été déterminée.
 */
public enum TypeOrientation {

    /** Orientation proposée automatiquement à partir de la recommandation du module IA. */
    AUTOMATIQUE,

    /** Orientation décidée manuellement par un médecin. */
    MANUELLE
}

package com.chu.appbackend.entity;

/**
 * Nature de la sortie du patient à l'issue de sa prise en charge.
 */
public enum TypeSortie {
    DOMICILE,
    HOSPITALISATION,
    TRANSFERT,
    DECES,
    SORTIE_CONTRE_AVIS_MEDICAL
}
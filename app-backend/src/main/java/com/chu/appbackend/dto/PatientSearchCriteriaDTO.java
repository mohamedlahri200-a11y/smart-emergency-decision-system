package com.chu.appbackend.dto;

/**
 * DTO regroupant les critères optionnels de recherche multicritère de patients.
 * Tout champ non renseigné (null) est ignoré dans la requête.
 */
public record PatientSearchCriteriaDTO(
        String nom,
        String prenom,
        String cin,
        String numeroDossier,
        String telephone
) {}
package com.chu.appbackend.mapper;
import com.chu.appbackend.ai.PatientAIRequestDTO;
import com.chu.appbackend.entity.Triage;
import com.chu.appbackend.util.AgeCalculator;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Construit le DTO attendu par le microservice IA à partir d'un
 * Triage (et de son Patient associé). Point unique de transformation :
 * toute évolution du modèle de données ne se répercute qu'ici.
 */
@Component
public class PatientAIMapper {

    public PatientAIRequestDTO toAIRequest(Triage triage) {
        var patient = triage.getPatient();

        return new PatientAIRequestDTO(
                patient.getId().toString(),
                AgeCalculator.calculateAge(patient.getDateNaissance()),
                mapSexe(patient.getSexe().name()),
                triage.getPoids(),
                triage.getTaille(),
                triage.getTemperature(),
                triage.getFrequenceCardiaque(),
                triage.getPressionArterielleSystolique(),
                triage.getPressionArterielleDiastolique(),
                triage.getFrequenceRespiratoire(),
                triage.getSaturationOxygene() != null ? triage.getSaturationOxygene().doubleValue() : null,
                triage.getGlycemie(),
                triage.getDouleurIntensite() != null ? triage.getDouleurIntensite() : 0,
                mapGcs(triage.getNiveauConscience()),
                splitToList(patient.getAntecedents()),
                splitToList(patient.getAllergies()),
                splitToList(triage.getSymptomes()),
                "Propre_Moyen" // TODO: ajuster si un champ mode d'arrivée existe ailleurs
        );
    }

    /**
     * Convertit le NiveauConscience (enum métier) en score GCS
     * approximatif attendu par le microservice IA.
     * ADAPTER les valeurs exactes de l'enum NiveauConscience une fois confirmées.
     */
    private Integer mapGcs(Object niveauConscience) {
        if (niveauConscience == null) return 15;
        String value = niveauConscience.toString().toUpperCase();
        return switch (value) {
            case "CONSCIENT", "NORMAL" -> 15;
            case "CONFUS" -> 14;
            case "SOMNOLENT" -> 11;
            case "COMATEUX", "INCONSCIENT" -> 6;
            default -> 15;
        };
    }

    /**
     * Convertit l'enum Sexe du backend vers le format strict 'M'/'F'
     * attendu par le microservice IA.
     * ADAPTER selon les valeurs réelles de l'enum Sexe (MASCULIN/FEMININ ? M/F ?).
     */
    private String mapSexe(String sexeBackend) {
        String v = sexeBackend.toUpperCase();
        if (v.startsWith("M")) return "M";
        if (v.startsWith("F")) return "F";
        throw new IllegalArgumentException("Valeur de sexe non reconnue : " + sexeBackend);
    }

    /** Découpe une chaîne texte libre (virgule ou point-virgule) en liste. */
    private List<String> splitToList(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return List.of();
        }
        return Arrays.stream(rawText.split("[,;|]"))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }
}
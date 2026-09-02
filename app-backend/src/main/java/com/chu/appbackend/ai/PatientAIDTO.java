package com.chu.appbackend.ai;

import java.util.List;

/**
 * DTO représentant les données cliniques d'un patient envoyées au
 * microservice IA. Les noms de champs sont volontairement en
 * snake_case (convention Python/PEP8) car AIClient utilise un
 * RestClient sans conversion automatique de nommage : le JSON
 * sérialisé doit correspondre exactement au schéma PatientData
 * attendu par FastAPI (app/schemas/patient.py).
 */
public class PatientAIDTO {

    private String patient_id;
    private Integer age;
    private String sexe;
    private Double poids;
    private Double taille;
    private Double temperature;
    private Integer frequence_cardiaque;
    private Integer pression_arterielle_systolique;
    private Integer pression_arterielle_diastolique;
    private Integer frequence_respiratoire;
    private Double saturation_o2;
    private Double glycemie;
    private Integer douleur_eva;
    private Integer score_news2;
    private Integer score_esi;
    private Integer score_gcs;
    private List<String> antecedents;
    private List<String> allergies;
    private List<String> symptomes;
    private String mode_arrivee;

    // --- Getters / Setters ---

    public String getPatient_id() { return patient_id; }
    public void setPatient_id(String v) { this.patient_id = v; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getSexe() { return sexe; }
    public void setSexe(String sexe) { this.sexe = sexe; }

    public Double getPoids() { return poids; }
    public void setPoids(Double poids) { this.poids = poids; }

    public Double getTaille() { return taille; }
    public void setTaille(Double taille) { this.taille = taille; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Integer getFrequence_cardiaque() { return frequence_cardiaque; }
    public void setFrequence_cardiaque(Integer v) { this.frequence_cardiaque = v; }

    public Integer getPression_arterielle_systolique() { return pression_arterielle_systolique; }
    public void setPression_arterielle_systolique(Integer v) { this.pression_arterielle_systolique = v; }

    public Integer getPression_arterielle_diastolique() { return pression_arterielle_diastolique; }
    public void setPression_arterielle_diastolique(Integer v) { this.pression_arterielle_diastolique = v; }

    public Integer getFrequence_respiratoire() { return frequence_respiratoire; }
    public void setFrequence_respiratoire(Integer v) { this.frequence_respiratoire = v; }

    public Double getSaturation_o2() { return saturation_o2; }
    public void setSaturation_o2(Double v) { this.saturation_o2 = v; }

    public Double getGlycemie() { return glycemie; }
    public void setGlycemie(Double glycemie) { this.glycemie = glycemie; }

    public Integer getDouleur_eva() { return douleur_eva; }
    public void setDouleur_eva(Integer v) { this.douleur_eva = v; }

    public Integer getScore_news2() { return score_news2; }
    public void setScore_news2(Integer v) { this.score_news2 = v; }

    public Integer getScore_esi() { return score_esi; }
    public void setScore_esi(Integer v) { this.score_esi = v; }

    public Integer getScore_gcs() { return score_gcs; }
    public void setScore_gcs(Integer v) { this.score_gcs = v; }

    public List<String> getAntecedents() { return antecedents; }
    public void setAntecedents(List<String> antecedents) { this.antecedents = antecedents; }

    public List<String> getAllergies() { return allergies; }
    public void setAllergies(List<String> allergies) { this.allergies = allergies; }

    public List<String> getSymptomes() { return symptomes; }
    public void setSymptomes(List<String> symptomes) { this.symptomes = symptomes; }

    public String getMode_arrivee() { return mode_arrivee; }
    public void setMode_arrivee(String v) { this.mode_arrivee = v; }
}

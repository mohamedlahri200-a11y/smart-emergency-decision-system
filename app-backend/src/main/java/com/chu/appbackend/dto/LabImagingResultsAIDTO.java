package com.chu.appbackend.ai;

/**
 * DTO représentant les résultats d'examens biologiques/imagerie envoyés
 * au microservice IA (endpoint POST /predict, champ lab_imaging_results).
 * Noms de champs en snake_case, comme PatientAIDTO, car AIClient
 * n'applique aucune conversion automatique de nommage : le JSON
 * sérialisé doit correspondre exactement au schéma Python
 * LabImagingResultsData (app/schemas/lab_results.py).
 */
public class LabImagingResultsAIDTO {

    private Double crp;
    private Double procalcitonine;
    private Double leucocytes;
    private Double hemoglobine;
    private Double creatinine;
    private Double troponine;
    private Double lactate;
    private Double glycemie_labo;
    private Boolean imagerie_anomalie = false;
    private String imagerie_details;

    public Double getCrp() { return crp; }
    public void setCrp(Double crp) { this.crp = crp; }

    public Double getProcalcitonine() { return procalcitonine; }
    public void setProcalcitonine(Double procalcitonine) { this.procalcitonine = procalcitonine; }

    public Double getLeucocytes() { return leucocytes; }
    public void setLeucocytes(Double leucocytes) { this.leucocytes = leucocytes; }

    public Double getHemoglobine() { return hemoglobine; }
    public void setHemoglobine(Double hemoglobine) { this.hemoglobine = hemoglobine; }

    public Double getCreatinine() { return creatinine; }
    public void setCreatinine(Double creatinine) { this.creatinine = creatinine; }

    public Double getTroponine() { return troponine; }
    public void setTroponine(Double troponine) { this.troponine = troponine; }

    public Double getLactate() { return lactate; }
    public void setLactate(Double lactate) { this.lactate = lactate; }

    public Double getGlycemie_labo() { return glycemie_labo; }
    public void setGlycemie_labo(Double v) { this.glycemie_labo = v; }

    public Boolean getImagerie_anomalie() { return imagerie_anomalie; }
    public void setImagerie_anomalie(Boolean v) { this.imagerie_anomalie = v; }

    public String getImagerie_details() { return imagerie_details; }
    public void setImagerie_details(String v) { this.imagerie_details = v; }
}
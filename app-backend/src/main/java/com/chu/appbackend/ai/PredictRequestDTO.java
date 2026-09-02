package com.chu.appbackend.ai;

public class PredictRequestDTO {
    private PatientAIDTO patient;
    private Boolean include_explanation = true;
    private LabImagingResultsAIDTO lab_imaging_results;

    public PatientAIDTO getPatient() { return patient; }
    public void setPatient(PatientAIDTO patient) { this.patient = patient; }
    public Boolean getInclude_explanation() { return include_explanation; }
    public void setInclude_explanation(Boolean v) { this.include_explanation = v; }
    public LabImagingResultsAIDTO getLab_imaging_results() { return lab_imaging_results; }
    public void setLab_imaging_results(LabImagingResultsAIDTO v) { this.lab_imaging_results = v; }
}
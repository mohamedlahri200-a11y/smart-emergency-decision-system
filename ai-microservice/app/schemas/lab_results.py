"""
lab_results.py
===============
Schéma Pydantic des résultats d'examens complémentaires (biologie et
imagerie) saisis par le médecin urgentiste une fois les comptes rendus
du radiologue et du biologiste reçus. Utilisé pour l'analyse
complémentaire (2ème analyse IA), en plus des données de triage.
"""

from typing import Optional

from pydantic import BaseModel, Field


class LabImagingResultsData(BaseModel):
    """Résultats structurés d'examens biologiques et d'imagerie."""

    # --- Biologie ---
    crp: Optional[float] = Field(default=None, ge=0, le=1000, description="CRP en mg/L")
    procalcitonine: Optional[float] = Field(default=None, ge=0, le=200, description="Procalcitonine en ng/mL")
    leucocytes: Optional[float] = Field(default=None, ge=0, le=100, description="Leucocytes en G/L")
    hemoglobine: Optional[float] = Field(default=None, ge=0, le=25, description="Hémoglobine en g/dL")
    creatinine: Optional[float] = Field(default=None, ge=0, le=200, description="Créatinine en mg/L")
    troponine: Optional[float] = Field(default=None, ge=0, le=10000, description="Troponine en ng/L")
    lactate: Optional[float] = Field(default=None, ge=0, le=30, description="Lactate en mmol/L")
    glycemie_labo: Optional[float] = Field(default=None, ge=0, le=10, description="Glycémie de laboratoire en g/L")

    # --- Imagerie ---
    imagerie_anomalie: bool = Field(default=False, description="Une anomalie a-t-elle été détectée à l'imagerie ?")
    imagerie_details: Optional[str] = Field(default=None, description="Description libre de l'anomalie radiologique")

    class Config:
        json_schema_extra = {
            "example": {
                "crp": 145.0,
                "procalcitonine": 3.2,
                "leucocytes": 16.5,
                "hemoglobine": 11.2,
                "creatinine": 9.0,
                "troponine": 8.0,
                "lactate": 2.8,
                "glycemie_labo": 1.1,
                "imagerie_anomalie": True,
                "imagerie_details": "Foyer de condensation basal droit",
            }
        }
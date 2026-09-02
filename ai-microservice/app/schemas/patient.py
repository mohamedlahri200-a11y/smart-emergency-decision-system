"""
patient.py
==========
Schéma Pydantic représentant les données cliniques d'un patient
arrivant aux urgences. Utilisé comme brique de base pour les
requêtes de prédiction et pour la génération du dataset synthétique.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class PatientData(BaseModel):
    """
    Représente l'ensemble des données cliniques recueillies à
    l'accueil et au triage pour un patient donné.
    """

    patient_id: Optional[str] = Field(default=None, description="Identifiant patient (fourni par Spring Boot)")
    age: int = Field(..., ge=0, le=120, description="Âge du patient en années")
    sexe: str = Field(..., description="Sexe du patient : 'M' ou 'F'")
    poids: float = Field(..., gt=0, le=350, description="Poids en kg")
    taille: float = Field(..., gt=0, le=250, description="Taille en cm")

    temperature: float = Field(..., ge=25, le=45, description="Température corporelle en °C")
    frequence_cardiaque: int = Field(..., ge=0, le=300, description="Fréquence cardiaque en bpm")
    pression_arterielle_systolique: int = Field(..., ge=0, le=300, description="PAS en mmHg")
    pression_arterielle_diastolique: int = Field(..., ge=0, le=200, description="PAD en mmHg")
    frequence_respiratoire: int = Field(..., ge=0, le=80, description="Fréquence respiratoire en cycles/min")
    saturation_o2: float = Field(..., ge=0, le=100, description="Saturation en oxygène (SpO2) en %")
    glycemie: float = Field(..., ge=0, le=10, description="Glycémie capillaire en g/L")
    douleur_eva: int = Field(..., ge=0, le=10, description="Échelle visuelle analogique de la douleur (0-10)")

    score_news2: Optional[int] = Field(default=None, ge=0, le=20, description="Score NEWS2 (calculé si absent)")
    score_esi: Optional[int] = Field(default=None, ge=1, le=5, description="Score ESI (Emergency Severity Index)")
    score_gcs: int = Field(default=15, ge=3, le=15, description="Score de Glasgow (niveau de conscience)")

    antecedents: List[str] = Field(default_factory=list, description="Liste des antécédents médicaux")
    allergies: List[str] = Field(default_factory=list, description="Liste des allergies connues")
    symptomes: List[str] = Field(..., min_length=1, description="Liste des symptômes rapportés")

    heure_arrivee: Optional[datetime] = Field(default_factory=datetime.now, description="Horodatage d'arrivée")
    mode_arrivee: str = Field(default="Propre_Moyen", description="Mode d'arrivée aux urgences")

    @field_validator("sexe")
    @classmethod
    def validate_sexe(cls, v: str) -> str:
        """Valide que le sexe est bien 'M' ou 'F'."""
        v_upper = v.strip().upper()
        if v_upper not in {"M", "F"}:
            raise ValueError("Le champ 'sexe' doit être 'M' ou 'F'.")
        return v_upper

    @property
    def imc(self) -> float:
        """Calcule l'indice de masse corporelle (IMC) du patient."""
        taille_m = self.taille / 100
        return round(self.poids / (taille_m ** 2), 2)

    class Config:
        json_schema_extra = {
            "example": {
                "patient_id": "PT-2026-00123",
                "age": 67,
                "sexe": "M",
                "poids": 78.5,
                "taille": 172,
                "temperature": 38.9,
                "frequence_cardiaque": 118,
                "pression_arterielle_systolique": 95,
                "pression_arterielle_diastolique": 60,
                "frequence_respiratoire": 26,
                "saturation_o2": 91,
                "glycemie": 1.6,
                "douleur_eva": 7,
                "score_gcs": 14,
                "antecedents": ["HTA", "Diabete"],
                "allergies": ["Penicilline"],
                "symptomes": ["dyspnee", "douleur_thoracique", "fievre"],
                "mode_arrivee": "Ambulance",
            }
        }
"""
request.py
==========
Schémas Pydantic des requêtes entrantes de l'API REST.
"""

from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.patient import PatientData
from app.schemas.lab_results import LabImagingResultsData


class PredictRequest(BaseModel):
    """Requête envoyée par Spring Boot au endpoint POST /predict."""

    patient: PatientData = Field(..., description="Données cliniques complètes du patient")
    include_explanation: bool = Field(default=True, description="Inclure l'explication XAI (SHAP/LIME)")
    lab_imaging_results: Optional[LabImagingResultsData] = Field(
        default=None,
        description=(
            "Résultats d'examens biologiques/imagerie déjà reçus (2ème analyse, "
            "réalisée par le médecin urgentiste après retour du radiologue/biologiste). "
            "Absent lors de la 1ère analyse au triage."
        ),
    )


class RetrainRequest(BaseModel):
    """
    Requête de réentraînement déclenchée manuellement ou automatiquement
    lorsque suffisamment de validations médicales ont été accumulées.
    """

    force: bool = Field(default=False, description="Forcer le réentraînement même si le seuil minimal n'est pas atteint")
    modules: Optional[List[str]] = Field(
        default=None,
        description="Liste des modules à réentraîner (None = tous les modules)",
    )


class ValidationFeedback(BaseModel):
    """
    Retour d'un médecin urgentiste validant ou corrigeant une prédiction
    IA. Utilisé pour alimenter la boucle d'apprentissage continu.
    """

    prediction_id: str = Field(..., description="Identifiant de la prédiction concernée")
    validated_priority: Optional[str] = Field(default=None, description="Priorité réellement retenue par le médecin")
    validated_service: Optional[str] = Field(default=None, description="Service réellement retenu par le médecin")
    is_correct: bool = Field(..., description="Le médecin confirme-t-il la recommandation IA ?")
    comment: Optional[str] = Field(default=None, description="Commentaire libre du médecin")
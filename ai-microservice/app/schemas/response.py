"""
response.py
===========
Schémas Pydantic des réponses de l'API REST, incluant l'objet unique
retourné par le endpoint /predict tel que spécifié par le cahier des
charges (une seule réponse JSON regroupant tous les résultats IA).
"""

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class FeatureContribution(BaseModel):
    """Contribution d'une variable clinique à une décision de l'IA (XAI)."""

    feature: str = Field(..., description="Nom de la variable clinique")
    value: str = Field(..., description="Valeur observée pour cette variable")
    impact: float = Field(..., description="Poids de la contribution (SHAP value)")
    direction: str = Field(..., description="'positive' (aggrave) ou 'negative' (rassure)")


class AIExplanation(BaseModel):
    """Explication complète (Explainable AI) d'une décision du système."""

    method: str = Field(default="SHAP", description="Méthode utilisée : SHAP ou LIME")
    summary: str = Field(..., description="Résumé en langage naturel de la décision")
    top_features: List[FeatureContribution] = Field(default_factory=list)


class PredictResponse(BaseModel):
    """
    Objet JSON unique retourné par le endpoint /predict, agrégeant les
    résultats des 15 modules IA du microservice.
    """

    prediction_id: str = Field(..., description="Identifiant unique de cette prédiction")

    priority: str = Field(..., description="Niveau de triage : Rouge/Orange/Jaune/Vert/Bleu")
    priority_score: float = Field(..., description="Score de priorité normalisé (0-100)")

    recommended_service: str = Field(..., description="Service hospitalier recommandé")

    recommended_exams: List[str] = Field(default_factory=list, description="Examens complémentaires recommandés")
    recommended_lab_tests: List[str] = Field(default_factory=list, description="Analyses biologiques recommandées")

    clinical_risk: str = Field(..., description="Urgences vitales suspectées (AVC, Sepsis, etc.)")
    deterioration_risk: str = Field(..., description="Risque d'aggravation : Faible/Modere/Eleve/Critique")

    estimated_length_of_stay: float = Field(..., description="Durée de séjour estimée (en heures)")
    estimated_waiting_time: float = Field(..., description="Temps d'attente estimé avant prise en charge (en minutes)")

    identified_risk_factors: List[str] = Field(default_factory=list, description="Facteurs de risque détectés")
    active_alerts: List[str] = Field(default_factory=list, description="Alertes cliniques actives")

    recommended_protocols: List[str] = Field(default_factory=list, description="Protocoles thérapeutiques hospitaliers suggérés")
    patient_recommendations: List[str] = Field(default_factory=list, description="Recommandations personnalisées")

    ai_explanation: AIExplanation = Field(..., description="Explication de la décision (XAI)")

    model_version: str = Field(..., description="Version des modèles ayant produit la prédiction")
    prediction_time: datetime = Field(default_factory=datetime.now, description="Horodatage de la prédiction")
    confidence_score: float = Field(..., description="Score de confiance global du modèle (0-1)")


class HealthResponse(BaseModel):
    """Réponse du endpoint GET /health."""

    status: str
    version: str
    environment: str
    models_loaded: Dict[str, bool]
    timestamp: datetime = Field(default_factory=datetime.now)


class MetricsResponse(BaseModel):
    """Réponse du endpoint GET /metrics (métriques de performance des modèles)."""

    model_name: str
    metrics: Dict[str, float]
    trained_at: Optional[datetime] = None
    dataset_size: Optional[int] = None


class ModelInfoResponse(BaseModel):
    """Réponse du endpoint GET /model-info."""

    models: List[Dict[str, str]]
    model_version: str
    total_predictions_made: int


class DashboardResponse(BaseModel):
    """Réponse du endpoint GET /dashboard (statistiques agrégées temps réel)."""

    total_patients_today: int
    priority_distribution: Dict[str, int]
    average_waiting_time: float
    average_length_of_stay: float
    service_load: Dict[str, int]
    active_critical_alerts: int
    last_updated: datetime = Field(default_factory=datetime.now)
"""
model_info.py (api)
====================
Endpoint GET /model-info retournant les informations générales sur
les modèles ML actuellement en production.
"""

from fastapi import APIRouter

from app.core.constants import MODEL_VERSION
from app.models.model_loader import model_registry
from app.schemas.response import ModelInfoResponse
from app.services.history_service import history_service

router = APIRouter(tags=["Monitoring"])

MODULE_DESCRIPTIONS = {
    "triage_model": "Triage intelligent (5 niveaux de priorité)",
    "orientation_model": "Orientation hospitalière automatique (7 services)",
    "deterioration_model": "Prédiction du risque d'aggravation clinique",
    "exams_model": "Recommandation d'examens complémentaires (multi-label)",
    "lab_tests_model": "Recommandation d'analyses biologiques (multi-label)",
    "los_regressor": "Estimation du temps de prise en charge (régression)",
}


@router.get("/model-info", response_model=ModelInfoResponse, summary="Informations sur les modèles ML en production")
async def get_model_info() -> ModelInfoResponse:
    """
    Retourne la liste des modèles disponibles, l'algorithme retenu
    pour chacun, ainsi que la version globale du système IA.
    """
    models_info = []
    for name, description in MODULE_DESCRIPTIONS.items():
        meta = model_registry.get_metadata(name)
        models_info.append(
            {
                "name": name,
                "description": description,
                "algorithm": meta.get("best_algorithm", "non entraîné"),
                "loaded": str(model_registry.is_loaded(name)),
                "trained_at": str(meta.get("trained_at", "N/A")),
            }
        )

    return ModelInfoResponse(
        models=models_info,
        model_version=MODEL_VERSION,
        total_predictions_made=history_service.count_total(),
    )
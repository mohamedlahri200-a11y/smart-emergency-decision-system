"""
metrics.py (api)
=================
Endpoints GET /metrics (performance des modèles) et GET /dashboard
(statistiques agrégées temps réel du service des urgences).
"""

from fastapi import APIRouter, HTTPException, Query

from app.core.exceptions import ModelNotLoadedException
from app.models.model_loader import model_registry
from app.schemas.response import DashboardResponse, MetricsResponse
from app.services.dashboard_service import dashboard_service
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)
router = APIRouter(tags=["Monitoring"])

AVAILABLE_MODULES = [
    "triage_model", "orientation_model", "deterioration_model",
    "exams_model", "lab_tests_model", "los_regressor",
]


@router.get("/metrics", response_model=list[MetricsResponse], summary="Retourne les métriques de performance des modèles ML")
async def get_metrics(module: str | None = Query(default=None, description="Filtrer sur un module précis")):
    """
    Retourne les métriques de performance (accuracy, F1, RMSE, etc.)
    des modèles ML actuellement chargés, calculées lors du dernier
    entraînement.

    Args:
        module: Nom d'un module spécifique (optionnel). Si absent,
            retourne les métriques de tous les modules disponibles.
    """
    modules_to_query = [module] if module else AVAILABLE_MODULES
    results = []

    for name in modules_to_query:
        try:
            meta = model_registry.get_metadata(name)
            if not meta:
                continue

            all_metrics = meta.get("all_metrics", {})
            best_algo = meta.get("best_algorithm")
            flat_metrics = all_metrics.get(best_algo, {}) if best_algo in all_metrics else all_metrics

            numeric_metrics = {k: v for k, v in flat_metrics.items() if isinstance(v, (int, float))}

            results.append(
                MetricsResponse(
                    model_name=name,
                    metrics=numeric_metrics,
                    trained_at=meta.get("trained_at"),
                    dataset_size=meta.get("dataset_size"),
                )
            )
        except ModelNotLoadedException:
            continue

    if module and not results:
        raise HTTPException(status_code=404, detail=f"Aucune métrique disponible pour le module '{module}'.")

    return results


@router.get("/dashboard", response_model=DashboardResponse, summary="Statistiques temps réel du service des urgences")
async def get_dashboard(window_hours: int = Query(default=24, ge=1, le=168, description="Fenêtre temporelle en heures")):
    """
    Calcule et retourne les statistiques agrégées du service des
    urgences (module 11 : Dashboard intelligent), utilisées pour
    alimenter les tableaux de bord du frontend React.
    """
    return dashboard_service.compute_dashboard_statistics(window_hours=window_hours)
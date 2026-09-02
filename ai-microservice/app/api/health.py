"""
health.py
=========
Endpoint de vérification de l'état du microservice (liveness/readiness
probe), compatible Docker/Kubernetes.
"""

from fastapi import APIRouter

from app.core.config import get_settings
from app.models.model_loader import model_registry
from app.schemas.response import HealthResponse

router = APIRouter(tags=["Health"])
settings = get_settings()


@router.get("/health", response_model=HealthResponse, summary="Vérifie l'état de santé du microservice")
async def health_check() -> HealthResponse:
    """
    Retourne l'état de santé global du microservice, incluant le
    statut de chargement de chaque modèle ML. Utilisé par Spring Boot
    et par les sondes Kubernetes (liveness/readiness).
    """
    models_status = model_registry.list_available_models()
    all_critical_loaded = models_status.get("triage_model", False)

    return HealthResponse(
        status="healthy" if all_critical_loaded else "degraded",
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        models_loaded=models_status,
    )
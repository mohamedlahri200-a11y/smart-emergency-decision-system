"""
main.py
=======
Point d'entrée principal du microservice IA - CHU Mohammed VI Oujda.

Initialise l'application FastAPI, configure le CORS pour la
communication avec Spring Boot et React, enregistre tous les
routeurs API et gère le cycle de vie (chargement des modèles au
démarrage).
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import health, predict, metrics, retrain, model_info, imaging_predict
from app.core.config import get_settings
from app.core.exceptions import AIServiceBaseException
from app.core.logging import setup_logging, get_logger
from app.models.model_loader import model_registry

settings = get_settings()
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gère le cycle de vie de l'application : tente de précharger les
    modèles ML en mémoire au démarrage (s'ils existent déjà sur
    disque) afin d'éviter une latence sur la première requête.
    """
    logger.info("Démarrage du microservice IA - %s", settings.APP_NAME)
    for model_name in model_registry.list_available_models():
        try:
            model_registry.load_model(model_name)
        except Exception:  # noqa: BLE001
            logger.warning("Modèle '%s' non disponible au démarrage (entraînement requis).", model_name)
    yield
    logger.info("Arrêt du microservice IA.")


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Microservice d'Intelligence Artificielle pour l'aide à la décision médicale "
        "aux urgences - CHU Mohammed VI Oujda. Fournit des recommandations de triage, "
        "d'orientation, d'examens et d'analyses, sans jamais remplacer la décision médicale."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AIServiceBaseException)
async def ai_service_exception_handler(request: Request, exc: AIServiceBaseException):
    """Gestionnaire global des exceptions métier du microservice."""
    logger.error("Exception métier interceptée : %s - %s", exc.code, exc.message)
    return JSONResponse(status_code=422, content={"code": exc.code, "message": exc.message})


# Enregistrement des routeurs sous le préfixe API principal
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(predict.router, prefix=settings.API_PREFIX)
app.include_router(metrics.router, prefix=settings.API_PREFIX)
app.include_router(retrain.router, prefix=settings.API_PREFIX)
app.include_router(model_info.router, prefix=settings.API_PREFIX)
app.include_router(imaging_predict.router, prefix=settings.API_PREFIX)

# /health également exposé à la racine, requis par les sondes liveness/readiness Kubernetes standards
app.include_router(health.router)


@app.get("/", tags=["Root"], summary="Informations générales sur le microservice")
async def root():
    """Endpoint racine, utile pour vérifier rapidement que le service répond."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }
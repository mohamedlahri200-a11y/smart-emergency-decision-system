"""
predict.py (api)
=================
Endpoint principal POST /predict, appelé par le backend Spring Boot
pour obtenir l'ensemble des recommandations IA relatives à un
patient donné.
"""

from fastapi import APIRouter, HTTPException

from app.core.exceptions import AIServiceBaseException
from app.schemas.request import PredictRequest
from app.schemas.response import PredictResponse
from app.services.prediction_service import prediction_service
from app.services.second_analysis_service import affiner_avec_resultats
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)
router = APIRouter(tags=["Prediction"])


@router.post("/predict", response_model=PredictResponse, summary="Génère la prédiction IA complète pour un patient")
async def predict(request: PredictRequest) -> PredictResponse:
    """
    Reçoit les données cliniques d'un patient et retourne un objet
    JSON unique regroupant les résultats des 15 modules IA : triage,
    orientation, examens, analyses biologiques, protocoles, facteurs
    de risque, urgences vitales, recommandations personnalisées,
    explication XAI, et temps estimés de prise en charge.

    Si `lab_imaging_results` est fourni (2ème analyse, réalisée par le
    médecin urgentiste après retour des résultats du radiologue et du
    biologiste), la prédiction de base est affinée par un moteur de
    règles cliniques (cf. second_analysis_service) avant d'être
    renvoyée.

    Args:
        request: Requête contenant les données patient et les options
            de prédiction.

    Returns:
        PredictResponse : objet JSON unique attendu par Spring Boot.
    """
    try:
        result = prediction_service.predict(
            patient=request.patient, include_explanation=request.include_explanation
        )

        if request.lab_imaging_results is not None:
            result = affiner_avec_resultats(result, request.lab_imaging_results)
            logger.info(
                "Analyse complémentaire (résultats labo/imagerie) appliquée : id=%s | service affiné=%s",
                result.prediction_id, result.recommended_service,
            )

        logger.info(
            "Prédiction générée : id=%s | priorité=%s | service=%s",
            result.prediction_id, result.priority, result.recommended_service,
        )
        return result

    except AIServiceBaseException as exc:
        logger.error("Erreur métier lors de la prédiction : %s", exc.message)
        raise HTTPException(status_code=422, detail={"code": exc.code, "message": exc.message}) from exc

    except Exception as exc:  # noqa: BLE001
        logger.exception("Erreur inattendue lors de la prédiction")
        raise HTTPException(
            status_code=500, detail={"code": "INTERNAL_ERROR", "message": "Erreur interne du microservice IA."}
        ) from exc
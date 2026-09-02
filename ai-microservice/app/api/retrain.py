"""
retrain.py (api)
=================
Endpoint POST /retrain permettant de déclencher manuellement (ou de
manière automatisée) le réentraînement des modèles ML, ainsi que le
endpoint de soumission des validations médecins alimentant
l'apprentissage continu (module 14).
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.schemas.request import RetrainRequest, ValidationFeedback
from app.training.continuous_learning import continuous_learning_service
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)
router = APIRouter(tags=["Training"])


@router.post("/retrain", summary="Déclenche le réentraînement des modèles ML")
async def retrain(request: RetrainRequest, background_tasks: BackgroundTasks):
    """
    Déclenche le réentraînement des modèles ML, soit immédiatement en
    tâche de fond (force=True), soit uniquement si le seuil de
    nouvelles validations médicales est atteint (apprentissage continu).

    Args:
        request: Paramètres de la requête de réentraînement.
        background_tasks: Mécanisme FastAPI d'exécution asynchrone en tâche de fond.

    Returns:
        Statut de la demande (le réentraînement s'exécute en arrière-plan).
    """
    try:
        pending = continuous_learning_service.count_pending_feedback()

        background_tasks.add_task(
            continuous_learning_service.trigger_retrain_if_needed, force=request.force
        )

        return {
            "status": "accepted",
            "message": "Le réentraînement a été planifié en tâche de fond.",
            "force": request.force,
            "pending_feedback": pending,
        }

    except Exception as exc:  # noqa: BLE001
        logger.exception("Erreur lors du déclenchement du réentraînement")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/feedback", summary="Enregistre la validation d'un médecin sur une prédiction IA")
async def submit_feedback(feedback: ValidationFeedback):
    """
    Permet à un médecin urgentiste (via Spring Boot) de valider ou
    corriger une prédiction IA. Ces retours alimentent la boucle
    d'apprentissage continu (module 14).

    Args:
        feedback: Retour de validation du médecin.

    Returns:
        Confirmation d'enregistrement.
    """
    try:
        continuous_learning_service.record_feedback(feedback)
        return {"status": "recorded", "prediction_id": feedback.prediction_id}
    except Exception as exc:  # noqa: BLE001
        logger.exception("Erreur lors de l'enregistrement du feedback")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
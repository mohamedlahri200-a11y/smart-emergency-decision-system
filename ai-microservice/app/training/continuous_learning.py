"""
continuous_learning.py
=======================
Module d'apprentissage continu (module 14 du cahier des charges).

Permet d'accumuler les validations/corrections des médecins
urgentistes (via le endpoint de feedback) et de déclencher un
réentraînement automatique des modèles lorsqu'un seuil suffisant
de nouvelles données validées est atteint.
"""

import json
from datetime import datetime
from typing import List

from app.core.config import get_settings
from app.schemas.request import ValidationFeedback
from app.training.train import train_all_models
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)
settings = get_settings()

FEEDBACK_LOG_PATH = settings.DATASETS_DIR / "medical_feedback_log.jsonl"
RETRAIN_THRESHOLD = 500  # Nombre de nouveaux feedbacks avant réentraînement automatique


class ContinuousLearningService:
    """Service orchestrant la boucle d'apprentissage continu."""

    RETRAIN_THRESHOLD = RETRAIN_THRESHOLD

    def record_feedback(self, feedback: ValidationFeedback) -> None:
        """
        Enregistre le retour d'un médecin sur une prédiction IA, dans
        un fichier journal (JSONL) qui alimentera les futurs
        réentraînements.

        Args:
            feedback: Objet de validation/correction fourni par le médecin.
        """
        record = {
            "prediction_id": feedback.prediction_id,
            "validated_priority": feedback.validated_priority,
            "validated_service": feedback.validated_service,
            "is_correct": feedback.is_correct,
            "comment": feedback.comment,
            "recorded_at": datetime.now().isoformat(),
        }
        with open(FEEDBACK_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

        logger.info("Feedback médecin enregistré pour la prédiction %s", feedback.prediction_id)

    def count_pending_feedback(self) -> int:
        """Compte le nombre de feedbacks accumulés depuis le dernier réentraînement."""
        if not FEEDBACK_LOG_PATH.exists():
            return 0
        with open(FEEDBACK_LOG_PATH, "r", encoding="utf-8") as f:
            return sum(1 for _ in f)

    def should_trigger_retrain(self) -> bool:
        """Détermine si le seuil de réentraînement automatique est atteint."""
        return self.count_pending_feedback() >= RETRAIN_THRESHOLD

    def trigger_retrain_if_needed(self, force: bool = False, n_patients: int = None) -> dict:
        """
        Déclenche le réentraînement complet des modèles si le seuil est
        atteint, ou si `force=True`.

        Args:
            force: Force le réentraînement même si le seuil n'est pas atteint.
            n_patients: Taille du dataset à régénérer.

        Returns:
            Résultat du réentraînement, ou message indiquant qu'aucune
            action n'a été effectuée.
        """
        if not force and not self.should_trigger_retrain():
            pending = self.count_pending_feedback()
            logger.info(
                "Réentraînement non déclenché (%d/%d feedbacks accumulés)", pending, RETRAIN_THRESHOLD
            )
            return {"triggered": False, "pending_feedback": pending, "threshold": RETRAIN_THRESHOLD}

        logger.info("Déclenchement du réentraînement complet des modèles.")
        results = train_all_models(n_patients=n_patients)

        if FEEDBACK_LOG_PATH.exists():
            archive_path = settings.DATASETS_DIR / f"feedback_archive_{datetime.now().strftime('%Y%m%d%H%M%S')}.jsonl"
            FEEDBACK_LOG_PATH.rename(archive_path)

        return {"triggered": True, "results": results}


continuous_learning_service = ContinuousLearningService()
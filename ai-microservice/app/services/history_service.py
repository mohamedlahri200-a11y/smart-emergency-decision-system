"""
history_service.py
===================
Service d'historique intelligent des prédictions (module 13).

Persiste chaque prédiction générée par le microservice dans une
base SQLite légère, afin d'alimenter le dashboard temps réel,
l'optimisation des flux et la boucle d'apprentissage continu, sans
dépendance à une base de données externe lourde.
"""

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from app.core.config import get_settings
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)
settings = get_settings()

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS prediction_history (
    prediction_id TEXT PRIMARY KEY,
    patient_id TEXT,
    priority TEXT,
    recommended_service TEXT,
    clinical_risk TEXT,
    deterioration_risk TEXT,
    estimated_length_of_stay REAL,
    estimated_waiting_time REAL,
    confidence_score REAL,
    full_response TEXT,
    created_at TEXT
);
"""


class HistoryService:
    """Service de persistance et de consultation de l'historique des prédictions."""

    def __init__(self):
        settings.HISTORY_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    @contextmanager
    def _connect(self):
        """Fournit une connexion SQLite avec gestion automatique du contexte."""
        conn = sqlite3.connect(str(settings.HISTORY_DB_PATH))
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()

    def _init_db(self) -> None:
        """Initialise la table d'historique si elle n'existe pas déjà."""
        with self._connect() as conn:
            conn.execute(CREATE_TABLE_SQL)

    def record_prediction(self, prediction_dict: Dict) -> None:
        """
        Enregistre une prédiction complète dans l'historique.

        Args:
            prediction_dict: Représentation dict de la réponse PredictResponse,
                incluant patient_id ajouté séparément par l'appelant.
        """
        with self._connect() as conn:
            conn.execute(
                """INSERT OR REPLACE INTO prediction_history
                   (prediction_id, patient_id, priority, recommended_service, clinical_risk,
                    deterioration_risk, estimated_length_of_stay, estimated_waiting_time,
                    confidence_score, full_response, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    prediction_dict["prediction_id"],
                    prediction_dict.get("patient_id", "unknown"),
                    prediction_dict["priority"],
                    prediction_dict["recommended_service"],
                    prediction_dict["clinical_risk"],
                    prediction_dict["deterioration_risk"],
                    prediction_dict["estimated_length_of_stay"],
                    prediction_dict["estimated_waiting_time"],
                    prediction_dict["confidence_score"],
                    json.dumps(prediction_dict, default=str, ensure_ascii=False),
                    datetime.now().isoformat(),
                ),
            )
        logger.debug("Prédiction %s enregistrée dans l'historique", prediction_dict["prediction_id"])

    def get_recent(self, hours: int = 24) -> List[Dict]:
        """Retourne toutes les prédictions enregistrées durant les N dernières heures."""
        cutoff = (datetime.now() - timedelta(hours=hours)).isoformat()
        with self._connect() as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute(
                "SELECT * FROM prediction_history WHERE created_at >= ? ORDER BY created_at DESC", (cutoff,)
            ).fetchall()
        return [dict(row) for row in rows]

    def get_by_id(self, prediction_id: str) -> Optional[Dict]:
        """Récupère une prédiction précise par son identifiant."""
        with self._connect() as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute(
                "SELECT * FROM prediction_history WHERE prediction_id = ?", (prediction_id,)
            ).fetchone()
        return dict(row) if row else None

    def count_total(self) -> int:
        """Retourne le nombre total de prédictions enregistrées."""
        with self._connect() as conn:
            result = conn.execute("SELECT COUNT(*) FROM prediction_history").fetchone()
        return result[0] if result else 0


history_service = HistoryService()
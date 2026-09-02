"""
dashboard_service.py
=====================
Service de calcul automatique des statistiques pour le tableau de
bord (module 11), à partir de l'historique intelligent des
prédictions.
"""

from collections import Counter
from typing import Dict

from app.core.constants import HospitalService, TriagePriority
from app.schemas.response import DashboardResponse
from app.services.history_service import history_service
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)


class DashboardService:
    """Service d'agrégation des statistiques temps réel pour le dashboard."""

    @staticmethod
    def compute_dashboard_statistics(window_hours: int = 24) -> DashboardResponse:
        """
        Calcule les statistiques agrégées du service des urgences sur
        une fenêtre temporelle donnée.

        Args:
            window_hours: Fenêtre temporelle en heures (défaut : 24h).

        Returns:
            Objet DashboardResponse prêt à être renvoyé par l'API.
        """
        records = history_service.get_recent(hours=window_hours)

        total = len(records)
        priority_distribution: Dict[str, int] = Counter(r["priority"] for r in records)
        service_load: Dict[str, int] = Counter(r["recommended_service"] for r in records)

        avg_waiting = (
            sum(r["estimated_waiting_time"] for r in records) / total if total else 0.0
        )
        avg_los = (
            sum(r["estimated_length_of_stay"] for r in records) / total if total else 0.0
        )

        critical_alerts = sum(
            1 for r in records if r["priority"] == TriagePriority.ROUGE.value or r["clinical_risk"] not in ("Aucune", "")
        )

        full_priority_distribution = {p.value: priority_distribution.get(p.value, 0) for p in TriagePriority}
        full_service_load = {s.value: service_load.get(s.value, 0) for s in HospitalService}

        return DashboardResponse(
            total_patients_today=total,
            priority_distribution=full_priority_distribution,
            average_waiting_time=round(avg_waiting, 2),
            average_length_of_stay=round(avg_los, 2),
            service_load=full_service_load,
            active_critical_alerts=critical_alerts,
        )


dashboard_service = DashboardService()
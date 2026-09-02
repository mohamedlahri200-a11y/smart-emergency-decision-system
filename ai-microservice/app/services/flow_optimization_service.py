"""
flow_optimization_service.py
=============================
Service d'optimisation de la répartition des patients entre les
différents secteurs des urgences (module 12), en tenant compte de
la charge actuelle de chaque service et de la priorité du patient.
"""

from typing import Dict

from app.core.constants import HospitalService, TriagePriority
from app.services.history_service import history_service
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)

DEFAULT_SERVICE_CAPACITY = {
    HospitalService.CARDIOLOGIE.value: 15,
    HospitalService.NEUROLOGIE.value: 10,
    HospitalService.ORTHOPEDIE.value: 12,
    HospitalService.PNEUMOLOGIE.value: 12,
    HospitalService.REANIMATION.value: 8,
    HospitalService.URGENCE_GENERALE.value: 25,
    HospitalService.CHIRURGIE.value: 10,
}


class FlowOptimizationService:
    """Service d'optimisation de la répartition des patients entre secteurs."""

    @staticmethod
    def get_current_load(window_hours: int = 6) -> Dict[str, int]:
        """Calcule la charge actuelle (nombre de patients) de chaque service."""
        records = history_service.get_recent(hours=window_hours)
        load = {service: 0 for service in DEFAULT_SERVICE_CAPACITY}
        for r in records:
            service = r.get("recommended_service")
            if service in load:
                load[service] += 1
        return load

    def compute_saturation_rates(self, window_hours: int = 6) -> Dict[str, float]:
        """Calcule le taux de saturation (%) de chaque service hospitalier."""
        load = self.get_current_load(window_hours)
        return {
            service: round(100 * count / DEFAULT_SERVICE_CAPACITY[service], 1)
            for service, count in load.items()
        }

    def suggest_alternative_service(self, recommended_service: str, priority: str, window_hours: int = 6) -> str:
        """
        Suggère un service alternatif si le service initialement
        recommandé par le modèle d'orientation est saturé, en
        respectant une compatibilité clinique minimale.

        Args:
            recommended_service: Service initialement recommandé par l'IA.
            priority: Priorité de triage du patient.
            window_hours: Fenêtre d'observation de la charge.

        Returns:
            Nom du service final recommandé.
        """
        saturation = self.compute_saturation_rates(window_hours)
        current_saturation = saturation.get(recommended_service, 0)

        if priority == TriagePriority.ROUGE.value:
            return recommended_service

        if current_saturation < 90:
            return recommended_service

        fallback = HospitalService.URGENCE_GENERALE.value
        if recommended_service != fallback and saturation.get(fallback, 0) < 90:
            logger.info(
                "Service '%s' saturé (%.1f%%) - patient redirigé vers '%s'",
                recommended_service, current_saturation, fallback,
            )
            return fallback

        return recommended_service

    def get_flow_report(self) -> Dict:
        """Retourne un rapport complet de charge et saturation des services."""
        load = self.get_current_load()
        saturation = self.compute_saturation_rates()
        return {
            "current_load": load,
            "capacity": DEFAULT_SERVICE_CAPACITY,
            "saturation_rates": saturation,
            "most_saturated_service": max(saturation, key=saturation.get) if saturation else None,
        }


flow_optimization_service = FlowOptimizationService()
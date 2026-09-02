"""
recommendation_service.py
==========================
Service de génération des protocoles thérapeutiques hospitaliers
(informatifs, jamais de prescription nominative) et des
recommandations personnalisées au patient (modules 5 et 9).
"""

from typing import List

from app.core.constants import THERAPEUTIC_PROTOCOLS, VitalEmergency
from app.schemas.patient import PatientData
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)


class RecommendationService:
    """Service de recommandations cliniques personnalisées."""

    @staticmethod
    def suggest_protocols(vital_emergencies: List[str]) -> List[str]:
        """
        Suggère les protocoles thérapeutiques hospitaliers standards
        associés aux urgences vitales détectées. Ne constitue en
        aucun cas une prescription médicale.

        Args:
            vital_emergencies: Liste des urgences vitales suspectées.

        Returns:
            Liste des noms de protocoles hospitaliers applicables.
        """
        protocols = []
        for emergency_str in vital_emergencies:
            try:
                emergency_enum = VitalEmergency(emergency_str)
                protocol = THERAPEUTIC_PROTOCOLS.get(emergency_enum)
                if protocol:
                    protocols.append(protocol)
            except ValueError:
                continue
        return protocols

    @staticmethod
    def generate_patient_recommendations(
        patient: PatientData, priority: str, risk_factors: List[str], deterioration_risk: str
    ) -> List[str]:
        """
        Génère des recommandations personnalisées à destination de
        l'équipe soignante, basées sur le profil du patient.

        Args:
            patient: Données cliniques du patient.
            priority: Niveau de triage prédit.
            risk_factors: Facteurs de risque détectés.
            deterioration_risk: Niveau de risque d'aggravation prédit.

        Returns:
            Liste de recommandations en langage clair.
        """
        recommendations = []

        if priority in {"Rouge", "Orange"}:
            recommendations.append("Surveillance rapprochée des constantes vitales (scope, monitoring continu)")

        if deterioration_risk in {"Eleve", "Critique"}:
            recommendations.append("Réévaluation clinique à intervalle rapproché recommandée (< 30 min)")

        if "Désaturation en oxygène" in risk_factors:
            recommendations.append("Mise sous oxygénothérapie et surveillance de la SpO2")

        if "Douleur sévère non contrôlée" in risk_factors:
            recommendations.append("Prise en charge de la douleur à évaluer selon protocole antalgique en vigueur")

        if patient.age >= 75:
            recommendations.append("Attention particulière à la iatrogénie et à la fonction rénale chez le sujet âgé")

        allergies = [a for a in patient.allergies if a != "Aucune"]
        if allergies:
            recommendations.append(f"Vérifier les allergies déclarées avant toute administration : {', '.join(allergies)}")

        antecedents = [a for a in patient.antecedents if a != "Aucun"]
        if "Diabete" in antecedents:
            recommendations.append("Surveillance glycémique régulière recommandée")
        if "Insuffisance_Renale" in antecedents:
            recommendations.append("Adapter les posologies et examens à la fonction rénale du patient")

        if not recommendations:
            recommendations.append("Prise en charge standard, aucune recommandation spécifique complémentaire")

        return recommendations


recommendation_service = RecommendationService()
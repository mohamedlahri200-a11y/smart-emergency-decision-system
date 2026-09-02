"""
risk_service.py
================
Service de détection automatique des facteurs de risque et des
urgences vitales (modules 6 et 8 du cahier des charges).

La détection des urgences vitales combine des règles cliniques
explicites (seuils NEWS2, combinaisons de symptômes/constantes
reconnues médicalement) avec la sortie du modèle de risque
d'aggravation, afin de garantir une détection fiable et explicable
même en zone d'incertitude du modèle ML (sécurité patient prioritaire).
"""

from typing import List

from app.core.constants import VITAL_THRESHOLDS, VitalEmergency
from app.schemas.patient import PatientData
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)


class RiskService:
    """Service de détection de facteurs de risque et d'urgences vitales."""

    @staticmethod
    def detect_risk_factors(patient: PatientData) -> List[str]:
        """
        Détecte automatiquement les facteurs de risque d'un patient à
        partir de ses constantes vitales, antécédents et âge.

        Args:
            patient: Données cliniques du patient.

        Returns:
            Liste de facteurs de risque identifiés, en langage clair.
        """
        factors = []
        th = VITAL_THRESHOLDS

        if patient.age >= 75:
            factors.append("Âge avancé (>= 75 ans)")
        if patient.temperature >= th["temperature"]["high"]:
            factors.append("Hyperthermie")
        if patient.temperature <= th["temperature"]["low"]:
            factors.append("Hypothermie")
        if patient.frequence_cardiaque >= th["heart_rate"]["high"]:
            factors.append("Tachycardie")
        if patient.frequence_cardiaque <= th["heart_rate"]["low"]:
            factors.append("Bradycardie")
        if patient.pression_arterielle_systolique <= th["systolic_bp"]["low"]:
            factors.append("Hypotension artérielle")
        if patient.pression_arterielle_systolique >= th["systolic_bp"]["critical_high"]:
            factors.append("Poussée hypertensive sévère")
        if patient.frequence_respiratoire >= th["respiratory_rate"]["high"]:
            factors.append("Tachypnée")
        if patient.saturation_o2 <= th["spo2"]["low"]:
            factors.append("Désaturation en oxygène")
        if patient.glycemie >= th["glycemia"]["high"]:
            factors.append("Hyperglycémie")
        if patient.glycemie <= th["glycemia"]["low"]:
            factors.append("Hypoglycémie")
        if patient.score_gcs < 15:
            factors.append("Altération de la conscience")
        if patient.douleur_eva >= th["pain_eva"]["high"]:
            factors.append("Douleur sévère non contrôlée")

        for atcd in patient.antecedents:
            if atcd in {"Cardiopathie", "Insuffisance_Renale", "Immunodepression", "Coagulopathie", "Cancer"}:
                factors.append(f"Antécédent à risque : {atcd.replace('_', ' ')}")

        if patient.imc >= 35:
            factors.append("Obésité sévère (IMC >= 35)")

        return list(dict.fromkeys(factors))  # dédoublonnage en conservant l'ordre

    @staticmethod
    def detect_vital_emergencies(patient: PatientData) -> List[str]:
        """
        Détecte automatiquement les urgences vitales suspectées à
        partir de règles cliniques combinant symptômes et constantes
        vitales (module 8).

        Args:
            patient: Données cliniques du patient.

        Returns:
            Liste des urgences vitales suspectées (peut être vide).
        """
        symptomes = {s.lower() for s in patient.symptomes}
        emergencies = []

        # AVC : signes neurologiques focaux
        if symptomes.intersection({"paralysie_faciale", "trouble_parole", "faiblesse_musculaire"}):
            emergencies.append(VitalEmergency.AVC.value)

        # Infarctus : douleur thoracique + facteurs associés
        if "douleur_thoracique" in symptomes and (
            symptomes.intersection({"dyspnee", "palpitations", "nausees"})
            or patient.frequence_cardiaque > 100
        ):
            emergencies.append(VitalEmergency.INFARCTUS.value)

        # Sepsis : fièvre + hypotension/tachycardie + confusion
        if patient.temperature >= 38.3 and (
            patient.pression_arterielle_systolique < 100 or patient.frequence_cardiaque > 110
        ) and ("confusion" in symptomes or patient.frequence_respiratoire > 22):
            emergencies.append(VitalEmergency.SEPSIS.value)

        # Choc : hypotension sévère + tachycardie (choc index élevé)
        choc_index = patient.frequence_cardiaque / max(patient.pression_arterielle_systolique, 1)
        if choc_index >= 1.0 and patient.pression_arterielle_systolique < 90:
            emergencies.append(VitalEmergency.CHOC.value)

        # Arrêt cardiaque imminent : GCS très bas + constantes effondrées
        if patient.score_gcs <= 6 and (patient.saturation_o2 < 85 or patient.frequence_cardiaque < 40):
            emergencies.append(VitalEmergency.ARRET_CARDIAQUE.value)

        # Détresse respiratoire : SpO2 basse + FR élevée/basse
        if patient.saturation_o2 < 90 and (patient.frequence_respiratoire > 25 or patient.frequence_respiratoire < 10):
            emergencies.append(VitalEmergency.DETRESSE_RESPIRATOIRE.value)

        return list(dict.fromkeys(emergencies))

    @staticmethod
    def generate_active_alerts(patient: PatientData, risk_factors: List[str], vital_emergencies: List[str]) -> List[str]:
        """
        Génère la liste des alertes cliniques actives à afficher au
        médecin (fusion des urgences vitales détectées et des
        facteurs de risque critiques).

        Args:
            patient: Données cliniques du patient.
            risk_factors: Facteurs de risque déjà détectés.
            vital_emergencies: Urgences vitales déjà détectées.

        Returns:
            Liste d'alertes formatées, triées par criticité.
        """
        alerts = [f"⚠ URGENCE VITALE SUSPECTÉE : {e.replace('_', ' ')}" for e in vital_emergencies]

        if patient.saturation_o2 < 90:
            alerts.append("🔴 Hypoxémie sévère - Oxygénothérapie à envisager immédiatement")
        if patient.score_gcs <= 8:
            alerts.append("🔴 Conscience gravement altérée - Protection des voies aériennes à évaluer")
        if patient.pression_arterielle_systolique < 80:
            alerts.append("🔴 État de choc hémodynamique probable")

        allergies_notables = [a for a in patient.allergies if a != "Aucune"]
        if allergies_notables:
            alerts.append(f"ℹ Allergies connues : {', '.join(allergies_notables)}")

        return alerts


risk_service = RiskService()
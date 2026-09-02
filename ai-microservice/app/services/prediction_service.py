"""
prediction_service.py
======================
Service central d'orchestration : reçoit un patient, exécute
l'ensemble des modules IA (triage, orientation, examens, analyses,
risques, urgences vitales, protocoles, recommandations, XAI,
optimisation de flux, historique) et assemble l'objet de réponse
unique attendu par Spring Boot.
"""

from typing import List

import numpy as np
import pandas as pd

from app.core.constants import MODEL_VERSION
from app.core.exceptions import PredictionException
from app.models.model_loader import model_registry
from app.schemas.patient import PatientData
from app.schemas.response import AIExplanation, PredictResponse
from app.services.dashboard_service import dashboard_service  # noqa: F401 (chargement anticipé)
from app.services.explanation_service import explanation_service
from app.services.feature_engineering import FeatureEngineeringService
from app.services.flow_optimization_service import flow_optimization_service
from app.services.history_service import history_service
from app.services.preprocessing import PreprocessingService
from app.services.recommendation_service import recommendation_service
from app.services.risk_service import risk_service
from app.utils.helpers import generate_prediction_id, safe_round
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)


class PredictionService:
    """Service central orchestrant l'ensemble des modules IA pour une prédiction."""

    def __init__(self):
        self.preprocessing = PreprocessingService()
        self.feature_engineering = FeatureEngineeringService()

    def _align_features(self, X: pd.DataFrame, expected_features: List[str]) -> pd.DataFrame:
        """
        Aligne les colonnes de la matrice de features d'inférence sur
        celles utilisées lors de l'entraînement.

        Args:
            X: Matrice de features générée pour le patient courant.
            expected_features: Liste des features attendues par le modèle.

        Returns:
            DataFrame aligné, prêt pour model.predict().
        """
        for col in expected_features:
            if col not in X.columns:
                X[col] = 0
        return X[expected_features]

    def _predict_with_confidence(self, model, X_row: pd.DataFrame):
        """Retourne la classe prédite et un score de confiance associé."""
        prediction = model.predict(X_row)[0]
        confidence = 0.75
        if hasattr(model, "predict_proba"):
            proba = model.predict_proba(X_row)[0]
            confidence = float(np.max(proba))
        return prediction, confidence

    def predict(self, patient: PatientData, include_explanation: bool = True) -> PredictResponse:
        """
        Exécute le pipeline complet de prédiction pour un patient donné.

        Args:
            patient: Données cliniques du patient.
            include_explanation: Générer ou non l'explication XAI (SHAP).

        Returns:
            Objet PredictResponse complet, prêt à être sérialisé en JSON.

        Raises:
            PredictionException: En cas d'échec du pipeline de prédiction.
        """
        try:
            prediction_id = generate_prediction_id()

            # 1. Prétraitement + feature engineering du patient
            df_raw = self.preprocessing.transform_single_patient(patient)
            X_full = self.feature_engineering.build_full_feature_matrix(df_raw, self.preprocessing)

            # 2. Détection des urgences vitales et facteurs de risque (règles cliniques)
            risk_factors = risk_service.detect_risk_factors(patient)
            vital_emergencies = risk_service.detect_vital_emergencies(patient)

            # 3. Module 1 : Triage intelligent
            triage_model = model_registry.load_model("triage_model")
            triage_meta = model_registry.get_metadata("triage_model")
            X_triage = self._align_features(X_full.copy(), triage_meta["feature_names"])
            priority, triage_confidence = self._predict_with_confidence(triage_model, X_triage)

            priority_rank = {"Rouge": 100, "Orange": 75, "Jaune": 50, "Vert": 25, "Bleu": 10}
            base_score = priority_rank.get(priority, 50)
            priority_score = safe_round(base_score * (0.7 + 0.3 * triage_confidence), 2)

            # 4. Module 2 : Orientation hospitalière
            orientation_model = model_registry.load_model("orientation_model")
            orientation_meta = model_registry.get_metadata("orientation_model")
            X_orientation = self._align_features(X_full.copy(), orientation_meta["feature_names"])
            recommended_service, orientation_confidence = self._predict_with_confidence(orientation_model, X_orientation)

            recommended_service = flow_optimization_service.suggest_alternative_service(
                recommended_service, priority
            )

            # 5. Module 7 : Risque d'aggravation clinique
            deterioration_model = model_registry.load_model("deterioration_model")
            deterioration_meta = model_registry.get_metadata("deterioration_model")
            X_deterioration = self._align_features(X_full.copy(), deterioration_meta["feature_names"])
            deterioration_risk, deterioration_confidence = self._predict_with_confidence(deterioration_model, X_deterioration)

            # 6. Module 3 : Examens complémentaires (multi-label)
            recommended_exams = self._predict_multilabel("exams_model", X_full.copy())

            # 7. Module 4 : Analyses biologiques (multi-label)
            recommended_lab_tests = self._predict_multilabel("lab_tests_model", X_full.copy())

            # 8. Module 15 : Temps de prise en charge (régression)
            los_model = model_registry.load_model("los_regressor")
            los_meta = model_registry.get_metadata("los_regressor")
            X_los = self._align_features(X_full.copy(), los_meta["feature_names"])
            estimated_length_of_stay = safe_round(float(los_model.predict(X_los)[0]), 2)

            estimated_waiting_time = self._estimate_waiting_time(priority)

            # 9. Module 8 (suite) : alertes actives
            active_alerts = risk_service.generate_active_alerts(patient, risk_factors, vital_emergencies)

            # 10. Module 5 : Protocoles thérapeutiques
            recommended_protocols = recommendation_service.suggest_protocols(vital_emergencies)

            # 11. Module 9 : Recommandations personnalisées
            patient_recommendations = recommendation_service.generate_patient_recommendations(
                patient, priority, risk_factors, deterioration_risk
            )

            # 12. Module 10 : Explainable AI
            if include_explanation:
                ai_explanation = explanation_service.explain_prediction(
                    "triage_model", triage_model, X_triage, priority
                )
            else:
                ai_explanation = AIExplanation(method="N/A", summary="Explication non demandée.", top_features=[])

            # 13. Score de confiance global
            confidence_score = safe_round(
                float(np.mean([triage_confidence, orientation_confidence, deterioration_confidence])), 3
            )

            clinical_risk = ", ".join(vital_emergencies) if vital_emergencies else "Aucune urgence vitale détectée"

            response = PredictResponse(
                prediction_id=prediction_id,
                priority=priority,
                priority_score=priority_score,
                recommended_service=recommended_service,
                recommended_exams=recommended_exams,
                recommended_lab_tests=recommended_lab_tests,
                clinical_risk=clinical_risk,
                deterioration_risk=deterioration_risk,
                estimated_length_of_stay=estimated_length_of_stay,
                estimated_waiting_time=estimated_waiting_time,
                identified_risk_factors=risk_factors,
                active_alerts=active_alerts,
                recommended_protocols=recommended_protocols,
                patient_recommendations=patient_recommendations,
                ai_explanation=ai_explanation,
                model_version=MODEL_VERSION,
                confidence_score=confidence_score,
            )

            # 14. Module 13 : Historique intelligent
            record = response.model_dump()
            record["patient_id"] = patient.patient_id or "anonymous"
            history_service.record_prediction(record)

            return response

        except Exception as exc:  # noqa: BLE001
            logger.exception("Échec du pipeline de prédiction")
            raise PredictionException(f"Erreur lors de la génération de la prédiction : {exc}") from exc

    def _predict_multilabel(self, model_name: str, X: pd.DataFrame) -> List[str]:
        """Exécute une prédiction multi-label (examens/analyses) et retourne les labels positifs."""
        import joblib
        from app.core.config import get_settings

        settings = get_settings()
        model = model_registry.load_model(model_name)
        meta = model_registry.get_metadata(model_name)
        X_aligned = self._align_features(X, meta["feature_names"])

        binarizer_path = settings.SAVED_MODELS_DIR / f"{model_name}_binarizer.joblib"
        mlb = joblib.load(binarizer_path)

        y_pred = model.predict(X_aligned)
        labels = mlb.inverse_transform(y_pred)[0]
        return list(labels)

    @staticmethod
    def _estimate_waiting_time(priority: str) -> float:
        """Estime le temps d'attente indicatif selon la priorité de triage (règles SFMU)."""
        mapping = {"Rouge": 0.0, "Orange": 15.0, "Jaune": 45.0, "Vert": 90.0, "Bleu": 120.0}
        return mapping.get(priority, 60.0)


prediction_service = PredictionService()
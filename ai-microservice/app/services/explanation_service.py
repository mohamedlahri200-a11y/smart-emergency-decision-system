
"""
explanation_service.py
=======================

Service d'intelligence artificielle explicable (module 10).

Utilise :
- SHAP TreeExplainer pour les modèles compatibles
- Feature importance native comme fallback pour les wrappers XGBoost

Compatible avec :
- RandomForest
- GradientBoosting
- ExtraTrees
- XGBoost
- LabeledXGBClassifier wrapper
"""

from typing import List

import numpy as np
import pandas as pd
import shap

from app.schemas.response import AIExplanation, FeatureContribution
from app.utils.logger import get_module_logger


logger = get_module_logger(__name__)


FEATURE_LABELS = {
    "age": "Âge",
    "temperature": "Température",
    "frequence_cardiaque": "Fréquence cardiaque",
    "pression_arterielle_systolique": "Pression artérielle systolique",
    "pression_arterielle_diastolique": "Pression artérielle diastolique",
    "pression_arterielle_moyenne": "Pression artérielle moyenne",
    "frequence_respiratoire": "Fréquence respiratoire",
    "saturation_o2": "Saturation en oxygène (SpO2)",
    "glycemie": "Glycémie",
    "douleur_eva": "Douleur (EVA)",
    "score_news2": "Score NEWS2",
    "score_esi": "Score ESI",
    "score_gcs": "Score de Glasgow",
    "choc_index": "Index de choc",
    "imc": "IMC",
}


class ExplanationService:

    """
    Service XAI pour expliquer les décisions IA.
    """

    def __init__(self):
        self._explainers_cache = {}

    # =====================================================
    # Récupération du vrai modèle
    # =====================================================

    def _unwrap_model(self, model):

        """
        Récupère le modèle interne lorsqu'un wrapper est utilisé.
        Exemple :
        LabeledXGBClassifier -> XGBClassifier
        """

        possible_attributes = [
            "_model",
            "model",
            "classifier",
            "estimator",
            "base_model"
        ]

        for attr in possible_attributes:
            if hasattr(model, attr):
                real_model = getattr(model, attr)
                logger.info("Modèle interne détecté pour XAI : %s", type(real_model))
                return real_model

        return model

    # =====================================================
    # Création explainer SHAP
    # =====================================================

    def _get_explainer(self, model_name, model):

        if model_name in self._explainers_cache:
            return self._explainers_cache[model_name]

        real_model = self._unwrap_model(model)

        try:
            explainer = shap.TreeExplainer(real_model)
            self._explainers_cache[model_name] = explainer
            logger.info("Explainer SHAP créé pour %s", model_name)
            return explainer

        except Exception as exc:
            logger.warning("Impossible création SHAP pour %s : %s", model_name, exc)
            self._explainers_cache[model_name] = None
            return None

    # =====================================================
    # Feature importance fallback
    # =====================================================

    def _feature_importance_explanation(self, model, X_row, predicted_class, top_k):

        real_model = self._unwrap_model(model)

        if not hasattr(real_model, "feature_importances_"):
            return AIExplanation(
                method="Regles_Cliniques",
                summary=f"Décision '{predicted_class}' basée sur les paramètres cliniques.",
                top_features=[]
            )

        importances = real_model.feature_importances_
        features = list(zip(X_row.columns, importances))
        features.sort(key=lambda x: x[1], reverse=True)

        top_features = []
        for name, score in features[:top_k]:
            label = FEATURE_LABELS.get(name, name.replace("_", " "))
            value = X_row.iloc[0][name]
            top_features.append(
                FeatureContribution(
                    feature=label,
                    value=str(value),
                    impact=round(float(score), 4),
                    direction="positive"
                )
            )

        return AIExplanation(
            method="Feature_Importance",
            summary=f"La décision '{predicted_class}' est principalement influencée par les variables cliniques importantes du modèle.",
            top_features=top_features
        )

    # =====================================================
    # Explication principale
    # =====================================================

    def explain_prediction(self, model_name: str, model, X_row: pd.DataFrame, predicted_class: str, top_k: int = 5):

        explainer = self._get_explainer(model_name, model)

        if explainer is None:
            return self._feature_importance_explanation(model, X_row, predicted_class, top_k)

        try:
            shap_values = explainer.shap_values(X_row)

            if isinstance(shap_values, list):
                classes = list(getattr(model, "classes_", []))
                index = classes.index(predicted_class) if predicted_class in classes else 0
                values = np.array(shap_values[index])[0]

            elif isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
                values = shap_values[0, :, 0]

            else:
                values = np.array(shap_values)[0]

            feature_names = list(X_row.columns)
            contributions = list(zip(feature_names, values))
            contributions.sort(key=lambda x: abs(x[1]), reverse=True)

            top_features = []
            for feat, impact in contributions[:top_k]:
                label = FEATURE_LABELS.get(feat, feat.replace("_", " "))
                raw_value = X_row.iloc[0][feat]
                top_features.append(
                    FeatureContribution(
                        feature=label,
                        value=str(raw_value),
                        impact=round(float(impact), 4),
                        direction="positive" if impact > 0 else "negative"
                    )
                )

            summary = self._build_natural_language_summary(predicted_class, top_features)

            return AIExplanation(method="SHAP", summary=summary, top_features=top_features)

        except Exception as exc:
            logger.warning("Erreur SHAP %s : %s", model_name, exc)
            return self._feature_importance_explanation(model, X_row, predicted_class, top_k)

    # =====================================================
    # Résumé naturel
    # =====================================================

    @staticmethod
    def _build_natural_language_summary(predicted_class, top_features):

        if not top_features:
            return f"La décision '{predicted_class}' repose sur les paramètres cliniques."

        names = [f.feature for f in top_features[:3]]
        return f"Le niveau '{predicted_class}' a été influencé principalement par : {', '.join(names)}."


explanation_service = ExplanationService()
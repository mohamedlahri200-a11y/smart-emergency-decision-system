"""
evaluation.py
=============
Fonctions d'évaluation et de sélection automatique du meilleur
modèle parmi plusieurs candidats, sur la base de métriques
standardisées (F1-score pondéré pour la classification, RMSE pour
la régression).
"""

from typing import Any, Dict, Tuple

import numpy as np

from app.utils.metrics import compute_classification_metrics, compute_regression_metrics
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)


def evaluate_classifiers(
    candidates: Dict[str, Any], X_test, y_test
) -> Tuple[str, Any, Dict[str, Dict]]:
    """
    Évalue plusieurs classifieurs entraînés et sélectionne le meilleur
    selon le F1-score pondéré.

    Args:
        candidates: Dictionnaire {nom_modele: modele_entraine}.
        X_test: Features de test.
        y_test: Labels de test.

    Returns:
        Tuple (nom_du_meilleur_modele, modele, dict_de_toutes_les_metriques).
    """
    all_metrics = {}
    best_name, best_model, best_score = None, None, -np.inf

    for name, model in candidates.items():
        y_pred = model.predict(X_test)
        y_proba = model.predict_proba(X_test) if hasattr(model, "predict_proba") else None
        metrics = compute_classification_metrics(np.asarray(y_test), np.asarray(y_pred), y_proba)
        all_metrics[name] = metrics

        logger.info("[%s] accuracy=%.4f | f1=%.4f", name, metrics["accuracy"], metrics["f1_score"])

        if metrics["f1_score"] > best_score:
            best_score = metrics["f1_score"]
            best_name, best_model = name, model

    logger.info("Meilleur modèle sélectionné : %s (f1=%.4f)", best_name, best_score)
    return best_name, best_model, all_metrics


def evaluate_regressors(
    candidates: Dict[str, Any], X_test, y_test
) -> Tuple[str, Any, Dict[str, Dict]]:
    """
    Évalue plusieurs régresseurs entraînés et sélectionne le meilleur
    selon le RMSE (le plus faible).

    Args:
        candidates: Dictionnaire {nom_modele: modele_entraine}.
        X_test: Features de test.
        y_test: Valeurs cibles de test.

    Returns:
        Tuple (nom_du_meilleur_modele, modele, dict_de_toutes_les_metriques).
    """
    all_metrics = {}
    best_name, best_model, best_rmse = None, None, np.inf

    for name, model in candidates.items():
        y_pred = model.predict(X_test)
        metrics = compute_regression_metrics(np.asarray(y_test), np.asarray(y_pred))
        all_metrics[name] = metrics

        logger.info("[%s] MAE=%.4f | RMSE=%.4f | R2=%.4f", name, metrics["mae"], metrics["rmse"], metrics["r2_score"])

        if metrics["rmse"] < best_rmse:
            best_rmse = metrics["rmse"]
            best_name, best_model = name, model

    logger.info("Meilleur régresseur sélectionné : %s (rmse=%.4f)", best_name, best_rmse)
    return best_name, best_model, all_metrics
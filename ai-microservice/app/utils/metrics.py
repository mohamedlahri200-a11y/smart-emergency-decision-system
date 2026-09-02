"""
metrics.py (utils)
===================
Fonctions utilitaires de calcul et de formatage des métriques de
performance pour les modèles de classification et de régression.
"""

from typing import Any, Dict

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)


def compute_classification_metrics(
    y_true: np.ndarray, y_pred: np.ndarray, y_proba: np.ndarray | None = None
) -> Dict[str, Any]:
    """
    Calcule un ensemble complet de métriques pour un modèle de
    classification (binaire ou multi-classe).

    Args:
        y_true: Labels réels.
        y_pred: Labels prédits.
        y_proba: Probabilités prédites (optionnel, requis pour ROC AUC).

    Returns:
        Dictionnaire contenant accuracy, precision, recall, f1, roc_auc,
        la matrice de confusion et le rapport de classification.
    """
    metrics: Dict[str, Any] = {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, average="weighted", zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, y_pred, average="weighted", zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_true, y_pred, average="weighted", zero_division=0)), 4),
        "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
        "classification_report": classification_report(y_true, y_pred, zero_division=0, output_dict=True),
    }

    if y_proba is not None:
        try:
            if y_proba.ndim == 2 and y_proba.shape[1] > 2:
                metrics["roc_auc"] = round(
                    float(roc_auc_score(y_true, y_proba, multi_class="ovr", average="weighted")), 4
                )
            else:
                proba_col = y_proba[:, 1] if y_proba.ndim == 2 else y_proba
                metrics["roc_auc"] = round(float(roc_auc_score(y_true, proba_col)), 4)
        except ValueError:
            metrics["roc_auc"] = None

    return metrics


def compute_regression_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Calcule les métriques standards pour un modèle de régression.

    Args:
        y_true: Valeurs réelles.
        y_pred: Valeurs prédites.

    Returns:
        Dictionnaire contenant MAE, RMSE et R².
    """
    mae = mean_absolute_error(y_true, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    r2 = r2_score(y_true, y_pred)

    return {
        "mae": round(float(mae), 4),
        "rmse": round(rmse, 4),
        "r2_score": round(float(r2), 4),
    }
"""
cross_validation.py
====================
Utilitaires de validation croisée (K-Fold stratifié) utilisés lors
de l'entraînement des modèles de classification et de régression.
"""

from typing import Any, Dict

import numpy as np
from sklearn.model_selection import cross_val_score, StratifiedKFold, KFold

from app.core.config import get_settings
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)
settings = get_settings()


def run_stratified_cv(model: Any, X, y, scoring: str = "f1_weighted") -> Dict[str, float]:
    """
    Exécute une validation croisée stratifiée K-Fold pour un modèle
    de classification.

    Args:
        model: Estimateur scikit-learn compatible (non entraîné).
        X: Matrice de features.
        y: Vecteur cible.
        scoring: Métrique scikit-learn utilisée pour l'évaluation.

    Returns:
        Dictionnaire avec la moyenne et l'écart-type des scores obtenus.
    """
    cv = StratifiedKFold(n_splits=settings.CV_FOLDS, shuffle=True, random_state=settings.RANDOM_STATE)
    scores = cross_val_score(model, X, y, cv=cv, scoring=scoring, n_jobs=-1)
    result = {"mean_score": round(float(np.mean(scores)), 4), "std_score": round(float(np.std(scores)), 4)}
    logger.info("Validation croisée (%s) : %.4f ± %.4f", scoring, result["mean_score"], result["std_score"])
    return result


def run_kfold_cv_regression(model: Any, X, y, scoring: str = "neg_root_mean_squared_error") -> Dict[str, float]:
    """
    Exécute une validation croisée K-Fold pour un modèle de régression.

    Args:
        model: Estimateur scikit-learn compatible (non entraîné).
        X: Matrice de features.
        y: Vecteur cible continu.
        scoring: Métrique scikit-learn utilisée pour l'évaluation.

    Returns:
        Dictionnaire avec la moyenne et l'écart-type des scores obtenus.
    """
    cv = KFold(n_splits=settings.CV_FOLDS, shuffle=True, random_state=settings.RANDOM_STATE)
    scores = cross_val_score(model, X, y, cv=cv, scoring=scoring, n_jobs=-1)
    result = {"mean_score": round(float(np.mean(scores)), 4), "std_score": round(float(np.std(scores)), 4)}
    logger.info("Validation croisée régression (%s) : %.4f ± %.4f", scoring, result["mean_score"], result["std_score"])
    return result
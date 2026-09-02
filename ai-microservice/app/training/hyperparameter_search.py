"""
hyperparameter_search.py
=========================
Recherche automatique d'hyperparamètres via RandomizedSearchCV,
utilisée pour affiner le meilleur modèle sélectionné avant sa
sauvegarde finale.
"""

from typing import Any, Dict

from sklearn.model_selection import RandomizedSearchCV

from app.core.config import get_settings
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)
settings = get_settings()


PARAM_GRIDS = {
    "RandomForestClassifier": {
        "n_estimators": [100, 200, 300],
        "max_depth": [None, 10, 20, 30],
        "min_samples_split": [2, 5, 10],
        "min_samples_leaf": [1, 2, 4],
    },
    "RandomForestRegressor": {
        "n_estimators": [100, 200, 300],
        "max_depth": [None, 10, 20, 30],
        "min_samples_split": [2, 5, 10],
    },
    "GradientBoostingClassifier": {
        "n_estimators": [100, 200],
        "learning_rate": [0.01, 0.05, 0.1],
        "max_depth": [3, 5, 7],
    },
    "GradientBoostingRegressor": {
        "n_estimators": [100, 200],
        "learning_rate": [0.01, 0.05, 0.1],
        "max_depth": [3, 5, 7],
    },
    "ExtraTreesClassifier": {
        "n_estimators": [100, 200, 300],
        "max_depth": [None, 10, 20],
    },
    "ExtraTreesRegressor": {
        "n_estimators": [100, 200, 300],
        "max_depth": [None, 10, 20],
    },
    "XGBClassifier": {
        "n_estimators": [100, 200],
        "max_depth": [3, 5, 7],
        "learning_rate": [0.01, 0.05, 0.1],
        "subsample": [0.7, 0.85, 1.0],
    },
    "XGBRegressor": {
        "n_estimators": [100, 200],
        "max_depth": [3, 5, 7],
        "learning_rate": [0.01, 0.05, 0.1],
        "subsample": [0.7, 0.85, 1.0],
    },
}


def search_best_hyperparameters(
    model: Any, X, y, scoring: str = "f1_weighted", n_iter: int = 15
) -> Dict[str, Any]:
    """
    Effectue une recherche aléatoire d'hyperparamètres pour un modèle donné.

    Args:
        model: Estimateur scikit-learn non entraîné.
        X: Matrice de features d'entraînement.
        y: Vecteur cible d'entraînement.
        scoring: Métrique d'optimisation.
        n_iter: Nombre de combinaisons testées.

    Returns:
        Dictionnaire contenant le meilleur estimateur et les meilleurs paramètres.
    """
    model_class_name = type(model).__name__
    param_grid = PARAM_GRIDS.get(model_class_name)

    if not param_grid:
        logger.warning("Aucune grille d'hyperparamètres définie pour %s, entraînement standard utilisé.", model_class_name)
        model.fit(X, y)
        return {"best_estimator": model, "best_params": {}}

    search = RandomizedSearchCV(
        estimator=model,
        param_distributions=param_grid,
        n_iter=n_iter,
        scoring=scoring,
        cv=3,
        random_state=settings.RANDOM_STATE,
        n_jobs=-1,
        verbose=0,
    )
    search.fit(X, y)

    logger.info("Meilleurs hyperparamètres pour %s : %s", model_class_name, search.best_params_)
    return {"best_estimator": search.best_estimator_, "best_params": search.best_params_}
"""
model_loader.py
================
Chargement, mise en cache et sauvegarde des modèles ML entraînés
(scikit-learn / XGBoost) au format joblib, ainsi que des objets de
prétraitement associés (PreprocessingService, listes de features).

Utilise le pattern Singleton pour éviter de recharger les modèles à
chaque requête HTTP (coût I/O et désérialisation élevé).
"""

from pathlib import Path
from typing import Any, Dict, Optional

import joblib

from app.core.config import get_settings
from app.core.exceptions import ModelNotLoadedException
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)
settings = get_settings()


class ModelRegistry:
    """
    Registre centralisé (singleton) de tous les modèles ML chargés en
    mémoire, ainsi que des métadonnées associées (métriques,
    date d'entraînement, feature_names).
    """

    _instance: Optional["ModelRegistry"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._models: Dict[str, Any] = {}
            cls._instance._metadata: Dict[str, Dict] = {}
        return cls._instance

    def save_model(self, name: str, model: Any, metadata: Optional[Dict] = None) -> str:
        """
        Sauvegarde un modèle entraîné sur disque et le place en cache mémoire.

        Args:
            name: Nom unique du modèle (ex : 'triage_model').
            model: Objet modèle entraîné (estimator scikit-learn compatible).
            metadata: Métadonnées associées (métriques, feature_names, etc.).

        Returns:
            Chemin du fichier sauvegardé.
        """
        path = settings.SAVED_MODELS_DIR / f"{name}.joblib"
        joblib.dump(model, path)

        self._models[name] = model
        if metadata:
            self._metadata[name] = metadata
            meta_path = settings.SAVED_MODELS_DIR / f"{name}_metadata.joblib"
            joblib.dump(metadata, meta_path)

        logger.info("Modèle '%s' sauvegardé : %s", name, path)
        return str(path)

    def load_model(self, name: str, force_reload: bool = False) -> Any:
        """
        Charge un modèle depuis le cache mémoire, ou depuis le disque
        s'il n'est pas encore en cache.

        Args:
            name: Nom du modèle à charger.
            force_reload: Force le rechargement depuis le disque.

        Returns:
            L'objet modèle chargé.

        Raises:
            ModelNotLoadedException: Si le modèle n'existe ni en cache ni sur disque.
        """
        if not force_reload and name in self._models:
            return self._models[name]

        path = settings.SAVED_MODELS_DIR / f"{name}.joblib"
        if not path.exists():
            raise ModelNotLoadedException(name)

        model = joblib.load(path)
        self._models[name] = model

        meta_path = settings.SAVED_MODELS_DIR / f"{name}_metadata.joblib"
        if meta_path.exists():
            self._metadata[name] = joblib.load(meta_path)

        logger.info("Modèle '%s' chargé depuis le disque : %s", name, path)
        return model

    def get_metadata(self, name: str) -> Dict:
        """Retourne les métadonnées associées à un modèle (métriques, etc.)."""
        if name not in self._metadata:
            meta_path = settings.SAVED_MODELS_DIR / f"{name}_metadata.joblib"
            if meta_path.exists():
                self._metadata[name] = joblib.load(meta_path)
            else:
                return {}
        return self._metadata[name]

    def is_loaded(self, name: str) -> bool:
        """Vérifie si un modèle est disponible (cache mémoire ou disque)."""
        if name in self._models:
            return True
        path = settings.SAVED_MODELS_DIR / f"{name}.joblib"
        return path.exists()

    def list_available_models(self) -> Dict[str, bool]:
        """Retourne le statut de chargement de tous les modèles connus."""
        known_models = [
            "triage_model", "orientation_model", "deterioration_model",
            "exams_model", "lab_tests_model", "los_regressor",
        ]
        return {name: self.is_loaded(name) for name in known_models}


# Instance globale unique
model_registry = ModelRegistry()
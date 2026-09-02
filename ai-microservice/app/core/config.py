"""
config.py
=========
Configuration centrale de l'application, basée sur Pydantic Settings.

Toutes les valeurs sont surchargeables via variables d'environnement
ou un fichier `.env`, ce qui permet un déploiement Docker/Kubernetes
sans modification du code.
"""

from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Paramètres globaux de configuration du microservice IA."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Application
    APP_NAME: str = "CHU Oujda - AI Emergency Decision Support Microservice"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"

    # Serveur
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Chemins
    BASE_DIR: Path = BASE_DIR
    SAVED_MODELS_DIR: Path = BASE_DIR / "saved_models"
    DATASETS_DIR: Path = BASE_DIR / "datasets"
    LOGS_DIR: Path = BASE_DIR / "logs"
    HISTORY_DB_PATH: Path = BASE_DIR / "datasets" / "prediction_history.db"

    # Dataset synthétique
    DEFAULT_DATASET_SIZE: int = 20000
    RANDOM_STATE: int = 42

    # Machine Learning
    TEST_SIZE: float = 0.2
    CV_FOLDS: int = 5

    # CORS (Spring Boot backend + React frontend)
    ALLOWED_ORIGINS: list[str] = ["http://localhost:8080", "http://localhost:3000", "*"]

    # Logging
    LOG_LEVEL: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    """
    Retourne une instance mise en cache des paramètres de configuration.

    L'usage de `lru_cache` garantit qu'un seul objet Settings est
    instancié pour toute la durée de vie du processus (pattern singleton).
    """
    settings = Settings()
    settings.SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    settings.DATASETS_DIR.mkdir(parents=True, exist_ok=True)
    settings.LOGS_DIR.mkdir(parents=True, exist_ok=True)
    return settings
"""
logging.py
==========
Configuration centralisée du système de logs.

Fournit des logs structurés (console + fichier rotatif) utilisés dans
tout le microservice, avec un format compatible ELK/Grafana Loki pour
une future intégration en environnement hospitalier de production.
"""

import logging
import sys
from logging.handlers import RotatingFileHandler

from app.core.config import get_settings

settings = get_settings()

LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging() -> None:
    """
    Configure le logging global de l'application.

    Ajoute un handler console (stdout) et un handler fichier rotatif
    (10 Mo max, 5 fichiers de sauvegarde) afin de conserver un
    historique exploitable sans saturer le disque.
    """
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    if root_logger.handlers:
        return

    formatter = logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT)

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    log_file = settings.LOGS_DIR / "ai_microservice.log"
    file_handler = RotatingFileHandler(
        log_file, maxBytes=10 * 1024 * 1024, backupCount=5, encoding="utf-8"
    )
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)


def get_logger(name: str) -> logging.Logger:
    """
    Retourne un logger nommé, prêt à l'emploi.

    Args:
        name: Nom du module appelant (généralement __name__).

    Returns:
        Instance de logging.Logger configurée.
    """
    return logging.getLogger(name)
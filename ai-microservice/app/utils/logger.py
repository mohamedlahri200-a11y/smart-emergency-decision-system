"""
logger.py (utils)
==================
Point d'accès simplifié au système de logging pour les modules qui ne
souhaitent pas dépendre directement de app.core.logging.
"""

from app.core.logging import get_logger, setup_logging

setup_logging()


def get_module_logger(name: str):
    """Retourne un logger configuré pour le module appelant."""
    return get_logger(name)
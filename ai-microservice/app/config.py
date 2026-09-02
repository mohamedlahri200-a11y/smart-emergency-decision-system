

"""
config.py (racine app/)
========================
Alias de compatibilité avec l'architecture du cahier des charges.
La configuration réelle est implémentée dans app.core.config afin de
respecter le principe de Clean Architecture (le "core" ne dépend de
rien d'autre). Ce fichier réexporte simplement Settings et
get_settings pour les imports qui referaient app.config directement.
"""

from app.core.config import Settings, get_settings  # noqa: F401
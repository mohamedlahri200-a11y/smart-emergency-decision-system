"""
imaging_predict.py (api)
==========================
Endpoint POST /predict-imaging : reçoit une image de radiologie
(upload multipart) et retourne la prédiction du CNN de démonstration.
"""

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.imaging_analysis_service import imaging_analysis_service
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)
router = APIRouter(tags=["Imaging (démonstration CNN)"])


@router.post(
    "/predict-imaging",
    summary="Analyse une image de radiologie avec le CNN de démonstration (données synthétiques)",
)
async def predict_imaging(fichier: UploadFile = File(...)) -> dict:
    """
    Reçoit une image (radio/scanner) et retourne la classe prédite par
    le CNN de démonstration, avec les probabilités par classe et un
    avertissement rappelant que le modèle est entraîné sur des données
    synthétiques (aucune valeur diagnostique réelle).
    """
    if not fichier.content_type or not fichier.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Le fichier envoyé doit être une image.")

    try:
        contenu = await fichier.read()
        resultat = imaging_analysis_service.analyser(contenu)

        logger.info(
            "Analyse imagerie CNN : classe=%s confiance=%s",
            resultat.get("classe_predite"), resultat.get("confiance"),
        )
        return resultat

    except Exception as exc:  # noqa: BLE001
        logger.exception("Erreur lors de l'analyse d'image")
        raise HTTPException(status_code=500, detail="Erreur interne lors de l'analyse de l'image.") from exc
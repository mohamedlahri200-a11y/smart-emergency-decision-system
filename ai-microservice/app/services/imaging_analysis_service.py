"""
imaging_analysis_service.py
=============================
Service d'inférence du CNN de démonstration (cf. app/models/xray_cnn.py)
pour l'analyse d'une image de radiologie envoyée par le médecin
urgentiste.

⚠️ Le modèle chargé ici a été entraîné sur des données SYNTHÉTIQUES
(cf. app/training/generate_synthetic_xray_dataset.py). Toute prédiction
renvoyée par ce service DOIT être présentée comme une démonstration
technique, jamais comme un résultat diagnostique fiable, tant qu'un
réentraînement sur un vrai jeu de données médicales annoté n'a pas été
réalisé.
"""

from __future__ import annotations

import io
from pathlib import Path
from typing import Optional

import numpy as np
from PIL import Image

from app.models.xray_cnn import XRayCNN
from app.training.generate_synthetic_xray_dataset import CLASSES, IMAGE_SIZE

WEIGHTS_PATH = Path(__file__).resolve().parent.parent.parent / "saved_models" / "xray_cnn_weights.npz"

DISCLAIMER = (
    "Modèle de démonstration entraîné sur des données synthétiques générées par le code. "
    "Aucune valeur diagnostique réelle — ne doit jamais remplacer l'interprétation du radiologue."
)


class ImagingAnalysisService:
    def __init__(self):
        self._model: Optional[XRayCNN] = None

    def _get_model(self) -> Optional[XRayCNN]:
        if self._model is not None:
            return self._model
        if WEIGHTS_PATH.exists():
            self._model = XRayCNN.load(str(WEIGHTS_PATH))
        return self._model

    @property
    def modele_charge(self) -> bool:
        return self._get_model() is not None

    def _pretraiter(self, image_bytes: bytes) -> np.ndarray:
        """Redimensionne en 32x32, convertit en niveaux de gris, normalise [0,1]."""
        img = Image.open(io.BytesIO(image_bytes)).convert("L")
        img = img.resize((IMAGE_SIZE, IMAGE_SIZE))
        arr = np.asarray(img, dtype=np.float32) / 255.0
        return arr[None, ..., None]  # (1, 32, 32, 1)

    def analyser(self, image_bytes: bytes) -> dict:
        model = self._get_model()

        if model is None:
            return {
                "modele_disponible": False,
                "classe_predite": None,
                "confiance": None,
                "probabilites": {},
                "disclaimer": (
                    "Aucun modèle entraîné trouvé. Lancez d'abord : "
                    "python -m app.training.train_xray_cnn"
                ),
            }

        x = self._pretraiter(image_bytes)
        probs = model.forward(x)[0]  # (n_classes,)

        classe_idx = int(np.argmax(probs))
        probabilites = {CLASSES[i]: round(float(probs[i]), 4) for i in range(len(CLASSES))}

        return {
            "modele_disponible": True,
            "classe_predite": CLASSES[classe_idx],
            "confiance": round(float(probs[classe_idx]), 4),
            "probabilites": probabilites,
            "disclaimer": DISCLAIMER,
        }


imaging_analysis_service = ImagingAnalysisService()
"""
generate_synthetic_xray_dataset.py
====================================
Génère un jeu de données SYNTHÉTIQUE (formes/textures procédurales, pas
de vraies images médicales) pour permettre l'entraînement de bout en
bout du CNN de démonstration (cf. app/models/xray_cnn.py).

⚠️ AVERTISSEMENT IMPORTANT ⚠️
--------------------------------
Ces images ne sont PAS des radiographies réelles. Elles simulent
grossièrement trois situations par du bruit texturé et des formes
géométriques :
  - "Normal"              : texture lisse, sans anomalie
  - "Opacite_Pulmonaire"   : tache floue claire (simule une opacité)
  - "Fracture_Suspectee"   : ligne fine nette (simule un trait de fracture)

Le modèle entraîné sur ce jeu de données N'A AUCUNE VALEUR DIAGNOSTIQUE
RÉELLE. Il démontre uniquement que le pipeline (génération -> entraînement
-> sauvegarde -> inférence -> intégration API) fonctionne correctement
de bout en bout. Pour un usage clinique, ce script doit être remplacé
par un chargeur d'un vrai jeu de données annoté (ex : NIH ChestX-ray14,
CheXpert, ou les images réellement collectées par la plateforme au fil
du temps), et le modèle NumPy ci-contre par une architecture plus
robuste entraînée sur GPU avec un framework dédié (PyTorch/TensorFlow).
"""

from __future__ import annotations

import numpy as np

CLASSES = ["Normal", "Opacite_Pulmonaire", "Fracture_Suspectee"]
IMAGE_SIZE = 32


def _image_normale(rng: np.random.Generator) -> np.ndarray:
    """Texture lisse et homogène, sans motif marqué."""
    base = rng.normal(loc=0.5, scale=0.05, size=(IMAGE_SIZE, IMAGE_SIZE))
    return np.clip(base, 0, 1)


def _image_opacite(rng: np.random.Generator) -> np.ndarray:
    """Fond homogène + tache floue claire (simule une opacité pulmonaire)."""
    img = _image_normale(rng)
    cx, cy = rng.integers(8, IMAGE_SIZE - 8, size=2)
    rayon = rng.integers(4, 8)
    yy, xx = np.mgrid[0:IMAGE_SIZE, 0:IMAGE_SIZE]
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    tache = np.clip(1 - dist / rayon, 0, 1) * rng.uniform(0.3, 0.5)
    return np.clip(img + tache, 0, 1)


def _image_fracture(rng: np.random.Generator) -> np.ndarray:
    """Fond homogène + ligne fine nette (simule un trait de fracture)."""
    img = _image_normale(rng)
    angle = rng.uniform(0, np.pi)
    x0, y0 = rng.integers(6, IMAGE_SIZE - 6, size=2)
    longueur = rng.integers(10, 18)
    for t in np.linspace(-longueur / 2, longueur / 2, 40):
        x = int(x0 + t * np.cos(angle))
        y = int(y0 + t * np.sin(angle))
        if 0 <= x < IMAGE_SIZE and 0 <= y < IMAGE_SIZE:
            img[y, x] = 0.95
            if x + 1 < IMAGE_SIZE:
                img[y, x + 1] = 0.85
    return np.clip(img, 0, 1)


_GENERATEURS = {
    "Normal": _image_normale,
    "Opacite_Pulmonaire": _image_opacite,
    "Fracture_Suspectee": _image_fracture,
}


def generer_dataset(n_par_classe: int = 200, seed: int = 42):
    """
    Génère un jeu de données équilibré. Retourne (X, y) avec :
        X: (N, 32, 32, 1) valeurs [0, 1]
        y: (N,) indices de classe (0=Normal, 1=Opacite, 2=Fracture)
    """
    rng = np.random.default_rng(seed)
    images, labels = [], []

    for idx, classe in enumerate(CLASSES):
        generateur = _GENERATEURS[classe]
        for _ in range(n_par_classe):
            images.append(generateur(rng))
            labels.append(idx)

    X = np.array(images, dtype=np.float32)[..., None]  # (N, 32, 32, 1)
    y = np.array(labels, dtype=np.int64)

    perm = rng.permutation(len(y))
    return X[perm], y[perm]


if __name__ == "__main__":
    X, y = generer_dataset(n_par_classe=200)
    print(f"Dataset synthétique généré : {X.shape[0]} images, classes = {CLASSES}")
    print("⚠️ Rappel : données synthétiques, aucune valeur diagnostique réelle.")
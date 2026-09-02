"""
train_xray_cnn.py
===================
Script d'entraînement RÉEL (rétropropagation + descente de gradient
effectives) du CNN de démonstration sur le jeu de données synthétique.

Usage :
    python -m app.training.train_xray_cnn

⚠️ Rappel : ce script entraîne le modèle sur des images SYNTHÉTIQUES
générées procéduralement (cf. generate_synthetic_xray_dataset.py), pas
sur de vraies radiographies. Le modèle produit sert de démonstration
technique du pipeline complet, pas d'outil de diagnostic.

Pour un usage réel, remplacer `generer_dataset()` par un chargeur de
vraies images annotées (ex: NIH ChestX-ray14, CheXpert, ou les images
collectées par la plateforme), idéalement avec une architecture plus
robuste entraînée via PyTorch/TensorFlow sur GPU.
"""

from __future__ import annotations

import time
from pathlib import Path

import numpy as np

from app.models.xray_cnn import XRayCNN
from app.training.generate_synthetic_xray_dataset import CLASSES, generer_dataset

SAVED_MODELS_DIR = Path(__file__).resolve().parent.parent.parent / "saved_models"
WEIGHTS_PATH = SAVED_MODELS_DIR / "xray_cnn_weights.npz"


def one_hot(y: np.ndarray, n_classes: int) -> np.ndarray:
    return np.eye(n_classes, dtype=np.float32)[y]


def entrainer(
    n_par_classe: int = 200,
    epochs: int = 12,
    batch_size: int = 16,
    lr: float = 0.05,
    test_ratio: float = 0.2,
) -> dict:
    print("=" * 60)
    print("Entraînement du CNN de démonstration (données SYNTHÉTIQUES)")
    print("=" * 60)

    X, y = generer_dataset(n_par_classe=n_par_classe)
    n_classes = len(CLASSES)
    n_test = int(len(X) * test_ratio)

    X_train, y_train = X[n_test:], y[n_test:]
    X_test, y_test = X[:n_test], y[:n_test]

    print(f"Jeu d'entraînement : {len(X_train)} images | Jeu de test : {len(X_test)} images")
    print(f"Classes : {CLASSES}")

    model = XRayCNN(n_classes=n_classes)
    y_train_oh = one_hot(y_train, n_classes)

    t0 = time.time()
    for epoch in range(1, epochs + 1):
        perm = np.random.permutation(len(X_train))
        X_train, y_train_oh, y_train = X_train[perm], y_train_oh[perm], y_train[perm]

        pertes = []
        for start in range(0, len(X_train), batch_size):
            xb = X_train[start:start + batch_size]
            yb = y_train_oh[start:start + batch_size]

            probs = model.forward(xb)
            perte = -np.mean(np.sum(yb * np.log(np.clip(probs, 1e-9, 1.0)), axis=1))
            pertes.append(perte)

            model.backward(probs, yb, lr=lr)

        # Évaluation sur le jeu de test à chaque époque
        probs_test = model.forward(X_test)
        pred_test = np.argmax(probs_test, axis=1)
        accuracy = float(np.mean(pred_test == y_test))

        print(f"Époque {epoch:2d}/{epochs} | perte moyenne = {np.mean(pertes):.4f} | accuracy test = {accuracy:.2%}")

    duree = time.time() - t0
    print(f"\nEntraînement terminé en {duree:.1f}s.")

    SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model.save(str(WEIGHTS_PATH))
    print(f"Poids sauvegardés : {WEIGHTS_PATH}")
    print("\n⚠️ RAPPEL : modèle entraîné sur données SYNTHÉTIQUES — aucune valeur diagnostique réelle.")

    return {"accuracy_test": accuracy, "duree_secondes": duree, "n_images": len(X)}


if __name__ == "__main__":
    entrainer()
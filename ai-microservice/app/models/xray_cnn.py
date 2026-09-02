"""
xray_cnn.py
===========
Architecture d'un réseau de neurones CONVOLUTIF (CNN — Convolutional
Neural Network) pour la classification d'images de radiologie,
implémentée directement en NumPy (forward ET rétropropagation manuels).

Pourquoi un CNN et pas un RNN ?
--------------------------------
Un CNN est l'architecture adaptée à l'analyse d'IMAGES : ses filtres de
convolution apprennent à détecter des motifs spatiaux locaux (contours,
textures, opacités) puis les combinent en motifs de plus haut niveau.
Un RNN (réseau récurrent) est conçu pour des données SÉQUENTIELLES
(texte, séries temporelles) et n'est pas adapté à ce cas d'usage.

Pourquoi une implémentation NumPy plutôt que PyTorch/TensorFlow ?
-------------------------------------------------------------------
Contrainte d'environnement (espace disque insuffisant pour installer
un framework de deep learning complet). Cette implémentation reste un
VRAI réseau de neurones convolutif entraîné par descente de gradient
(rétropropagation complète), simplement écrit "à la main" plutôt que
via un framework — une approche pédagogique courante pour bien
comprendre le fonctionnement interne d'un CNN.

Architecture :
    Entrée (32x32x1, niveaux de gris)
    -> Conv2D (8 filtres 3x3) -> ReLU -> MaxPool 2x2   -> 16x16x8
    -> Conv2D (16 filtres 3x3) -> ReLU -> MaxPool 2x2  -> 8x8x16
    -> Flatten -> Dense(128) -> ReLU -> Dense(n_classes) -> Softmax
"""

from __future__ import annotations

import numpy as np


def _conv2d_forward(x: np.ndarray, w: np.ndarray, b: np.ndarray) -> np.ndarray:
    """
    Convolution 2D "valide" (sans padding), implémentée via des vues
    glissantes (im2col simplifié) pour rester vectorisée en NumPy.

    x: (N, H, W, C_in)
    w: (kH, kW, C_in, C_out)
    b: (C_out,)
    retourne: (N, H-kH+1, W-kW+1, C_out)
    """
    N, H, W, C_in = x.shape
    kH, kW, _, C_out = w.shape
    out_h, out_w = H - kH + 1, W - kW + 1

    out = np.zeros((N, out_h, out_w, C_out), dtype=np.float32)
    w_flat = w.reshape(-1, C_out)  # (kH*kW*C_in, C_out)

    for i in range(out_h):
        for j in range(out_w):
            patch = x[:, i:i + kH, j:j + kW, :].reshape(N, -1)  # (N, kH*kW*C_in)
            out[:, i, j, :] = patch @ w_flat + b

    return out


def _conv2d_backward(x, w, dout):
    """Gradients de la convolution par rapport à l'entrée, aux poids et au biais."""
    N, H, W, C_in = x.shape
    kH, kW, _, C_out = w.shape
    out_h, out_w = dout.shape[1], dout.shape[2]

    dx = np.zeros_like(x)
    dw = np.zeros_like(w)
    db = dout.sum(axis=(0, 1, 2))

    for i in range(out_h):
        for j in range(out_w):
            patch = x[:, i:i + kH, j:j + kW, :]                     # (N, kH, kW, C_in)
            grad = dout[:, i, j, :]                                  # (N, C_out)
            dw += np.tensordot(patch, grad, axes=([0], [0]))         # (kH, kW, C_in, C_out)
            dx[:, i:i + kH, j:j + kW, :] += np.tensordot(grad, w, axes=([1], [3])).transpose(0, 1, 2, 3)

    return dx, dw, db


def _maxpool_forward(x: np.ndarray, size: int = 2):
    N, H, W, C = x.shape
    out_h, out_w = H // size, W // size
    out = np.zeros((N, out_h, out_w, C), dtype=np.float32)
    argmax = np.zeros((N, out_h, out_w, C, 2), dtype=np.int32)

    for i in range(out_h):
        for j in range(out_w):
            window = x[:, i * size:(i + 1) * size, j * size:(j + 1) * size, :]
            flat = window.reshape(N, size * size, C)
            idx = np.argmax(flat, axis=1)
            out[:, i, j, :] = np.take_along_axis(flat, idx[:, None, :], axis=1).squeeze(1)
            argmax[:, i, j, :, 0] = idx // size
            argmax[:, i, j, :, 1] = idx % size

    return out, argmax


def _maxpool_backward(dout, x_shape, argmax, size: int = 2):
    N, H, W, C = x_shape
    dx = np.zeros(x_shape, dtype=np.float32)
    out_h, out_w = dout.shape[1], dout.shape[2]

    for i in range(out_h):
        for j in range(out_w):
            for c in range(C):
                di = argmax[:, i, j, c, 0]
                dj = argmax[:, i, j, c, 1]
                for n in range(N):
                    dx[n, i * size + di[n], j * size + dj[n], c] += dout[n, i, j, c]
    return dx


def relu(x):
    return np.maximum(0, x)


def relu_grad(x):
    return (x > 0).astype(np.float32)


def softmax(x):
    z = x - np.max(x, axis=1, keepdims=True)
    exp = np.exp(z)
    return exp / np.sum(exp, axis=1, keepdims=True)


class XRayCNN:
    """
    Réseau de neurones convolutif pour la classification d'images de
    radiologie en un nombre fixe de classes cliniques.
    """

    def __init__(self, n_classes: int, seed: int = 42):
        rng = np.random.default_rng(seed)
        self.n_classes = n_classes

        # Initialisation "He" (adaptée à ReLU)
        self.conv1_w = (rng.standard_normal((3, 3, 1, 8)) * np.sqrt(2.0 / (3 * 3 * 1))).astype(np.float32)
        self.conv1_b = np.zeros(8, dtype=np.float32)

        self.conv2_w = (rng.standard_normal((3, 3, 8, 16)) * np.sqrt(2.0 / (3 * 3 * 8))).astype(np.float32)
        self.conv2_b = np.zeros(16, dtype=np.float32)

        # Après conv1(32->30)+pool(->15)+conv2(15->13)+pool(->6) : 6*6*16
        flat_dim = 6 * 6 * 16
        self.fc1_w = (rng.standard_normal((flat_dim, 128)) * np.sqrt(2.0 / flat_dim)).astype(np.float32)
        self.fc1_b = np.zeros(128, dtype=np.float32)

        self.fc2_w = (rng.standard_normal((128, n_classes)) * np.sqrt(2.0 / 128)).astype(np.float32)
        self.fc2_b = np.zeros(n_classes, dtype=np.float32)

        self._cache = {}

    def forward(self, x: np.ndarray) -> np.ndarray:
        """x: (N, 32, 32, 1) -> probabilités (N, n_classes)"""
        c1 = _conv2d_forward(x, self.conv1_w, self.conv1_b)
        a1 = relu(c1)
        p1, arg1 = _maxpool_forward(a1, 2)

        c2 = _conv2d_forward(p1, self.conv2_w, self.conv2_b)
        a2 = relu(c2)
        p2, arg2 = _maxpool_forward(a2, 2)

        flat = p2.reshape(p2.shape[0], -1)
        z1 = flat @ self.fc1_w + self.fc1_b
        a3 = relu(z1)
        z2 = a3 @ self.fc2_w + self.fc2_b
        probs = softmax(z2)

        self._cache = dict(x=x, c1=c1, a1=a1, p1=p1, arg1=arg1, c2=c2, a2=a2,
                            p2=p2, arg2=arg2, flat=flat, z1=z1, a3=a3, z2=z2)
        return probs

    def backward(self, probs: np.ndarray, y_true: np.ndarray, lr: float = 0.01):
        """Rétropropagation complète + mise à jour des poids (descente de gradient)."""
        c = self._cache
        N = y_true.shape[0]

        # Gradient de la cross-entropy + softmax (simplifié)
        dz2 = (probs - y_true) / N                       # (N, n_classes)
        dfc2_w = c["a3"].T @ dz2
        dfc2_b = dz2.sum(axis=0)

        da3 = dz2 @ self.fc2_w.T
        dz1 = da3 * relu_grad(c["z1"])
        dfc1_w = c["flat"].T @ dz1
        dfc1_b = dz1.sum(axis=0)

        dflat = dz1 @ self.fc1_w.T
        dp2 = dflat.reshape(c["p2"].shape)

        da2 = _maxpool_backward(dp2, c["a2"].shape, c["arg2"], 2)
        dc2 = da2 * relu_grad(c["c2"])
        dp1, dconv2_w, dconv2_b = _conv2d_backward(c["p1"], self.conv2_w, dc2)

        da1 = _maxpool_backward(dp1, c["a1"].shape, c["arg1"], 2)
        dc1 = da1 * relu_grad(c["c1"])
        _, dconv1_w, dconv1_b = _conv2d_backward(c["x"], self.conv1_w, dc1)

        # Descente de gradient (SGD)
        self.fc2_w -= lr * dfc2_w
        self.fc2_b -= lr * dfc2_b
        self.fc1_w -= lr * dfc1_w
        self.fc1_b -= lr * dfc1_b
        self.conv2_w -= lr * dconv2_w
        self.conv2_b -= lr * dconv2_b
        self.conv1_w -= lr * dconv1_w
        self.conv1_b -= lr * dconv1_b

    def save(self, path: str):
        np.savez(
            path,
            conv1_w=self.conv1_w, conv1_b=self.conv1_b,
            conv2_w=self.conv2_w, conv2_b=self.conv2_b,
            fc1_w=self.fc1_w, fc1_b=self.fc1_b,
            fc2_w=self.fc2_w, fc2_b=self.fc2_b,
            n_classes=self.n_classes,
        )

    @classmethod
    def load(cls, path: str) -> "XRayCNN":
        data = np.load(path)
        model = cls(n_classes=int(data["n_classes"]))
        model.conv1_w, model.conv1_b = data["conv1_w"], data["conv1_b"]
        model.conv2_w, model.conv2_b = data["conv2_w"], data["conv2_b"]
        model.fc1_w, model.fc1_b = data["fc1_w"], data["fc1_b"]
        model.fc2_w, model.fc2_b = data["fc2_w"], data["fc2_b"]
        return model
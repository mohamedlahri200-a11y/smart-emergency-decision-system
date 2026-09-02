"""
xgb_wrapper.py
===============
Wrapper autour de XGBClassifier permettant d'utiliser directement des
labels textuels (ex : "Rouge", "Orange"...), comme le font
nativement RandomForestClassifier, GradientBoostingClassifier et
ExtraTreesClassifier de scikit-learn.

XGBoost exige en interne des labels entiers consécutifs à partir de
0 : ce wrapper encapsule un LabelEncoder afin que l'API reste
strictement identique (fit/predict/predict_proba/classes_) à celle
des autres classifieurs, permettant leur comparaison et sélection
automatique de manière transparente dans le pipeline d'entraînement.
"""

from typing import Optional

import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier


class LabeledXGBClassifier(BaseEstimator, ClassifierMixin):
    """XGBClassifier compatible avec des labels textuels arbitraires."""

    def __init__(self, **xgb_params):
        self.xgb_params = xgb_params
        self._label_encoder: Optional[LabelEncoder] = None
        self._model: Optional[XGBClassifier] = None

    def fit(self, X, y):
        """Encode les labels textuels puis entraîne le modèle XGBoost sous-jacent."""
        self._label_encoder = LabelEncoder()
        y_encoded = self._label_encoder.fit_transform(y)
        self._model = XGBClassifier(**self.xgb_params)
        self._model.fit(X, y_encoded)
        self.classes_ = self._label_encoder.classes_
        return self

    def predict(self, X):
        """Prédit les labels et les décode vers leur forme textuelle originale."""
        y_pred_encoded = self._model.predict(X)
        return self._label_encoder.inverse_transform(y_pred_encoded)

    def predict_proba(self, X):
        """Retourne les probabilités par classe (ordre = self.classes_)."""
        return self._model.predict_proba(X)
"""
preprocessing.py
=================
Service de prétraitement des données cliniques : nettoyage,
imputation des valeurs manquantes, encodage des variables
catégorielles et multi-label.

Ce service est utilisé à la fois pour l'entraînement (sur le
dataset complet) et pour l'inférence (sur un patient unique),
garantissant que les mêmes transformations sont appliquées dans
les deux contextes (évite le "training/serving skew").
"""

from typing import Dict, List

import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer

from app.core.constants import KNOWN_SYMPTOMS, KNOWN_ANTECEDENTS, KNOWN_ALLERGIES, PHYSIOLOGICAL_BOUNDS
from app.schemas.patient import PatientData
from app.utils.helpers import multi_hot_encode
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)


NUMERIC_COLUMNS = [
    "age", "poids", "taille", "temperature", "frequence_cardiaque",
    "pression_arterielle_systolique", "pression_arterielle_diastolique",
    "frequence_respiratoire", "saturation_o2", "glycemie", "douleur_eva",
    "score_news2", "score_esi", "score_gcs",
]


class PreprocessingService:
    """Service de nettoyage et de transformation des données cliniques."""

    def __init__(self):
        self._numeric_imputer = SimpleImputer(strategy="median")
        self._fitted = False

    def fit(self, df: pd.DataFrame) -> "PreprocessingService":
        """Ajuste l'imputer sur le dataset d'entraînement."""
        self._numeric_imputer.fit(df[NUMERIC_COLUMNS])
        self._fitted = True
        return self

    def clean_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Nettoie un DataFrame brut : suppression des doublons, gestion
        des valeurs manquantes numériques, clipping physiologique de
        sécurité et normalisation des types.

        Cette méthode est volontairement défensive : elle est conçue
        pour rester valide aussi bien sur le dataset synthétique que
        sur de futures données réelles issues du système hospitalier
        du CHU, potentiellement plus bruitées.

        Args:
            df: DataFrame brut (issu du dataset ou d'une base de données).

        Returns:
            DataFrame nettoyé.
        """
        n_initial = len(df)
        df = df.drop_duplicates().copy()

        if {"pression_arterielle_systolique", "pression_arterielle_diastolique"}.issubset(df.columns):
            coherent_mask = df["pression_arterielle_systolique"] > df["pression_arterielle_diastolique"]
            n_incoherent = (~coherent_mask).sum()
            if n_incoherent:
                logger.warning("Suppression de %d lignes avec PAS <= PAD (incohérence physiologique)", n_incoherent)
                df = df[coherent_mask]

        if not self._fitted:
            self.fit(df)

        df[NUMERIC_COLUMNS] = self._numeric_imputer.transform(df[NUMERIC_COLUMNS])

        for col, (low, high) in PHYSIOLOGICAL_BOUNDS.items():
            if col in df.columns:
                df[col] = df[col].clip(lower=low, upper=high)

        for col in ["antecedents", "allergies", "symptomes"]:
            if col in df.columns:
                df[col] = df[col].fillna("Aucun")

        n_final = len(df)
        logger.info(
            "Nettoyage terminé : %d -> %d lignes (%d colonnes)", n_initial, n_final, df.shape[1]
        )
        return df

    @staticmethod
    def encode_multilabel_columns(df: pd.DataFrame) -> pd.DataFrame:
        """
        Encode les colonnes textuelles multi-valeurs (symptômes,
        antécédents, allergies), séparées par '|', en colonnes
        binaires multi-hot.

        Args:
            df: DataFrame contenant les colonnes 'symptomes',
                'antecedents', 'allergies' au format "a|b|c".

        Returns:
            DataFrame enrichi des colonnes binaires encodées.
        """
        df = df.copy()

        for col, vocab, prefix in [
            ("symptomes", KNOWN_SYMPTOMS, "sympt"),
            ("antecedents", KNOWN_ANTECEDENTS, "atcd"),
            ("allergies", KNOWN_ALLERGIES, "allerg"),
        ]:
            if col not in df.columns:
                continue
            encoded_rows = df[col].fillna("").apply(
                lambda x: multi_hot_encode(x.split("|") if x else [], vocab)
            )
            encoded_df = pd.DataFrame(list(encoded_rows), index=df.index)
            encoded_df.columns = [f"{prefix}_{c}" for c in encoded_df.columns]
            df = pd.concat([df, encoded_df], axis=1)

        return df

    @staticmethod
    def encode_categorical(df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
        """Encode des colonnes catégorielles en one-hot encoding."""
        return pd.get_dummies(df, columns=[c for c in columns if c in df.columns], dummy_na=False)

    def transform_single_patient(self, patient: PatientData) -> pd.DataFrame:
        """
        Transforme un objet PatientData unique en DataFrame prêt pour
        l'inférence, en appliquant les mêmes règles d'encodage que
        pour l'entraînement.

        Args:
            patient: Données cliniques d'un patient.

        Returns:
            DataFrame à une ligne, prêt pour la feature engineering.
        """
        consciousness_altered = patient.score_gcs < 15
        news2 = patient.score_news2
        if news2 is None:
            from app.utils.helpers import calculate_news2_score
            news2 = calculate_news2_score(
                patient.frequence_respiratoire, patient.saturation_o2,
                patient.temperature, patient.pression_arterielle_systolique,
                patient.frequence_cardiaque, consciousness_altered,
            )

        esi = patient.score_esi
        if esi is None:
            from app.utils.helpers import estimate_esi_level
            esi = estimate_esi_level(news2, False)

        row = {
            "age": patient.age,
            "sexe": patient.sexe,
            "poids": patient.poids,
            "taille": patient.taille,
            "temperature": patient.temperature,
            "frequence_cardiaque": patient.frequence_cardiaque,
            "pression_arterielle_systolique": patient.pression_arterielle_systolique,
            "pression_arterielle_diastolique": patient.pression_arterielle_diastolique,
            "frequence_respiratoire": patient.frequence_respiratoire,
            "saturation_o2": patient.saturation_o2,
            "glycemie": patient.glycemie,
            "douleur_eva": patient.douleur_eva,
            "score_news2": news2,
            "score_esi": esi,
            "score_gcs": patient.score_gcs,
            "antecedents": "|".join(patient.antecedents) if patient.antecedents else "Aucun",
            "allergies": "|".join(patient.allergies) if patient.allergies else "Aucune",
            "symptomes": "|".join(patient.symptomes),
            "mode_arrivee": patient.mode_arrivee,
        }
        return pd.DataFrame([row])
    
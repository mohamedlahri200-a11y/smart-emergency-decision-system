"""
feature_engineering.py
=======================
Service de génération de variables dérivées (feature engineering) à
partir des données cliniques brutes, afin d'améliorer le pouvoir
prédictif des modèles ML (ex : pression artérielle moyenne, IMC,
indicateur de choc, score composite de gravité).
"""

import pandas as pd

from app.services.preprocessing import PreprocessingService
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)

# Colonnes finales utilisées par les modèles (features numériques + binaires)
FINAL_NUMERIC_FEATURES = [
    "age", "poids", "taille", "imc", "temperature", "frequence_cardiaque",
    "pression_arterielle_systolique", "pression_arterielle_diastolique",
    "pression_arterielle_moyenne", "pression_pouls", "frequence_respiratoire",
    "saturation_o2", "glycemie", "douleur_eva", "score_news2", "score_esi",
    "score_gcs", "choc_index", "sexe_encoded",
]


class FeatureEngineeringService:
    """Service de création de variables dérivées médicalement pertinentes."""

    @staticmethod
    def add_derived_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Ajoute des variables cliniques dérivées à un DataFrame déjà
        nettoyé.

        Variables créées :
            - imc : indice de masse corporelle
            - pression_arterielle_moyenne (PAM)
            - pression_pouls (différentielle systolo-diastolique)
            - choc_index : FC / PAS, indicateur précoce de choc hémodynamique
            - sexe_encoded : encodage binaire du sexe

        Args:
            df: DataFrame nettoyé contenant les colonnes vitales brutes.

        Returns:
            DataFrame enrichi des variables dérivées.
        """
        df = df.copy()

        taille_m = df["taille"] / 100
        df["imc"] = (df["poids"] / (taille_m ** 2)).round(2)

        df["pression_arterielle_moyenne"] = (
            df["pression_arterielle_diastolique"]
            + (df["pression_arterielle_systolique"] - df["pression_arterielle_diastolique"]) / 3
        ).round(1)

        df["pression_pouls"] = (
            df["pression_arterielle_systolique"] - df["pression_arterielle_diastolique"]
        )

        df["choc_index"] = (
            df["frequence_cardiaque"] / df["pression_arterielle_systolique"].replace(0, 1)
        ).round(2)

        df["sexe_encoded"] = df["sexe"].map({"M": 1, "F": 0}).fillna(0).astype(int)

        logger.debug("Feature engineering appliqué : %d variables dérivées ajoutées", 5)
        return df

    def build_full_feature_matrix(self, df: pd.DataFrame, preprocessing: PreprocessingService) -> pd.DataFrame:
        """
        Construit la matrice de features finale (numériques dérivées +
        multi-label encodées) prête pour l'entraînement ou l'inférence.

        Args:
            df: DataFrame nettoyé.
            preprocessing: Instance du service de prétraitement (pour
                l'encodage multi-label des symptômes/antécédents/allergies).

        Returns:
            DataFrame de features numériques uniquement, prêt pour scikit-learn.
        """
        df = self.add_derived_features(df)
        df = preprocessing.encode_multilabel_columns(df)

        multilabel_cols = [c for c in df.columns if c.startswith(("sympt_", "atcd_", "allerg_"))]
        feature_cols = [c for c in FINAL_NUMERIC_FEATURES if c in df.columns] + multilabel_cols

        return df[feature_cols].fillna(0)
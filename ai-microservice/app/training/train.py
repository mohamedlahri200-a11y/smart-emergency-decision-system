"""
train.py
========
Script principal d'entraînement de tous les modèles ML du
microservice IA. Pour chaque module, plusieurs algorithmes sont
comparés automatiquement et le meilleur est sélectionné et
sauvegardé, avec ses métriques de performance.

Le dataset synthétique généré passe systématiquement par une étape
de validation médicale stricte (validate_and_clean_dataset) et un
rapport de qualité est produit avant tout entraînement.

Modules entraînés :
    1. Triage intelligent (multi-classe : Rouge/Orange/Jaune/Vert/Bleu)
    2. Orientation hospitalière (multi-classe : 7 services)
    3. Risque d'aggravation clinique (multi-classe : 4 niveaux)
    4. Examens complémentaires (multi-label)
    5. Analyses biologiques (multi-label)
    15. Temps de prise en charge (régression)

Usage :
    python -m app.training.train --n-patients 100000
"""

import argparse
import time
from datetime import datetime
from typing import Dict, List

from sklearn.ensemble import (
    RandomForestClassifier, GradientBoostingClassifier, ExtraTreesClassifier,
    RandomForestRegressor, GradientBoostingRegressor, ExtraTreesRegressor,
)
from sklearn.multioutput import MultiOutputClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MultiLabelBinarizer
from xgboost import XGBRegressor

from app.core.config import get_settings
from app.core.constants import AVAILABLE_EXAMS, AVAILABLE_LAB_TESTS, RANDOM_STATE
from app.models.model_loader import model_registry
from app.services.preprocessing import PreprocessingService
from app.services.feature_engineering import FeatureEngineeringService
from app.training.evaluation import evaluate_classifiers, evaluate_regressors
from app.training.generate_dataset import (
    generate_dataset,
    save_dataset,
    validate_and_clean_dataset,
    generate_data_quality_report,
    save_quality_report,
)
from app.utils.logger import get_module_logger
from app.utils.xgb_wrapper import LabeledXGBClassifier

logger = get_module_logger(__name__)
settings = get_settings()


def _train_classification_module(
    module_name: str, X_train, X_test, y_train, y_test
) -> Dict:
    """
    Entraîne et compare 4 classifieurs (RandomForest, GradientBoosting,
    ExtraTrees, XGBoost) pour un module de classification donné, puis
    sauvegarde le meilleur.
    """
    logger.info("=== Entraînement du module : %s ===", module_name)

    candidates = {
        "RandomForest": RandomForestClassifier(n_estimators=200, max_depth=20, random_state=RANDOM_STATE, n_jobs=-1),
        "GradientBoosting": GradientBoostingClassifier(n_estimators=150, max_depth=4, random_state=RANDOM_STATE),
        "ExtraTrees": ExtraTreesClassifier(n_estimators=200, max_depth=20, random_state=RANDOM_STATE, n_jobs=-1),
        "XGBoost": LabeledXGBClassifier(
            n_estimators=200, max_depth=6, learning_rate=0.1, random_state=RANDOM_STATE,
            eval_metric="mlogloss", n_jobs=-1,
        ),
    }

    trained = {}
    for name, model in candidates.items():
        t0 = time.time()
        model.fit(X_train, y_train)
        trained[name] = model
        logger.info("[%s] entraîné en %.2fs", name, time.time() - t0)

    best_name, best_model, all_metrics = evaluate_classifiers(trained, X_test, y_test)

    metadata = {
        "module": module_name,
        "best_algorithm": best_name,
        "all_metrics": all_metrics,
        "trained_at": datetime.now().isoformat(),
        "dataset_size": len(X_train) + len(X_test),
        "feature_names": list(X_train.columns),
    }
    model_registry.save_model(module_name, best_model, metadata)
    return metadata


def _train_regression_module(module_name: str, X_train, X_test, y_train, y_test) -> Dict:
    """Entraîne et compare 4 régresseurs, puis sauvegarde le meilleur."""
    logger.info("=== Entraînement du module : %s ===", module_name)

    candidates = {
        "RandomForestRegressor": RandomForestRegressor(n_estimators=200, max_depth=15, random_state=RANDOM_STATE, n_jobs=-1),
        "GradientBoostingRegressor": GradientBoostingRegressor(n_estimators=150, max_depth=4, random_state=RANDOM_STATE),
        "ExtraTreesRegressor": ExtraTreesRegressor(n_estimators=200, max_depth=15, random_state=RANDOM_STATE, n_jobs=-1),
        "XGBoostRegressor": XGBRegressor(n_estimators=200, max_depth=6, learning_rate=0.1, random_state=RANDOM_STATE, n_jobs=-1),
    }

    trained = {}
    for name, model in candidates.items():
        t0 = time.time()
        model.fit(X_train, y_train)
        trained[name] = model
        logger.info("[%s] entraîné en %.2fs", name, time.time() - t0)

    best_name, best_model, all_metrics = evaluate_regressors(trained, X_test, y_test)

    metadata = {
        "module": module_name,
        "best_algorithm": best_name,
        "all_metrics": all_metrics,
        "trained_at": datetime.now().isoformat(),
        "dataset_size": len(X_train) + len(X_test),
        "feature_names": list(X_train.columns),
    }
    model_registry.save_model(module_name, best_model, metadata)
    return metadata


def _train_multilabel_module(module_name: str, X_train, X_test, y_train_raw: List[str], y_test_raw: List[str], vocabulary: List[str]) -> Dict:
    """Entraîne un classifieur multi-label (MultiOutputClassifier sur RandomForest)."""
    logger.info("=== Entraînement du module multi-label : %s ===", module_name)

    mlb = MultiLabelBinarizer(classes=vocabulary)
    y_train = mlb.fit_transform([s.split("|") if s else [] for s in y_train_raw])
    y_test = mlb.transform([s.split("|") if s else [] for s in y_test_raw])

    base_model = RandomForestClassifier(n_estimators=150, max_depth=15, random_state=RANDOM_STATE, n_jobs=-1)
    model = MultiOutputClassifier(base_model, n_jobs=-1)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    from sklearn.metrics import f1_score, hamming_loss
    f1 = f1_score(y_test, y_pred, average="samples", zero_division=0)
    hloss = hamming_loss(y_test, y_pred)

    metadata = {
        "module": module_name,
        "best_algorithm": "RandomForest_MultiOutput",
        "all_metrics": {"f1_samples": round(float(f1), 4), "hamming_loss": round(float(hloss), 4)},
        "trained_at": datetime.now().isoformat(),
        "dataset_size": len(X_train) + len(X_test),
        "feature_names": list(X_train.columns),
        "label_vocabulary": vocabulary,
    }

    import joblib
    joblib.dump(mlb, settings.SAVED_MODELS_DIR / f"{module_name}_binarizer.joblib")
    model_registry.save_model(module_name, model, metadata)
    logger.info("[%s] f1_samples=%.4f | hamming_loss=%.4f", module_name, f1, hloss)
    return metadata


def train_all_models(n_patients: int = None, save_dataset_to_disk: bool = True) -> Dict:
    """
    Orchestration complète de l'entraînement : génération du dataset,
    validation médicale, prétraitement, feature engineering, puis
    entraînement de tous les modules ML du microservice.

    Args:
        n_patients: Nombre de patients synthétiques à générer.
        save_dataset_to_disk: Sauvegarder le dataset généré en CSV.

    Returns:
        Dictionnaire résumant les métadonnées de tous les modules entraînés,
        y compris le rapport de qualité du dataset ('dataset_quality_report').
    """
    logger.info("=========================================================")
    logger.info("DÉBUT DE L'ENTRAÎNEMENT COMPLET DU MICROSERVICE IA")
    logger.info("=========================================================")

    # 1. Génération du dataset brut
    df_raw = generate_dataset(n_patients=n_patients)

    # 1bis. Validation médicale stricte + rapport de qualité
    df_validated = validate_and_clean_dataset(df_raw)
    quality_report = generate_data_quality_report(df_validated)
    logger.info(
        "Qualité dataset : ratio classes minoritaires = %s",
        quality_report["minority_class_ratio"],
    )

    if save_dataset_to_disk:
        save_dataset(df_validated)
        save_quality_report(quality_report)

    # 2. Prétraitement (nettoyage complémentaire : imputation, dédoublonnage)
    preprocessing = PreprocessingService()
    df_clean = preprocessing.clean_dataframe(df_validated)

    # 3. Feature engineering
    fe_service = FeatureEngineeringService()
    X = fe_service.build_full_feature_matrix(df_clean, preprocessing)

    results = {}

    # --- Module 1 : Triage intelligent ---
    y_triage = df_clean["target_triage_priority"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_triage, test_size=settings.TEST_SIZE, random_state=RANDOM_STATE, stratify=y_triage
    )
    results["triage_model"] = _train_classification_module("triage_model", X_train, X_test, y_train, y_test)

    # --- Module 2 : Orientation hospitalière ---
    y_service = df_clean["target_service"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_service, test_size=settings.TEST_SIZE, random_state=RANDOM_STATE, stratify=y_service
    )
    results["orientation_model"] = _train_classification_module("orientation_model", X_train, X_test, y_train, y_test)

    # --- Module 7 : Risque d'aggravation ---
    y_deterioration = df_clean["target_deterioration_risk"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_deterioration, test_size=settings.TEST_SIZE, random_state=RANDOM_STATE, stratify=y_deterioration
    )
    results["deterioration_model"] = _train_classification_module("deterioration_model", X_train, X_test, y_train, y_test)

    # --- Module 3 : Examens complémentaires (multi-label) ---
    X_train, X_test, y_train_raw, y_test_raw = train_test_split(
        X, df_clean["target_exams"], test_size=settings.TEST_SIZE, random_state=RANDOM_STATE
    )
    results["exams_model"] = _train_multilabel_module(
        "exams_model", X_train, X_test, list(y_train_raw), list(y_test_raw), AVAILABLE_EXAMS
    )

    # --- Module 4 : Analyses biologiques (multi-label) ---
    X_train, X_test, y_train_raw, y_test_raw = train_test_split(
        X, df_clean["target_lab_tests"], test_size=settings.TEST_SIZE, random_state=RANDOM_STATE
    )
    results["lab_tests_model"] = _train_multilabel_module(
        "lab_tests_model", X_train, X_test, list(y_train_raw), list(y_test_raw), AVAILABLE_LAB_TESTS
    )

    # --- Module 15 : Temps de prise en charge (régression) ---
    y_los = df_clean["target_length_of_stay"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_los, test_size=settings.TEST_SIZE, random_state=RANDOM_STATE
    )
    results["los_regressor"] = _train_regression_module("los_regressor", X_train, X_test, y_train, y_test)

    logger.info("=========================================================")
    logger.info("ENTRAÎNEMENT TERMINÉ AVEC SUCCÈS")
    logger.info("=========================================================")

    results["dataset_quality_report"] = quality_report
    return results


def main():
    """Point d'entrée CLI pour lancer l'entraînement complet."""
    parser = argparse.ArgumentParser(description="Entraîne tous les modèles ML du microservice IA.")
    parser.add_argument("--n-patients", type=int, default=settings.DEFAULT_DATASET_SIZE, help="Nombre de patients synthétiques")
    args = parser.parse_args()

    train_all_models(n_patients=args.n_patients)


if __name__ == "__main__":
    main()
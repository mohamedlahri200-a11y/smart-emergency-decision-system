"""
generate_dataset.py
====================
Générateur de dataset synthétique réaliste de patients aux urgences.

Le dataset est généré à partir de "profils cliniques" (AVC, IDM,
Sepsis, Traumatisme, COVID, Asthme, Diabète décompensé, HTA,
Douleur thoracique non spécifique, Détresse respiratoire,
Polytraumatisme, Non urgent, Consultation simple) afin de garantir
une cohérence médicale des corrélations entre variables (ex : un AVC
génère un GCS abaissé, une PA élevée, des symptômes neurologiques
cohérents), plutôt qu'un tirage purement aléatoire.

Un bruit contrôlé est ajouté pour éviter un dataset "trop parfait"
et se rapprocher de la variabilité clinique réelle. Le dataset brut
généré passe ensuite obligatoirement par validate_and_clean_dataset()
avant tout entraînement, qui :
    - supprime les doublons et incohérences physiologiques,
    - applique un clipping physiologique de sécurité,
    - vérifie l'absence de valeurs manquantes,
    - produit un rapport qualité chiffré (generate_data_quality_report).
"""

import argparse
import json
from dataclasses import dataclass
from typing import Callable, Dict, List

import numpy as np
import pandas as pd

from app.core.constants import (
    KNOWN_SYMPTOMS,
    KNOWN_ANTECEDENTS,
    KNOWN_ALLERGIES,
    AVAILABLE_EXAMS,
    AVAILABLE_LAB_TESTS,
    RANDOM_STATE,
    PHYSIOLOGICAL_BOUNDS,
)
from app.core.config import get_settings
from app.utils.helpers import calculate_news2_score, estimate_esi_level
from app.utils.logger import get_module_logger

logger = get_module_logger(__name__)
settings = get_settings()


@dataclass
class ClinicalProfile:
    """Définit un profil clinique synthétique avec ses distributions."""

    name: str
    weight: float  # Proportion relative du profil dans le dataset
    age_range: tuple
    vitals_generator: Callable[[np.random.Generator], Dict]
    symptoms_pool: List[str]
    antecedents_pool: List[str]
    triage_priority: str
    service: str
    vital_emergency: str
    exams: List[str]
    lab_tests: List[str]
    deterioration_bias: str  # "Faible"|"Modere"|"Eleve"|"Critique"


def _noise(rng: np.random.Generator, value: float, scale: float) -> float:
    """Ajoute un bruit gaussien contrôlé à une valeur."""
    return float(value + rng.normal(0, scale))


def _build_profiles() -> List[ClinicalProfile]:
    """Construit la liste des profils cliniques utilisés pour la génération."""

    def vitals_avc(rng):
        return dict(
            temperature=_noise(rng, 37.0, 0.4),
            frequence_cardiaque=int(_noise(rng, 95, 12)),
            pas=int(_noise(rng, 175, 20)),
            pad=int(_noise(rng, 100, 12)),
            fr=int(_noise(rng, 19, 3)),
            spo2=_noise(rng, 95, 2),
            glycemie=_noise(rng, 1.3, 0.4),
            douleur=int(rng.integers(0, 4)),
            gcs=int(rng.integers(9, 15)),
        )

    def vitals_idm(rng):
        return dict(
            temperature=_noise(rng, 36.9, 0.3),
            frequence_cardiaque=int(_noise(rng, 105, 15)),
            pas=int(_noise(rng, 100, 20)),
            pad=int(_noise(rng, 65, 12)),
            fr=int(_noise(rng, 22, 3)),
            spo2=_noise(rng, 93, 3),
            glycemie=_noise(rng, 1.4, 0.5),
            douleur=int(rng.integers(7, 11)),
            gcs=15,
        )

    def vitals_sepsis(rng):
        return dict(
            temperature=_noise(rng, 39.3, 0.7),
            frequence_cardiaque=int(_noise(rng, 125, 15)),
            pas=int(_noise(rng, 85, 15)),
            pad=int(_noise(rng, 55, 10)),
            fr=int(_noise(rng, 27, 4)),
            spo2=_noise(rng, 91, 3),
            glycemie=_noise(rng, 1.5, 0.6),
            douleur=int(rng.integers(3, 8)),
            gcs=int(rng.integers(11, 15)),
        )

    def vitals_traumatisme(rng):
        return dict(
            temperature=_noise(rng, 36.8, 0.4),
            frequence_cardiaque=int(_noise(rng, 100, 18)),
            pas=int(_noise(rng, 110, 25)),
            pad=int(_noise(rng, 70, 15)),
            fr=int(_noise(rng, 20, 4)),
            spo2=_noise(rng, 96, 3),
            glycemie=_noise(rng, 1.1, 0.3),
            douleur=int(rng.integers(5, 11)),
            gcs=int(rng.integers(10, 16)),
        )

    def vitals_covid(rng):
        return dict(
            temperature=_noise(rng, 38.6, 0.6),
            frequence_cardiaque=int(_noise(rng, 98, 12)),
            pas=int(_noise(rng, 118, 15)),
            pad=int(_noise(rng, 75, 10)),
            fr=int(_noise(rng, 24, 4)),
            spo2=_noise(rng, 92, 4),
            glycemie=_noise(rng, 1.2, 0.3),
            douleur=int(rng.integers(1, 5)),
            gcs=15,
        )

    def vitals_asthme(rng):
        return dict(
            temperature=_noise(rng, 37.1, 0.4),
            frequence_cardiaque=int(_noise(rng, 110, 14)),
            pas=int(_noise(rng, 125, 15)),
            pad=int(_noise(rng, 80, 10)),
            fr=int(_noise(rng, 28, 4)),
            spo2=_noise(rng, 90, 4),
            glycemie=_noise(rng, 1.1, 0.3),
            douleur=int(rng.integers(1, 4)),
            gcs=15,
        )

    def vitals_diabete(rng):
        return dict(
            temperature=_noise(rng, 37.2, 0.5),
            frequence_cardiaque=int(_noise(rng, 100, 15)),
            pas=int(_noise(rng, 105, 20)),
            pad=int(_noise(rng, 68, 12)),
            fr=int(_noise(rng, 22, 4)),
            spo2=_noise(rng, 96, 2),
            glycemie=_noise(rng, 3.8, 1.2),
            douleur=int(rng.integers(0, 5)),
            gcs=int(rng.integers(11, 16)),
        )

    def vitals_hta(rng):
        return dict(
            temperature=_noise(rng, 36.9, 0.3),
            frequence_cardiaque=int(_noise(rng, 88, 10)),
            pas=int(_noise(rng, 185, 20)),
            pad=int(_noise(rng, 110, 12)),
            fr=int(_noise(rng, 18, 3)),
            spo2=_noise(rng, 97, 1.5),
            glycemie=_noise(rng, 1.2, 0.3),
            douleur=int(rng.integers(0, 6)),
            gcs=15,
        )

    def vitals_douleur_thoracique(rng):
        return dict(
            temperature=_noise(rng, 37.0, 0.3),
            frequence_cardiaque=int(_noise(rng, 90, 12)),
            pas=int(_noise(rng, 130, 15)),
            pad=int(_noise(rng, 82, 10)),
            fr=int(_noise(rng, 18, 3)),
            spo2=_noise(rng, 97, 1.5),
            glycemie=_noise(rng, 1.1, 0.3),
            douleur=int(rng.integers(3, 8)),
            gcs=15,
        )

    def vitals_detresse_resp(rng):
        return dict(
            temperature=_noise(rng, 37.6, 0.6),
            frequence_cardiaque=int(_noise(rng, 115, 15)),
            pas=int(_noise(rng, 120, 18)),
            pad=int(_noise(rng, 78, 10)),
            fr=int(_noise(rng, 30, 5)),
            spo2=_noise(rng, 88, 4),
            glycemie=_noise(rng, 1.2, 0.3),
            douleur=int(rng.integers(1, 5)),
            gcs=int(rng.integers(12, 16)),
        )

    def vitals_polytraumatisme(rng):
        return dict(
            temperature=_noise(rng, 36.2, 0.6),
            frequence_cardiaque=int(_noise(rng, 130, 18)),
            pas=int(_noise(rng, 80, 18)),
            pad=int(_noise(rng, 50, 12)),
            fr=int(_noise(rng, 26, 5)),
            spo2=_noise(rng, 90, 4),
            glycemie=_noise(rng, 1.3, 0.4),
            douleur=int(rng.integers(6, 11)),
            gcs=int(rng.integers(6, 13)),
        )

    def vitals_non_urgent(rng):
        return dict(
            temperature=_noise(rng, 36.8, 0.3),
            frequence_cardiaque=int(_noise(rng, 78, 10)),
            pas=int(_noise(rng, 120, 12)),
            pad=int(_noise(rng, 78, 8)),
            fr=int(_noise(rng, 16, 2)),
            spo2=_noise(rng, 98, 1),
            glycemie=_noise(rng, 1.0, 0.2),
            douleur=int(rng.integers(0, 4)),
            gcs=15,
        )

    def vitals_consultation_simple(rng):
        return dict(
            temperature=_noise(rng, 36.7, 0.2),
            frequence_cardiaque=int(_noise(rng, 72, 8)),
            pas=int(_noise(rng, 115, 10)),
            pad=int(_noise(rng, 75, 6)),
            fr=int(_noise(rng, 15, 1.5)),
            spo2=_noise(rng, 99, 0.7),
            glycemie=_noise(rng, 0.95, 0.15),
            douleur=int(rng.integers(0, 2)),
            gcs=15,
        )

    return [
        ClinicalProfile("AVC", 0.05, (45, 95), vitals_avc,
                         ["paralysie_faciale", "trouble_parole", "faiblesse_musculaire", "vertiges", "cephalees"],
                         ["HTA", "AVC_ancien", "Diabete"], "Rouge", "Neurologie", "AVC",
                         ["Scanner_Cerebral", "IRM_Cerebrale", "ECG"], ["NFS", "Ionogramme", "TP_TCA", "Glycemie_veineuse"], "Critique"),
        ClinicalProfile("IDM", 0.05, (40, 90), vitals_idm,
                         ["douleur_thoracique", "dyspnee", "palpitations", "nausees"],
                         ["HTA", "Cardiopathie", "Tabagisme", "Diabete"], "Rouge", "Cardiologie", "Infarctus",
                         ["ECG", "Echographie_Cardiaque"], ["Troponine", "NFS", "Ionogramme", "BNP"], "Critique"),
        ClinicalProfile("Sepsis", 0.05, (18, 95), vitals_sepsis,
                         ["fievre", "confusion", "hypotension", "agitation", "douleur_abdominale"],
                         ["Immunodepression", "Diabete", "Cancer"], "Rouge", "Reanimation", "Sepsis",
                         ["Radiographie_Thorax", "Echographie_Abdominale"], ["Hemocultures", "Lactates", "NFS", "CRP", "Gaz_du_sang"], "Critique"),
        ClinicalProfile("Traumatisme", 0.10, (5, 90), vitals_traumatisme,
                         ["traumatisme_membre", "plaie", "douleur_articulaire", "hemorragie"],
                         ["Aucun", "Coagulopathie"], "Orange", "Orthopedie", "Aucune",
                         ["Radiographie_Membre", "Scanner_Cerebral"], ["NFS", "Groupage_Sanguin", "TP_TCA"], "Modere"),
        ClinicalProfile("COVID", 0.07, (18, 90), vitals_covid,
                         ["fievre", "toux", "dyspnee", "faiblesse_musculaire"],
                         ["BPCO", "Obesite", "Diabete", "Immunodepression"], "Orange", "Pneumologie", "Aucune",
                         ["Radiographie_Thorax", "Scanner_Thoraco_Abdo"], ["NFS", "CRP", "Gaz_du_sang", "D_Dimeres"], "Eleve"),
        ClinicalProfile("Asthme", 0.06, (5, 70), vitals_asthme,
                         ["dyspnee", "toux", "agitation"],
                         ["Asthme", "BPCO"], "Orange", "Pneumologie", "Detresse_Respiratoire",
                         ["Radiographie_Thorax"], ["Gaz_du_sang", "NFS"], "Eleve"),
        ClinicalProfile("Diabete_decompense", 0.06, (10, 85), vitals_diabete,
                         ["polyurie", "polydipsie", "deshydratation", "confusion", "nausees"],
                         ["Diabete"], "Orange", "Urgence_Generale", "Aucune",
                         [], ["Glycemie_veineuse", "Ionogramme", "Gaz_du_sang", "Bandelette_urinaire"], "Modere"),
        ClinicalProfile("HTA", 0.08, (35, 90), vitals_hta,
                         ["cephalees", "vertiges", "vomissements"],
                         ["HTA"], "Jaune", "Cardiologie", "Aucune",
                         ["ECG", "Fond_Oeil"], ["Ionogramme", "Uree_Creatinine"], "Modere"),
        ClinicalProfile("Douleur_thoracique_NS", 0.10, (20, 80), vitals_douleur_thoracique,
                         ["douleur_thoracique"],
                         ["Aucun", "Tabagisme"], "Jaune", "Cardiologie", "Aucune",
                         ["ECG"], ["Troponine", "D_Dimeres"], "Faible"),
        ClinicalProfile("Detresse_respiratoire", 0.05, (1, 95), vitals_detresse_resp,
                         ["dyspnee", "toux", "agitation", "confusion"],
                         ["BPCO", "Asthme", "Cardiopathie"], "Rouge", "Reanimation", "Detresse_Respiratoire",
                         ["Radiographie_Thorax", "Gaz_du_sang"], ["Gaz_du_sang", "NFS"], "Critique"),
        ClinicalProfile("Polytraumatisme", 0.03, (5, 80), vitals_polytraumatisme,
                         ["traumatisme_membre", "hemorragie", "douleur_dorsale", "confusion"],
                         ["Aucun", "Coagulopathie"], "Rouge", "Reanimation", "Choc",
                         ["Scanner_Thoraco_Abdo", "Scanner_Cerebral", "Radiographie_Membre"], ["NFS", "Groupage_Sanguin", "TP_TCA", "Lactates"], "Critique"),
        ClinicalProfile("Non_urgent_Vert", 0.18, (5, 90), vitals_non_urgent,
                         ["douleur_articulaire", "eruption_cutanee", "toux", "cephalees", "douleur_abdominale"],
                         ["Aucun", "HTA"], "Vert", "Urgence_Generale", "Aucune",
                         [], ["NFS"], "Faible"),
        ClinicalProfile("Consultation_simple_Bleu", 0.12, (5, 85), vitals_consultation_simple,
                         ["eruption_cutanee", "douleur_articulaire", "cephalees"],
                         ["Aucun"], "Bleu", "Urgence_Generale", "Aucune",
                         [], [], "Faible"),
    ]


def _sample_symptoms(rng: np.random.Generator, pool: List[str], k_range=(1, 4)) -> List[str]:
    """Échantillonne un sous-ensemble aléatoire de symptômes plausibles."""
    k = int(rng.integers(k_range[0], k_range[1] + 1))
    k = min(k, len(pool))
    chosen = list(rng.choice(pool, size=k, replace=False)) if pool else []
    if rng.random() < 0.15:
        chosen.append(str(rng.choice(KNOWN_SYMPTOMS)))
    return list(dict.fromkeys(chosen))


def _sample_antecedents(rng: np.random.Generator, pool: List[str]) -> List[str]:
    """Échantillonne les antécédents médicaux du patient."""
    if rng.random() < 0.2 or not pool:
        return ["Aucun"]
    k = int(rng.integers(1, min(3, len(pool)) + 1))
    return list(rng.choice(pool, size=k, replace=False))


def _sample_allergies(rng: np.random.Generator) -> List[str]:
    """Échantillonne les allergies connues du patient."""
    if rng.random() < 0.75:
        return ["Aucune"]
    return [str(rng.choice([a for a in KNOWN_ALLERGIES if a != "Aucune"]))]


def _estimate_los(rng: np.random.Generator, priority: str, service: str) -> float:
    """Estime une durée de séjour synthétique cohérente (en heures)."""
    base = {"Rouge": 18, "Orange": 10, "Jaune": 5, "Vert": 2.5, "Bleu": 1.5}[priority]
    service_factor = 1.4 if service in {"Reanimation", "Cardiologie", "Neurologie"} else 1.0
    return max(0.5, _noise(rng, base * service_factor, base * 0.25))


def _estimate_waiting_time(rng: np.random.Generator, priority: str) -> float:
    """Estime un temps d'attente synthétique cohérent (en minutes)."""
    base = {"Rouge": 3, "Orange": 20, "Jaune": 45, "Vert": 90, "Bleu": 120}[priority]
    return max(0.0, _noise(rng, base, base * 0.3))


def generate_dataset(n_patients: int = None, random_state: int = None) -> pd.DataFrame:
    """
    Génère un dataset synthétique complet de patients aux urgences.

    Args:
        n_patients: Nombre de patients à générer (défaut : config).
        random_state: Graine aléatoire pour la reproductibilité.

    Returns:
        DataFrame Pandas contenant l'ensemble des colonnes cliniques
        et des cibles (targets) pour tous les modules IA.
    """
    n_patients = n_patients or settings.DEFAULT_DATASET_SIZE
    random_state = random_state if random_state is not None else RANDOM_STATE
    rng = np.random.default_rng(random_state)

    profiles = _build_profiles()
    weights = np.array([p.weight for p in profiles])
    weights = weights / weights.sum()

    records = []
    for i in range(n_patients):
        profile: ClinicalProfile = rng.choice(profiles, p=weights)
        age = int(rng.integers(profile.age_range[0], profile.age_range[1] + 1))
        sexe = str(rng.choice(["M", "F"]))
        poids = float(np.clip(_noise(rng, 70 if sexe == "M" else 62, 15), 8, 180))
        taille = float(np.clip(_noise(rng, 172 if sexe == "M" else 161, 9), 60, 210))

        vitals = profile.vitals_generator(rng)

        temperature = float(np.clip(vitals["temperature"], 32, 42))
        fc = int(np.clip(vitals["frequence_cardiaque"], 30, 220))
        pas = int(np.clip(vitals["pas"], 50, 260))
        pad = int(np.clip(vitals["pad"], 30, 160))
        fr = int(np.clip(vitals["fr"], 6, 60))
        spo2 = float(np.clip(vitals["spo2"], 60, 100))
        glycemie = float(np.clip(vitals["glycemie"], 0.3, 6.0))
        douleur = int(np.clip(vitals["douleur"], 0, 10))
        gcs = int(np.clip(vitals["gcs"], 3, 15))

        consciousness_altered = gcs < 15
        news2 = calculate_news2_score(fr, spo2, temperature, pas, fc, consciousness_altered)
        esi = estimate_esi_level(news2, profile.vital_emergency != "Aucune")

        symptomes = _sample_symptoms(rng, profile.symptoms_pool)
        antecedents = _sample_antecedents(rng, profile.antecedents_pool)
        allergies = _sample_allergies(rng)

        mode_arrivee = str(rng.choice(
            ["Ambulance", "SAMU", "Propre_Moyen", "Transfert", "Police"],
            p=[0.25, 0.15, 0.5, 0.07, 0.03],
        ))

        los = round(_estimate_los(rng, profile.triage_priority, profile.service), 2)
        waiting_time = round(_estimate_waiting_time(rng, profile.triage_priority), 2)

        record = {
            "patient_id": f"SYN-{i:07d}",
            "profile": profile.name,
            "age": age,
            "sexe": sexe,
            "poids": round(poids, 1),
            "taille": round(taille, 1),
            "temperature": round(temperature, 1),
            "frequence_cardiaque": fc,
            "pression_arterielle_systolique": pas,
            "pression_arterielle_diastolique": pad,
            "frequence_respiratoire": fr,
            "saturation_o2": round(spo2, 1),
            "glycemie": round(glycemie, 2),
            "douleur_eva": douleur,
            "score_news2": news2,
            "score_esi": esi,
            "score_gcs": gcs,
            "antecedents": "|".join(antecedents),
            "allergies": "|".join(allergies),
            "symptomes": "|".join(symptomes),
            "mode_arrivee": mode_arrivee,
            # Targets
            "target_triage_priority": profile.triage_priority,
            "target_service": profile.service,
            "target_vital_emergency": profile.vital_emergency,
            "target_deterioration_risk": profile.deterioration_bias,
            "target_exams": "|".join(profile.exams),
            "target_lab_tests": "|".join(profile.lab_tests),
            "target_length_of_stay": los,
            "target_waiting_time": waiting_time,
        }
        records.append(record)

        if (i + 1) % 20000 == 0:
            logger.info("Génération dataset : %d / %d patients", i + 1, n_patients)

    df = pd.DataFrame.from_records(records)
    logger.info("Dataset synthétique généré : %d patients, %d colonnes", df.shape[0], df.shape[1])
    return df


def validate_and_clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Applique une validation médicale rigoureuse au dataset synthétique
    généré, afin de garantir sa cohérence clinique avant tout
    entraînement :

        1. Suppression des doublons stricts et des doublons de patient_id.
        2. Suppression des lignes physiologiquement impossibles
           (ex : PA diastolique >= PA systolique, constantes hors bornes
           vitales possibles).
        3. Clipping strict des valeurs numériques sur leurs bornes
           physiologiques réalistes (sécurité supplémentaire après
           le bruit gaussien).
        4. Suppression des lignes sans aucun symptôme après nettoyage.
        5. Vérification qu'aucune valeur manquante ne subsiste.

    Args:
        df: Dataset brut tel que produit par generate_dataset().

    Returns:
        Dataset validé et nettoyé, prêt pour l'entraînement.
    """
    n_initial = len(df)
    df = df.copy()

    df = df.drop_duplicates()
    df = df.drop_duplicates(subset=["patient_id"])

    physio_mask = (
        (df["pression_arterielle_systolique"] > df["pression_arterielle_diastolique"])
        & (df["frequence_cardiaque"].between(20, 250))
        & (df["frequence_respiratoire"].between(4, 70))
        & (df["saturation_o2"].between(50, 100))
        & (df["temperature"].between(30, 43))
        & (df["age"].between(0, 120))
        & (df["poids"].between(2, 300))
        & (df["taille"].between(30, 230))
        & (df["glycemie"].between(0.1, 8))
        & (df["score_gcs"].between(3, 15))
    )
    n_incoherent = (~physio_mask).sum()
    df = df[physio_mask]

    for col, (low, high) in PHYSIOLOGICAL_BOUNDS.items():
        if col in df.columns:
            df[col] = df[col].clip(lower=low, upper=high)

    n_before_symptoms = len(df)
    df = df[df["symptomes"].astype(str).str.len() > 0]
    n_no_symptoms = n_before_symptoms - len(df)

    n_missing = df.isnull().sum().sum()
    if n_missing > 0:
        logger.warning("Valeurs manquantes détectées après nettoyage (%d) - suppression des lignes concernées", n_missing)
        df = df.dropna()

    df = df.reset_index(drop=True)

    n_final = len(df)
    removed_pct = round(100 * (n_initial - n_final) / n_initial, 2) if n_initial else 0.0

    logger.info(
        "Nettoyage dataset : %d -> %d patients (%.2f%% supprimés) | incohérents=%d | sans_symptome=%d | valeurs_manquantes=%d",
        n_initial, n_final, removed_pct, n_incoherent, n_no_symptoms, n_missing,
    )

    if removed_pct > 5.0:
        logger.warning(
            "Plus de 5%% des patients ont été supprimés lors du nettoyage (%.2f%%). "
            "Vérifier la logique de génération si ce taux est anormalement élevé.", removed_pct
        )

    return df


def generate_data_quality_report(df: pd.DataFrame) -> Dict:
    """
    Génère un rapport de qualité du dataset : distribution des cibles,
    statistiques descriptives des constantes vitales, taux de valeurs
    manquantes, et vérification de l'équilibre des classes.

    Args:
        df: Dataset nettoyé et validé.

    Returns:
        Dictionnaire structuré représentant le rapport qualité.
    """
    report = {
        "n_patients": int(len(df)),
        "n_features": int(df.shape[1]),
        "missing_values_total": int(df.isnull().sum().sum()),
        "duplicate_rows": int(df.duplicated().sum()),
        "target_distributions": {
            "triage_priority": df["target_triage_priority"].value_counts().to_dict(),
            "service": df["target_service"].value_counts().to_dict(),
            "vital_emergency": df["target_vital_emergency"].value_counts().to_dict(),
            "deterioration_risk": df["target_deterioration_risk"].value_counts().to_dict(),
            "clinical_profile": df["profile"].value_counts().to_dict(),
        },
        "vital_signs_statistics": df[[
            "age", "temperature", "frequence_cardiaque",
            "pression_arterielle_systolique", "pression_arterielle_diastolique",
            "frequence_respiratoire", "saturation_o2", "glycemie",
            "score_news2", "score_esi",
        ]].describe().round(2).to_dict(),
        "minority_class_ratio": {},
    }

    for target_col in ["target_triage_priority", "target_service", "target_deterioration_risk"]:
        counts = df[target_col].value_counts()
        if len(counts) > 1:
            report["minority_class_ratio"][target_col] = round(float(counts.min() / counts.max()), 3)

    logger.info(
        "Rapport qualité généré : %d patients, %d valeurs manquantes, %d doublons",
        report["n_patients"], report["missing_values_total"], report["duplicate_rows"],
    )
    return report


def save_dataset(df: pd.DataFrame, filename: str = "synthetic_patients.csv") -> str:
    """Sauvegarde le dataset généré au format CSV dans le dossier datasets/."""
    output_path = settings.DATASETS_DIR / filename
    df.to_csv(output_path, index=False, encoding="utf-8")
    logger.info("Dataset sauvegardé : %s", output_path)
    return str(output_path)


def save_quality_report(report: Dict, filename: str = "dataset_quality_report.json") -> str:
    """Sauvegarde le rapport de qualité du dataset au format JSON."""
    output_path = settings.DATASETS_DIR / filename
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False, default=str)
    logger.info("Rapport qualité sauvegardé : %s", output_path)
    return str(output_path)


def main():
    """Point d'entrée CLI pour générer, nettoyer et sauvegarder le dataset synthétique."""
    parser = argparse.ArgumentParser(description="Génère le dataset synthétique de patients urgences.")
    parser.add_argument("--n", type=int, default=settings.DEFAULT_DATASET_SIZE, help="Nombre de patients à générer")
    parser.add_argument("--seed", type=int, default=RANDOM_STATE, help="Graine aléatoire")
    parser.add_argument("--output", type=str, default="synthetic_patients.csv", help="Nom du fichier de sortie")
    args = parser.parse_args()

    df = generate_dataset(n_patients=args.n, random_state=args.seed)
    df = validate_and_clean_dataset(df)
    report = generate_data_quality_report(df)
    save_dataset(df, filename=args.output)
    save_quality_report(report)


if __name__ == "__main__":
    main()
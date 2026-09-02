"""
helpers.py
==========
Fonctions utilitaires transverses : calcul de scores cliniques
standardisés (NEWS2), génération d'identifiants, encodage
multi-label, etc.
"""

import uuid
from datetime import datetime
from typing import Dict, Iterable, List


def generate_prediction_id() -> str:
    """Génère un identifiant unique pour une prédiction."""
    return f"PRED-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:8]}"


def calculate_news2_score(
    respiratory_rate: int,
    spo2: float,
    temperature: float,
    systolic_bp: int,
    heart_rate: int,
    consciousness_altered: bool,
) -> int:
    """
    Calcule le score NEWS2 (National Early Warning Score 2) à partir
    des constantes vitales, selon les seuils officiels du Royal
    College of Physicians, adaptés à un contexte de triage adulte.

    Args:
        respiratory_rate: Fréquence respiratoire (cycles/min).
        spo2: Saturation en oxygène (%).
        temperature: Température corporelle (°C).
        systolic_bp: Pression artérielle systolique (mmHg).
        heart_rate: Fréquence cardiaque (bpm).
        consciousness_altered: True si le patient n'est pas pleinement conscient (GCS < 15).

    Returns:
        Score NEWS2 total (0 à 20+).
    """
    score = 0

    # Fréquence respiratoire
    if respiratory_rate <= 8 or respiratory_rate >= 25:
        score += 3
    elif 9 <= respiratory_rate <= 11:
        score += 1
    elif 21 <= respiratory_rate <= 24:
        score += 2

    # SpO2
    if spo2 <= 91:
        score += 3
    elif 92 <= spo2 <= 93:
        score += 2
    elif 94 <= spo2 <= 95:
        score += 1

    # Température
    if temperature <= 35.0:
        score += 3
    elif 35.1 <= temperature <= 36.0 or 38.1 <= temperature <= 39.0:
        score += 1
    elif temperature >= 39.1:
        score += 2

    # Pression artérielle systolique
    if systolic_bp <= 90 or systolic_bp >= 220:
        score += 3
    elif 91 <= systolic_bp <= 100:
        score += 2
    elif 101 <= systolic_bp <= 110:
        score += 1

    # Fréquence cardiaque
    if heart_rate <= 40 or heart_rate >= 131:
        score += 3
    elif 111 <= heart_rate <= 130:
        score += 2
    elif (41 <= heart_rate <= 50) or (91 <= heart_rate <= 110):
        score += 1

    # Conscience
    if consciousness_altered:
        score += 3

    return score


def estimate_esi_level(news2_score: int, has_vital_emergency: bool) -> int:
    """
    Estime un niveau ESI (Emergency Severity Index, 1 à 5) à partir
    du score NEWS2 et de la présence d'une urgence vitale suspectée.

    Args:
        news2_score: Score NEWS2 calculé.
        has_vital_emergency: True si une urgence vitale est suspectée.

    Returns:
        Niveau ESI entre 1 (le plus critique) et 5 (le moins critique).
    """
    if has_vital_emergency or news2_score >= 9:
        return 1
    if news2_score >= 7:
        return 2
    if news2_score >= 5:
        return 3
    if news2_score >= 2:
        return 4
    return 5


def multi_hot_encode(items: Iterable[str], vocabulary: List[str]) -> Dict[str, int]:
    """
    Encode une liste d'éléments (symptômes, antécédents...) en
    représentation multi-hot par rapport à un vocabulaire fermé.

    Args:
        items: Éléments présents pour l'observation courante.
        vocabulary: Vocabulaire fermé de référence.

    Returns:
        Dictionnaire {élément: 0 ou 1} pour tout le vocabulaire.
    """
    items_set = {i.lower() for i in items}
    return {v: int(v.lower() in items_set) for v in vocabulary}


def safe_round(value: float, decimals: int = 2) -> float:
    """Arrondit une valeur en gérant les cas NaN/Inf."""
    try:
        if value != value or value in (float("inf"), float("-inf")):  # NaN check
            return 0.0
        return round(float(value), decimals)
    except (TypeError, ValueError):
        return 0.0
"""
constants.py
============
Constantes métier centrales du microservice IA - CHU Mohammed VI Oujda.

Ce module centralise toutes les valeurs métier (niveaux de triage,
services hospitaliers, seuils cliniques, etc.) afin d'éviter la
duplication de "magic strings/numbers" dans le reste du code et de
garantir une source unique de vérité pour les règles cliniques.
"""

from enum import Enum


class TriagePriority(str, Enum):
    """Niveaux de priorité de triage (code couleur français standard)."""

    ROUGE = "Rouge"       # Urgence vitale immédiate
    ORANGE = "Orange"     # Urgence vraie, prise en charge < 30 min
    JAUNE = "Jaune"       # Urgence relative, prise en charge < 1h
    VERT = "Vert"         # Non urgent, prise en charge < 2h
    BLEU = "Bleu"         # Consultation simple / non urgent


class HospitalService(str, Enum):
    """Services hospitaliers cibles pour l'orientation automatique."""

    CARDIOLOGIE = "Cardiologie"
    NEUROLOGIE = "Neurologie"
    ORTHOPEDIE = "Orthopedie"
    PNEUMOLOGIE = "Pneumologie"
    REANIMATION = "Reanimation"
    URGENCE_GENERALE = "Urgence_Generale"
    CHIRURGIE = "Chirurgie"


class DeteriorationRisk(str, Enum):
    """Niveaux de risque d'aggravation clinique."""

    FAIBLE = "Faible"
    MODERE = "Modere"
    ELEVE = "Eleve"
    CRITIQUE = "Critique"


class VitalEmergency(str, Enum):
    """Urgences vitales détectables automatiquement."""

    AVC = "AVC"
    INFARCTUS = "Infarctus"
    SEPSIS = "Sepsis"
    CHOC = "Choc"
    ARRET_CARDIAQUE = "Arret_Cardiaque"
    DETRESSE_RESPIRATOIRE = "Detresse_Respiratoire"


class ArrivalMode(str, Enum):
    """Mode d'arrivée du patient aux urgences."""

    AMBULANCE = "Ambulance"
    SAMU = "SAMU"
    PROPRE_MOYEN = "Propre_Moyen"
    TRANSFERT = "Transfert"
    POLICE = "Police"


class ConsciousnessLevel(str, Enum):
    """Niveau de conscience simplifié (issu du score GCS)."""

    CONSCIENT = "Conscient"          # GCS 15
    CONFUS = "Confus"                # GCS 13-14
    SOMNOLENT = "Somnolent"          # GCS 9-12
    COMATEUX = "Comateux"            # GCS < 9


# ---------------------------------------------------------------------------
# Seuils cliniques (basés sur des références médicales standards - NEWS2,
# recommandations SFMU/SAMU). Utilisés pour le scoring, la génération du
# dataset synthétique et la détection de facteurs de risque.
# ---------------------------------------------------------------------------

VITAL_THRESHOLDS = {
    "temperature": {"low": 35.0, "high": 38.5, "critical_high": 40.0, "critical_low": 32.0},
    "heart_rate": {"low": 50, "high": 100, "critical_high": 130, "critical_low": 40},
    "systolic_bp": {"low": 90, "high": 140, "critical_high": 180, "critical_low": 70},
    "diastolic_bp": {"low": 60, "high": 90, "critical_high": 120, "critical_low": 40},
    "respiratory_rate": {"low": 12, "high": 20, "critical_high": 25, "critical_low": 8},
    "spo2": {"low": 94, "critical_low": 90},
    "glycemia": {"low": 0.70, "high": 1.40, "critical_high": 3.0, "critical_low": 0.40},
    "pain_eva": {"high": 6, "critical_high": 8},
}

NEWS2_SCORE_BANDS = {
    "low": (0, 4),
    "medium": (5, 6),
    "high": (7, 20),
}

ESI_LEVELS = [1, 2, 3, 4, 5]

# Symptômes standardisés utilisés par le générateur de dataset et le
# frontend (liste fermée pour permettre l'encodage multi-label).
KNOWN_SYMPTOMS = [
    "douleur_thoracique", "dyspnee", "fievre", "toux", "cephalees",
    "vertiges", "nausees", "vomissements", "douleur_abdominale",
    "paralysie_faciale", "trouble_parole", "faiblesse_musculaire",
    "palpitations", "syncope", "convulsions", "douleur_dorsale",
    "traumatisme_membre", "plaie", "hemorragie", "eruption_cutanee",
    "douleur_articulaire", "confusion", "agitation", "hypotension",
    "polyurie", "polydipsie", "deshydratation", "oedeme",
]

KNOWN_ANTECEDENTS = [
    "HTA", "Diabete", "Cardiopathie", "AVC_ancien", "Asthme", "BPCO",
    "Insuffisance_Renale", "Cancer", "Obesite", "Tabagisme",
    "Ethylisme", "Grossesse", "Immunodepression", "Coagulopathie",
    "Chirurgie_recente", "Aucun",
]

KNOWN_ALLERGIES = [
    "Penicilline", "Aspirine", "Iode", "Latex", "Fruits_de_mer",
    "Arachides", "Sulfamides", "Aucune",
]

# Examens complémentaires disponibles (sortie multi-label)
AVAILABLE_EXAMS = [
    "ECG", "Radiographie_Thorax", "Scanner_Cerebral", "Scanner_Thoraco_Abdo",
    "IRM_Cerebrale", "Echographie_Abdominale", "Echographie_Cardiaque",
    "Radiographie_Membre", "Angioscanner", "EEG", "Fond_Oeil",
]

# Analyses biologiques disponibles (sortie multi-label)
AVAILABLE_LAB_TESTS = [
    "NFS", "CRP", "Ionogramme", "Uree_Creatinine", "Troponine",
    "D_Dimeres", "Gaz_du_sang", "Glycemie_veineuse", "Bilan_hepatique",
    "Lactates", "Hemocultures", "Bandelette_urinaire", "Groupage_Sanguin",
    "TP_TCA", "BNP",
]

# Protocoles thérapeutiques hospitaliers (informatifs uniquement,
# jamais de prescription nominative).
THERAPEUTIC_PROTOCOLS = {
    VitalEmergency.AVC: "Protocole_AVC_Thrombolyse_Fenetre",
    VitalEmergency.INFARCTUS: "Protocole_SCA_ST_Plus",
    VitalEmergency.SEPSIS: "Protocole_Sepsis_Bundle_1h",
    VitalEmergency.CHOC: "Protocole_Choc_Remplissage_Vasculaire",
    VitalEmergency.ARRET_CARDIAQUE: "Protocole_RCP_ACR",
    VitalEmergency.DETRESSE_RESPIRATOIRE: "Protocole_Detresse_Respiratoire_Oxygenotherapie",
}

MODEL_VERSION = "1.0.0"
RANDOM_STATE = 42# Bornes physiologiques absolues (utilisées pour le clipping de sécurité
# lors du nettoyage, que la donnée soit synthétique ou réelle CHU).
PHYSIOLOGICAL_BOUNDS = {
    "age": (0, 120),
    "poids": (2, 300),
    "taille": (30, 230),
    "temperature": (32.0, 42.0),
    "frequence_cardiaque": (25, 220),
    "pression_arterielle_systolique": (50, 260),
    "pression_arterielle_diastolique": (30, 160),
    "frequence_respiratoire": (6, 60),
    "saturation_o2": (60.0, 100.0),
    "glycemie": (0.3, 6.0),
    "douleur_eva": (0, 10),
    "score_gcs": (3, 15),
    "score_news2": (0, 20),
    "score_esi": (1, 5),
}
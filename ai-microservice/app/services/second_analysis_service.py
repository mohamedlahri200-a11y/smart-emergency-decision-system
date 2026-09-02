"""
second_analysis_service.py
===========================
Moteur de RÈGLES CLINIQUES (pas un modèle de machine learning) qui
affine la prédiction IA de base lorsque des résultats d'examens
biologiques et/ou d'imagerie sont disponibles.

Pourquoi des règles et pas un réentraînement du modèle ML ?
-------------------------------------------------------------
Les modèles de ce microservice (module priority_predictor,
recommendation_service, risk_service) sont entraînés sur un jeu de
variables fixe : constantes vitales, symptômes, antécédents (cf.
app/schemas/patient.py et app/training/generate_dataset.py). Un modèle
scikit-learn / XGBoost ne peut pas tenir compte de variables qu'il n'a
jamais vues à l'entraînement (CRP, procalcitonine, troponine...) sans
un réentraînement complet sur un nouveau jeu de données synthétiques
intégrant ces variables — un chantier à part entière.

Ce module comble ce besoin fonctionnel immédiat via des seuils
cliniques réels (mêmes références que celles utilisées dans
core/constants.py et par les recommandations de la SFMU), appliqués
en complément — jamais en remplacement — de la prédiction du modèle
ML initial. C'est une architecture hybride ML + règles, courante dans
les systèmes d'aide à la décision clinique réels.
"""

from typing import List, Tuple

from app.schemas.lab_results import LabImagingResultsData
from app.schemas.response import AIExplanation, FeatureContribution, PredictResponse

# Rang de sévérité pour arbitrer entre plusieurs déclencheurs simultanés
_RANG_GRAVITE = {"Faible": 0, "Modere": 1, "Eleve": 2, "Critique": 3}


def _plus_grave(a: str, b: str) -> str:
    return a if _RANG_GRAVITE.get(a, 0) >= _RANG_GRAVITE.get(b, 0) else b


def affiner_avec_resultats(
    base: PredictResponse,
    labo: LabImagingResultsData,
) -> PredictResponse:
    """
    Prend la prédiction IA de base (calculée au triage, sur les seules
    constantes vitales/symptômes) et l'affine à partir des résultats
    d'examens biologiques/imagerie reçus depuis le radiologue et le
    biologiste. Retourne une nouvelle PredictResponse enrichie.
    """
    service = base.recommended_service
    risque_deterioration = base.deterioration_risk
    duree_sejour = base.estimated_length_of_stay
    protocoles: List[str] = list(base.recommended_protocols)
    conseils_patient: List[str] = list(base.patient_recommendations)
    facteurs_risque: List[str] = list(base.identified_risk_factors)
    nouvelles_features: List[FeatureContribution] = []

    declencheurs: List[str] = []

    # --- Sepsis / choc septique (combinaison CRP ou PCT + lactate + leucocytes) ---
    sepsis_biologique = (
        (labo.crp is not None and labo.crp >= 100)
        or (labo.procalcitonine is not None and labo.procalcitonine >= 2)
    )
    hypoperfusion = labo.lactate is not None and labo.lactate >= 2
    anomalie_leucocytaire = labo.leucocytes is not None and (labo.leucocytes >= 12 or labo.leucocytes < 4)

    if sepsis_biologique and hypoperfusion:
        gravite = "Critique" if (labo.lactate or 0) >= 4 else "Eleve"
        risque_deterioration = _plus_grave(risque_deterioration, gravite)
        service = "Reanimation"
        duree_sejour += 96 if gravite == "Critique" else 48
        protocoles += [
            "Antibiothérapie probabiliste à large spectre en urgence",
            "Remplissage vasculaire (cristalloïdes, 30 mL/kg sur 3h)",
            "Oxygénothérapie et surveillance scope continue",
            "Dosage du lactate répété à H2",
        ]
        conseils_patient += [
            "Hospitalisation en urgence nécessaire",
            "Surveillance médicale continue en unité de soins intensifs",
        ]
        facteurs_risque.append("Suspicion de sepsis sévère / choc septique (biologie + lactate élevé)")
        declencheurs.append("sepsis")
        nouvelles_features.append(FeatureContribution(
            feature="Marqueurs infectieux + lactate",
            value=f"CRP={labo.crp}, PCT={labo.procalcitonine}, lactate={labo.lactate}",
            impact=0.9, direction="positive",
        ))
    elif sepsis_biologique and anomalie_leucocytaire:
        risque_deterioration = _plus_grave(risque_deterioration, "Eleve")
        duree_sejour += 24
        protocoles += [
            "Antibiothérapie adaptée après prélèvements bactériologiques",
            "Surveillance biologique de contrôle à 48h",
        ]
        facteurs_risque.append("Syndrome infectieux biologique (CRP/PCT élevés + anomalie leucocytaire)")
        declencheurs.append("infection")

    # --- Syndrome coronarien aigu (troponine positive) ---
    if labo.troponine is not None and labo.troponine >= 14:
        risque_deterioration = _plus_grave(risque_deterioration, "Eleve" if labo.troponine < 100 else "Critique")
        service = "Cardiologie" if service not in ("Reanimation",) else service
        duree_sejour += 48
        protocoles += [
            "ECG 18 dérivations répété",
            "Avis cardiologique urgent",
            "Surveillance scope continue",
        ]
        conseils_patient.append("Repos strict, éviter tout effort en attendant l'avis cardiologique")
        facteurs_risque.append(f"Troponine élevée ({labo.troponine} ng/L) — souffrance myocardique")
        declencheurs.append("sca")
        nouvelles_features.append(FeatureContribution(
            feature="Troponine", value=f"{labo.troponine} ng/L", impact=0.85, direction="positive",
        ))

    # --- Insuffisance rénale ---
    if labo.creatinine is not None and labo.creatinine >= 15:
        gravite = "Eleve" if labo.creatinine < 20 else "Critique"
        risque_deterioration = _plus_grave(risque_deterioration, gravite)
        if service not in ("Reanimation", "Cardiologie"):
            service = "Nephrologie"
        duree_sejour += 24
        protocoles += ["Bilan rénal complet", "Adaptation posologique des traitements néphrotoxiques"]
        facteurs_risque.append(f"Créatinine élevée ({labo.creatinine} mg/L) — atteinte rénale")
        declencheurs.append("renal")

    # --- Anémie ---
    if labo.hemoglobine is not None and labo.hemoglobine < 8:
        risque_deterioration = _plus_grave(risque_deterioration, "Eleve")
        protocoles.append("Transfusion à discuter selon tolérance clinique")
        facteurs_risque.append(f"Anémie sévère (Hb={labo.hemoglobine} g/dL)")
        declencheurs.append("anemie")

    # --- Anomalie d'imagerie ---
    if labo.imagerie_anomalie:
        risque_deterioration = _plus_grave(risque_deterioration, "Modere")
        detail = labo.imagerie_details or "anomalie non précisée"
        facteurs_risque.append(f"Anomalie détectée à l'imagerie : {detail}")
        conseils_patient.append("Suivi spécialisé recommandé en lien avec l'anomalie radiologique identifiée")
        declencheurs.append("imagerie")

    if not declencheurs:
        conseils_patient.append("Résultats des examens complémentaires rassurants : poursuite de la surveillance standard")

    resume = _construire_resume(declencheurs, labo)

    explication = AIExplanation(
        method="Regles cliniques (SFMU) + Machine Learning",
        summary=resume,
        top_features=(base.ai_explanation.top_features + nouvelles_features)[:8],
    )

    return base.model_copy(update={
        "recommended_service": service,
        "deterioration_risk": risque_deterioration,
        "estimated_length_of_stay": duree_sejour,
        "recommended_protocols": protocoles,
        "patient_recommendations": conseils_patient,
        "identified_risk_factors": facteurs_risque,
        "ai_explanation": explication,
    })


def _construire_resume(declencheurs: List[str], labo: LabImagingResultsData) -> str:
    if not declencheurs:
        return "Aucun signe de gravité identifié dans les résultats biologiques/imagerie saisis."

    libelles = {
        "sepsis": "suspicion de sepsis sévère (marqueurs infectieux élevés associés à une hypoperfusion tissulaire)",
        "infection": "syndrome infectieux biologique significatif",
        "sca": "souffrance myocardique évoquant un syndrome coronarien aigu",
        "renal": "atteinte de la fonction rénale",
        "anemie": "anémie sévère",
        "imagerie": "anomalie radiologique significative",
    }
    parties = [libelles[d] for d in declencheurs if d in libelles]
    return "Analyse complémentaire basée sur les résultats reçus : " + "; ".join(parties) + "."
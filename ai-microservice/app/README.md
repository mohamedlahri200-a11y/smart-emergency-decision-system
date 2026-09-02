# CHU Mohammed VI Oujda — Microservice IA d'Aide à la Décision Médicale

Microservice d'Intelligence Artificielle destiné aux urgences du CHU
Mohammed VI d'Oujda. Il fournit, via une API REST JSON, des
recommandations de triage, d'orientation, d'examens et d'analyses,
sans jamais remplacer la décision médicale du praticien.

## Installation

```bash
python3.12 -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

## Entraînement des modèles

```bash
python -m app.training.train --n-patients 100000
```

Cette commande :
1. Génère un dataset synthétique de 100 000 patients (11 profils cliniques + Bleu/Vert non urgents).
2. Applique une validation médicale stricte (`validate_and_clean_dataset`) : suppression des doublons, des incohérences physiologiques (ex. PAS <= PAD), clipping des bornes vitales.
3. Produit un rapport de qualité (`datasets/dataset_quality_report.json`).
4. Entraîne et compare RandomForest / GradientBoosting / ExtraTrees / XGBoost (ou leurs équivalents Regressor) pour chaque module, sauvegarde le meilleur dans `saved_models/`.

## Lancement du serveur

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Documentation interactive : `http://localhost:8000/docs`

## Endpoints

| Méthode | Route                  | Description                                  |
|---------|-------------------------|-----------------------------------------------|
| GET     | `/api/v1/health`         | État de santé du microservice                |
| POST    | `/api/v1/predict`        | Prédiction IA complète pour un patient        |
| GET     | `/api/v1/metrics`        | Métriques de performance des modèles          |
| GET     | `/api/v1/dashboard`      | Statistiques agrégées temps réel              |
| GET     | `/api/v1/model-info`     | Informations sur les modèles en production    |
| POST    | `/api/v1/retrain`        | Déclenche le réentraînement                   |
| POST    | `/api/v1/feedback`       | Enregistre la validation d'un médecin         |

## Architecture

Clean Architecture en 5 couches : `api/` (présentation) → `services/`
(logique métier) → `models/` (accès aux modèles ML) → `schemas/`
(contrats de données) → `core/` (configuration, constantes,
exceptions, indépendant du reste).

## Avertissement médical

Ce système ne fournit que des **recommandations**. Toute décision
clinique finale reste sous la responsabilité exclusive du médecin
urgentiste.
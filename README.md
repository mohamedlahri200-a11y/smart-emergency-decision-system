# Smart Emergency Decision System

## 📌 Présentation

**Smart Emergency Decision System** est une plateforme intelligente d'aide à la décision destinée à améliorer la prise en charge des patients au sein d'un service d'urgences médicales.

Le projet a été réalisé dans le cadre d'un projet de stage au **CHU Mohammed VI d'Oujda**.

L'objectif principal est de proposer une solution permettant de centraliser les informations du patient et d'assister les professionnels de santé dans certaines étapes du parcours de prise en charge, notamment le triage, l'orientation et l'aide à la décision médicale.

> ⚠️ Ce projet constitue un système d'aide à la décision et ne remplace pas le jugement ni la responsabilité des professionnels de santé.

---

## 🎯 Problématique

Dans un service d'urgences, les professionnels de santé doivent rapidement évaluer les patients et déterminer leur niveau de priorité.

La gestion manuelle des informations et l'absence d'outils intelligents intégrés peuvent entraîner :

* des délais dans l'évaluation des patients ;
* des difficultés dans la priorisation ;
* une circulation moins fluide de l'information ;
* une difficulté à exploiter certaines données médicales ;
* une charge de travail importante pour le personnel.

Le projet propose donc une plateforme numérique intégrant des fonctionnalités d'intelligence artificielle afin d'apporter une assistance dans le processus de prise en charge.

---

## 🚀 Objectifs

Les principaux objectifs du système sont :

* Centraliser les informations des patients.
* Faciliter l'enregistrement des patients aux urgences.
* Assister le personnel infirmier dans le triage.
* Estimer automatiquement le niveau de priorité.
* Proposer une orientation vers un service hospitalier.
* Fournir des recommandations basées sur les données disponibles.
* Faciliter le suivi du parcours du patient.
* Permettre l'exploitation des données pour le pilotage du service.
* Intégrer des modèles de Machine Learning dans une architecture distribuée.
* Fournir des explications aux prédictions de l'IA lorsque cela est possible.

---

## 🏥 Fonctionnalités principales

### 👩‍⚕️ Infirmier d'accueil

Le module infirmier permet notamment :

* l'enregistrement d'un nouveau patient ;
* la saisie des informations administratives ;
* la saisie du mode d'arrivée ;
* la saisie des symptômes ;
* la saisie des signes vitaux ;
* l'évaluation initiale ;
* le lancement de l'évaluation intelligente ;
* la transmission des informations au médecin.

### 🩺 Médecin urgentiste

Le médecin peut :

* consulter les patients ;
* consulter les informations de triage ;
* consulter les recommandations de l'IA ;
* consulter les examens recommandés ;
* suivre l'évolution du patient ;
* gérer les consultations ;
* gérer les prescriptions ;
* consulter les décisions générées par le système.

### 🧪 Biologiste médical

Le module permet notamment :

* la consultation des analyses demandées ;
* la gestion des résultats ;
* l'assistance à l'interprétation des informations disponibles.

### 🩻 Radiologue

Le module radiologie permet :

* la consultation des examens d'imagerie ;
* la gestion des examens ;
* l'utilisation d'un module d'analyse assistée par IA ;
* la génération d'informations pouvant assister le professionnel.

### 📊 Chef du service des urgences

Le tableau de bord permet notamment de consulter :

* les statistiques du service ;
* les indicateurs de performance ;
* les patients pris en charge ;
* la répartition des niveaux de priorité ;
* les alertes ;
* certaines analyses liées à l'activité du service ;
* les recommandations générées par le système.

---

## 🤖 Intelligence artificielle

L'architecture IA est développée en **Python** et exposée sous forme de microservice REST avec **FastAPI**.

Le système peut intégrer différents modèles destinés notamment à :

* la prédiction du niveau de triage ;
* l'orientation du patient ;
* la recommandation d'examens ;
* la recommandation d'analyses ;
* l'évaluation de certains risques ;
* l'estimation de certains indicateurs liés au parcours du patient ;
* l'analyse d'imagerie médicale dans le module dédié.

Des techniques d'explicabilité telles que **SHAP** peuvent également être utilisées afin de mieux comprendre certains résultats produits par les modèles.

---

## 🏗️ Architecture

Le projet repose sur une architecture composée de trois parties principales :

```text
                    ┌─────────────────────────┐
                    │       React Frontend    │
                    │     TypeScript / MUI    │
                    │                         │
                    │   Port : 5173           │
                    └────────────┬────────────┘
                                 │
                                 │ REST API
                                 ▼
                    ┌─────────────────────────┐
                    │    Spring Boot Backend  │
                    │          Java            │
                    │                         │
                    │   Port : 8080           │
                    └────────────┬────────────┘
                                 │
                     ┌───────────┴───────────┐
                     │                       │
                     ▼                       ▼
          ┌──────────────────┐     ┌──────────────────┐
          │      MySQL       │     │   FastAPI / IA   │
          │                  │     │                  │
          │ Données métier   │     │ Machine Learning │
          │                  │     │                  │
          └──────────────────┘     │ Port : 8000      │
                                   └──────────────────┘
```

---

## 🛠️ Technologies utilisées

### Frontend

* React
* TypeScript
* Vite
* Material UI
* React Router
* Axios
* Redux Toolkit
* React Hook Form
* Tailwind CSS

### Backend

* Java
* Spring Boot
* Spring Data JPA
* Spring Security
* JWT
* Maven
* REST API
* Hibernate

### Intelligence artificielle

* Python
* FastAPI
* Uvicorn
* Scikit-learn
* XGBoost
* Pandas
* NumPy
* Joblib
* SHAP

### Base de données

* MySQL

### Outils

* IntelliJ IDEA
* Visual Studio Code
* Git
* GitHub
* WAMP

---

## 📂 Structure du projet

```text
smart-emergency-decision-system/
│
├── ai-microservice/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── training/
│   │   └── utils/
│   │
│   ├── datasets/
│   └── requirements.txt
│
├── app-backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   │
│   ├── pom.xml
│   └── mvnw
│
├── app-fronted/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Installation

### 1. Cloner le projet

```bash
git clone https://github.com/mohamedlahri200-a11y/smart-emergency-decision-system.git
cd smart-emergency-decision-system
```

### 2. Backend Spring Boot

Accéder au dossier :

```bash
cd app-backend
```

Puis lancer :

```bash
./mvnw spring-boot:run
```

Sous Windows :

```powershell
.\mvnw.cmd spring-boot:run
```

Le backend est disponible sur :

```text
http://localhost:8080
```

### 3. Microservice IA

Accéder au dossier :

```powershell
cd ai-microservice
```

Créer et activer l'environnement virtuel :

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Installer les dépendances :

```powershell
pip install -r requirements.txt
```

Lancer FastAPI :

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Le microservice IA est disponible sur :

```text
http://localhost:8000
```

### 4. Frontend React

Accéder au frontend :

```powershell
cd app-fronted
```

Installer les dépendances :

```powershell
npm install
```

Lancer le serveur de développement :

```powershell
npm run dev
```

Le frontend est disponible sur :

```text
http://localhost:5173
```

---

## 🔗 Communication entre les services

Le frontend communique avec le backend Spring Boot via des API REST.

Le backend Spring Boot communique avec le microservice IA FastAPI afin d'envoyer les données nécessaires aux modèles de Machine Learning et de récupérer leurs résultats.

```text
React
  │
  │ HTTP / REST
  ▼
Spring Boot
  │
  │ HTTP / REST
  ▼
FastAPI
  │
  ▼
Machine Learning Models
```

---

## 🔐 Sécurité

Le backend utilise notamment :

* Spring Security ;
* authentification JWT ;
* gestion des rôles ;
* filtrage des requêtes ;
* contrôle d'accès aux différentes fonctionnalités.

Les informations sensibles et les fichiers de configuration locaux ne doivent pas être versionnés dans Git.

---

## 📈 Perspectives

Plusieurs améliorations peuvent être envisagées :

* amélioration continue des modèles de Machine Learning ;
* ajout de nouveaux modèles prédictifs ;
* amélioration de l'explicabilité des prédictions ;
* intégration de nouveaux modèles d'imagerie médicale ;
* amélioration des tableaux de bord ;
* ajout de mécanismes de monitoring des modèles ;
* amélioration de la traçabilité des décisions ;
* déploiement dans un environnement cloud ;
* conteneurisation avec Docker ;
* mise en place d'une architecture CI/CD.

---

## ⚠️ Avertissement

Ce projet est développé dans un contexte académique et de stage.

Les prédictions et recommandations générées par les modèles d'intelligence artificielle sont destinées à fournir une **assistance à la décision** et ne doivent pas être considérées comme un diagnostic médical ou comme un remplacement de l'expertise d'un professionnel de santé.

---

## 👨‍💻 Auteur

**Mohamed Lahri**

Projet réalisé dans le cadre d'un stage au **CHU Mohammed VI d'Oujda**.

---

## 📄 Licence

Ce projet est destiné à un usage académique et de démonstration.

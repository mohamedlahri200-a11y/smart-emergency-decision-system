import {
    MedicalServices,
    Science,
    LocalHospital,
    AdminPanelSettings,
    MonitorHeart
} from "@mui/icons-material";

import { Metier } from "./landing.types";

export const metiers: Metier[] = [
    {
        id: 1,
        title: "Infirmier d'accueil",
        description: "Accueil des patients, triage et collecte des constantes vitales.",
        image: "/images/infirmier.jpg",
        icon: <MonitorHeart />,
        color: "#1976D2",
        features: [
            "Création du dossier patient",
            "Triage",
            "Constantes vitales",
            "Évaluation initiale",
            "Transmission au médecin"
        ]
    },
    {
        id: 2,
        title: "Médecin urgentiste",
        description: "Diagnostic médical assisté par Intelligence Artificielle.",
        image: "/images/medecin.jpg",
        icon: <MedicalServices />,
        color: "#2E7D32",
        features: [
            "Consultation",
            "Diagnostic",
            "Prescription",
            "Décision médicale",
            "Aide IA"
        ]
    },
    {
        id: 3,
        title: "Biologiste médical",
        description: "Gestion et validation des analyses biologiques.",
        image: "/images/laboratoire.jpg",
        icon: <Science />,
        color: "#8E24AA",
        features: [
            "Prélèvements",
            "Validation",
            "Interprétation",
            "Transmission",
            "Suivi"
        ]
    },
    {
        id: 4,
        title: "Radiologue",
        description: "Gestion des examens d'imagerie médicale.",
        image: "/images/radiologie.jpg",
        icon: <LocalHospital />,
        color: "#EF6C00",
        features: [
            "Radiographie",
            "Scanner",
            "IRM",
            "Échographie",
            "Compte rendu"
        ]
    },
    {
        id: 5,
        title: "Chef du service",
        description: "Pilotage et suivi des performances du service des urgences.",
        image: "/images/dashboard.jpg",
        icon: <AdminPanelSettings />,
        color: "#D32F2F",
        features: [
            "Statistiques",
            "KPI",
            "Gestion des équipes",
            "Performance",
            "Reporting"
        ]
    }
];

export const aiFeatures = [
    "Triage intelligent",
    "Orientation hospitalière",
    "Prédiction des analyses biologiques",
    "Prédiction des examens radiologiques",
    "Prédiction des médicaments",
    "Recommandations médicales",
    "Suivi en temps réel",
    "Traçabilité complète",
    "Collaboration entre services",
    "Décision assistée par IA"
];
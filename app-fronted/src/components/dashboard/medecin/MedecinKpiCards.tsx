// src/components/dashboard/medecin/MedecinKpiCards.tsx
import React from "react";
import {
    HourglassBottomRounded,
    CheckCircleRounded,
    WarningAmberRounded,
    LocalHospitalRounded,
    ExitToAppRounded,
    AccessTimeRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { MedecinDashboardStats } from "../../../types/medecin.types";
import StatCardsGrid, { type StatCardData } from "../shared/StatCardsGrid";

interface Props {
    stats: MedecinDashboardStats;
}

const MedecinKpiCards: React.FC<Props> = ({ stats }) => {
    const navigate = useNavigate();

    const cards: StatCardData[] = [
        {
            label: "En attente de consultation",
            value: stats.enAttenteConsultation,
            icon: <HourglassBottomRounded />,
            color: "#F2A93B",
            onClick: () => navigate("/dashboard/medecin/patients"),
        },
        {
            label: "Déjà pris en charge",
            value: stats.prisEnCharge,
            icon: <CheckCircleRounded />,
            color: "#2E7D32",
            onClick: () => navigate("/dashboard/medecin/historique?statut=VALIDEE"),
        },
        {
            label: "Cas critiques",
            value: stats.casCritiques,
            icon: <WarningAmberRounded />,
            color: "#D32F2F",
            accentue: stats.casCritiques > 0,
            onClick: () => navigate("/dashboard/medecin/patients?priorite=Rouge"),
        },
        {
            label: "Nécessitant hospitalisation",
            value: stats.necessitantHospitalisation,
            icon: <LocalHospitalRounded />,
            color: "#0D47A1",
            onClick: () => navigate("/dashboard/medecin/historique?statut=VALIDEE"),
        },
        {
            label: "Sorties aujourd'hui",
            value: stats.sortiesAujourdHui,
            icon: <ExitToAppRounded />,
            color: "#546E7A",
        },
        {
            label: "Temps d'attente moyen",
            value: stats.tempsAttenteMoyenMinutes !== null ? `${stats.tempsAttenteMoyenMinutes} min` : "—",
            icon: <AccessTimeRounded />,
            color: "#8E24AA",
        },
    ];

    return <StatCardsGrid cards={cards} />;
};

export default MedecinKpiCards;

// src/components/dashboard/biologiste/BiologisteKpiCards.tsx
import React from "react";
import {
    HourglassBottomRounded, PendingActionsRounded, CheckCircleRounded,
    WarningAmberRounded, AccessTimeRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { ExamenDashboardStats } from "../../../types/examen.types";
import StatCardsGrid, { type StatCardData } from "../shared/StatCardsGrid";

interface Props {
    stats: ExamenDashboardStats;
}

const BiologisteKpiCards: React.FC<Props> = ({ stats }) => {
    const navigate = useNavigate();

    const cards: StatCardData[] = [
        {
            label: "Analyses en attente",
            value: stats.enAttente,
            icon: <HourglassBottomRounded />,
            color: "#F2A93B",
            onClick: () => navigate("/dashboard/biologiste/analyses"),
        },
        {
            label: "En cours de traitement",
            value: stats.enCours,
            icon: <PendingActionsRounded />,
            color: "#0D47A1",
            onClick: () => navigate("/dashboard/biologiste/analyses"),
        },
        {
            label: "Résultats validés aujourd'hui",
            value: stats.terminesAujourdHui,
            icon: <CheckCircleRounded />,
            color: "#2E7D32",
            onClick: () => navigate("/dashboard/biologiste/historique"),
        },
        {
            label: "Cas prioritaires",
            value: stats.casPrioritaires,
            icon: <WarningAmberRounded />,
            color: "#D32F2F",
            accentue: stats.casPrioritaires > 0,
            onClick: () => navigate("/dashboard/biologiste/analyses"),
        },
        {
            label: "Temps moyen de traitement",
            value: stats.tempsMoyenTraitementMinutes !== null ? `${stats.tempsMoyenTraitementMinutes} min` : "—",
            icon: <AccessTimeRounded />,
            color: "#8E24AA",
        },
    ];

    return <StatCardsGrid cards={cards} />;
};

export default BiologisteKpiCards;
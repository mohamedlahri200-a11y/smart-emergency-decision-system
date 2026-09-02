// src/components/dashboard/radiologue/RadiologueKpiCards.tsx
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

const RadiologueKpiCards: React.FC<Props> = ({ stats }) => {
    const navigate = useNavigate();

    const cards: StatCardData[] = [
        {
            label: "Examens en attente",
            value: stats.enAttente,
            icon: <HourglassBottomRounded />,
            color: "#F2A93B",
            onClick: () => navigate("/dashboard/radiologue/examens"),
        },
        {
            label: "En cours de réalisation",
            value: stats.enCours,
            icon: <PendingActionsRounded />,
            color: "#0D47A1",
            onClick: () => navigate("/dashboard/radiologue/examens"),
        },
        {
            label: "Terminés aujourd'hui",
            value: stats.terminesAujourdHui,
            icon: <CheckCircleRounded />,
            color: "#2E7D32",
            onClick: () => navigate("/dashboard/radiologue/historique"),
        },
        {
            label: "Cas prioritaires",
            value: stats.casPrioritaires,
            icon: <WarningAmberRounded />,
            color: "#D32F2F",
            accentue: stats.casPrioritaires > 0,
            onClick: () => navigate("/dashboard/radiologue/examens"),
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

export default RadiologueKpiCards;
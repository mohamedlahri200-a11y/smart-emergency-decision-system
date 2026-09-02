// src/
// src/components/dashboard/infirmier/KpiCards.tsx
import React from "react";
import { Grid, Paper, Box, Typography } from "@mui/material";
import {
    PeopleAltRounded,
    HourglassBottomRounded,
    CheckCircleRounded,
    WarningAmberRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { keyframes } from "@mui/material/styles";
import type { InfirmierDashboardStats } from "../../../types/infirmier.types";

interface Props {
    stats: InfirmierDashboardStats;
}

const criticalPulse = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.4); }
    50%      { box-shadow: 0 0 0 8px rgba(211, 47, 47, 0); }
`;

const KpiCards: React.FC<Props> = ({ stats }) => {
    const navigate = useNavigate();

    const cards = [
        { label: "Patients aujourd'hui", value: stats.totalAujourdHui, icon: <PeopleAltRounded />, color: "#0D47A1", onClick: () => navigate("/dashboard/infirmier/patients") },
        { label: "En attente du médecin", value: stats.enAttenteMedecin, icon: <HourglassBottomRounded />, color: "#F2A93B", onClick: () => navigate("/dashboard/infirmier/historique?statut=EN_ATTENTE") },
        { label: "Déjà pris en charge", value: stats.prisEnCharge, icon: <CheckCircleRounded />, color: "#2E7D32", onClick: () => navigate("/dashboard/infirmier/historique?statut=VALIDEE") },
        { label: "Cas critiques", value: stats.casCritiques, icon: <WarningAmberRounded />, color: "#D32F2F", critical: stats.casCritiques > 0, onClick: () => navigate("/dashboard/infirmier/historique?priorite=Rouge") },
    ];

    return (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {cards.map((c) => (
                <Grid item xs={12} sm={6} md={3} key={c.label}>
                    <Paper
                        onClick={c.onClick}
                        sx={{
                            p: 2.5, display: "flex", alignItems: "center", gap: 2, borderRadius: 4, cursor: "pointer",
                            border: c.critical ? "1.5px solid #D32F2F" : "1.5px solid transparent",
                            transition: "transform 0.15s, box-shadow 0.15s",
                            animation: c.critical ? `${criticalPulse} 2s infinite` : "none",
                            "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
                        }}
                    >
                        <Box sx={{ width: 52, height: 52, borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: `${c.color}1A`, color: c.color }}>
                            {c.icon}
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight={800} color={c.critical ? "#D32F2F" : "inherit"}>{c.value}</Typography>
                            <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                        </Box>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
};

export default KpiCards;
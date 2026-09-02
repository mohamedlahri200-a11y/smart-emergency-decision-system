// src/components/dashboard/chef-service/ChefServiceKpiCards.tsx
import React from "react";
import { Grid, Paper, Box, Typography } from "@mui/material";
import {
    PeopleAltRounded, PersonAddAlt1Rounded, HourglassBottomRounded,
    LocalHospitalRounded, ExitToAppRounded, WarningAmberRounded,
} from "@mui/icons-material";
import type { ChefServiceStats } from "../../../types/chefService.types";

interface Props {
    stats: ChefServiceStats;
}

const ChefServiceKpiCards: React.FC<Props> = ({ stats }) => {
    const cards = [
        { label: "Patients dans le service", value: stats.totalPatients, icon: <PeopleAltRounded />, color: "#0D47A1" },
        { label: "Admissions aujourd'hui", value: stats.admissionsAujourdHui, icon: <PersonAddAlt1Rounded />, color: "#546E7A" },
        { label: "En attente de consultation", value: stats.enAttenteConsultation, icon: <HourglassBottomRounded />, color: "#F2A93B" },
        { label: "Hospitalisés", value: stats.hospitalises, icon: <LocalHospitalRounded />, color: "#8E24AA" },
        { label: "Sorties aujourd'hui", value: stats.sortiesAujourdHui, icon: <ExitToAppRounded />, color: "#2E7D32" },
        { label: "Cas critiques en cours", value: stats.casCritiques, icon: <WarningAmberRounded />, color: "#D32F2F" },
    ];

    return (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {cards.map((c) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={c.label}>
                    <Paper sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2, borderRadius: 4, height: "100%" }}>
                        <Box sx={{ width: 52, height: 52, borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: `${c.color}1A`, color: c.color, flexShrink: 0 }}>
                            {c.icon}
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight={800}>{c.value}</Typography>
                            <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                        </Box>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
};

export default ChefServiceKpiCards;

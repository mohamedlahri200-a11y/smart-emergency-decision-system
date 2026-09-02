
// src/components/dashboard/chef-service/PerformanceServicePanel.tsx
import React from "react";
import { Paper, Typography, Stack, Box } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { SpeedRounded } from "@mui/icons-material";

interface Props {
    tempsMoyenTriageMinutes: number | null;
    tempsMoyenAvantConsultationMinutes: number | null;
    tempsMoyenAvantResultatExamenMinutes: number | null;
    tempsMoyenAvantSortieMinutes: number | null;
}

const formatDuree = (minutes: number | null): string => {
    if (minutes === null) return "—";
    if (minutes < 60) return `${minutes} min`;
    const heures = Math.floor(minutes / 60);
    const reste = minutes % 60;
    return `${heures} h ${reste > 0 ? `${reste} min` : ""}`.trim();
};

const Indicateur: React.FC<{ label: string; valeur: string }> = ({ label, valeur }) => (
    <Box sx={{ textAlign: "center", p: 2 }}>
        <Typography variant="h4" fontWeight={800} color="primary">{valeur}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
    </Box>
);

const PerformanceServicePanel: React.FC<Props> = (props) => {
    return (
        <Paper sx={{ p: 2.5, borderRadius: 4, mb: 3 }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <SpeedRounded color="primary" />
                <Typography variant="h6" fontWeight={800}>Performance du service</Typography>
            </Stack>
            <Grid container>
                <Grid size={{ xs: 6, sm: 3 }}><Indicateur label="Temps moyen de triage" valeur={formatDuree(props.tempsMoyenTriageMinutes)} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Indicateur label="Avant 1ère décision médicale" valeur={formatDuree(props.tempsMoyenAvantConsultationMinutes)} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Indicateur label="Avant résultat d'examen" valeur={formatDuree(props.tempsMoyenAvantResultatExamenMinutes)} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Indicateur label="Avant sortie" valeur={formatDuree(props.tempsMoyenAvantSortieMinutes)} /></Grid>
            </Grid>
        </Paper>
    );
};

export default PerformanceServicePanel;
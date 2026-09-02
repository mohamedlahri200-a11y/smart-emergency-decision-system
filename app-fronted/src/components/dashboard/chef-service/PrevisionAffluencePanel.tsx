// src/components/dashboard/chef-service/PrevisionAffluencePanel.tsx
import React from "react";
import { Paper, Typography, Stack, Box, Chip, Alert } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { TimelineRounded } from "@mui/icons-material";

interface Props {
    estimationProchaines2h: number;
    arriveesAujourdHui: number;
    estimationDemain: number;
    jourLePlusChargeLabel: string | null;
    heuresCritiques: number[];
}

const Indicateur: React.FC<{ label: string; valeur: React.ReactNode }> = ({ label, valeur }) => (
    <Box sx={{ textAlign: "center", p: 2 }}>
        <Typography variant="h4" fontWeight={800} color="primary">{valeur}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
    </Box>
);

const PrevisionAffluencePanel: React.FC<Props> = (props) => {
    return (
        <Paper sx={{ p: 2.5, borderRadius: 4, mb: 3 }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <TimelineRounded color="primary" />
                <Typography variant="h6" fontWeight={800}>Prévision d'affluence (estimation statistique)</Typography>
            </Stack>
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                Estimation basée sur la moyenne des arrivées historiques par tranche horaire et jour de semaine —
                pas un modèle prédictif entraîné. La fiabilité s'améliore avec le volume de données accumulées.
            </Alert>

            <Grid container>
                <Grid size={{ xs: 6, sm: 3 }}><Indicateur label="Estimation (2 prochaines heures)" valeur={props.estimationProchaines2h} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Indicateur label="Arrivées aujourd'hui" valeur={props.arriveesAujourdHui} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Indicateur label="Estimation demain" valeur={props.estimationDemain} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Indicateur label="Jour le plus chargé" valeur={props.jourLePlusChargeLabel ?? "—"} /></Grid>
            </Grid>

            {props.heuresCritiques.length > 0 && (
                <Box sx={{ mt: 1, pt: 2, borderTop: "1px dashed #E7ECF3" }}>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Heures historiquement critiques</Typography>
                    <Stack direction="row" gap={1}>
                        {props.heuresCritiques.map((h) => (
                            <Chip key={h} size="small" label={`${h}h - ${h + 1}h`} color="warning" variant="outlined" />
                        ))}
                    </Stack>
                </Box>
            )}
        </Paper>
    );
};

export default PrevisionAffluencePanel;
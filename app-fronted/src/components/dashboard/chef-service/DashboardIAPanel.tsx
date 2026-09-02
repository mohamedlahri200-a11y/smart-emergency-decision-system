// src/components/dashboard/chef-service/DashboardIAPanel.tsx
import React from "react";
import { Paper, Typography, Stack, Box, LinearProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { AutoAwesomeRounded } from "@mui/icons-material";

interface Props {
    totalPredictions: number;
    tauxValidationPourcent: number | null;
    nbPredictionsCorrectes: number;
    nbPredictionsModifiees: number;
    nbPredictionsRejetees: number;
    nbEnAttente: number;
    scoreConfianceMoyenPourcent: number | null;
}

const Indicateur: React.FC<{ label: string; valeur: React.ReactNode; couleur?: string }> = ({ label, valeur, couleur }) => (
    <Box sx={{ textAlign: "center", p: 2 }}>
        <Typography variant="h4" fontWeight={800} sx={{ color: couleur ?? "primary.main" }}>{valeur}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
    </Box>
);

const DashboardIAPanel: React.FC<Props> = (props) => {
    return (
        <Paper sx={{ p: 2.5, borderRadius: 4, mb: 3, border: "1px solid #E3ECFB", background: "linear-gradient(180deg, #F7FAFF 0%, #FFFFFF 100%)" }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <AutoAwesomeRounded color="primary" />
                <Typography variant="h6" fontWeight={800}>Dashboard IA — Performance du modèle</Typography>
            </Stack>

            <Grid container>
                <Grid size={{ xs: 6, sm: 3 }}><Indicateur label="Prédictions réalisées" valeur={props.totalPredictions} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Indicateur
                        label="Taux de validation"
                        valeur={props.tauxValidationPourcent !== null ? `${props.tauxValidationPourcent}%` : "—"}
                        couleur="#2E7D32"
                    />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Indicateur label="Prédictions validées telles quelles" valeur={props.nbPredictionsCorrectes} couleur="#2E7D32" /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Indicateur label="Modifiées par un médecin" valeur={props.nbPredictionsModifiees} couleur="#B7950B" /></Grid>
            </Grid>

            <Box sx={{ mt: 1, px: 2 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                        Rejetées : {props.nbPredictionsRejetees} · En attente de validation : {props.nbEnAttente}
                    </Typography>
                    {props.scoreConfianceMoyenPourcent !== null && (
                        <Typography variant="caption" color="text.secondary">
                            Confiance moyenne du modèle : {props.scoreConfianceMoyenPourcent}%
                        </Typography>
                    )}
                </Stack>
                {props.tauxValidationPourcent !== null && (
                    <LinearProgress
                        variant="determinate"
                        value={props.tauxValidationPourcent}
                        sx={{ height: 8, borderRadius: 4 }}
                        color={props.tauxValidationPourcent >= 80 ? "success" : props.tauxValidationPourcent >= 50 ? "warning" : "error"}
                    />
                )}
            </Box>
        </Paper>
    );
};

export default DashboardIAPanel;
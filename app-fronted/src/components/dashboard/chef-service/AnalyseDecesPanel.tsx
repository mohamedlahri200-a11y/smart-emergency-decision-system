// src/components/dashboard/chef-service/AnalyseDecesPanel.tsx
import React from "react";
import { Paper, Typography, Stack, Box, Chip } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { WarningAmberRounded } from "@mui/icons-material";

interface Props {
    nbDeces: number;
    heureLaPlusFrequente: number | null;
    dureeMoyenneAvantDecesHeures: number | null;
    facteursRisqueFrequents: { facteur: string; total: number }[];
}

const Indicateur: React.FC<{ label: string; valeur: React.ReactNode }> = ({ label, valeur }) => (
    <Box sx={{ textAlign: "center", p: 2 }}>
        <Typography variant="h4" fontWeight={800} color="#D32F2F">{valeur}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
    </Box>
);

const AnalyseDecesPanel: React.FC<Props> = (props) => {
    if (props.nbDeces === 0) {
        return (
            <Paper sx={{ p: 2.5, borderRadius: 4, mb: 3 }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <WarningAmberRounded color="disabled" />
                    <Typography variant="h6" fontWeight={800}>Analyse des décès</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Aucun décès enregistré sur la période — aucune donnée à analyser.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 2.5, borderRadius: 4, mb: 3, border: "1px solid #FBD5D5" }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <WarningAmberRounded sx={{ color: "#D32F2F" }} />
                <Typography variant="h6" fontWeight={800}>Analyse des décès</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Analyse destinée à l'amélioration de la qualité des soins et des processus, à des fins statistiques.
            </Typography>

            <Grid container>
                <Grid size={{ xs: 6, sm: 4 }}><Indicateur label="Nombre de décès" valeur={props.nbDeces} /></Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                    <Indicateur label="Heure la plus fréquente" valeur={props.heureLaPlusFrequente !== null ? `${props.heureLaPlusFrequente}h` : "—"} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                    <Indicateur label="Durée moyenne avant décès" valeur={props.dureeMoyenneAvantDecesHeures !== null ? `${props.dureeMoyenneAvantDecesHeures} h` : "—"} />
                </Grid>
            </Grid>

            {props.facteursRisqueFrequents.length > 0 && (
                <Box sx={{ mt: 1, pt: 2, borderTop: "1px dashed #FBD5D5" }}>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Facteurs de risque les plus fréquemment identifiés</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                        {props.facteursRisqueFrequents.map((f) => (
                            <Chip key={f.facteur} size="small" label={`${f.facteur} (${f.total})`} sx={{ backgroundColor: "#FDEBEC", color: "#D32F2F" }} />
                        ))}
                    </Stack>
                </Box>
            )}
        </Paper>
    );
};

export default AnalyseDecesPanel;
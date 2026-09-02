// src/components/dashboard/chef-service/QualiteHospitalisationPanel.tsx
import React from "react";
import { Paper, Typography, Stack, Box, Chip } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { HotelRounded, VerifiedRounded } from "@mui/icons-material";

interface Props {
    nbHospitalisations: number;
    servicesLesPlusUtilises: { service: string; total: number }[];
    dureeSejourEstimeeMoyenneHeures: number | null;
    nbCasCritiquesStabilises: number;
    nbCasCritiquesTotal: number;
    tauxStabilisationPourcent: number | null;
    tauxRisqueDeteriorationElevePourcent: number | null;
}

const Indicateur: React.FC<{ label: string; valeur: React.ReactNode; couleur?: string }> = ({ label, valeur, couleur }) => (
    <Box sx={{ textAlign: "center", p: 2 }}>
        <Typography variant="h4" fontWeight={800} sx={{ color: couleur ?? "primary.main" }}>{valeur}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
    </Box>
);

const QualiteHospitalisationPanel: React.FC<Props> = (props) => {
    return (
        <Paper sx={{ p: 2.5, borderRadius: 4, mb: 3 }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <HotelRounded color="primary" />
                <Typography variant="h6" fontWeight={800}>Hospitalisations & indicateurs de qualité</Typography>
            </Stack>

            <Grid container>
                <Grid size={{ xs: 6, sm: 3 }}><Indicateur label="Hospitalisations décidées" valeur={props.nbHospitalisations} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Indicateur label="Durée de séjour estimée" valeur={props.dureeSejourEstimeeMoyenneHeures !== null ? `${props.dureeSejourEstimeeMoyenneHeures} h` : "—"} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Indicateur
                        label="Cas critiques stabilisés"
                        valeur={`${props.nbCasCritiquesStabilises}/${props.nbCasCritiquesTotal}`}
                        couleur="#2E7D32"
                    />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Indicateur
                        label="Taux de stabilisation"
                        valeur={props.tauxStabilisationPourcent !== null ? `${props.tauxStabilisationPourcent}%` : "—"}
                        couleur="#2E7D32"
                    />
                </Grid>
            </Grid>

            {props.servicesLesPlusUtilises.length > 0 && (
                <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #E7ECF3" }}>
                    <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                        <VerifiedRounded fontSize="small" color="primary" />
                        <Typography variant="body2" fontWeight={700}>Services les plus sollicités</Typography>
                    </Stack>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                        {props.servicesLesPlusUtilises.slice(0, 6).map((s) => (
                            <Chip key={s.service} label={`${s.service} (${s.total})`} variant="outlined" size="small" />
                        ))}
                    </Stack>
                </Box>
            )}
        </Paper>
    );
};

export default QualiteHospitalisationPanel;
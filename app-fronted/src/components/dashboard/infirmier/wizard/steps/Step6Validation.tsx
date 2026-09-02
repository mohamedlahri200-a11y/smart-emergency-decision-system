// src/components/dashboard/infirmier/wizard/steps/Step6Validation.tsx
import React from "react";
// Remplacement de Grid par Grid2 pour éliminer les alertes de dépréciation (TS6385)
import Grid from "@mui/material/Grid2";
import { Paper, Typography, Divider, Chip, Alert } from "@mui/material";

// Utilisation de l'alias absolu pour corriger l'erreur TS2307
import type { NewPatientWizardData } from "@/types/infirmier.types";

interface Props {
    data: NewPatientWizardData;
}

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <Grid container size={12} sx={{ py: 0.5 }}>
        <Grid size={5}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Grid>
        <Grid size={7}>
            <Typography variant="body2" fontWeight={600}>{value ?? "—"}</Typography>
        </Grid>
    </Grid>
);

const Step6Validation: React.FC<Props> = ({ data }) => {
    const { administratif, arrivee, evaluationGenerale, signesVitaux, orientationIA } = data;

    return (
        // Utilisation de Grid2 avec la nouvelle propriété de dimensionnement 'size'
        <Grid container spacing={2.5}>
            {evaluationGenerale.detresseVitale && (
                <Grid size={12}>
                    <Alert severity="error" sx={{ borderRadius: 3, fontWeight: 700 }}>
                        Détresse vitale détectée — orientation déchocage confirmée
                    </Alert>
                </Grid>
            )}

            <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: "100%" }}>
                    <Typography fontWeight={800} sx={{ mb: 1 }}>Informations administratives</Typography>
                    <Row label="Patient" value={`${administratif.nom} ${administratif.prenom}`} />
                    <Row label="Date de naissance" value={administratif.dateNaissance} />
                    <Row label="Sexe" value={administratif.sexe} />
                    <Row label="IP" value={administratif.ip} />
                    <Row label="Couverture médicale" value={administratif.couvertureMedicale} />
                    <Row label="Origine" value={administratif.origine} />
                </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: "100%" }}>
                    <Typography fontWeight={800} sx={{ mb: 1 }}>Arrivée & motif</Typography>
                    <Row label="Mode d'arrivée" value={arrivee.modeArrivee} />
                    <Row label="Accompagnement" value={arrivee.accompagnementPro} />
                    <Row label="Motif" value={arrivee.motifConsultation} />
                </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                    <Typography fontWeight={800} sx={{ mb: 1 }}>Signes vitaux</Typography>
                    <Row label="Poids / Taille" value={`${signesVitaux.poids ?? "—"} kg / ${signesVitaux.taille ?? "—"} cm`} />
                    <Row label="FC / FR" value={`${signesVitaux.frequenceCardiaque ?? "—"} / ${signesVitaux.frequenceRespiratoire ?? "—"}`} />
                    <Row label="TA" value={`${signesVitaux.taSystolique ?? "—"}/${signesVitaux.taDiastolique ?? "—"} mmHg`} />
                    <Row label="SpO₂ / Température" value={`${signesVitaux.saturationO2 ?? "—"}% / ${signesVitaux.temperature ?? "—"}°C`} />
                    <Row label="Glasgow / EVA" value={`${signesVitaux.glasgow ?? "—"} / ${signesVitaux.eva ?? "—"}`} />
                </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                    <Typography fontWeight={800} sx={{ mb: 1 }}>Résultat de l'analyse IA</Typography>
                    {orientationIA ? (
                        <>
                            <Divider sx={{ mb: 1 }} />
                            <Chip label={orientationIA.niveauUrgence.replace("_", " ")} color="primary" sx={{ fontWeight: 700, mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">{orientationIA.explication}</Typography>
                        </>
                    ) : (
                        <Typography variant="body2" color="text.secondary">Aucune analyse IA réalisée.</Typography>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default Step6Validation;

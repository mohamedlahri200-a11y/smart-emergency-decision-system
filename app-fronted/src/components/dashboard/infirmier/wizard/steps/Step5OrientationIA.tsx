// src/components/dashboard/infirmier/wizard/steps/Step5OrientationIA.tsx
import React, { useState } from "react";
import { Box, Button, Paper, Typography, CircularProgress, Chip, Alert, Stack } from "@mui/material";
import { AutoAwesomeRounded } from "@mui/icons-material";
import type { Control, UseFormSetValue } from "react-hook-form";
import { isAxiosError } from "axios";

import { CouleurTriage } from "@/types/infirmier.types";
import type { NewPatientWizardData } from "@/types/infirmier.types";
import { decisionIAService } from "@/services/decisionIAService";

interface Props {
    control: Control<NewPatientWizardData>;
    setValue: UseFormSetValue<NewPatientWizardData>;
    getWizardData: () => NewPatientWizardData;
    triageId: number | null;
}

const couleurStyle: Record<CouleurTriage, { bg: string; fg: string }> = {
    [CouleurTriage.ROUGE]: { bg: "#FDEBEC", fg: "#D32F2F" },
    [CouleurTriage.ORANGE]: { bg: "#FEF2E4", fg: "#F2A93B" },
    [CouleurTriage.JAUNE]: { bg: "#FEFBE8", fg: "#B7950B" },
    [CouleurTriage.VERT]: { bg: "#EAF7EE", fg: "#2E7D32" },
    [CouleurTriage.BLEU]: { bg: "#E8F0FE", fg: "#1565C0" },
};

const Step5OrientationIA: React.FC<Props> = ({ setValue, getWizardData, triageId }) => {
    const [loading, setLoading] = useState(false);
    const [erreur, setErreur] = useState("");
    const data = getWizardData();
    const resultat = data.orientationIA;

    const handleAnalyser = async () => {
        if (!triageId) {
            setErreur("Le triage doit d'abord être enregistré avant l'analyse IA.");
            return;
        }
        setLoading(true);
        setErreur("");
        try {
            const result = await decisionIAService.analyser(triageId);
            setValue("orientationIA", result);
            setValue("prioriteFinale", result.niveauUrgence);
        } catch (e) {
            let message = "Impossible de contacter le service d'intelligence artificielle.";
            if (isAxiosError(e)) {
                if (!e.response) {
                    message = "Le backend est-il démarré ? Impossible de le joindre (connexion refusée).";
                } else if (e.response.data) {
                    const data = e.response.data as { message?: string; details?: string[] };
                    if (data.details?.length) {
                        message = data.details.join(" — ");
                    } else if (data.message) {
                        message = data.message;
                    }
                }
            }
            setErreur(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            {!resultat && (
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 4, backgroundColor: "#F5F8FD" }}>
                    <AutoAwesomeRounded sx={{ fontSize: 46, color: "#0D47A1", mb: 1 }} />
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                        Analyse assistée par intelligence artificielle
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        L'IA propose un score de priorité, un niveau d'urgence et une couleur de triage
                        à partir des informations saisies. L'infirmier garde toujours la main pour valider ou modifier.
                    </Typography>
                    <Button variant="contained" size="large" onClick={handleAnalyser} disabled={loading}>
                        {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Analyser avec l'IA"}
                    </Button>
                    {erreur && (
                        <Alert severity="error" sx={{ mt: 2, borderRadius: 3 }}>
                            {erreur}
                        </Alert>
                    )}
                </Paper>
            )}

            {resultat && (
                <Stack spacing={2}>
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Score de priorité</Typography>
                                <Typography variant="h4" fontWeight={800}>{resultat.scorePrediction}/100</Typography>
                            </Box>
                            <Chip
                                label={resultat.niveauUrgence.replace("_", " ")}
                                sx={{
                                    fontWeight: 800,
                                    fontSize: "0.9rem",
                                    px: 1,
                                    backgroundColor: couleurStyle[resultat.couleurTriage].bg,
                                    color: couleurStyle[resultat.couleurTriage].fg,
                                }}
                            />
                            <Chip
                                label={`Couleur : ${resultat.couleurTriage}`}
                                sx={{
                                    fontWeight: 700,
                                    backgroundColor: couleurStyle[resultat.couleurTriage].bg,
                                    color: couleurStyle[resultat.couleurTriage].fg,
                                }}
                            />
                        </Stack>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography fontWeight={700} sx={{ mb: 1 }}>Explication de la décision</Typography>
                        <Typography variant="body2" color="text.secondary">{resultat.explication}</Typography>
                    </Paper>

                    {resultat.alertesActives.length > 0 && (
                        <Alert severity="warning" sx={{ borderRadius: 3 }}>
                            <Typography fontWeight={700}>Alertes actives :</Typography>
                            {resultat.alertesActives.join(", ")}
                        </Alert>
                    )}

                    <Button variant="outlined" onClick={handleAnalyser} disabled={loading} sx={{ alignSelf: "flex-start" }}>
                        Relancer l'analyse
                    </Button>
                </Stack>
            )}
        </Box>
    );
};

export default Step5OrientationIA;

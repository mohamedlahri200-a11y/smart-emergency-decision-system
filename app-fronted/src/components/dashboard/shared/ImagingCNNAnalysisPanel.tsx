// src/components/dashboard/shared/ImagingCNNAnalysisPanel.tsx
import React, { useState } from "react";
import { Box, Button, Typography, Chip, Stack, Alert, LinearProgress, CircularProgress } from "@mui/material";
import { ScienceRounded, WarningAmberRounded } from "@mui/icons-material";

import { examenService, type ImagingAnalysisResponseDTO } from "../../../services/examenService";

interface Props {
    examenId: number;
}

const ImagingCNNAnalysisPanel: React.FC<Props> = ({ examenId }) => {
    const [loading, setLoading] = useState(false);
    const [resultat, setResultat] = useState<ImagingAnalysisResponseDTO | null>(null);
    const [erreur, setErreur] = useState("");

    const handleAnalyser = async () => {
        setLoading(true);
        setErreur("");
        try {
            const data = await examenService.analyserImageAvecCNN(examenId);
            setResultat(data);
        } catch {
            setErreur("Erreur lors de l'analyse d'image. Vérifiez que le microservice IA est démarré.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, border: "1px dashed #B7950B", backgroundColor: "#FFFDF5" }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <ScienceRounded fontSize="small" sx={{ color: "#B7950B" }} />
                <Typography variant="body2" fontWeight={700}>
                    Analyse expérimentale par CNN (démonstration technique)
                </Typography>
            </Stack>

            {!resultat && (
                <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    disabled={loading}
                    onClick={() => void handleAnalyser()}
                    startIcon={loading ? <CircularProgress size={16} /> : undefined}
                >
                    {loading ? "Analyse en cours..." : "Analyser l'image (CNN démo)"}
                </Button>
            )}

            {erreur && <Alert severity="error" sx={{ mt: 1, borderRadius: 2 }}>{erreur}</Alert>}

            {resultat && (
                <Box sx={{ mt: 1 }}>
                    <Alert severity="warning" icon={<WarningAmberRounded />} sx={{ mb: 1.5, borderRadius: 2 }}>
                        {resultat.disclaimer}
                    </Alert>

                    {resultat.modeleDisponible ? (
                        <>
                            <Chip
                                label={`Classe prédite : ${resultat.classePredite} (${Math.round((resultat.confiance ?? 0) * 100)}%)`}
                                color="warning"
                                sx={{ fontWeight: 700, mb: 1.5 }}
                            />
                            <Stack spacing={0.75}>
                                {Object.entries(resultat.probabilites).map(([classe, proba]) => (
                                    <Box key={classe}>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="caption">{classe}</Typography>
                                            <Typography variant="caption" fontWeight={700}>{Math.round(proba * 100)}%</Typography>
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={proba * 100}
                                            sx={{ height: 6, borderRadius: 3, backgroundColor: "#F0EAD6" }}
                                            color="warning"
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        </>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Modèle non disponible côté microservice.
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default ImagingCNNAnalysisPanel;
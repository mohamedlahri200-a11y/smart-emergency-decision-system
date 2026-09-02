// src/components/dashboard/shared/AnalyseComplementaireDialog.tsx
import React, { useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Box, Typography,
    Stack, TextField, Button, Checkbox, FormControlLabel, Alert, CircularProgress, Grid,
} from "@mui/material";
import { CloseRounded, PsychologyRounded, SendRounded } from "@mui/icons-material";

import { decisionIAService, type AnalyseComplementairePayload } from "../../../services/decisionIAService";

interface Props {
    open: boolean;
    onClose: () => void;
    triageId: number | null;
    patientNom: string;
    onSuccess?: () => void;
}

const AnalyseComplementaireDialog: React.FC<Props> = ({ open, onClose, triageId, patientNom, onSuccess }) => {
    const [valeurs, setValeurs] = useState<Record<string, string>>({});
    const [imagerieAnomalie, setImagerieAnomalie] = useState(false);
    const [imagerieDetails, setImagerieDetails] = useState("");
    const [saving, setSaving] = useState(false);
    const [erreur, setErreur] = useState("");

    const champ = (key: string, label: string, unite: string) => (
        <Grid item xs={6} sm={4}>
            <TextField
                fullWidth
                size="small"
                type="number"
                label={label}
                value={valeurs[key] ?? ""}
                onChange={(e) =>
                    setValeurs((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                    }))
                }
                InputProps={{
                    endAdornment: (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                        >
                            {unite}
                        </Typography>
                    ),
                }}
            />
        </Grid>
    );
    const handleAnalyser = async () => {
        if (!triageId) return;
        setSaving(true);
        setErreur("");
        try {
            const payload: AnalyseComplementairePayload = {
                crp: valeurs.crp ? Number(valeurs.crp) : undefined,
                procalcitonine: valeurs.procalcitonine ? Number(valeurs.procalcitonine) : undefined,
                leucocytes: valeurs.leucocytes ? Number(valeurs.leucocytes) : undefined,
                hemoglobine: valeurs.hemoglobine ? Number(valeurs.hemoglobine) : undefined,
                creatinine: valeurs.creatinine ? Number(valeurs.creatinine) : undefined,
                troponine: valeurs.troponine ? Number(valeurs.troponine) : undefined,
                lactate: valeurs.lactate ? Number(valeurs.lactate) : undefined,
                glycemieLabo: valeurs.glycemieLabo ? Number(valeurs.glycemieLabo) : undefined,
                imagerieAnomalie,
                imagerieDetails: imagerieDetails.trim() || undefined,
            };
            await decisionIAService.analyserComplementaire(triageId, payload);
            onSuccess?.();
            onClose();
        } catch {
            setErreur("Erreur lors de l'analyse complémentaire. Vérifiez que le microservice IA est bien démarré.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800 }}>
                Analyse complémentaire IA — {patientNom}
                <IconButton onClick={onClose}><CloseRounded /></IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ backgroundColor: "#F9FBFD" }}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                    <PsychologyRounded color="primary" />
                    <Typography fontWeight={700}>Résultats reçus du radiologue / biologiste</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Saisissez uniquement les valeurs disponibles — les champs vides sont ignorés par l'analyse.
                </Typography>

                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    {champ("crp", "CRP", "mg/L")}
                    {champ("procalcitonine", "Procalcitonine", "ng/mL")}
                    {champ("leucocytes", "Leucocytes", "G/L")}
                    {champ("hemoglobine", "Hémoglobine", "g/dL")}
                    {champ("creatinine", "Créatinine", "mg/L")}
                    {champ("troponine", "Troponine", "ng/L")}
                    {champ("lactate", "Lactate", "mmol/L")}
                    {champ("glycemieLabo", "Glycémie labo", "g/L")}
                </Grid>

                <Box sx={{ pt: 1, borderTop: "1px dashed #D8E0EC" }}>
                    <FormControlLabel
                        control={<Checkbox checked={imagerieAnomalie} onChange={(e) => setImagerieAnomalie(e.target.checked)} />}
                        label="Anomalie détectée à l'imagerie"
                    />
                    {imagerieAnomalie && (
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Description de l'anomalie (ex : foyer de condensation basal droit)"
                            value={imagerieDetails}
                            onChange={(e) => setImagerieDetails(e.target.value)}
                            sx={{ mt: 1 }}
                        />
                    )}
                </Box>

                {erreur && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{erreur}</Alert>}
            </DialogContent>

            <DialogActions sx={{ p: 2.5 }}>
                <Button onClick={onClose} disabled={saving}>Annuler</Button>
                <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <SendRounded />}
                    disabled={saving}
                    onClick={() => void handleAnalyser()}
                >
                    {saving ? "Analyse en cours..." : "Analyser avec l'IA"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AnalyseComplementaireDialog;
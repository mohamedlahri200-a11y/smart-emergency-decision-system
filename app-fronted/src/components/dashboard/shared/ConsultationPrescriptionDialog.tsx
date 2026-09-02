// src/components/dashboard/shared/ConsultationPrescriptionDialog.tsx
import React, { useEffect, useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Box, Typography,
    Stack, TextField, Button, Checkbox, FormControlLabel, Divider, Chip, Alert,
    Select, MenuItem, InputLabel, FormControl, CircularProgress,
} from "@mui/material";
import {
    CloseRounded, ScienceRounded, LocalHospitalRounded, SendRounded,
    CheckCircleRounded, AddCircleOutlineRounded,
} from "@mui/icons-material";

import { consultationService } from "../../../services/consultationService";
import { examenService } from "../../../services/examenService";
import { getStoredUser } from "../../../utils/authUser";
import type { DecisionIAResponseDTO } from "../../../services/decisionIAService";

interface ExamenAPrescrire {
    id: string;
    typeExamen: string;
    categorie: "BIOLOGIE" | "IMAGERIE";
    selectionne: boolean;
    origine: "ia" | "manuel";
}

interface Props {
    open: boolean;
    onClose: () => void;
    patientId: number | null;
    patientNom: string;
    /** Dernière décision IA du patient — sert à pré-remplir les examens recommandés. */
    derniereDecision: DecisionIAResponseDTO | null;
    /** Notes déjà saisies dans l'assistant conversationnel, pré-remplissant les observations. */
    observationsInitiales?: string;
    onSuccess?: () => void;
}

const ConsultationPrescriptionDialog: React.FC<Props> = ({
                                                             open, onClose, patientId, patientNom, derniereDecision, observationsInitiales, onSuccess,
                                                         }) => {
    const [motif, setMotif] = useState("");
    const [diagnostic, setDiagnostic] = useState("");
    const [observations, setObservations] = useState("");
    const [examens, setExamens] = useState<ExamenAPrescrire[]>([]);
    const [nouveauType, setNouveauType] = useState("");
    const [nouvelleCategorie, setNouvelleCategorie] = useState<"BIOLOGIE" | "IMAGERIE">("IMAGERIE");

    const [saving, setSaving] = useState(false);
    const [erreur, setErreur] = useState("");
    const [transmissionOk, setTransmissionOk] = useState(false);
    const [recapEnvoi, setRecapEnvoi] = useState<{ radios: number; analyses: number }>({ radios: 0, analyses: 0 });

    useEffect(() => {
        if (open) {
            setMotif("");
            setDiagnostic("");
            setObservations(observationsInitiales ?? "");
            setErreur("");
            setTransmissionOk(false);
            setNouveauType("");

            const recommandes: ExamenAPrescrire[] = [
                ...(derniereDecision?.examensRecommandes ?? []).map((t, i) => ({
                    id: `ia-imagerie-${i}`,
                    typeExamen: t,
                    categorie: "IMAGERIE" as const,
                    selectionne: true,
                    origine: "ia" as const,
                })),
                ...(derniereDecision?.analysesRecommandees ?? []).map((t, i) => ({
                    id: `ia-biologie-${i}`,
                    typeExamen: t,
                    categorie: "BIOLOGIE" as const,
                    selectionne: true,
                    origine: "ia" as const,
                })),
            ];
            setExamens(recommandes);
        }
    }, [open, derniereDecision, observationsInitiales]);

    const toggleExamen = (id: string) => {
        setExamens((prev) => prev.map((e) => (e.id === id ? { ...e, selectionne: !e.selectionne } : e)));
    };

    const ajouterExamenManuel = () => {
        if (!nouveauType.trim()) return;
        setExamens((prev) => [
            ...prev,
            {
                id: `manuel-${Date.now()}`,
                typeExamen: nouveauType.trim(),
                categorie: nouvelleCategorie,
                selectionne: true,
                origine: "manuel",
            },
        ]);
        setNouveauType("");
    };

    const retirerExamen = (id: string) => {
        setExamens((prev) => prev.filter((e) => e.id !== id));
    };

    const handleTransmettre = async () => {
        if (!patientId) return;
        if (!motif.trim()) {
            setErreur("Le motif de consultation est obligatoire.");
            return;
        }
        const medecin = getStoredUser();
        if (!medecin) {
            setErreur("Impossible d'identifier le médecin connecté.");
            return;
        }

        const examensSelectionnes = examens.filter((e) => e.selectionne);

        setSaving(true);
        setErreur("");
        try {
            const consultation = await consultationService.create({
                patientId,
                medecinId: medecin.id,
                motif: motif.trim(),
                diagnostic: diagnostic.trim() || undefined,
                observationsCliniques: observations.trim() || undefined,
            });

            for (const e of examensSelectionnes) {
                await examenService.prescrire({
                    consultationId: consultation.id,
                    typeExamen: e.typeExamen,
                    categorieExamen: e.categorie,
                    description: motif.trim(),
                });
            }

            setRecapEnvoi({
                radios: examensSelectionnes.filter((e) => e.categorie === "IMAGERIE").length,
                analyses: examensSelectionnes.filter((e) => e.categorie === "BIOLOGIE").length,
            });
            setTransmissionOk(true);
            onSuccess?.();
        } catch {
            setErreur("Erreur lors de l'enregistrement de la consultation ou de la prescription des examens.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800 }}>
                Consultation — {patientNom}
                <IconButton onClick={onClose}><CloseRounded /></IconButton>
            </DialogTitle>

            {transmissionOk ? (
                <Box sx={{ p: 5, textAlign: "center" }}>
                    <CheckCircleRounded sx={{ fontSize: 72, color: "#2E7D32", mb: 2 }} />
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                        Consultation enregistrée et examens transmis
                    </Typography>
                    <Stack direction="row" gap={1} justifyContent="center" sx={{ mb: 3 }} flexWrap="wrap">
                        {recapEnvoi.radios > 0 && (
                            <Chip
                                icon={<LocalHospitalRounded />}
                                label={`${recapEnvoi.radios} examen${recapEnvoi.radios > 1 ? "s" : ""} → Radiologue`}
                                color="primary"
                            />
                        )}
                        {recapEnvoi.analyses > 0 && (
                            <Chip
                                icon={<ScienceRounded />}
                                label={`${recapEnvoi.analyses} analyse${recapEnvoi.analyses > 1 ? "s" : ""} → Biologiste`}
                                color="secondary"
                            />
                        )}
                        {recapEnvoi.radios === 0 && recapEnvoi.analyses === 0 && (
                            <Typography variant="body2" color="text.secondary">Aucun examen complémentaire prescrit.</Typography>
                        )}
                    </Stack>
                    <Button variant="contained" onClick={onClose}>Fermer</Button>
                </Box>
            ) : (
                <>
                    <DialogContent dividers sx={{ backgroundColor: "#F9FBFD" }}>
                        <Stack spacing={2.5}>
                            <Box>
                                <Typography fontWeight={700} sx={{ mb: 1 }}>Examen clinique</Typography>
                                <TextField
                                    fullWidth
                                    required
                                    label="Motif de consultation"
                                    value={motif}
                                    onChange={(e) => setMotif(e.target.value)}
                                    sx={{ mb: 1.5 }}
                                />
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    label="Observations cliniques"
                                    value={observations}
                                    onChange={(e) => setObservations(e.target.value)}
                                    sx={{ mb: 1.5 }}
                                />
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    label="Diagnostic (hypothèse)"
                                    value={diagnostic}
                                    onChange={(e) => setDiagnostic(e.target.value)}
                                />
                            </Box>

                            <Divider />

                            <Box>
                                <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                                    Examens complémentaires à prescrire
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                                    Pré-sélectionnés à partir de l'analyse IA du triage. Décochez ceux non nécessaires,
                                    ou ajoutez-en manuellement.
                                </Typography>

                                {examens.length === 0 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                        Aucun examen recommandé par l'IA pour ce patient.
                                    </Typography>
                                )}

                                <Stack spacing={0.5} sx={{ mb: 2 }}>
                                    {examens.map((e) => (
                                        <Stack key={e.id} direction="row" alignItems="center" justifyContent="space-between">
                                            <FormControlLabel
                                                control={<Checkbox checked={e.selectionne} onChange={() => toggleExamen(e.id)} size="small" />}
                                                label={
                                                    <Stack direction="row" alignItems="center" gap={1}>
                                                        {e.categorie === "IMAGERIE"
                                                            ? <LocalHospitalRounded fontSize="small" color="primary" />
                                                            : <ScienceRounded fontSize="small" color="secondary" />}
                                                        <Typography variant="body2">{e.typeExamen}</Typography>
                                                        {e.origine === "ia" && <Chip label="IA" size="small" sx={{ height: 18, fontSize: "0.65rem" }} />}
                                                    </Stack>
                                                }
                                            />
                                            <IconButton size="small" onClick={() => retirerExamen(e.id)}>
                                                <CloseRounded fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    ))}
                                </Stack>

                                <Stack direction="row" gap={1} alignItems="center">
                                    <TextField
                                        size="small"
                                        placeholder="Ajouter un examen (ex: ECG, NFS...)"
                                        value={nouveauType}
                                        onChange={(e) => setNouveauType(e.target.value)}
                                        sx={{ flex: 1 }}
                                    />
                                    <FormControl size="small" sx={{ minWidth: 130 }}>
                                        <InputLabel>Catégorie</InputLabel>
                                        <Select
                                            label="Catégorie"
                                            value={nouvelleCategorie}
                                            onChange={(e) => setNouvelleCategorie(e.target.value as "BIOLOGIE" | "IMAGERIE")}
                                        >
                                            <MenuItem value="IMAGERIE">Imagerie</MenuItem>
                                            <MenuItem value="BIOLOGIE">Biologie</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <IconButton color="primary" onClick={ajouterExamenManuel} disabled={!nouveauType.trim()}>
                                        <AddCircleOutlineRounded />
                                    </IconButton>
                                </Stack>
                            </Box>

                            {erreur && <Alert severity="error" sx={{ borderRadius: 2 }}>{erreur}</Alert>}
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{ p: 2.5 }}>
                        <Button onClick={onClose} disabled={saving}>Annuler</Button>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <SendRounded />}
                            disabled={saving || !motif.trim()}
                            onClick={() => void handleTransmettre()}
                        >
                            {saving ? "Envoi..." : "Enregistrer et transmettre"}
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
};

export default ConsultationPrescriptionDialog;
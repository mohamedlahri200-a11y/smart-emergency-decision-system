// src/components/dashboard/shared/ExamenDetailDialog.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, Chip, Stack,
    Paper, Divider, CircularProgress, TextField, Button, Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
    CloseRounded, PersonRounded, ScienceRounded, CheckCircleRounded,
    PlayCircleRounded, PsychologyRounded, ImageRounded, AutoFixHighRounded,
    UploadFileRounded, WarningAmberRounded, OpenInNewRounded, PictureAsPdfRounded,
} from "@mui/icons-material";

import { patientService, calculerAge, type PatientResponseDTO } from "../../../services/patientService";
import { decisionIAService, type DecisionIAResponseDTO } from "../../../services/decisionIAService";
import { examenService, type ExamenResponseDTO } from "../../../services/examenService";
import { prioriteStyle } from "./PatientDetailDialog";
import { detecterMotsClesCritiques, structurerCompteRendu } from "../../../utils/radiologyReportAssistant";
import { genererCompteRenduPDF } from "../../../utils/genererCompteRenduPDF";
import { getStoredUser } from "../../../utils/authUser";

interface Props {
    examenId: number | null;
    open: boolean;
    onClose: () => void;
    /** Appelé après une mise à jour réussie (prise en charge, image, résultat), pour rafraîchir la liste parente. */
    onUpdated?: () => void;
}

const statutExamenStyle: Record<string, { color: "warning" | "info" | "success" | "error"; label: string }> = {
    PRESCRIT: { color: "warning", label: "Prescrit" },
    EN_COURS: { color: "info", label: "En cours" },
    TERMINE: { color: "success", label: "Terminé" },
    ANNULE: { color: "error", label: "Annulé" },
};

const API_ORIGIN = "http://localhost:8080";

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight={700}>{value ?? "—"}</Typography>
    </Box>
);

const ExamenDetailDialog: React.FC<Props> = ({ examenId, open, onClose, onUpdated }) => {
    const [loading, setLoading] = useState(false);
    const [examen, setExamen] = useState<ExamenResponseDTO | null>(null);
    const [patient, setPatient] = useState<PatientResponseDTO | null>(null);
    const [derniereDecision, setDerniereDecision] = useState<DecisionIAResponseDTO | null>(null);
    const [erreur, setErreur] = useState("");

    const [observations, setObservations] = useState("");
    const [resultat, setResultat] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");
    const [demarrage, setDemarrage] = useState(false);
    const [uploadEnCours, setUploadEnCours] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDetail = useCallback(async (id: number): Promise<void> => {
        setLoading(true);
        setErreur("");
        try {
            const ex = await examenService.getById(id);
            setExamen(ex);
            setResultat(ex.resultat ?? "");

            const [p, decisions] = await Promise.all([
                patientService.getById(ex.patientId),
                decisionIAService.getHistoriqueByPatient(ex.patientId),
            ]);
            setPatient(p);
            const sorted = [...decisions].sort(
                (a, b) => new Date(b.dateDecision).getTime() - new Date(a.dateDecision).getTime()
            );
            setDerniereDecision(sorted[0] ?? null);
        } catch {
            setErreur("Impossible de charger le dossier de cet examen.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open && examenId) {
            void fetchDetail(examenId);
            setSaveMsg("");
            setObservations("");
        } else {
            setExamen(null);
            setPatient(null);
            setDerniereDecision(null);
        }
    }, [open, examenId, fetchDetail]);

    const dejaTermine = examen?.statutExamen === "TERMINE" || examen?.statutExamen === "ANNULE";
    const peutDemarrer = examen?.statutExamen === "PRESCRIT";

    const handleDemarrer = async (): Promise<void> => {
        if (!examen) return;
        setDemarrage(true);
        setSaveMsg("");
        try {
            await examenService.demarrer(examen.id);
            if (examenId) await fetchDetail(examenId);
            onUpdated?.();
        } catch {
            setSaveMsg("Erreur lors de la prise en charge de l'examen.");
        } finally {
            setDemarrage(false);
        }
    };

    const handleUploadImage = async (file: File): Promise<void> => {
        if (!examen) return;
        setUploadEnCours(true);
        setSaveMsg("");
        try {
            await examenService.uploaderImage(examen.id, file);
            if (examenId) await fetchDetail(examenId);
            onUpdated?.();
        } catch {
            setSaveMsg("Erreur lors de l'envoi de l'image.");
        } finally {
            setUploadEnCours(false);
        }
    };

    const handleStructurer = () => {
        if (!examen || !observations.trim()) return;
        setResultat(structurerCompteRendu(observations, examen.typeExamen));
    };

    const handleEnregistrer = async (): Promise<void> => {
        if (!examen || !resultat.trim()) return;
        setSaving(true);
        setSaveMsg("");
        try {
            await examenService.enregistrerResultat(examen.id, resultat.trim());
            if (examenId) await fetchDetail(examenId);
            onUpdated?.();
        } catch {
            setSaveMsg("Erreur lors de l'enregistrement du résultat.");
        } finally {
            setSaving(false);
        }
    };

    const motsClesEnDirect = detecterMotsClesCritiques(resultat);

    const contexteIA = derniereDecision;
    const autresExamensRecommandes = [
        ...(contexteIA?.examensRecommandes ?? []),
        ...(contexteIA?.analysesRecommandees ?? []),
    ].filter((item) => item.toLowerCase() !== examen?.typeExamen?.toLowerCase());

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800 }}>
                {patient ? `${patient.nom} ${patient.prenom}` : "Détail de l'examen"}
                <IconButton onClick={onClose}><CloseRounded /></IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ backgroundColor: "#F9FBFD" }}>
                {loading && (
                    <Box display="flex" justifyContent="center" py={6}>
                        <CircularProgress />
                    </Box>
                )}

                {!loading && erreur && <Typography color="error">{erreur}</Typography>}

                {!loading && examen && patient && (
                    <Stack spacing={2.5}>
                        {/* Contexte patient */}
                        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                                <PersonRounded color="primary" />
                                <Typography fontWeight={800}>Contexte patient</Typography>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6, sm: 4 }}><Field label="N° Dossier" value={patient.numeroDossier} /></Grid>
                                <Grid size={{ xs: 6, sm: 4 }}><Field label="Âge" value={`${calculerAge(patient.dateNaissance)} ans`} /></Grid>
                                <Grid size={{ xs: 6, sm: 4 }}><Field label="Sexe" value={patient.sexe} /></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}><Field label="Médecin prescripteur" value={examen.medecinPrescripteurNomComplet} /></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field label="Prescrit le" value={new Date(examen.datePrescription).toLocaleString("fr-FR")} />
                                </Grid>
                            </Grid>

                            {contexteIA && (
                                <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #D8E0EC" }}>
                                    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Priorité triage :</Typography>
                                        {(() => {
                                            const p = prioriteStyle[contexteIA.classePredite] ?? { bg: "#EEE", fg: "#555", label: contexteIA.classePredite };
                                            return <Chip size="small" label={p.label} sx={{ backgroundColor: p.bg, color: p.fg, fontWeight: 700 }} />;
                                        })()}
                                        {contexteIA.risqueClinique && contexteIA.risqueClinique.toLowerCase() !== "aucun" && (
                                            <Chip
                                                size="small"
                                                color="error"
                                                icon={<PsychologyRounded sx={{ fontSize: "16px !important" }} />}
                                                label={`Suspicion IA : ${contexteIA.risqueClinique}`}
                                                sx={{ fontWeight: 700 }}
                                            />
                                        )}
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary">
                                        {contexteIA.explication}
                                    </Typography>
                                    {autresExamensRecommandes.length > 0 && (
                                        <Box sx={{ mt: 1.5 }}>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                                Autres examens recommandés par l'IA pour ce patient :
                                            </Typography>
                                            <Stack direction="row" flexWrap="wrap" gap={0.75}>
                                                {autresExamensRecommandes.map((item) => (
                                                    <Chip key={item} size="small" label={item} variant="outlined" />
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Paper>

                        {/* Détail de l'examen */}
                        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                                <ScienceRounded color="primary" />
                                <Typography fontWeight={800}>Examen demandé</Typography>
                                <Box flexGrow={1} />
                                {(() => {
                                    const s = statutExamenStyle[examen.statutExamen] ?? { color: "info" as const, label: examen.statutExamen };
                                    return <Chip size="small" color={s.color} label={s.label} sx={{ fontWeight: 700 }} />;
                                })()}
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2} sx={{ mb: 1 }}>
                                <Grid size={{ xs: 12, sm: 6 }}><Field label="Type d'examen" value={examen.typeExamen} /></Grid>
                                <Grid size={{ xs: 12, sm: 6 }}><Field label="Catégorie" value={examen.categorieExamen === "IMAGERIE" ? "Imagerie médicale" : "Biologie"} /></Grid>
                            </Grid>
                            {examen.description && (
                                <Box sx={{ mb: 2 }}>
                                    <Field label="Motif clinique / description" value={examen.description} />
                                </Box>
                            )}

                            {saveMsg && <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>{saveMsg}</Alert>}

                            {peutDemarrer && (
                                <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #D8E0EC" }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<PlayCircleRounded />}
                                        disabled={demarrage}
                                        onClick={() => void handleDemarrer()}
                                    >
                                        {demarrage ? "Prise en charge..." : "Prendre en charge cet examen"}
                                    </Button>
                                </Box>
                            )}

                            {/* Image jointe (imagerie uniquement) — archivage, pas d'analyse automatique */}
                            {examen.categorieExamen === "IMAGERIE" && (
                                <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #D8E0EC" }}>
                                    <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                                        <ImageRounded fontSize="small" color="primary" />
                                        <Typography fontWeight={700}>Image de l'examen</Typography>
                                    </Stack>
                                    {examen.cheminImage ? (
                                        <Stack direction="row" alignItems="center" gap={1.5}>
                                            <Box
                                                component="img"
                                                src={`${API_ORIGIN}${examen.cheminImage}`}
                                                alt="Image de l'examen"
                                                sx={{ width: 96, height: 96, objectFit: "cover", borderRadius: 2, border: "1px solid #E7ECF3" }}
                                            />
                                            <Button
                                                size="small"
                                                variant="text"
                                                endIcon={<OpenInNewRounded />}
                                                href={`${API_ORIGIN}${examen.cheminImage}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Ouvrir en grand
                                            </Button>
                                        </Stack>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                            Aucune image jointe pour l'instant.
                                        </Typography>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*,.dcm"
                                        hidden
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) void handleUploadImage(file);
                                            e.target.value = "";
                                        }}
                                    />
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<UploadFileRounded />}
                                        disabled={uploadEnCours}
                                        onClick={() => fileInputRef.current?.click()}
                                        sx={{ mt: 1 }}
                                    >
                                        {uploadEnCours ? "Envoi..." : examen.cheminImage ? "Remplacer l'image" : "Téléverser l'image"}
                                    </Button>
                                </Box>
                            )}

                            {dejaTermine ? (
                                <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #D8E0EC" }}>
                                    <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                                        <CheckCircleRounded color="success" fontSize="small" />
                                        <Typography fontWeight={700}>Résultat enregistré</Typography>
                                    </Stack>
                                    {examen.compteRenduCritique && (
                                        <Alert severity="error" icon={<WarningAmberRounded />} sx={{ mb: 1.5, borderRadius: 2 }}>
                                            Mots-clés critiques détectés : {examen.motsClesCritiquesDetectes.join(", ")}. Le médecin urgentiste a été alerté.
                                        </Alert>
                                    )}
                                    <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>{examen.resultat}</Typography>
                                    {examen.dateResultat && (
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                            Enregistré le {new Date(examen.dateResultat).toLocaleString("fr-FR")}
                                        </Typography>
                                    )}
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<PictureAsPdfRounded />}
                                        sx={{ mt: 1.5 }}
                                        onClick={() => {
                                            if (!patient) return;
                                            const user = getStoredUser();
                                            const redacteur = user ? `${user.nom} ${user.prenom}` : "Professionnel de santé";
                                            genererCompteRenduPDF(examen, patient, redacteur);
                                        }}
                                    >
                                        Télécharger le compte-rendu en PDF
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #D8E0EC" }}>
                                    <Typography fontWeight={700} sx={{ mb: 1 }}>
                                        Assistant de rédaction du compte-rendu
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                        Saisissez vos observations brutes, puis laissez l'assistant structurer le compte-rendu.
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        placeholder="Observations brutes (ex : opacité basale droite, pas d'épanchement...)"
                                        value={observations}
                                        onChange={(e) => setObservations(e.target.value)}
                                        sx={{ mb: 1 }}
                                    />
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<AutoFixHighRounded />}
                                        disabled={!observations.trim()}
                                        onClick={handleStructurer}
                                        sx={{ mb: 2 }}
                                    >
                                        Structurer le compte-rendu
                                    </Button>

                                    <Typography fontWeight={700} sx={{ mb: 1 }}>Compte-rendu final</Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={5}
                                        placeholder="Compte rendu / résultat de l'examen..."
                                        value={resultat}
                                        onChange={(e) => setResultat(e.target.value)}
                                        sx={{ mb: 1 }}
                                    />
                                    {motsClesEnDirect.length > 0 && (
                                        <Alert severity="warning" icon={<WarningAmberRounded />} sx={{ mb: 1.5, borderRadius: 2 }}>
                                            Mots-clés critiques détectés en direct : {motsClesEnDirect.join(", ")}. Une alerte sera envoyée au médecin urgentiste à l'enregistrement.
                                        </Alert>
                                    )}
                                    <Button
                                        variant="contained"
                                        startIcon={<CheckCircleRounded />}
                                        disabled={saving || !resultat.trim()}
                                        onClick={() => void handleEnregistrer()}
                                    >
                                        {saving ? "Enregistrement..." : "Enregistrer le résultat"}
                                    </Button>
                                </Box>
                            )}
                        </Paper>
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ExamenDetailDialog;
// src/components/dashboard/shared/PatientDetailDialog.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Typography,
    Chip,
    Stack,
    Paper,
    Divider,
    CircularProgress,
    TextField,
    Button,
    Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
    CloseRounded,
    PersonRounded,
    MonitorHeartRounded,
    AutoAwesomeRounded,
    CheckCircleRounded,
    EditRounded,
    CancelRounded,
    ScienceRounded,
    WarningAmberRounded,
    OpenInNewRounded,
} from "@mui/icons-material";

import { patientService, calculerAge, type PatientResponseDTO } from "../../../services/patientService";
import { triageService, type TriageResponseDTO } from "../../../services/triageService";
import { decisionIAService, type DecisionIAResponseDTO } from "../../../services/decisionIAService";
import { examenService, type ExamenResponseDTO } from "../../../services/examenService";
import { getStoredUser } from "../../../utils/authUser";
import DecisionIAEnrichedPanel from "./DecisionIAEnrichedPanel";

interface Props {
    patientId: number | null;
    open: boolean;
    onClose: () => void;
    /** Affiche les actions de validation médicale (rôle MEDECIN uniquement). */
    canValidate?: boolean;
    /** Appelé après une validation réussie, pour rafraîchir la liste parente. */
    onValidated?: () => void;
}

export const prioriteStyle: Record<string, { bg: string; fg: string; label: string }> = {
    Rouge: { bg: "#FDEBEC", fg: "#D32F2F", label: "Rouge — Vital" },
    Orange: { bg: "#FEF2E4", fg: "#F2A93B", label: "Orange — Urgent" },
    Jaune: { bg: "#FEFBE8", fg: "#B7950B", label: "Jaune — Modéré" },
    Vert: { bg: "#EAF7EE", fg: "#2E7D32", label: "Vert — Mineur" },
    Bleu: { bg: "#E8F0FE", fg: "#1565C0", label: "Bleu — Non urgent" },
};

export const statutStyle: Record<string, { color: "warning" | "success" | "error" | "info"; label: string }> = {
    EN_ATTENTE: { color: "warning", label: "En attente médecin" },
    VALIDEE: { color: "success", label: "Validée" },
    REJETEE: { color: "error", label: "Rejetée" },
    MODIFIEE: { color: "info", label: "Modifiée" },
};

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

const PatientDetailDialog: React.FC<Props> = ({ patientId, open, onClose, canValidate, onValidated }) => {
    const [loading, setLoading] = useState(false);
    const [patient, setPatient] = useState<PatientResponseDTO | null>(null);
    const [triages, setTriages] = useState<TriageResponseDTO[]>([]);
    const [decisions, setDecisions] = useState<DecisionIAResponseDTO[]>([]);
    const [examens, setExamens] = useState<ExamenResponseDTO[]>([]);
    const [erreur, setErreur] = useState("");

    const [commentaire, setCommentaire] = useState("");
    const [validating, setValidating] = useState(false);
    const [validationMsg, setValidationMsg] = useState("");

    const fetchDetail = useCallback(async (id: number) => {
        setLoading(true);
        setErreur("");
        try {
            const [p, t, d, e] = await Promise.all([
                patientService.getById(id),
                triageService.getHistoriqueByPatient(id),
                decisionIAService.getHistoriqueByPatient(id),
                examenService.getByPatient(id),
            ]);
            setPatient(p);
            setTriages([...t].sort((a, b) => new Date(b.dateTriage).getTime() - new Date(a.dateTriage).getTime()));
            setDecisions([...d].sort((a, b) => new Date(b.dateDecision).getTime() - new Date(a.dateDecision).getTime()));
            setExamens([...e].sort((a, b) => new Date(b.datePrescription).getTime() - new Date(a.datePrescription).getTime()));
        } catch {
            setErreur("Impossible de charger la fiche de ce patient.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open && patientId) {
            fetchDetail(patientId);
            setCommentaire("");
            setValidationMsg("");
        } else {
            setPatient(null);
            setTriages([]);
            setDecisions([]);
            setExamens([]);
        }
    }, [open, patientId, fetchDetail]);

    const derniereDecision = decisions[0] ?? null;
    const peutValider = canValidate && derniereDecision?.statutValidation === "EN_ATTENTE";

    const handleValider = async (statut: "VALIDEE" | "REJETEE" | "MODIFIEE") => {
        if (!derniereDecision) return;
        const medecin = getStoredUser();
        if (!medecin) {
            setValidationMsg("Impossible d'identifier le médecin connecté.");
            return;
        }
        setValidating(true);
        setValidationMsg("");
        try {
            await decisionIAService.valider(derniereDecision.id, medecin.id, statut, commentaire || undefined);
            if (patientId) await fetchDetail(patientId);
            onValidated?.();
        } catch {
            setValidationMsg("Erreur lors de l'enregistrement de la validation.");
        } finally {
            setValidating(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800 }}>
                {patient ? `${patient.nom} ${patient.prenom}` : "Fiche patient"}
                <IconButton onClick={onClose}>
                    <CloseRounded />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ backgroundColor: "#F9FBFD" }}>
                {loading && (
                    <Box display="flex" justifyContent="center" py={6}>
                        <CircularProgress />
                    </Box>
                )}

                {!loading && erreur && (
                    <Typography color="error">{erreur}</Typography>
                )}

                {!loading && patient && (
                    <Stack spacing={2.5}>
                        {/* Informations administratives */}
                        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                                <PersonRounded color="primary" />
                                <Typography fontWeight={800}>Informations administratives</Typography>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6, sm: 4 }}><Field label="N° Dossier" value={patient.numeroDossier} /></Grid>
                                <Grid size={{ xs: 6, sm: 4 }}><Field label="Âge" value={`${calculerAge(patient.dateNaissance)} ans`} /></Grid>
                                <Grid size={{ xs: 6, sm: 4 }}><Field label="Sexe" value={patient.sexe} /></Grid>
                                <Grid size={{ xs: 6, sm: 4 }}><Field label="Téléphone" value={patient.telephone} /></Grid>
                                <Grid size={{ xs: 6, sm: 4 }}><Field label="Date de naissance" value={patient.dateNaissance} /></Grid>
                                <Grid size={{ xs: 6, sm: 4 }}>
                                    <Field
                                        label="Enregistré le"
                                        value={new Date(patient.dateEnregistrement).toLocaleString("fr-FR")}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Triages */}
                        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                                <MonitorHeartRounded color="primary" />
                                <Typography fontWeight={800}>
                                    Fiches de triage ({triages.length})
                                </Typography>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            {triages.length === 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    Aucun triage enregistré pour ce patient.
                                </Typography>
                            )}
                            <Stack spacing={1.5}>
                                {triages.map((t) => (
                                    <Box
                                        key={t.id}
                                        sx={{ p: 1.5, borderRadius: 2, border: "1px solid #E7ECF3" }}
                                    >
                                        <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={1}>
                                            <Typography variant="body2" fontWeight={700}>
                                                {new Date(t.dateTriage).toLocaleString("fr-FR")}
                                            </Typography>
                                            <Chip size="small" label={`ESI ${t.niveauEsi ?? "—"}`} />
                                            <Chip size="small" label={`NEWS2 ${t.scoreNews2 ?? "—"}`} />
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary">
                                            FC {t.frequenceCardiaque ?? "—"} · TA {t.pressionArterielleSystolique ?? "—"} mmHg
                                            {" "}· FR {t.frequenceRespiratoire ?? "—"} · SpO₂ {t.saturationOxygene ?? "—"}%
                                            {" "}· Temp {t.temperature ?? "—"}°C
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>

                        {/* Examens complémentaires (biologie + imagerie) */}
                        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                                <ScienceRounded color="primary" />
                                <Typography fontWeight={800}>
                                    Examens complémentaires ({examens.length})
                                </Typography>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            {examens.length === 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    Aucun examen prescrit pour ce patient.
                                </Typography>
                            )}
                            <Stack spacing={1.5}>
                                {examens.map((e) => {
                                    const s = statutExamenStyle[e.statutExamen] ?? { color: "info" as const, label: e.statutExamen };
                                    return (
                                        <Box key={e.id} sx={{ p: 1.5, borderRadius: 2, border: "1px solid #E7ECF3" }}>
                                            <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 0.5 }}>
                                                <Typography variant="body2" fontWeight={700}>
                                                    {e.typeExamen}
                                                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                        ({e.categorieExamen === "IMAGERIE" ? "Imagerie" : "Biologie"})
                                                    </Typography>
                                                </Typography>
                                                <Chip size="small" color={s.color} label={s.label} sx={{ fontWeight: 700 }} />
                                            </Stack>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Prescrit le {new Date(e.datePrescription).toLocaleString("fr-FR")} par {e.medecinPrescripteurNomComplet}
                                            </Typography>

                                            {e.compteRenduCritique && (
                                                <Alert
                                                    severity="error"
                                                    icon={<WarningAmberRounded />}
                                                    sx={{ mt: 1, mb: 1, borderRadius: 2 }}
                                                >
                                                    Mots-clés critiques détectés : {e.motsClesCritiquesDetectes.join(", ")}
                                                </Alert>
                                            )}

                                            {e.statutExamen === "TERMINE" && e.resultat && (
                                                <Typography variant="body2" sx={{ mt: 1, whiteSpace: "pre-line" }}>
                                                    {e.resultat}
                                                </Typography>
                                            )}

                                            {e.categorieExamen === "IMAGERIE" && e.cheminImage && (
                                                <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1 }}>
                                                    <Box
                                                        component="img"
                                                        src={`${API_ORIGIN}${e.cheminImage}`}
                                                        alt="Image de l'examen"
                                                        sx={{ width: 64, height: 64, objectFit: "cover", borderRadius: 1.5, border: "1px solid #E7ECF3" }}
                                                    />
                                                    <Button
                                                        size="small"
                                                        variant="text"
                                                        endIcon={<OpenInNewRounded />}
                                                        href={`${API_ORIGIN}${e.cheminImage}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Ouvrir l'image
                                                    </Button>
                                                </Stack>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Paper>

                        {/* Décisions IA */}
                        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                                <AutoAwesomeRounded color="primary" />
                                <Typography fontWeight={800}>
                                    Décisions IA ({decisions.length})
                                </Typography>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            {decisions.length === 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    Aucune analyse IA réalisée pour ce patient.
                                </Typography>
                            )}
                            <Stack spacing={1.5}>
                                {decisions.map((d) => {
                                    const prio = prioriteStyle[d.classePredite] ?? { bg: "#EEE", fg: "#555", label: d.classePredite };
                                    const statut = statutStyle[d.statutValidation] ?? { color: "info" as const, label: d.statutValidation };
                                    return (
                                        <Box key={d.id} sx={{ p: 1.5, borderRadius: 2, border: "1px solid #E7ECF3" }}>
                                            <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 0.5 }}>
                                                <Typography variant="body2" fontWeight={700}>
                                                    {new Date(d.dateDecision).toLocaleString("fr-FR")}
                                                </Typography>
                                                <Chip
                                                    size="small"
                                                    label={prio.label}
                                                    sx={{ backgroundColor: prio.bg, color: prio.fg, fontWeight: 700 }}
                                                />
                                                <Chip size="small" color={statut.color} label={statut.label} sx={{ fontWeight: 700 }} />
                                            </Stack>
                                            {d.recommandationService && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Service recommandé : {d.recommandationService}
                                                </Typography>
                                            )}
                                            <Typography variant="body2" sx={{ mt: 0.5 }}>{d.explication}</Typography>
                                            {d.medecinValidateurNomComplet && (
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                    Validée par {d.medecinValidateurNomComplet}
                                                    {d.commentaireMedecin ? ` — "${d.commentaireMedecin}"` : ""}
                                                </Typography>
                                            )}
                                            {d.id === derniereDecision?.id && <DecisionIAEnrichedPanel decision={d} />}
                                        </Box>
                                    );
                                })}
                            </Stack>

                            {/* Validation médicale */}
                            {peutValider && (
                                <Box sx={{ mt: 2.5, pt: 2, borderTop: "1px dashed #D8E0EC" }}>
                                    <Typography fontWeight={700} sx={{ mb: 1 }}>
                                        Votre décision sur cette proposition IA
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        size="small"
                                        placeholder="Commentaire médical (optionnel)"
                                        value={commentaire}
                                        onChange={(e) => setCommentaire(e.target.value)}
                                        sx={{ mb: 1.5 }}
                                    />
                                    {validationMsg && (
                                        <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>{validationMsg}</Alert>
                                    )}
                                    <Stack direction="row" gap={1.5} flexWrap="wrap">
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={<CheckCircleRounded />}
                                            disabled={validating}
                                            onClick={() => handleValider("VALIDEE")}
                                        >
                                            Valider
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="info"
                                            startIcon={<EditRounded />}
                                            disabled={validating}
                                            onClick={() => handleValider("MODIFIEE")}
                                        >
                                            Valider avec modification
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<CancelRounded />}
                                            disabled={validating}
                                            onClick={() => handleValider("REJETEE")}
                                        >
                                            Rejeter
                                        </Button>
                                    </Stack>
                                </Box>
                            )}
                        </Paper>
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PatientDetailDialog;
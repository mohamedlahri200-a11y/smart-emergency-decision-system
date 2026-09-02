// src/components/dashboard/medecin/MedecinAideIAPage.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Box, Paper, Typography, TextField, InputAdornment, Stack, Chip, Avatar,
    IconButton, Divider, LinearProgress, Button,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
    AutoAwesomeRounded, SearchRounded, PersonRounded, SendRounded,
    LocalHospitalRounded, ScienceRounded, MedicalInformationRounded,
    PsychologyRounded, WarningAmberRounded, HotelRounded, AccessTimeRounded,
    CheckCircleRounded, ArrowBackRounded,
} from "@mui/icons-material";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import ConsultationPrescriptionDialog from "../shared/ConsultationPrescriptionDialog";
import AnalyseComplementaireDialog from "../shared/AnalyseComplementaireDialog";
import { prioriteStyle } from "../shared/PatientDetailDialog";

import { patientService, calculerAge } from "../../../services/patientService";
import { triageService, type TriageResponseDTO } from "../../../services/triageService";
import { decisionIAService, type DecisionIAResponseDTO } from "../../../services/decisionIAService";
import { examenService, type ExamenResponseDTO } from "../../../services/examenService";

interface LignePatient {
    id: number;
    numeroDossier: string;
    nomComplet: string;
    age: number;
    priorite: string | null;
}

interface MessageChat {
    id: string;
    auteur: "assistant" | "medecin";
    texte?: string;
    carte?: React.ReactNode;
}

const risqueStyle: Record<string, { bg: string; fg: string; label: string }> = {
    Faible: { bg: "#EAF7EE", fg: "#2E7D32", label: "Risque faible" },
    Modere: { bg: "#FEFBE8", fg: "#B7950B", label: "Risque modéré" },
    Eleve: { bg: "#FEF2E4", fg: "#E65100", label: "Risque élevé" },
    Critique: { bg: "#FDEBEC", fg: "#D32F2F", label: "Risque critique" },
};

const AvatarAssistant = () => (
    <Avatar sx={{ bgcolor: "#0D47A1", width: 34, height: 34 }}>
        <AutoAwesomeRounded sx={{ fontSize: 18 }} />
    </Avatar>
);

const MedecinAideIAPage: React.FC = () => {
    const [patients, setPatients] = useState<LignePatient[]>([]);
    const [loadingListe, setLoadingListe] = useState(true);
    const [search, setSearch] = useState("");

    const [patientId, setPatientId] = useState<number | null>(null);
    const [patientNom, setPatientNom] = useState("");
    const [triages, setTriages] = useState<TriageResponseDTO[]>([]);
    const [decisions, setDecisions] = useState<DecisionIAResponseDTO[]>([]);
    const [examens, setExamens] = useState<ExamenResponseDTO[]>([]);
    const [chargementConversation, setChargementConversation] = useState(false);

    const [messages, setMessages] = useState<MessageChat[]>([]);
    const [saisie, setSaisie] = useState("");
    const [notesLibres, setNotesLibres] = useState<string[]>([]);

    const [consultationOpen, setConsultationOpen] = useState(false);
    const [analyseComplementaireOpen, setAnalyseComplementaireOpen] = useState(false);

    const finDeChat = useRef<HTMLDivElement>(null);

    const fetchListe = useCallback(async () => {
        setLoadingListe(true);
        try {
            const [patientsData, decisionsData] = await Promise.all([
                patientService.getAll(),
                decisionIAService.getAll(),
            ]);
            const derniereDecisionParPatient = new Map<number, string>();
            for (const d of [...decisionsData].sort((a, b) => new Date(a.dateDecision).getTime() - new Date(b.dateDecision).getTime())) {
                derniereDecisionParPatient.set(d.patientId, d.classePredite);
            }
            setPatients(
                patientsData.map((p) => ({
                    id: p.id,
                    numeroDossier: p.numeroDossier,
                    nomComplet: `${p.nom} ${p.prenom}`,
                    age: calculerAge(p.dateNaissance),
                    priorite: derniereDecisionParPatient.get(p.id) ?? null,
                }))
            );
        } catch {
            setPatients([]);
        } finally {
            setLoadingListe(false);
        }
    }, []);

    useEffect(() => { void fetchListe(); }, [fetchListe]);

    const filtres = useMemo(() => {
        const terme = search.trim().toLowerCase();
        if (!terme) return patients;
        return patients.filter(
            (p) => p.nomComplet.toLowerCase().includes(terme) || p.numeroDossier.toLowerCase().includes(terme)
        );
    }, [patients, search]);

    const ajouterMessage = (msg: Omit<MessageChat, "id">) => {
        setMessages((prev) => [...prev, { ...msg, id: `${Date.now()}-${Math.random()}` }]);
    };

    const construireConversationInitiale = useCallback((
        nomComplet: string,
        t: TriageResponseDTO[],
        d: DecisionIAResponseDTO[],
        e: ExamenResponseDTO[]
    ) => {
        const dernierTriage = t[0] ?? null;
        const derniereDecision = d[0] ?? null;
        const historique: MessageChat[] = [];

        historique.push({
            id: "intro",
            auteur: "assistant",
            texte: `Bonjour Docteur. Voici la fiche transmise par l'infirmier d'accueil pour ${nomComplet}.`,
        });

        if (dernierTriage) {
            historique.push({
                id: "fiche",
                auteur: "assistant",
                carte: (
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, maxWidth: 480 }}>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                            <MedicalInformationRounded fontSize="small" color="primary" />
                            <Typography variant="body2" fontWeight={700}>Constantes vitales du triage</Typography>
                        </Stack>
                        <Grid container spacing={1}>
                            <Grid size={6}><Typography variant="caption" color="text.secondary">FC : {dernierTriage.frequenceCardiaque ?? "—"} bpm</Typography></Grid>
                            <Grid size={6}><Typography variant="caption" color="text.secondary">TA : {dernierTriage.pressionArterielleSystolique ?? "—"} mmHg</Typography></Grid>
                            <Grid size={6}><Typography variant="caption" color="text.secondary">FR : {dernierTriage.frequenceRespiratoire ?? "—"} cyc/min</Typography></Grid>
                            <Grid size={6}><Typography variant="caption" color="text.secondary">SpO₂ : {dernierTriage.saturationOxygene ?? "—"}%</Typography></Grid>
                            <Grid size={6}><Typography variant="caption" color="text.secondary">Temp : {dernierTriage.temperature ?? "—"}°C</Typography></Grid>
                            <Grid size={6}><Typography variant="caption" color="text.secondary">NEWS2 : {dernierTriage.scoreNews2 ?? "—"} · ESI {dernierTriage.niveauEsi ?? "—"}</Typography></Grid>
                        </Grid>
                    </Paper>
                ),
            });
        }

        if (derniereDecision) {
            const prio = prioriteStyle[derniereDecision.classePredite] ?? { bg: "#EEE", fg: "#555", label: derniereDecision.classePredite };
            historique.push({
                id: "priorite",
                auteur: "assistant",
                texte: `D'après mon analyse du triage, ce patient est classé priorité ${derniereDecision.classePredite}. ${derniereDecision.explication}`,
            });
            historique.push({
                id: "priorite-chip",
                auteur: "assistant",
                carte: (
                    <Stack direction="row" gap={1} flexWrap="wrap">
                        <Chip label={prio.label} sx={{ backgroundColor: prio.bg, color: prio.fg, fontWeight: 700 }} />
                        {derniereDecision.recommandationService && (
                            <Chip icon={<LocalHospitalRounded sx={{ fontSize: "16px !important" }} />} label={`Service suggéré : ${derniereDecision.recommandationService}`} variant="outlined" />
                        )}
                    </Stack>
                ),
            });

            const aDesRecommandations = (derniereDecision.examensRecommandes?.length ?? 0) > 0
                || (derniereDecision.analysesRecommandees?.length ?? 0) > 0;

            if (aDesRecommandations) {
                historique.push({
                    id: "recommandations",
                    auteur: "assistant",
                    texte: "Voici les examens que je recommande, à confirmer ou modifier selon votre examen clinique :",
                });
                historique.push({
                    id: "recommandations-chips",
                    auteur: "assistant",
                    carte: (
                        <Stack spacing={1}>
                            {(derniereDecision.examensRecommandes?.length ?? 0) > 0 && (
                                <Stack direction="row" gap={0.75} flexWrap="wrap">
                                    {derniereDecision.examensRecommandes!.map((ex) => (
                                        <Chip key={ex} size="small" icon={<LocalHospitalRounded sx={{ fontSize: "14px !important" }} />} label={ex} sx={{ backgroundColor: "#E8F0FE", color: "#1565C0" }} />
                                    ))}
                                </Stack>
                            )}
                            {(derniereDecision.analysesRecommandees?.length ?? 0) > 0 && (
                                <Stack direction="row" gap={0.75} flexWrap="wrap">
                                    {derniereDecision.analysesRecommandees!.map((an) => (
                                        <Chip key={an} size="small" icon={<ScienceRounded sx={{ fontSize: "14px !important" }} />} label={an} sx={{ backgroundColor: "#F3E5F5", color: "#6A1B9A" }} />
                                    ))}
                                </Stack>
                            )}
                        </Stack>
                    ),
                });
            }
        } else {
            historique.push({
                id: "pas-de-decision",
                auteur: "assistant",
                texte: "Aucune analyse IA n'a encore été réalisée au triage pour ce patient.",
            });
        }

        historique.push({
            id: "invite-observations",
            auteur: "assistant",
            texte: "Vous pouvez ajouter vos observations issues de l'examen clinique ou de la discussion avec le patient/l'accompagnant ci-dessous. Une fois prêt, utilisez les actions en bas pour prescrire les examens ou consulter les résultats déjà reçus.",
        });

        const examensTermines = e.filter((ex) => ex.statutExamen === "TERMINE");
        if (examensTermines.length > 0) {
            historique.push({
                id: "resultats-recus",
                auteur: "assistant",
                texte: `${examensTermines.length} résultat(s) d'examen déjà reçu(s) du radiologue/biologiste. Je peux affiner ma prédiction (service, durée d'hospitalisation, traitements) si vous le souhaitez — bouton « Analyser les résultats reçus » ci-dessous.`,
            });
        }

        return historique;
    }, []);

    const ouvrirConversation = useCallback(async (patient: LignePatient) => {
        setPatientId(patient.id);
        setPatientNom(patient.nomComplet);
        setNotesLibres([]);
        setChargementConversation(true);
        setMessages([]);
        try {
            const [t, d, e] = await Promise.all([
                triageService.getHistoriqueByPatient(patient.id),
                decisionIAService.getHistoriqueByPatient(patient.id),
                examenService.getByPatient(patient.id),
            ]);
            const triagesTries = [...t].sort((a, b) => new Date(b.dateTriage).getTime() - new Date(a.dateTriage).getTime());
            const decisionsTriees = [...d].sort((a, b) => new Date(b.dateDecision).getTime() - new Date(a.dateDecision).getTime());
            setTriages(triagesTries);
            setDecisions(decisionsTriees);
            setExamens(e);
            setMessages(construireConversationInitiale(patient.nomComplet, triagesTries, decisionsTriees, e));
        } catch {
            ajouterMessage({ auteur: "assistant", texte: "Impossible de charger le dossier de ce patient." });
        } finally {
            setChargementConversation(false);
        }
    }, [construireConversationInitiale]);

    const rafraichirDossier = useCallback(async () => {
        if (!patientId) return;
        const [t, d, e] = await Promise.all([
            triageService.getHistoriqueByPatient(patientId),
            decisionIAService.getHistoriqueByPatient(patientId),
            examenService.getByPatient(patientId),
        ]);
        setTriages([...t].sort((a, b) => new Date(b.dateTriage).getTime() - new Date(a.dateTriage).getTime()));
        setDecisions([...d].sort((a, b) => new Date(b.dateDecision).getTime() - new Date(a.dateDecision).getTime()));
        setExamens(e);
    }, [patientId]);

    useEffect(() => {
        finDeChat.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const envoyerNote = () => {
        const texte = saisie.trim();
        if (!texte) return;
        ajouterMessage({ auteur: "medecin", texte });
        setNotesLibres((prev) => [...prev, texte]);
        setSaisie("");
        ajouterMessage({
            auteur: "assistant",
            texte: "Note bien enregistrée — elle sera jointe au motif de consultation lors de la prescription des examens.",
        });
    };

    const derniereDecision = decisions[0] ?? null;
    const dernierTriageId = triages[0]?.id ?? null;
    const examensTermines = examens.filter((e) => e.statutExamen === "TERMINE");

    const handleConsultationSuccess = async () => {
        await rafraichirDossier();
        ajouterMessage({
            auteur: "assistant",
            texte: "Les examens sélectionnés ont bien été transmis. Vous serez notifié dès que le radiologue ou le biologiste enverra ses résultats.",
        });
        await fetchListe();
    };

    const handleAnalyseComplementaireSuccess = async () => {
        await rafraichirDossier();
        ajouterMessage({
            auteur: "assistant",
            texte: "Analyse complémentaire effectuée à partir des résultats reçus. La proposition mise à jour (service, durée de séjour, traitements) est disponible ci-dessous, en attente de votre validation finale.",
        });
    };

    return (
        <DashboardLayout
            title="Aide IA — Médecin Urgentiste"
            subtitle="Assistant conversationnel basé sur la fiche du triage, vos observations et les résultats reçus"
        >
            <Grid container spacing={2.5} sx={{ height: "calc(100vh - 190px)" }}>
                {/* Colonne patients */}
                <Grid size={{ xs: 12, md: patientId ? 3.5 : 12 }} sx={{ display: patientId ? { xs: "none", md: "block" } : "block" }}>
                    <Paper sx={{ height: "100%", borderRadius: 4, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                        <Box sx={{ p: 2, borderBottom: "1px solid #EEF1F6" }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Rechercher un patient..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> } }}
                            />
                        </Box>
                        <Box sx={{ overflowY: "auto", flex: 1 }}>
                            {loadingListe && <LinearProgress />}
                            {!loadingListe && filtres.map((p) => {
                                const prio = p.priorite ? prioriteStyle[p.priorite] : null;
                                const actif = p.id === patientId;
                                return (
                                    <Box
                                        key={p.id}
                                        onClick={() => void ouvrirConversation(p)}
                                        sx={{
                                            p: 1.75, display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer",
                                            backgroundColor: actif ? "#EEF4FD" : "transparent",
                                            borderLeft: actif ? "3px solid #0D47A1" : "3px solid transparent",
                                            "&:hover": { backgroundColor: "#F9FBFD" },
                                        }}
                                    >
                                        <Avatar sx={{ width: 34, height: 34, bgcolor: "#EEF1F6", color: "#0D47A1" }}><PersonRounded fontSize="small" /></Avatar>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="body2" fontWeight={700} noWrap>{p.nomComplet}</Typography>
                                            <Typography variant="caption" color="text.secondary">{p.numeroDossier} · {p.age} ans</Typography>
                                        </Box>
                                        {prio && <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: prio.fg, flexShrink: 0 }} />}
                                    </Box>
                                );
                            })}
                        </Box>
                    </Paper>
                </Grid>

                {/* Colonne conversation */}
                {patientId && (
                    <Grid size={{ xs: 12, md: 8.5 }} sx={{ height: "100%" }}>
                        <Paper sx={{ height: "100%", borderRadius: 4, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                            {/* En-tête conversation */}
                            <Stack direction="row" alignItems="center" gap={1.5} sx={{ p: 2, borderBottom: "1px solid #EEF1F6" }}>
                                <IconButton size="small" onClick={() => setPatientId(null)} sx={{ display: { md: "none" } }}>
                                    <ArrowBackRounded />
                                </IconButton>
                                <AvatarAssistant />
                                <Box sx={{ flex: 1 }}>
                                    <Typography fontWeight={800}>Assistant IA — {patientNom}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Basé sur le modèle de triage entraîné (NEWS2 / ESI) — les recommandations restent à valider par vous
                                    </Typography>
                                </Box>
                            </Stack>

                            {/* Fil de discussion */}
                            <Box sx={{ flex: 1, overflowY: "auto", p: 2.5, backgroundColor: "#F9FBFD" }}>
                                {chargementConversation && <LinearProgress sx={{ mb: 2 }} />}
                                <Stack spacing={2}>
                                    {messages.map((m) => (
                                        <Stack
                                            key={m.id}
                                            direction="row"
                                            justifyContent={m.auteur === "medecin" ? "flex-end" : "flex-start"}
                                            alignItems="flex-start"
                                            gap={1}
                                        >
                                            {m.auteur === "assistant" && <AvatarAssistant />}
                                            <Box sx={{ maxWidth: "78%" }}>
                                                {m.texte && (
                                                    <Paper
                                                        sx={{
                                                            p: 1.5, borderRadius: 3, boxShadow: "none",
                                                            backgroundColor: m.auteur === "medecin" ? "#0D47A1" : "#fff",
                                                            color: m.auteur === "medecin" ? "#fff" : "inherit",
                                                            border: m.auteur === "assistant" ? "1px solid #E7ECF3" : "none",
                                                        }}
                                                    >
                                                        <Typography variant="body2">{m.texte}</Typography>
                                                    </Paper>
                                                )}
                                                {m.carte && <Box sx={{ mt: m.texte ? 1 : 0 }}>{m.carte}</Box>}
                                            </Box>
                                        </Stack>
                                    ))}
                                    <div ref={finDeChat} />
                                </Stack>
                            </Box>

                            {/* Résumé enrichi de la dernière décision, si dispo */}
                            {derniereDecision && (derniereDecision.risqueDeterioration || derniereDecision.dureeSejourEstimeeHeures != null) && (
                                <Box sx={{ px: 2.5, py: 1.5, borderTop: "1px dashed #E7ECF3" }}>
                                    <Stack direction="row" gap={1} flexWrap="wrap">
                                        {derniereDecision.risqueDeterioration && (
                                            <Chip
                                                size="small"
                                                icon={<WarningAmberRounded sx={{ fontSize: "14px !important" }} />}
                                                label={risqueStyle[derniereDecision.risqueDeterioration]?.label ?? derniereDecision.risqueDeterioration}
                                                sx={{
                                                    backgroundColor: risqueStyle[derniereDecision.risqueDeterioration]?.bg,
                                                    color: risqueStyle[derniereDecision.risqueDeterioration]?.fg,
                                                    fontWeight: 700,
                                                }}
                                            />
                                        )}
                                        {derniereDecision.dureeSejourEstimeeHeures != null && (
                                            <Chip size="small" icon={<HotelRounded sx={{ fontSize: "14px !important" }} />} label={`Séjour estimé : ${Math.round(derniereDecision.dureeSejourEstimeeHeures)} h`} variant="outlined" />
                                        )}
                                        {derniereDecision.tempsAttenteEstimeMinutes != null && (
                                            <Chip size="small" icon={<AccessTimeRounded sx={{ fontSize: "14px !important" }} />} label={`Attente : ${Math.round(derniereDecision.tempsAttenteEstimeMinutes)} min`} variant="outlined" />
                                        )}
                                    </Stack>
                                </Box>
                            )}

                            <Divider />

                            {/* Actions rapides */}
                            <Stack direction="row" gap={1.25} flexWrap="wrap" sx={{ px: 2.5, py: 1.5, backgroundColor: "#fff" }}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<MedicalInformationRounded />}
                                    onClick={() => setConsultationOpen(true)}
                                >
                                    Prescrire les examens
                                </Button>
                                {examensTermines.length > 0 && dernierTriageId && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="secondary"
                                        startIcon={<PsychologyRounded />}
                                        onClick={() => setAnalyseComplementaireOpen(true)}
                                    >
                                        Analyser les résultats reçus ({examensTermines.length})
                                    </Button>
                                )}
                                {derniereDecision?.statutValidation === "VALIDEE" && (
                                    <Chip size="small" icon={<CheckCircleRounded sx={{ fontSize: "14px !important" }} />} label="Décision déjà validée" color="success" variant="outlined" />
                                )}
                            </Stack>

                            {/* Zone de saisie */}
                            <Stack direction="row" gap={1} sx={{ p: 2, borderTop: "1px solid #EEF1F6" }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Décrivez vos observations, les symptômes rapportés par le patient ou son accompagnant..."
                                    value={saisie}
                                    onChange={(e) => setSaisie(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") envoyerNote(); }}
                                />
                                <IconButton color="primary" onClick={envoyerNote} disabled={!saisie.trim()}>
                                    <SendRounded />
                                </IconButton>
                            </Stack>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            <ConsultationPrescriptionDialog
                open={consultationOpen}
                onClose={() => setConsultationOpen(false)}
                patientId={patientId}
                patientNom={patientNom}
                derniereDecision={derniereDecision}
                observationsInitiales={notesLibres.join(" — ")}
                onSuccess={() => void handleConsultationSuccess()}
            />

            <AnalyseComplementaireDialog
                open={analyseComplementaireOpen}
                onClose={() => setAnalyseComplementaireOpen(false)}
                triageId={dernierTriageId}
                patientNom={patientNom}
                onSuccess={() => void handleAnalyseComplementaireSuccess()}
            />
        </DashboardLayout>
    );
};

export default MedecinAideIAPage;
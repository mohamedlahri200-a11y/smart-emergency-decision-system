







// src/components/dashboard/radiologue/RadiologueAideIAPage.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Box, Paper, Typography, TextField, InputAdornment, Stack, Chip, Avatar,
    IconButton, Divider, LinearProgress, Button,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
    AutoAwesomeRounded, SearchRounded, MonitorHeartRounded, ArrowBackRounded,
    MedicalInformationRounded, PsychologyRounded, ImageRounded, CheckCircleRounded,
    OpenInNewRounded,
} from "@mui/icons-material";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import ExamenDetailDialog from "../shared/ExamenDetailDialog";
import { prioriteStyle } from "../shared/PatientDetailDialog";

import { examenService, type ExamenResponseDTO } from "../../../services/examenService";
import { decisionIAService } from "../../../services/decisionIAService";

const prioriteOrder: Record<string, number> = { Rouge: 0, Orange: 1, Jaune: 2, Vert: 3, Bleu: 4 };
const API_ORIGIN = "http://localhost:8080";

interface ExamenAvecPriorite extends ExamenResponseDTO {
    prioriteTriage: string | null;
}

interface MessageChat {
    id: string;
    auteur: "assistant" | "radiologue";
    texte?: string;
    carte?: React.ReactNode;
}

const statutStyle: Record<string, { color: "warning" | "info" | "success" | "error"; label: string }> = {
    PRESCRIT: { color: "warning", label: "En attente" },
    EN_COURS: { color: "info", label: "En cours" },
    TERMINE: { color: "success", label: "Terminé" },
    ANNULE: { color: "error", label: "Annulé" },
};

const AvatarAssistant = () => (
    <Avatar sx={{ bgcolor: "#0D47A1", width: 34, height: 34 }}>
        <AutoAwesomeRounded sx={{ fontSize: 18 }} />
    </Avatar>
);

const RadiologueAideIAPage: React.FC = () => {
    const [examens, setExamens] = useState<ExamenAvecPriorite[]>([]);
    const [loadingListe, setLoadingListe] = useState(true);
    const [search, setSearch] = useState("");

    const [examenId, setExamenId] = useState<number | null>(null);
    const [examenActif, setExamenActif] = useState<ExamenAvecPriorite | null>(null);
    const [messages, setMessages] = useState<MessageChat[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);

    const finDeChat = useRef<HTMLDivElement>(null);

    const fetchListe = useCallback(async (): Promise<void> => {
        setLoadingListe(true);
        try {
            const [data, decisions] = await Promise.all([
                examenService.getAll("IMAGERIE"),
                decisionIAService.getAll(),
            ]);
            const derniereDecisionParPatient = new Map<number, string>();
            for (const d of [...decisions].sort((a, b) => new Date(a.dateDecision).getTime() - new Date(b.dateDecision).getTime())) {
                derniereDecisionParPatient.set(d.patientId, d.classePredite);
            }
            const enrichis: ExamenAvecPriorite[] = data
                .map((e) => ({ ...e, prioriteTriage: derniereDecisionParPatient.get(e.patientId) ?? null }))
                .sort((a, b) => (prioriteOrder[a.prioriteTriage ?? ""] ?? 99) - (prioriteOrder[b.prioriteTriage ?? ""] ?? 99));
            setExamens(enrichis);

            if (examenId) {
                const maj = enrichis.find((e) => e.id === examenId);
                if (maj) setExamenActif(maj);
            }
        } catch {
            setExamens([]);
        } finally {
            setLoadingListe(false);
        }
    }, [examenId]);

    useEffect(() => { void fetchListe(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const filtres = useMemo(() => {
        const terme = search.trim().toLowerCase();
        if (!terme) return examens;
        return examens.filter(
            (e) => e.patientNomComplet.toLowerCase().includes(terme) || e.typeExamen.toLowerCase().includes(terme)
        );
    }, [examens, search]);

    useEffect(() => {
        finDeChat.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const ouvrirConversation = (e: ExamenAvecPriorite) => {
        setExamenId(e.id);
        setExamenActif(e);

        const prio = e.prioriteTriage ? prioriteStyle[e.prioriteTriage] : null;
        const historique: MessageChat[] = [
            {
                id: "intro",
                auteur: "assistant",
                texte: `Examen d'imagerie pour ${e.patientNomComplet} — ${e.typeExamen}, prescrit par ${e.medecinPrescripteurNomComplet}.`,
            },
            {
                id: "contexte",
                auteur: "assistant",
                carte: (
                    <Stack direction="row" gap={1} flexWrap="wrap">
                        {prio && <Chip size="small" label={prio.label} sx={{ backgroundColor: prio.bg, color: prio.fg, fontWeight: 700 }} />}
                        <Chip size="small" color={statutStyle[e.statutExamen].color} label={statutStyle[e.statutExamen].label} sx={{ fontWeight: 700 }} />
                    </Stack>
                ),
            },
        ];

        if (e.description) {
            historique.push({ id: "motif", auteur: "assistant", texte: `Motif transmis par le médecin urgentiste : "${e.description}"` });
        }

        if (e.cheminImage) {
            historique.push({
                id: "image",
                auteur: "assistant",
                texte: "Le cliché est déjà téléversé :",
                carte: (
                    <Stack direction="row" alignItems="center" gap={1}>
                        <Box component="img" src={`${API_ORIGIN}${e.cheminImage}`} alt="cliché" sx={{ width: 72, height: 72, objectFit: "cover", borderRadius: 2, border: "1px solid #E7ECF3" }} />
                        <Button size="small" variant="text" endIcon={<OpenInNewRounded />} href={`${API_ORIGIN}${e.cheminImage}`} target="_blank" rel="noreferrer">
                            Ouvrir en grand
                        </Button>
                    </Stack>
                ),
            });
        } else {
            historique.push({
                id: "pas-image",
                auteur: "assistant",
                texte: "Aucun cliché téléversé pour l'instant. Ouvrez la fiche complète pour l'ajouter.",
            });
        }

        if (e.statutExamen === "TERMINE" && e.resultat) {
            historique.push({
                id: "resultat",
                auteur: "assistant",
                texte: "Compte-rendu déjà finalisé et transmis au médecin urgentiste :",
                carte: (
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, maxWidth: 480, whiteSpace: "pre-line" }}>
                        <Typography variant="body2">{e.resultat}</Typography>
                    </Paper>
                ),
            });
        } else {
            historique.push({
                id: "invite",
                auteur: "assistant",
                texte: "Ouvrez la fiche complète pour saisir vos observations : l'assistant structure automatiquement le compte-rendu (Technique / Résultats / Conclusion), détecte les mots-clés critiques, et propose une analyse d'image expérimentale par CNN. Vous gardez la main sur la décision finale.",
            });
        }

        setMessages(historique);
    };

    const handleUpdated = async () => {
        await fetchListe();
        setMessages((prev) => [
            ...prev,
            {
                id: `maj-${Date.now()}`,
                auteur: "assistant",
                texte: "Mise à jour enregistrée. Si le compte-rendu est finalisé, il est désormais visible par le médecin urgentiste — une alerte automatique lui sera envoyée si des mots-clés critiques ont été détectés.",
            },
        ]);
    };

    return (
        <DashboardLayout
            title="Aide IA — Médecin Radiologue"
            subtitle="Assistant conversationnel pour la rédaction du compte-rendu et l'analyse des clichés"
        >
            <Grid container spacing={2.5} sx={{ height: "calc(100vh - 190px)" }}>
                <Grid size={{ xs: 12, md: examenId ? 3.5 : 12 }} sx={{ display: examenId ? { xs: "none", md: "block" } : "block" }}>
                    <Paper sx={{ height: "100%", borderRadius: 4, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                        <Box sx={{ p: 2, borderBottom: "1px solid #EEF1F6" }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Rechercher un examen..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> } }}
                            />
                        </Box>
                        <Box sx={{ overflowY: "auto", flex: 1 }}>
                            {loadingListe && <LinearProgress />}
                            {!loadingListe && filtres.map((e) => {
                                const prio = e.prioriteTriage ? prioriteStyle[e.prioriteTriage] : null;
                                const actif = e.id === examenId;
                                return (
                                    <Box
                                        key={e.id}
                                        onClick={() => ouvrirConversation(e)}
                                        sx={{
                                            p: 1.75, display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer",
                                            backgroundColor: actif ? "#EEF4FD" : "transparent",
                                            borderLeft: actif ? "3px solid #0D47A1" : "3px solid transparent",
                                            "&:hover": { backgroundColor: "#F9FBFD" },
                                        }}
                                    >
                                        <Avatar sx={{ width: 34, height: 34, bgcolor: "#EEF1F6", color: "#0D47A1" }}><MonitorHeartRounded fontSize="small" /></Avatar>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="body2" fontWeight={700} noWrap>{e.patientNomComplet}</Typography>
                                            <Typography variant="caption" color="text.secondary" noWrap>{e.typeExamen}</Typography>
                                        </Box>
                                        {prio && <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: prio.fg, flexShrink: 0 }} />}
                                    </Box>
                                );
                            })}
                        </Box>
                    </Paper>
                </Grid>

                {examenId && examenActif && (
                    <Grid size={{ xs: 12, md: 8.5 }} sx={{ height: "100%" }}>
                        <Paper sx={{ height: "100%", borderRadius: 4, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                            <Stack direction="row" alignItems="center" gap={1.5} sx={{ p: 2, borderBottom: "1px solid #EEF1F6" }}>
                                <IconButton size="small" onClick={() => setExamenId(null)} sx={{ display: { md: "none" } }}>
                                    <ArrowBackRounded />
                                </IconButton>
                                <AvatarAssistant />
                                <Box sx={{ flex: 1 }}>
                                    <Typography fontWeight={800}>Assistant IA — {examenActif.patientNomComplet}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Assistant de structuration de compte-rendu + analyse CNN expérimentale
                                    </Typography>
                                </Box>
                            </Stack>

                            <Box sx={{ flex: 1, overflowY: "auto", p: 2.5, backgroundColor: "#F9FBFD" }}>
                                <Stack spacing={2}>
                                    {messages.map((m) => (
                                        <Stack key={m.id} direction="row" alignItems="flex-start" gap={1}>
                                            <AvatarAssistant />
                                            <Box sx={{ maxWidth: "80%" }}>
                                                {m.texte && (
                                                    <Paper sx={{ p: 1.5, borderRadius: 3, boxShadow: "none", border: "1px solid #E7ECF3" }}>
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

                            <Divider />

                            <Stack direction="row" gap={1.25} flexWrap="wrap" alignItems="center" sx={{ px: 2.5, py: 2, backgroundColor: "#fff" }}>
                                <Button
                                    variant="contained"
                                    startIcon={examenActif.statutExamen === "TERMINE" ? <CheckCircleRounded /> : <MedicalInformationRounded />}
                                    onClick={() => setDialogOpen(true)}
                                >
                                    {examenActif.statutExamen === "TERMINE" ? "Revoir la fiche complète" : "Ouvrir la fiche — rédiger le compte-rendu"}
                                </Button>
                                {examenActif.cheminImage && (
                                    <Chip size="small" icon={<ImageRounded sx={{ fontSize: "14px !important" }} />} label="Cliché disponible" variant="outlined" />
                                )}
                                {examenActif.compteRenduCritique && (
                                    <Chip size="small" icon={<PsychologyRounded sx={{ fontSize: "14px !important" }} />} color="error" label="Alerte critique envoyée" />
                                )}
                            </Stack>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            <ExamenDetailDialog
                examenId={examenId}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onUpdated={() => void handleUpdated()}
            />
        </DashboardLayout>
    );
};

export default RadiologueAideIAPage;
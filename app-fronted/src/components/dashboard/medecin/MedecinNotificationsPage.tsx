// src/components/dashboard/medecin/MedecinNotificationsPage.tsx
import React, { useState } from "react";
import { Box, Paper, Stack, Typography, Chip, ToggleButtonGroup, ToggleButton } from "@mui/material";
import {
    NotificationsRounded, ScienceRounded, MonitorHeartRounded, PersonRounded, ChevronRightRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import { useDashboardAlerts, type SourceNotification } from "../../../hooks/useDashboardAlerts";

const severiteStyle: Record<string, { bg: string; fg: string; label: string }> = {
    critical: { bg: "#FDEBEC", fg: "#D32F2F", label: "Critique" },
    warning: { bg: "#FEF2E4", fg: "#F2A93B", label: "À traiter" },
    info: { bg: "#E8F0FE", fg: "#1565C0", label: "Info" },
};

const sourceIcon: Record<SourceNotification, React.ReactElement> = {
    Infirmier: <PersonRounded fontSize="small" />,
    Radiologue: <MonitorHeartRounded fontSize="small" />,
    Biologiste: <ScienceRounded fontSize="small" />,
};

const MedecinNotificationsPage: React.FC = () => {
    const { alerts, loading } = useDashboardAlerts();
    const [filtre, setFiltre] = useState<SourceNotification | "TOUS">("TOUS");
    const navigate = useNavigate();

    const filtrees = filtre === "TOUS" ? alerts : alerts.filter((a) => a.source === filtre);

    const compteurs: Record<SourceNotification, number> = {
        Infirmier: alerts.filter((a) => a.source === "Infirmier").length,
        Radiologue: alerts.filter((a) => a.source === "Radiologue").length,
        Biologiste: alerts.filter((a) => a.source === "Biologiste").length,
    };

    return (
        <DashboardLayout title="Notifications" subtitle="Alertes en provenance de l'infirmier d'accueil, du radiologue et du biologiste">
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <NotificationsRounded color="primary" />
                <Typography fontWeight={800}>{alerts.length} notification{alerts.length > 1 ? "s" : ""} au total</Typography>
            </Stack>

            <ToggleButtonGroup
                value={filtre}
                exclusive
                onChange={(_, val) => val && setFiltre(val)}
                size="small"
                sx={{ mb: 3, flexWrap: "wrap" }}
            >
                <ToggleButton value="TOUS">Toutes ({alerts.length})</ToggleButton>
                <ToggleButton value="Infirmier">
                    <PersonRounded fontSize="small" sx={{ mr: 0.5 }} /> Infirmier d'accueil ({compteurs.Infirmier})
                </ToggleButton>
                <ToggleButton value="Radiologue">
                    <MonitorHeartRounded fontSize="small" sx={{ mr: 0.5 }} /> Médecin radiologue ({compteurs.Radiologue})
                </ToggleButton>
                <ToggleButton value="Biologiste">
                    <ScienceRounded fontSize="small" sx={{ mr: 0.5 }} /> Médecin biologiste ({compteurs.Biologiste})
                </ToggleButton>
            </ToggleButtonGroup>

            <Paper sx={{ borderRadius: 4, overflow: "hidden" }}>
                {loading && (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography color="text.secondary">Chargement...</Typography>
                    </Box>
                )}

                {!loading && filtrees.length === 0 && (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography color="text.secondary">Aucune notification pour ce filtre.</Typography>
                    </Box>
                )}

                <Stack divider={<Box sx={{ borderBottom: "1px solid #EEF1F6" }} />}>
                    {filtrees.map((a) => {
                        const sev = severiteStyle[a.severity];
                        return (
                            <Box
                                key={a.id}
                                onClick={() => navigate(a.path)}
                                sx={{
                                    p: 2, display: "flex", alignItems: "center", gap: 2, cursor: "pointer",
                                    transition: "background-color 0.15s",
                                    "&:hover": { backgroundColor: "#F9FBFD" },
                                }}
                            >
                                <Box sx={{ color: sev.fg }}>{sourceIcon[a.source]}</Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight={600}>{a.label}</Typography>
                                    <Typography variant="caption" color="text.secondary">Source : {a.source}</Typography>
                                </Box>
                                <Chip size="small" label={sev.label} sx={{ backgroundColor: sev.bg, color: sev.fg, fontWeight: 700 }} />
                                <ChevronRightRounded sx={{ color: "text.disabled" }} />
                            </Box>
                        );
                    })}
                </Stack>
            </Paper>
        </DashboardLayout>
    );
};

export default MedecinNotificationsPage;
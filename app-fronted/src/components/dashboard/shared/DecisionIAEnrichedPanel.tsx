// src/components/dashboard/shared/DecisionIAEnrichedPanel.tsx
import React from "react";
import { Box, Typography, Chip, Stack, LinearProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
    ScienceRounded,
    MonitorHeartRounded,
    LocalHospitalRounded,
    MedicationRounded,
    TipsAndUpdatesRounded,
    PsychologyRounded,
    WarningAmberRounded,
    AccessTimeRounded,
    HotelRounded,
} from "@mui/icons-material";
import type { DecisionIAResponseDTO } from "../../../services/decisionIAService";

interface Props {
    decision: DecisionIAResponseDTO;
}

const risqueDeteriorationStyle: Record<string, { bg: string; fg: string; label: string }> = {
    Faible: { bg: "#EAF7EE", fg: "#2E7D32", label: "Risque d'aggravation faible" },
    Modere: { bg: "#FEFBE8", fg: "#B7950B", label: "Risque d'aggravation modéré" },
    Eleve: { bg: "#FEF2E4", fg: "#E65100", label: "Risque d'aggravation élevé" },
    Critique: { bg: "#FDEBEC", fg: "#D32F2F", label: "Risque d'aggravation critique" },
};

const SectionTitle: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 1 }}>
        {icon}
        <Typography variant="body2" fontWeight={800}>{children}</Typography>
    </Stack>
);

const ChipList: React.FC<{ items: string[] | null; color: string; bg: string }> = ({ items, color, bg }) => {
    if (!items || items.length === 0) {
        return <Typography variant="caption" color="text.secondary">Aucun élément identifié.</Typography>;
    }
    return (
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {items.map((item) => (
                <Chip key={item} label={item} size="small" sx={{ backgroundColor: bg, color, fontWeight: 600 }} />
            ))}
        </Stack>
    );
};

const DecisionIAEnrichedPanel: React.FC<Props> = ({ decision: d }) => {
    const risque = d.risqueDeterioration ? risqueDeteriorationStyle[d.risqueDeterioration] : null;
    const aUneDonneeEnrichie =
        (d.examensRecommandes?.length ?? 0) > 0 ||
        (d.analysesRecommandees?.length ?? 0) > 0 ||
        (d.protocolesRecommandes?.length ?? 0) > 0 ||
        (d.recommandationsPatient?.length ?? 0) > 0 ||
        Boolean(d.risqueDeterioration) ||
        d.dureeSejourEstimeeHeures != null;

    if (!aUneDonneeEnrichie) return null;

    const topFeatures = d.explicationDetaillee?.top_features ?? [];

    return (
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px dashed #D8E0EC" }}>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                {risque && (
                    <Chip
                        icon={<WarningAmberRounded sx={{ fontSize: "16px !important" }} />}
                        label={risque.label}
                        size="small"
                        sx={{ backgroundColor: risque.bg, color: risque.fg, fontWeight: 700 }}
                    />
                )}
                {d.risqueClinique && d.risqueClinique.toLowerCase() !== "aucun" && (
                    <Chip
                        icon={<PsychologyRounded sx={{ fontSize: "16px !important" }} />}
                        label={`Suspicion : ${d.risqueClinique}`}
                        size="small"
                        color="error"
                        sx={{ fontWeight: 700 }}
                    />
                )}
                {d.dureeSejourEstimeeHeures != null && (
                    <Chip
                        icon={<HotelRounded sx={{ fontSize: "16px !important" }} />}
                        label={`Séjour estimé : ${Math.round(d.dureeSejourEstimeeHeures)} h`}
                        size="small"
                        variant="outlined"
                    />
                )}
                {d.tempsAttenteEstimeMinutes != null && (
                    <Chip
                        icon={<AccessTimeRounded sx={{ fontSize: "16px !important" }} />}
                        label={`Attente estimée : ${Math.round(d.tempsAttenteEstimeMinutes)} min`}
                        size="small"
                        variant="outlined"
                    />
                )}
            </Stack>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <SectionTitle icon={<LocalHospitalRounded fontSize="small" color="primary" />}>
                        Examens d'imagerie recommandés
                    </SectionTitle>
                    <ChipList items={d.examensRecommandes} color="#1565C0" bg="#E8F0FE" />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <SectionTitle icon={<ScienceRounded fontSize="small" color="primary" />}>
                        Analyses biologiques recommandées
                    </SectionTitle>
                    <ChipList items={d.analysesRecommandees} color="#6A1B9A" bg="#F3E5F5" />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <SectionTitle icon={<MonitorHeartRounded fontSize="small" color="primary" />}>
                        Facteurs de risque identifiés
                    </SectionTitle>
                    <ChipList items={d.facteursRisqueIdentifies} color="#E65100" bg="#FEF2E4" />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <SectionTitle icon={<MedicationRounded fontSize="small" color="primary" />}>
                        Protocoles thérapeutiques suggérés
                    </SectionTitle>
                    <ChipList items={d.protocolesRecommandes} color="#2E7D32" bg="#EAF7EE" />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <SectionTitle icon={<TipsAndUpdatesRounded fontSize="small" color="primary" />}>
                        Recommandations personnalisées au patient
                    </SectionTitle>
                    {d.recommandationsPatient && d.recommandationsPatient.length > 0 ? (
                        <Stack component="ul" sx={{ m: 0, pl: 2.5 }} spacing={0.4}>
                            {d.recommandationsPatient.map((r) => (
                                <Typography key={r} component="li" variant="body2" color="text.secondary">
                                    {r}
                                </Typography>
                            ))}
                        </Stack>
                    ) : (
                        <Typography variant="caption" color="text.secondary">Aucune recommandation particulière.</Typography>
                    )}
                </Grid>
            </Grid>

            {d.explicationDetaillee && (
                <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #D8E0EC" }}>
                    <SectionTitle icon={<PsychologyRounded fontSize="small" color="primary" />}>
                        Pourquoi cette décision ? (explicabilité IA — {d.explicationDetaillee.method})
                    </SectionTitle>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {d.explicationDetaillee.summary}
                    </Typography>

                    {topFeatures.length > 0 && (
                        <Stack spacing={1}>
                            {topFeatures.slice(0, 5).map((f) => {
                                const positive = f.direction === "positive";
                                const largeurBarre = Math.min(100, Math.abs(f.impact) * 100);
                                return (
                                    <Box key={f.feature}>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="caption" fontWeight={600}>
                                                {f.feature}{" "}
                                                <Typography component="span" variant="caption" color="text.secondary">
                                                    ({f.value})
                                                </Typography>
                                            </Typography>
                                            <Typography variant="caption" color={positive ? "#D32F2F" : "#2E7D32"} fontWeight={700}>
                                                {positive ? "aggrave" : "rassure"}
                                            </Typography>
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={largeurBarre}
                                            sx={{
                                                height: 6,
                                                borderRadius: 3,
                                                backgroundColor: "#EEF1F6",
                                                "& .MuiLinearProgress-bar": {
                                                    backgroundColor: positive ? "#D32F2F" : "#2E7D32",
                                                },
                                            }}
                                        />
                                    </Box>
                                );
                            })}
                        </Stack>
                    )}

                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
                        {d.versionModele && (
                            <Typography variant="caption" color="text.secondary">
                                Modèle : {d.versionModele}
                            </Typography>
                        )}
                        {d.scoreConfiance != null && (
                            <Typography variant="caption" color="text.secondary">
                                Confiance du modèle : {Math.round(d.scoreConfiance * 100)}%
                            </Typography>
                        )}
                    </Stack>
                </Box>
            )}
        </Box>
    );
};

export default DecisionIAEnrichedPanel;
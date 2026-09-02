// src/components/dashboard/biologiste/BiologisteAnalysesPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, TextField, InputAdornment, Stack, Typography } from "@mui/material";
import { SearchRounded } from "@mui/icons-material";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import ExamensATraiterTable, { type ExamenAvecPriorite } from "../shared/ExamensATraiterTable";
import ExamenDetailDialog from "../shared/ExamenDetailDialog";

import { examenService } from "../../../services/examenService";
import { decisionIAService } from "../../../services/decisionIAService";

const prioriteOrder: Record<string, number> = { Rouge: 0, Orange: 1, Jaune: 2, Vert: 3, Bleu: 4 };

const BiologisteAnalysesPage: React.FC = () => {
    const [examens, setExamens] = useState<ExamenAvecPriorite[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedExamenId, setSelectedExamenId] = useState<number | null>(null);

    const fetchData = useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            const [data, decisions] = await Promise.all([
                examenService.getAll("BIOLOGIE"),
                decisionIAService.getAll(),
            ]);

            const derniereDecisionParPatient = new Map<number, string>();
            for (const d of [...decisions].sort((a, b) => new Date(a.dateDecision).getTime() - new Date(b.dateDecision).getTime())) {
                derniereDecisionParPatient.set(d.patientId, d.classePredite);
            }

            const enrichis: ExamenAvecPriorite[] = data
                .filter((e) => e.statutExamen === "PRESCRIT" || e.statutExamen === "EN_COURS")
                .map((e) => ({ ...e, prioriteTriage: derniereDecisionParPatient.get(e.patientId) ?? null }))
                .sort((a, b) => (prioriteOrder[a.prioriteTriage ?? ""] ?? 99) - (prioriteOrder[b.prioriteTriage ?? ""] ?? 99));

            setExamens(enrichis);
        } catch {
            setExamens([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return examens;
        return examens.filter(
            (e) => e.patientNomComplet.toLowerCase().includes(term) || e.typeExamen.toLowerCase().includes(term)
        );
    }, [examens, search]);

    return (
        <DashboardLayout title="Analyses à réaliser" subtitle="Demandes biologiques en attente ou en cours">
            <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }} flexWrap="wrap">
                <TextField
                    size="small"
                    sx={{ flex: 1, minWidth: 240 }}
                    placeholder="Rechercher par patient ou type d'analyse..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    slotProps={{
                        input: { startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> },
                    }}
                />
            </Stack>

            <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    {filtered.length} analyse{filtered.length > 1 ? "s" : ""} à traiter
                </Typography>
            </Box>

            <ExamensATraiterTable examens={filtered} loading={loading} onRowClick={setSelectedExamenId} title="Liste des analyses" />

            <ExamenDetailDialog
                examenId={selectedExamenId}
                open={selectedExamenId !== null}
                onClose={() => setSelectedExamenId(null)}
                onUpdated={fetchData}
            />
        </DashboardLayout>
    );
};

export default BiologisteAnalysesPage;
// src/components/dashboard/medecin/MedecinPatientsPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, TextField, InputAdornment, Stack, Chip, Typography } from "@mui/material";
import { SearchRounded, CloseRounded } from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import PatientsAConsulterTable from "./PatientsAConsulterTable";
import PatientDetailDialog from "../shared/PatientDetailDialog";
import { prioriteStyle } from "../shared/PatientDetailDialog";

import { patientService, calculerAge } from "../../../services/patientService";
import { decisionIAService } from "../../../services/decisionIAService";
import type { PatientAConsulter } from "../../../types/medecin.types";

const prioriteOrder: Record<string, number> = {
    Rouge: 0,
    Orange: 1,
    Jaune: 2,
    Vert: 3,
    Bleu: 4,
};

const MedecinPatientsPage: React.FC = () => {
    const [aConsulter, setAConsulter] = useState<PatientAConsulter[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const prioriteFiltre = searchParams.get("priorite");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [patients, decisions] = await Promise.all([
                patientService.getAll(),
                decisionIAService.getAll(),
            ]);
            const patientById = new Map(patients.map((p) => [p.id, p]));

            const liste: PatientAConsulter[] = decisions
                .filter((d) => d.statutValidation === "EN_ATTENTE")
                .map((d) => {
                    const p = patientById.get(d.patientId);
                    if (!p) return null;
                    return {
                        id: p.id,
                        numeroDossier: p.numeroDossier,
                        nomComplet: `${p.nom} ${p.prenom}`,
                        age: calculerAge(p.dateNaissance),
                        sexe: p.sexe === "HOMME" ? "H" : "F",
                        heureArrivee: new Date(p.dateEnregistrement).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                        decisionId: d.id,
                        classePredite: d.classePredite,
                        scorePrediction: d.scorePrediction,
                        recommandationService: d.recommandationService,
                        dateDecision: d.dateDecision,
                    } satisfies PatientAConsulter;
                })
                .filter((x): x is PatientAConsulter => x !== null)
                .sort((a, b) => (prioriteOrder[a.classePredite] ?? 99) - (prioriteOrder[b.classePredite] ?? 99));

            setAConsulter(liste);
        } catch {
            setAConsulter([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filtered = useMemo(() => {
        let list = aConsulter;
        if (prioriteFiltre) list = list.filter((p) => p.classePredite === prioriteFiltre);
        const term = search.trim().toLowerCase();
        if (term) {
            list = list.filter(
                (p) => p.nomComplet.toLowerCase().includes(term) || p.numeroDossier.toLowerCase().includes(term)
            );
        }
        return list;
    }, [aConsulter, search, prioriteFiltre]);

    return (
        <DashboardLayout title="Patients à consulter" subtitle="Dossiers transmis par le triage, en attente de votre décision">
            <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }} flexWrap="wrap">
                <TextField
                    size="small"
                    sx={{ flex: 1, minWidth: 240 }}
                    placeholder="Rechercher par nom ou n° dossier..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRounded fontSize="small" />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
                {prioriteFiltre && (
                    <Chip
                        label={prioriteStyle[prioriteFiltre]?.label ?? prioriteFiltre}
                        onDelete={() => setSearchParams({})}
                        deleteIcon={<CloseRounded />}
                        color="primary"
                        sx={{ fontWeight: 700 }}
                    />
                )}
            </Stack>

            <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    {filtered.length} patient{filtered.length > 1 ? "s" : ""} en attente de consultation
                </Typography>
            </Box>

            <PatientsAConsulterTable
                patients={filtered}
                loading={loading}
                onRowClick={setSelectedPatientId}
                title="Liste des patients"
            />

            <PatientDetailDialog
                patientId={selectedPatientId}
                open={selectedPatientId !== null}
                onClose={() => setSelectedPatientId(null)}
                canValidate
                onValidated={fetchData}
            />
        </DashboardLayout>
    );
};

export default MedecinPatientsPage;

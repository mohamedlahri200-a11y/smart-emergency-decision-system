// src/components/dashboard/infirmier/InfirmierHistoriquePage.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Paper, Chip, Stack, Typography } from "@mui/material";
import { CloseRounded } from "@mui/icons-material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useSearchParams } from "react-router-dom";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import PatientDetailDialog from "../shared/PatientDetailDialog";
import { prioriteStyle } from "../shared/PatientDetailDialog";
import { decisionIAService, type DecisionIAResponseDTO } from "../../../services/decisionIAService";

const statutStyle: Record<string, { color: "warning" | "success" | "error" | "info"; label: string }> = {
    EN_ATTENTE: { color: "warning", label: "En attente médecin" },
    VALIDEE: { color: "success", label: "Validée" },
    REJETEE: { color: "error", label: "Rejetée" },
    MODIFIEE: { color: "info", label: "Modifiée" },
};

const columns: GridColDef<DecisionIAResponseDTO>[] = [
    { field: "dateDecision", headerName: "Date", width: 170, valueGetter: (_value, row) => new Date(row.dateDecision).toLocaleString("fr-FR") },
    { field: "patientNomComplet", headerName: "Patient", flex: 1, minWidth: 200 },
    {
        field: "classePredite",
        headerName: "Priorité IA",
        width: 170,
        renderCell: (params) => {
            const value = (params.value as string) ?? "";
            const cfg = prioriteStyle[value] ?? { bg: "#EEE", fg: "#555", label: value || "—" };
            return <Chip label={cfg.label} size="small" sx={{ backgroundColor: cfg.bg, color: cfg.fg, fontWeight: 700 }} />;
        },
    },
    { field: "recommandationService", headerName: "Service recommandé", width: 190 },
    {
        field: "statutValidation",
        headerName: "Statut médecin",
        width: 170,
        renderCell: (params) => {
            const value = (params.value as string) ?? "";
            const cfg = statutStyle[value] ?? { color: "info" as const, label: value || "—" };
            return <Chip label={cfg.label} size="small" color={cfg.color} sx={{ fontWeight: 700 }} />;
        },
    },
    { field: "medecinValidateurNomComplet", headerName: "Médecin", width: 180 },
];

const InfirmierHistoriquePage: React.FC = () => {
    const [decisions, setDecisions] = useState<DecisionIAResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const statutFiltre = searchParams.get("statut");
    const prioriteFiltre = searchParams.get("priorite");

    const fetchHistorique = useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            const data = await decisionIAService.getAll();
            const sorted = [...data].sort((a, b) => new Date(b.dateDecision).getTime() - new Date(a.dateDecision).getTime());
            setDecisions(sorted);
        } catch {
            setDecisions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchHistorique();
    }, [fetchHistorique]);

    const filtered = useMemo(() => {
        return decisions.filter((d) => {
            if (statutFiltre && d.statutValidation !== statutFiltre) return false;
            if (prioriteFiltre && d.classePredite !== prioriteFiltre) return false;
            return true;
        });
    }, [decisions, statutFiltre, prioriteFiltre]);

    const clearFilters = () => setSearchParams({});

    const activeFilterLabel = statutFiltre
        ? statutStyle[statutFiltre]?.label ?? statutFiltre
        : prioriteFiltre
            ? prioriteStyle[prioriteFiltre]?.label ?? prioriteFiltre
            : null;

    return (
        <DashboardLayout title="Historique" subtitle="Ensemble des triages analysés et de leurs décisions">
            {activeFilterLabel && (
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Filtre actif :</Typography>
                    <Chip label={activeFilterLabel} onDelete={clearFilters} deleteIcon={<CloseRounded />} color="primary" sx={{ fontWeight: 700 }} />
                </Stack>
            )}

            <Paper sx={{ p: 2.5, borderRadius: 4 }}>
                <Box sx={{ height: 560, width: "100%" }}>
                    <DataGrid
                        rows={filtered}
                        columns={columns}
                        loading={loading}
                        getRowId={(row) => row.id}
                        disableRowSelectionOnClick
                        density="comfortable"
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        onRowClick={(params) => setSelectedPatientId(params.row.patientId as number)}
                        sx={{ "& .MuiDataGrid-row": { cursor: "pointer" } }}
                    />
                </Box>
            </Paper>

            <PatientDetailDialog patientId={selectedPatientId} open={selectedPatientId !== null} onClose={() => setSelectedPatientId(null)} />
        </DashboardLayout>
    );
};

export default InfirmierHistoriquePage;

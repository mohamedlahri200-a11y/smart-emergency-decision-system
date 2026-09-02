// src/components/dashboard/medecin/PatientsAConsulterTable.tsx
import React from "react";
import { Paper, Typography, Chip, Box } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { prioriteStyle } from "../shared/PatientDetailDialog";
import type { PatientAConsulter } from "../../../types/medecin.types";

interface Props {
    patients: PatientAConsulter[];
    loading?: boolean;
    onRowClick?: (patientId: number) => void;
    title?: string;
}

const columns: GridColDef<PatientAConsulter>[] = [
    { field: "numeroDossier", headerName: "N° Dossier", width: 150 },
    { field: "nomComplet", headerName: "Patient", flex: 1, minWidth: 180 },
    { field: "age", headerName: "Âge", width: 80 },
    { field: "sexe", headerName: "Sexe", width: 90 },
    { field: "heureArrivee", headerName: "Arrivée", width: 110 },
    {
        field: "classePredite",
        headerName: "Priorité IA",
        width: 170,
        renderCell: (params) => {
            const value = (params.value as string) ?? "";
            const cfg = prioriteStyle[value] ?? { bg: "#EEE", fg: "#555", label: value || "—" };
            return (
                <Chip
                    label={cfg.label}
                    size="small"
                    sx={{ backgroundColor: cfg.bg, color: cfg.fg, fontWeight: 700 }}
                />
            );
        },
    },
    { field: "recommandationService", headerName: "Service recommandé", width: 190 },
];

const PatientsAConsulterTable: React.FC<Props> = ({ patients, loading, onRowClick, title }) => {
    return (
        <Paper sx={{ p: 2.5, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                {title ?? "Patients transmis par le triage"}
            </Typography>
            <Box sx={{ height: 460, width: "100%" }}>
                <DataGrid
                    rows={patients}
                    columns={columns}
                    loading={loading}
                    getRowId={(row) => row.id}
                    disableRowSelectionOnClick
                    density="comfortable"
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    onRowClick={onRowClick ? (params) => onRowClick(params.row.id as number) : undefined}
                    sx={onRowClick ? { "& .MuiDataGrid-row": { cursor: "pointer" } } : undefined}
                />
            </Box>
        </Paper>
    );
};

export default PatientsAConsulterTable;

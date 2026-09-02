


// src/components/dashboard/shared/ExamensATraiterTable.tsx
import React from "react";
import { Paper, Typography, Chip, Box } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { keyframes } from "@mui/material/styles";
import { prioriteStyle } from "./PatientDetailDialog";
import type { ExamenResponseDTO } from "../../../services/examenService";

export interface ExamenAvecPriorite extends ExamenResponseDTO {
    prioriteTriage: string | null;
}

interface Props {
    examens: ExamenAvecPriorite[];
    loading?: boolean;
    onRowClick?: (examenId: number) => void;
    title?: string;
}

const rougePulse = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.35); }
    50%      { box-shadow: 0 0 0 5px rgba(211, 47, 47, 0); }
`;

const statutStyle: Record<string, { color: "warning" | "info" | "success" | "error"; label: string }> = {
    PRESCRIT: { color: "warning", label: "Prescrit" },
    EN_COURS: { color: "info", label: "En cours" },
    TERMINE: { color: "success", label: "Terminé" },
    ANNULE: { color: "error", label: "Annulé" },
};

const columns: GridColDef<ExamenAvecPriorite>[] = [
    {
        field: "datePrescription",
        headerName: "Prescrit le",
        width: 170,
        valueGetter: (_value, row) => new Date(row.datePrescription).toLocaleString("fr-FR"),
    },
    { field: "patientNomComplet", headerName: "Patient", flex: 1, minWidth: 180 },
    {
        field: "prioriteTriage",
        headerName: "Priorité",
        width: 160,
        renderCell: (params) => {
            const value = params.value as string | null;
            if (!value) return <Chip size="small" label="—" />;
            const cfg = prioriteStyle[value] ?? { bg: "#EEE", fg: "#555", label: value };
            const estCritique = value === "Rouge";
            return (
                <Chip
                    size="small"
                    label={cfg.label}
                    sx={{
                        backgroundColor: cfg.bg,
                        color: cfg.fg,
                        fontWeight: estCritique ? 800 : 700,
                        border: estCritique ? "1.5px solid #D32F2F" : "none",
                        animation: estCritique ? `${rougePulse} 1.8s infinite` : "none",
                    }}
                />
            );
        },
    },
    { field: "typeExamen", headerName: "Type d'examen", width: 190 },
    { field: "medecinPrescripteurNomComplet", headerName: "Prescripteur", width: 180 },
    {
        field: "statutExamen",
        headerName: "Statut",
        width: 140,
        renderCell: (params) => {
            const value = (params.value as string) ?? "";
            const cfg = statutStyle[value] ?? { color: "info" as const, label: value };
            return <Chip size="small" color={cfg.color} label={cfg.label} sx={{ fontWeight: 700 }} />;
        },
    },
];

const ExamensATraiterTable: React.FC<Props> = ({ examens, loading, onRowClick, title }) => {
    return (
        <Paper sx={{ p: 2.5, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                {title ?? "Examens"}
            </Typography>
            <Box sx={{ height: 480, width: "100%" }}>
                <DataGrid
                    rows={examens}
                    columns={columns}
                    loading={loading}
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

export default ExamensATraiterTable;

// src/components/dashboard/infirmier/PatientsTable.tsx
import React from "react";
import { Paper, Typography, Chip, Box } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { CheckCircleRounded, HourglassEmptyRounded } from "@mui/icons-material";
import { keyframes } from "@mui/material/styles";
import { CouleurTriage, StatutPatient, type PatientListItem } from "../../../types/infirmier.types";

interface Props {
    patients: PatientListItem[];
    loading?: boolean;
    onRowClick?: (patientId: number) => void;
}

const couleurChip: Record<CouleurTriage, { bg: string; fg: string; label: string }> = {
    [CouleurTriage.ROUGE]: { bg: "#FDEBEC", fg: "#D32F2F", label: "Rouge — Vital" },
    [CouleurTriage.ORANGE]: { bg: "#FEF2E4", fg: "#F2A93B", label: "Orange — Urgent" },
    [CouleurTriage.JAUNE]: { bg: "#FEFBE8", fg: "#B7950B", label: "Jaune — Modéré" },
    [CouleurTriage.VERT]: { bg: "#EAF7EE", fg: "#2E7D32", label: "Vert — Mineur" },
    [CouleurTriage.BLEU]: { bg: "#E8F0FE", fg: "#1565C0", label: "Bleu — Non urgent" },
};

const rougePulse = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.35); }
    50%      { box-shadow: 0 0 0 5px rgba(211, 47, 47, 0); }
`;

const statutConfig: Record<StatutPatient, { label: string; color: "default" | "warning" | "success"; icon?: React.ReactElement }> = {
    [StatutPatient.EN_ATTENTE_TRIAGE]: { label: "En attente de triage", color: "default" },
    [StatutPatient.EN_ATTENTE_MEDECIN]: {
        label: "Transmis au médecin",
        color: "warning",
        icon: <HourglassEmptyRounded sx={{ fontSize: "16px !important" }} />,
    },
    [StatutPatient.PRIS_EN_CHARGE]: {
        label: "Pris en charge",
        color: "success",
        icon: <CheckCircleRounded sx={{ fontSize: "16px !important" }} />,
    },
};

const columns: GridColDef<PatientListItem>[] = [
    { field: "numeroDossier", headerName: "N° Dossier", width: 150 },
    { field: "nomComplet", headerName: "Patient", flex: 1, minWidth: 180 },
    { field: "heureArrivee", headerName: "Heure d'arrivée", width: 140 },
    {
        field: "couleurTriage",
        headerName: "Priorité",
        width: 180,
        renderCell: (params) => {
            const couleur = params.value as CouleurTriage | null;
            if (!couleur) return <Chip label="Non triée" size="small" />;
            const cfg = couleurChip[couleur];
            const estCritique = couleur === CouleurTriage.ROUGE;
            return (
                <Chip
                    label={cfg.label}
                    size="small"
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
    {
        field: "statut",
        headerName: "Statut",
        width: 190,
        renderCell: (params) => {
            const cfg = statutConfig[params.value as StatutPatient];
            return (
                <Chip
                    label={cfg.label}
                    size="small"
                    color={cfg.color}
                    icon={cfg.icon}
                    variant={cfg.color === "default" ? "outlined" : "filled"}
                    sx={{ fontWeight: 700 }}
                />
            );
        },
    },
];

const PatientsTable: React.FC<Props> = ({ patients, loading, onRowClick }) => {
    return (
        <Paper sx={{ p: 2.5, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                Derniers patients enregistrés
            </Typography>
            <Box sx={{ height: 420, width: "100%" }}>
                <DataGrid
                    rows={patients}
                    columns={columns}
                    loading={loading}
                    disableRowSelectionOnClick
                    density="comfortable"
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    onRowClick={onRowClick ? (params) => onRowClick(params.row.id as number) : undefined}
                    sx={onRowClick ? { "& .MuiDataGrid-row": { cursor: "pointer" } } : undefined}
                />
            </Box>
        </Paper>
    );
};

export default PatientsTable;
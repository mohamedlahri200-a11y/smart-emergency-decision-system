// src/components/dashboard/chef-service/SupervisionMedecinsTable.tsx
import React from "react";
import { Paper, Typography, Chip, Box, Stack, LinearProgress } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { LocalHospitalRounded } from "@mui/icons-material";
import type { SupervisionMedecin } from "../../../services/chefServiceService";

interface Props {
    medecins: SupervisionMedecin[];
    loading?: boolean;
}

const columns: GridColDef<SupervisionMedecin>[] = [
    { field: "nom", headerName: "Médecin", flex: 1, minWidth: 180 },
    { field: "nbPatients", headerName: "Patients pris en charge", width: 180 },
    { field: "nbTermines", headerName: "Dossiers terminés", width: 160 },
    {
        field: "tempsMoyenConsultationMinutes",
        headerName: "Temps moyen (décision)",
        width: 190,
        valueGetter: (_v, row) => row.tempsMoyenConsultationMinutes !== null ? `${row.tempsMoyenConsultationMinutes} min` : "—",
    },
    {
        field: "nbCasCritiquesTraites",
        headerName: "Cas critiques traités",
        width: 170,
        renderCell: (params) => (
            <Chip size="small" label={params.value} color={Number(params.value) > 0 ? "error" : "default"} variant={Number(params.value) > 0 ? "filled" : "outlined"} />
        ),
    },
    {
        field: "chargeActuelle",
        headerName: "Charge actuelle",
        width: 160,
        renderCell: (params) => {
            const valeur = Number(params.value);
            const pourcentage = Math.min(100, valeur * 20);
            return (
                <Box sx={{ width: "100%" }}>
                    <Typography variant="caption">{valeur} en attente</Typography>
                    <LinearProgress
                        variant="determinate"
                        value={pourcentage}
                        sx={{ height: 5, borderRadius: 3, mt: 0.3 }}
                        color={valeur >= 3 ? "error" : valeur >= 1 ? "warning" : "success"}
                    />
                </Box>
            );
        },
    },
];

const SupervisionMedecinsTable: React.FC<Props> = ({ medecins, loading }) => {
    return (
        <Paper sx={{ p: 2.5, borderRadius: 4, mb: 3 }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <LocalHospitalRounded color="primary" />
                <Typography variant="h6" fontWeight={800}>Supervision des médecins</Typography>
            </Stack>
            <Box sx={{ height: 380, width: "100%" }}>
                <DataGrid
                    rows={medecins}
                    columns={columns}
                    loading={loading}
                    getRowId={(row) => row.nom}
                    disableRowSelectionOnClick
                    density="comfortable"
                    hideFooter={medecins.length <= 10}
                />
            </Box>
        </Paper>
    );
};

export default SupervisionMedecinsTable;
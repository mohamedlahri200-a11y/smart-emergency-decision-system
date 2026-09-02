// src/components/dashboard/chef-service/SupervisionInfirmiersTable.tsx
import React from "react";
import { Paper, Typography, Box, Stack, Chip } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { MonitorHeartRounded } from "@mui/icons-material";
import type { SupervisionInfirmier } from "../../../services/chefServiceService";

interface Props {
    infirmiers: SupervisionInfirmier[];
    loading?: boolean;
}

const columns: GridColDef<SupervisionInfirmier>[] = [
    { field: "nom", headerName: "Infirmier d'accueil", flex: 1, minWidth: 180 },
    { field: "nbPatientsTries", headerName: "Patients triés", width: 150 },
    {
        field: "tempsMoyenTriageMinutes",
        headerName: "Temps moyen de triage",
        width: 190,
        valueGetter: (_v, row) => row.tempsMoyenTriageMinutes !== null ? `${row.tempsMoyenTriageMinutes} min` : "—",
    },
    {
        field: "dossiersEnAttente",
        headerName: "Dossiers en attente (service)",
        width: 210,
        renderCell: (params) => (
            <Chip size="small" label={params.value} color={Number(params.value) > 5 ? "warning" : "default"} variant="outlined" />
        ),
    },
];

const SupervisionInfirmiersTable: React.FC<Props> = ({ infirmiers, loading }) => {
    return (
        <Paper sx={{ p: 2.5, borderRadius: 4, mb: 3 }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <MonitorHeartRounded color="primary" />
                <Typography variant="h6" fontWeight={800}>Supervision des infirmiers d'accueil</Typography>
            </Stack>
            <Box sx={{ height: 320, width: "100%" }}>
                <DataGrid
                    rows={infirmiers}
                    columns={columns}
                    loading={loading}
                    getRowId={(row) => row.nom}
                    disableRowSelectionOnClick
                    density="comfortable"
                    hideFooter={infirmiers.length <= 10}
                />
            </Box>
        </Paper>
    );
};

export default SupervisionInfirmiersTable;
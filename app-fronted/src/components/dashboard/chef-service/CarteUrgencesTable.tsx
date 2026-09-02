// src/components/dashboard/chef-service/CarteUrgencesTable.tsx
import React from "react";
import { Paper, Typography, Chip, Box, Stack } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { MapRounded } from "@mui/icons-material";
import type { LignePatientCarte } from "../../../services/chefServiceService";

interface Props {
    patients: LignePatientCarte[];
    loading?: boolean;
    onRowClick?: (patientId: number) => void;
}

const columns: GridColDef<LignePatientCarte>[] = [
    { field: "numeroDossier", headerName: "N° Dossier", width: 150 },
    { field: "nomComplet", headerName: "Patient", flex: 1, minWidth: 180 },
    { field: "heureArrivee", headerName: "Arrivée", width: 100 },
    {
        field: "prioriteLabel",
        headerName: "Priorité",
        width: 160,
        renderCell: (params) => {
            const row = params.row;
            const estCritique = row.priorite === "Rouge";
            return (
                <Chip
                    size="small"
                    label={row.prioriteLabel}
                    sx={{
                        backgroundColor: row.prioriteBg,
                        color: row.prioriteFg,
                        fontWeight: estCritique ? 800 : 700,
                        border: estCritique ? "1.5px solid #D32F2F" : "none",
                    }}
                />
            );
        },
    },
    { field: "medecinResponsable", headerName: "Médecin responsable", width: 200, valueGetter: (_v, row) => row.medecinResponsable ?? "Non assigné" },
    { field: "etat", headerName: "État actuel", width: 200 },
];

const CarteUrgencesTable: React.FC<Props> = ({ patients, loading, onRowClick }) => {
    const nbCritiques = patients.filter((p) => p.priorite === "Rouge").length;

    return (
        <Paper sx={{ p: 2.5, borderRadius: 4, mb: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <MapRounded color="primary" />
                    <Typography variant="h6" fontWeight={800}>Carte intelligente des urgences</Typography>
                </Stack>
                {nbCritiques > 0 && (
                    <Chip
                        size="small"
                        color="error"
                        label={`${nbCritiques} patient${nbCritiques > 1 ? "s" : ""} critique${nbCritiques > 1 ? "s" : ""}`}
                        sx={{ fontWeight: 800 }}
                    />
                )}
            </Stack>
            <Box sx={{ height: 480, width: "100%" }}>
                <DataGrid
                    rows={patients}
                    columns={columns}
                    loading={loading}
                    disableRowSelectionOnClick
                    density="comfortable"
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    onRowClick={onRowClick ? (params) => onRowClick(params.row.id as number) : undefined}
                    sx={onRowClick ? { "& .MuiDataGrid-row": { cursor: "pointer" } } : undefined}
                    getRowClassName={(params) => (params.row.priorite === "Rouge" ? "ligne-critique" : "")}
                />
            </Box>
            <style>{`
                .ligne-critique { background-color: #FFF5F5 !important; }
            `}</style>
        </Paper>
    );
};

export default CarteUrgencesTable;
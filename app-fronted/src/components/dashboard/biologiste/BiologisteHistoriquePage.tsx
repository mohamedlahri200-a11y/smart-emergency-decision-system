// src/components/dashboard/biologiste/BiologisteHistoriquePage.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Box, Paper, Chip } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import ExamenDetailDialog from "../shared/ExamenDetailDialog";
import { examenService, type ExamenResponseDTO } from "../../../services/examenService";

const columns: GridColDef<ExamenResponseDTO>[] = [
    {
        field: "dateResultat",
        headerName: "Résultat le",
        width: 170,
        valueGetter: (_value, row) => (row.dateResultat ? new Date(row.dateResultat).toLocaleString("fr-FR") : "—"),
    },
    { field: "patientNomComplet", headerName: "Patient", flex: 1, minWidth: 180 },
    { field: "typeExamen", headerName: "Type d'analyse", width: 190 },
    { field: "medecinPrescripteurNomComplet", headerName: "Prescripteur", width: 180 },
    {
        field: "statutExamen",
        headerName: "Statut",
        width: 130,
        renderCell: (params) => (
            <Chip
                size="small"
                label={params.value === "TERMINE" ? "Validé" : "Annulé"}
                color={params.value === "TERMINE" ? "success" : "error"}
                sx={{ fontWeight: 700 }}
            />
        ),
    },
];

const BiologisteHistoriquePage: React.FC = () => {
    const [examens, setExamens] = useState<ExamenResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedExamenId, setSelectedExamenId] = useState<number | null>(null);

    const fetchHistorique = useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            const data = await examenService.getAll("BIOLOGIE");
            const traites = data
                .filter((e) => e.statutExamen === "TERMINE" || e.statutExamen === "ANNULE")
                .sort((a, b) => new Date(b.datePrescription).getTime() - new Date(a.datePrescription).getTime());
            setExamens(traites);
        } catch {
            setExamens([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchHistorique();
    }, [fetchHistorique]);

    return (
        <DashboardLayout title="Historique" subtitle="Analyses biologiques déjà validées">
            <Paper sx={{ p: 2.5, borderRadius: 4 }}>
                <Box sx={{ height: 560, width: "100%" }}>
                    <DataGrid
                        rows={examens}
                        columns={columns}
                        loading={loading}
                        disableRowSelectionOnClick
                        density="comfortable"
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        onRowClick={(params) => setSelectedExamenId(params.row.id as number)}
                        sx={{ "& .MuiDataGrid-row": { cursor: "pointer" } }}
                    />
                </Box>
            </Paper>

            <ExamenDetailDialog
                examenId={selectedExamenId}
                open={selectedExamenId !== null}
                onClose={() => setSelectedExamenId(null)}
                onUpdated={fetchHistorique}
            />
        </DashboardLayout>
    );
};

export default BiologisteHistoriquePage;
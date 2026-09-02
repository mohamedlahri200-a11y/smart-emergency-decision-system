// src/components/dashboard/infirmier/InfirmierTriagePage.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Paper, Typography, Alert } from "@mui/material";
import { AddCircleRounded, MonitorHeartRounded } from "@mui/icons-material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import NewPatientWizard from "./wizard/NewPatientWizard";
import PatientDetailDialog from "../shared/PatientDetailDialog";

import { patientService, calculerAge, type PatientResponseDTO } from "../../../services/patientService";
import { triageService } from "../../../services/triageService";

const columns: GridColDef<PatientResponseDTO>[] = [
    { field: "numeroDossier", headerName: "N° Dossier", width: 160 },
    { field: "nomComplet", headerName: "Patient", flex: 1, minWidth: 200, valueGetter: (_value, row) => `${row.nom} ${row.prenom}` },
    { field: "age", headerName: "Âge", width: 90, valueGetter: (_value, row) => calculerAge(row.dateNaissance) },
    { field: "dateEnregistrement", headerName: "Enregistré le", width: 180, valueGetter: (_value, row) => new Date(row.dateEnregistrement).toLocaleString("fr-FR") },
];

const InfirmierTriagePage: React.FC = () => {
    const [enAttente, setEnAttente] = useState<PatientResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [wizardOpen, setWizardOpen] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [patients, triages] = await Promise.all([patientService.getAll(), triageService.getAll()]);
            const idsDejaTries = new Set(triages.map((t) => t.patientId));
            setEnAttente(patients.filter((p) => !idsDejaTries.has(p.id)));
        } catch {
            setEnAttente([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <DashboardLayout title="Triage" subtitle="Patients en attente d'évaluation">
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    {enAttente.length} patient{enAttente.length > 1 ? "s" : ""} en attente de triage
                </Typography>
                <Button variant="contained" startIcon={<AddCircleRounded />} onClick={() => setWizardOpen(true)}>
                    Nouveau patient
                </Button>
            </Box>

            {enAttente.length === 0 && !loading && (
                <Alert icon={<MonitorHeartRounded />} severity="success" sx={{ mb: 2, borderRadius: 3 }}>
                    Aucun patient en attente de triage pour le moment.
                </Alert>
            )}

            <Paper sx={{ p: 2.5, borderRadius: 4 }}>
                <Box sx={{ height: 520, width: "100%" }}>
                    <DataGrid
                        rows={enAttente}
                        columns={columns}
                        loading={loading}
                        disableRowSelectionOnClick
                        density="comfortable"
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        onRowClick={(params) => setSelectedPatientId(params.row.id as number)}
                        sx={{ "& .MuiDataGrid-row": { cursor: "pointer" } }}
                    />
                </Box>
            </Paper>

            <NewPatientWizard open={wizardOpen} onClose={() => setWizardOpen(false)} onSuccess={fetchData} />

            <PatientDetailDialog patientId={selectedPatientId} open={selectedPatientId !== null} onClose={() => setSelectedPatientId(null)} />
        </DashboardLayout>
    );
};

export default InfirmierTriagePage;
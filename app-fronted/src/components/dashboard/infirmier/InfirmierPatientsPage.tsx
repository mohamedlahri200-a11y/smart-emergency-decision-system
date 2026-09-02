// src/components/dashboard/infirmier/InfirmierPatientsPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Paper, TextField, InputAdornment, Button } from "@mui/material";
import { SearchRounded, AddCircleRounded } from "@mui/icons-material";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import PatientsTable from "./PatientsTable";
import NewPatientWizard from "./wizard/NewPatientWizard";
import PatientDetailDialog from "../shared/PatientDetailDialog";

import { patientService } from "../../../services/patientService";
import { triageService } from "../../../services/triageService";
import { decisionIAService, mapClasseToNiveau, mapClasseToCouleur } from "../../../services/decisionIAService";
import { trierParPriorite } from "../../../utils/prioriteSort";
import { StatutPatient, type PatientListItem } from "../../../types/infirmier.types";

const InfirmierPatientsPage: React.FC = () => {
    const [patients, setPatients] = useState<PatientListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [wizardOpen, setWizardOpen] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        try {
            const [patientsData, triagesData, decisionsData] = await Promise.all([
                patientService.getAll(),
                triageService.getAll(),
                decisionIAService.getAll(),
            ]);

            const triageByPatient = new Map(triagesData.map((t) => [t.patientId, t]));
            const decisionByPatient = new Map(decisionsData.map((d) => [d.patientId, d]));

            const mapped: PatientListItem[] = patientsData.map((p) => {
                const triage = triageByPatient.get(p.id);
                const decision = decisionByPatient.get(p.id);

                let statut: StatutPatient = StatutPatient.EN_ATTENTE_TRIAGE;
                if (decision?.statutValidation === "VALIDEE") {
                    statut = StatutPatient.PRIS_EN_CHARGE;
                } else if (triage) {
                    statut = StatutPatient.EN_ATTENTE_MEDECIN;
                }

                const niveauUrgence = decision ? mapClasseToNiveau(decision.classePredite) : null;
                const couleurTriage = decision ? mapClasseToCouleur(decision.classePredite) : null;

                return {
                    id: p.id,
                    numeroDossier: p.numeroDossier,
                    nomComplet: `${p.nom} ${p.prenom}`,
                    heureArrivee: new Date(p.dateEnregistrement).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    priorite: niveauUrgence,
                    couleurTriage,
                    statut,
                };
            });
            setPatients(trierParPriorite(mapped));
        } catch {
            setPatients([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return patients;
        return patients.filter(
            (p) =>
                p.nomComplet.toLowerCase().includes(term) ||
                p.numeroDossier.toLowerCase().includes(term)
        );
    }, [patients, search]);

    return (
        <DashboardLayout title="Patients" subtitle="Liste complète des patients enregistrés">
            <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} sx={{ mb: 2 }}>
                <TextField
                    size="small"
                    fullWidth
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
                <Button
                    variant="contained"
                    startIcon={<AddCircleRounded />}
                    onClick={() => setWizardOpen(true)}
                    sx={{ whiteSpace: "nowrap" }}
                >
                    Nouveau patient
                </Button>
            </Box>

            <Paper sx={{ borderRadius: 4 }}>
                <PatientsTable patients={filtered} loading={loading} onRowClick={setSelectedPatientId} />
            </Paper>

            <NewPatientWizard
                open={wizardOpen}
                onClose={() => setWizardOpen(false)}
                onSuccess={fetchPatients}
            />

            <PatientDetailDialog
                patientId={selectedPatientId}
                open={selectedPatientId !== null}
                onClose={() => setSelectedPatientId(null)}
            />
        </DashboardLayout>
    );
};

export default InfirmierPatientsPage;

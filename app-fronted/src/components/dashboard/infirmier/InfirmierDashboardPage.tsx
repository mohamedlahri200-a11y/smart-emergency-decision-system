// src/components/dashboard/infirmier/InfirmierDashboardPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import { Box, Button } from "@mui/material";
import { AddCircleRounded } from "@mui/icons-material";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import KpiCards from "../../../components/dashboard/infirmier/KpiCards";
import PatientsTable from "../../../components/dashboard/infirmier/PatientsTable";
import NewPatientWizard from "../../../components/dashboard/infirmier/wizard/NewPatientWizard";
import PatientDetailDialog from "../shared/PatientDetailDialog";
import CriticalAlertBanner from "./CriticalAlertBanner";

import { patientService } from "../../../services/patientService";
import { triageService } from "../../../services/triageService";
import { decisionIAService, mapClasseToNiveau, mapClasseToCouleur } from "../../../services/decisionIAService";
import { trierParPriorite } from "../../../utils/prioriteSort";
import {
    StatutPatient,
    type InfirmierDashboardStats,
    type PatientListItem,
} from "../../../types/infirmier.types";

const InfirmierDashboardPage: React.FC = () => {
    const [patients, setPatients] = useState<PatientListItem[]>([]);
    const [loading, setLoading] = useState(true);
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

    const stats: InfirmierDashboardStats = {
        totalAujourdHui: patients.length,
        enAttenteMedecin: patients.filter((p) => p.statut === StatutPatient.EN_ATTENTE_MEDECIN).length,
        prisEnCharge: patients.filter((p) => p.statut === StatutPatient.PRIS_EN_CHARGE).length,
        casCritiques: patients.filter((p) => p.couleurTriage === "ROUGE").length,
    };

    const casCritiquesEnAttente = patients.filter(
        (p) => p.couleurTriage === "ROUGE" && p.statut !== StatutPatient.PRIS_EN_CHARGE
    );

    return (
        <DashboardLayout title="Dashboard Infirmier d'Accueil" subtitle="Vue d'ensemble des admissions du jour">
            <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
                <Button variant="contained" startIcon={<AddCircleRounded />} size="large" onClick={() => setWizardOpen(true)}>
                    Nouveau patient
                </Button>
            </Box>

            <CriticalAlertBanner patients={casCritiquesEnAttente} onPatientClick={setSelectedPatientId} />

            <KpiCards stats={stats} />
            <PatientsTable patients={patients} loading={loading} onRowClick={setSelectedPatientId} />

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

export default InfirmierDashboardPage;
// src/components/dashboard/chef-service/ChefServiceDashboardPage.tsx
import React, { useCallback, useEffect, useState } from "react";
import Grid from "@mui/material/Grid2";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import ChefServiceKpiCards from "./ChefServiceKpiCards";
import ChefServicePrioriteChart from "./ChefServicePrioriteChart";
import CarteUrgencesTable from "./CarteUrgencesTable";
import SupervisionMedecinsTable from "./SupervisionMedecinsTable";
import SupervisionInfirmiersTable from "./SupervisionInfirmiersTable";
import AlertesIntelligentesPanel from "./AlertesIntelligentesPanel";
import PerformanceServicePanel from "./PerformanceServicePanel";
import AnalyseExamensTable from "./AnalyseExamensTable";
import PatientDetailDialog from "../shared/PatientDetailDialog";

import { patientService } from "../../../services/patientService";
import { decisionIAService } from "../../../services/decisionIAService";
import { sortieService } from "../../../services/sortieService";
import {
    chefServiceService,
    type LignePatientCarte,
    type SupervisionMedecin,
    type SupervisionInfirmier,
} from "../../../services/chefServiceService";
import type { ChefServiceStats, RepartitionPriorite } from "../../../types/chefService.types";

const PRIORITES: { key: string; label: string; couleur: string }[] = [
    { key: "Rouge", label: "Rouge", couleur: "#D32F2F" },
    { key: "Orange", label: "Orange", couleur: "#F2A93B" },
    { key: "Jaune", label: "Jaune", couleur: "#B7950B" },
    { key: "Vert", label: "Vert", couleur: "#2E7D32" },
    { key: "Bleu", label: "Bleu", couleur: "#1565C0" },
];

const ChefServiceDashboardPage: React.FC = () => {
    const [carteUrgences, setCarteUrgences] = useState<LignePatientCarte[]>([]);
    const [medecins, setMedecins] = useState<SupervisionMedecin[]>([]);
    const [infirmiers, setInfirmiers] = useState<SupervisionInfirmier[]>([]);
    const [repartition, setRepartition] = useState<RepartitionPriorite[]>(
        PRIORITES.map((p) => ({ priorite: p.key, label: p.label, total: 0, couleur: p.couleur }))
    );
    const [stats, setStats] = useState<ChefServiceStats>({
        totalPatients: 0,
        admissionsAujourdHui: 0,
        enAttenteConsultation: 0,
        hospitalises: 0,
        sortiesAujourdHui: 0,
        casCritiques: 0,
    });
    const [loading, setLoading] = useState(true);
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
    const [alertes, setAlertes] = useState<{ niveau: "critique" | "avertissement"; message: string }[]>([]);
    const [performance, setPerformance] = useState({
        tempsMoyenTriageMinutes: null as number | null,
        tempsMoyenAvantConsultationMinutes: null as number | null,
        tempsMoyenAvantResultatExamenMinutes: null as number | null,
        tempsMoyenAvantSortieMinutes: null as number | null,
    });
    const [analyseExamens, setAnalyseExamens] = useState<{ type: string; categorie: string; total: number }[]>([]);

    const fetchData = useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            const [
                patientsData,
                decisionsData,
                sortiesData,
                carteData,
                medecinsData,
                infirmiersData,
                alertesData,
                performanceData,
                analyseExamensData,
            ] = await Promise.all([
                patientService.getAll(),
                decisionIAService.getAll(),
                sortieService.getAll().catch(() => []),
                chefServiceService.getCarteUrgences(),
                chefServiceService.getSupervisionMedecins(),
                chefServiceService.getSupervisionInfirmiers(),
                chefServiceService.getAlertesIntelligentes(),
                chefServiceService.getPerformanceService(),
                chefServiceService.getAnalyseExamens(),
            ]);

            const today = new Date().toDateString();

            const admissionsAujourdHui = patientsData.filter(
                (p) => new Date(p.dateEnregistrement).toDateString() === today
            ).length;

            const sortiesAujourdHui = sortiesData.filter(
                (s) => new Date(s.dateSortie).toDateString() === today
            ).length;

            const hospitalises = decisionsData.filter(
                (d) =>
                    (d.statutValidation === "VALIDEE" || d.statutValidation === "MODIFIEE") &&
                    (d.recommandationService ?? "").toUpperCase().includes("HOSPIT")
            ).length;

            const casCritiques = decisionsData.filter(
                (d) => d.classePredite === "Rouge" && d.statutValidation !== "REJETEE"
            ).length;

            setStats({
                totalPatients: patientsData.length,
                admissionsAujourdHui,
                enAttenteConsultation: decisionsData.filter((d) => d.statutValidation === "EN_ATTENTE").length,
                hospitalises,
                sortiesAujourdHui,
                casCritiques,
            });

            const compteurs = new Map<string, number>(PRIORITES.map((p) => [p.key, 0]));
            for (const d of decisionsData) {
                compteurs.set(d.classePredite, (compteurs.get(d.classePredite) ?? 0) + 1);
            }
            setRepartition(
                PRIORITES.map((p) => ({ priorite: p.key, label: p.label, total: compteurs.get(p.key) ?? 0, couleur: p.couleur }))
            );

            setCarteUrgences(carteData);
            setMedecins(medecinsData);
            setInfirmiers(infirmiersData);
            setAlertes(alertesData);
            setPerformance(performanceData);
            setAnalyseExamens(analyseExamensData);
        } catch {
            setCarteUrgences([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    return (
        <DashboardLayout title="Dashboard Chef de Service" subtitle="Supervision globale de l'activité des urgences">
            <ChefServiceKpiCards stats={stats} />

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12 }}>
                    <ChefServicePrioriteChart data={repartition} />
                </Grid>
            </Grid>

            <AlertesIntelligentesPanel alertes={alertes} />

            <PerformanceServicePanel {...performance} />

            <CarteUrgencesTable patients={carteUrgences} loading={loading} onRowClick={setSelectedPatientId} />

            <SupervisionMedecinsTable medecins={medecins} loading={loading} />

            <SupervisionInfirmiersTable infirmiers={infirmiers} loading={loading} />

            <AnalyseExamensTable examens={analyseExamens} />

            <PatientDetailDialog
                patientId={selectedPatientId}
                open={selectedPatientId !== null}
                onClose={() => setSelectedPatientId(null)}
            />
        </DashboardLayout>
    );
};

export default ChefServiceDashboardPage;
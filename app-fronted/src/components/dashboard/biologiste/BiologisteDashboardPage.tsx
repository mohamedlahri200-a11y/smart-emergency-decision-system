// src/components/dashboard/biologiste/BiologisteDashboardPage.tsx
import React, { useCallback, useEffect, useState } from "react";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import BiologisteKpiCards from "./BiologisteKpiCards";
import ExamensATraiterTable, { type ExamenAvecPriorite } from "../shared/ExamensATraiterTable";
import ExamenDetailDialog from "../shared/ExamenDetailDialog";

import { examenService } from "../../../services/examenService";
import { decisionIAService } from "../../../services/decisionIAService";
import type { ExamenDashboardStats } from "../../../types/examen.types";

const BiologisteDashboardPage: React.FC = () => {
    const [enAttente, setEnAttente] = useState<ExamenAvecPriorite[]>([]);
    const [stats, setStats] = useState<ExamenDashboardStats>({
        enAttente: 0,
        enCours: 0,
        terminesAujourdHui: 0,
        casPrioritaires: 0,
        tempsMoyenTraitementMinutes: null,
    });
    const [loading, setLoading] = useState(true);
    const [selectedExamenId, setSelectedExamenId] = useState<number | null>(null);

    const fetchData = useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            const [examens, decisions] = await Promise.all([
                examenService.getAll("BIOLOGIE"),
                decisionIAService.getAll(),
            ]);

            const derniereDecisionParPatient = new Map<number, string>();
            for (const d of [...decisions].sort((a, b) => new Date(a.dateDecision).getTime() - new Date(b.dateDecision).getTime())) {
                derniereDecisionParPatient.set(d.patientId, d.classePredite);
            }

            const enrichis: ExamenAvecPriorite[] = examens.map((e) => ({
                ...e,
                prioriteTriage: derniereDecisionParPatient.get(e.patientId) ?? null,
            }));

            const aTraiter = enrichis
                .filter((e) => e.statutExamen === "PRESCRIT" || e.statutExamen === "EN_COURS")
                .sort((a, b) => new Date(a.datePrescription).getTime() - new Date(b.datePrescription).getTime());

            const today = new Date().toDateString();
            const terminesAujourdHui = enrichis.filter(
                (e) => e.statutExamen === "TERMINE" && e.dateResultat && new Date(e.dateResultat).toDateString() === today
            );

            const tempsMoyenTraitementMinutes =
                terminesAujourdHui.length === 0
                    ? null
                    : Math.round(
                        terminesAujourdHui.reduce((sum, e) => {
                            const debut = new Date(e.datePrescription).getTime();
                            const fin = new Date(e.dateResultat as string).getTime();
                            return sum + (fin - debut) / 60000;
                        }, 0) / terminesAujourdHui.length
                    );

            setStats({
                enAttente: enrichis.filter((e) => e.statutExamen === "PRESCRIT").length,
                enCours: enrichis.filter((e) => e.statutExamen === "EN_COURS").length,
                terminesAujourdHui: terminesAujourdHui.length,
                casPrioritaires: aTraiter.filter((e) => e.prioriteTriage === "Rouge").length,
                tempsMoyenTraitementMinutes,
            });
            setEnAttente(aTraiter);
        } catch {
            setEnAttente([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    return (
        <DashboardLayout title="Dashboard Biologiste" subtitle="Demandes d'analyses transmises par les urgences">
            <BiologisteKpiCards stats={stats} />

            <ExamensATraiterTable
                examens={enAttente}
                loading={loading}
                onRowClick={setSelectedExamenId}
                title="Analyses à réaliser"
            />

            <ExamenDetailDialog
                examenId={selectedExamenId}
                open={selectedExamenId !== null}
                onClose={() => setSelectedExamenId(null)}
                onUpdated={fetchData}
            />
        </DashboardLayout>
    );
};

export default BiologisteDashboardPage;
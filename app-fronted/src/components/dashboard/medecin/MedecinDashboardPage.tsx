// src/components/dashboard/medecin/MedecinDashboardPage.tsx
import React, { useCallback, useEffect, useState } from "react";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import MedecinKpiCards from "./MedecinKpiCards";
import PatientsAConsulterTable from "./PatientsAConsulterTable";
import PatientDetailDialog from "../shared/PatientDetailDialog";

import { patientService, calculerAge } from "../../../services/patientService";
import { decisionIAService } from "../../../services/decisionIAService";
import { sortieService } from "../../../services/sortieService";
import type { MedecinDashboardStats, PatientAConsulter } from "../../../types/medecin.types";

const prioriteOrder: Record<string, number> = {
    Rouge: 0,
    Orange: 1,
    Jaune: 2,
    Vert: 3,
    Bleu: 4,
};

const MedecinDashboardPage: React.FC = () => {
    const [aConsulter, setAConsulter] = useState<PatientAConsulter[]>([]);
    const [stats, setStats] = useState<MedecinDashboardStats>({
        enAttenteConsultation: 0,
        prisEnCharge: 0,
        casCritiques: 0,
        necessitantHospitalisation: 0,
        sortiesAujourdHui: 0,
        tempsAttenteMoyenMinutes: null,
    });
    const [loading, setLoading] = useState(true);
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [patients, decisions, sorties] = await Promise.all([
                patientService.getAll(),
                decisionIAService.getAll(),
                sortieService.getAll().catch(() => []),
            ]);

            const patientById = new Map(patients.map((p) => [p.id, p]));

            const enAttente = decisions.filter((d) => d.statutValidation === "EN_ATTENTE");
            const traitees = decisions.filter((d) => d.statutValidation !== "EN_ATTENTE");

            const listeAConsulter: PatientAConsulter[] = enAttente
                .map((d) => {
                    const p = patientById.get(d.patientId);
                    if (!p) return null;
                    return {
                        id: p.id,
                        numeroDossier: p.numeroDossier,
                        nomComplet: `${p.nom} ${p.prenom}`,
                        age: calculerAge(p.dateNaissance),
                        sexe: p.sexe === "HOMME" ? "H" : "F",
                        heureArrivee: new Date(p.dateEnregistrement).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                        decisionId: d.id,
                        classePredite: d.classePredite,
                        scorePrediction: d.scorePrediction,
                        recommandationService: d.recommandationService,
                        dateDecision: d.dateDecision,
                    } satisfies PatientAConsulter;
                })
                .filter((x): x is PatientAConsulter => x !== null)
                .sort((a, b) => {
                    const diff = (prioriteOrder[a.classePredite] ?? 99) - (prioriteOrder[b.classePredite] ?? 99);
                    if (diff !== 0) return diff;
                    return new Date(a.dateDecision).getTime() - new Date(b.dateDecision).getTime();
                });

            const today = new Date().toDateString();
            const sortiesAujourdHui = sorties.filter((s) => new Date(s.dateSortie).toDateString() === today).length;

            const decisionsValideesAujourdHui = traitees.filter(
                (d) => d.dateValidation && new Date(d.dateValidation).toDateString() === today
            );
            const tempsAttenteMoyenMinutes =
                decisionsValideesAujourdHui.length === 0
                    ? null
                    : Math.round(
                          decisionsValideesAujourdHui.reduce((sum, d) => {
                              const debut = new Date(d.dateDecision).getTime();
                              const fin = new Date(d.dateValidation as string).getTime();
                              return sum + (fin - debut) / 60000;
                          }, 0) / decisionsValideesAujourdHui.length
                      );

            setStats({
                enAttenteConsultation: enAttente.length,
                prisEnCharge: traitees.filter((d) => d.statutValidation === "VALIDEE" || d.statutValidation === "MODIFIEE").length,
                casCritiques: enAttente.filter((d) => d.classePredite === "Rouge").length,
                necessitantHospitalisation: traitees.filter(
                    (d) => (d.recommandationService ?? "").toUpperCase().includes("HOSPIT")
                ).length,
                sortiesAujourdHui,
                tempsAttenteMoyenMinutes,
            });
            setAConsulter(listeAConsulter);
        } catch {
            setAConsulter([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <DashboardLayout title="Dashboard Médecin Urgentiste" subtitle="Patients transmis par le triage infirmier">
            <MedecinKpiCards stats={stats} />

            <PatientsAConsulterTable
                patients={aConsulter}
                loading={loading}
                onRowClick={setSelectedPatientId}
                title="Patients en attente de consultation"
            />

            <PatientDetailDialog
                patientId={selectedPatientId}
                open={selectedPatientId !== null}
                onClose={() => setSelectedPatientId(null)}
                canValidate
                onValidated={fetchData}
            />
        </DashboardLayout>
    );
};

export default MedecinDashboardPage;

// src/hooks/useDashboardAlerts.ts
import { useCallback, useEffect, useState } from "react";

import { patientService } from "../services/patientService";
import { triageService } from "../services/triageService";
import { decisionIAService } from "../services/decisionIAService";
import { examenService } from "../services/examenService";
import { getStoredUser } from "../utils/authUser";

export type SourceNotification = "Infirmier" | "Radiologue" | "Biologiste";

export interface DashboardAlert {
    id: string;
    patientId: number;
    patientNom: string;
    label: string;
    severity: "critical" | "warning" | "info";
    path: string;
    source: SourceNotification;
}

export function useDashboardAlerts(pollMs = 30000) {
    const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = useCallback(async (): Promise<void> => {
        try {
            const role = getStoredUser()?.role;
            const isMedecin = role === "MEDECIN";

            const [patients, triages, decisions] = await Promise.all([
                patientService.getAll(),
                triageService.getAll(),
                decisionIAService.getAll(),
            ]);

            const triageByPatient = new Map(triages.map((t) => [t.patientId, t]));
            const result: DashboardAlert[] = [];

            for (const d of decisions) {
                if (d.statutValidation !== "EN_ATTENTE") continue;
                const critique = d.classePredite === "Rouge";
                result.push({
                    id: `decision-${d.id}`,
                    patientId: d.patientId,
                    patientNom: d.patientNomComplet,
                    label: critique
                        ? `Cas critique (Rouge) en attente de validation — ${d.patientNomComplet}`
                        : `Décision IA en attente de validation — ${d.patientNomComplet}`,
                    severity: critique ? "critical" : "warning",
                    path: isMedecin ? "/dashboard/medecin/patients" : "/dashboard/infirmier/historique",
                    source: "Infirmier",
                });
            }

            if (isMedecin) {
                try {
                    const examens = await examenService.getAll();
                    for (const e of examens) {
                        if (e.statutExamen === "TERMINE" && e.compteRenduCritique) {
                            result.push({
                                id: `examen-${e.id}`,
                                patientId: e.patientId,
                                patientNom: e.patientNomComplet,
                                label: `Résultat critique (${e.typeExamen}) — ${e.patientNomComplet} : ${e.motsClesCritiquesDetectes.join(", ")}`,
                                severity: "critical",
                                path: "/dashboard/medecin/patients",
                                source: e.categorieExamen === "IMAGERIE" ? "Radiologue" : "Biologiste",
                            });
                        }
                    }
                } catch {
                    // Silencieux : les alertes d'examens sont un bonus, pas bloquant.
                }
            }

            if (!isMedecin) {
                for (const p of patients) {
                    if (!triageByPatient.has(p.id)) {
                        result.push({
                            id: `triage-${p.id}`,
                            patientId: p.id,
                            patientNom: `${p.nom} ${p.prenom}`,
                            label: `Triage non commencé — ${p.nom} ${p.prenom}`,
                            severity: "info",
                            path: "/dashboard/infirmier/triage",
                            source: "Infirmier",
                        });
                    }
                }
            }

            result.sort((a, b) => {
                const order = { critical: 0, warning: 1, info: 2 };
                return order[a.severity] - order[b.severity];
            });

            setAlerts(result);
        } catch {
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchAlerts();
        const interval = setInterval(() => {
            void fetchAlerts();
        }, pollMs);
        return () => clearInterval(interval);
    }, [fetchAlerts, pollMs]);

    return { alerts, loading, refresh: fetchAlerts };
}
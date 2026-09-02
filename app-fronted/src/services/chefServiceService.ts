// src/services/chefServiceService.ts
import { patientService } from "./patientService";
import { triageService } from "./triageService";
import { decisionIAService, type DecisionIAResponseDTO } from "./decisionIAService";
import { examenService } from "./examenService";
import { sortieService } from "./sortieService";
import { prioriteStyle } from "../components/dashboard/shared/PatientDetailDialog";

export interface LignePatientCarte {
    id: number;
    numeroDossier: string;
    nomComplet: string;
    priorite: string | null;
    prioriteLabel: string;
    prioriteBg: string;
    prioriteFg: string;
    medecinResponsable: string | null;
    heureArrivee: string;
    etat: string;
}

export interface SupervisionMedecin {
    nom: string;
    nbPatients: number;
    nbTermines: number;
    tempsMoyenConsultationMinutes: number | null;
    nbCasCritiquesTraites: number;
    chargeActuelle: number;
}

export interface SupervisionInfirmier {
    nom: string;
    nbPatientsTries: number;
    tempsMoyenTriageMinutes: number | null;
    dossiersEnAttente: number;
}

function calculerEtat(d: DecisionIAResponseDTO | undefined): string {
    if (!d) return "Triage en cours";
    if (d.statutValidation === "EN_ATTENTE") return "En attente médecin";
    if (d.statutValidation === "VALIDEE") return "Prise en charge validée";
    if (d.statutValidation === "MODIFIEE") return "Prise en charge (modifiée)";
    if (d.statutValidation === "REJETEE") return "Décision rejetée";
    return "—";
}

export const chefServiceService = {
    getCarteUrgences: async (): Promise<LignePatientCarte[]> => {
        const [patients, decisions] = await Promise.all([
            patientService.getAll(),
            decisionIAService.getAll(),
        ]);

        const derniereDecisionParPatient = new Map<number, DecisionIAResponseDTO>();
        for (const d of [...decisions].sort((a, b) => new Date(a.dateDecision).getTime() - new Date(b.dateDecision).getTime())) {
            derniereDecisionParPatient.set(d.patientId, d);
        }

        return patients
            .map((p) => {
                const decision = derniereDecisionParPatient.get(p.id);
                const prio = decision ? (prioriteStyle[decision.classePredite] ?? { bg: "#EEE", fg: "#555", label: decision.classePredite }) : null;
                return {
                    id: p.id,
                    numeroDossier: p.numeroDossier,
                    nomComplet: `${p.nom} ${p.prenom}`,
                    priorite: decision?.classePredite ?? null,
                    prioriteLabel: prio?.label ?? "Non trié",
                    prioriteBg: prio?.bg ?? "#EEE",
                    prioriteFg: prio?.fg ?? "#777",
                    medecinResponsable: decision?.medecinValidateurNomComplet ?? null,
                    heureArrivee: new Date(p.dateEnregistrement).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
                    etat: calculerEtat(decision),
                };
            })
            .sort((a, b) => {
                const ordre: Record<string, number> = { Rouge: 0, Orange: 1, Jaune: 2, Vert: 3, Bleu: 4 };
                return (ordre[a.priorite ?? ""] ?? 99) - (ordre[b.priorite ?? ""] ?? 99);
            });
    },

    getSupervisionMedecins: async (): Promise<SupervisionMedecin[]> => {
        const decisions = await decisionIAService.getAll();
        const parMedecin = new Map<string, DecisionIAResponseDTO[]>();

        for (const d of decisions) {
            if (!d.medecinValidateurNomComplet) continue;
            const liste = parMedecin.get(d.medecinValidateurNomComplet) ?? [];
            liste.push(d);
            parMedecin.set(d.medecinValidateurNomComplet, liste);
        }

        return Array.from(parMedecin.entries()).map(([nom, liste]) => {
            const termines = liste.filter((d) => d.statutValidation === "VALIDEE" || d.statutValidation === "MODIFIEE");
            const dureesMinutes = termines
                .filter((d) => d.dateValidation)
                .map((d) => (new Date(d.dateValidation as string).getTime() - new Date(d.dateDecision).getTime()) / 60000)
                .filter((min) => min >= 0 && min < 24 * 60);

            const enAttente = decisions.filter(
                (d) => d.medecinValidateurNomComplet === nom && d.statutValidation === "EN_ATTENTE"
            ).length;

            return {
                nom,
                nbPatients: liste.length,
                nbTermines: termines.length,
                tempsMoyenConsultationMinutes: dureesMinutes.length
                    ? Math.round(dureesMinutes.reduce((s, v) => s + v, 0) / dureesMinutes.length)
                    : null,
                nbCasCritiquesTraites: termines.filter((d) => d.classePredite === "Rouge").length,
                chargeActuelle: enAttente,
            };
        }).sort((a, b) => b.nbPatients - a.nbPatients);
    },

    getSupervisionInfirmiers: async (): Promise<SupervisionInfirmier[]> => {
        const [triages, patients] = await Promise.all([
            triageService.getAll(),
            patientService.getAll(),
        ]);

        const dateEnregistrementParPatient = new Map(patients.map((p) => [p.id, p.dateEnregistrement]));
        const parInfirmier = new Map<string, { count: number; durees: number[] }>();

        for (const t of triages) {
            const nom = t.infirmierNomComplet || "Infirmier non identifié";
            const entry = parInfirmier.get(nom) ?? { count: 0, durees: [] };
            entry.count += 1;

            const arrivee = dateEnregistrementParPatient.get(t.patientId);
            if (arrivee) {
                const dureeMinutes = (new Date(t.dateTriage).getTime() - new Date(arrivee).getTime()) / 60000;
                if (dureeMinutes >= 0 && dureeMinutes < 24 * 60) entry.durees.push(dureeMinutes);
            }
            parInfirmier.set(nom, entry);
        }

        const idsPatientsTries = new Set(triages.map((t) => t.patientId));
        const dossiersEnAttenteGlobal = patients.filter((p) => !idsPatientsTries.has(p.id)).length;

        return Array.from(parInfirmier.entries()).map(([nom, entry]) => ({
            nom,
            nbPatientsTries: entry.count,
            tempsMoyenTriageMinutes: entry.durees.length
                ? Math.round(entry.durees.reduce((s, v) => s + v, 0) / entry.durees.length)
                : null,
            dossiersEnAttente: dossiersEnAttenteGlobal,
        })).sort((a, b) => b.nbPatientsTries - a.nbPatientsTries);
    },

    getChargeExamens: async () => {
        const examens = await examenService.getAll();
        return {
            biologieEnAttente: examens.filter((e) => e.categorieExamen === "BIOLOGIE" && e.statutExamen !== "TERMINE" && e.statutExamen !== "ANNULE").length,
            imagerieEnAttente: examens.filter((e) => e.categorieExamen === "IMAGERIE" && e.statutExamen !== "TERMINE" && e.statutExamen !== "ANNULE").length,
        };
    },

    getPerformanceService: async () => {
        const [patients, triages, decisions, examens, sorties] = await Promise.all([
            patientService.getAll(),
            triageService.getAll(),
            decisionIAService.getAll(),
            examenService.getAll(),
            sortieService.getAll().catch(() => []),
        ]);

        const arriveeParPatient = new Map(patients.map((p) => [p.id, new Date(p.dateEnregistrement).getTime()]));
        const moyenne = (valeurs: number[]) => (valeurs.length ? Math.round(valeurs.reduce((s, v) => s + v, 0) / valeurs.length) : null);

        const dureesTriage = triages
            .map((t) => {
                const arrivee = arriveeParPatient.get(t.patientId);
                return arrivee ? (new Date(t.dateTriage).getTime() - arrivee) / 60000 : null;
            })
            .filter((v): v is number => v !== null && v >= 0 && v < 24 * 60);

        const dureesAvantConsultation = decisions
            .map((d) => {
                const arrivee = arriveeParPatient.get(d.patientId);
                return arrivee ? (new Date(d.dateDecision).getTime() - arrivee) / 60000 : null;
            })
            .filter((v): v is number => v !== null && v >= 0 && v < 24 * 60);

        const dureesAvantResultatExamen = examens
            .filter((e) => e.dateResultat)
            .map((e) => (new Date(e.dateResultat as string).getTime() - new Date(e.datePrescription).getTime()) / 60000)
            .filter((v) => v >= 0 && v < 24 * 60);

        const dureesAvantSortie = sorties
            .map((s) => {
                const arrivee = arriveeParPatient.get(s.patientId);
                return arrivee ? (new Date(s.dateSortie).getTime() - arrivee) / 60000 : null;
            })
            .filter((v): v is number => v !== null && v >= 0 && v < 7 * 24 * 60);

        return {
            tempsMoyenTriageMinutes: moyenne(dureesTriage),
            tempsMoyenAvantConsultationMinutes: moyenne(dureesAvantConsultation),
            tempsMoyenAvantResultatExamenMinutes: moyenne(dureesAvantResultatExamen),
            tempsMoyenAvantSortieMinutes: moyenne(dureesAvantSortie),
        };
    },

    getAnalyseExamens: async () => {
        const examens = await examenService.getAll();
        const compteur = new Map<string, { type: string; categorie: string; total: number }>();

        for (const e of examens) {
            const cle = e.typeExamen;
            const entry = compteur.get(cle) ?? { type: e.typeExamen, categorie: e.categorieExamen, total: 0 };
            entry.total += 1;
            compteur.set(cle, entry);
        }

        return Array.from(compteur.values()).sort((a, b) => b.total - a.total);
    },

    getAlertesIntelligentes: async () => {
        const [decisions, examens, patients, triages] = await Promise.all([
            decisionIAService.getAll(),
            examenService.getAll(),
            patientService.getAll(),
            triageService.getAll(),
        ]);

        const alertes: { niveau: "critique" | "avertissement"; message: string }[] = [];

        const casCritiquesEnAttente = decisions.filter((d) => d.classePredite === "Rouge" && d.statutValidation === "EN_ATTENTE").length;
        if (casCritiquesEnAttente >= 3) {
            alertes.push({ niveau: "critique", message: `${casCritiquesEnAttente} patients critiques (Rouge) en attente de prise en charge médicale simultanément.` });
        } else if (casCritiquesEnAttente >= 1) {
            alertes.push({ niveau: "avertissement", message: `${casCritiquesEnAttente} patient(s) critique(s) en attente de prise en charge.` });
        }

        const biologieEnAttente = examens.filter((e) => e.categorieExamen === "BIOLOGIE" && (e.statutExamen === "PRESCRIT" || e.statutExamen === "EN_COURS")).length;
        if (biologieEnAttente >= 8) {
            alertes.push({ niveau: "critique", message: `Saturation probable du laboratoire : ${biologieEnAttente} analyses en attente de traitement.` });
        } else if (biologieEnAttente >= 4) {
            alertes.push({ niveau: "avertissement", message: `${biologieEnAttente} analyses biologiques en attente au laboratoire.` });
        }

        const imagerieEnAttente = examens.filter((e) => e.categorieExamen === "IMAGERIE" && (e.statutExamen === "PRESCRIT" || e.statutExamen === "EN_COURS")).length;
        if (imagerieEnAttente >= 8) {
            alertes.push({ niveau: "critique", message: `Saturation probable de la radiologie : ${imagerieEnAttente} examens d'imagerie en attente.` });
        } else if (imagerieEnAttente >= 4) {
            alertes.push({ niveau: "avertissement", message: `${imagerieEnAttente} examens d'imagerie en attente.` });
        }

        const idsPatientsTries = new Set(triages.map((t) => t.patientId));
        const nonTries = patients.filter((p) => !idsPatientsTries.has(p.id)).length;
        if (nonTries >= 5) {
            alertes.push({ niveau: "critique", message: `${nonTries} patients arrivés n'ont pas encore été triés par l'infirmier d'accueil.` });
        } else if (nonTries >= 2) {
            alertes.push({ niveau: "avertissement", message: `${nonTries} patient(s) en attente de triage infirmier.` });
        }

        const enAttenteMedecin = decisions.filter((d) => d.statutValidation === "EN_ATTENTE").length;
        if (enAttenteMedecin >= 10) {
            alertes.push({ niveau: "avertissement", message: `${enAttenteMedecin} dossiers en attente de validation médicale — temps d'attente potentiellement long.` });
        }

        return alertes;
    },

    getDashboardIA: async () => {
        const decisions = await decisionIAService.getAll();
        const total = decisions.length;
        const validees = decisions.filter((d) => d.statutValidation === "VALIDEE").length;
        const modifiees = decisions.filter((d) => d.statutValidation === "MODIFIEE").length;
        const rejetees = decisions.filter((d) => d.statutValidation === "REJETEE").length;
        const enAttente = decisions.filter((d) => d.statutValidation === "EN_ATTENTE").length;
        const traitees = validees + modifiees + rejetees;

        const scoreConfianceMoyen = (() => {
            const scores = decisions.map((d) => d.scoreConfiance).filter((s): s is number => s !== null);
            return scores.length ? Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 100) : null;
        })();

        return {
            totalPredictions: total,
            tauxValidationPourcent: traitees > 0 ? Math.round((validees / traitees) * 100) : null,
            nbPredictionsCorrectes: validees,
            nbPredictionsModifiees: modifiees,
            nbPredictionsRejetees: rejetees,
            nbEnAttente: enAttente,
            scoreConfianceMoyenPourcent: scoreConfianceMoyen,
        };
    },

    getRecommandationsIA: async () => {
        const alertes = await chefServiceService.getAlertesIntelligentes();
        const recommandations: string[] = [];

        for (const a of alertes) {
            if (a.message.includes("critiques (Rouge) en attente")) {
                recommandations.push("Renforcer immédiatement l'équipe médicale en salle de déchocage.");
            }
            if (a.message.includes("laboratoire")) {
                recommandations.push("Renforcer le laboratoire (technicien supplémentaire ou priorisation des analyses urgentes).");
            }
            if (a.message.includes("radiologie")) {
                recommandations.push("Renforcer la radiologie ou prioriser les examens des patients à priorité élevée.");
            }
            if (a.message.includes("triés par l'infirmier")) {
                recommandations.push("Ajouter un infirmier d'accueil pour résorber le retard de triage.");
            }
            if (a.message.includes("validation médicale")) {
                recommandations.push("Ajouter un médecin urgentiste ou réorienter certains patients vers un autre circuit.");
            }
        }

        return Array.from(new Set(recommandations));
    },

    getAnalyseHospitalisations: async () => {
        const decisions = await decisionIAService.getAll();
        const hospitalisations = decisions.filter(
            (d) => (d.statutValidation === "VALIDEE" || d.statutValidation === "MODIFIEE") && d.recommandationService
        );

        const parService = new Map<string, number>();
        for (const d of hospitalisations) {
            const service = d.recommandationService as string;
            parService.set(service, (parService.get(service) ?? 0) + 1);
        }

        const dureesEstimees = hospitalisations
            .map((d) => d.dureeSejourEstimeeHeures)
            .filter((v): v is number => v !== null);

        return {
            nbHospitalisations: hospitalisations.length,
            servicesLesPlusUtilises: Array.from(parService.entries())
                .map(([service, total]) => ({ service, total }))
                .sort((a, b) => b.total - a.total),
            dureeSejourEstimeeMoyenneHeures: dureesEstimees.length
                ? Math.round(dureesEstimees.reduce((s, v) => s + v, 0) / dureesEstimees.length)
                : null,
        };
    },

    getIndicateursQualite: async () => {
        const decisions = await decisionIAService.getAll();

        const casCritiques = decisions.filter((d) => d.classePredite === "Rouge");
        const casCritiquesStabilises = casCritiques.filter(
            (d) => d.statutValidation === "VALIDEE" || d.statutValidation === "MODIFIEE"
        );

        const avecRisqueDeterioration = decisions.filter((d) => d.risqueDeterioration);
        const risqueEleveOuCritique = avecRisqueDeterioration.filter(
            (d) => d.risqueDeterioration === "Eleve" || d.risqueDeterioration === "Critique"
        );

        return {
            nbCasCritiquesTotal: casCritiques.length,
            nbCasCritiquesStabilises: casCritiquesStabilises.length,
            tauxStabilisationPourcent: casCritiques.length
                ? Math.round((casCritiquesStabilises.length / casCritiques.length) * 100)
                : null,
            tauxRisqueDeteriorationElevePourcent: avecRisqueDeterioration.length
                ? Math.round((risqueEleveOuCritique.length / avecRisqueDeterioration.length) * 100)
                : null,
        };
    },

    getAnalyseDeces: async () => {
        const [sorties, patients, decisions] = await Promise.all([
            sortieService.getAll().catch(() => []),
            patientService.getAll(),
            decisionIAService.getAll(),
        ]);

        const deces = sorties.filter((s) => s.typeSortie === "DECES");
        const arriveeParPatient = new Map(patients.map((p) => [p.id, new Date(p.dateEnregistrement).getTime()]));

        const heures = deces.map((d) => new Date(d.dateSortie).getHours());
        const compteurHeures = new Map<number, number>();
        for (const h of heures) compteurHeures.set(h, (compteurHeures.get(h) ?? 0) + 1);
        const heureLaPlusFrequente = Array.from(compteurHeures.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

        const dureesAvantDeces = deces
            .map((d) => {
                const arrivee = arriveeParPatient.get(d.patientId);
                return arrivee ? (new Date(d.dateSortie).getTime() - arrivee) / 3600000 : null;
            })
            .filter((v): v is number => v !== null && v >= 0);

        const decisionsParPatient = new Map<number, string[]>();
        for (const dec of decisions) {
            if (dec.facteursRisqueIdentifies?.length) {
                decisionsParPatient.set(dec.patientId, dec.facteursRisqueIdentifies);
            }
        }
        const compteurFacteurs = new Map<string, number>();
        for (const d of deces) {
            for (const f of decisionsParPatient.get(d.patientId) ?? []) {
                compteurFacteurs.set(f, (compteurFacteurs.get(f) ?? 0) + 1);
            }
        }

        return {
            nbDeces: deces.length,
            heureLaPlusFrequente,
            dureeMoyenneAvantDecesHeures: dureesAvantDeces.length
                ? Math.round(dureesAvantDeces.reduce((s, v) => s + v, 0) / dureesAvantDeces.length)
                : null,
            facteursRisqueFrequents: Array.from(compteurFacteurs.entries())
                .map(([facteur, total]) => ({ facteur, total }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 5),
        };
    },

    getCartographiePathologies: async () => {
        const [decisions, patients] = await Promise.all([
            decisionIAService.getAll(),
            patientService.getAll(),
        ]);

        const patientParId = new Map(patients.map((p) => [p.id, p]));
        const compteur = new Map<string, { total: number; hommes: number; femmes: number }>();

        for (const d of decisions) {
            if (!d.risqueClinique || d.risqueClinique.toLowerCase() === "aucun") continue;
            const patient = patientParId.get(d.patientId);
            const entry = compteur.get(d.risqueClinique) ?? { total: 0, hommes: 0, femmes: 0 };
            entry.total += 1;
            if (patient?.sexe === "HOMME") entry.hommes += 1;
            if (patient?.sexe === "FEMME") entry.femmes += 1;
            compteur.set(d.risqueClinique, entry);
        }

        return Array.from(compteur.entries())
            .map(([pathologie, v]) => ({ pathologie, ...v }))
            .sort((a, b) => b.total - a.total);
    },

    getPrevisionAffluence: async () => {
        const patients = await patientService.getAll();
        const arrivees = patients.map((p) => new Date(p.dateEnregistrement));

        const maintenant = new Date();
        const heureActuelle = maintenant.getHours();

        const arriveesTranche = arrivees.filter((d) => {
            const h = d.getHours();
            const memeJour = d.toDateString() !== maintenant.toDateString();
            return memeJour && ((h >= heureActuelle && h < heureActuelle + 2) || (heureActuelle + 2 > 24 && h < (heureActuelle + 2) % 24));
        });
        const nbJoursHistorique = new Set(arrivees.map((d) => d.toDateString())).size || 1;
        const estimationProchaines2h = Math.round(arriveesTranche.length / Math.max(1, nbJoursHistorique - 1));

        const arriveesAujourdHui = arrivees.filter((d) => d.toDateString() === maintenant.toDateString()).length;

        const NOMS_JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
        const totalParJourSemaine = new Map<number, number>();
        for (const d of arrivees) {
            const jour = d.getDay();
            totalParJourSemaine.set(jour, (totalParJourSemaine.get(jour) ?? 0) + 1);
        }
        const jourLePlusCharge = Array.from(totalParJourSemaine.entries()).sort((a, b) => b[1] - a[1])[0];

        const compteurParHeure = new Map<number, number>();
        for (const d of arrivees) {
            const h = d.getHours();
            compteurParHeure.set(h, (compteurParHeure.get(h) ?? 0) + 1);
        }
        const heuresCritiques = Array.from(compteurParHeure.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([h]) => h);

        return {
            estimationProchaines2h,
            arriveesAujourdHui,
            estimationDemain: Math.round(arrivees.length / Math.max(1, nbJoursHistorique)),
            jourLePlusChargeLabel: jourLePlusCharge ? NOMS_JOURS[jourLePlusCharge[0]] : null,
            heuresCritiques: heuresCritiques.sort((a, b) => a - b),
        };
    },
};
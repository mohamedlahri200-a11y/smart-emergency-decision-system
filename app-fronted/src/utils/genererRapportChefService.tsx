// src/utils/genererRapportChefService.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type { ChefServiceStats } from "../types/chefService.types";
import type { SupervisionMedecin } from "../services/chefServiceService";

// TODO: adapter ces champs si vos objets réels (ChefServiceStats, DashboardIA,
// Performance, SupervisionMedecin) ont une forme différente de celle déduite
// de leur usage dans ChefServiceDashboardPage.tsx.
interface DashboardIA {
    totalPredictions: number;
    tauxValidationPourcent: number | null;
    nbPredictionsCorrectes: number;
    nbPredictionsModifiees: number;
    nbPredictionsRejetees: number;
    nbEnAttente: number;
    scoreConfianceMoyenPourcent: number | null;
}

interface Performance {
    tempsMoyenTriageMinutes: number | null;
    tempsMoyenAvantConsultationMinutes: number | null;
    tempsMoyenAvantResultatExamenMinutes: number | null;
    tempsMoyenAvantSortieMinutes: number | null;
}

interface Alerte {
    niveau: "critique" | "avertissement";
    message: string;
}

export interface GenererRapportChefServiceParams {
    periode: string;
    dateGeneration: string;
    stats: ChefServiceStats;
    dashboardIA: DashboardIA;
    performance: Performance;
    alertes: Alerte[];
    recommandations: string[];
    supervisionMedecins: SupervisionMedecin[];
}

const COULEUR_PRIMAIRE: [number, number, number] = [21, 101, 192]; // bleu
const COULEUR_CRITIQUE: [number, number, number] = [211, 47, 47]; // rouge
const COULEUR_TEXTE_SECONDAIRE: [number, number, number] = [100, 100, 100];

function formaterMinutes(valeur: number | null): string {
    if (valeur === null || Number.isNaN(valeur)) return "N/A";
    return `${Math.round(valeur)} min`;
}

function formaterPourcent(valeur: number | null): string {
    if (valeur === null || Number.isNaN(valeur)) return "N/A";
    return `${Math.round(valeur)}%`;
}

function ajouterEnTete(doc: jsPDF, periode: string, dateGeneration: string): number {
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(...COULEUR_PRIMAIRE);
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Rapport Chef de Service — Urgences", 14, 13);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${periode} · Généré le ${dateGeneration}`, 14, 21);

    doc.setTextColor(0, 0, 0);
    return 36;
}

function ajouterSectionTitre(doc: jsPDF, titre: string, y: number): number {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COULEUR_PRIMAIRE);
    doc.text(titre, 14, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    return y + 6;
}

function ajouterPiedDePage(doc: jsPDF): void {
    const nbPages = doc.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= nbPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...COULEUR_TEXTE_SECONDAIRE);
        doc.text(
            `Page ${i} / ${nbPages}`,
            pageWidth - 14,
            pageHeight - 8,
            { align: "right" }
        );
        doc.text(
            "Document confidentiel — usage interne uniquement",
            14,
            pageHeight - 8
        );
    }
}

export default function genererRapportChefService(
    params: GenererRapportChefServiceParams
): void {
    const {
        periode,
        dateGeneration,
        stats,
        dashboardIA,
        performance,
        alertes,
        recommandations,
        supervisionMedecins,
    } = params;

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    let y = ajouterEnTete(doc, periode, dateGeneration);

    // --- Statistiques générales ---
    y = ajouterSectionTitre(doc, "Statistiques générales", y);
    autoTable(doc, {
        startY: y,
        head: [["Indicateur", "Valeur"]],
        body: [
            ["Total patients", String(stats.totalPatients)],
            ["Admissions aujourd'hui", String(stats.admissionsAujourdHui)],
            ["En attente de consultation", String(stats.enAttenteConsultation)],
            ["Hospitalisés", String(stats.hospitalises)],
            ["Sorties aujourd'hui", String(stats.sortiesAujourdHui)],
            ["Cas critiques", String(stats.casCritiques)],
        ],
        theme: "striped",
        headStyles: { fillColor: COULEUR_PRIMAIRE },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // --- Performance du service ---
    y = ajouterSectionTitre(doc, "Performance du service", y);
    autoTable(doc, {
        startY: y,
        head: [["Étape", "Temps moyen"]],
        body: [
            ["Triage", formaterMinutes(performance.tempsMoyenTriageMinutes)],
            ["Avant consultation", formaterMinutes(performance.tempsMoyenAvantConsultationMinutes)],
            ["Avant résultat d'examen", formaterMinutes(performance.tempsMoyenAvantResultatExamenMinutes)],
            ["Avant sortie", formaterMinutes(performance.tempsMoyenAvantSortieMinutes)],
        ],
        theme: "striped",
        headStyles: { fillColor: COULEUR_PRIMAIRE },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // --- Dashboard IA ---
    if (y > 240) {
        doc.addPage();
        y = 16;
    }
    y = ajouterSectionTitre(doc, "Suivi des prédictions IA", y);
    autoTable(doc, {
        startY: y,
        head: [["Indicateur", "Valeur"]],
        body: [
            ["Total prédictions", String(dashboardIA.totalPredictions)],
            ["Taux de validation", formaterPourcent(dashboardIA.tauxValidationPourcent)],
            ["Prédictions correctes", String(dashboardIA.nbPredictionsCorrectes)],
            ["Prédictions modifiées", String(dashboardIA.nbPredictionsModifiees)],
            ["Prédictions rejetées", String(dashboardIA.nbPredictionsRejetees)],
            ["En attente", String(dashboardIA.nbEnAttente)],
            ["Score de confiance moyen", formaterPourcent(dashboardIA.scoreConfianceMoyenPourcent)],
        ],
        theme: "striped",
        headStyles: { fillColor: COULEUR_PRIMAIRE },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // --- Supervision médecins ---
    if (supervisionMedecins.length > 0) {
        if (y > 230) {
            doc.addPage();
            y = 16;
        }
        y = ajouterSectionTitre(doc, "Supervision des médecins", y);
        autoTable(doc, {
            startY: y,
            head: [["Médecin", "Détails"]],
            body: supervisionMedecins.map((m) => [
                (m as unknown as { nom?: string }).nom ?? "—",
                JSON.stringify(m),
            ]),
            theme: "striped",
            headStyles: { fillColor: COULEUR_PRIMAIRE },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
        });
        y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    }

    // --- Alertes ---
    if (alertes.length > 0) {
        if (y > 230) {
            doc.addPage();
            y = 16;
        }
        y = ajouterSectionTitre(doc, "Alertes intelligentes", y);
        doc.setFontSize(9);
        for (const alerte of alertes) {
            if (y > 280) {
                doc.addPage();
                y = 16;
            }
            const couleur = alerte.niveau === "critique" ? COULEUR_CRITIQUE : [242, 169, 59] as [number, number, number];
            doc.setTextColor(...couleur);
            const prefixe = alerte.niveau === "critique" ? "● Critique — " : "● Avertissement — ";
            const lignes = doc.splitTextToSize(prefixe + alerte.message, 180);
            doc.text(lignes, 14, y);
            y += lignes.length * 5 + 2;
        }
        doc.setTextColor(0, 0, 0);
        y += 6;
    }

    // --- Recommandations IA ---
    if (recommandations.length > 0) {
        if (y > 230) {
            doc.addPage();
            y = 16;
        }
        y = ajouterSectionTitre(doc, "Recommandations IA", y);
        doc.setFontSize(9);
        for (const recommandation of recommandations) {
            if (y > 280) {
                doc.addPage();
                y = 16;
            }
            const lignes = doc.splitTextToSize(`• ${recommandation}`, 180);
            doc.text(lignes, 14, y);
            y += lignes.length * 5 + 2;
        }
    }

    ajouterPiedDePage(doc);

    const nomFichier = `rapport-chef-service_${periode.toLowerCase().replace(/\s+/g, "-")}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
    doc.save(nomFichier);
}
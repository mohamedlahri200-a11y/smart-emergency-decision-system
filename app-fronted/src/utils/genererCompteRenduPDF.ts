// src/utils/genererCompteRenduPDF.ts
import { jsPDF } from "jspdf";
import type { ExamenResponseDTO } from "../services/examenService";
import type { PatientResponseDTO } from "../services/patientService";
import { calculerAge } from "../services/patientService";

const BLEU_CHU = "#0D47A1";
const GRIS_TEXTE = "#3A4550";
const GRIS_CLAIR = "#8A94A3";

/**
 * Génère et télécharge un PDF du compte-rendu d'un examen (biologie ou
 * imagerie), signé par le professionnel qui l'a rédigé. Format A4,
 * en-tête CHU Oujda, mise en page professionnelle.
 */
export function genererCompteRenduPDF(examen: ExamenResponseDTO, patient: PatientResponseDTO, redacteur: string) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const largeurPage = doc.internal.pageSize.getWidth();
    const margeGauche = 18;
    const margeDroite = largeurPage - 18;
    let y = 20;

    // --- En-tête ---
    doc.setFillColor(BLEU_CHU);
    doc.rect(0, 0, largeurPage, 28, "F");
    doc.setTextColor("#FFFFFF");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("CHU Oujda", margeGauche, 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Service des Urgences — SEDS", margeGauche, 19);
    doc.setFontSize(9);
    doc.text(
        examen.categorieExamen === "IMAGERIE" ? "Compte rendu d'imagerie médicale" : "Compte rendu biologique",
        margeDroite, 13, { align: "right" }
    );
    doc.text(`Réf. examen n°${examen.id}`, margeDroite, 19, { align: "right" });

    y = 38;

    // --- Informations patient ---
    doc.setTextColor(GRIS_TEXTE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Informations patient", margeGauche, y);
    doc.setDrawColor(220, 224, 230);
    doc.line(margeGauche, y + 2, margeDroite, y + 2);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const ligneInfo = (label: string, valeur: string, x: number) => {
        doc.setTextColor(GRIS_CLAIR);
        doc.text(label, x, y);
        doc.setTextColor(GRIS_TEXTE);
        doc.text(valeur, x, y + 5);
    };
    ligneInfo("Nom et prénom", `${patient.nom} ${patient.prenom}`, margeGauche);
    ligneInfo("N° Dossier", patient.numeroDossier, margeGauche + 90);
    y += 12;
    ligneInfo("Âge", `${calculerAge(patient.dateNaissance)} ans`, margeGauche);
    ligneInfo("Sexe", patient.sexe, margeGauche + 90);
    y += 14;

    // --- Détail examen ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(GRIS_TEXTE);
    doc.text("Examen demandé", margeGauche, y);
    doc.line(margeGauche, y + 2, margeDroite, y + 2);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    ligneInfo("Type d'examen", examen.typeExamen, margeGauche);
    ligneInfo("Prescrit par", examen.medecinPrescripteurNomComplet, margeGauche + 90);
    y += 12;
    ligneInfo("Date de prescription", new Date(examen.datePrescription).toLocaleString("fr-FR"), margeGauche);
    if (examen.dateResultat) {
        ligneInfo("Date du résultat", new Date(examen.dateResultat).toLocaleString("fr-FR"), margeGauche + 90);
    }
    y += 16;

    // --- Compte rendu ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Compte rendu", margeGauche, y);
    doc.line(margeGauche, y + 2, margeDroite, y + 2);
    y += 9;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(GRIS_TEXTE);
    const texteResultat = examen.resultat ?? "Compte rendu non disponible.";
    const lignes = doc.splitTextToSize(texteResultat, margeDroite - margeGauche);
    doc.text(lignes, margeGauche, y);
    y += lignes.length * 5 + 8;

    // --- Alerte critique éventuelle ---
    if (examen.compteRenduCritique && examen.motsClesCritiquesDetectes.length > 0) {
        doc.setFillColor("#FDEBEC");
        doc.setDrawColor("#D32F2F");
        const texteAlerte = `Mots-clés critiques détectés : ${examen.motsClesCritiquesDetectes.join(", ")}`;
        const lignesAlerte = doc.splitTextToSize(texteAlerte, margeDroite - margeGauche - 6);
        const hauteurBoite = lignesAlerte.length * 5 + 8;
        doc.rect(margeGauche, y, margeDroite - margeGauche, hauteurBoite, "FD");
        doc.setTextColor("#D32F2F");
        doc.setFont("helvetica", "bold");
        doc.text(lignesAlerte, margeGauche + 3, y + 6);
        y += hauteurBoite + 8;
        doc.setTextColor(GRIS_TEXTE);
        doc.setFont("helvetica", "normal");
    }

    // --- Signature ---
    y = Math.max(y + 10, 250);
    doc.setDrawColor(220, 224, 230);
    doc.line(margeGauche, y, margeGauche + 70, y);
    doc.setFontSize(9);
    doc.setTextColor(GRIS_CLAIR);
    doc.text("Rédigé et validé par", margeGauche, y + 5);
    doc.setTextColor(GRIS_TEXTE);
    doc.setFont("helvetica", "bold");
    doc.text(redacteur, margeGauche, y + 10);

    // --- Pied de page ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(GRIS_CLAIR);
    doc.text(
        `Document généré le ${new Date().toLocaleString("fr-FR")} — Plateforme intelligente d'aide à la décision, CHU Oujda`,
        margeGauche, 285
    );

    const nomFichier = `compte-rendu-${examen.categorieExamen.toLowerCase()}-${patient.nom.replace(/\s+/g, "_")}-${examen.id}.pdf`;
    doc.save(nomFichier);
}
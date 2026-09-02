// src/types/infirmier.types.ts

// ---------- Enums fiche de triage CHU ----------
export enum CouvertureMedicale {
    CNOPS = "CNOPS",
    CNSS = "CNSS",
    AMO = "AMO",
    AUTRE = "AUTRE",
}

export enum ModeArrivee {
    AMBULANCE = "AMBULANCE",
    MARCHE = "MARCHE",
    REFERE = "REFERE",
    SAMU = "SAMU",
    AUTRE = "AUTRE",
}

export enum AccompagnementPro {
    NON = "NON",
    MEDECIN = "MEDECIN",
    INFIRMIER = "INFIRMIER",
    AUTRE = "AUTRE",
}

export enum NiveauUrgence {
    NIVEAU_I = "NIVEAU_I",
    NIVEAU_II = "NIVEAU_II",
    NIVEAU_III = "NIVEAU_III",
}

export enum CouleurTriage {
    ROUGE = "ROUGE",
    ORANGE = "ORANGE",
    JAUNE = "JAUNE",
    VERT = "VERT",
    BLEU = "BLEU",
}

export enum StatutPatient {
    EN_ATTENTE_MEDECIN = "EN_ATTENTE_MEDECIN",
    PRIS_EN_CHARGE = "PRIS_EN_CHARGE",
    EN_ATTENTE_TRIAGE = "EN_ATTENTE_TRIAGE",
}

// ---------- Étape 1 : Administratif ----------
export interface AdministratifData {
    nom: string;
    prenom: string;
    dateNaissance: string; // ISO yyyy-MM-dd
    sexe: "HOMME" | "FEMME" | "";
    ip: string;
    telephone: string;
    personneAContacter: string;
    telephoneContact: string;
    origine: string;
    couvertureMedicale: CouvertureMedicale | "";
}

// ---------- Étape 2 : Arrivée ----------
export interface MiseEnConditionDetails {
    oxygenotherapie: boolean;
    perfusion: boolean;
    immobilisation: boolean;
    ventilation: boolean;
    autre: string;
}

export interface ArriveeData {
    modeArrivee: ModeArrivee | "";
    accompagnementPro: AccompagnementPro | "";
    miseEnCondition: boolean;
    miseEnConditionDetails: MiseEnConditionDetails;
    motifConsultation: string;
    descriptionEtat: string;
}

// ---------- Étape 3 : Évaluation générale ----------
export interface EvaluationGeneraleData {
    conscienceNormale: boolean | null;
    respirationNormale: boolean | null;
    circulationNormale: boolean | null;
    detresseVitale: boolean | null;
}

// ---------- Étape 4 : Signes vitaux ----------
export interface SignesVitauxData {
    poids: number | null;
    taille: number | null;
    frequenceRespiratoire: number | null;
    saturationO2: number | null;
    frequenceCardiaque: number | null;
    taSystolique: number | null;
    taDiastolique: number | null;
    temperature: number | null;
    dextro: number | null;
    eva: number | null;
    glasgow: number | null;
    ecg: string;
}

// ---------- Étape 5 : Résultat IA ----------
export interface OrientationIAResult {
    scorePrediction: number;
    niveauUrgence: NiveauUrgence;
    couleurTriage: CouleurTriage;
    explication: string;
    alertesActives: string[];
}

// ---------- Wizard global ----------
export interface NewPatientWizardData {
    administratif: AdministratifData;
    arrivee: ArriveeData;
    evaluationGenerale: EvaluationGeneraleData;
    signesVitaux: SignesVitauxData;
    orientationIA: OrientationIAResult | null;
    prioriteFinale: NiveauUrgence | "";
}

// ---------- Table / KPI dashboard ----------
export interface PatientListItem {
    id: number;
    numeroDossier: string;
    nomComplet: string;
    heureArrivee: string;
    priorite: NiveauUrgence | null;
    couleurTriage: CouleurTriage | null;
    statut: StatutPatient;
}

export interface InfirmierDashboardStats {
    totalAujourdHui: number;
    enAttenteMedecin: number;
    prisEnCharge: number;
    casCritiques: number;
}
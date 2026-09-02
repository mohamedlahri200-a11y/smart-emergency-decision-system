// src/components/dashboard/infirmier/wizard/wizardSchema.ts
import * as yup from "yup";
import type { NewPatientWizardData } from "../../../../types/infirmier.types";

export const defaultWizardValues: NewPatientWizardData = {
    administratif: {
        nom: "",
        prenom: "",
        dateNaissance: "",
        sexe: "",
        ip: "",
        telephone: "",
        personneAContacter: "",
        telephoneContact: "",
        origine: "",
        couvertureMedicale: "",
    },
    arrivee: {
        modeArrivee: "",
        accompagnementPro: "",
        miseEnCondition: false,
        miseEnConditionDetails: {
            oxygenotherapie: false,
            perfusion: false,
            immobilisation: false,
            ventilation: false,
            autre: "",
        },
        motifConsultation: "",
        descriptionEtat: "",
    },
    evaluationGenerale: {
        conscienceNormale: null,
        respirationNormale: null,
        circulationNormale: null,
        detresseVitale: null,
    },
    signesVitaux: {
        poids: null,
        taille: null,
        frequenceRespiratoire: null,
        saturationO2: null,
        frequenceCardiaque: null,
        taSystolique: null,
        taDiastolique: null,
        temperature: null,
        dextro: null,
        eva: null,
        glasgow: null,
        ecg: "",
    },
    orientationIA: null,
    prioriteFinale: "",
};

export const step1Schema = yup.object({
    nom: yup.string().required("Le nom est obligatoire"),
    prenom: yup.string().required("Le prénom est obligatoire"),
    dateNaissance: yup.string().required("La date de naissance est obligatoire"),
    sexe: yup.string().oneOf(["HOMME", "FEMME"], "Le sexe est obligatoire").required(),
    ip: yup.string().required("L'identifiant patient (IP) est obligatoire"),
    telephone: yup.string().required("Le numéro de téléphone est obligatoire"),
    personneAContacter: yup.string().required("Ce champ est obligatoire"),
    telephoneContact: yup.string().required("Ce champ est obligatoire"),
    origine: yup.string().required("L'origine du patient est obligatoire"),
    couvertureMedicale: yup.string().required("La couverture médicale est obligatoire"),
});

export const step2Schema = yup.object({
    modeArrivee: yup.string().required("Le mode d'arrivée est obligatoire"),
    accompagnementPro: yup.string().required("Ce champ est obligatoire"),
    motifConsultation: yup.string().required("Le motif de consultation est obligatoire"),
    descriptionEtat: yup.string().required("La description est obligatoire"),
});

export const step3Schema = yup.object({
    conscienceNormale: yup.boolean().nullable().required("Ce champ est obligatoire"),
    respirationNormale: yup.boolean().nullable().required("Ce champ est obligatoire"),
    circulationNormale: yup.boolean().nullable().required("Ce champ est obligatoire"),
    detresseVitale: yup.boolean().nullable().required("Ce champ est obligatoire"),
});

export const step4Schema = yup.object({
    poids: yup
        .number()
        .nullable()
        .required("Le poids est obligatoire")
        .min(1, "Le poids doit être compris entre 1 et 400 kg")
        .max(400, "Le poids doit être compris entre 1 et 400 kg"),
    taille: yup
        .number()
        .nullable()
        .required("La taille est obligatoire")
        .min(20, "La taille doit être comprise entre 20 et 250 cm")
        .max(250, "La taille doit être comprise entre 20 et 250 cm"),
    frequenceRespiratoire: yup
        .number()
        .nullable()
        .required("Champ obligatoire")
        .min(0, "La fréquence respiratoire doit être comprise entre 0 et 60 cyc/min")
        .max(60, "La fréquence respiratoire doit être comprise entre 0 et 60 cyc/min"),
    saturationO2: yup
        .number()
        .nullable()
        .required("Champ obligatoire")
        .min(0, "La SpO₂ doit être comprise entre 0 et 100 %")
        .max(100, "La SpO₂ doit être comprise entre 0 et 100 %"),
    frequenceCardiaque: yup
        .number()
        .nullable()
        .required("Champ obligatoire")
        .min(20, "La fréquence cardiaque doit être comprise entre 20 et 250 bpm")
        .max(250, "La fréquence cardiaque doit être comprise entre 20 et 250 bpm"),
    taSystolique: yup
        .number()
        .nullable()
        .required("Champ obligatoire")
        .min(40, "La TA systolique doit être comprise entre 40 et 300 mmHg")
        .max(300, "La TA systolique doit être comprise entre 40 et 300 mmHg"),
    taDiastolique: yup
        .number()
        .nullable()
        .required("Champ obligatoire")
        .min(20, "La TA diastolique doit être comprise entre 20 et 200 mmHg")
        .max(200, "La TA diastolique doit être comprise entre 20 et 200 mmHg"),
    temperature: yup
        .number()
        .nullable()
        .required("Champ obligatoire")
        .min(25, "La température doit être comprise entre 25 et 45 °C")
        .max(45, "La température doit être comprise entre 25 et 45 °C"),
    dextro: yup
        .number()
        .nullable()
        .min(0.1, "Le dextro doit être compris entre 0.1 et 10 g/L")
        .max(10, "Le dextro doit être compris entre 0.1 et 10 g/L"),
    eva: yup
        .number()
        .nullable()
        .min(0, "L'EVA doit être comprise entre 0 et 10")
        .max(10, "L'EVA doit être comprise entre 0 et 10"),
    glasgow: yup
        .number()
        .nullable()
        .min(3, "Le score de Glasgow doit être compris entre 3 et 15")
        .max(15, "Le score de Glasgow doit être compris entre 3 et 15"),
});
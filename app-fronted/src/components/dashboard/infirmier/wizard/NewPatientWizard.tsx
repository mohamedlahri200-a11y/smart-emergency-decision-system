// src/components/dashboard/infirmier/wizard/NewPatientWizard.tsx
import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Button,
    Stepper,
    Step,
    StepLabel,
    IconButton,
    Snackbar,
    Alert,
    Box,
    Typography,
    Chip,
} from "@mui/material";
import { CloseRounded, SendRounded, CheckCircleRounded } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import * as yup from "yup";

import type { NewPatientWizardData } from "@/types/infirmier.types";
import { defaultWizardValues, step1Schema, step2Schema, step3Schema, step4Schema } from "./wizardSchema";

import Step1Administratif from "./steps/Step1Administratif";
import Step2Arrivee from "./steps/Step2Arrivee";
import Step3EvaluationGenerale from "./steps/Step3EvaluationGenerale";
import Step4SignesVitaux from "./steps/Step4SignesVitaux";
import Step5OrientationIA from "./steps/Step5OrientationIA";
import Step6Validation from "./steps/Step6Validation";

import { patientService, toPatientPayload } from "@/services/patientService";
import { triageService, toTriagePayload } from "@/services/triageService";

const steps = [
    "Administratif",
    "Arrivée",
    "Évaluation générale",
    "Signes vitaux",
    "Priorité IA",
    "Validation",
];

const ETAPE_ORIENTATION_IA = 4;

const stepSchemas = [step1Schema, step2Schema, step3Schema, step4Schema, null, null];
const stepFieldKeys: (keyof NewPatientWizardData)[] = [
    "administratif",
    "arrivee",
    "evaluationGenerale",
    "signesVitaux",
];

const couleurLabel: Record<string, { bg: string; fg: string; label: string }> = {
    ROUGE: { bg: "#FDEBEC", fg: "#D32F2F", label: "Rouge — Vital" },
    ORANGE: { bg: "#FEF2E4", fg: "#F2A93B", label: "Orange — Urgent" },
    JAUNE: { bg: "#FEFBE8", fg: "#B7950B", label: "Jaune — Modéré" },
    VERT: { bg: "#EAF7EE", fg: "#2E7D32", label: "Vert — Mineur" },
    BLEU: { bg: "#E8F0FE", fg: "#1565C0", label: "Bleu — Non urgent" },
};

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const NewPatientWizard: React.FC<Props> = ({ open, onClose, onSuccess }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [patientId, setPatientId] = useState<number | null>(null);
    const [triageId, setTriageId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [snack, setSnack] = useState<{ type: "error" | "success"; msg: string } | null>(null);
    const [transmissionConfirmee, setTransmissionConfirmee] = useState(false);

    const { control, handleSubmit, watch, setValue, trigger, setError, getValues, formState: { errors } } =
        useForm<NewPatientWizardData>({
            defaultValues: defaultWizardValues,
            mode: "onTouched",
        });

    const resetWizard = () => {
        setActiveStep(0);
        setPatientId(null);
        setTriageId(null);
        setTransmissionConfirmee(false);
    };

    const handleClose = () => {
        resetWizard();
        onClose();
    };

    const handleNext = async () => {
        const schema = stepSchemas[activeStep];
        if (schema) {
            const key = stepFieldKeys[activeStep];
            try {
                await schema.validate(getValues(key as never), { abortEarly: false });
            } catch (validationError) {
                if (validationError instanceof yup.ValidationError) {
                    validationError.inner.forEach((err) => {
                        if (err.path) {
                            setError(`${key}.${err.path}` as never, {
                                type: "manual",
                                message: err.message,
                            });
                        }
                    });
                    setSnack({
                        type: "error",
                        msg: "Merci de corriger les champs en rouge avant de continuer.",
                    });
                }
                await trigger(key as never);
                return;
            }
        }

        if (activeStep === ETAPE_ORIENTATION_IA && !getValues("orientationIA")) {
            setSnack({
                type: "error",
                msg: "Vous devez d'abord lancer l'analyse IA pour déterminer la priorité du patient avant de continuer.",
            });
            return;
        }

        if (activeStep === 3 && !triageId) {
            setSaving(true);
            try {
                let currentPatientId = patientId;
                if (!currentPatientId) {
                    const patient = await patientService.create(toPatientPayload(getValues("administratif")));
                    currentPatientId = patient.id;
                    setPatientId(patient.id);
                }

                const triagePayload = toTriagePayload(
                    currentPatientId,
                    Number(JSON.parse(localStorage.getItem("user") || "{}").id) || 1,
                    getValues("arrivee"),
                    getValues("evaluationGenerale"),
                    getValues("signesVitaux")
                );
                const triage = await triageService.create(triagePayload);
                setTriageId(triage.id);
            } catch (e) {
                let message = "Erreur lors de l'enregistrement du patient/triage.";
                if (isAxiosError(e) && e.response?.data) {
                    const data = e.response.data as { message?: string; details?: string[] };
                    if (data.details?.length) {
                        message = data.details.join(" — ");
                    } else if (data.message) {
                        message = data.message;
                    }
                }
                setSnack({ type: "error", msg: message });
                setSaving(false);
                return;
            }
            setSaving(false);
        }

        setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

    const handleFinalSubmit = handleSubmit(async () => {
        setTransmissionConfirmee(true);
        onSuccess();
    });

    const renderStep = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Step1Administratif
                        control={control as any}
                        errors={errors.administratif}
                        dateNaissance={watch("administratif.dateNaissance")}
                    />
                );
            case 1:
                return <Step2Arrivee control={control as any} errors={errors.arrivee} />;
            case 2:
                return <Step3EvaluationGenerale control={control as any} />;
            case 3:
                return <Step4SignesVitaux control={control as any} />;
            case 4:
                return (
                    <Step5OrientationIA
                        control={control}
                        setValue={setValue}
                        getWizardData={getValues}
                        triageId={triageId}
                    />
                );
            case 5:
                return <Step6Validation data={getValues()} />;
            default:
                return null;
        }
    };

    const data = getValues();
    const couleurFinale = data.orientationIA ? couleurLabel[data.orientationIA.couleurTriage] : null;

    return (
        <>
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                {transmissionConfirmee ? (
                    <Box sx={{ p: 5, textAlign: "center" }}>
                        <CheckCircleRounded sx={{ fontSize: 72, color: "#2E7D32", mb: 2 }} />
                        <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                            Fiche transmise avec succès
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Le dossier de <strong>{data.administratif.nom} {data.administratif.prenom}</strong> a été
                            enregistré et est immédiatement visible dans la file d'attente du médecin urgentiste.
                        </Typography>

                        {couleurFinale && (
                            <Chip
                                label={`Priorité déterminée par l'IA : ${couleurFinale.label}`}
                                sx={{
                                    backgroundColor: couleurFinale.bg,
                                    color: couleurFinale.fg,
                                    fontWeight: 800,
                                    fontSize: "0.95rem",
                                    px: 2,
                                    py: 2.5,
                                    mb: 4,
                                }}
                            />
                        )}

                        <Box>
                            <Button variant="contained" size="large" onClick={handleClose}>
                                Fermer
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <>
                        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800 }}>
                            Nouveau patient — Fiche de triage
                            <IconButton onClick={handleClose}>
                                <CloseRounded />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent dividers sx={{ backgroundColor: "#F9FBFD" }}>
                            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, mt: 1 }}>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>

                            {renderStep()}
                        </DialogContent>

                        <DialogActions sx={{ p: 2.5 }}>
                            <Button disabled={activeStep === 0 || saving} onClick={handleBack}>
                                Précédent
                            </Button>
                            {activeStep < steps.length - 1 ? (
                                <Button variant="contained" onClick={handleNext} disabled={saving}>
                                    {saving ? "Enregistrement..." : "Suivant"}
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="large"
                                    startIcon={<SendRounded />}
                                    onClick={handleFinalSubmit}
                                    sx={{ px: 3, fontWeight: 700 }}
                                >
                                    Enregistrer et transmettre au médecin
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack(null)}>
                {snack ? <Alert severity={snack.type}>{snack.msg}</Alert> : undefined}
            </Snackbar>
        </>
    );
};

export default NewPatientWizard;